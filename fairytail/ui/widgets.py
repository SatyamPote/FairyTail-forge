"""Shared widget helpers and style constants."""
from PySide6.QtWidgets import QPushButton, QLabel, QFrame
from PySide6.QtGui import QFont
from PySide6.QtCore import Qt

# ── Colour palette ─────────────────────────────────────────────────────────────
C_BG        = "#0d0b1a"
C_SURFACE   = "#14102a"
C_ELEVATED  = "#1e1840"
C_BORDER    = "#2e2060"
C_ACCENT    = "#7c3aed"
C_ACCENT2   = "#a855f7"
C_TEXT      = "#e2d9f3"
C_MUTED     = "#8b6fc0"
C_SUCCESS   = "#22c55e"
C_ERROR     = "#ef4444"
C_WARNING   = "#f59e0b"


def styled_button(text: str, accent: bool = True) -> QPushButton:
    btn = QPushButton(text)
    if accent:
        btn.setStyleSheet(f"""
            QPushButton {{
                background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                    stop:0 {C_ACCENT}, stop:1 #9333ea);
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 10px 24px;
                font-size: 13px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                    stop:0 #8b5cf6, stop:1 #a855f7);
            }}
            QPushButton:pressed {{ background: #5b21b6; }}
            QPushButton:disabled {{ background: #2d2040; color: #5a4870; }}
        """)
    else:
        btn.setStyleSheet(f"""
            QPushButton {{
                background: {C_ELEVATED};
                color: {C_TEXT};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 12px;
            }}
            QPushButton:hover {{ background: #28205a; border-color: {C_ACCENT}; }}
            QPushButton:pressed {{ background: {C_SURFACE}; }}
        """)
    return btn


def section_label(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
    lbl.setStyleSheet(f"color: {C_ACCENT2}; padding: 6px 0 2px 0;")
    return lbl


def card_frame() -> QFrame:
    f = QFrame()
    f.setStyleSheet(f"""
        QFrame {{
            background: {C_SURFACE};
            border: 1px solid {C_BORDER};
            border-radius: 12px;
        }}
    """)
    return f


PANEL_CARD_STYLE = f"""
    QFrame {{
        background: {C_ELEVATED};
        border: 1px solid {C_BORDER};
        border-radius: 10px;
    }}
"""

INPUT_STYLE = f"""
    QTextEdit, QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox {{
        background: {C_SURFACE};
        color: {C_TEXT};
        border: 1px solid {C_BORDER};
        border-radius: 6px;
        padding: 6px;
        font-size: 12px;
        selection-background-color: {C_ACCENT};
    }}
    QTextEdit:focus, QLineEdit:focus, QComboBox:focus {{
        border-color: {C_ACCENT};
    }}
    QComboBox::drop-down {{ border: none; }}
    QComboBox QAbstractItemView {{
        background: {C_SURFACE};
        color: {C_TEXT};
        selection-background-color: {C_ACCENT};
    }}
"""
