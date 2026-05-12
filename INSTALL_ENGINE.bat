@echo off
title FairyTail Forge - Engine Installer
echo ---------------------------------------
echo   INSTALLING INTERNAL COMFYUI ENGINE...
echo ---------------------------------------
echo.
echo [1/2] Installing ComfyUI core requirements...
python -m pip install -r engine/comfyui/requirements.txt
echo.
echo [2/2] Installing AI Comic Forge requirements...
python -m pip install PySide6 SQLAlchemy requests pillow
echo.
echo ---------------------------------------
echo   INSTALLATION COMPLETE!
echo   Next Step: Place your models in:
echo   engine/comfyui/models/checkpoints/
echo ---------------------------------------
pause
