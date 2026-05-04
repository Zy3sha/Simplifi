package com.obubba.app.plugins;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.obubba.app.widgets.OBubbaSummaryWidget;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

@CapacitorPlugin(name = "OBWidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    private static final int MAX_WIDGET_DATA_BYTES = 16 * 1024;

    private SharedPreferences getSharedPrefs() {
        return getContext().getSharedPreferences("obubba_widget_data", Context.MODE_PRIVATE);
    }

    private String safeWidgetJson(String rawJson) throws Exception {
        if (rawJson == null) throw new Exception("json is required");
        if (rawJson.getBytes(StandardCharsets.UTF_8).length > MAX_WIDGET_DATA_BYTES) {
            throw new Exception("widget data is too large");
        }
        new JSONObject(rawJson);
        return rawJson;
    }

    private String safeWidgetTheme(String rawTheme) {
        if (rawTheme == null) return "auto";
        switch (rawTheme) {
            case "auto":
            case "rose":
            case "lavender":
            case "mint":
            case "sky":
            case "dark":
                return rawTheme;
            default:
                return "auto";
        }
    }

    @PluginMethod
    public void setData(PluginCall call) {
        String json;
        try {
            json = safeWidgetJson(call.getString("json"));
        } catch (Exception e) {
            call.reject("Invalid widget data");
            return;
        }

        getSharedPrefs().edit().putString("widgetData", json).apply();

        // Trigger widget update
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getContext());
        ComponentName widgetComponent = new ComponentName(getContext(), OBubbaSummaryWidget.class);
        int[] widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);
        if (widgetIds.length > 0) {
            OBubbaSummaryWidget.updateWidgets(getContext(), appWidgetManager, widgetIds);
        }

        JSObject ret = new JSObject();
        ret.put("saved", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void setTheme(PluginCall call) {
        String theme = safeWidgetTheme(call.getString("theme", "auto"));
        getSharedPrefs().edit().putString("widgetTheme", theme).apply();

        // Trigger widget update so it redraws with new theme
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getContext());
        ComponentName widgetComponent = new ComponentName(getContext(), OBubbaSummaryWidget.class);
        int[] widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);
        if (widgetIds.length > 0) {
            OBubbaSummaryWidget.updateWidgets(getContext(), appWidgetManager, widgetIds);
        }

        JSObject ret = new JSObject();
        ret.put("theme", theme);
        call.resolve(ret);
    }

    @PluginMethod
    public void reloadAll(PluginCall call) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getContext());
        ComponentName widgetComponent = new ComponentName(getContext(), OBubbaSummaryWidget.class);
        int[] widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);
        if (widgetIds.length > 0) {
            OBubbaSummaryWidget.updateWidgets(getContext(), appWidgetManager, widgetIds);
        }
        call.resolve();
    }
}
