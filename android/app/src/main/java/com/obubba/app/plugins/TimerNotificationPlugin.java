package com.obubba.app.plugins;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.obubba.app.MainActivity;
import com.obubba.app.R;

@CapacitorPlugin(name = "TimerNotification")
public class TimerNotificationPlugin extends Plugin {

    private static final String TAG = "OBubbaTimer";
    private static final String CHANNEL_ID = "obubba_fg_timer_v5";
    private static final int NOTIF_ID = 77777;

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager mgr = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            // Delete old channels that Samsung cached with wrong importance/visibility
            try { mgr.deleteNotificationChannel("obubba_timer_sticky"); } catch (Exception e) {}
            try { mgr.deleteNotificationChannel("obubba_timers"); } catch (Exception e) {}
            try { mgr.deleteNotificationChannel("obubba_fg_timer"); } catch (Exception e) {}
            try { mgr.deleteNotificationChannel("obubba_fg_timer_v2"); } catch (Exception e) {}
            try { mgr.deleteNotificationChannel("obubba_fg_timer_v3"); } catch (Exception e) {}
            try { mgr.deleteNotificationChannel("obubba_fg_timer_v4"); } catch (Exception e) {}
            if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "Active Timer", NotificationManager.IMPORTANCE_HIGH
                );
                ch.setDescription("Persistent notification while a timer is running");
                ch.setShowBadge(false);
                ch.enableVibration(false);
                ch.setSound(null, null);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                ch.setImportance(NotificationManager.IMPORTANCE_HIGH);
                mgr.createNotificationChannel(ch);
            }
        }
    }

    private Notification buildNotification(Context ctx, String title, String body) {
        Intent intent = new Intent(ctx, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            ctx, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // fullScreenIntent makes the notification appear prominently on the
        // lock screen (like an alarm or incoming call), even on Samsung One UI
        // which otherwise filters ongoing notifications from the lock screen face.
        PendingIntent fullScreenPi = PendingIntent.getActivity(
            ctx, 1, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pi)
            .setFullScreenIntent(fullScreenPi, true)
            .setColor(0xFFC07088)
            .setWhen(System.currentTimeMillis())
            .setUsesChronometer(true)
            .build();
    }

    @PluginMethod
    public void show(PluginCall call) {
        try {
            String title = call.getString("title", "Timer running");
            String body = call.getString("body", "");

            ensureChannel();

            Notification notification = buildNotification(getContext(), title, body);

            // Always post via NotificationManager first — guaranteed to work
            // even when foreground service is denied by Android 14+ BFSL restrictions
            NotificationManager mgr = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            mgr.notify(NOTIF_ID, notification);
            Log.i(TAG, "Posted notification via NotificationManager");

            // Also try foreground service (best-effort) — makes notification
            // unkillable by Samsung power management
            try {
                Intent serviceIntent = new Intent(getContext(), TimerForegroundService.class);
                serviceIntent.putExtra("title", title);
                serviceIntent.putExtra("body", body);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getContext().startForegroundService(serviceIntent);
                } else {
                    getContext().startService(serviceIntent);
                }
                Log.i(TAG, "Foreground service started (best-effort)");
            } catch (Exception fgEx) {
                Log.w(TAG, "Foreground service failed (notification still visible): " + fgEx.getMessage());
            }

            JSObject ret = new JSObject();
            ret.put("shown", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "show() failed: " + e.getMessage());
            call.resolve();
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        try {
            Intent serviceIntent = new Intent(getContext(), TimerForegroundService.class);
            getContext().stopService(serviceIntent);
        } catch (Exception e) {}
        try {
            NotificationManager mgr = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            mgr.cancel(NOTIF_ID);
        } catch (Exception e) {}
        call.resolve();
    }

    // ── Inner foreground service class ──
    public static class TimerForegroundService extends Service {
        @Override
        public int onStartCommand(Intent intent, int flags, int startId) {
            String title = intent != null ? intent.getStringExtra("title") : "Timer running";
            String body = intent != null ? intent.getStringExtra("body") : "";
            if (title == null) title = "Timer running";
            if (body == null) body = "";

            // Ensure channel
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationManager mgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
                    NotificationChannel ch = new NotificationChannel(
                        CHANNEL_ID, "Active Timer", NotificationManager.IMPORTANCE_HIGH
                    );
                    ch.setShowBadge(false);
                    ch.enableVibration(false);
                    ch.setSound(null, null);
                    ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                    mgr.createNotificationChannel(ch);
                }
            }

            Intent openApp = new Intent(this, MainActivity.class);
            openApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(this, 0, openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            PendingIntent fullScreenPi = PendingIntent.getActivity(this, 1, openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(body)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pi)
                .setFullScreenIntent(fullScreenPi, true)
                .setColor(0xFFC07088)
                .setWhen(System.currentTimeMillis())
                .setUsesChronometer(true)
                .build();

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
                } else {
                    startForeground(NOTIF_ID, notification);
                }
                Log.i(TAG, "startForeground() succeeded");
            } catch (Exception e) {
                // Android 14+ may deny foreground promotion; notification already
                // posted via NotificationManager in show(), so this is non-fatal
                Log.w(TAG, "startForeground() denied: " + e.getMessage());
                stopSelf();
            }
            return START_STICKY;
        }

        @Override
        public IBinder onBind(Intent intent) { return null; }
    }
}
