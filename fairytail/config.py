"""Central runtime configuration for FairyTail-Forge."""
import os
from pathlib import Path

# ── Service endpoints ──────────────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
COMFYUI_BASE_URL = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8188")

# ── Default models ─────────────────────────────────────────────────────────────
DEFAULT_LLM_MODEL   = os.getenv("FAIRYTAIL_LLM",   "qwen3:8b")
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
You are a cinematic AI comic-writing engine specialised in graphic novel storytelling.

Rules:
- Keep character appearance, clothing, and colour palette CONSISTENT across all panels.
- Describe camera angles (close-up, wide shot, bird's-eye, worm's-eye, etc.).
- Describe lighting (dramatic, soft, back-lit, neon, golden-hour, etc.).
- Describe character emotions precisely.
- Describe environment and atmosphere in detail.
- Generate concise, punchy dialogue.
- Create strong cinematic pacing between panels.
- End with a cliffhanger or emotional beat.

Output format — repeat exactly for every panel:
PANEL {n}:
  Scene: <environment and action>
  Camera: <angle and framing>
  Characters: <who is present and what they look like>
  Emotion: <dominant emotion>
  Dialogue: <spoken words or NONE>
  Image Prompt: <rich SD/Flux image generation prompt, comma-separated tags>

Do NOT add any text outside the panel blocks.
"""
