#!/bin/bash
set -e

echo "Building app.jsx → app.js (Babel transform)..."

node -e "
const b=require('@babel/core'), f=require('fs');
const r=b.transformSync(f.readFileSync('app.jsx','utf8'),{
  plugins:[
    require('@babel/plugin-syntax-jsx'),
    require('@babel/plugin-transform-react-jsx')
  ],
  filename:'app.jsx'
});
f.writeFileSync('app.js', r.code);
console.log('Compiled: app.js written (' + r.code.length + ' chars)');
"

echo "Copying to public/app.js..."
cp app.js public/app.js
cp app.jsx public/app.jsx
cp -f styles.css public/styles.css
cp -f loader.js public/loader.js
cp -f native-plugins.js public/native-plugins.js

echo "Copying vendored runtime..."
mkdir -p public/vendor dist/vendor
cp -f node_modules/react/umd/react.production.min.js public/vendor/react.production.min.js
cp -f node_modules/react-dom/umd/react-dom.production.min.js public/vendor/react-dom.production.min.js
cp -f public/vendor/react.production.min.js dist/vendor/react.production.min.js
cp -f public/vendor/react-dom.production.min.js dist/vendor/react-dom.production.min.js

echo "Copying to dist/..."
cp -f public/index.html dist/index.html
cp -f app.js dist/app.js
cp -f app.jsx dist/app.jsx
cp -f styles.css dist/styles.css
cp -f loader.js dist/loader.js
cp -f native-plugins.js dist/native-plugins.js
# Ensure font is in dist so cap copy includes it
cp -f public/Parisienne-Regular.ttf dist/Parisienne-Regular.ttf 2>/dev/null || true

# Cache-bust: update ?v= on all index.html script tags
echo "Cache busting..."
CACHE_V=$(date +%s)
for f in index.html public/index.html dist/index.html; do
  if [ -f "$f" ]; then
    sed -i '' "s|/app\.js?v=[0-9]*\"|/app.js?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|/app\.js\"|/app.js?v=${CACHE_V}\"|g" "$f"
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
# Copy sw.js to public/ so it's always in sync
cp -f sw.js public/sw.js

echo "Build complete. Cache version: $CACHE_V"
