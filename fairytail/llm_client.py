"""Ollama LLM client — fully local, no cloud."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Callable, Generator

import requests

from .config import (
    COMIC_SYSTEM_PROMPT,
    DEFAULT_LLM_MODEL,
    DEFAULT_PANELS,
    OLLAMA_BASE_URL,
)


@dataclass
class PanelScript:
    number:       int
    scene:        str = ""
    camera:       str = ""
    characters:   str = ""
    emotion:      str = ""
    dialogue:     str = ""
    image_prompt: str = ""


# ── Low-level helpers ──────────────────────────────────────────────────────────

def _post_stream(endpoint: str, payload: dict) -> Generator[str, None, None]:
    """Stream newline-delimited JSON from Ollama."""
    with requests.post(endpoint, json=payload, stream=True, timeout=120) as resp:
        resp.raise_for_status()
        for raw in resp.iter_lines():
            if raw:
                chunk = json.loads(raw)
                if token := chunk.get("response", ""):
                    yield token


def _post_full(endpoint: str, payload: dict) -> str:
    payload = {**payload, "stream": False}
    resp = requests.post(endpoint, json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json().get("response", "")


# ── Script parsing ─────────────────────────────────────────────────────────────

_FIELD_RE = re.compile(
    r"^\s*(Scene|Camera|Characters|Emotion|Dialogue|Image Prompt)\s*:\s*(.*)$",
    re.IGNORECASE,
)
_PANEL_RE = re.compile(r"PANEL\s+(\d+)\s*:", re.IGNORECASE)


def parse_script(raw_text: str) -> list[PanelScript]:
    panels: list[PanelScript] = []
    current: PanelScript | None = None

    for line in raw_text.splitlines():
        pm = _PANEL_RE.match(line)
        if pm:
            if current:
                panels.append(current)
            current = PanelScript(number=int(pm.group(1)))
            continue

        if current is None:
            continue

        fm = _FIELD_RE.match(line)
        if fm:
            key, val = fm.group(1).lower().replace(" ", "_"), fm.group(2).strip()
            if hasattr(current, key):
                setattr(current, key, val)

    if current:
        panels.append(current)

    return panels


# ── Public API ─────────────────────────────────────────────────────────────────

def check_ollama() -> tuple[bool, str]:
    """Return (ok, message) about Ollama availability."""
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        models = [m["name"] for m in r.json().get("models", [])]
        return True, f"Ollama online — {len(models)} model(s) available"
    except Exception as exc:
        return False, f"Ollama offline: {exc}"


def list_models() -> list[str]:
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return [m["name"] for m in r.json().get("models", [])]
    except Exception:
        return []


def generate_script_stream(
    prompt: str,
    model: str = DEFAULT_LLM_MODEL,
    panel_count: int = DEFAULT_PANELS,
    extra_context: str = "",
    on_token: Callable[[str], None] | None = None,
) -> list[PanelScript]:
    """Stream a comic script from Ollama, calling on_token for live preview."""
    full_prompt = (
        f"{extra_context}\n\n" if extra_context else ""
    ) + (
        f"Write a {panel_count}-panel comic based on this user request:\n\n{prompt}\n\n"
        "Output EXACTLY as the format specifies. No extra commentary."
    )

    payload = {
        "model":  model,
        "prompt": full_prompt,
        "system": COMIC_SYSTEM_PROMPT,
        "stream": True,
        "options": {"temperature": 0.8, "num_predict": 2048},
    }

    full_text = ""
    for token in _post_stream(f"{OLLAMA_BASE_URL}/api/generate", payload):
        full_text += token
        if on_token:
            on_token(token)

    return parse_script(full_text)


def enhance_image_prompt(script: PanelScript, model: str = DEFAULT_LLM_MODEL) -> str:
    """Expand a bare panel script into a rich SD-compatible string using the Master Template."""
    from .config import IMAGE_PROMPT_TEMPLATE
    
    prompt_context = (
        f"Scene: {script.scene}\n"
        f"Camera: {script.camera}\n"
        f"Characters: {script.characters}\n"
        f"Emotion: {script.emotion}"
    )

    system = (
        "You are an expert Stable Diffusion prompt engineer. "
        "Expand the given scene into a high-detail prompt. "
        "Follow the template exactly. No conversational text."
    )
    
    payload = {
        "model":  model,
        "system": system,
        "prompt": f"Template to fill:\n{IMAGE_PROMPT_TEMPLATE}\n\nData:\n{prompt_context}",
        "stream": False,
    }
    try:
        resp = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception:
        # Fallback to a basic assembly if LLM fails
        return IMAGE_PROMPT_TEMPLATE.format(
            character=script.characters,
            scene=script.scene,
            camera=script.camera,
            emotion=script.emotion
        )
