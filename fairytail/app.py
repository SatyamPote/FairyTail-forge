"""Main PySide6 application window for FairyTail-Forge."""
from __future__ import annotations

import sys
from pathlib import Path

from PySide6.QtCore import Qt, QSize
from PySide6.QtGui import QFont, QIcon, QPalette, QColor
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QTabWidget, QStatusBar, QLabel,
)

from .ui.dashboard   import DashboardTab
from .ui.generate    import GenerateTab
from .ui.gallery     import GalleryTab
from .ui.characters  import CharactersTab
from .ui.settings    import SettingsTab
from .llm_client     import check_ollama
from .image_client   import check_comfyui


APP_STYLE = """
QMainWindow, QDialog {
    background: #0d0b1a;
}
QTabWidget::pane {
    background: #0d0b1a;
    border: 1px solid #2a1f4a;
}
QTabBar::tab {
    background: #1a1430;
    color: #9070c0;
    padding: 10px 24px;
    font-size: 13px;
    font-weight: bold;
    border: none;
    margin-right: 2px;
}
QTabBar::tab:selected {
    background: #2d1f5e;
    color: #e0c8ff;
    border-bottom: 3px solid #9b59ff;
}
QTabBar::tab:hover {
    background: #221848;
    color: #c8a8ff;
}
QStatusBar {
    background: #0a0818;
    color: #7050a0;
    font-size: 11px;
    border-top: 1px solid #1e1438;
}
QScrollBar:vertical {
    background: #100c20;
    width: 8px;
}
QScrollBar::handle:vertical {
    background: #4a2d8a;
    border-radius: 4px;
}
"""


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("FairyTail-Forge  ✦  Local AI Comic Studio")
        self.setMinimumSize(QSize(1280, 800))
        self.resize(1440, 900)

        # ── Tabs ──────────────────────────────────────────────────────────────
        tabs = QTabWidget()
        tabs.setTabPosition(QTabWidget.TabPosition.North)

        self.dashboard_tab   = DashboardTab()
        self.generate_tab    = GenerateTab()
        self.gallery_tab     = GalleryTab()
        self.characters_tab  = CharactersTab()
        self.settings_tab    = SettingsTab()

        tabs.addTab(self.dashboard_tab,  "⌂  Dashboard")
        tabs.addTab(self.generate_tab,   "✦  Generate")
        tabs.addTab(self.gallery_tab,    "⬛  Gallery")
        tabs.addTab(self.characters_tab, "👤  Characters")
        tabs.addTab(self.settings_tab,   "⚙  Settings")

        self.setCentralWidget(tabs)

        # ── Status bar ────────────────────────────────────────────────────────
        self.status = QStatusBar()
        self.setStatusBar(self.status)
        self._check_services()

        # forward generate → gallery refresh
        self.generate_tab.comic_saved.connect(self.gallery_tab.refresh)

    def _check_services(self):
        ollama_ok, ollama_msg = check_ollama()
        comfy_ok,  comfy_msg  = check_comfyui()

        ollama_icon = "🟢" if ollama_ok else "🔴"
        comfy_icon  = "🟢" if comfy_ok  else "🔴"

        self.status.showMessage(
            f"  {ollama_icon} Ollama: {ollama_msg}     "
            f"{comfy_icon} ComfyUI: {comfy_msg}"
        )


def run():
    app = QApplication(sys.argv)
    app.setApplicationName("FairyTail-Forge")
    app.setStyleSheet(APP_STYLE)

    font = QFont("Segoe UI", 10)
    app.setFont(font)

    win = MainWindow()
    win.show()
    sys.exit(app.exec())
