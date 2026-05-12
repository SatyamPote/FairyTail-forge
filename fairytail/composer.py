"""Comic page composer — assembles panel images into a comic page and exports PDF/PNG."""
from __future__ import annotations

import textwrap
from pathlib import Path
from typing import Sequence

from PIL import Image, ImageDraw, ImageFont

from .config import ASSETS_DIR, PROJECTS_DIR


# ── Layout constants ───────────────────────────────────────────────────────────
PAGE_W, PAGE_H     = 2480, 3508  # A4 at 300 dpi
MARGIN             = 60
GUTTER             = 20
DIALOGUE_FONT_SIZE = 36
TITLE_FONT_SIZE    = 72
BG_COLOR           = (15, 10, 30)         # deep indigo
BORDER_COLOR       = (200, 160, 255)      # soft violet
BUBBLE_BG          = (255, 255, 255, 230)
BUBBLE_TEXT        = (20, 20, 20)
TITLE_COLOR        = (220, 180, 255)
FALLBACK_PANEL_BG  = (30, 20, 50)


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_paths = [
        ASSETS_DIR / "fonts" / "comic.ttf",
        Path("C:/Windows/Fonts/comic.ttf"),
        Path("C:/Windows/Fonts/Arial.ttf"),
    ]
    for fp in font_paths:
        if fp.exists():
            try:
                return ImageFont.truetype(str(fp), size)
            except Exception:
                pass
    return ImageFont.load_default()


def _draw_speech_bubble(draw: ImageDraw.Draw, text: str, x: int, y: int, max_w: int):
    if not text or text.upper() == "NONE":
        return
    font  = _load_font(DIALOGUE_FONT_SIZE)
    lines = textwrap.wrap(text, width=28)
    line_h = DIALOGUE_FONT_SIZE + 8
    bw = max_w
    bh = len(lines) * line_h + 20
    draw.rounded_rectangle([x, y, x + bw, y + bh], radius=18, fill=BUBBLE_BG, outline=(0, 0, 0, 255), width=3)
    ty = y + 10
    for line in lines:
        draw.text((x + 10, ty), line, font=font, fill=BUBBLE_TEXT)
        ty += line_h


def _place_panel_image(canvas: Image.Image, panel_img_path: str | Path, box: tuple[int, int, int, int]):
    x0, y0, x1, y1 = box
    pw, ph = x1 - x0, y1 - y0

    if panel_img_path and Path(panel_img_path).exists():
        img = Image.open(panel_img_path).convert("RGB")
        img = img.resize((pw, ph), Image.LANCZOS)
    else:
        img = Image.new("RGB", (pw, ph), FALLBACK_PANEL_BG)
        draw = ImageDraw.Draw(img)
        font = _load_font(48)
        draw.text((pw // 2 - 60, ph // 2 - 24), "[ No Image ]", font=font, fill=(100, 80, 140))

    canvas.paste(img, (x0, y0))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([x0, y0, x1, y1], outline=BORDER_COLOR, width=5)


def _compute_layout(panel_count: int) -> list[tuple[int, int, int, int]]:
    """Return bounding boxes for each panel in a dynamic grid layout."""
    usable_w = PAGE_W - 2 * MARGIN
    usable_h = PAGE_H - 2 * MARGIN - 120  # leave header space

    if panel_count <= 2:
        cols, rows = 1, panel_count
    elif panel_count <= 4:
        cols, rows = 2, 2
    elif panel_count <= 6:
        cols, rows = 2, 3
    elif panel_count <= 9:
        cols, rows = 3, 3
    else:
        cols, rows = 3, 4

    cell_w = (usable_w - (cols - 1) * GUTTER) // cols
    cell_h = (usable_h - (rows - 1) * GUTTER) // rows

    boxes: list[tuple[int, int, int, int]] = []
    for i in range(panel_count):
        row, col = divmod(i, cols)
        x0 = MARGIN + col * (cell_w + GUTTER)
        y0 = MARGIN + 120 + row * (cell_h + GUTTER)
        boxes.append((x0, y0, x0 + cell_w, y0 + cell_h))

    return boxes


# ── Public API ─────────────────────────────────────────────────────────────────

def compose_comic_page(
    panels: list[dict],   # list of {"image_path", "dialogue", "number"}
    title: str = "FairyTail",
    output_path: Path | None = None,
    comic_id: int = 0,
) -> Path:
    """Compose all panels into a single A4 comic page image (.png)."""
    canvas = Image.new("RGB", (PAGE_W, PAGE_H), BG_COLOR)
    draw   = ImageDraw.Draw(canvas)

    # ── Title bar ─────────────────────────────────────────────────────────────
    title_font = _load_font(TITLE_FONT_SIZE)
    draw.text((MARGIN, 20), title.upper(), font=title_font, fill=TITLE_COLOR)

    sub_font = _load_font(32)
    draw.text((MARGIN, 100), "✦  FairyTail-Forge  ✦  Local AI Comic Studio", font=sub_font, fill=(140, 110, 180))

    # ── Panels ────────────────────────────────────────────────────────────────
    boxes = _compute_layout(len(panels))

    for i, (panel, box) in enumerate(zip(panels, boxes)):
        _place_panel_image(canvas, panel.get("image_path", ""), box)
        dialogue = panel.get("dialogue", "")
        bx0, by0, bx1, by1 = box
        bubble_w = bx1 - bx0 - 20
        _draw_speech_bubble(draw, dialogue, bx0 + 10, by1 - 140, bubble_w)

        # Panel number badge
        badge_font = _load_font(40)
        draw.ellipse([bx0 + 8, by0 + 8, bx0 + 56, by0 + 56], fill=(80, 40, 120))
        draw.text((bx0 + 18, by0 + 12), str(panel.get("number", i + 1)), font=badge_font, fill=(255, 220, 255))

    # ── Save ──────────────────────────────────────────────────────────────────
    if output_path is None:
        out_dir = PROJECTS_DIR / str(comic_id)
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = out_dir / "comic_page.png"

    canvas.save(str(output_path), "PNG", dpi=(300, 300))
    return output_path


def export_pdf(page_images: list[Path], output_path: Path) -> Path:
    """Combine page images into a multi-page PDF."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas as pdf_canvas

    c = pdf_canvas.Canvas(str(output_path), pagesize=A4)
    pw, ph = A4

    for img_path in page_images:
        if img_path.exists():
            c.drawImage(str(img_path), 0, 0, width=pw, height=ph, preserveAspectRatio=True)
        c.showPage()

    c.save()
    return output_path
