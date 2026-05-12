@echo off
:: This script ensures the Cinematic Design opens correctly
cd /d "%~dp0"
echo Opening FairyTail Forge Studio...
start "" "studio.html"
if %errorlevel% neq 0 (
    echo [ERROR] Could not find studio.html in this folder.
    dir /b studio.html
    pause
)
