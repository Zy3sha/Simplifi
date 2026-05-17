package com.obubba.app.plugins;

import android.content.Intent;
import android.content.Context;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.obubba.app.services.TimerService;

@CapacitorPlugin(name = "OBTimerService")
public class TimerServicePlugin extends Plugin {
    private static final long MAX_TIMER_AGE_MS = 16 * 3600 * 1000L;
    private static final long MAX_PREDICTION_AHEAD_MS = 36 * 3600 * 1000L;

    private void sendServiceAction(String action) {
        Intent intent = new Intent(getContext(), TimerService.class);
        intent.setAction(action);
        getContext().startService(intent);
    }

    private String safeText(String value, String fallback, int maxLen) {
        String text = value == null ? fallback : value;
        text = text.replaceAll("[\\r\\n<>]+", " ").replaceAll("\\s+", " ").trim();
        if (text.isEmpty()) text = fallback;
        return text.length() > maxLen ? text.substring(0, maxLen) : text;
    }

    private String safeTimerType(String value) {
        if ("feed".equals(value) || "nap".equals(value) || "sleep".equals(value) || "bed".equals(value)) return value;
        return "feed";
    }

    private String safeSide(String value) {
        if ("left".equals(value) || "right".equals(value)) return value;
        return null;
    }

    private long safeStartTime(Long value) {
        long now = System.currentTimeMillis();
        long start = value == null ? now : value;
        if (start > now + 60000L) start -= 24 * 3600 * 1000L;
        if (start > now + 60000L || start < now - MAX_TIMER_AGE_MS) return now;
        return start;
    }

    private long safePredictionTarget(Long value) {
        long now = System.currentTimeMillis();
        long target = value == null ? 0L : value;
        if (target < now - 5 * 60000L || target > now + MAX_PREDICTION_AHEAD_MS) return 0L;
        return target;
    }

    private boolean hasSavedRunningTimer() {
        return getContext()
                .getSharedPreferences(TimerService.PREFS_NAME, Context.MODE_PRIVATE)
                .getBoolean("running", false);
    }

    @PluginMethod
    public void startTimer(PluginCall call) {
        try {
            long startTime = safeStartTime(call.getLong("startTime", System.currentTimeMillis()));
            String type = safeTimerType(call.getString("type", "feed"));
            String babyName = safeText(call.getString("babyName", "Baby"), "Baby", 40);
            String side = safeSide(call.getString("side", null));

            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_START);
            intent.putExtra(TimerService.EXTRA_START_TIME, startTime);
            intent.putExtra(TimerService.EXTRA_TIMER_TYPE, type);
            intent.putExtra(TimerService.EXTRA_BABY_NAME, babyName);
            if (side != null) {
                intent.putExtra(TimerService.EXTRA_SIDE, side);
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start timer service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopTimer(PluginCall call) {
        try {
            // Clear persisted state before stopping so Android cannot resurrect an old timer later.
            getContext().getSharedPreferences(TimerService.PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .clear()
                    .apply();

            try {
                sendServiceAction(TimerService.ACTION_STOP);
            } catch (Exception e) {
                getContext().stopService(new Intent(getContext(), TimerService.class));
            }

            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop timer service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getCurrentTimer(PluginCall call) {
        try {
            JSObject ret = new JSObject();
            android.content.SharedPreferences prefs = getContext()
                    .getSharedPreferences(TimerService.PREFS_NAME, Context.MODE_PRIVATE);
            boolean running = prefs.getBoolean("running", false);
            long startTimeMs = prefs.getLong("startTimeMs", 0L);
            long now = System.currentTimeMillis();
            if (!running || startTimeMs <= 0L || now - startTimeMs < -60000L || now - startTimeMs > MAX_TIMER_AGE_MS) {
                ret.put("active", false);
                call.resolve(ret);
                return;
            }
            ret.put("active", true);
            ret.put("type", safeTimerType(prefs.getString("timerType", "feed")));
            ret.put("babyName", safeText(prefs.getString("babyName", "Baby"), "Baby", 40));
            ret.put("startTimeMs", startTimeMs);
            ret.put("elapsed", Math.max(0L, Math.min(MAX_TIMER_AGE_MS / 1000L, (now - startTimeMs) / 1000L)));
            String side = safeSide(prefs.getString("side", null));
            if (side != null) ret.put("side", side);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to read timer service state: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void startPrediction(PluginCall call) {
        try {
            long targetTime = safePredictionTarget(call.getLong("targetTime", 0L));
            if (targetTime == 0L) {
                call.reject("Invalid prediction target");
                return;
            }
            String label = safeText(call.getString("label", "Next event"), "Next event", 40);
            String babyName = safeText(call.getString("babyName", "Baby"), "Baby", 40);
            String timeFormatted = safeText(call.getString("timeFormatted", ""), "", 40);

            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_START_PREDICTION);
            intent.putExtra(TimerService.EXTRA_TARGET_TIME, targetTime);
            intent.putExtra(TimerService.EXTRA_LABEL, label);
            intent.putExtra(TimerService.EXTRA_BABY_NAME, babyName);
            if (timeFormatted != null) {
                intent.putExtra(TimerService.EXTRA_TIME_FORMATTED, timeFormatted);
            }

            boolean timerAlreadyRunning = getContext()
                    .getSharedPreferences(TimerService.PREFS_NAME, Context.MODE_PRIVATE)
                    .getBoolean("running", false);

            // Prediction can either update an existing foreground timer or run as
            // its own sticky "next up" notification. Use foreground start only
            // when there is no persisted timer already holding the service up.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !timerAlreadyRunning) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start prediction: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopPrediction(PluginCall call) {
        try {
            boolean sent = true;
            try {
                sendServiceAction(TimerService.ACTION_STOP_PREDICTION);
            } catch (Exception e) {
                sent = false;
            }

            JSObject ret = new JSObject();
            ret.put("stopped", sent);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop prediction: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void updateTimer(PluginCall call) {
        try {
            JSObject ret = new JSObject();
            if (!hasSavedRunningTimer()) {
                ret.put("updated", false);
                ret.put("reason", "no_running_timer");
                call.resolve(ret);
                return;
            }

            String side = safeSide(call.getString("side", null));
            String babyName = safeText(call.getString("babyName", null), "", 40);

            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_UPDATE);
            if (side != null) {
                intent.putExtra(TimerService.EXTRA_SIDE, side);
            }
            if (babyName != null && !babyName.isEmpty()) {
                intent.putExtra(TimerService.EXTRA_BABY_NAME, babyName);
            }

            // Updates are only valid once a foreground timer exists. Starting a
            // fresh foreground service for a side switch can crash on newer
            // Android versions if the OS treats it as a background start.
            getContext().startService(intent);

            ret.put("updated", true);
            call.resolve(ret);
        } catch (IllegalStateException e) {
            JSObject ret = new JSObject();
            ret.put("updated", false);
            ret.put("reason", "service_unavailable");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update timer service: " + e.getMessage(), e);
        }
    }
}
