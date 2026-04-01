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

@CapacitorPlugin(name = "OBWidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private SharedPreferences getSharedPrefs() {
        return getContext().getSharedPreferences("obubba_widget_data", Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void setData(PluginCall call) {
        String json = call.getString("json");
        if (json == null) {
            call.reject("json is required");
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
