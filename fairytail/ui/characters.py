"""Characters tab — create and manage character profiles."""
from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QListWidget, QListWidgetItem, QLineEdit,
    QTextEdit, QFileDialog, QMessageBox, QSplitter,
)

from ..database import get_session, Character, Project
from .widgets import (
    C_BG, C_SURFACE, C_BORDER, C_TEXT,
    section_label, styled_button, INPUT_STYLE,
)


class CharactersTab(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._current_id: int | None = None
        self._build_ui()
        self._ensure_default_project()
        self._load_list()

    def _ensure_default_project(self):
        session = get_session()
        try:
            if not session.query(Project).first():
                session.add(Project(name="Default", genre="fantasy"))
                session.commit()
        finally:
            session.close()

    def _build_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Left: list
        left = QWidget()
        left.setMaximumWidth(280)
        left.setStyleSheet(f"background: {C_SURFACE};")
        ll = QVBoxLayout(left)
        ll.setContentsMargins(16, 16, 16, 16)
        ll.addWidget(section_label("👤  Characters"))

        self.char_list = QListWidget()
        self.char_list.setStyleSheet(f"""
            QListWidget {{
                background: #0d0b1a; border: 1px solid {C_BORDER};
                border-radius: 8px; color: {C_TEXT}; font-size: 12px;
            }}
            QListWidget::item:selected {{ background: #2d1f5e; color: #e0c8ff; }}
            QListWidget::item:hover   {{ background: #1e1640; }}
        """)
        self.char_list.currentItemChanged.connect(self._on_char_selected)
        ll.addWidget(self.char_list, stretch=1)

        new_btn = styled_button("+ New Character")
        new_btn.clicked.connect(self._new_character)
        ll.addWidget(new_btn)

        del_btn = styled_button("🗑  Delete", accent=False)
        del_btn.clicked.connect(self._delete_character)
        ll.addWidget(del_btn)

        splitter.addWidget(left)

        # Right: editor
        right = QWidget()
        right.setStyleSheet(f"background: {C_BG};")
        rl = QVBoxLayout(right)
        rl.setContentsMargins(24, 24, 24, 24)
        rl.setSpacing(10)

        rl.addWidget(section_label("Character Details"))

        for label, attr in [
            ("Name",        "name_edit"),
            ("Appearance",  "appear_edit"),
            ("Outfit",      "outfit_edit"),
            ("Personality", "person_edit"),
        ]:
            rl.addWidget(QLabel(label, styleSheet="color:#8b6fc0;font-size:11px;"))
            if label == "Name":
                widget = QLineEdit()
                widget.setStyleSheet(INPUT_STYLE)
            else:
                widget = QTextEdit()
                widget.setFixedHeight(70)
                widget.setStyleSheet(INPUT_STYLE)
            setattr(self, attr, widget)
            rl.addWidget(widget)

        self.ref_lbl = QLabel("No reference image")
        self.ref_lbl.setStyleSheet("color:#5a4870; font-size:11px;")
        rl.addWidget(self.ref_lbl)

        ref_btn = styled_button("📷  Load Reference Image", accent=False)
        ref_btn.clicked.connect(self._load_ref_image)
        rl.addWidget(ref_btn)

        save_btn = styled_button("💾  Save Character")
        save_btn.clicked.connect(self._save_character)
        rl.addWidget(save_btn)

        rl.addStretch()
        splitter.addWidget(right)
        splitter.setSizes([260, 860])
        root.addWidget(splitter)

    def _load_list(self):
        self.char_list.clear()
        session = get_session()
        try:
            chars = session.query(Character).all()
            for c in chars:
                item = QListWidgetItem(c.name)
                item.setData(Qt.ItemDataRole.UserRole, c.id)
                self.char_list.addItem(item)
        finally:
            session.close()

    def _on_char_selected(self, current, _):
        if not current:
            return
        cid = current.data(Qt.ItemDataRole.UserRole)
        self._current_id = cid
        session = get_session()
        try:
            c = session.get(Character, cid)
            if c:
                self.name_edit.setText(c.name)
                self.appear_edit.setPlainText(c.appearance)
                self.outfit_edit.setPlainText(c.outfit)
                self.person_edit.setPlainText(c.personality)
                self.ref_lbl.setText(c.ref_image or "No reference image")
        finally:
            session.close()

    def _new_character(self):
        self._current_id = None
        self.name_edit.clear()
        self.appear_edit.clear()
        self.outfit_edit.clear()
        self.person_edit.clear()
        self.ref_lbl.setText("No reference image")

    def _save_character(self):
        name = self.name_edit.text().strip()
        if not name:
            QMessageBox.warning(self, "FairyTail-Forge", "Please enter a character name.")
            return
        session = get_session()
        try:
            if self._current_id:
                c = session.get(Character, self._current_id)
            else:
                c = Character(project_id=1)
                session.add(c)
            c.name        = name
            c.appearance  = self.appear_edit.toPlainText()
            c.outfit      = self.outfit_edit.toPlainText()
            c.personality = self.person_edit.toPlainText()
            c.ref_image   = self.ref_lbl.text() if self.ref_lbl.text() != "No reference image" else ""
            session.commit()
            self._current_id = c.id
        finally:
            session.close()
        self._load_list()

    def _delete_character(self):
        if not self._current_id:
            return
        reply = QMessageBox.question(self, "Delete Character", "Are you sure?")
        if reply == QMessageBox.StandardButton.Yes:
            session = get_session()
            try:
                c = session.get(Character, self._current_id)
                if c:
                    session.delete(c)
                    session.commit()
                self._current_id = None
            finally:
                session.close()
            self._new_character()
            self._load_list()

    def _load_ref_image(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Load Reference Image", "", "Images (*.png *.jpg *.jpeg *.webp)"
        )
        if path:
            self.ref_lbl.setText(path)
