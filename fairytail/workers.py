"""Background worker threads — keeps the UI responsive during generation."""
from __future__ import annotations

from pathlib import Path
from typing import Callable

from PySide6.QtCore import QThread, Signal

from .config import DEFAULT_LLM_MODEL, DEFAULT_PANELS, NEGATIVE_PROMPT
from .llm_client import PanelScript, generate_script_stream
from .image_client import generate_panel_image
from .composer import compose_comic_page, export_pdf


class ScriptWorker(QThread):
    """Runs Ollama LLM script generation in a background thread."""
    token_received  = Signal(str)              # live streaming token
    script_done     = Signal(list)             # list[PanelScript]
    error_occurred  = Signal(str)

    def __init__(
        self,
        prompt: str,
        model: str = DEFAULT_LLM_MODEL,
        panel_count: int = DEFAULT_PANELS,
        extra_context: str = "",
        parent=None,
    ):
        super().__init__(parent)
        self.prompt        = prompt
        self.model         = model
        self.panel_count   = panel_count
        self.extra_context = extra_context

    def run(self):
        try:
            panels = generate_script_stream(
                prompt=self.prompt,
                model=self.model,
                panel_count=self.panel_count,
                extra_context=self.extra_context,
                on_token=self.token_received.emit,
            )
            self.script_done.emit(panels)
        except Exception as exc:
            self.error_occurred.emit(str(exc))


class ImageWorker(QThread):
    """Generates all panel images sequentially via ComfyUI."""
    progress       = Signal(str)              # status messages
    panel_done     = Signal(int, str)         # panel_number, image_path
    all_done       = Signal(list)             # list of image paths
    error_occurred = Signal(str)

    def __init__(
        self,
        panels: list[PanelScript],
        comic_id: int,
        checkpoint: str = "sd_xl_base_1.0.safetensors",
        steps: int = 25,
        cfg: float = 7.5,
        parent=None,
    ):
        super().__init__(parent)
        self.panels     = panels
        self.comic_id   = comic_id
        self.checkpoint = checkpoint
        self.steps      = steps
        self.cfg        = cfg

    def run(self):
        image_paths: list[str] = []
        try:
            for panel in self.panels:
                path = generate_panel_image(
                    positive_prompt=panel.image_prompt or panel.scene,
                    comic_id=self.comic_id,
                    panel_number=panel.number,
                    checkpoint=self.checkpoint,
                    steps=self.steps,
                    cfg=self.cfg,
                    on_progress=self.progress.emit,
                )
                image_paths.append(str(path))
                self.panel_done.emit(panel.number, str(path))
            self.all_done.emit(image_paths)
        except Exception as exc:
            self.error_occurred.emit(str(exc))


class ComposerWorker(QThread):
    """Assembles panel images into a comic page and optionally exports PDF."""
    progress       = Signal(str)
    done           = Signal(str)   # output path
    error_occurred = Signal(str)

    def __init__(
        self,
        panels: list[dict],
        title: str,
        comic_id: int,
        export_pdf_path: Path | None = None,
        parent=None,
    ):
        super().__init__(parent)
        self.panels          = panels
        self.title           = title
        self.comic_id        = comic_id
        self.export_pdf_path = export_pdf_path

    def run(self):
        try:
            self.progress.emit("Composing comic page…")
            page = compose_comic_page(self.panels, self.title, comic_id=self.comic_id)
            if self.export_pdf_path:
                self.progress.emit("Exporting PDF…")
                export_pdf([page], self.export_pdf_path)
                self.done.emit(str(self.export_pdf_path))
            else:
                self.done.emit(str(page))
        except Exception as exc:
            self.error_occurred.emit(str(exc))
