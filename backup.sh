#!/bin/bash
# OBubba Backup System
# Usage:
#   bash backup.sh            — saves current files to latest-working
#   bash backup.sh confirm    — promotes latest-working to confirmed-working
#   bash backup.sh revert     — restores from confirmed-working
set -e
cd "$(dirname "$0")"

LATEST="backups/latest-working"
CONFIRMED="backups/confirmed-working"
DATE=$(date +%Y-%m-%d_%H%M)

case "${1:-save}" in
  save)
    echo "Saving current build to latest-working..."
    cp public/app.jsx "$LATEST/app_${DATE}.jsx"
    cp public/app.js  "$LATEST/app_${DATE}.js"
    cp styles.css     "$LATEST/styles_${DATE}.css"
    # Keep only last 5 backups per folder
    ls -t "$LATEST"/app_*.jsx 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    ls -t "$LATEST"/app_*.js  2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    ls -t "$LATEST"/styles_*.css 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    echo "Saved: $LATEST/app_${DATE}.jsx"
    ;;
  confirm)
    echo "Promoting latest build to confirmed-working..."
    cp public/app.jsx "$CONFIRMED/app_${DATE}.jsx"
    cp public/app.js  "$CONFIRMED/app_${DATE}.js"
    cp styles.css     "$CONFIRMED/styles_${DATE}.css"
    # Keep only last 3 confirmed backups
    ls -t "$CONFIRMED"/app_*.jsx 2>/dev/null | tail -n +4 | xargs rm -f 2>/dev/null || true
    ls -t "$CONFIRMED"/app_*.js  2>/dev/null | tail -n +4 | xargs rm -f 2>/dev/null || true
    ls -t "$CONFIRMED"/styles_*.css 2>/dev/null | tail -n +4 | xargs rm -f 2>/dev/null || true
    echo "Confirmed: $CONFIRMED/app_${DATE}.jsx"
    ;;
  revert)
    LAST_JSX=$(ls -t "$CONFIRMED"/app_*.jsx 2>/dev/null | head -1)
    LAST_JS=$(ls -t "$CONFIRMED"/app_*.js 2>/dev/null | head -1)
    LAST_CSS=$(ls -t "$CONFIRMED"/styles_*.css 2>/dev/null | head -1)
    if [ -z "$LAST_JSX" ]; then echo "No confirmed backup found!"; exit 1; fi
    echo "Reverting to: $LAST_JSX"
    cp "$LAST_JSX" public/app.jsx
    cp "$LAST_JSX" app.jsx
    [ -n "$LAST_JS" ] && cp "$LAST_JS" public/app.js
    [ -n "$LAST_CSS" ] && cp "$LAST_CSS" styles.css
    echo "Reverted. Run build-pwa.sh + cap copy to deploy."
    ;;
  *)
    echo "Usage: bash backup.sh [save|confirm|revert]"
    ;;
esac
