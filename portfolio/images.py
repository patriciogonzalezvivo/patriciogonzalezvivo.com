"""
portfolio/images.py
-------------------
Image-related helpers for the portfolio generator.

Responsibilities:
  - Finding images and SVGs inside a project directory.
  - Reading image pixel dimensions without third-party dependencies.
  - Parsing sidecar ``.txt`` files that annotate individual images.
  - Building a per-project *render plan* that groups portrait images
    side-by-side and sends everything else to individual pages.
"""

import shutil
import struct
import subprocess
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from portfolio.utils import find_thumbnail, THUMBNAIL_EXTS_STATIC


# ---------------------------------------------------------------------------
# Image discovery
# ---------------------------------------------------------------------------

def find_images(project_path: Path, base_path: Path) -> List[str]:
    """Return workspace-relative paths for all printable images in *project_path*.

    Search order:
      1. ``images/`` sub-directory (sorted, no thumbnails, no GIFs).
      2. Fallback to a single ``thumbnail.{jpg,jpeg,png}`` in the project root
         when ``images/`` is absent or empty — common for WASM-only projects.

    Args:
        project_path: Absolute path to the project directory.
        base_path:    Workspace root used to build relative paths.

    Returns:
        List of paths relative to *base_path*, e.g. ``["2025/hybrids/images/01.jpg"]``.
    """
    images_dir = project_path / 'images'
    images: List[str] = []

    if images_dir.exists():
        for img in sorted(images_dir.iterdir()):
            if (img.suffix.lower() in ('.jpg', '.jpeg', '.png')
                    and 'thumb' not in img.name.lower()):
                images.append(str(img.relative_to(base_path)))

    # Fallback: root thumbnail when images/ is empty or missing
    if not images:
        name = find_thumbnail(project_path, ('thumbnail',), THUMBNAIL_EXTS_STATIC)
        if name:
            images.append(str((project_path / name).relative_to(base_path)))

    return images


def find_svgs(project_path: Path) -> List[str]:
    """Return absolute paths for all SVG files inside ``project_path/svg/``.

    Returns an empty list when the ``svg/`` directory does not exist.
    """
    svg_dir = project_path / 'svg'
    if not svg_dir.exists():
        return []
    return sorted(
        str(svg.absolute())
        for svg in svg_dir.iterdir()
        if svg.suffix.lower() == '.svg'
    )


# ---------------------------------------------------------------------------
# Image dimension reading (pure-Python, no Pillow required)
# ---------------------------------------------------------------------------

def read_image_dimensions(full_path: Path) -> Tuple[int, int]:
    """Return ``(width, height)`` for a JPEG or PNG file without Pillow.

    Returns ``(0, 0)`` on any read or parse failure.
    """
    try:
        with open(full_path, 'rb') as fh:
            header = fh.read(26)

        # PNG: 8-byte magic + IHDR chunk (length, type, width, height)
        if header[:8] == b'\x89PNG\r\n\x1a\n':
            w = struct.unpack('>I', header[16:20])[0]
            h = struct.unpack('>I', header[20:24])[0]
            return (w, h)

        # JPEG: scan forward for a SOF0/SOF1/SOF2/SOF3 marker
        with open(full_path, 'rb') as fh:
            data = fh.read()

        i = 0
        while i < len(data) - 1:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3):
                h = struct.unpack('>H', data[i + 5:i + 7])[0]
                w = struct.unpack('>H', data[i + 7:i + 9])[0]
                return (w, h)
            # Skip markers with no length field
            if marker in (0xD8, 0xD9, 0x01) or (0xD0 <= marker <= 0xD7):
                i += 2
            else:
                if i + 4 > len(data):
                    break
                length = struct.unpack('>H', data[i + 2:i + 4])[0]
                i += 2 + length

    except Exception:
        pass

    return (0, 0)


# ---------------------------------------------------------------------------
# Sidecar metadata
# ---------------------------------------------------------------------------

# Keys we recognise inside sidecar .txt files.
_SIDECAR_KEYS = frozenset({'title', 'year', 'medium', 'dimension', 'dimensions', 'description'})


def parse_sidecar(img_path: Path) -> Dict[str, str]:
    """Parse a ``key: value`` sidecar ``.txt`` file that shares its stem with *img_path*.

    Only the keys in ``_SIDECAR_KEYS`` are returned.  Unknown keys (e.g.
    ``print``) are silently ignored.  Returns an empty dict when the sidecar
    file does not exist.
    """
    txt_file = img_path.with_suffix('.txt')
    if not txt_file.exists():
        return {}

    result: Dict[str, str] = {}
    for line in txt_file.read_text().strip().splitlines():
        if ':' in line:
            key, _, value = line.partition(':')
            key = key.strip().lower()
            if key in _SIDECAR_KEYS:
                result[key] = value.strip()
    return result


