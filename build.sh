#!/bin/bash
# Build + sync script — keeps all 5 bundle locations in sync
set -e
cd "$(dirname "$0")"
echo "→ Compiling app.jsx → app.js"
node -e "const b=require('@babel/core'),f=require('fs');const r=b.transformSync(f.readFileSync('app.jsx','utf8'),{plugins:['@babel/plugin-transform-react-jsx'],filename:'app.jsx'});f.writeFileSync('app.js',r.code);"
echo "→ Syncing app.js + app.jsx + styles.css to all bundle paths"
cp app.js public/app.js
cp app.js ios/App/App/public/app.js 2>/dev/null || true
cp app.js android/app/src/main/assets/public/app.js 2>/dev/null || true
cp app.js dist/app.js
cp app.jsx dist/app.jsx
# styles.css MUST be synced too — without this, any CSS change (new classes,
# keyframes, variable values) never reaches the device, and the iOS WebView
# silently serves a stale stylesheet while the JS is fresh. This was the
# "depth/motion/hero-bg changes didn't land" bug — JS referenced classes
# the device's CSS didn't know about.
cp styles.css public/styles.css 2>/dev/null || true
cp styles.css ios/App/App/public/styles.css 2>/dev/null || true
cp styles.css android/app/src/main/assets/public/styles.css 2>/dev/null || true
cp styles.css dist/styles.css 2>/dev/null || true
# Bump the ?v= cache-buster on every app.js AND styles.css <link/script> tag
# so the iOS/Android WebView doesn't serve a stale cached bundle against the
# old query string. Without this, rebuilt code silently won't reach the device.
V=$(date +%s)
echo "→ Bumping cache-buster to v=$V"
for F in index.html public/index.html ios/App/App/public/index.html android/app/src/main/assets/public/index.html dist/index.html; do
  if [ -f "$F" ]; then
    # macOS sed needs -i '' (empty backup suffix).
    sed -i '' -E "s|(app\.js\?v=)[0-9]+|\1$V|g" "$F"
    sed -i '' -E "s|(styles\.css\?v=)[0-9]+|\1$V|g" "$F"
    # If styles.css reference has no ?v= yet, add one so future builds can bump it.
    sed -i '' -E "s|(href=\"/?styles\.css)(\"[^>]*>)|\1?v=$V\2|g" "$F"
  fi
done
echo "→ Running cap sync"
LANG=en_GB.UTF-8 LC_ALL=en_GB.UTF-8 npx cap sync 2>&1 | tail -5
echo "✓ All bundles synced"
