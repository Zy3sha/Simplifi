package com.obubba.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import com.obubba.app.R
import com.obubba.app.MainActivity
import org.json.JSONObject

/**
 * Android Home Screen Widget showing baby's daily summary.
 * Displays prediction, feed count, sleep count, nappy count, and quick actions.
 */
class OBubbaSummaryWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        updateWidgets(context, appWidgetManager, appWidgetIds)
    }

    companion object {
        fun updateWidgets(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetIds: IntArray
        ) {
            val prefs = context.getSharedPreferences("obubba_widget_data", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("widgetData", null)

            for (widgetId in appWidgetIds) {
                val views = RemoteViews(context.packageName, R.layout.widget_summary)

                // Open app on tap
                val intent = Intent(context, MainActivity::class.java)
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

                // Quick action intents
                val feedIntent = Intent(context, MainActivity::class.java).apply {
                    putExtra("action", "quick_feed")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                views.setOnClickPendingIntent(R.id.btn_log_feed, PendingIntent.getActivity(
                    context, 1, feedIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                ))

                val nappyIntent = Intent(context, MainActivity::class.java).apply {
                    putExtra("action", "quick_nappy")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                views.setOnClickPendingIntent(R.id.btn_log_nappy, PendingIntent.getActivity(
                    context, 2, nappyIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                ))

                if (jsonStr != null) {
                    try {
                        val data = JSONObject(jsonStr)
                        val babyName = data.optString("babyName", "Baby")
                        val feedCount = data.optInt("feedCount", 0)
                        val sleepCount = data.optInt("sleepCount", 0)
                        val nappyCount = data.optInt("nappyCount", 0)
                        val lastFeedTime = data.optString("lastFeedTime", "--:--")
                        val nextPrediction = data.optString("nextPrediction", "")
                        val nextPredictionLabel = data.optString("nextPredictionLabel", "")
                        val activeTimer = data.optString("activeTimer", "")

                        views.setTextViewText(R.id.tv_baby_name, babyName)
                        views.setTextViewText(R.id.tv_feed_count, "$feedCount feeds")
                        views.setTextViewText(R.id.tv_sleep_count, "$sleepCount sleeps")
                        views.setTextViewText(R.id.tv_nappy_count, "$nappyCount nappies")
                        views.setTextViewText(R.id.tv_last_feed, "Last feed: $lastFeedTime")

                        // Show prediction
                        if (nextPrediction.isNotEmpty()) {
                            views.setTextViewText(R.id.tv_prediction, nextPrediction)
                            views.setViewVisibility(R.id.tv_prediction, View.VISIBLE)
                        } else {
                            views.setViewVisibility(R.id.tv_prediction, View.GONE)
                        }

                        // Sleep/Nap button: show "Sleep" for bedtime, "Stop" for active timer, "Nap" otherwise
                        val isBedtime = nextPredictionLabel.lowercase().contains("bed")
                        val hasActiveTimer = activeTimer.isNotEmpty() && activeTimer != "null"

                        if (hasActiveTimer) {
                            views.setTextViewText(R.id.btn_log_sleep, "⏹ Stop")
                            val stopIntent = Intent(context, MainActivity::class.java).apply {
                                putExtra("action", "stop_timer")
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                            }
                            views.setOnClickPendingIntent(R.id.btn_log_sleep, PendingIntent.getActivity(
                                context, 3, stopIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                            ))
                        } else if (isBedtime) {
                            views.setTextViewText(R.id.btn_log_sleep, "🌙 Sleep")
                            val bedIntent = Intent(context, MainActivity::class.java).apply {
                                putExtra("action", "start_bedtime")
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                            }
                            views.setOnClickPendingIntent(R.id.btn_log_sleep, PendingIntent.getActivity(
                                context, 3, bedIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                            ))
                        } else {
                            views.setTextViewText(R.id.btn_log_sleep, "😴 Nap")
                            val sleepIntent = Intent(context, MainActivity::class.java).apply {
                                putExtra("action", "toggle_nap")
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                            }
                            views.setOnClickPendingIntent(R.id.btn_log_sleep, PendingIntent.getActivity(
                                context, 3, sleepIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                            ))
                        }

                    } catch (e: Exception) {
                        views.setTextViewText(R.id.tv_baby_name, "OBubba")
                        views.setTextViewText(R.id.tv_last_feed, "Open app to sync")
                        views.setViewVisibility(R.id.tv_prediction, View.GONE)
                    }
                } else {
                    views.setTextViewText(R.id.tv_baby_name, "OBubba")
                    views.setTextViewText(R.id.tv_last_feed, "Open app to start tracking")
                    views.setViewVisibility(R.id.tv_prediction, View.GONE)
                }

                appWidgetManager.updateAppWidget(widgetId, views)
            }
        }
    }
}
