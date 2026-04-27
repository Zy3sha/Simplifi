package com.obubba.app.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.obubba.app.MainActivity;
import com.obubba.app.R;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class TimerService extends Service {

    private static final String CHANNEL_ID = "obubba_timers";
    private static final int NOTIFICATION_ID = 99999;
    private static final long UPDATE_INTERVAL_MS = 10000; // 10 seconds
    public static final String PREFS_NAME = "obubba_timer_state";

    public static final String ACTION_START = "com.obubba.app.TIMER_START";
    public static final String ACTION_STOP = "com.obubba.app.TIMER_STOP";
    public static final String ACTION_UPDATE = "com.obubba.app.TIMER_UPDATE";
    public static final String ACTION_START_PREDICTION = "com.obubba.app.PREDICTION_START";
    public static final String ACTION_STOP_PREDICTION = "com.obubba.app.PREDICTION_STOP";

    public static final String EXTRA_START_TIME = "startTime";
    public static final String EXTRA_TIMER_TYPE = "timerType";
    public static final String EXTRA_BABY_NAME = "babyName";
    public static final String EXTRA_SIDE = "side";
    public static final String EXTRA_TARGET_TIME = "targetTime";
    public static final String EXTRA_LABEL = "label";
    public static final String EXTRA_TIME_FORMATTED = "timeFormatted";

    private static final int PREDICTION_NOTIFICATION_ID = 99998;

    private Handler handler;
    private Runnable updateRunnable;
    private Runnable predictionRunnable;
    private long startTimeMs;
    private String timerType;
    private String babyName;
    private String side;
    private boolean running = false;
    private boolean predictionRunning = false;
    private long predictionTargetMs;
    private String predictionLabel;
    private String predictionTimeFormatted;
    private String predictionBabyName;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        handler = new Handler(Looper.getMainLooper());
        ensureNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // When Android restarts the service after killing it, intent is null.
        // Recover from persisted state instead of dying.
        if (intent == null) {
            if (restoreTimerState()) {
                startTimer();
                return START_STICKY;
            }
            stopSelf();
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (action == null) action = ACTION_START;

        switch (action) {
            case ACTION_STOP:
                clearTimerState();
                stopTimer();
                return START_NOT_STICKY;

            case ACTION_UPDATE:
                // Update side for breast feeding switch
                if (intent.hasExtra(EXTRA_SIDE)) {
                    side = intent.getStringExtra(EXTRA_SIDE);
                }
                if (intent.hasExtra(EXTRA_BABY_NAME)) {
                    babyName = intent.getStringExtra(EXTRA_BABY_NAME);
                }
                if (running) {
                    saveTimerState();
                    updateNotification();
                }
                return START_STICKY;

            case ACTION_START_PREDICTION:
                stopPrediction();
                predictionTargetMs = intent.getLongExtra(EXTRA_TARGET_TIME, 0);
                predictionLabel = intent.getStringExtra(EXTRA_LABEL);
                predictionTimeFormatted = intent.getStringExtra(EXTRA_TIME_FORMATTED);
                predictionBabyName = intent.getStringExtra(EXTRA_BABY_NAME);
                if (predictionLabel == null) predictionLabel = "Next event";
                if (predictionBabyName == null) predictionBabyName = "Baby";
                startPrediction();
                return START_STICKY;

            case ACTION_STOP_PREDICTION:
                stopPrediction();
                if (!running) { stopSelf(); }
                return START_NOT_STICKY;

            case ACTION_START:
            default:
                stopPrediction(); // prediction goes away when a real timer starts
                startTimeMs = intent.getLongExtra(EXTRA_START_TIME, System.currentTimeMillis());
                timerType = intent.getStringExtra(EXTRA_TIMER_TYPE);
                babyName = intent.getStringExtra(EXTRA_BABY_NAME);
                side = intent.getStringExtra(EXTRA_SIDE);
                if (timerType == null) timerType = "feed";
                if (babyName == null) babyName = "Baby";
                saveTimerState();
                startTimer();
                return START_STICKY;
        }
    }

    private void startTimer() {
        running = true;
        acquireWakeLock();

        if (handler != null && updateRunnable != null) {
            handler.removeCallbacks(updateRunnable);
        }

        // Build initial notification and start foreground
        Notification notification = buildNotification();
        startForeground(NOTIFICATION_ID, notification);

        // Schedule periodic updates
        updateRunnable = new Runnable() {
            @Override
            public void run() {
                if (!running) return;
                updateNotification();
                handler.postDelayed(this, UPDATE_INTERVAL_MS);
            }
        };
        handler.postDelayed(updateRunnable, UPDATE_INTERVAL_MS);
    }

    private void stopTimer() {
        running = false;
        if (handler != null && updateRunnable != null) {
            handler.removeCallbacks(updateRunnable);
        }
        releaseWakeLock();
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private Notification buildNotification() {
        // Intent to open the app when tapped
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, TimerService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this, 2, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String title = buildTitle();
        String body = buildTimerContext();

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setColor(Color.parseColor("#C07088"))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setWhen(startTimeMs > 0 ? startTimeMs : System.currentTimeMillis())
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(false)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(R.drawable.ic_notification, "Stop", stopPendingIntent);

        return builder.build();
    }

    private String buildTitle() {
        String safeBabyName = (babyName == null || babyName.trim().isEmpty()) ? "Baby" : babyName.trim();
        String safeTimerType = (timerType == null || timerType.trim().isEmpty()) ? "timer" : timerType.trim();
        switch (safeTimerType) {
            case "feed":
                String feedTitle = "Feeding " + safeBabyName;
                if (side != null && !side.isEmpty()) {
                    feedTitle += " · " + side + " side";
                }
                return feedTitle;
            case "nap":
                return safeBabyName + " is napping";
            case "sleep":
            case "bed":
                return safeBabyName + " is asleep";
            default:
                return safeTimerType.substring(0, 1).toUpperCase(Locale.UK) + safeTimerType.substring(1) + " timer";
        }
    }

    private String buildTimerContext() {
        String since = "started " + formatClock(startTimeMs);
        String safeTimerType = (timerType == null || timerType.trim().isEmpty()) ? "timer" : timerType.trim();
        switch (safeTimerType) {
            case "feed":
                if (side != null && !side.isEmpty()) {
                    return side.substring(0, 1).toUpperCase(Locale.UK) + side.substring(1) + " side · " + since;
                }
                return "Feed timer · " + since;
            case "nap":
                return "Nap timer · " + since;
            case "sleep":
            case "bed":
                return "Bedtime timer · " + since;
            default:
                return "Timer · " + since;
        }
    }

    private String formatClock(long timeMs) {
        long safeTime = timeMs > 0 ? timeMs : System.currentTimeMillis();
        SimpleDateFormat fmt = new SimpleDateFormat("h:mm a", Locale.UK);
        return fmt.format(new Date(safeTime)).toLowerCase(Locale.UK);
    }

    private void startPrediction() {
        predictionRunning = true;
        Notification notification = buildPredictionNotification();
        if (!running) {
            startForeground(PREDICTION_NOTIFICATION_ID, notification);
        } else {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(PREDICTION_NOTIFICATION_ID, notification);
        }
        predictionRunnable = new Runnable() {
            @Override
            public void run() {
                if (!predictionRunning) return;
                long remaining = predictionTargetMs - System.currentTimeMillis();
                if (remaining <= 0) {
                    stopPrediction();
                    if (!running) stopSelf();
                    return;
                }
                NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (nm != null) nm.notify(PREDICTION_NOTIFICATION_ID, buildPredictionNotification());
                handler.postDelayed(this, 60000); // update every minute
            }
        };
        handler.postDelayed(predictionRunnable, 60000);
    }

    private void stopPrediction() {
        predictionRunning = false;
        if (handler != null && predictionRunnable != null) {
            handler.removeCallbacks(predictionRunnable);
        }
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(PREDICTION_NOTIFICATION_ID);
        if (!running) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        }
    }

    private Notification buildPredictionNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 1, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, TimerService.class);
        stopIntent.setAction(ACTION_STOP_PREDICTION);
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this, 3, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        long remaining = predictionTargetMs - System.currentTimeMillis();
        String countdown;
        if (remaining <= 0) {
            countdown = "Any moment now";
        } else {
            long mins = remaining / 60000;
            if (mins >= 60) {
                countdown = (mins / 60) + "h " + (mins % 60) + "m";
            } else {
                countdown = mins + " min";
            }
        }

        String time = predictionTimeFormatted != null ? predictionTimeFormatted : "";
        String safeBabyName = (predictionBabyName == null || predictionBabyName.trim().isEmpty()) ? "Baby" : predictionBabyName.trim();
        String title = predictionLabel + (time.isEmpty() ? "" : " around " + time);
        String body = countdown + " for " + safeBabyName;

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setColor(Color.parseColor("#C07088"))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setShowWhen(false)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_EVENT)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(R.drawable.ic_notification, "Dismiss", stopPendingIntent)
                .build();
    }

    private void ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Active Timers",
                    NotificationManager.IMPORTANCE_LOW // Low = no sound, but visible
            );
            channel.setDescription("Shows while a feed, nap, or bedtime timer is running");
            channel.enableVibration(false);
            channel.setSound(null, null);
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    // ── State persistence: survives process death ──

    private void saveTimerState() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putLong("startTimeMs", startTimeMs)
                .putString("timerType", timerType)
                .putString("babyName", babyName)
                .putString("side", side)
                .putBoolean("running", true)
                .apply();
    }

    private boolean restoreTimerState() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("running", false)) return false;

        startTimeMs = prefs.getLong("startTimeMs", 0);
        if (startTimeMs == 0) return false;

        // Don't resurrect timers older than 16 hours — they're stale (bed timers can run up to 16h)
        if (System.currentTimeMillis() - startTimeMs > 16 * 3600 * 1000L) {
            clearTimerState();
            return false;
        }

        timerType = prefs.getString("timerType", "feed");
        babyName = prefs.getString("babyName", "Baby");
        side = prefs.getString("side", null);
        return true;
    }

    private void clearTimerState() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
    }

    // ── WakeLock: prevents Samsung/OEM aggressive killing ──

    private void acquireWakeLock() {
        if (wakeLock == null) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "obubba:timer");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(16 * 60 * 60 * 1000L); // 16h max (covers bed timers), auto-releases
            }
        }
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }
    }

    // ── Survive app swipe-away from recents ──

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        if (running) {
            // Reschedule the service so it restarts after being swiped away
            Intent restartIntent = new Intent(this, TimerService.class);
            restartIntent.setAction(ACTION_START);
            restartIntent.putExtra(EXTRA_START_TIME, startTimeMs);
            restartIntent.putExtra(EXTRA_TIMER_TYPE, timerType);
            restartIntent.putExtra(EXTRA_BABY_NAME, babyName);
            if (side != null) restartIntent.putExtra(EXTRA_SIDE, side);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(restartIntent);
            } else {
                startService(restartIntent);
            }
        }
        super.onTaskRemoved(rootIntent);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        running = false;
        predictionRunning = false;
        if (handler != null) {
            if (updateRunnable != null) handler.removeCallbacks(updateRunnable);
            if (predictionRunnable != null) handler.removeCallbacks(predictionRunnable);
        }
        releaseWakeLock();
        super.onDestroy();
    }
}
