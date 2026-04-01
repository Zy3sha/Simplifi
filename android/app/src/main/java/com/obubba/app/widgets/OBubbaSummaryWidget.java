package com.obubba.app.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import com.obubba.app.R;
import com.obubba.app.MainActivity;
import org.json.JSONObject;

public class OBubbaSummaryWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateWidgets(context, appWidgetManager, appWidgetIds);
    }

    private static PendingIntent makeActionIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        // Unique data URI so Android doesn't collapse PendingIntents
        intent.setData(Uri.parse("obubba://widget/" + action));
        intent.putExtra("action", action);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static void updateWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences("obubba_widget_data", Context.MODE_PRIVATE);
        String jsonStr = prefs.getString("widgetData", null);

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_summary);

            // Open app on tap
            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Quick action buttons with unique URIs
            views.setOnClickPendingIntent(R.id.btn_log_feed, makeActionIntent(context, "quick_feed", 1));
            views.setOnClickPendingIntent(R.id.btn_log_nappy, makeActionIntent(context, "quick_nappy", 2));
            views.setOnClickPendingIntent(R.id.btn_log_sleep, makeActionIntent(context, "toggle_nap", 3));

            if (jsonStr != null) {
                try {
                    JSONObject data = new JSONObject(jsonStr);
                    String babyName = data.optString("babyName", "Baby");
                    String nextPrediction = data.optString("nextPrediction", "");
                    String nextPredictionLabel = data.optString("nextPredictionLabel", "");
                    String activeTimer = data.optString("activeTimer", "");
                    String timerLabel = data.optString("timerLabel", "");
                    String timerStartTime = data.optString("timerStartTime", "");
                    String lastFeedTime = data.optString("lastFeedTime", "");

                    // Baby name with emoji
                    views.setTextViewText(R.id.tv_baby_name, "\uD83E\uDDF8 " + babyName);

                    // Prediction or timer display
                    if (activeTimer != null && !activeTimer.isEmpty() && !activeTimer.equals("null")) {
                        // Active timer — show elapsed
                        String label = (timerLabel != null && !timerLabel.isEmpty() && !timerLabel.equals("null"))
                            ? timerLabel : "Timer";
                        views.setTextViewText(R.id.tv_prediction, label + " started " + timerStartTime);
                        views.setTextViewText(R.id.tv_nap_label, "");
                    } else if (nextPrediction != null && !nextPrediction.isEmpty() && !nextPrediction.equals("null")) {
                        // Show next prediction
                        views.setTextViewText(R.id.tv_prediction, nextPrediction);
                        views.setTextViewText(R.id.tv_nap_label, "");
                    } else if (lastFeedTime != null && !lastFeedTime.isEmpty() && !lastFeedTime.equals("null")) {
                        views.setTextViewText(R.id.tv_prediction, "Last feed: " + lastFeedTime);
                        views.setTextViewText(R.id.tv_nap_label, "");
                    } else {
                        views.setTextViewText(R.id.tv_prediction, "Open app to sync");
                        views.setTextViewText(R.id.tv_nap_label, "");
                    }
                } catch (Exception e) {
                    views.setTextViewText(R.id.tv_baby_name, "OBubba");
                    views.setTextViewText(R.id.tv_prediction, "Open app to sync");
                    views.setTextViewText(R.id.tv_nap_label, "");
                }
            } else {
                views.setTextViewText(R.id.tv_baby_name, "OBubba");
                views.setTextViewText(R.id.tv_prediction, "Open app to start tracking");
                views.setTextViewText(R.id.tv_nap_label, "");
            }

            appWidgetManager.updateAppWidget(widgetId, views);
        }
    }
}
