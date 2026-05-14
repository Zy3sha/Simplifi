const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const generatedDirs = [
  "public",
  "dist",
  "ios/App/App/public",
  "android/app/src/main/assets/public",
];
const hostedRequiredFiles = [
  "public/care.html",
  "dist/care.html",
  "hosting-care/privacy.html",
  "hosting-care/terms.html",
];
const nativeSourceDirs = [
  "ios/App/App",
  "android/app/src/main/res",
];
const buildOutputDirs = [
  "build",
  "android/app/build",
];
const packageArchives = [
  "android/app/build/outputs/bundle/release/app-release.aab",
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    out.push(full);
    if (fs.statSync(full).isDirectory()) walk(full, out);
  }
  return out;
}

const duplicateCopies = generatedDirs.flatMap(rel =>
  walk(path.join(root, rel))
    .filter(file => / [0-9]+(?:\.[^/]+)?$/.test(file))
    .map(file => path.relative(root, file))
);
const nativeDuplicateCopies = nativeSourceDirs.flatMap(rel =>
  walk(path.join(root, rel))
    .filter(file => / [0-9]+(?:\.[^/]+)?$/.test(file))
    .map(file => path.relative(root, file))
);
const buildOutputDuplicateCopies = buildOutputDirs.flatMap(rel =>
  walk(path.join(root, rel))
    .filter(file => / [0-9]+(?:\.[^/]+)?$/.test(file))
    .map(file => path.relative(root, file))
);
const archiveDuplicateCopies = packageArchives.flatMap(rel => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  const listed = spawnSync("jar", ["tf", full], { encoding: "utf8" });
  if (listed.status !== 0) {
    console.error(`Unable to inspect package archive ${rel}:`);
    console.error((listed.stderr || listed.stdout || "").trim());
    process.exit(1);
  }
  return listed.stdout
    .split(/\r?\n/)
    .filter(entry => / [0-9]+(?:\.[^/]+)?$/.test(entry))
    .map(entry => `${rel}:${entry}`);
});

if (duplicateCopies.length || nativeDuplicateCopies.length || buildOutputDuplicateCopies.length || archiveDuplicateCopies.length) {
  console.error("Finder-style duplicate artifacts found:");
  [...duplicateCopies, ...nativeDuplicateCopies, ...buildOutputDuplicateCopies, ...archiveDuplicateCopies].forEach(file => console.error("✗ " + file));
  process.exit(1);
}

const staleViteArtifacts = [
  "dist/assets",
  "dist/registerSW.js",
  "ios/App/App/public/assets",
  "ios/App/App/public/registerSW.js",
  "android/app/src/main/assets/public/assets",
  "android/app/src/main/assets/public/registerSW.js",
].filter(rel => fs.existsSync(path.join(root, rel)));

for (const rel of ["dist", "ios/App/App/public", "android/app/src/main/assets/public"]) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (/^workbox-[A-Za-z0-9_-]+\.js$/.test(name)) staleViteArtifacts.push(path.join(rel, name));
  }
}

const serviceWorkerFiles = [
  "public/sw.js",
  "dist/sw.js",
  "ios/App/App/public/sw.js",
  "android/app/src/main/assets/public/sw.js",
];

