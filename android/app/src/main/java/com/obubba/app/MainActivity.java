package com.obubba.app;

import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.obubba.app.plugins.WidgetBridgePlugin;
import com.obubba.app.shortcuts.AppShortcutsManager;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Enable edge-to-edge so Android passes correct safe-area insets to WebView
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(com.obubba.app.plugins.PrintPlugin.class);
        registerPlugin(com.obubba.app.plugins.StorePlugin.class);
        registerPlugin(com.obubba.app.plugins.ReviewPlugin.class);
        registerPlugin(com.obubba.app.plugins.TimerServicePlugin.class);
        registerPlugin(com.obubba.app.plugins.CalendarPlugin.class);
        super.onCreate(savedInstanceState);

        // Clear WebView cache only when the APK version has changed.
        // Calling clearCache every launch is wasteful and clears AFTER the
        // WebView has already started loading — meaning the stale content runs
        // for that session anyway. Version-tracking means we clear once per
        // update, then reload so the current session also gets fresh JS.
        try {
            String currentVersion = "";
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                currentVersion = pInfo.versionCode + "." + pInfo.versionName;
            } catch (PackageManager.NameNotFoundException ignored) {}

            SharedPreferences prefs = getSharedPreferences("ob_app_meta", MODE_PRIVATE);
            String lastClearedVersion = prefs.getString("last_cleared_version", "");

            if (!currentVersion.isEmpty() && !currentVersion.equals(lastClearedVersion)) {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().clearCache(true);
                    getBridge().getWebView().reload();
                }
                prefs.edit().putString("last_cleared_version", currentVersion).apply();
            }
        } catch (Exception e) { /* ignore */ }

        handleAction(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleAction(intent);
    }

    private void handleAction(Intent intent) {
        if (intent == null) return;
        String action = normalizeAction(intent.getStringExtra("action"));
        if (action == null) return;
        AppShortcutsManager.reportShortcutUsed(this, action);
        if (getBridge() != null) {
            String jsAction = JSONObject.quote(action);
            getBridge().eval("window.dispatchEvent(new CustomEvent('nativeAction', { detail: { action: " + jsAction + " } }))", null);
        }
    }

    private String normalizeAction(String rawAction) {
        if (rawAction == null) return null;
        String action = rawAction.trim().toLowerCase().replace("-", "_").replace(" ", "_");
        switch (action) {
            case "feed":
            case "log_feed":
                return "log_feed";
            case "sleep":
            case "nap":
            case "log_sleep":
                return "log_sleep";
            case "nappy":
            case "diaper":
            case "log_nappy":
                return "log_nappy";
            case "timer":
            case "start_timer":
                return "start_timer";
            case "temperature":
            case "log_temperature":
                return "log_temperature";
            case "medicine":
            case "medication":
            case "log_medicine":
                return "log_medicine";
            case "summary":
            case "baby_summary":
                return "baby_summary";
            case "quick_feed":
            case "quick_nappy":
            case "quick_wake":
            case "toggle_nap":
            case "stop_timer":
            case "start_bedtime":
            case "breast_left":
            case "breast_right":
            case "end_breast_timer":
                return action;
            default:
                return null;
        }
    }
}
