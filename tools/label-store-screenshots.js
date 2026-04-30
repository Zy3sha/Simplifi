#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sourceRoot = path.join(os.homedir(), "Desktop", "OBubba-store-real-screenshots-2026-04-30");
const outRoot = path.join(os.homedir(), "Desktop", "OBubba-store-labeled-screenshots-2026-04-30");
const appleOut = path.join(outRoot, "apple-iphone-6-9");
const playOut = path.join(outRoot, "google-play-phone");
const playUploadOut = path.join(outRoot, "google-play-phone-UPLOAD-8");
const tmpDir = path.join(outRoot, "_html");

for (const dir of [outRoot, appleOut, playOut, playUploadOut, tmpDir]) fs.mkdirSync(dir, { recursive: true });

const appleSources = [
  {
    file: path.join(sourceRoot, "apple-iphone-6-9-1290x2796", "01-ios-today-overview.png"),
    out: "01-today-overview.png",
    title: "Stop guessing what baby needs next",
    sub: "Feeds, nappies, naps and gentle next steps in one calm view.",
    mood: "day"
  },
  {
    file: path.join(sourceRoot, "apple-iphone-6-9-1290x2796", "03-ios-todays-insight.png"),
    out: "02-todays-insight.png",
    title: "Turn logs into understanding",
    sub: "OBubba reads the full day before suggesting what may help.",
    mood: "blush"
  },
  {
    file: path.join(sourceRoot, "apple-iphone-6-9-1290x2796", "04-ios-understand.png"),
    out: "03-understand.png",
    title: "Your baby’s rhythm, explained",
    sub: "Sleep, feeding, growth and reports, written for tired parents.",
    mood: "mint"
  },
  {
    file: path.join(sourceRoot, "apple-iphone-6-9-1290x2796", "05-ios-sleep-insights.png"),
    out: "04-sleep-guidance.png",
    title: "Sleep guidance that adapts",
    sub: "Wake windows and bedtime suggestions shaped around your baby.",
    mood: "night"
  },
  {
    file: path.join(sourceRoot, "apple-iphone-6-9-1290x2796", "06-ios-plan-tomorrow.png"),
    out: "05-plan-tomorrow.png",
    title: "Plan tomorrow around real life",
    sub: "Slot food, care and reminders around predicted naps.",
    mood: "amber"
  },
  {
    file: path.join(sourceRoot, "system-feature-screenshots", "apple-siri-widget-live-activities-1290x2796.png"),
    out: "06-siri-widgets-live-activities.png",
    title: "Built for one-handed parenting",
    sub: "Siri, widgets and Live Activities keep timers close.",
    mood: "night"
  }
];

const playSources = [
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "01-today-dashboard.png"),
    out: "01-today-dashboard.png",
    title: "Stop guessing what baby needs next",
    sub: "Track feeds, nappies, naps and gentle next steps.",
    mood: "day"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "02-voice-whole-day-review.png"),
    out: "02-voice-log.png",
    title: "Forgot to log? Just say the day.",
    sub: "Voice-log feeds, naps, nappies and bedtime in seconds.",
    mood: "blush"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "03-nap-not-happening.png"),
    out: "03-nap-not-happening.png",
    title: "When naps don’t happen",
    sub: "Choose a gentle rescue path without starting over.",
    mood: "amber"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "04-todays-insight.png"),
    out: "04-todays-insight.png",
    title: "Turn logs into understanding",
    sub: "OBubba reads the full day before suggesting what may help.",
    mood: "mint"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "05-understand.png"),
    out: "05-understand.png",
    title: "Everything connects",
    sub: "Sleep, feeding, safety and reports in one parent-friendly hub.",
    mood: "day"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "06-sleep.png"),
    out: "06-sleep-guidance.png",
    title: "Sleep guidance that adapts",
    sub: "Wake windows, naps and bedtime suggestions shaped around baby.",
    mood: "night"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "07-plan-tomorrow.png"),
    out: "07-plan-tomorrow.png",
    title: "Plan tomorrow around real life",
    sub: "Slot food, care and reminders around predicted naps.",
    mood: "amber"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "08-weaning.png"),
    out: "08-weaning.png",
    title: "Weaning without the worry spiral",
    sub: "Track foods, allergens and reactions with safer prompts.",
    mood: "mint"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "09-grow.png"),
    out: "09-grow.png",
    title: "Know what to try today",
    sub: "Activities, milestones and gentle development support.",
    mood: "blush"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "10-voice-widget-active-timer.png"),
    out: "10-widgets-voice-timers.png",
    title: "Built for one-handed parenting",
    sub: "Voice, widgets and timers for the moments your hands are full.",
    mood: "night"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "11-today-night-overview.png"),
    out: "11-night-mode.png",
    title: "Calmer at 3am",
    sub: "Candlelight night mode for feeds, wakes and quick logs.",
    mood: "night"
  },
  {
    file: path.join(sourceRoot, "google-play-phone-1080x1920", "12-yesterday-night-overview.png"),
    out: "12-yesterday-overview.png",
    title: "Wake up to the story of the night",
    sub: "Review night wakes, patterns and what may have helped.",
    mood: "night"
  }
];