# ---------------------------------------------------------------------------
# Render plan
# ---------------------------------------------------------------------------

def build_render_plan(
    images: List[str],
    base_path: Path,
    group_size: int = 3,
) -> List[tuple]:
    """Classify images into grouped and individual render entries.

    Portrait images (height > width) that share the same *medium* **and**
    *dimensions* sidecar values are collected into consecutive runs; complete
    runs of length ``≥ group_size`` are split into groups of exactly
    ``group_size`` images.  Any remainder, and all other images, become
    individual entries.

    Args:
        images:     Ordered list of workspace-relative image paths.
        base_path:  Workspace root used to resolve full paths for dimension
                    reading and sidecar parsing.
        group_size: Number of portrait images to place side-by-side (2–4).
                    Pass 1 to disable grouping entirely.

    Returns:
        A list of ``(kind, payload)`` tuples where:
          - ``('group', [(img_path, meta), ...])`` — ``group_size`` portraits.
          - ``('individual', img_path)``            — single image.
    """
    plan: List[tuple] = []
    i = 0

    while i < len(images):
        img = images[i]
        full = base_path / img
        w, h = read_image_dimensions(full)

        if group_size >= 2 and h > w > 0:
            meta = parse_sidecar(full)
            medium = meta.get('medium', '')
            dims   = meta.get('dimensions') or meta.get('dimension', '')

            if medium or dims:
                # Collect the longest consecutive run with identical medium+dims
                run: List[Tuple[str, Dict]] = [(img, meta)]
                j = i + 1
                while j < len(images):
                    img2 = images[j]
                    w2, h2 = read_image_dimensions(base_path / img2)
                    if h2 > w2 > 0:
                        meta2 = parse_sidecar(base_path / img2)
                        if (meta2.get('medium', '') == medium
                                and (meta2.get('dimensions') or meta2.get('dimension', '')) == dims):
                            run.append((img2, meta2))
                            j += 1
                        else:
                            break
                    else:
                        break

                if len(run) >= group_size:
                    n_groups = len(run) // group_size
                    for g in range(n_groups):
                        plan.append(('group', run[g * group_size:(g + 1) * group_size]))
                    # Remainder → individual pages
                    for img_path, _ in run[n_groups * group_size:]:
                        plan.append(('individual', img_path))
                    i = j
                    continue

        plan.append(('individual', img))
        i += 1

    return plan


# ---------------------------------------------------------------------------
# SVG → PDF conversion (no inkscape required)
# ---------------------------------------------------------------------------

def svg_to_pdf(svg_path: Path) -> Optional[Path]:
    """Convert an SVG file to a PDF sibling, using the first available tool.

    Tries in order:
      1. ``rsvg-convert`` (``librsvg2-bin`` — fast, no LaTeX required)
      2. ``inkscape``    (already present on most TeX systems)

    The output is written next to the source with a ``.pdf`` extension
    (e.g. ``svg/000_light.svg`` → ``svg/000_light.pdf``) and the conversion
    is skipped when the PDF is already up-to-date.

    Returns the ``.pdf`` path on success, or ``None`` when no converter is
    available or the conversion fails.
    """
    pdf_path = svg_path.with_suffix('.pdf')

    # Skip if PDF is already up-to-date
    if pdf_path.exists() and pdf_path.stat().st_mtime >= svg_path.stat().st_mtime:
        return pdf_path

    # ── rsvg-convert ────────────────────────────────────────────────────────
    if shutil.which('rsvg-convert'):
        result = subprocess.run(
            ['rsvg-convert', '--format=pdf', '--output', str(pdf_path), str(svg_path)],
            capture_output=True, text=True,
        )
        if result.returncode == 0 and pdf_path.exists():
            return pdf_path
        print(f"Warning: rsvg-convert failed for {svg_path.name}: {result.stderr.strip()}")

    # ── inkscape (fallback) ──────────────────────────────────────────────────
    if shutil.which('inkscape'):
        result = subprocess.run(
            ['inkscape', str(svg_path), f'--export-filename={pdf_path}'],
            capture_output=True, text=True,
        )
        if result.returncode == 0 and pdf_path.exists():
            return pdf_path
        print(f"Warning: inkscape export failed for {svg_path.name}: {result.stderr.strip()}")

    print(
        f"Warning: could not convert {svg_path.name} to PDF — SVG will be skipped.\n"
        "  Install rsvg-convert with:  sudo apt install librsvg2-bin"
    )
    return None
