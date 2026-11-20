#!/usr/bin/env bash
# moviehub.stream - 1-Click Browser Extension Launcher (Chrome, Brave, Edge)
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="$DIR/extension"

echo "=========================================================="
echo " Launching Browser with moviehub.stream Extension..."
echo "=========================================================="

if [[ "$OSTYPE" == "darwin"* ]]; then
  if pgrep -x "Brave Browser" >/dev/null || ([ ! $(pgrep -x "Google Chrome") ] && [ -d "/Applications/Brave Browser.app" ]); then
    echo "Opening Brave Browser with moviehub.stream extension..."
    open -a "Brave Browser" --args --load-extension="$EXT_DIR" "https://moviehub.stream/"
  elif [ -d "/Applications/Google Chrome.app" ]; then
    echo "Opening Google Chrome with moviehub.stream extension..."
    open -a "Google Chrome" --args --load-extension="$EXT_DIR" "https://moviehub.stream/"
  elif [ -d "/Applications/Microsoft Edge.app" ]; then
    echo "Opening Microsoft Edge with moviehub.stream extension..."
    open -a "Microsoft Edge" --args --load-extension="$EXT_DIR" "https://moviehub.stream/"
  else
    open "https://moviehub.stream/"
  fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if which brave-browser >/dev/null 2>&1; then
    brave-browser --load-extension="$EXT_DIR" "https://moviehub.stream/" &
  elif which google-chrome >/dev/null 2>&1; then
    google-chrome --load-extension="$EXT_DIR" "https://moviehub.stream/" &
  elif which chromium-browser >/dev/null 2>&1; then
    chromium-browser --load-extension="$EXT_DIR" "https://moviehub.stream/" &
  else
    xdg-open "https://moviehub.stream/"
  fi
else
  echo "Please use launch-chrome-extension.bat on Windows."
fi
