# OBubba Launch Ads Export Guide

This HyperFrames project renders a 54-second vertical master containing three 18-second ads.

## Ads In The Master

1. `0:00-0:18` - all-in-one comparison: "Why do babies need five apps?"
2. `0:18-0:36` - iOS + Android partner sync: "Mum has iPhone. Dad has Android."
3. `0:36-0:54` - 3am night logging: "3am maths is not real maths."

## Preview

```bash
cd "/Users/zyesha/Desktop/simplify dev/marketing/obubba-launch-ads"
npm run dev
```

## Check

```bash
cd "/Users/zyesha/Desktop/simplify dev/marketing/obubba-launch-ads"
npm run check
```

## Render Master

```bash
cd "/Users/zyesha/Desktop/simplify dev/marketing/obubba-launch-ads"
npm run render -- --output renders/obubba-launch-ads-master-standard.mp4 --quality standard --fps 30
```

## Split Into Individual Ads

```bash
cd "/Users/zyesha/Desktop/simplify dev/marketing/obubba-launch-ads"
ffmpeg -y -i renders/obubba-launch-ads-master-standard.mp4 -ss 0 -t 18 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart renders/obubba-ad-01-all-in-one.mp4
ffmpeg -y -i renders/obubba-launch-ads-master-standard.mp4 -ss 18 -t 18 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart renders/obubba-ad-02-ios-android-sync.mp4
ffmpeg -y -i renders/obubba-launch-ads-master-standard.mp4 -ss 36 -t 18 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart renders/obubba-ad-03-3am-night-logging.mp4
```

## Upload Copy

Use the matching copy in `/Users/zyesha/Desktop/simplify dev/OBUBBA_SOCIAL_AD_SCRIPT_PACK.md`.
