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

echo [2/3] Setting up AI Services...
cd ai-services
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo [3/3] Setting up Frontend...
cd frontend
npm install
npx prisma generate
cd ..

echo ====================================================
echo ✅ Setup Complete!
echo To start: 
echo 1. Run scripts\start-ai.bat
echo 2. Run scripts\start-app.bat
echo ====================================================
pause
