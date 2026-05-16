package com.obubba.nativeclock;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

public class ClockActivity extends Activity {
    private static final String PREFS_NAME = "native_clock_prototype";
    private static final String PREF_ENTRIES = "entries";

    private final ArrayList<ClockEntry> entries = new ArrayList<>();
    private SharedPreferences prefs;
    private ClockFaceView clockFace;
    private TextView statusText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        loadEntries();
        buildUi();
        refreshClock();
    }

    private void buildUi() {
        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(247, 240, 234));
        window.setNavigationBarColor(Color.rgb(247, 240, 234));

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(247, 240, 234));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(16), dp(18), dp(16), dp(18));
        scroll.addView(root, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        TextView title = new TextView(this);
        title.setText("OBubba Native Clock");
        title.setTextColor(Color.rgb(49, 54, 72));
        title.setTextSize(28);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        root.addView(title, matchWrap());

        TextView subtitle = new TextView(this);
        subtitle.setText("Android Canvas prototype for the slow WebView clock path");
        subtitle.setTextColor(Color.rgb(99, 93, 112));
        subtitle.setTextSize(15);
        subtitle.setPadding(0, dp(4), 0, dp(14));
        root.addView(subtitle, matchWrap());

        FrameLayout clockCard = new FrameLayout(this);
        clockCard.setPadding(dp(10), dp(10), dp(10), dp(10));
        clockCard.setBackground(rounded(Color.WHITE, 18, Color.argb(255, 230, 218, 208)));
        clockCard.setElevation(dp(3));
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(374)
        );
        cardParams.bottomMargin = dp(14);
        root.addView(clockCard, cardParams);

        clockFace = new ClockFaceView(this);
        clockCard.addView(clockFace, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        LinearLayout rowOne = new LinearLayout(this);
        rowOne.setOrientation(LinearLayout.HORIZONTAL);
        rowOne.setGravity(Gravity.CENTER);
        root.addView(rowOne, matchWrap());

        rowOne.addView(quickButton("Feed", Color.rgb(91, 142, 164), () -> addLog("feed", 22)), weightedButton());
        rowOne.addView(quickButton("Nappy", Color.rgb(154, 122, 75), () -> addLog("nappy", 8)), weightedButton());
        rowOne.addView(quickButton("Nap", Color.rgb(118, 103, 179), () -> addLog("nap", 58)), weightedButton());

        LinearLayout rowTwo = new LinearLayout(this);
        rowTwo.setOrientation(LinearLayout.HORIZONTAL);
        rowTwo.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams rowTwoParams = matchWrap();
        rowTwoParams.topMargin = dp(8);
        root.addView(rowTwo, rowTwoParams);

        rowTwo.addView(quickButton("Sleep", Color.rgb(82, 93, 148), () -> addLog("sleep", 90)), weightedButton());
        rowTwo.addView(quickButton("Wake", Color.rgb(176, 137, 54), () -> addLog("wake", 6)), weightedButton());
        rowTwo.addView(quickButton("Clear", Color.rgb(117, 121, 130), this::clearLogs), weightedButton());

        statusText = new TextView(this);
        statusText.setTextColor(Color.rgb(72, 66, 86));
        statusText.setTextSize(15);
        statusText.setLineSpacing(dp(2), 1.0f);
        statusText.setPadding(0, dp(14), 0, 0);
        root.addView(statusText, matchWrap());

        setContentView(scroll);
    }

    private Button quickButton(String label, int color, Runnable action) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(Color.WHITE);
        button.setTextSize(15);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setMinHeight(dp(48));
        button.setPadding(dp(6), 0, dp(6), 0);
        button.setBackground(rounded(color, 14, darken(color)));
        button.setOnClickListener(v -> action.run());
        return button;
    }

    private void addLog(String type, int durationMinutes) {
        entries.add(new ClockEntry(type, minuteOfDay(), durationMinutes, System.currentTimeMillis()));
        trimOldEntries();
        saveEntries();
        refreshClock();
    }

    private void clearLogs() {
        entries.clear();
        saveEntries();
        refreshClock();
    }

    private void refreshClock() {
        if (clockFace == null || statusText == null) return;
        clockFace.setEntries(entries);
        clockFace.setOnlineParentCount(isNightNow() ? 14 : 0);
        statusText.setText(String.format(
                Locale.UK,
                "%d native demo logs today. Fireflies are drawn in one Android Canvas layer; live OBubba presence can feed the same native renderer next.",
                entries.size()
        ));
    }

    private void loadEntries() {
        entries.clear();
        String raw = prefs.getString(PREF_ENTRIES, "[]");
        try {
            JSONArray array = new JSONArray(raw);
            long startOfToday = startOfTodayMillis();
            for (int i = 0; i < array.length(); i++) {
                JSONObject item = array.getJSONObject(i);
                ClockEntry entry = new ClockEntry(
                        item.optString("type", "feed"),
                        item.optInt("startMinute", minuteOfDay()),
                        item.optInt("durationMinutes", 12),
                        item.optLong("createdAt", System.currentTimeMillis())
                );
                if (entry.createdAt >= startOfToday) entries.add(entry);
            }
        } catch (Exception ignored) {
            entries.clear();
        }
    }

    private void saveEntries() {
        JSONArray array = new JSONArray();
        for (ClockEntry entry : entries) {
            JSONObject item = new JSONObject();
            try {
                item.put("type", entry.type);
                item.put("startMinute", entry.startMinute);
                item.put("durationMinutes", entry.durationMinutes);
                item.put("createdAt", entry.createdAt);
                array.put(item);
            } catch (Exception ignored) {
                // Keep the prototype resilient during local testing.
            }
        }
        prefs.edit().putString(PREF_ENTRIES, array.toString()).apply();
    }

    private void trimOldEntries() {
        long startOfToday = startOfTodayMillis();
        for (int i = entries.size() - 1; i >= 0; i--) {
            if (entries.get(i).createdAt < startOfToday) entries.remove(i);
        }
    }

    private static int minuteOfDay() {
        Calendar calendar = Calendar.getInstance();
        return calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE);
    }

    private static boolean isNightNow() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        return hour >= 20 || hour < 6;
    }

    private static long startOfTodayMillis() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTimeInMillis();
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams weightedButton() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, dp(52), 1f);
        params.leftMargin = dp(3);
        params.rightMargin = dp(3);
        return params;
    }

    private GradientDrawable rounded(int color, int radiusDp, int strokeColor) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setShape(GradientDrawable.RECTANGLE);
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radiusDp));
        drawable.setStroke(dp(1), strokeColor);
        return drawable;
    }

    private static int darken(int color) {
        return Color.rgb(
                Math.max(0, (int) (Color.red(color) * 0.78f)),
                Math.max(0, (int) (Color.green(color) * 0.78f)),
                Math.max(0, (int) (Color.blue(color) * 0.78f))
        );
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private static final class ClockEntry {
        final String type;
        final int startMinute;
        final int durationMinutes;
        final long createdAt;

        ClockEntry(String type, int startMinute, int durationMinutes, long createdAt) {
            this.type = type;
            this.startMinute = startMinute;
            this.durationMinutes = durationMinutes;
            this.createdAt = createdAt;
        }
    }

    private static final class ClockFaceView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF arcBounds = new RectF();
        private final ArrayList<ClockEntry> entries = new ArrayList<>();
        private int onlineParentCount = 0;
        private boolean attached = false;

        ClockFaceView(Context context) {
            super(context);
            setLayerType(View.LAYER_TYPE_HARDWARE, null);
            setWillNotDraw(false);
        }

        void setEntries(List<ClockEntry> nextEntries) {
            entries.clear();
            entries.addAll(nextEntries);
            invalidate();
        }

        void setOnlineParentCount(int count) {
            onlineParentCount = Math.max(0, Math.min(18, count));
            invalidate();
        }

        @Override
        protected void onAttachedToWindow() {
            super.onAttachedToWindow();
            attached = true;
        }

        @Override
        protected void onDetachedFromWindow() {
            attached = false;
            super.onDetachedFromWindow();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float width = getWidth();
            float height = getHeight();
            float size = Math.min(width, height);
            float cx = width / 2f;
            float cy = height / 2f;
            float radius = size * 0.36f;

            drawBackground(canvas, width, height);
            drawClockFace(canvas, cx, cy, radius);
            drawEntries(canvas, cx, cy, radius);
            drawNowMarker(canvas, cx, cy, radius);
            drawCenterText(canvas, cx, cy);
            drawFireflies(canvas, cx, cy, radius);

            if (attached && onlineParentCount > 0) {
                postInvalidateOnAnimation();
            }
        }

        private void drawBackground(Canvas canvas, float width, float height) {
            paint.setStyle(Paint.Style.FILL);
            paint.setShader(new LinearGradient(
                    0, 0, 0, height,
                    Color.rgb(255, 251, 244),
                    Color.rgb(238, 247, 247),
                    Shader.TileMode.CLAMP
            ));
            canvas.drawRoundRect(0, 0, width, height, dp(16), dp(16), paint);
            paint.setShader(null);
        }

        private void drawClockFace(Canvas canvas, float cx, float cy, float radius) {
            paint.setStyle(Paint.Style.FILL);
            paint.setShader(new RadialGradient(
                    cx - radius * 0.25f, cy - radius * 0.32f, radius * 1.35f,
                    Color.rgb(255, 255, 255),
                    Color.rgb(235, 244, 248),
                    Shader.TileMode.CLAMP
            ));
            canvas.drawCircle(cx, cy, radius + dp(22), paint);
            paint.setShader(null);

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(12));
            paint.setColor(Color.rgb(219, 229, 235));
            canvas.drawCircle(cx, cy, radius, paint);

            paint.setStrokeWidth(dp(1));
            paint.setColor(Color.argb(90, 64, 71, 91));
            for (int i = 0; i < 24; i++) {
                float angle = (float) Math.toRadians(i * 15f - 90f);
                float inner = radius - (i % 3 == 0 ? dp(10) : dp(5));
                float outer = radius + dp(2);
                canvas.drawLine(
                        cx + (float) Math.cos(angle) * inner,
                        cy + (float) Math.sin(angle) * inner,
                        cx + (float) Math.cos(angle) * outer,
                        cy + (float) Math.sin(angle) * outer,
                        paint
                );
            }
        }

        private void drawEntries(Canvas canvas, float cx, float cy, float radius) {
            arcBounds.set(cx - radius, cy - radius, cx + radius, cy + radius);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeWidth(dp(12));
            for (ClockEntry entry : entries) {
                paint.setColor(colorForType(entry.type));
                float startAngle = entry.startMinute / 1440f * 360f - 90f;
                float sweep = Math.max(3.5f, entry.durationMinutes / 1440f * 360f);
                canvas.drawArc(arcBounds, startAngle, sweep, false, paint);
            }
            paint.setStrokeCap(Paint.Cap.BUTT);
        }

        private void drawNowMarker(Canvas canvas, float cx, float cy, float radius) {
            float angle = (float) Math.toRadians(minuteOfDay() / 1440f * 360f - 90f);
            float x = cx + (float) Math.cos(angle) * radius;
            float y = cy + (float) Math.sin(angle) * radius;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(47, 54, 72));
            canvas.drawCircle(x, y, dp(5), paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(2));
            paint.setColor(Color.argb(120, 47, 54, 72));
            canvas.drawLine(cx, cy, x, y, paint);
        }

        private void drawCenterText(Canvas canvas, float cx, float cy) {
            textPaint.setTextAlign(Paint.Align.CENTER);
            textPaint.setTypeface(Typeface.DEFAULT_BOLD);
            textPaint.setColor(Color.rgb(48, 54, 72));
            textPaint.setTextSize(dp(22));
            canvas.drawText("Native", cx, cy - dp(6), textPaint);
            textPaint.setTypeface(Typeface.DEFAULT);
            textPaint.setTextSize(dp(14));
            textPaint.setColor(Color.rgb(103, 96, 112));
            canvas.drawText("Canvas clock", cx, cy + dp(18), textPaint);
        }

        private void drawFireflies(Canvas canvas, float cx, float cy, float radius) {
            if (onlineParentCount <= 0) return;
            long now = SystemClock.uptimeMillis();
            float[] radiusBands = new float[]{0.58f, 0.82f, 1.06f, 1.28f, 1.46f};
            float maxRadius = Math.max(dp(42), Math.min(cx, cy) - dp(26));
            for (int i = 0; i < onlineParentCount; i++) {
                int seed = 23 + i * 67;
                int band = Math.abs(seed + i * 3) % radiusBands.length;
                float phase = now / 1000f + seed * 0.031f;
                float baseAngle = i * 137.508f + (seed % 73) - 36f;
                float angle = (float) Math.toRadians(baseAngle + Math.sin(phase * 0.7f) * 4.5f);
                float radiusJitter = dp(((seed * 11 + i * 19) % 35 - 17) * 0.42f);
                float localRadius = radius * radiusBands[band] + radiusJitter + (float) Math.sin(phase * 0.5f) * dp(3);
                localRadius = Math.max(dp(36), Math.min(maxRadius, localRadius));
                float x = cx + (float) Math.cos(angle) * localRadius;
                float y = cy + (float) Math.sin(angle) * localRadius;
                float sparkle = 0.52f + (float) Math.sin(phase * 2.4f) * 0.28f;
                int alpha = Math.max(70, Math.min(210, (int) (sparkle * 220)));
                float glow = dp(band < 2 ? 17 : i < 8 ? 15 : 13);

                paint.setStyle(Paint.Style.FILL);
                paint.setShader(new RadialGradient(
                        x, y, glow,
                        new int[]{
                                Color.argb(alpha, 255, 248, 204),
                                Color.argb((int) (alpha * 0.48f), 255, 190, 104),
                                Color.argb(0, 73, 180, 255)
                        },
                        new float[]{0f, 0.42f, 1f},
                        Shader.TileMode.CLAMP
                ));
                canvas.drawCircle(x, y, glow, paint);
                paint.setShader(null);
                paint.setColor(Color.argb(Math.min(255, alpha + 35), 255, 244, 180));
                canvas.drawCircle(x, y, dp(2.2f), paint);
            }
        }

        private int colorForType(String type) {
            if ("feed".equals(type)) return Color.rgb(91, 142, 164);
            if ("nappy".equals(type)) return Color.rgb(154, 122, 75);
            if ("nap".equals(type)) return Color.rgb(118, 103, 179);
            if ("sleep".equals(type)) return Color.rgb(82, 93, 148);
            if ("wake".equals(type)) return Color.rgb(176, 137, 54);
            return Color.rgb(192, 112, 136);
        }

        private int dp(float value) {
            return Math.round(value * getResources().getDisplayMetrics().density);
        }
    }
}
