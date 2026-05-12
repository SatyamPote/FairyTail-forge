"""ComfyUI image-generation client — fully local, no cloud."""
from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Callable

import requests

from .config import (
    COMFYUI_BASE_URL,
    DEFAULT_CFG,
    DEFAULT_SAMPLER,
    DEFAULT_SCHEDULER,
    DEFAULT_STEPS,
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    NEGATIVE_PROMPT,
    PROJECTS_DIR,
)


# ── ComfyUI workflow template (SDXL) ──────────────────────────────────────────

def _build_sdxl_workflow(
    positive: str,
    negative: str = NEGATIVE_PROMPT,
    width: int = IMAGE_WIDTH,
    height: int = IMAGE_HEIGHT,
    steps: int = DEFAULT_STEPS,
    cfg: float = DEFAULT_CFG,
    sampler: str = DEFAULT_SAMPLER,
    scheduler: str = DEFAULT_SCHEDULER,
    seed: int = -1,
    checkpoint: str = "sd_xl_base_1.0.safetensors",
    character_reference_path: str | None = None,
) -> dict:
    if seed == -1:
        import random
        seed = random.randint(0, 2**32 - 1)

    workflow = {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "cfg": cfg, "denoise": 1, "latent_image": ["5", 0], "model": ["4", 0],
                "negative": ["7", 0], "positive": ["6", 0], "sampler_name": sampler,
                "scheduler": scheduler, "seed": seed, "steps": steps,
            },
        },
        "4": { "class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": checkpoint} },
        "5": { "class_type": "EmptyLatentImage", "inputs": {"batch_size": 1, "height": height, "width": width} },
        "6": { "class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": positive} },
        "7": { "class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": negative} },
        "8": { "class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]} },
        "9": { "class_type": "SaveImage", "inputs": {"filename_prefix": "fairytail_panel", "images": ["8", 0]} },
    }

    # Add IP-Adapter logic if a character reference is provided
    if character_reference_path:
        workflow["10"] = { "class_type": "LoadImage", "inputs": {"image": character_reference_path} }
        workflow["11"] = { "class_type": "IPAdapterApply", "inputs": {
            "ipadapter": ["12", 0], "clip_vision": ["13", 0], "image": ["10", 0],
            "model": ["4", 0], "weight": 0.7, "noise": 0.3
        }}
        workflow["12"] = { "class_type": "IPAdapterLoader", "inputs": {"ipadapter_name": "ip-adapter-plus_sdxl_vit-h.safetensors"} }
        workflow["13"] = { "class_type": "CLIPVisionLoader", "inputs": {"clip_name": "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"} }
        workflow["3"]["inputs"]["model"] = ["11", 0] # Route model through IP-Adapter

    return workflow


# ── API helpers ────────────────────────────────────────────────────────────────

def check_comfyui() -> tuple[bool, str]:
    try:
        # Check basic connectivity
        r = requests.get(COMFYUI_BASE_URL, timeout=3)
        if r.status_code == 200:
            return True, "ComfyUI Online"
        return False, f"ComfyUI offline (Code {r.status_code})"
    except Exception as exc:
        return False, f"ComfyUI offline: {exc}"


def list_checkpoints() -> list[str]:
    """Scan both the ComfyUI API and the local engine folder for models."""
    ckpts = []
    
    # 1. Try API first
    try:
        r = requests.get(f"{COMFYUI_BASE_URL}/object_info", timeout=5)
        if r.ok:
            info = r.json()
            ckpts_data = info.get("CheckpointLoaderSimple", {}).get("input", {}).get("required", {}).get("ckpt_name", [[], {}])
            ckpts.extend(ckpts_data[0])
    except:
        pass

    # 2. Try local filesystem fallback
    local_path = Path(__file__).parent.parent / "engine" / "comfyui" / "models" / "checkpoints"
    if local_path.exists():
        for f in local_path.glob("*.safetensors"):
            if f.name not in ckpts:
                ckpts.append(f.name)
    
    return sorted(list(set(ckpts)))


def _queue_prompt(workflow: dict, client_id: str) -> str:
    payload = {"prompt": workflow, "client_id": client_id}
    r = requests.post(f"{COMFYUI_BASE_URL}/prompt", json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["prompt_id"]


def _wait_for_prompt(prompt_id: str, client_id: str, timeout: int = 300) -> dict:
    """Poll /history until the prompt is done."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = requests.get(f"{COMFYUI_BASE_URL}/history/{prompt_id}", timeout=10)
        history = r.json()
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(1)
    raise TimeoutError(f"ComfyUI did not finish within {timeout}s")


def _download_image(filename: str, subfolder: str, folder_type: str, dest: Path) -> Path:
    params = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    r = requests.get(f"{COMFYUI_BASE_URL}/view", params=params, timeout=60)
    r.raise_for_status()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(r.content)
    return dest


# ── Public API ─────────────────────────────────────────────────────────────────

def generate_panel_image(
    positive_prompt: str,
    comic_id: int,
    panel_number: int,
    negative_prompt: str = NEGATIVE_PROMPT,
    checkpoint: str = "sd_xl_base_1.0.safetensors",
    width: int = IMAGE_WIDTH,
    height: int = IMAGE_HEIGHT,
    steps: int = DEFAULT_STEPS,
    cfg: float = DEFAULT_CFG,
    character_reference_path: str | None = None,
    on_progress: Callable[[str], None] | None = None,
) -> Path:
    """Generate a single panel image via ComfyUI and return its local path."""
    client_id = str(uuid.uuid4())
    workflow   = _build_sdxl_workflow(
        positive=positive_prompt,
        negative=negative_prompt,
        width=width, height=height,
        steps=steps, cfg=cfg,
        checkpoint=checkpoint,
        character_reference_path=character_reference_path,
    )

    if on_progress:
        on_progress(f"Queuing panel {panel_number} to ComfyUI…")

    prompt_id = _queue_prompt(workflow, client_id)

    if on_progress:
        on_progress(f"Generating panel {panel_number} (prompt_id={prompt_id[:8]}…)")

    result = _wait_for_prompt(prompt_id, client_id)

    # Extract output image info
    outputs = result.get("outputs", {})
    for node_id, node_out in outputs.items():
        images = node_out.get("images", [])
        if images:
            img_info = images[0]
            dest = PROJECTS_DIR / str(comic_id) / f"panel_{panel_number:02d}.png"
            downloaded = _download_image(
                img_info["filename"],
                img_info.get("subfolder", ""),
                img_info.get("type", "output"),
                dest,
            )
            if on_progress:
                on_progress(f"✓ Panel {panel_number} saved to {downloaded.name}")
            return downloaded

    raise RuntimeError("ComfyUI returned no images in output")
