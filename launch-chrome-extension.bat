@echo off
echo ========================================================
echo  Launching Google Chrome with moviehub.stream Extension...
echo ========================================================
start chrome.exe --load-extension="%~dp0extension" "https://moviehub.stream/"
