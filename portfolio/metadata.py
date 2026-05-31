"""
portfolio/metadata.py
---------------------
Project metadata reader for the portfolio generator.

Responsibilities:
  - Reading per-project flat-file metadata (TITLE.txt, MEDIUM.txt, etc.).
  - Parsing and converting README.md content.
  - Assembling a single *project dict* that the LaTeX builder consumes.

A *project dict* has the following keys:

    path        (str)        – workspace-relative path, e.g. "2025/hybrids"
    year        (str)        – year component of path
    folder      (str)        – project folder name
    title       (str)        – display title (TITLE.txt or derived from folder)
    medium      (str | None) – MEDIUM.txt content
    description (str | None) – DESCRIPTION.txt content
    dimensions  (str | None) – DIMENSIONS.txt content
    about       (str | None) – plain-text body from README.md
    readme_raw  (str | None) – raw README.md text (used for inline SVG expansion)
    thumb       (str | None) – thumbnail filename inside the project directory
    images      ([str])      – workspace-relative image paths  (see images.py)
    svgs        ([str])      – absolute SVG paths              (see images.py)
    images_per_page (int)    – grouping hint from portfolio_data.json (default 3)
"""

import re
from pathlib import Path
from typing import Dict, Optional
from urllib.parse import urljoin

from .images import svg_to_pdf

from portfolio.images import find_images, find_svgs
from portfolio.utils import (
    strip_markdown, markdown_to_latex, escape_latex, find_thumbnail,
    _WRAPFIG_RE, _HTML_BLOCK_RE, THUMBNAIL_EXTS_STATIC,
)
from portfolio.html_render import render_html_block
from portfolio.berthe.berthe.looom import is_looom_svg, looom_frame_to_png


# ---------------------------------------------------------------------------
# Low-level file helpers
# ---------------------------------------------------------------------------

def read_file(path: Path) -> Optional[str]:
    """Return stripped file content, or ``None`` when the file does not exist."""
    if path.exists():
        return path.read_text().strip()
    return None


# ---------------------------------------------------------------------------
# Looom SVG wrapfig conversion
# ---------------------------------------------------------------------------

def _convert_looom_wrapfigs(chunk: str, base_path: Path, rendered_dir: Path) -> str:
    """Replace Looom SVG ``src:`` paths in ``:::wrapfig`` blocks with PNG frames.

    When a ``:::wrapfig`` block's ``src:`` key points to a Looom animation
    SVG, this function:

      1. Detects the Looom file via :func:`is_looom_svg`.
      2. Reads optional ``frame:`` (int) and ``time:`` (float) keys from
         the block body.  ``frame:`` takes priority; default is frame 0.
      3. Calls :func:`looom_frame_to_png` to extract and rasterise the frame.
      4. Replaces the ``src:`` value with the workspace-relative PNG path.

    The generated PNGs are cached in *rendered_dir* under the name
    ``looom_<stem>[_f<N>|_t<T>].png`` so repeated builds do not re-render.

    Args:
        chunk:        Markdown text that may contain ``:::wrapfig`` blocks.
        base_path:    Workspace root (used to resolve ``src:`` paths and
                      to compute the relative PNG output path).
        rendered_dir: Directory where generated PNG frames are written.

    Returns:
        The chunk with Looom SVG ``src:`` values replaced by PNG paths.
    """
    def _replace(m: re.Match) -> str:
        side, body = m.group(1), m.group(2)

        # Extract src
        src_m = re.search(r'^src\s*:\s*(.+)$', body, re.MULTILINE)
        if not src_m:
            return m.group(0)
        src = src_m.group(1).strip()

        if not src.lower().endswith('.svg'):
            return m.group(0)

        full_svg = base_path / src
        if not full_svg.exists() or not is_looom_svg(full_svg):
            return m.group(0)

        # Parse optional frame: / time: keys
        frame_m = re.search(r'^frame\s*:\s*(\d+)', body, re.MULTILINE)
        time_m  = re.search(r'^time\s*:\s*([\d.]+)', body, re.MULTILINE)

        use_frame: Optional[int]  = int(frame_m.group(1)) if frame_m else None
        use_time:  float          = float(time_m.group(1)) if time_m else 0.0

        # Build a deterministic cache filename
        stem = full_svg.stem
        if use_frame is not None:
            png_name = f'looom_{stem}_f{use_frame}.png'
        elif use_time != 0.0:
            safe_t = f'{use_time:.3f}'.replace('.', '_')
            png_name = f'looom_{stem}_t{safe_t}.png'
        else:
            png_name = f'looom_{stem}_f0.png'

        rendered_dir.mkdir(parents=True, exist_ok=True)
        png_path = rendered_dir / png_name

        if not png_path.exists():
            ok = looom_frame_to_png(
                full_svg,
                png_path,
                frame=use_frame,
                time=use_time,
                margin_frac=0.10,
                width=800,
            )
            if not ok:
                # Conversion failed — keep original src unchanged
                return m.group(0)

        # Replace src: with workspace-relative PNG path
        png_rel = str(png_path.relative_to(base_path))
        new_body = re.sub(
            r'^(src\s*:\s*).+$',
            lambda sm: sm.group(1) + png_rel,
            body,
            flags=re.MULTILINE,
        )
        # Drop the frame: / time: keys so they don't end up in LaTeX captions
        new_body = re.sub(r'^frame\s*:.*$\n?', '', new_body, flags=re.MULTILINE)
        new_body = re.sub(r'^time\s*:.*$\n?',  '', new_body, flags=re.MULTILINE)

        return f':::wrapfig {side}\n{new_body}:::'

    return _WRAPFIG_RE.sub(_replace, chunk)


