@echo off
title FairyTail Forge Debug Launcher
echo ---------------------------------------
echo   FAIRYTAIL FORGE | DEBUG MODE
echo ---------------------------------------
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b
)

:: 2. Check Dependencies
echo [i] Verifying dependencies...
python -c "import PySide6, sqlalchemy, requests, PIL" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Missing libraries. Re-installing...
    pip install -r requirements.txt
)

:: 3. Check Ollama
netstat -ano | findstr :11434 >nul
if %errorlevel% equ 0 (
    echo [OK] Ollama is running.
) else (
    echo [!] Ollama not detected. Please start Ollama first!
)

echo.
echo [>] Starting App (main.py)...
echo ---------------------------------------
:: Run python and KEEP the window open so we see errors
python main.py
if %errorlevel% neq 0 (
    echo.
    echo ---------------------------------------
    echo [CRITICAL ERROR] The app crashed.
    echo Please copy the error text above and send it to me.
)

echo.
echo Press any key to close this window.
pause
