@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo ✨ FairyTail Forge - Setup Wizard
echo ====================================================

echo [1/3] Checking Prerequisites...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found. Please install Node.js 18+
    pause
    exit /b
)

echo [2/3] Preparing Database...
cd frontend
npx prisma generate
cd ..

echo [3/3] Setting up Frontend...
cd frontend
npm install
cd ..

echo ====================================================
echo ✅ Setup Complete!
echo To start: 
echo 1. Start AUTOMATIC1111 with --api
echo 2. Run scripts\start-app.bat
echo ====================================================
pause
