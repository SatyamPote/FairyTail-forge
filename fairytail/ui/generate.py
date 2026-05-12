"""Generate tab — the main comic creation workflow."""
from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QPixmap
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QSplitter,
    QLabel, QTextEdit, QLineEdit, QComboBox,
    QSpinBox, QDoubleSpinBox, QScrollArea,
    QFrame, QFileDialog, QMessageBox, QProgressBar,
)

from ..config        import DEFAULT_PANELS, DEFAULT_STEPS, DEFAULT_CFG
from ..llm_client    import list_models, PanelScript
from ..image_client  import list_checkpoints
from ..workers       import ScriptWorker, ImageWorker, ComposerWorker
from ..database      import get_session, Comic, Panel as DBPanel
from .widgets        import (
    styled_button, section_label, card_frame, INPUT_STYLE,
    C_BG, C_SURFACE, C_BORDER, C_TEXT, C_MUTED, C_ACCENT, C_ERROR,
)


class PanelCard(QFrame):
    """Displays one parsed panel from the script."""
    def __init__(self, panel: PanelScript, parent=None):
        super().__init__(parent)
        self.setStyleSheet(f"""
            QFrame {{
                background: #1a1438;
                border: 1px solid #2e2060;
                border-radius: 10px;
                padding: 4px;
            }}
        """)
        layout = QVBoxLayout(self)
        layout.setSpacing(4)

        header = QLabel(f"Panel {panel.number}")
        header.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        header.setStyleSheet("color: #c084fc;")
        layout.addWidget(header)

        for field, value in [
            ("📷 Camera",   panel.camera),
            ("🎭 Emotion",  panel.emotion),
            ("💬 Dialogue", panel.dialogue),
        ]:
            if value:
                row = QLabel(f"<b style='color:#8b5cf6'>{field}:</b> {value}")
                row.setWordWrap(True)
                row.setStyleSheet("color: #d1c4e9; font-size: 11px;")
                layout.addWidget(row)

        scene_lbl = QLabel(panel.scene or "No scene description")
        scene_lbl.setWordWrap(True)
        scene_lbl.setStyleSheet("color: #9ca3af; font-size: 10px; font-style: italic;")
        layout.addWidget(scene_lbl)

        # Image preview placeholder
        self.img_lbl = QLabel("[ Image not generated ]")
        self.img_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.img_lbl.setFixedHeight(160)
        self.img_lbl.setStyleSheet("color: #4a3a6a; background: #110d22; border-radius: 6px;")
        layout.addWidget(self.img_lbl)

    def set_image(self, path: str):
        pix = QPixmap(path)
        if not pix.isNull():
            self.img_lbl.setPixmap(
                pix.scaled(self.img_lbl.width(), 160, Qt.AspectRatioMode.KeepAspectRatio,
                           Qt.TransformationMode.SmoothTransformation)
            )


