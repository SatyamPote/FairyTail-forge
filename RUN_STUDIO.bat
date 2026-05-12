@echo off
echo =======================================
echo   FAIRYTAIL FORGE - EMERGENCY RUN
echo =======================================
echo.
echo Python Path:
where python
echo.
echo Attempting to run main.py...
echo ---------------------------------------
python main.py
echo ---------------------------------------
echo.
if %errorlevel% neq 0 (
    echo [!] Something went wrong. 
    echo [i] Checking if error_log.txt was created...
    if exist error_log.txt (
        echo [!] Error log found! Please send me the contents of error_log.txt
    )
)
echo.
echo This window will NOT close until you press a key.
pause
