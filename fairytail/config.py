"""Central runtime configuration for FairyTail-Forge."""
import os
from pathlib import Path

# ── Service endpoints ──────────────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
COMFYUI_BASE_URL = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8188")

# ── Default models ─────────────────────────────────────────────────────────────
DEFAULT_LLM_MODEL   = os.getenv("FAIRYTAIL_LLM",   "qwen2.5:3b")
DEFAULT_IMAGE_MODEL = os.getenv("FAIRYTAIL_IMAGE",  "sdxl")   # ComfyUI checkpoint alias

# ── Paths ──────────────────────────────────────────────────────────────────────
APP_DIR      = Path.home() / ".fairytail_forge"
PROJECTS_DIR = APP_DIR / "projects"
ASSETS_DIR   = APP_DIR / "assets"
DB_PATH      = APP_DIR / "fairytail.db"

for _d in (APP_DIR, PROJECTS_DIR, ASSETS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# ── Comic defaults ─────────────────────────────────────────────────────────────
DEFAULT_PANELS       = 4
MAX_PANELS           = 12
IMAGE_WIDTH          = 768
IMAGE_HEIGHT         = 512
DEFAULT_STEPS        = 25
DEFAULT_CFG          = 7.5
DEFAULT_SAMPLER      = "dpmpp_2m"
DEFAULT_SCHEDULER    = "karras"

NEGATIVE_PROMPT = (
    "low quality, blurry, bad anatomy, extra limbs, distorted face, "
    "watermark, text, cropped, worst quality, jpeg artifacts, deformed"
)

# ── Master comic-writing system prompt ────────────────────────────────────────
COMIC_SYSTEM_PROMPT = """\
You are an AI comic generation engine. Your task: Generate cinematic comic scripts with highly visual scenes.

Rules:
• Keep character appearance consistent
• Keep clothing consistent
• Describe camera angles
• Describe lighting
• Describe emotions
• Describe environment
• Generate concise dialogue
• Create strong cinematic pacing
• Keep panel descriptions detailed
• Maintain story continuity

Output format:
PANEL 1:
Scene:
Camera:
Characters:
Emotion:
Dialogue:
Image Prompt:

PANEL 2:
(and so on...)
"""

IMAGE_PROMPT_TEMPLATE = """\
masterpiece, cinematic comic panel, high detail, dramatic lighting, consistent character, comic art style, clean lineart, dynamic pose, professional illustration, detailed environment, storytelling composition
Character: {character}
Scene: {scene}
Camera: {camera}
Emotion: {emotion}
Style: comic book, graphic novel, cinematic
Negative Prompt: low quality, blurry, bad anatomy, extra limbs, distorted face, watermark, text, cropped
"""
