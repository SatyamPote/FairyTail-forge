@echo off
echo Starting FairyTail Forge Frontend...
:: Change to the directory of the script, then to the frontend folder
cd /d "%~dp0\..\frontend"
npm run dev
pause
