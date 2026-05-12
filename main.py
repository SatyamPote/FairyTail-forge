"""Entry point for FairyTail-Forge — Integrated Engine Version."""
import sys
import subprocess
import time
import os
import signal
import traceback
from pathlib import Path

def start_engine():
    """Start the internal ComfyUI engine as a background process."""
    engine_path = Path(__file__).parent / "engine" / "comfyui" / "main.py"
    if not engine_path.exists():
        print(f"[!] Engine missing at {engine_path}")
        return None

    print("[i] Starting internal ComfyUI engine...")
    # Use the same python executable as the app
    cmd = [sys.executable, str(engine_path), "--listen", "127.0.0.1", "--port", "8188", "--lowvram"]
    
    # Run in background, suppress window on Windows if desired
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
    )
    return process

def run_app():
    engine_process = None
    try:
        # 1. Start Engine
        engine_process = start_engine()
        
        # 2. Start UI
        from fairytail.app import run
        run()
        
    except Exception as e:
        with open("error_log.txt", "w") as f:
            f.write("FairyTail Forge - Startup Error\n")
            f.write("----------------------------\n")
            traceback.print_exc(file=f)
        print("\n[!] CRITICAL ERROR: App failed to start.")
        traceback.print_exc()
    finally:
        # 3. Cleanup Engine
        if engine_process:
            print("[i] Shutting down internal engine...")
            engine_process.terminate()
            try:
                engine_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                engine_process.kill()

if __name__ == "__main__":
    run_app()
