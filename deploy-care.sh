#!/bin/bash
set -e

# Deploy care.html alongside the live OBubba app on Firebase Hosting.
# Run this whenever care.html changes so the live carer portal updates.

echo "→ Copying care.html to hosting outputs..."
cp care.html hosting-care/care.html
cp care.html hosting-care/index.html
npm run build

echo "→ Deploying to Firebase Hosting..."
firebase deploy --only hosting --project obubba-d9ccc

echo "✓ Deployed: https://obubba-d9ccc.web.app/care.html"
