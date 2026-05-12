@echo off
echo Starting TinySD Inference Service...
cd /d "%~dp0\..\ai-services"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
python main.py
pause
