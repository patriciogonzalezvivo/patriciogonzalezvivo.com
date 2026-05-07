"""
portfolio/metadata.py
---------------------
Project metadata reader for the portfolio generator.

Responsibilities:
  - Reading per-project flat-file metadata (TITLE.txt, MEDIUM.txt, etc.).
  - Parsing and converting README.md / about.md content.
  - Assembling a single *project dict* that the LaTeX builder consumes.

A *project dict* has the following keys:

    path        (str)        – workspace-relative path, e.g. "2025/hybrids"
    year        (str)        – year component of path
    folder      (str)        – project folder name
    title       (str)        – display title (TITLE.txt or derived from folder)
    medium      (str | None) – MEDIUM.txt content
    description (str | None) – DESCRIPTION.txt content
    dimensions  (str | None) – DIMENSIONS.txt content
    about       (str | None) – plain-text body from about.md or README.md
    readme_raw  (str | None) – raw README.md text (used for inline SVG expansion)
    thumb       (str | None) – thumbnail filename inside the project directory
    images      ([str])      – workspace-relative image paths  (see images.py)
    svgs        ([str])      – absolute SVG paths              (see images.py)
    images_per_page (int)    – grouping hint from portfolio_data.json (default 3)
"""

import re
from pathlib import Path
from typing import Dict, Optional

from portfolio.images import find_images, find_svgs
from portfolio.utils import strip_markdown, markdown_to_latex, escape_latex


# ---------------------------------------------------------------------------
# Low-level file helpers
# ---------------------------------------------------------------------------

def read_file(path: Path) -> Optional[str]:
    """Return stripped file content, or ``None`` when the file does not exist."""
    if path.exists():
        return path.read_text().strip()
    return None


# ---------------------------------------------------------------------------
# README / about.md conversion
# ---------------------------------------------------------------------------

def readme_to_latex(markdown: str, project_path: Path) -> str:
    """Convert a README.md to LaTeX, embedding inline SVG figures.

    SVG image references using the Markdown syntax ``![alt](svg/file.svg)``
    are converted to centred ``\\includesvg`` figures; all other content
    passes through :func:`~portfolio.utils.strip_markdown` and then
    :func:`~portfolio.utils.markdown_to_latex`.

    Args:
        markdown:     Raw Markdown text (typically README.md contents).
        project_path: Absolute path to the project directory, used to
                      resolve relative SVG paths to absolute paths.

    Returns:
        LaTeX string ready for inclusion in the document body.
    """
    svg_pattern = re.compile(r'!\[([^\]]*)\]\((svg/[^\)]+\.svg)\)')
    # split yields: [text, alt, svg_path, text, alt, svg_path, ..., text]
    parts = svg_pattern.split(markdown)

    result = []
    for i, part in enumerate(parts):
        mod = i % 3
        if mod == 0:
            # Prose chunk — strip Markdown then convert to LaTeX
            result.append(markdown_to_latex(strip_markdown(part)))
        elif mod == 1:
            pass  # alt text — discard
        else:
            # SVG path relative to project dir (e.g. "svg/000_light.svg")
            # Kept as a comment placeholder; un-comment the lines below to
            # actually embed SVGs once svg LaTeX package is confirmed working.
            abs_path = str((project_path / part).resolve())
            # result.append(
            #     f"\n\n\\begin{{center}}\n"
            #     f"  \\includesvg[scale=0.5]{{{abs_path}}}\n"
            #     f"\\end{{center}}\n\n"
            # )

    return ''.join(result)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_project_meta(project_path: str, base_path: Path) -> Dict:
    """Read all metadata for a project and return a *project dict*.

    Args:
        project_path: Workspace-relative path, e.g. ``"2025/hybrids"``.
        base_path:    Workspace root (``Path`` object).

    Returns:
        A project dict; see module docstring for key descriptions.
    """
    full_path = base_path / project_path
    parts     = project_path.strip('/').split('/')
    year      = parts[0] if parts else ''
    folder    = parts[1] if len(parts) > 1 else ''

    # ------------------------------------------------------------------
    # Flat-file metadata
    # ------------------------------------------------------------------
    title       = read_file(full_path / 'TITLE.txt')
    medium      = read_file(full_path / 'MEDIUM.txt')
    description = read_file(full_path / 'DESCRIPTION.txt')
    dimensions  = read_file(full_path / 'DIMENSIONS.txt')

    # ------------------------------------------------------------------
    # Long-form description: about.md preferred over README.md
    # ------------------------------------------------------------------
    about      = read_file(full_path / 'about.md')
    readme_raw = None

    if not about:
        raw = read_file(full_path / 'README.md')
        if raw:
            readme_raw = raw
            about = strip_markdown(raw)

    # ------------------------------------------------------------------
    # Thumbnail (first match wins)
    # ------------------------------------------------------------------
    thumb = None
    for name in ('thumb.gif', 'thumb.jpg', 'thumb.png'):
        if (full_path / name).exists():
            thumb = name
            break

    return {
        'path':           project_path,
        'year':           year,
        'folder':         folder,
        'title':          title or folder.replace('_', ' ').title(),
        'medium':         medium,
        'description':    description,
        'dimensions':     dimensions,
        'about':          about,
        'readme_raw':     readme_raw,
        'thumb':          thumb,
        'images':         find_images(full_path, base_path),
        'svgs':           find_svgs(full_path),
        'images_per_page': 3,   # overwritten by the caller if set in JSON
    }
