package com.obubba.app.plugins;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CalendarContract;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;
import java.util.Calendar;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin(
    name = "OBCalendar",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR }, alias = CalendarPlugin.CALENDAR)
    }
)
public class CalendarPlugin extends Plugin {
    public static final String CALENDAR = "calendar";
    private static final Pattern DATE_PATTERN = Pattern.compile("^(\\d{4})-(\\d{2})-(\\d{2})$");
    private static final Pattern TIME_PATTERN = Pattern.compile("^(\\d{1,2}):(\\d{2})$");

    @PluginMethod
    public void addEvent(PluginCall call) {
        Boolean directValue = call.getBoolean("direct", false);
        boolean direct = directValue != null && directValue;
        if (direct) {
            saveSingleEvent(call);
            return;
        }

        String title = safeText(call.getString("title", "OBubba appointment"), "OBubba appointment", 120);
        String date = call.getString("date", "");
        String time = call.getString("time", "");
        String endDate = call.getString("endDate", date);
        String endTime = call.getString("endTime", "");
        String location = safeText(call.getString("location", ""), "", 240);
        String note = safeText(call.getString("note", ""), "", 1200);
        Boolean allDayValue = call.getBoolean("allDay", false);
        boolean allDay = allDayValue != null && allDayValue;

        if (date == null || date.trim().isEmpty()) {
            call.reject("date is required");
            return;
        }

        try {
            Calendar start = buildCalendar(date, allDay ? "00:00" : defaultTime(time, "09:00"));
            Calendar end;

            if (allDay) {
                end = buildCalendar(defaultDate(endDate, date), "00:00");
                end.add(Calendar.DATE, 1);
            } else if (endTime != null && !endTime.trim().isEmpty()) {
                end = buildCalendar(defaultDate(endDate, date), endTime);
                if (!end.after(start)) {
                    end.add(Calendar.DATE, 1);
                }
            } else {
                end = (Calendar) start.clone();
                end.add(Calendar.HOUR_OF_DAY, 1);
            }

            Intent intent = new Intent(Intent.ACTION_INSERT)
                    .setData(CalendarContract.Events.CONTENT_URI)
                    .putExtra(CalendarContract.Events.TITLE, title)
                    .putExtra(CalendarContract.Events.ALL_DAY, allDay)
                    .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, start.getTimeInMillis())
                    .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, end.getTimeInMillis());

            if (location != null && !location.trim().isEmpty()) {
                intent.putExtra(CalendarContract.Events.EVENT_LOCATION, location.trim());
            }
            if (note != null && !note.trim().isEmpty()) {
                intent.putExtra(CalendarContract.Events.DESCRIPTION, note.trim());
            }