class GenerateTab(QWidget):
    comic_saved = Signal(int)  # emitted with comic_id after save

    def __init__(self, parent=None):
        super().__init__(parent)
        self._panels: list[PanelScript] = []
        self._panel_cards: list[PanelCard] = []
        self._current_comic_id: int | None = None
        self._build_ui()

    # ── UI construction ────────────────────────────────────────────────────────

    def _build_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)

        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Left panel: controls
        left = QWidget()
        left.setMaximumWidth(420)
        left.setMinimumWidth(340)
        left.setStyleSheet(f"background: {C_SURFACE};")
        ll = QVBoxLayout(left)
        ll.setContentsMargins(20, 20, 20, 20)
        ll.setSpacing(12)

        ll.addWidget(section_label("✦  Comic Prompt"))
        self.prompt_edit = QTextEdit()
        self.prompt_edit.setPlaceholderText(
            "Describe your comic story…\n\n"
            "Example: A cyberpunk detective hunts a rogue AI through neon-drenched streets."
        )
        self.prompt_edit.setMinimumHeight(120)
        self.prompt_edit.setMaximumHeight(200)
        self.prompt_edit.setStyleSheet(INPUT_STYLE)
        ll.addWidget(self.prompt_edit)

        ll.addWidget(section_label("Title"))
        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("My Comic")
        self.title_edit.setStyleSheet(INPUT_STYLE)
        ll.addWidget(self.title_edit)

        # LLM model
        ll.addWidget(section_label("🧠  LLM Model"))
        self.model_combo = QComboBox()
        self.model_combo.setStyleSheet(INPUT_STYLE)
        self._refresh_models()
        ll.addWidget(self.model_combo)

        # Panel count
        ll.addWidget(section_label("Panels"))
        self.panel_spin = QSpinBox()
        self.panel_spin.setRange(2, 12)
        self.panel_spin.setValue(DEFAULT_PANELS)
        self.panel_spin.setStyleSheet(INPUT_STYLE)
        ll.addWidget(self.panel_spin)

        # Image checkpoint
        ll.addWidget(section_label("🎨  Image Checkpoint"))
        self.ckpt_combo = QComboBox()
        self.ckpt_combo.setStyleSheet(INPUT_STYLE)
        self._refresh_checkpoints()
        ll.addWidget(self.ckpt_combo)

        # Steps / CFG
        h_row = QHBoxLayout()
        self.steps_spin = QSpinBox()
        self.steps_spin.setRange(1, 100)
        self.steps_spin.setValue(DEFAULT_STEPS)
        self.steps_spin.setPrefix("Steps: ")
        self.steps_spin.setStyleSheet(INPUT_STYLE)
        self.cfg_spin = QDoubleSpinBox()
        self.cfg_spin.setRange(1.0, 20.0)
        self.cfg_spin.setSingleStep(0.5)
        self.cfg_spin.setValue(DEFAULT_CFG)
        self.cfg_spin.setPrefix("CFG: ")
        self.cfg_spin.setStyleSheet(INPUT_STYLE)
        h_row.addWidget(self.steps_spin)
        h_row.addWidget(self.cfg_spin)
        ll.addLayout(h_row)

        # Action buttons
        self.gen_script_btn = styled_button("✦  Generate Script")
        self.gen_script_btn.clicked.connect(self._on_generate_script)
        ll.addWidget(self.gen_script_btn)

        self.gen_images_btn = styled_button("🎨  Generate Images", accent=False)
        self.gen_images_btn.setEnabled(False)
        self.gen_images_btn.clicked.connect(self._on_generate_images)
        ll.addWidget(self.gen_images_btn)

        self.compose_btn = styled_button("📄  Compose Page", accent=False)
        self.compose_btn.setEnabled(False)
        self.compose_btn.clicked.connect(self._on_compose)
        ll.addWidget(self.compose_btn)

        self.export_btn = styled_button("💾  Export PDF", accent=False)
        self.export_btn.setEnabled(False)
        self.export_btn.clicked.connect(self._on_export_pdf)
        ll.addWidget(self.export_btn)

        # Progress
        self.progress_bar = QProgressBar()
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setFixedHeight(6)
        self.progress_bar.setStyleSheet("""
            QProgressBar { background: #1a1030; border-radius: 3px; }
            QProgressBar::chunk { background: #7c3aed; border-radius: 3px; }
        """)
        self.progress_bar.hide()
        ll.addWidget(self.progress_bar)

        self.status_lbl = QLabel("")
        self.status_lbl.setWordWrap(True)
        self.status_lbl.setStyleSheet("color: #8b6fc0; font-size: 11px;")
        ll.addWidget(self.status_lbl)

        ll.addStretch()
        splitter.addWidget(left)

        # Right panel: live stream + panel cards
        right = QWidget()
        right.setStyleSheet(f"background: {C_BG};")
        rl = QVBoxLayout(right)
        rl.setContentsMargins(20, 20, 20, 20)

        rl.addWidget(section_label("📜  Live Script Output"))
        self.script_view = QTextEdit()
        self.script_view.setReadOnly(True)
        self.script_view.setMaximumHeight(220)
        self.script_view.setStyleSheet(f"""
            QTextEdit {{
                background: #0a0818;
                color: #a78bfa;
                font-family: 'Consolas', monospace;
                font-size: 11px;
                border: 1px solid {C_BORDER};
                border-radius: 8px;
                padding: 8px;
            }}
        """)
        rl.addWidget(self.script_view)

        rl.addWidget(section_label("🎬  Panels"))
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        self.panels_container = QWidget()
        self.panels_layout = QHBoxLayout(self.panels_container)
        self.panels_layout.setSpacing(16)
        self.panels_layout.setAlignment(Qt.AlignmentFlag.AlignLeft)
        scroll.setWidget(self.panels_container)
        rl.addWidget(scroll, stretch=1)

        splitter.addWidget(right)
        splitter.setSizes([380, 860])
        root.addWidget(splitter)

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _refresh_models(self):
        self.model_combo.clear()
        models = list_models()
        if models:
            self.model_combo.addItems(models)
        else:
            self.model_combo.addItem("qwen3:8b")

    def _refresh_checkpoints(self):
        self.ckpt_combo.clear()
        ckpts = list_checkpoints()
        if ckpts:
            self.ckpt_combo.addItems(ckpts)
        else:
            self.ckpt_combo.addItem("sd_xl_base_1.0.safetensors")

    def _set_busy(self, busy: bool):
        self.gen_script_btn.setEnabled(not busy)
        self.gen_images_btn.setEnabled(not busy and bool(self._panels))
        self.compose_btn.setEnabled(not busy and bool(self._panels))
        self.export_btn.setEnabled(not busy and bool(self._panels))
        if busy:
            self.progress_bar.show()
            self.progress_bar.setRange(0, 0)  # indeterminate
        else:
            self.progress_bar.setRange(0, 1)
            self.progress_bar.setValue(1)
            self.progress_bar.hide()

    def _clear_panel_cards(self):
        while self.panels_layout.count():
            item = self.panels_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        self._panel_cards.clear()

    # ── Slots ──────────────────────────────────────────────────────────────────

    def _on_generate_script(self):
        prompt = self.prompt_edit.toPlainText().strip()
        if not prompt:
            self.status_lbl.setText("⚠  Please enter a prompt.")
            return

        self.script_view.clear()
        self._clear_panel_cards()
        self._panels.clear()
        self._set_busy(True)
        self.status_lbl.setText("Streaming script from Ollama…")

        self._script_worker = ScriptWorker(
            prompt=prompt,
            model=self.model_combo.currentText(),
            panel_count=self.panel_spin.value(),
        )
        self._script_worker.token_received.connect(self._on_token)
        self._script_worker.script_done.connect(self._on_script_done)
        self._script_worker.error_occurred.connect(self._on_error)
        self._script_worker.start()

    def _on_token(self, token: str):
        self.script_view.moveCursor(self.script_view.textCursor().MoveOperation.End)
        self.script_view.insertPlainText(token)

    def _on_script_done(self, panels: list[PanelScript]):
        self._panels = panels
        self._set_busy(False)
        self.status_lbl.setText(f"✓  Script generated — {len(panels)} panel(s)")
        self.gen_images_btn.setEnabled(True)
        self.compose_btn.setEnabled(True)

        # Save to DB
        session = get_session()
        comic = Comic(
            project_id=1,
            title=self.title_edit.text().strip() or "Untitled",
            user_prompt=self.prompt_edit.toPlainText().strip(),
            llm_script=self.script_view.toPlainText(),
            panel_count=len(panels),
        )
        session.add(comic)
        session.flush()
        for p in panels:
            session.add(DBPanel(
                comic_id=comic.id, number=p.number,
                scene=p.scene, camera=p.camera,
                characters=p.characters, emotion=p.emotion,
                dialogue=p.dialogue, image_prompt=p.image_prompt,
            ))
        session.commit()
        self._current_comic_id = comic.id
        self.comic_saved.emit(comic.id)
        session.close()

        # Render panel cards
        for panel in panels:
            card = PanelCard(panel)
            card.setFixedWidth(300)
            self.panels_layout.addWidget(card)
            self._panel_cards.append(card)

    def _on_generate_images(self):
        if not self._panels:
            return
        self._set_busy(True)
        self.status_lbl.setText("Sending panels to ComfyUI…")

        self._img_worker = ImageWorker(
            panels=self._panels,
            comic_id=self._current_comic_id or 0,
            checkpoint=self.ckpt_combo.currentText(),
            steps=self.steps_spin.value(),
            cfg=self.cfg_spin.value(),
        )
        self._img_worker.progress.connect(self.status_lbl.setText)
        self._img_worker.panel_done.connect(self._on_panel_image_done)
        self._img_worker.all_done.connect(self._on_images_done)
        self._img_worker.error_occurred.connect(self._on_error)
        self._img_worker.start()

    def _on_panel_image_done(self, panel_num: int, img_path: str):
        idx = panel_num - 1
        if 0 <= idx < len(self._panel_cards):
            self._panel_cards[idx].set_image(img_path)

    def _on_images_done(self, paths: list[str]):
        self._set_busy(False)
        self.status_lbl.setText(f"✓  {len(paths)} image(s) generated")
        self.compose_btn.setEnabled(True)
        self.export_btn.setEnabled(True)

    def _on_compose(self):
        if not self._panels or not self._current_comic_id:
            return
        panel_dicts = [
            {
                "number":     p.number,
                "dialogue":   p.dialogue,
                "image_path": str(
                    Path.home() / ".fairytail_forge" / "projects" /
                    str(self._current_comic_id) / f"panel_{p.number:02d}.png"
                ),
            }
            for p in self._panels
        ]
        self._set_busy(True)
        self.status_lbl.setText("Composing comic page…")
        self._compose_worker = ComposerWorker(
            panels=panel_dicts,
            title=self.title_edit.text().strip() or "FairyTail",
            comic_id=self._current_comic_id,
        )
        self._compose_worker.progress.connect(self.status_lbl.setText)
        self._compose_worker.done.connect(self._on_compose_done)
        self._compose_worker.error_occurred.connect(self._on_error)
        self._compose_worker.start()

    def _on_compose_done(self, path: str):
        self._set_busy(False)
        self.status_lbl.setText(f"✓  Comic page saved: {path}")
        self.export_btn.setEnabled(True)

    def _on_export_pdf(self):
        if not self._panels or not self._current_comic_id:
            return
        dest, _ = QFileDialog.getSaveFileName(
            self, "Export PDF", str(Path.home() / "comic.pdf"), "PDF Files (*.pdf)"
        )
        if not dest:
            return
        panel_dicts = [
            {
                "number":     p.number,
                "dialogue":   p.dialogue,
                "image_path": str(
                    Path.home() / ".fairytail_forge" / "projects" /
                    str(self._current_comic_id) / f"panel_{p.number:02d}.png"
                ),
            }
            for p in self._panels
        ]
        self._set_busy(True)
        self._compose_worker = ComposerWorker(
            panels=panel_dicts,
            title=self.title_edit.text().strip() or "FairyTail",
            comic_id=self._current_comic_id,
            export_pdf_path=Path(dest),
        )
        self._compose_worker.progress.connect(self.status_lbl.setText)
        self._compose_worker.done.connect(self._on_compose_done)
        self._compose_worker.error_occurred.connect(self._on_error)
        self._compose_worker.start()

    def _on_error(self, msg: str):
        self._set_busy(False)
        self.status_lbl.setText(f"❌  {msg}")
        self.status_lbl.setStyleSheet(f"color: #ef4444; font-size: 11px;")
