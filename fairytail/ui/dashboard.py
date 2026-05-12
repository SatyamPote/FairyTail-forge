"""Dashboard tab — welcome screen and service status."""
from __future__ import annotations

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont, QLinearGradient, QColor, QPainter
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, QGridLayout,
)

from ..llm_client   import check_ollama, list_models
from ..image_client import check_comfyui, list_checkpoints
from .widgets import C_ACCENT, C_TEXT, C_MUTED, C_SURFACE, C_BORDER, styled_button, card_frame


class StatusCard(QFrame):
    def __init__(self, title: str, parent=None):
        super().__init__(parent)
        self.setMinimumHeight(100)
        self.setStyleSheet(f"""
            QFrame {{
                background: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 14px;
                padding: 8px;
            }}
        """)
        layout = QVBoxLayout(self)
        self.title_lbl  = QLabel(title)
        self.title_lbl.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        self.title_lbl.setStyleSheet("color: #a78bfa;")
        self.status_lbl = QLabel("Checking…")
        self.status_lbl.setStyleSheet("color: #9ca3af; font-size: 12px;")
        self.detail_lbl = QLabel("")
        self.detail_lbl.setStyleSheet("color: #6b7280; font-size: 11px;")
        self.detail_lbl.setWordWrap(True)
        layout.addWidget(self.title_lbl)
        layout.addWidget(self.status_lbl)
        layout.addWidget(self.detail_lbl)

    def set_ok(self, msg: str, detail: str = ""):
        self.status_lbl.setText(f"🟢  {msg}")
        self.status_lbl.setStyleSheet("color: #22c55e; font-size: 12px;")
        self.detail_lbl.setText(detail)

    def set_error(self, msg: str):
        self.status_lbl.setText(f"🔴  {msg}")
        self.status_lbl.setStyleSheet("color: #ef4444; font-size: 12px;")


class DashboardTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._build_ui()
        QTimer.singleShot(500, self._refresh_status)

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(40, 30, 40, 30)
        root.setSpacing(24)

        # ── Hero banner ───────────────────────────────────────────────────────
        hero = QLabel(
            "✦  FairyTail-Forge\nLocal AI Comic Studio"
        )
        hero.setFont(QFont("Segoe UI", 36, QFont.Weight.Bold))
        hero.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hero.setStyleSheet("""
            color: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #c084fc, stop:0.5 #818cf8, stop:1 #38bdf8);
            padding: 20px;
        """)
        root.addWidget(hero)

        tagline = QLabel("Fully offline · Ollama LLM · ComfyUI · No subscriptions")
        tagline.setAlignment(Qt.AlignmentFlag.AlignCenter)
        tagline.setStyleSheet("color: #7c6a9e; font-size: 14px; margin-bottom: 8px;")
        root.addWidget(tagline)

        # ── Service status row ────────────────────────────────────────────────
        status_row = QHBoxLayout()
        self.ollama_card = StatusCard("🧠  Ollama LLM")
        self.comfy_card  = StatusCard("🎨  ComfyUI")
        status_row.addWidget(self.ollama_card)
        status_row.addWidget(self.comfy_card)
        root.addLayout(status_row)

        # ── Quick-stat cards ──────────────────────────────────────────────────
        stats_row = QHBoxLayout()
        for label, hint in [
            ("⌂  Dashboard", "Welcome & service status"),
            ("✦  Generate",  "Create AI comics"),
            ("⬛  Gallery",   "Browse saved comics"),
            ("👤  Characters","Manage characters"),
        ]:
            card = card_frame()
            cl = QVBoxLayout(card)
            t = QLabel(label)
            t.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
            t.setStyleSheet("color: #c4b5fd;")
            d = QLabel(hint)
            d.setStyleSheet("color: #6b7280; font-size: 11px;")
            cl.addWidget(t)
            cl.addWidget(d)
            stats_row.addWidget(card)
        root.addLayout(stats_row)

        # ── Refresh button ────────────────────────────────────────────────────
        refresh_btn = styled_button("↻  Refresh Service Status", accent=False)
        refresh_btn.clicked.connect(self._refresh_status)
        root.addWidget(refresh_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        root.addStretch()

        # ── Footer ────────────────────────────────────────────────────────────
        footer = QLabel("FairyTail-Forge v1.0  ·  MIT License  ·  100% Local & Offline")
        footer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        footer.setStyleSheet("color: #3d3060; font-size: 10px;")
        root.addWidget(footer)

    def _refresh_status(self):
        ok, msg = check_ollama()
        models  = list_models()
        if ok:
            self.ollama_card.set_ok(msg, f"Models: {', '.join(models[:5]) or 'none pulled'}")
        else:
            self.ollama_card.set_error(msg)

        ok2, msg2 = check_comfyui()
        ckpts = list_checkpoints()
        if ok2:
            self.comfy_card.set_ok(msg2, f"Checkpoints: {len(ckpts)} found")
        else:
            self.comfy_card.set_error(msg2)
