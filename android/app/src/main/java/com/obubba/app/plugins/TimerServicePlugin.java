package com.obubba.app.plugins;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.obubba.app.services.TimerService;

@CapacitorPlugin(name = "OBTimerService")
public class TimerServicePlugin extends Plugin {

    @PluginMethod
    public void startTimer(PluginCall call) {
        try {
            long startTime = call.getLong("startTime", System.currentTimeMillis());
            String type = call.getString("type", "feed");
            String babyName = call.getString("babyName", "Baby");
            String side = call.getString("side", null);

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
            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_STOP);

            // Try to send the stop action; if the service isn't running, just stop it
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getContext().startForegroundService(intent);
                } else {
                    getContext().startService(intent);
                }
            } catch (Exception e) {
                // Service might not be running, that's fine
            }

            // Also try direct stop in case the above didn't work
            try {
                getContext().stopService(new Intent(getContext(), TimerService.class));
            } catch (Exception e) {
                // ignore
            }

            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop timer service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void startPrediction(PluginCall call) {
        try {
            long targetTime = call.getLong("targetTime", 0L);
            String label = call.getString("label", "Next event");
            String babyName = call.getString("babyName", "Baby");
            String timeFormatted = call.getString("timeFormatted", null);

            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_START_PREDICTION);
            intent.putExtra(TimerService.EXTRA_TARGET_TIME, targetTime);
            intent.putExtra(TimerService.EXTRA_LABEL, label);
            intent.putExtra(TimerService.EXTRA_BABY_NAME, babyName);
            if (timeFormatted != null) {
                intent.putExtra(TimerService.EXTRA_TIME_FORMATTED, timeFormatted);
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
            call.reject("Failed to start prediction: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopPrediction(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_STOP_PREDICTION);
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getContext().startForegroundService(intent);
                } else {
                    getContext().startService(intent);
                }
            } catch (Exception e) { /* service might not be running */ }

            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop prediction: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void updateTimer(PluginCall call) {
        try {
            String side = call.getString("side", null);
            String babyName = call.getString("babyName", null);

            Intent intent = new Intent(getContext(), TimerService.class);
            intent.setAction(TimerService.ACTION_UPDATE);
            if (side != null) {
                intent.putExtra(TimerService.EXTRA_SIDE, side);
            }
            if (babyName != null) {
                intent.putExtra(TimerService.EXTRA_BABY_NAME, babyName);
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("updated", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update timer service: " + e.getMessage(), e);
        }
    }
}
