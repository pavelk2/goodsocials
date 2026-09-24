#!/bin/sh
# Renders every ad at 400x400, at 2x (800x800) for upload, and at the ~155px
# the ad card shows, to check it still reads.
S=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
cd "$(dirname "$0")"
mkdir -p preview
for f in *.html; do
  n=${f%.html}
  for spec in "1 $n.png" "2 $n@2x.png" "0.39 preview/$n-155.png"; do
    set -- $spec
    $S --no-sandbox --hide-scrollbars --allow-file-access-from-files --virtual-time-budget=5000 \
      --window-size=400,400 --force-device-scale-factor=$1 --screenshot="$PWD/$2" "file://$PWD/$f" 2>/dev/null
  done
done
