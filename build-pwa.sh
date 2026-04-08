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

echo "Build complete."