# ---------------------------------------------------------------------------
# README / about.md conversion
# ---------------------------------------------------------------------------

def readme_to_latex(markdown: str, project_path: Path, project_dir: str = '',
                    base_url: str = '', center_svgs: bool = True,
                    divider=None) -> str:
    """Convert a README.md to LaTeX, embedding inline SVG figures.

    SVG image references using the Markdown syntax ``![alt](svg/file.svg)``
    are converted to centred ``\\includesvg`` figures; raw HTML block
    elements (``<div>``, ``<table>``, etc.) are rendered to PNG images via
    headless Chrome and embedded with ``\\includegraphics``; all other
    content passes through :func:`~portfolio.utils.markdown_to_latex`.

    Args:
        markdown:     Raw Markdown text (typically README.md contents).
        project_path: Absolute path to the project directory, used to
                      resolve relative SVG paths and HTML image ``src``
                      attributes to absolute paths.
        project_dir:  Workspace-relative project directory (e.g.
                      ``"2026/santos"``).  When provided, relative ``src:``
                      paths inside ``:::wrapfig`` blocks are prefixed with
                      this value so XeLaTeX can locate the images.
        base_url:     Website base URL (e.g. ``"https://patriciogonzalezvivo.com"``).
                      When provided, relative hyperlinks (Markdown links and
                      ``link:`` keys in ``:::wrapfig`` blocks) are resolved to
                      absolute website URLs so the PDF does not link to the
                      local filesystem.

    Returns:
        LaTeX string ready for inclusion in the document body.
    """
    # Ensure project_path is absolute so all derived paths (file:// URLs,
    # relative_to() calls) work correctly regardless of the CWD.
    project_path = project_path.resolve()

    # Derive the workspace root from project_path + project_dir depth so
    # rendered PNG paths can be expressed relative to the workspace root
    # (XeLaTeX runs from there).
    if project_dir:
        _base = project_path
        for _ in Path(project_dir).parts:
            _base = _base.parent
        _rendered_dir = _base / 'temp_portfolio' / 'html_renders'
    else:
        _base = project_path
        _rendered_dir = project_path / 'html_renders'

    svg_pattern = re.compile(r'!\[([^\]]*)\]\((svg/[^\)]+\.svg)\)')
    # split yields: [text, alt, svg_path, text, alt, svg_path, ..., text]
    parts = svg_pattern.split(markdown)

    result = []
    for i, part in enumerate(parts):
        mod = i % 3
        if mod == 0:
            # Prose chunk — convert Markdown, handling:
            #   1. :::wrapfig blocks  (resolve project-relative src: paths)
            #   2. Raw HTML blocks    (render to PNG via headless Chrome)
            #   3. Everything else   (markdown_to_latex strips remaining HTML)
            chunk = part

            # 1. Resolve project-relative src: paths in :::wrapfig blocks
            #    and make link: values absolute website URLs.
            if project_dir:
                prefix = project_dir.rstrip('/')
                _project_page_url = (
                    base_url.rstrip('/') + '/' + prefix + '/'
                    if base_url else ''
                )
                def _fix_src(m: re.Match) -> str:
                    side, body = m.group(1), m.group(2)
                    # Fix src: → workspace-relative path for XeLaTeX
                    body = re.sub(
                        r'^(src\s*:\s*)(?!https?://)(.+)$',
                        lambda sm: sm.group(1) + prefix + '/' + sm.group(2).strip(),
                        body, flags=re.MULTILINE,
                    )
                    # Fix link: → absolute website URL
                    if _project_page_url:
                        body = re.sub(
                            r'^(link\s*:\s*)(?!https?://)(.+)$',
                            lambda sm: sm.group(1) + urljoin(
                                _project_page_url, sm.group(2).strip()),
                            body, flags=re.MULTILINE,
                        )
                    return f':::wrapfig {side}\n{body}:::'
                chunk = _WRAPFIG_RE.sub(_fix_src, chunk)

            # 1b-extra. Convert Looom SVG src: references to PNG frames so
            #   XeLaTeX can embed them.  This step reads the optional
            #   ``frame:`` / ``time:`` wrapfig keys and honours them.
            chunk = _convert_looom_wrapfigs(chunk, _base, _rendered_dir)

            # 1b. Resolve relative Markdown links [text](url) to absolute URLs.
            if base_url and project_dir:
                _project_page_url = (
                    base_url.rstrip('/') + '/' + project_dir.rstrip('/') + '/'
                )
                def _fix_md_link(m: re.Match) -> str:
                    link_text, url = m.group(1), m.group(2)
                    if not url.startswith(('http://', 'https://', '#', 'mailto:')):
                        url = urljoin(_project_page_url, url)
                    return f'[{link_text}]({url})'
                chunk = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', _fix_md_link, chunk)

            # 2. Render raw HTML block elements to PNG images and replace
            #    them with \\includegraphics placeholders.  The placeholders
            #    survive markdown_to_latex's escape pass (\\x01 is not a
            #    LaTeX-special character) and are re-injected afterwards.
            html_subs: dict = {}
            def _render_html(m: re.Match) -> str:
                img_path = render_html_block(
                    m.group(0), project_path, _rendered_dir)
                if img_path is None:
                    return ''  # drop unrenderable blocks silently
                key = f'\x01HTML{len(html_subs)}\x01'
                rel = img_path.relative_to(_base)
                html_subs[key] = (
                    f'\n\n\\begin{{center}}\n'
                    f'  \\includegraphics[width=\\linewidth]{{{rel}}}\n'
                    f'\\end{{center}}\n\n'
                )
                return key
            chunk = _HTML_BLOCK_RE.sub(_render_html, chunk)

            # 3. Convert remaining Markdown to LaTeX, then restore images.
            latex = markdown_to_latex(chunk, divider=divider)
            for key, value in html_subs.items():
                latex = latex.replace(key, value)
            result.append(latex)
        elif mod == 1:
            pass  # alt text — discard
        else:
            # SVG path relative to project dir (e.g. "svg/000_light.svg")
            svg_full = (project_path / part).resolve()
            pdf_path = svg_to_pdf(svg_full)
            if pdf_path:
                if center_svgs:
                    result.append(
                        f"\n\n\\begin{{center}}\n"
                        f"  \\includegraphics[width=0.7\\textwidth]{{{pdf_path}}}\n"
                        f"\\end{{center}}\n\n"
                    )
                else:
                    result.append(
                        f"\n\n\\includegraphics[width=0.7\\textwidth]{{{pdf_path}}}\n\n"
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
    year_override = read_file(full_path / 'YEAR.txt')
    if year_override:
        year = year_override
    title       = read_file(full_path / 'TITLE.txt')
    medium      = read_file(full_path / 'MEDIUM.txt')
    description = read_file(full_path / 'DESCRIPTION.txt')
    dimensions  = read_file(full_path / 'DIMENSIONS.txt')

    # ------------------------------------------------------------------
    # Long-form description: README.md
    # ------------------------------------------------------------------
    readme_raw = None
    about      = None

    raw = read_file(full_path / 'README.md')
    if raw:
        readme_raw = raw
        about = strip_markdown(raw)

    # ------------------------------------------------------------------
    # Thumbnail (first match wins)
    # ------------------------------------------------------------------
    thumb = find_thumbnail(full_path)

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


def get_featured_item_meta(project_path: str, base_path: Path) -> Dict:
    """Read minimal metadata for a featured-section thumbnail item.

    Only the fields required for a thumbnail caption are loaded — no images,
    SVGs, or README processing.  The larger ``thumbnail.*`` variant is
    preferred over the smaller ``thumb.*`` so the featured grid looks sharp.

    Args:
        project_path: Workspace-relative path string (e.g. ``"2019/hogar"``).
        base_path:    Workspace root.

    Returns:
        Dict with keys: ``path``, ``year``, ``folder``, ``title``, ``medium``,
        ``dimensions``, ``thumb``.
    """
    full_path = base_path / project_path
    parts     = project_path.strip('/').split('/')
    year      = parts[0] if parts else ''
    folder    = parts[1] if len(parts) > 1 else ''

    year_override = read_file(full_path / 'YEAR.txt')
    if year_override:
        year = year_override

    title      = read_file(full_path / 'TITLE.txt') or folder.replace('_', ' ').title()
    medium     = read_file(full_path / 'MEDIUM.txt')
    dimensions = read_file(full_path / 'DIMENSIONS.txt')

    # Prefer the larger 'thumbnail.*' for the featured grid; fall back to 'thumb.*'
    thumb = find_thumbnail(full_path, ('thumbnail', 'thumb'), THUMBNAIL_EXTS_STATIC)

    return {
        'path':       project_path,
        'year':       year,
        'folder':     folder,
        'title':      title,
        'medium':     medium,
        'dimensions': dimensions,
        'thumb':      thumb,
    }