            Activity activity = getActivity();
            if (activity != null) {
                activity.startActivity(intent);
            } else {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }

            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (ActivityNotFoundException e) {
            call.reject("No calendar app found", e);
        } catch (Exception e) {
            call.reject("Could not open calendar: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void addEvents(PluginCall call) {
        saveEventArray(call);
    }

    private void saveSingleEvent(PluginCall call) {
        if (!hasCalendarPermission(call)) return;
        try {
            long calendarId = getWritableCalendarId();
            JSObject event = new JSObject();
            event.put("title", safeText(call.getString("title", "OBubba appointment"), "OBubba appointment", 120));
            event.put("date", call.getString("date", ""));
            event.put("time", call.getString("time", ""));
            event.put("endDate", call.getString("endDate", call.getString("date", "")));
            event.put("endTime", call.getString("endTime", ""));
            event.put("allDay", call.getBoolean("allDay", false));
            event.put("location", safeText(call.getString("location", ""), "", 240));
            event.put("note", safeText(call.getString("note", ""), "", 1200));
            event.put("alarm", safeAlarm(call.getInt("alarm", 0)));
            long id = insertEvent(event, calendarId);
            JSObject ret = new JSObject();
            ret.put("saved", 1);
            ret.put("eventId", id);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not save calendar event: " + e.getMessage(), e);
        }
    }

    private void saveEventArray(PluginCall call) {
        if (!hasCalendarPermission(call)) return;
        JSArray events = call.getArray("events", new JSArray());
        if (events == null || events.length() == 0) {
            call.reject("events are required");
            return;
        }
        try {
            long calendarId = getWritableCalendarId();
            JSArray eventIds = new JSArray();
            int saved = 0;
            for (int i = 0; i < events.length(); i++) {
                JSONObject event = events.optJSONObject(i);
                if (event == null || optString(event, "date", "").trim().isEmpty()) continue;
                eventIds.put(insertEvent(event, calendarId));
                saved++;
            }
            JSObject ret = new JSObject();
            ret.put("saved", saved);
            ret.put("eventIds", eventIds);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not save calendar events: " + e.getMessage(), e);
        }
    }

    private boolean hasCalendarPermission(PluginCall call) {
        if (getPermissionState(CALENDAR) == PermissionState.GRANTED) return true;
        requestPermissionForAlias(CALENDAR, call, "calendarPermissionCallback");
        return false;
    }

    @PermissionCallback
    private void calendarPermissionCallback(PluginCall call) {
        if (getPermissionState(CALENDAR) != PermissionState.GRANTED) {
            call.reject("Calendar permission denied");
            return;
        }
        if (call.getArray("events") != null) saveEventArray(call);
        else saveSingleEvent(call);
    }

    private long getWritableCalendarId() throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        String[] projection = new String[] {
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.IS_PRIMARY,
            CalendarContract.Calendars.CALENDAR_DISPLAY_NAME
        };
        String selection = CalendarContract.Calendars.VISIBLE + " = 1"
            + " AND " + CalendarContract.Calendars.SYNC_EVENTS + " = 1"
            + " AND " + CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + " >= " + CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR;
        Cursor cursor = resolver.query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            selection,
            null,
            CalendarContract.Calendars.IS_PRIMARY + " DESC"
        );
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) return cursor.getLong(0);
            } finally {
                cursor.close();
            }
        }
        throw new Exception("No writable calendar found");
    }

    private long insertEvent(JSONObject event, long calendarId) throws Exception {
        String date = optString(event, "date", "");
        boolean allDay = event.optBoolean("allDay", false);
        Calendar start = buildCalendar(date, allDay ? "00:00" : defaultTime(optString(event, "time", ""), "09:00"));
        Calendar end;
        String endDate = optString(event, "endDate", date);
        String endTime = optString(event, "endTime", "");
        if (allDay) {
            end = buildCalendar(defaultDate(endDate, date), "00:00");
            end.add(Calendar.DATE, 1);
        } else if (endTime != null && !endTime.trim().isEmpty()) {
            end = buildCalendar(defaultDate(endDate, date), endTime);
            if (!end.after(start)) end.add(Calendar.DATE, 1);
        } else {
            end = (Calendar) start.clone();
            end.add(Calendar.HOUR_OF_DAY, 1);
        }

        ContentValues values = new ContentValues();
        values.put(CalendarContract.Events.CALENDAR_ID, calendarId);
        values.put(CalendarContract.Events.TITLE, safeText(optString(event, "title", "OBubba appointment"), "OBubba appointment", 120));
        values.put(CalendarContract.Events.DTSTART, start.getTimeInMillis());
        values.put(CalendarContract.Events.DTEND, end.getTimeInMillis());
        values.put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());
        values.put(CalendarContract.Events.ALL_DAY, allDay ? 1 : 0);
        String location = safeText(optString(event, "location", ""), "", 240);
        String note = safeText(optString(event, "note", ""), "", 1200);
        if (!location.trim().isEmpty()) values.put(CalendarContract.Events.EVENT_LOCATION, location.trim());
        if (!note.trim().isEmpty()) values.put(CalendarContract.Events.DESCRIPTION, note.trim());

        Uri uri = getContext().getContentResolver().insert(CalendarContract.Events.CONTENT_URI, values);
        if (uri == null) throw new Exception("Calendar insert failed");
        long eventId = Long.parseLong(uri.getLastPathSegment());

        int alarm = safeAlarm(event.optInt("alarm", 0));
        if (alarm > 0) {
            ContentValues reminder = new ContentValues();
            reminder.put(CalendarContract.Reminders.EVENT_ID, eventId);
            reminder.put(CalendarContract.Reminders.MINUTES, alarm);
            reminder.put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT);
            getContext().getContentResolver().insert(CalendarContract.Reminders.CONTENT_URI, reminder);
        }
        return eventId;
    }

    private Calendar buildCalendar(String date, String time) throws Exception {
        int[] d = parseDateParts(date);
        int[] t = parseTimeParts(defaultTime(time, "09:00"));
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, d[0]);
        cal.set(Calendar.MONTH, d[1] - 1);
        cal.set(Calendar.DAY_OF_MONTH, d[2]);
        cal.set(Calendar.HOUR_OF_DAY, t[0]);
        cal.set(Calendar.MINUTE, t[1]);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal;
    }

    private int[] parseDateParts(String date) throws Exception {
        Matcher m = DATE_PATTERN.matcher(date == null ? "" : date.trim());
        if (!m.matches()) throw new Exception("Invalid date");
        int year = Integer.parseInt(m.group(1));
        int month = Integer.parseInt(m.group(2));
        int day = Integer.parseInt(m.group(3));
        if (month < 1 || month > 12 || day < 1 || day > 31) throw new Exception("Invalid date");
        return new int[] { year, month, day };
    }

    private int[] parseTimeParts(String time) {
        Matcher m = TIME_PATTERN.matcher(time == null ? "" : time.trim());
        if (!m.matches()) return new int[] { 9, 0 };
        int hour = Integer.parseInt(m.group(1));
        int minute = Integer.parseInt(m.group(2));
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return new int[] { 9, 0 };
        return new int[] { hour, minute };
    }

    private String defaultDate(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    private String defaultTime(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    private String optString(JSONObject obj, String key, String fallback) {
        String value = obj.optString(key, fallback);
        return value == null ? fallback : value;
    }

    private String safeText(String value, String fallback, int maxLen) {
        String text = value == null ? fallback : value;
        text = text.replaceAll("[\\r\\n<>]+", " ").replaceAll("\\s+", " ").trim();
        if (text.isEmpty()) text = fallback;
        return text.length() > maxLen ? text.substring(0, maxLen) : text;
    }

    private int safeAlarm(Integer value) {
        if (value == null || value < 0) return 0;
        return Math.min(value, 10080);
    }
}
