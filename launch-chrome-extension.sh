#!/usr/bin/env bash
# MovieBox Plus - 1-Click Google Chrome Extension Launcher
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="$DIR/extension"

echo "========================================================"
echo " Launching Google Chrome with MovieBox Plus Extension..."
echo "========================================================"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open -a "Google Chrome" --args --load-extension="$EXT_DIR" "https://netmirror-plus.vercel.app/"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  google-chrome --load-extension="$EXT_DIR" "https://netmirror-plus.vercel.app/" &
else
  echo "Please use launch-chrome-extension.bat on Windows."
fi
