#!/usr/bin/env bash
# Regenerates public/og.png (1200x630) from scripts/og/og.html. Needs Google Chrome or Chromium.
# Run from frontend/:  bash scripts/og/make-og.sh
set -euo pipefail
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}"
"$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --window-size=1200,630 --virtual-time-budget=3000 \
  --screenshot=public/og.png "file://$PWD/scripts/og/og.html"
