"""Gallery tab — browse and view saved comics."""
from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtGui import QFont, QPixmap
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QScrollArea, QFrame, QListWidget, QListWidgetItem,
    QSplitter, QTextEdit,
)

from ..database import get_session, Comic
from .widgets import (
    C_BG, C_SURFACE, C_BORDER, C_TEXT, C_MUTED,
    section_label, styled_button, card_frame,
)


class GalleryTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._build_ui()
        self.refresh()

    def _build_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)

        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Left: comic list
        left = QWidget()
        left.setMaximumWidth(320)
        left.setStyleSheet(f"background: {C_SURFACE};")
        ll = QVBoxLayout(left)
        ll.setContentsMargins(16, 16, 16, 16)

        ll.addWidget(section_label("📚  Saved Comics"))

        self.comic_list = QListWidget()
        self.comic_list.setStyleSheet(f"""
            QListWidget {{
                background: #0d0b1a;
                border: 1px solid {C_BORDER};
                border-radius: 8px;
                color: {C_TEXT};
                font-size: 12px;
            }}
            QListWidget::item:selected {{
                background: #2d1f5e;
                color: #e0c8ff;
            }}
            QListWidget::item:hover {{
                background: #1e1640;
            }}
        """)
        self.comic_list.currentItemChanged.connect(self._on_comic_selected)
        ll.addWidget(self.comic_list, stretch=1)

        refresh_btn = styled_button("↻  Refresh", accent=False)
        refresh_btn.clicked.connect(self.refresh)
        ll.addWidget(refresh_btn)

        splitter.addWidget(left)

        # Right: comic viewer
        right = QWidget()
        right.setStyleSheet(f"background: {C_BG};")
        rl = QVBoxLayout(right)
        rl.setContentsMargins(20, 20, 20, 20)

        self.detail_title = QLabel("Select a comic →")
        self.detail_title.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        self.detail_title.setStyleSheet("color: #c084fc;")
        rl.addWidget(self.detail_title)

        self.page_img = QLabel()
        self.page_img.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.page_img.setMinimumHeight(400)
        self.page_img.setStyleSheet(f"background: {C_SURFACE}; border-radius: 12px;")
        rl.addWidget(self.page_img, stretch=1)

        self.script_view = QTextEdit()
        self.script_view.setReadOnly(True)
        self.script_view.setMaximumHeight(180)
        self.script_view.setStyleSheet(f"""
            QTextEdit {{
                background: #0a0818; color: #a78bfa;
                font-family: 'Consolas', monospace; font-size: 11px;
                border: 1px solid {C_BORDER}; border-radius: 8px; padding: 8px;
            }}
        """)
        rl.addWidget(self.script_view)

        splitter.addWidget(right)
        splitter.setSizes([300, 900])
        root.addWidget(splitter)

    def refresh(self, comic_id: int = 0):
        self.comic_list.clear()
        session = get_session()
        try:
            comics = session.query(Comic).order_by(Comic.created_at.desc()).all()
            for comic in comics:
                item = QListWidgetItem(f"#{comic.id}  {comic.title}")
                item.setData(Qt.ItemDataRole.UserRole, comic.id)
                self.comic_list.addItem(item)
        finally:
            session.close()

    def _on_comic_selected(self, current, _previous):
        if not current:
            return
        comic_id = current.data(Qt.ItemDataRole.UserRole)
        session = get_session()
        try:
            comic = session.get(Comic, comic_id)
            if not comic:
                return
            self.detail_title.setText(comic.title)
            self.script_view.setPlainText(comic.llm_script or "No script saved.")

            page_path = Path.home() / ".fairytail_forge" / "projects" / str(comic_id) / "comic_page.png"
            if page_path.exists():
                pix = QPixmap(str(page_path))
                self.page_img.setPixmap(
                    pix.scaled(self.page_img.width(), 500,
                               Qt.AspectRatioMode.KeepAspectRatio,
                               Qt.TransformationMode.SmoothTransformation)
                )
            else:
                self.page_img.setText("[ Comic page not yet composed ]")
                self.page_img.setStyleSheet(f"background: {C_SURFACE}; color: #4a3a6a; border-radius: 12px;")
        finally:
            session.close()
