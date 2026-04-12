package com.obubba.app;

import android.os.Bundle;
import android.content.Intent;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.obubba.app.plugins.WidgetBridgePlugin;
import com.obubba.app.shortcuts.AppShortcutsManager;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(com.obubba.app.plugins.PrintPlugin.class);
        registerPlugin(com.obubba.app.plugins.StorePlugin.class);
        super.onCreate(savedInstanceState);

        // Clear WebView cache to ensure latest web assets are loaded
        // after an APK update. Without this, the WebView serves stale
        // cached JS/HTML from the previous install.
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().clearCache(true);
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
        String action = intent.getStringExtra("action");
        if (action == null) return;
        AppShortcutsManager.reportShortcutUsed(this, action);
        if (getBridge() != null) {
            getBridge().eval("window.dispatchEvent(new CustomEvent('nativeAction', { detail: { action: '" + action + "' } }))", null);
        }
    }
}