function dims(file) {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
  const width = Number((out.match(/pixelWidth:\s*(\d+)/) || [])[1]);
  const height = Number((out.match(/pixelHeight:\s*(\d+)/) || [])[1]);
  if (!width || !height) throw new Error("Could not read image dimensions for " + file);
  return { width, height };
}

function fileUrl(file) {
  return "file://" + file.replace(/#/g, "%23").replace(/ /g, "%20");
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(item, width, height) {
  const isTallApple = height > 2400;
  const scale = width / 1080;
  const topPad = isTallApple ? 112 * scale : 70 * scale;
  const titleSize = isTallApple ? 78 * scale : 56 * scale;
  const subSize = isTallApple ? 31 * scale : 24 * scale;
  const frameW = Math.round(width * (isTallApple ? 0.78 : 0.74));
  const imgH = Math.round(frameW * height / width);
  const frameRadius = Math.round(width * 0.07);
  const frameTop = Math.round(isTallApple ? 590 * scale : 400 * scale);
  const mood = item.mood || "day";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box}
html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Arial,sans-serif}
body{
  background:
    radial-gradient(circle at 12% 9%,rgba(255,220,188,.78),transparent 30%),
    radial-gradient(circle at 90% 18%,rgba(137,214,227,.55),transparent 34%),
    radial-gradient(circle at 50% 100%,rgba(255,205,220,.50),transparent 32%),
    linear-gradient(160deg,#fff8f2 0%,#effbff 50%,#fff1f7 100%);
  color:#18314e;
}
body.night{
  background:
    radial-gradient(circle at 50% 88%,rgba(239,128,56,.44),transparent 36%),
    radial-gradient(circle at 12% 18%,rgba(84,101,168,.50),transparent 32%),
    radial-gradient(circle at 88% 10%,rgba(95,190,224,.26),transparent 28%),
    linear-gradient(160deg,#07172c 0%,#0d2444 56%,#301d34 100%);
  color:#fff3e7;
}
body.amber{background:radial-gradient(circle at 12% 9%,rgba(255,218,162,.82),transparent 31%),radial-gradient(circle at 90% 18%,rgba(136,216,218,.45),transparent 34%),linear-gradient(160deg,#fff9ef 0%,#fff4dd 45%,#edfaff 100%)}
body.mint{background:radial-gradient(circle at 10% 12%,rgba(202,244,222,.86),transparent 32%),radial-gradient(circle at 92% 18%,rgba(172,224,244,.58),transparent 34%),linear-gradient(160deg,#f9fff9 0%,#effbff 54%,#fff3f8 100%)}
body.blush{background:radial-gradient(circle at 15% 10%,rgba(255,214,229,.88),transparent 34%),radial-gradient(circle at 86% 18%,rgba(178,224,246,.50),transparent 34%),linear-gradient(160deg,#fff7f9 0%,#f4fbff 52%,#fff1e6 100%)}
.wrap{position:relative;width:${width}px;height:${height}px;overflow:hidden;padding:${topPad}px ${Math.round(56*scale)}px 0}
.wrap:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.42),rgba(255,255,255,0) 38%,rgba(255,255,255,.18));pointer-events:none}
.brand{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;margin-bottom:${Math.round(26*scale)}px}
.logo{font-size:${Math.round(34*scale)}px;font-weight:850;letter-spacing:-.025em;color:#74425d}
.night .logo{color:#fff0e5}
.pill{font-size:${Math.round(18*scale)}px;font-weight:850;color:#875a70;border:1px solid rgba(255,255,255,.76);background:rgba(255,255,255,.64);border-radius:999px;padding:${Math.round(10*scale)}px ${Math.round(16*scale)}px;box-shadow:0 ${Math.round(9*scale)}px ${Math.round(24*scale)}px rgba(82,55,70,.10)}
.night .pill{background:rgba(11,27,50,.72);border-color:rgba(255,191,122,.34);color:#ffdcb1}
.copy{position:relative;z-index:3;text-align:center;margin:0 auto;width:94%}
h1{font-size:${titleSize}px;line-height:.96;letter-spacing:-.058em;margin:0 auto ${Math.round(20*scale)}px;font-weight:900;max-width:${Math.round(width*.88)}px}
p{font-size:${subSize}px;line-height:1.27;margin:0 auto;font-weight:680;max-width:${Math.round(width*.82)}px;color:#5b6471}
.night p{color:#e9d6c8}
.phone{position:absolute;z-index:2;left:50%;top:${frameTop}px;transform:translateX(-50%);width:${frameW}px;height:${imgH}px;border-radius:${frameRadius}px;padding:${Math.round(15*scale)}px;background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.26));border:1px solid rgba(255,255,255,.86);box-shadow:0 ${Math.round(42*scale)}px ${Math.round(96*scale)}px rgba(46,61,81,.28),inset 0 1px rgba(255,255,255,.95)}
.night .phone{background:linear-gradient(145deg,rgba(255,179,108,.20),rgba(5,18,38,.76));border-color:rgba(255,183,111,.34);box-shadow:0 ${Math.round(52*scale)}px ${Math.round(110*scale)}px rgba(0,0,0,.44),0 0 ${Math.round(72*scale)}px rgba(238,126,53,.22)}
.phone img{display:block;width:100%;height:100%;object-fit:cover;border-radius:${Math.round(frameRadius*.78)}px}
.footer-glow{position:absolute;left:${Math.round(-80*scale)}px;right:${Math.round(-80*scale)}px;bottom:${Math.round(-130*scale)}px;height:${Math.round(330*scale)}px;background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.72),rgba(255,255,255,0));filter:blur(${Math.round(20*scale)}px)}
.night .footer-glow{background:radial-gradient(ellipse at 50% 50%,rgba(255,133,54,.30),rgba(255,255,255,0));}
</style>
</head>
<body class="${esc(mood)}">
<div class="wrap">
  <div class="brand"><div class="logo">OBubba</div><div class="pill">Baby rhythm tracker</div></div>
  <div class="copy"><h1>${esc(item.title)}</h1><p>${esc(item.sub)}</p></div>
  <div class="phone"><img src="${fileUrl(item.file)}"></div>
  <div class="footer-glow"></div>
</div>
</body>
</html>`;
}

function renderSet(items, outDir, targetDims=null) {
  for (const item of items) {
    if (!fs.existsSync(item.file)) {
      console.warn("Skipping missing source:", item.file);
      continue;
    }
    const sourceDims = dims(item.file);
    const { width, height } = targetDims || sourceDims;
    const htmlPath = path.join(tmpDir, item.out.replace(/\.png$/, ".html"));
    const outPath = path.join(outDir, item.out);
    fs.writeFileSync(htmlPath, html(item, width, height));
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      `--window-size=${width},${height}`,
      `--screenshot=${outPath}`,
      fileUrl(htmlPath)
    ], { stdio: "ignore" });
    console.log(outPath);
  }
}

renderSet(appleSources, appleOut, { width: 1320, height: 2868 });
renderSet(playSources, playOut, { width: 1080, height: 1920 });

for (const file of fs.readdirSync(playUploadOut)) {
  if (file.endsWith(".png")) fs.unlinkSync(path.join(playUploadOut, file));
}
[
  "01-today-dashboard.png",
  "02-voice-log.png",
  "03-nap-not-happening.png",
  "04-todays-insight.png",
  "06-sleep-guidance.png",
  "07-plan-tomorrow.png",
  "08-weaning.png",
  "10-widgets-voice-timers.png"
].forEach(file => {
  fs.copyFileSync(path.join(playOut, file), path.join(playUploadOut, file));
});
console.log("Google Play upload set:", playUploadOut);
