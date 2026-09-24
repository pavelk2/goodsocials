#!/bin/sh
# Renders every ad at 400x400 and at 2x (800x800) for upload.
S=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
cd "$(dirname "$0")"
for f in *.html; do
  n=${f%.html}
  $S --no-sandbox --hide-scrollbars --allow-file-access-from-files --virtual-time-budget=5000 --window-size=400,400 --screenshot="$PWD/$n.png" "file://$PWD/$f" 2>/dev/null
  $S --no-sandbox --hide-scrollbars --allow-file-access-from-files --virtual-time-budget=5000 --window-size=400,400 --force-device-scale-factor=2 --screenshot="$PWD/$n@2x.png" "file://$PWD/$f" 2>/dev/null
done
