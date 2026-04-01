package com.obubba.app.shortcuts;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.drawable.Icon;
import com.obubba.app.R;
import com.obubba.app.MainActivity;
import java.util.Arrays;

public class AppShortcutsManager {

    public static void setupDynamicShortcuts(Context context) {
        ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
        if (shortcutManager == null) return;

        ShortcutInfo feedShortcut = new ShortcutInfo.Builder(context, "log_feed")
            .setShortLabel("Log Feed")
            .setLongLabel("Log a feed for baby")
            .setIcon(Icon.createWithResource(context, R.drawable.ic_feed))
            .setIntent(new Intent(context, MainActivity.class)
                .setAction(Intent.ACTION_VIEW)
                .putExtra("action", "quick_feed"))
            .build();

        ShortcutInfo nappyShortcut = new ShortcutInfo.Builder(context, "log_nappy")
            .setShortLabel("Log Nappy")
            .setLongLabel("Log a nappy change")
            .setIcon(Icon.createWithResource(context, R.drawable.ic_nappy))
            .setIntent(new Intent(context, MainActivity.class)
                .setAction(Intent.ACTION_VIEW)
                .putExtra("action", "quick_nappy"))
            .build();

        ShortcutInfo napShortcut = new ShortcutInfo.Builder(context, "log_sleep")
            .setShortLabel("Log Nap")
            .setLongLabel("Log sleep or nap")
            .setIcon(Icon.createWithResource(context, R.drawable.ic_sleep))
            .setIntent(new Intent(context, MainActivity.class)
                .setAction(Intent.ACTION_VIEW)
                .putExtra("action", "toggle_nap"))
            .build();

        shortcutManager.setDynamicShortcuts(Arrays.asList(feedShortcut, nappyShortcut, napShortcut));
    }

    public static void reportShortcutUsed(Context context, String shortcutId) {
        try {
            ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
            if (shortcutManager != null) {
                shortcutManager.reportShortcutUsed(shortcutId);
            }
        } catch (Exception e) {
            // Ignore
        }
    }
}
