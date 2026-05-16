package com.obubba.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.obubba.app.plugins.WidgetBridgePlugin;
import com.obubba.app.shortcuts.AppShortcutsManager;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String NATIVE_PREFS = "obubba_native_runtime";
    private static final String LAST_CACHE_CLEAR_VERSION = "last_webview_cache_clear_version";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(com.obubba.app.plugins.PrintPlugin.class);
        registerPlugin(com.obubba.app.plugins.StorePlugin.class);
        registerPlugin(com.obubba.app.plugins.ReviewPlugin.class);
        registerPlugin(com.obubba.app.plugins.TimerServicePlugin.class);
        registerPlugin(com.obubba.app.plugins.CalendarPlugin.class);
        registerPlugin(com.getcapacitor.community.firebaseanalytics.FirebaseAnalytics.class);
        EdgeToEdge.enable(
            this,
            SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT),
            SystemBarStyle.auto(Color.TRANSPARENT, Color.argb(128, 8, 14, 31))
        );
        super.onCreate(savedInstanceState);

        // Clear WebView cache only after an app update. Doing this on every
        // cold start blocks startup on some Android WebView builds.
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.setBackgroundResource(R.drawable.launch_background);
                clearWebViewCacheAfterAppUpdate(webView);
                applyEdgeToEdgeInsets(webView);
            }
        } catch (Exception e) { /* ignore */ }

        handleAction(getIntent());
    }

    private long currentVersionCode() {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return info.getLongVersionCode();
            }
            return info.versionCode;
        } catch (Exception e) {
            return -1L;
        }
    }

    private void clearWebViewCacheAfterAppUpdate(WebView webView) {
        long versionCode = currentVersionCode();
        if (versionCode <= 0) return;
        SharedPreferences prefs = getSharedPreferences(NATIVE_PREFS, MODE_PRIVATE);
        if (prefs.getLong(LAST_CACHE_CLEAR_VERSION, -1L) == versionCode) return;

        webView.postDelayed(() -> {
            try {
                webView.clearCache(true);
                prefs.edit().putLong(LAST_CACHE_CLEAR_VERSION, versionCode).apply();
            } catch (Exception e) { /* ignore */ }
        }, 1200L);
    }

    private void applyEdgeToEdgeInsets(WebView webView) {
        webView.setClipToPadding(true);
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            syncCssInsets(webView, insets);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }

    private void syncCssInsets(WebView webView, Insets insets) {
        String js = "(function(){try{"
            + "var i={top:" + insets.top + ",right:" + insets.right + ",bottom:" + insets.bottom + ",left:" + insets.left + "};"
            + "window.__obNativeInsets=i;"
            + "var r=document.documentElement;"
            + "if(r){"
            + "r.style.setProperty('--ob-native-top-inset',i.top+'px');"
            + "r.style.setProperty('--ob-native-right-inset',i.right+'px');"
            + "r.style.setProperty('--ob-native-bottom-inset',i.bottom+'px');"
            + "r.style.setProperty('--ob-native-left-inset',i.left+'px');"
            + "}"
            + "}catch(e){}})();";
        webView.post(() -> webView.evaluateJavascript(js, null));
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
