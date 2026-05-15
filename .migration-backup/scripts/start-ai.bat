@echo off
echo ====================================================
echo 🎨 FairyTail Forge - AI Image Engine
echo ====================================================

cd ai-services

if not exist venv (
    echo [1/3] Creating fresh virtual environment...
    python -m venv venv
)

echo [2/3] Activating environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b
)

echo [3/3] Syncing AI libraries (this ensures stability)...
pip install -r requirements.txt --quiet

echo ====================================================
echo 🚀 Starting Engine... (Model loading takes ~30s)
python main.py
pause
