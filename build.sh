#!/bin/bash
# Build + sync script — keeps all 5 bundle locations in sync
set -e
cd "$(dirname "$0")"
echo "→ Compiling app.jsx → app.js"
node -e "const b=require('@babel/core'),f=require('fs');const r=b.transformSync(f.readFileSync('app.jsx','utf8'),{plugins:['@babel/plugin-transform-react-jsx'],filename:'app.jsx'});f.writeFileSync('app.js',r.code);"
echo "→ Syncing app.js + app.jsx to all bundle paths"
cp app.js public/app.js
cp app.js ios/App/App/public/app.js 2>/dev/null || true
cp app.js android/app/src/main/assets/public/app.js 2>/dev/null || true
cp app.jsx dist/app.jsx
echo "→ Running cap sync"
LANG=en_GB.UTF-8 LC_ALL=en_GB.UTF-8 npx cap sync 2>&1 | tail -5
echo "✓ All bundles synced"
