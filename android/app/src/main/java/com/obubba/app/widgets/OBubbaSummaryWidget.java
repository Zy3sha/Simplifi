package com.obubba.app.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
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
            boolean isDarkTheme = false;
            try {
                int bgRes = R.drawable.widget_bg_gradient; // default light

                // Auto follows the phone appearance; dark remains manually selectable too.
                if ("auto".equals(widgetTheme)) {
                    int nightMode = context.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
                    if (nightMode == Configuration.UI_MODE_NIGHT_YES) {
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
                    int secondary = 0xFFF1EAF2;
                    // All text must be white/light on dark background
                    v.setTextColor(R.id.tv_widget_kicker, secondary);
                    v.setTextColor(R.id.tv_baby_name, white);
                    v.setTextColor(R.id.tv_status_hint, 0xFFF0DDE6);
                    v.setTextColor(R.id.tv_timer_dot, white);
                    v.setTextColor(R.id.tv_timer_label, secondary);
                    v.setTextColor(R.id.timer_chrono, white);
                    v.setTextColor(R.id.tv_prediction, secondary);
                    v.setTextColor(R.id.tv_since, 0xE8FFFFFF);
                    v.setTextColor(R.id.tv_feed_label, white);
                    v.setTextColor(R.id.tv_nappy_label, white);
                    v.setTextColor(R.id.tv_ns_label, white);
                    v.setTextColor(R.id.tv_ns_icon, white);
                    v.setInt(R.id.status_pill, "setBackgroundResource", R.drawable.widget_timer_pill_dark);
                    v.setInt(R.id.btn_feed, "setBackgroundResource", R.drawable.widget_btn_glass_dark);
                    v.setInt(R.id.btn_nappy, "setBackgroundResource", R.drawable.widget_btn_glass_dark);
                    v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_glass_dark);
                    // Breast row (if visible)
                    v.setTextColor(R.id.tv_bl_icon, white);
                    v.setTextColor(R.id.tv_bl_label, 0xFFFFFFFF);
                    v.setTextColor(R.id.tv_br_icon, white);
                    v.setTextColor(R.id.tv_br_label, 0xFFFFFFFF);
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
                v.setTextViewText(R.id.tv_widget_kicker, "OBUBBA");
                v.setTextViewText(R.id.tv_baby_name, "\uD83E\uDDF8 Open OBubba");
                v.setTextViewText(R.id.tv_status_hint, "Start");
                v.setTextViewText(R.id.tv_prediction, "Log a day");
                hide(v); defaults(v, context, isDarkTheme);
                mgr.updateAppWidget(id, v); continue;
            }

            try {
                JSONObject d = new JSONObject(json);
                String name = d.optString("babyName", "Baby");
                String pred = d.optString("nextPrediction", "");
                String predLabel = d.optString("nextPredictionLabel", "");
                boolean predictionUnlocked = d.optBoolean("nextPredictionUnlocked", false);
                String timer = d.optString("activeTimer", "");
                String label = d.optString("timerLabel", "");
                String startT = d.optString("timerStartTime", "");
                boolean nursing = d.optBoolean("showNursing", false);
                String lastSide = d.optString("lastBreastSide", "");
                String side = d.optString("breastSide", "");
                long startMs = 0;
                long predictionMs = 0;
                try { if (!d.isNull("timerStartMs")) startMs = d.optLong("timerStartMs", 0); } catch (Exception x) {}
                try { if (!d.isNull("nextPredictionMs")) predictionMs = d.optLong("nextPredictionMs", 0); } catch (Exception x) {}

                v.setTextViewText(R.id.tv_widget_kicker, "OBUBBA");
                v.setTextViewText(R.id.tv_baby_name, "\uD83E\uDDF8 " + name);

                boolean active = timer != null && !timer.isEmpty() && !timer.equals("null") && startMs > 1000000000000L;
                boolean hasPredictionCountdown = predictionUnlocked && predictionMs > System.currentTimeMillis() - 5 * 60 * 1000L;

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
                    v.setViewVisibility(R.id.tv_status_hint, View.GONE);
                    v.setViewVisibility(R.id.tv_timer_dot, View.GONE);
                    v.setTextViewText(R.id.tv_timer_dot, "\u25CF");
                    v.setViewVisibility(R.id.timer_chrono, View.VISIBLE);
                    v.setViewVisibility(R.id.tv_timer_label, View.GONE);
                    v.setViewVisibility(R.id.tv_prediction, View.GONE);
                    long elapsed = System.currentTimeMillis() - startMs;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        v.setChronometerCountDown(R.id.timer_chrono, false);
                    }
                    v.setChronometer(R.id.timer_chrono, SystemClock.elapsedRealtime() - elapsed, null, true);
                    String lbl = (label != null && !label.isEmpty() && !label.equals("null")) ? label : "Timer";
                    v.setTextViewText(R.id.tv_timer_label, lbl);

                    // Since time
                    if (startT != null && !startT.isEmpty() && !startT.equals("null")) {
                        String sinceLabel = formatClockLabel(startT);
                        if (!sinceLabel.isEmpty()) {
                            v.setViewVisibility(R.id.tv_since, View.VISIBLE);
                            v.setTextViewText(R.id.tv_since, "since " + sinceLabel);
                        } else {
                            v.setViewVisibility(R.id.tv_since, View.GONE);
                        }
                    } else {
                        v.setViewVisibility(R.id.tv_since, View.GONE);
                    }

                    boolean activeBedtime = timer != null && timer.equals("bed");
                    if (activeBedtime) {
                        v.setViewVisibility(R.id.iv_ns_icon, View.GONE);
                        v.setViewVisibility(R.id.tv_ns_icon, View.VISIBLE);
                        v.setTextViewText(R.id.tv_ns_icon, "\u2600");
                        v.setTextViewText(R.id.tv_ns_label, "Wake");
                        v.setTextColor(R.id.tv_ns_icon, 0xFFFFFFFF);
                        v.setTextColor(R.id.tv_ns_label, 0xFFFFFFFF);
                        v.setInt(R.id.btn_nap_stop, "setBackgroundResource", isDarkTheme ? R.drawable.widget_btn_wake_dark : R.drawable.widget_btn_wake);
                        v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(context, "quick_wake", 4));
                    } else {
                        // Nap/Feed active → Stop
                        v.setImageViewResource(R.id.iv_ns_icon, R.drawable.ic_stop_widget);
                        v.setViewVisibility(R.id.iv_ns_icon, View.VISIBLE);
                        v.setTextViewText(R.id.tv_ns_icon, "\u25A0");
                        v.setTextViewText(R.id.tv_ns_label, "Stop");
                        v.setTextColor(R.id.tv_ns_icon, 0xFFFFFFFF);
                        v.setTextColor(R.id.tv_ns_label, 0xFFFFFFFF);
                        v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_stop);
                        v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(context, "stop_timer", 4));
                    }

                } else {
                    // Prediction
                    v.setViewVisibility(R.id.tv_status_hint, View.VISIBLE);
                    v.setViewVisibility(R.id.tv_timer_dot, View.GONE);
                    v.setViewVisibility(R.id.tv_prediction, View.VISIBLE);
                    v.setViewVisibility(R.id.tv_since, View.GONE);

                    if (hasPredictionCountdown) {
                        long remaining = Math.max(0L, predictionMs - System.currentTimeMillis());
                        String lbl = cleanPredictionLabel(predLabel);
                        if (lbl.isEmpty()) lbl = cleanPredictionLabel(pred);

                        v.setTextViewText(R.id.tv_status_hint, "In");
                        v.setTextViewText(R.id.tv_timer_label, lbl.isEmpty() ? "Next" : lbl);
                        v.setViewVisibility(R.id.tv_timer_label, View.GONE);
                        v.setViewVisibility(R.id.timer_chrono, View.VISIBLE);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            v.setChronometerCountDown(R.id.timer_chrono, true);
                        }
                        v.setChronometer(R.id.timer_chrono, SystemClock.elapsedRealtime() + remaining, null, true);

                        String hint = predictionTimeHint(pred);
                        if (!hint.isEmpty()) {
                            v.setTextViewText(R.id.tv_prediction, hint);
                        } else {
                            v.setViewVisibility(R.id.tv_prediction, View.GONE);
                        }
                    } else if (pred != null && !pred.isEmpty() && !pred.equals("null")) {
                        v.setTextViewText(R.id.tv_status_hint, "Next");
                        v.setViewVisibility(R.id.timer_chrono, View.GONE);
                        v.setViewVisibility(R.id.tv_timer_label, View.VISIBLE);
                        v.setTextViewText(R.id.tv_timer_label, "");
                        v.setTextViewText(R.id.tv_prediction, cleanPrediction(pred));
                    } else {
                        v.setViewVisibility(R.id.timer_chrono, View.GONE);
                        v.setViewVisibility(R.id.tv_timer_label, View.VISIBLE);
                        v.setTextViewText(R.id.tv_timer_label, "");
                        String feed = d.optString("lastFeedTime", "");
                        if (feed != null && !feed.isEmpty() && !feed.equals("null")) {
                            v.setTextViewText(R.id.tv_status_hint, "Last");
                            v.setTextViewText(R.id.tv_prediction, "Feed " + feed);
                        } else {
                            v.setTextViewText(R.id.tv_status_hint, "Today");
                            v.setTextViewText(R.id.tv_prediction, "Ready");
                        }
                    }

                    // Nap button
                    v.setImageViewResource(R.id.iv_ns_icon, R.drawable.ic_sleep);
                    v.setViewVisibility(R.id.iv_ns_icon, View.VISIBLE);
                    v.setTextViewText(R.id.tv_ns_icon, "\u263E");
                    v.setTextViewText(R.id.tv_ns_label, "Nap");
                    v.setTextColor(R.id.tv_ns_icon, isDarkTheme ? 0xFFFFFFFF : 0xFF5E5394);
                    v.setTextColor(R.id.tv_ns_label, isDarkTheme ? 0xFFFFFFFF : 0xFF4D4352);
                    v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_nap);
                    v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(context, "toggle_nap", 4));
                }
            } catch (Exception e) {
                v.setTextViewText(R.id.tv_widget_kicker, "OBUBBA");
                v.setTextViewText(R.id.tv_baby_name, "\uD83E\uDDF8 Open OBubba");
                v.setTextViewText(R.id.tv_status_hint, "Start");
                v.setTextViewText(R.id.tv_prediction, "Log a day");
                hide(v); defaults(v, context, isDarkTheme);
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

    private static void defaults(RemoteViews v, Context ctx, boolean isDarkTheme) {
        v.setImageViewResource(R.id.iv_ns_icon, R.drawable.ic_sleep);
        v.setViewVisibility(R.id.iv_ns_icon, View.VISIBLE);
        v.setTextViewText(R.id.tv_ns_icon, "\u263E");
        v.setTextViewText(R.id.tv_ns_label, "Nap");
        v.setTextColor(R.id.tv_ns_icon, isDarkTheme ? 0xFFFFFFFF : 0xFF5E5394);
        v.setTextColor(R.id.tv_ns_label, isDarkTheme ? 0xFFFFFFFF : 0xFF4D4352);
        v.setInt(R.id.btn_nap_stop, "setBackgroundResource", R.drawable.widget_btn_nap);
        v.setOnClickPendingIntent(R.id.btn_nap_stop, makeIntent(ctx, "toggle_nap", 4));
    }

    private static String cleanPrediction(String prediction) {
        if (prediction == null) return "";
        String cleaned = prediction.replace("~", " · ").replaceAll("\\s+", " ").trim();
        return cleaned.length() > 28 ? cleaned.substring(0, 27) + "…" : cleaned;
    }

    private static String cleanPredictionLabel(String label) {
        if (label == null || label.equals("null")) return "";
        String cleaned = label.replace("~", " ").replaceAll("\\s+", " ").trim();
        return cleaned.length() > 12 ? cleaned.substring(0, 11) + "…" : cleaned;
    }

    private static String predictionTimeHint(String prediction) {
        if (prediction == null || prediction.isEmpty() || prediction.equals("null")) return "";
        int idx = prediction.lastIndexOf("~");
        String hint = idx >= 0 ? prediction.substring(idx + 1) : prediction;
        hint = hint.replaceAll("\\s+", " ").trim();
        if (hint.equals(prediction.trim())) return "";
        return hint.length() > 12 ? hint.substring(0, 11) + "…" : hint;
    }

    private static String formatClockLabel(String time) {
        if (time == null) return "";
        String raw = time.trim();
        int colon = raw.indexOf(":");
        if (colon <= 0 || colon != raw.lastIndexOf(":") || colon >= raw.length() - 1) return "";
        try {
            int h = Integer.parseInt(raw.substring(0, colon));
            int m = Integer.parseInt(raw.substring(colon + 1));
            if (h < 0 || h > 23 || m < 0 || m > 59) return "";
            String ap = h >= 12 ? "pm" : "am";
            int h12 = h == 0 ? 12 : h > 12 ? h - 12 : h;
            return h12 + ":" + String.format("%02d", m) + ap;
        } catch (Exception e) {
            return "";
        }
    }
}
