"""
launch.py — one-click launcher that checks services before starting the UI.
"""
import subprocess
import sys
import time

import requests


def wait_for_service(url: str, name: str, retries: int = 5) -> bool:
    for i in range(retries):
        try:
            requests.get(url, timeout=3)
            print(f"✅  {name} is online")
            return True
        except Exception:
            print(f"⏳  Waiting for {name}… ({i+1}/{retries})")
            time.sleep(2)
    print(f"⚠️   {name} not detected — the app will still launch.")
    return False


if __name__ == "__main__":
    print("\n✦  FairyTail-Forge Launcher")
    print("─" * 40)
    print("Checking local services…\n")

    wait_for_service("http://localhost:11434/api/tags",  "Ollama")
    wait_for_service("http://127.0.0.1:8188/system_stats", "ComfyUI")

    print("\nStarting FairyTail-Forge UI…\n")
    subprocess.run([sys.executable, "main.py"])
