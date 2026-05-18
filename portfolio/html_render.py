"""
portfolio/html_render.py
------------------------
Renders raw HTML block elements from README files to PNG images using
Google Chrome in headless mode.  The resulting images are embedded in the
LaTeX portfolio PDF via ``\\includegraphics``.

Pillow is used to auto-crop the white space Chrome adds below the content.

Usage example (called from metadata.py)::

    from portfolio.html_render import render_html_block

    img_path = render_html_block(
        '<div style="display:flex">...</div>',
        project_path=Path('2026/santos'),
        output_dir=Path('temp_portfolio/html_renders'),
    )
    # img_path is a Path to the cropped PNG, or None on failure
"""

import hashlib
import subprocess
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Chrome discovery
# ---------------------------------------------------------------------------

def _find_chrome() -> Optional[str]:
    """Return the path of the first available Chrome / Chromium executable."""
    for name in ('google-chrome', 'google-chrome-stable',
                 'chromium', 'chromium-browser'):
        try:
            r = subprocess.run(
                ['which', name], capture_output=True, text=True, check=False)
            if r.returncode == 0 and r.stdout.strip():
                return r.stdout.strip()
        except OSError:
            pass
    return None


_CHROME: Optional[str] = _find_chrome()   # resolved once at import time


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def render_html_block(
    html_snippet: str,
    project_path: Path,
    output_dir: Path,
    *,
    width: int = 1200,
) -> Optional[Path]:
    """Render *html_snippet* to a cropped PNG image using headless Chrome.

    Args:
        html_snippet: Raw HTML fragment to render (may include inline styles
                      and relative ``src`` / ``href`` attributes).
        project_path: Absolute path to the project directory.  Used as the
                      ``<base href>`` so that relative image paths resolve
                      from the project folder on disk.
        output_dir:   Directory where the PNG is saved.  Created if absent.
        width:        Viewport width in CSS pixels (default 1200).

    Returns:
        Absolute :class:`~pathlib.Path` to the cropped PNG, or ``None`` when
        Chrome is unavailable or the render fails.
    """
    if _CHROME is None:
        print("  \u26a0 No Chrome/Chromium found \u2014 HTML block skipped in PDF")
        return None

    # Ensure we have an absolute path so the file:// URL is well-formed.
    project_path = project_path.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Stable cache key: hash of (project path + HTML content).
    cache_key = str(project_path) + html_snippet
    content_hash = hashlib.md5(cache_key.encode()).hexdigest()[:12]
    output_path = output_dir / f"html_block_{content_hash}.png"

    if output_path.exists():
        return output_path  # already rendered; skip

    # Build a minimal self-contained HTML page.
    # The temp file is written into the project directory so that relative
    # image src attributes resolve to the project's own files without any
    # cross-directory file:// security restrictions.
    page_html = (
        "<!DOCTYPE html>\n"
        "<html>\n"
        "<head>\n"
        "  <meta charset=\"utf-8\">\n"
        "  <style>\n"
        "    * { margin: 0; padding: 0; box-sizing: border-box; }\n"
        f"    body {{ width: {width}px; background: white; "
        "font-family: sans-serif; }\n"
        "  </style>\n"
        "</head>\n"
        "<body>\n"
        f"{html_snippet}\n"
        "</body>\n"
        "</html>\n"
    )

    raw_png = output_dir / f"html_block_{content_hash}_raw.png"

    # Write the temp HTML file *inside* the project directory so Chrome's
    # same-origin file:// security policy allows it to load sibling images
    # without needing --allow-file-access-from-files.
    tmp_html = project_path / f".html_render_{content_hash}.html"
    try:
        tmp_html.write_text(page_html, encoding='utf-8')
        result = subprocess.run(
            [
                _CHROME,
                '--headless',
                '--no-sandbox',
                '--disable-gpu',
                f'--screenshot={raw_png}',
                f'--window-size={width},3000',
                '--hide-scrollbars',
                '--virtual-time-budget=5000',
                f'file://{tmp_html}',
            ],
            capture_output=True, text=True, timeout=30, check=False,
        )

        if result.returncode != 0 or not raw_png.exists():
            print(f"  \u26a0 Chrome screenshot failed (rc={result.returncode})")
            if result.stderr:
                print(f"    {result.stderr[:200]}")
            return None

        _autocrop(raw_png, output_path)
        raw_png.unlink(missing_ok=True)
        return output_path

    except subprocess.TimeoutExpired:
        print("  \u26a0 Chrome screenshot timed out")
        raw_png.unlink(missing_ok=True)
        return None

    finally:
        tmp_html.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _autocrop(src: Path, dst: Path, padding: int = 8) -> None:
    """Save *src* to *dst* with white rows/columns trimmed from all sides.

    Args:
        src:     Source PNG (typically a full 1200×3000 Chrome screenshot).
        dst:     Destination PNG (content bounding box + *padding* pixels).
        padding: Whitespace margin to preserve around the content area.
    """
    from PIL import Image, ImageChops

    img = Image.open(src).convert('RGB')
    bg   = Image.new('RGB', img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()   # None when image is entirely white

    if bbox is None:
        # Nothing visible — save a tiny placeholder so LaTeX doesn't error.
        img.crop((0, 0, 1, 1)).save(dst)
        return

    w, h = img.size
    left   = max(0, bbox[0] - padding)
    top    = max(0, bbox[1] - padding)
    right  = min(w, bbox[2] + padding)
    bottom = min(h, bbox[3] + padding)

    img.crop((left, top, right, bottom)).save(dst)
