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

echo "Copying to dist/..."
cp -f app.js dist/app.js
cp -f app.jsx dist/app.jsx
# Ensure font is in dist so cap copy includes it
cp -f public/Parisienne-Regular.ttf dist/Parisienne-Regular.ttf 2>/dev/null || true

# Cache-bust: update ?v= on all index.html script tags
echo "Cache busting..."
CACHE_V=$(date +%s)
for f in index.html dist/index.html; do
  if [ -f "$f" ]; then
    sed -i '' "s|/app\.js?v=[0-9]*\"|/app.js?v=${CACHE_V}\"|g" "$f"
    sed -i '' "s|/app\.js\"|/app.js?v=${CACHE_V}\"|g" "$f"
  fi
done

# Update service worker revision hash so PWA users get the new version
echo "Updating service worker hash..."
NEW_HASH=$(md5 -q dist/app.js 2>/dev/null || md5sum dist/app.js | cut -d' ' -f1)
if [ -f dist/sw.js ]; then
  sed -i '' "s|{url:\"app.js\",revision:\"[a-f0-9]*\"}|{url:\"app.js\",revision:\"${NEW_HASH}\"}|g" dist/sw.js
  echo "SW hash updated to: $NEW_HASH"
fi

echo "Build complete. Cache version: $CACHE_V"
