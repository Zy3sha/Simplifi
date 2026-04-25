package com.obubba.app.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;
import com.obubba.app.R;
import com.obubba.app.MainActivity;
import org.json.JSONObject;

public class OBubbaSummaryWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateWidgets(context, appWidgetManager, appWidgetIds);
    }

    private static PendingIntent makeIntent(Context context, String action, int code) {
        Intent i = new Intent(context, MainActivity.class);
        i.setAction(Intent.ACTION_VIEW);
        i.setData(Uri.parse("obubba://w/" + action + "/" + code));
        i.putExtra("action", action);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, code, i,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static void updateWidgets(Context context, AppWidgetManager mgr, int[] ids) {
        SharedPreferences prefs = context.getSharedPreferences("obubba_widget_data", Context.MODE_PRIVATE);
        String json = prefs.getString("widgetData", null);
        String widgetTheme = prefs.getString("widgetTheme", "auto");

        for (int id : ids) {
            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_summary);

            // Apply user-chosen widget colour theme
            // All theming is done in Java — no drawable-night folder
            // so the user's chosen colour always wins
            try {
                int bgRes = R.drawable.widget_bg_gradient; // default light
                boolean isDarkTheme = false;

                // "auto" checks time: dark between 7pm-6am
                if ("auto".equals(widgetTheme)) {
                    int hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY);
                    if (hour >= 19 || hour < 6) {
                        bgRes = R.drawable.widget_bg_dark;
                        isDarkTheme = true;
                    }
                } else {
                    switch (widgetTheme) {
                        case "rose": bgRes = R.drawable.widget_bg_rose; break;
                        case "lavender": bgRes = R.drawable.widget_bg_lavender; break;
                        case "mint": bgRes = R.drawable.widget_bg_mint; break;
                        case "sky": bgRes = R.drawable.widget_bg_sky; break;
                        case "dark": bgRes = R.drawable.widget_bg_dark; isDarkTheme = true; break;
                    }
                }
                v.setInt(R.id.widget_root, "setBackgroundResource", bgRes);
                // Dark theme needs white text
                if (isDarkTheme) {
                    int white = 0xFFFFFFFF;
                    int secondary = 0xFFD0C8D0;
                    // All text must be white/light on dark background
                    v.setTextColor(R.id.tv_baby_name, white);
                    v.setTextColor(R.id.tv_timer_dot, white);
                    v.setTextColor(R.id.tv_timer_label, secondary);
                    v.setTextColor(R.id.timer_chrono, white);
                    v.setTextColor(R.id.tv_prediction, secondary);
                    v.setTextColor(R.id.tv_since, 0x90FFFFFF);
                    v.setTextColor(R.id.tv_feed_label, white);
                    v.setTextColor(R.id.tv_ns_label, white);
                    v.setTextColor(R.id.tv_ns_icon, white);
                    // Breast row (if visible)
                    v.setTextColor(R.id.tv_bl_icon, white);
                    v.setTextColor(R.id.tv_bl_label, secondary);
                    v.setTextColor(R.id.tv_br_icon, white);
                    v.setTextColor(R.id.tv_br_label, secondary);
                }
            } catch (Exception e) { /* ignore theme errors */ }

            // Whole widget opens app
            Intent open = new Intent(context, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(context, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Always wire nappy
            v.setOnClickPendingIntent(R.id.btn_nappy, makeIntent(context, "quick_nappy", 3));
            // Always wire feed
            v.setOnClickPendingIntent(R.id.btn_feed, makeIntent(context, "quick_feed", 1));

            if (json == null) {
                v.setTextViewText(R.id.tv_baby_name, "OBubba");
                v.setTextViewText(R.id.tv_prediction, "Open app");
                hide(v); defaults(v, context);
                mgr.updateAppWidget(id, v); continue;
            }

            try {
                JSONObject d = new JSONObject(json);
                String name = d.optString("babyName", "Baby");
                String pred = d.optString("nextPrediction", "");
                String timer = d.optString("activeTimer", "");
                String label = d.optString("timerLabel", "");
                String startT = d.optString("timerStartTime", "");
                boolean nursing = d.optBoolean("showNursing", false);
                String lastSide = d.optString("lastBreastSide", "");
                String side = d.optString("breastSide", "");
                long startMs = 0;
                try { if (!d.isNull("timerStartMs")) startMs = d.optLong("timerStartMs", 0); } catch (Exception x) {}

                v.setTextViewText(R.id.tv_baby_name, "\uD83E\uDDF8 " + name);

                boolean active = timer != null && !timer.isEmpty() && !timer.equals("null") && startMs > 1000000000000L;

                // ── Breast row: show for nursing mums ──
                if (nursing) {
                    v.setViewVisibility(R.id.breast_row, View.VISIBLE);
                    boolean nextL = "R".equals(side.isEmpty() ? lastSide : side);
                    v.setTextViewText(R.id.tv_bl_label, nextL ? "NEXT" : "");
                    v.setTextViewText(R.id.tv_br_label, !nextL ? "NEXT" : "");
                    v.setOnClickPendingIntent(R.id.btn_breast_l, makeIntent(context, "breast_left", 5));
                    v.setOnClickPendingIntent(R.id.btn_breast_r, makeIntent(context, "breast_right", 6));
                } else {
                    v.setViewVisibility(R.id.breast_row, View.GONE);
                }

                if (active) {
                    // Timer pill
                    v.setViewVisibility(R.id.tv_timer_dot, View.VISIBLE);
                    v.setTextViewText(R.id.tv_timer_dot, "\u25CF ");
                    v.setViewVisibility(R.id.timer_chrono, View.VISIBLE);
                    v.setViewVisibility(R.id.tv_prediction, View.GONE);
                    long elapsed = System.currentTimeMillis() - startMs;
                    v.setChronometer(R.id.timer_chrono, SystemClock.elapsedRealtime() - elapsed, null, true);
                    String lbl = (label != null && !label.isEmpty() && !label.equals("null")) ? label : "Timer";
                    v.setTextViewText(R.id.tv_timer_label, lbl + " ");

                    // Since time
                    if (startT != null && !startT.isEmpty() && !startT.equals("null")) {
                        v.setViewVisibility(R.id.tv_since, View.VISIBLE);
                        try {
                            String[] p = startT.split(":");
                            int h = Integer.parseInt(p[0]), m = Integer.parseInt(p[1]);
                            String ap = h >= 12 ? "pm" : "am";
                            int h12 = h == 0 ? 12 : h > 12 ? h - 12 : h;
                            v.setTextViewText(R.id.tv_since, "since " + h12 + ":" + String.format("%02d", m) + ap);
                        } catch (Exception e) { v.setTextViewText(R.id.tv_since, "since " + startT); }
                    } else {
                        v.setViewVisibility(R.id.tv_since, View.GONE);
                    }

                    // Nap/Stop → Stop
                    v.setTextViewText(R.id.tv_ns_icon, "\u25A0");
                    v.setTextViewText(R.id.tv_ns_label, "Stop");
                    v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_stop);
                    v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(context, "stop_timer", 4));

                } else {
                    // Prediction
                    v.setViewVisibility(R.id.tv_timer_dot, View.GONE);
                    v.setViewVisibility(R.id.timer_chrono, View.GONE);
                    v.setViewVisibility(R.id.tv_prediction, View.VISIBLE);
                    v.setViewVisibility(R.id.tv_since, View.GONE);
                    v.setTextViewText(R.id.tv_timer_label, "");

                    if (pred != null && !pred.isEmpty() && !pred.equals("null")) {
                        v.setTextViewText(R.id.tv_prediction, pred);
                    } else {
                        String feed = d.optString("lastFeedTime", "");
                        v.setTextViewText(R.id.tv_prediction, (feed != null && !feed.isEmpty() && !feed.equals("null")) ? "Fed " + feed : "");
                    }

                    // Nap button
                    v.setTextViewText(R.id.tv_ns_icon, "\u25B6");
                    v.setTextViewText(R.id.tv_ns_label, "Nap");
                    v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_nap);
                    v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(context, "toggle_nap", 4));
                }
            } catch (Exception e) {
                v.setTextViewText(R.id.tv_baby_name, "OBubba");
                v.setTextViewText(R.id.tv_prediction, "Open app");
                hide(v); defaults(v, context);
            }

            mgr.updateAppWidget(id, v);
        }
    }

    private static void hide(RemoteViews v) {
        v.setViewVisibility(R.id.timer_chrono, View.GONE);
        v.setViewVisibility(R.id.tv_timer_dot, View.GONE);
        v.setViewVisibility(R.id.tv_since, View.GONE);
        v.setViewVisibility(R.id.breast_row, View.GONE);
    }

    private static void defaults(RemoteViews v, Context ctx) {
        v.setTextViewText(R.id.tv_ns_icon, "\u25B6");
        v.setTextViewText(R.id.tv_ns_label, "Nap");
        v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_nap);
        v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(ctx, "toggle_nap", 4));
    }
}
