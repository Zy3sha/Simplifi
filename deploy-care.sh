#!/bin/bash
set -e

# Deploy care.html to Firebase Hosting (obubba-d9ccc.web.app)
# Run this whenever care.html changes so the live carer portal updates.

echo "→ Copying care.html to hosting-care/..."
cp care.html hosting-care/care.html
cp care.html hosting-care/index.html

echo "→ Deploying to Firebase Hosting..."
firebase deploy --only hosting --project obubba-d9ccc

echo "✓ Deployed: https://obubba-d9ccc.web.app/care.html"
