#!/bin/bash
set -e

echo "Building app.jsx → app.js (Babel transform)..."

echo "Cleaning duplicate generated artifacts..."
./tools/clean-duplicate-artifacts.sh
rm -rf dist/assets public/assets ios/App/App/public/assets android/app/src/main/assets/public/assets
rm -f dist/registerSW.js public/registerSW.js ios/App/App/public/registerSW.js android/app/src/main/assets/public/registerSW.js
rm -f dist/workbox-*.js public/workbox-*.js ios/App/App/public/workbox-*.js android/app/src/main/assets/public/workbox-*.js

node -e "
const b=require('@babel/core'), f=require('fs');
const r=b.transformSync(f.readFileSync('app.jsx','utf8'),{
  plugins:[
    require('@babel/plugin-syntax-jsx'),
    require('@babel/plugin-transform-react-jsx')
  ],
  filename:'app.jsx'
});
const syncV2ShadowBuildFlag = process.env.VITE_OB_SYNC_V2_SHADOW === '1' ? '1' : '0';
r.code = r.code.replaceAll('__OB_SYNC_V2_SHADOW_BUILD__', syncV2ShadowBuildFlag);
const syncV2ReadShadowBuildFlag = process.env.VITE_OB_SYNC_V2_READ_SHADOW === '1' ? '1' : '0';
r.code = r.code.replaceAll('__OB_SYNC_V2_READ_SHADOW_BUILD__', syncV2ReadShadowBuildFlag);
f.writeFileSync('app.js', r.code);
console.log('Compiled: app.js written (' + r.code.length + ' chars)');
"

echo "Minifying app.js for faster load on mobile..."
npx terser app.js -o app.min.js --compress --mangle 2>/dev/null || cp app.js app.min.js
echo "Minified: $(wc -c < app.js) → $(wc -c < app.min.js) bytes"

echo "Copying to public/app.js..."
cp app.min.js public/app.js
cp app.jsx public/app.jsx
cp -f styles.css public/styles.css
cp -f i18n.js public/i18n.js
cp -f loader.js public/loader.js
cp -f native-plugins.js public/native-plugins.js
cp -f firebase.js public/firebase.js
cp -f care.html public/care.html
cp -f __clear-preview-cache.html public/__clear-preview-cache.html
mkdir -p hosting-care
cp -f care.html hosting-care/care.html
cp -f care.html hosting-care/index.html

echo "Copying vendored runtime..."
mkdir -p public/vendor dist/vendor
cp -f node_modules/react/umd/react.production.min.js public/vendor/react.production.min.js
cp -f node_modules/react-dom/umd/react-dom.production.min.js public/vendor/react-dom.production.min.js
cp -f public/vendor/react.production.min.js dist/vendor/react.production.min.js
cp -f public/vendor/react-dom.production.min.js dist/vendor/react-dom.production.min.js
for runtime in \
  public/vendor/react.production.min.js \
  public/vendor/react-dom.production.min.js \
  dist/vendor/react.production.min.js \
  dist/vendor/react-dom.production.min.js
do
  if [ ! -s "$runtime" ]; then
    echo "Vendored runtime missing or empty: $runtime" >&2
    exit 1
  fi
done

echo "Copying to dist/..."
cp -f public/index.html dist/index.html
cp -f public/manifest.json dist/manifest.json
cp -f public/icon.png dist/icon.png 2>/dev/null || true
mkdir -p dist/icons
cp -f public/icons/*.png dist/icons/ 2>/dev/null || true
cp -f app.min.js dist/app.js
cp -f app.jsx dist/app.jsx
cp -f styles.css dist/styles.css
cp -f i18n.js dist/i18n.js
cp -f loader.js dist/loader.js
cp -f native-plugins.js dist/native-plugins.js
cp -f firebase.js dist/firebase.js
cp -f care.html dist/care.html
cp -f __clear-preview-cache.html dist/__clear-preview-cache.html
# Ensure font is in dist so cap copy includes it
cp -f public/Parisienne-Regular.ttf dist/Parisienne-Regular.ttf 2>/dev/null || true

# Cache-bust: update ?v= on all index.html script tags
echo "Cache busting..."
CACHE_V=$(date +%s)
for f in index.html public/index.html dist/index.html; do
  if [ -f "$f" ]; then
    sed -i '' "s|/app\.js?v=[0-9]*\"|/app.js?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|/app\.js\"|/app.js?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|/i18n\.js?v=[0-9]*\"|/i18n.js?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|/i18n\.js\"|/i18n.js?v=${CACHE_V}\"|g" "$f"
    if ! grep -q "i18n\.js" "$f"; then
      perl -0pi -e "s|(\\n  <!-- Styles -->)|\\n  <!-- Localisation -->\\n  <script src=\"/i18n.js?v=${CACHE_V}\"></script>\\n\\1|" "$f"
    fi
    sed -i '' "s|styles\.css?v=[0-9]*\"|styles.css?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|styles\.css\"|styles.css?v=${CACHE_V}\"|g" "$f"
  fi
done

# Update service worker cache name so PWA users get the new version
echo "Updating service worker cache version..."
if [ -f sw.js ]; then
  sed -i '' "s|obubba-v[0-9]*|obubba-v${CACHE_V}|g" sw.js
  echo "SW cache version: obubba-v${CACHE_V}"
fi
# Copy sw.js to generated outputs so they are always in sync.
cp -f sw.js public/sw.js
cp -f sw.js dist/sw.js

if [ -f tools/render-seo.mjs ]; then
  echo "Rendering SEO pages, blog, sitemap, robots and llms.txt..."
  node tools/render-seo.mjs
fi

echo "Final duplicate artifact sweep..."
./tools/clean-duplicate-artifacts.sh

echo "Build complete. Cache version: $CACHE_V"
