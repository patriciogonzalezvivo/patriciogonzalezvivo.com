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

from .images import svg_to_pdf

from portfolio.images import find_images, find_svgs
from portfolio.utils import strip_markdown, markdown_to_latex, escape_latex, _WRAPFIG_RE


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

def readme_to_latex(markdown: str, project_path: Path, project_dir: str = '') -> str:
    """Convert a README.md to LaTeX, embedding inline SVG figures.

    SVG image references using the Markdown syntax ``![alt](svg/file.svg)``
    are converted to centred ``\\includesvg`` figures; all other content
    passes through :func:`~portfolio.utils.markdown_to_latex`.

    Args:
        markdown:     Raw Markdown text (typically README.md contents).
        project_path: Absolute path to the project directory, used to
                      resolve relative SVG paths to absolute paths.
        project_dir:  Workspace-relative project directory (e.g.
                      ``"2026/santos"``).  When provided, relative ``src:``
                      paths inside ``:::wrapfig`` blocks are prefixed with
                      this value so XeLaTeX can locate the images.

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
            # Prose chunk — convert Markdown directly; wrapfig blocks and
            # HTML/image stripping are handled inside markdown_to_latex.
            # If a project_dir is known, resolve project-relative src: paths
            # in :::wrapfig blocks to workspace-relative paths so XeLaTeX
            # can find them (it runs from the workspace root).
            chunk = part
            if project_dir:
                prefix = project_dir.rstrip('/')
                def _fix_src(m: re.Match) -> str:
                    side, body = m.group(1), m.group(2)
                    body = re.sub(
                        r'^(src\s*:\s*)(?!https?://)(.+)$',
                        lambda sm: sm.group(1) + prefix + '/' + sm.group(2).strip(),
                        body, flags=re.MULTILINE,
                    )
                    return f':::wrapfig {side}\n{body}:::\n'
                chunk = _WRAPFIG_RE.sub(_fix_src, part)
            result.append(markdown_to_latex(chunk))
        elif mod == 1:
            pass  # alt text — discard
        else:
            # SVG path relative to project dir (e.g. "svg/000_light.svg")
            svg_full = (project_path / part).resolve()
            pdf_path = svg_to_pdf(svg_full)
            if pdf_path:
                result.append(
                    f"\n\n\\begin{{center}}\n"
                    f"  \\includegraphics[width=0.7\\textwidth]{{{pdf_path}}}\n"
                    f"\\end{{center}}\n\n"
                )

    return ''.join(result)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_project_meta(project_path, base_path: Path) -> Dict:
    """Read all metadata for a project and return a *project dict*.

    Args:
        project_path: Either a workspace-relative path string (e.g.
                      ``"2025/hybrids"``) or a dict with at least a ``"path"``
                      key (e.g. ``{"path": "2025/hybrids", "images_per_page": 2}``).
                      Extra keys in the dict are merged into the returned dict.
        base_path:    Workspace root (``Path`` object).

    Returns:
        A project dict; see module docstring for key descriptions.
    """
    # Accept either a plain string path or a dict entry from portfolio/data.json
    extra: Dict = {}
    if isinstance(project_path, dict):
        entry = project_path
        project_path = entry['path']
        extra = {k: v for k, v in entry.items() if k != 'path'}

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

    result = {
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
    result.update(extra)
    return result
