package com.obubba.app.plugins;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.provider.CalendarContract;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Calendar;

@CapacitorPlugin(name = "OBCalendar")
public class CalendarPlugin extends Plugin {

    @PluginMethod
    public void addEvent(PluginCall call) {
        String title = call.getString("title", "OBubba appointment");
        String date = call.getString("date", "");
        String time = call.getString("time", "");
        String endDate = call.getString("endDate", date);
        String endTime = call.getString("endTime", "");
        String location = call.getString("location", "");
        String note = call.getString("note", "");
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

    private Calendar buildCalendar(String date, String time) {
        String[] d = date.split("-");
        String[] t = defaultTime(time, "09:00").split(":");
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, Integer.parseInt(d[0]));
        cal.set(Calendar.MONTH, Integer.parseInt(d[1]) - 1);
        cal.set(Calendar.DAY_OF_MONTH, Integer.parseInt(d[2]));
        cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(t[0]));
        cal.set(Calendar.MINUTE, Integer.parseInt(t[1]));
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal;
    }

    private String defaultDate(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    private String defaultTime(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }
}
