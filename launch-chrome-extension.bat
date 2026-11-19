@echo off
echo ========================================================
echo  Launching Google Chrome with MovieBox Plus Extension...
echo ========================================================
start chrome.exe --load-extension="%~dp0extension" "https://netmirror-plus.vercel.app/"