const staleServiceWorkers = serviceWorkerFiles.filter(rel => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return true;
  const source = fs.readFileSync(full, "utf8");
  return !source.includes("OBubba Service Worker") || /workbox-[A-Za-z0-9_-]+\.js|define\(\[\"\.\/workbox/.test(source);
});

const serviceWorkerSafetyIssues = serviceWorkerFiles.filter(rel => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return true;
  const source = fs.readFileSync(full, "utf8");
  return !source.includes("function safePushText(value, fallback, maxLen)") ||
    !source.includes("function safeOpenUrl(value)") ||
    !source.includes("function safeNotificationData(value)") ||
    !source.includes("function safeNotificationActions(actions)") ||
    !source.includes("const urlToOpen = safeOpenUrl(event.notification.data && event.notification.data.url);") ||
    source.includes("event.notification.data?.url || '/'") ||
    source.includes("showNotification(data.title, options)") ||
    source.includes("actions: data.actions ||");
});
const missingHostedFiles = hostedRequiredFiles.filter(rel => !fs.existsSync(path.join(root, rel)));
const firebaseConfig = fs.readFileSync(path.join(root, "firebase.json"), "utf8");
const indexFiles = ["index.html", "public/index.html", "dist/index.html"].filter(rel => fs.existsSync(path.join(root, rel)));
const nativeAppIndexFiles = [
  "dist/index.html",
  "ios/App/App/public/index.html",
  "android/app/src/main/assets/public/index.html",
].filter(rel => fs.existsSync(path.join(root, rel)));
const manifestFiles = ["manifest.json", "public/manifest.json", "dist/manifest.json"].filter(rel => fs.existsSync(path.join(root, rel)));
const iosAppIconContents = fs.readFileSync(path.join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json"), "utf8");
const androidLauncherBackground = fs.readFileSync(path.join(root, "android/app/src/main/res/drawable/ic_launcher_background.xml"), "utf8");
const iosProject = fs.readFileSync(path.join(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
const missingFaviconLinks = indexFiles.filter(rel =>
  !/<link rel="icon" type="image\/png" href="\/?icon\.png"\/>/.test(fs.readFileSync(path.join(root, rel), "utf8"))
);
const brokenNativeAppIndexes = nativeAppIndexFiles.filter(rel => {
  const source = fs.readFileSync(path.join(root, rel), "utf8");
  return !source.includes('<div id="root"></div>') ||
    !source.includes('/app.js?v=') ||
    source.includes('class="poster-shell"') ||
    source.includes('src="/obubba-download-landing.png"');
});
const unsupportedFontPreloads = indexFiles.filter(rel =>
  fs.readFileSync(path.join(root, rel), "utf8").includes('type="font/truetype"')
);
const badScopeExtensions = manifestFiles.filter(rel => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  return Array.isArray(manifest.scope_extensions) &&
    manifest.scope_extensions.some(item => item && item.origin && item.type !== "origin");
});

if (staleViteArtifacts.length) {
  console.error("Stale Vite/PWA artifacts found in custom build output:");
  staleViteArtifacts.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (staleServiceWorkers.length) {
  console.error("Stale or missing service workers found in generated outputs:");
  staleServiceWorkers.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (serviceWorkerSafetyIssues.length) {
  console.error("Unsafe service worker notification handling found:");
  serviceWorkerSafetyIssues.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (missingHostedFiles.length) {
  console.error("Required hosted legal pages are missing:");
  missingHostedFiles.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (!firebaseConfig.includes('"cleanUrls": true')) {
  console.error("Firebase hosting must serve clean legal URLs such as /privacy and /terms.");
  process.exit(1);
}

if (!firebaseConfig.includes('"public": "public"')) {
  console.error("Firebase hosting must deploy the live app output so Bubba Care does not replace the app root.");
  process.exit(1);
}

if (missingFaviconLinks.length) {
  console.error("Index files must declare icon.png as the favicon to avoid browser /favicon.ico 404s:");
  missingFaviconLinks.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (brokenNativeAppIndexes.length) {
  console.error("Native packaged index files must boot the app shell, not the marketing landing page:");
  brokenNativeAppIndexes.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (unsupportedFontPreloads.length) {
  console.error("Font preload type must be font/ttf to avoid Chrome preload warnings:");
  unsupportedFontPreloads.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (badScopeExtensions.length) {
  console.error("Manifest scope_extensions entries must include type:\"origin\" to avoid install-time warnings:");
  badScopeExtensions.forEach(file => console.error("✗ " + file));
  process.exit(1);
}

if (!iosAppIconContents.includes('"filename" : "obubba-happy.png"') || !androidLauncherBackground.includes('android:fillColor="#FFFFFF"') || androidLauncherBackground.includes("#F0DDD6")) {
  console.error("Native launcher icons must use the white happy-baby app icon background.");
  process.exit(1);
}

const stripXattrPhaseCount = (iosProject.match(/Strip extended attributes before signing/g) || []).length;
if (stripXattrPhaseCount < 4 || !iosProject.includes('/usr/bin/xattr -cr \\"${CODESIGNING_FOLDER_PATH}\\"')) {
  console.error("iOS targets must strip extended attributes before codesign so Finder metadata cannot break phone builds.");
  process.exit(1);
}

console.log("✓ generated asset directories have no Finder-style duplicate copies");
console.log("✓ native source directories have no Finder-style duplicate copies");
console.log("✓ build output directories have no Finder-style duplicate copies");
console.log("✓ package archives have no Finder-style duplicate copies");
console.log("✓ custom build outputs do not contain stale Vite/PWA artifacts");
console.log("✓ generated service workers use the custom OBubba worker");
console.log("✓ service worker notification payloads are bounded and same-origin");
console.log("✓ hosted legal pages are present and clean URLs are enabled");
console.log("✓ favicon and manifest install metadata are clean");
console.log("✓ native packaged indexes boot the app shell");
console.log("✓ native launcher icons use the white happy-baby background");
console.log("✓ iOS device builds strip Finder metadata before codesign");
console.log("Build artifact audit passed.");
