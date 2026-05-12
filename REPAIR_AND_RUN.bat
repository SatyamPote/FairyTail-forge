@echo off
title FairyTail Forge - Repair & Run
echo ---------------------------------------
echo   REPAIRING & STARTING STUDIO...
echo ---------------------------------------
echo.

:: 1. Force the correct directory
cd /d "%~dp0"

:: 2. Set Python environment
set PYTHONPATH=%cd%

:: 3. Try to run the app
echo [>] Starting main.py...
python main.py

:: 4. If it fails, don't just close!
if %errorlevel% neq 0 (
    echo.
    echo ---------------------------------------
    echo [!] THE APP CRASHED.
    echo.
    echo [TIP] Double-click "View Studio Design.bat" to see the UI.
    echo.
    echo Error details (if any):
    if exist error_log.txt (
        type error_log.txt
    ) else (
        echo No log file found.
    )
    echo ---------------------------------------
    pause
)
