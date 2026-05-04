#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

const bannedRawPhotoSources = [
  "src={activeChild.photo",
  "src={ac.photo",
  "src={r.photo",
  "src={viewPhoto.dataUrl",
  "src={sharePreview.dataUrl",
  "src={showPhotoCrop",
  "img.src=showPhotoCrop",
  "eImg.src=extraPhotoUrl",
  "_msImg.src = _msData.photo"
];

assert("main app has a shared safe image source helper", app.includes("const safeAppImageSrc =") && app.includes("SAFE_APP_IMAGE_MAX_CHARS"));
assert("safe image helper allows local raster baby photos but not SVG data URLs", app.includes("data:image\\/(?:png|jpe?g|webp|gif|heic|heif)") && !app.includes("image\\/svg"));
assert("safe image helper only allows bundled app raster assets as plain paths", app.includes("obubba-(?:happy|thinking|loading|celebration)") && app.includes("sleep-baby|og-image"));

for (const pattern of bannedRawPhotoSources) {
  assert(`raw photo source is not used: ${pattern}`, !app.includes(pattern));
}

assert("profile and child switcher avatars use safe image sources", app.includes('safeAppImageSrc(activeChild.photo,"obubba-happy.png")') && app.includes('safeAppImageSrc(activeChild.photo, "")'));
assert("archived child and memorial photos use safe image sources", app.includes("safeAppImageSrc(ac.photo, \"\")") && app.includes("const _mPhoto = safeAppImageSrc(_mc.photo, \"\")"));
assert("photo crop and viewer overlays use safe image sources", app.includes("setShowPhotoCrop(safeCropSrc)") && app.includes('safeAppImageSrc(viewPhoto.dataUrl, "obubba-happy.png")'));
assert("share-card canvas loaders reject unsafe image sources", app.includes('const safeSrc = safeAppImageSrc(src, "")') && app.includes('rej(new Error("unsafe-image-src"))'));
assert("share-card profile art falls back to celebration OBubba", app.includes('const _profilePhotoSrc = safeAppImageSrc(activeChild && activeChild.photo, "obubba-celebration.png")'));
assert("daily recap canvas image inputs are sanitized", app.includes('const photoSrc=safeAppImageSrc(activeChild?.photo, "")') && app.includes('const safeExtraPhotoUrl = safeAppImageSrc(extraPhotoUrl, "")'));
assert("daily recap uses the sanitized photo source variable", app.includes("img.src=photoSrc") && app.includes('const photoSrc=safeAppImageSrc(activeChild?.photo, "")'));
assert("share preview image is sanitized before render share and download", app.includes("const safeShareImageDataUrl =") && app.includes("src={safeShareImageDataUrl(sharePreview.dataUrl)}") && app.includes("const _shareImageSrc = safeShareImageDataUrl(sharePreview.dataUrl);") && app.includes("a.href=_shareImageSrc"));

console.log("App image safety audit passed.");
