"""Settings tab — configure models, endpoints, and generation defaults."""
from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout,
    QLineEdit, QSpinBox, QDoubleSpinBox,
    QLabel, QGroupBox, QPushButton, QMessageBox,
)

from ..config import OLLAMA_BASE_URL, COMFYUI_BASE_URL, DEFAULT_STEPS, DEFAULT_CFG
from ..llm_client import check_ollama
from ..image_client import check_comfyui
from .widgets import section_label, styled_button, INPUT_STYLE, C_BG, C_SURFACE, C_BORDER, C_TEXT


FORM_STYLE = f"""
    QGroupBox {{
        background: {C_SURFACE};
        border: 1px solid {C_BORDER};
        border-radius: 10px;
        margin-top: 10px;
        padding: 12px;
        color: #c084fc;
        font-weight: bold;
    }}
    QGroupBox::title {{
        subcontrol-origin: margin;
        left: 12px;
        padding: 0 6px;
    }}
    QLabel {{ color: #8b6fc0; font-size: 11px; }}
"""


class SettingsTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(40, 30, 40, 30)
        root.setSpacing(20)
        self.setStyleSheet(f"background: {C_BG};")

        root.addWidget(section_label("⚙  Settings"))

        # ── Ollama group ──────────────────────────────────────────────────────
        ollama_box = QGroupBox("🧠  Ollama Configuration")
        ollama_box.setStyleSheet(FORM_STYLE)
        of = QFormLayout(ollama_box)
        self.ollama_url = QLineEdit(OLLAMA_BASE_URL)
        self.ollama_url.setStyleSheet(INPUT_STYLE)
        of.addRow("Ollama URL:", self.ollama_url)
        test_ollama = styled_button("Test Connection", accent=False)
        test_ollama.clicked.connect(self._test_ollama)
        of.addRow("", test_ollama)
        root.addWidget(ollama_box)

        # ── ComfyUI group ─────────────────────────────────────────────────────
        comfy_box = QGroupBox("🎨  ComfyUI Configuration")
        comfy_box.setStyleSheet(FORM_STYLE)
        cf = QFormLayout(comfy_box)
        self.comfy_url = QLineEdit(COMFYUI_BASE_URL)
        self.comfy_url.setStyleSheet(INPUT_STYLE)
        cf.addRow("ComfyUI URL:", self.comfy_url)
        test_comfy = styled_button("Test Connection", accent=False)
        test_comfy.clicked.connect(self._test_comfyui)
        cf.addRow("", test_comfy)
        root.addWidget(comfy_box)

        # ── Generation defaults ────────────────────────────────────────────────
        gen_box = QGroupBox("🖼  Generation Defaults")
        gen_box.setStyleSheet(FORM_STYLE)
        gf = QFormLayout(gen_box)
        self.steps_spin = QSpinBox()
        self.steps_spin.setRange(1, 150)
        self.steps_spin.setValue(DEFAULT_STEPS)
        self.steps_spin.setStyleSheet(INPUT_STYLE)
        self.cfg_spin = QDoubleSpinBox()
        self.cfg_spin.setRange(1.0, 20.0)
        self.cfg_spin.setValue(DEFAULT_CFG)
        self.cfg_spin.setStyleSheet(INPUT_STYLE)
        gf.addRow("Default Steps:", self.steps_spin)
        gf.addRow("Default CFG Scale:", self.cfg_spin)
        root.addWidget(gen_box)

        # ── Modelfile helper ──────────────────────────────────────────────────
        model_box = QGroupBox("🤖  Custom Ollama Model (Modelfile)")
        model_box.setStyleSheet(FORM_STYLE)
        ml = QVBoxLayout(model_box)
        info = QLabel(
            "To create a custom comic-writing model:\n"
            "1. ollama pull qwen3:8b\n"
            "2. Create a Modelfile (see docs/Modelfile)\n"
            "3. ollama create comicai -f Modelfile\n"
            "4. Use 'comicai' as the LLM model in Generate tab"
        )
        info.setStyleSheet("color: #7c6a9e; font-size: 11px; font-family: Consolas;")
        info.setWordWrap(True)
        ml.addWidget(info)
        gen_btn = styled_button("📄  View Sample Modelfile", accent=False)
        gen_btn.clicked.connect(self._show_modelfile)
        ml.addWidget(gen_btn)
        root.addWidget(model_box)

        root.addStretch()

    def _test_ollama(self):
        import fairytail.config as cfg
        cfg.OLLAMA_BASE_URL = self.ollama_url.text().strip()
        ok, msg = check_ollama()
        icon = "✅" if ok else "❌"
        QMessageBox.information(self, "Ollama Test", f"{icon}  {msg}")

    def _test_comfyui(self):
        import fairytail.config as cfg
        cfg.COMFYUI_BASE_URL = self.comfy_url.text().strip()
        ok, msg = check_comfyui()
        icon = "✅" if ok else "❌"
        QMessageBox.information(self, "ComfyUI Test", f"{icon}  {msg}")

    def _show_modelfile(self):
        txt = (
            "FROM qwen3:8b\n\n"
            'SYSTEM """\n'
            "You are a cinematic AI comic-writing engine.\n"
            "Generate detailed, visually rich comic panel scripts.\n"
            "Always maintain character consistency across panels.\n"
            '"""\n'
        )
        QMessageBox.information(self, "Sample Modelfile", txt)
