"""
portfolio/pages.py
------------------
Per-artwork LaTeX page rendering.

Responsibilities:
  - Building the title-bar + description page for each project.
  - Laying out additional image pages (portrait groups side-by-side,
    other images on individual alternating-side pages).
  - Formatting image captions from sidecar metadata.

Page layout overview
~~~~~~~~~~~~~~~~~~~~
Each artwork occupies one or more pages:

  Page 1  (short description)
  ┌─────────────────────────────────────────┐
  │ Title                             Year  │
  │ ─────────────────────────────────────── │
  │  Description text   │  First image      │
  └─────────────────────────────────────────┘

  Page 1  (long description — image moved to additional pages)
  ┌─────────────────────────────────────────┐
  │ Title                             Year  │
  │ ─────────────────────────────────────── │
  │  Full-width description text            │
  └─────────────────────────────────────────┘

  Additional image pages alternate left / right.
  Portrait images that share medium + dimensions are placed in groups
  of ``images_per_page`` per page.
"""

from pathlib import Path
from typing import Dict, List

from portfolio.utils import (
    escape_latex, markdown_to_latex, find_thumbnail, THUMBNAIL_EXTS_STATIC,
)
from portfolio.images import build_render_plan, parse_sidecar
from portfolio.metadata import readme_to_latex


# ---------------------------------------------------------------------------
# Caption builder
# ---------------------------------------------------------------------------

def build_caption(img_path: str, base_path: Path, align_right: bool = False) -> str:
    """Build a LaTeX caption block from a same-stem ``.txt`` sidecar file.

    Structured layout (when the sidecar uses ``key: value`` pairs):
      Line 1 – *title*, *year*  (comma-separated, whichever are present)
      Line 2 – *medium*
      Line 3 – *dimension(s)* or *description*

    Falls back to line-by-line plain text for unstructured sidecar files.

    Args:
        img_path:    Workspace-relative image path.
        base_path:   Workspace root used to resolve the sidecar path.
        align_right: When ``True`` (caption on the left side of the page)
                     the text is right-aligned (``\\raggedleft``); otherwise
                     left-aligned (``\\raggedright``).

    Returns:
        A LaTeX snippet ready to be dropped inside a ``minipage``, or an
        empty string when no sidecar exists.
    """
    txt_file = (base_path / img_path).with_suffix('.txt')
    if not txt_file.exists():
        return ""

    raw    = txt_file.read_text().strip()
    parsed = parse_sidecar(base_path / img_path)

    if not parsed:
        # Unstructured file — render each line verbatim
        lines = [escape_latex(ln) for ln in raw.splitlines() if ln.strip()]
        if not lines:
            return ""
        return _caption_tabular(lines, align_right)

    caption_lines: List[str] = []

    # Line 1: title and/or year
    line1 = ", ".join(
        filter(None, [
            escape_latex(parsed.get('title', '')),
            escape_latex(parsed.get('year', '')),
        ])
    )
    if line1:
        caption_lines.append(line1)

    # Line 2: medium
    if parsed.get('medium'):
        caption_lines.append(escape_latex(parsed['medium']))

    # Line 3: dimensions, falling back to description
    dim = parsed.get('dimensions') or parsed.get('dimension', '')
    if dim:
        caption_lines.append(escape_latex(dim))
    elif parsed.get('description'):
        caption_lines.append(escape_latex(parsed['description']))

    if not caption_lines:
        return ""

    return _caption_tabular(caption_lines, align_right)


def _caption_tabular(lines: List[str], align_right: bool) -> str:
    """Wrap *lines* in a tabular with stable row spacing.

    Tabular rows are unaffected by the parskip package's ``\\everypar`` hooks
    that would otherwise inflate spacing between paragraphs.
    """
    tab_col = "r" if align_right else "l"
    prefix  = "\\hfill" if align_right else ""
    rows    = "\\\\\n".join(lines)
    return (
        f"{prefix}{{\\renewcommand{{\\arraystretch}}{{1.0}}\\setstretch{{1.0}}\\selectfont\n"
        f"\\begin{{tabular}}[b]{{@{{}}{tab_col}@{{}}}}\n"
        + rows + "\n"
        "\\end{tabular}}"
    )


# ---------------------------------------------------------------------------
# URL helpers
# ---------------------------------------------------------------------------

def _image_url(img_path: str, project_url: str) -> str:
    """Return the web URL for an image in the portfolio.

    Gallery images (inside an ``images/`` sub-directory) link directly to
    the fullscreen hash anchor.  Everything else (slideshow frames, root
    thumbnails) links to the project page.
    """
    if '/images/' in img_path:
        basename = Path(img_path).stem
        return f"{project_url}#{basename}"
    return project_url


def _project_page_url(project: Dict, base_url: str) -> str:
    """Return the absolute web URL for a project page, or an empty string."""
    if not base_url:
        return ''
    return f"{base_url.rstrip('/')}/{project['path'].rstrip('/')}/"


# ---------------------------------------------------------------------------
# Per-artwork page builder
# ---------------------------------------------------------------------------

def build_artwork_pages(project: Dict, base_path: Path, base_url: str = '') -> str:
    """Return LaTeX for all pages belonging to a single artwork / project.

    Args:
        project:   Project dict produced by :func:`~portfolio.metadata.get_project_meta`.
        base_path: Workspace root.
        base_url:  Artist website base URL (e.g. ``https://patriciogonzalezvivo.com``).

    Returns:
        LaTeX string (starts with ``\\clearpage``).
    """
    title = escape_latex(project['title'])
    year  = escape_latex(project['year'])

    # ------------------------------------------------------------------
    # Resolve description text
    # ------------------------------------------------------------------
    project_url = _project_page_url(project, base_url)
    if project.get('readme_raw') and project.get('inject_svgs', True):
        # Full README with embedded SVG figures
        desc = readme_to_latex(project['readme_raw'], base_path / project['path'],
                               project_dir=project['path'], base_url=base_url)
    elif project.get('readme_raw'):
        desc = markdown_to_latex(project.get('about') or '', base_url=project_url)
    elif project.get('about'):
        desc = markdown_to_latex(project['about'], base_url=project_url)
    elif project.get('description'):
        desc = markdown_to_latex(project['description'], base_url=project_url)
    else:
        desc = ""

    # Exclude GIFs, missing files, and any names listed in project['skip']
    skip_stems = {Path(s).stem for s in project.get('skip', [])}
    images = [
        img for img in project['images']
        if not img.endswith('.gif')
        and (base_path / img).exists()
        and Path(img).stem not in skip_stems
    ]

    latex = ""

    # Year URL for hyperlinks (project_url already computed above)
    _root    = base_url.rstrip('/') if base_url else ''
    year_url = f"{_root}/{year}/" if _root else ''

    # ------------------------------------------------------------------
    # Page 1: title bar + description (+ optional first image)
    # ------------------------------------------------------------------
    latex += "\\clearpage\n"
    _mark_text = (
        f"\\href{{{project_url}}}{{{title}}}, {year}"
        if project_url
        else f"{title}, {year}"
    )
    latex += f"\\markright{{{_mark_text}}}\n"
    latex += (
        f"\\noindent{{\\Large\\textbf{{\\href{{{project_url}}}{{{title}}}}}}}"
        f"\\hfill{{\\large \\href{{{year_url}}}{{\\textcolor{{red}}{{{year}}}}}}}\n\n"
    )
    # Detect a thumbnail.* in the project root to place beside the
    # description. Check the filesystem directly so this works even when
    # images/ sub-folder exists (find_images only falls back to the root
    # thumbnail when images/ is absent or empty).
    project_root = base_path / project['path']
    _tname = find_thumbnail(project_root, ('thumbnail',), THUMBNAIL_EXTS_STATIC)
    thumb_img = str((project_root / _tname).relative_to(base_path)) if _tname else None

    # Exclude the thumbnail from additional image pages (avoids duplication
    # in the WASM-fallback case where it also appears in project['images'])
    additional_images = [
        img for img in images
        if not (Path(img).stem.lower() == 'thumbnail'
                and Path(img).suffix.lower() in ('.jpg', '.jpeg', '.png'))
    ]

    if thumb_img and desc:
        # wrapfigure: thumbnail floats right, description flows naturally
        # around it and can break across pages (unlike minipage).
        thumb_href = (
            f"\\href{{{project_url}}}{{\\includegraphics[width=\\linewidth,height=0.75\\textheight,keepaspectratio]{{{thumb_img}}}}}"
            if project_url else
            f"\\includegraphics[width=\\linewidth,height=0.75\\textheight,keepaspectratio]{{{thumb_img}}}"
        )
        latex += (
            f"\\begin{{wrapfigure}}{{r}}{{0.40\\textwidth}}\n"
            "\\vspace{0pt}\n"
            + thumb_href + "\n"
            "\\end{wrapfigure}\n"
            + desc + "\n\n"
        )
    elif thumb_img:
        # No description — thumbnail full-width on page 1
        thumb_href = (
            f"\\href{{{project_url}}}{{\\includegraphics[width=\\textwidth,height=0.85\\textheight,keepaspectratio]{{{thumb_img}}}}}"
            if project_url else
            f"\\includegraphics[width=\\textwidth,height=0.85\\textheight,keepaspectratio]{{{thumb_img}}}"
        )
        latex += thumb_href + "\n\n"
    elif desc:
        # No thumbnail — description fills page 1
        latex += desc + "\n\n"

    # ------------------------------------------------------------------
    # Additional image pages
    # ------------------------------------------------------------------
    render_plan = build_render_plan(
        additional_images, base_path, project.get('images_per_page', 3)
    )
    indiv_idx = 0   # drives left/right alternation for individual images

    for kind, payload in render_plan:
        if kind == 'group':
            latex += _build_group_page(payload, project_url)
        else:  # 'individual'
            latex += _build_individual_page(payload, base_path, indiv_idx, project_url)
            indiv_idx += 1

    return latex


# ---------------------------------------------------------------------------
# Group page helper
# ---------------------------------------------------------------------------

# Fraction of \textwidth for each image in a 2/3/4-image group page.
# Trailing entries assume each image takes ~1/n with a small margin for gutters.
_GROUP_IMG_FRAC: Dict[int, str] = {2: '0.47', 3: '0.31', 4: '0.235'}
_GROUP_IMG_HEIGHT = '0.78\\textheight'


def _build_group_page(group: List, project_url: str = '') -> str:
    """Return LaTeX for a page showing ``len(group)`` portrait images side-by-side.

    Args:
        group:       List of ``(img_path, meta_dict)`` tuples (2–4 items).
        project_url: Base project URL used to build image hyperlinks.

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    n        = len(group)
    img_frac = _GROUP_IMG_FRAC.get(n, _GROUP_IMG_FRAC[4])
    img_h    = _GROUP_IMG_HEIGHT

    latex  = "\\clearpage\n{\\setlength{\\parskip}{0pt}%\n\\noindent\n"

    # Images side-by-side
    for k, (img_path, _meta) in enumerate(group):
        img_url = _image_url(img_path, project_url) if project_url else ''
        img_content = (
            f"  \\href{{{img_url}}}{{\\includegraphics[width=\\linewidth,height={img_h},keepaspectratio]{{{img_path}}}}}\n"
            if img_url else
            f"  \\includegraphics[width=\\linewidth,height={img_h},keepaspectratio]{{{img_path}}}\n"
        )
        latex += (
            f"\\begin{{minipage}}[b]{{{img_frac}\\textwidth}}\n"
            + img_content
            + f"\\end{{minipage}}"
        )
        latex += "\\hfill\n" if k < n - 1 else "\n"

    # Caption: individual titles/years, then shared medium + dimensions
    title_parts = []
    for _img, meta in group:
        t = escape_latex(meta.get('title', ''))
        y = escape_latex(meta.get('year', ''))
        if t and y:
            title_parts.append(f"\\textit{{{t}}} ({y})")
        elif t:
            title_parts.append(f"\\textit{{{t}}}")

    first_meta    = group[0][1]
    common_medium = escape_latex(first_meta.get('medium', ''))
    common_dims   = escape_latex(
        first_meta.get('dimensions') or first_meta.get('dimension', '')
    )

    group_caption_lines = []
    if title_parts:
        group_caption_lines.append(", ".join(title_parts))
    if common_medium:
        group_caption_lines.append(common_medium)
    if common_dims:
        group_caption_lines.append(common_dims)

    if group_caption_lines:
        rows = "\\\\\n".join(group_caption_lines)
        latex += (
            "\n\\vspace{0.6em}\n\\noindent\n"
            "{\\renewcommand{\\arraystretch}{1.0}\\setstretch{1.0}\\selectfont\n"
            "\\begin{tabular}[b]{@{}l@{}}\n"
            + rows + "\n"
            "\\end{tabular}}\n"
        )
    latex += "}%\n"  # close \parskip=0 group
    return latex


# ---------------------------------------------------------------------------
# Individual page helper
# ---------------------------------------------------------------------------

def _build_individual_page(img_path: str, base_path: Path, index: int, project_url: str = '') -> str:
    """Return LaTeX for a single-image page with optional sidecar caption.

    Images alternate left and right.  The caption appears on the opposite side.

    Args:
        img_path:    Workspace-relative image path.
        base_path:   Workspace root.
        index:       Zero-based sequential index used for left/right alternation.
                     Even → image on left; odd → image on right.
        project_url: Base project URL used to build image hyperlinks.

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    image_on_right = (index % 2 == 1)
    # align_right=True means caption text is right-aligned (used when caption
    # is on the left side, i.e. image is on the right).
    caption = build_caption(img_path, base_path, align_right=image_on_right)
    # Use the full text-body height so images fill the page.
    # \textheight already excludes the header; keepaspectratio prevents distortion.
    h       = "\\textheight"

    img_url    = _image_url(img_path, project_url) if project_url else ''
    raw_inc    = f"\\includegraphics[width=\\linewidth,height={h},keepaspectratio]{{{img_path}}}"
    linked_inc = f"\\href{{{img_url}}}{{{raw_inc}}}" if img_url else raw_inc
    img_line   = linked_inc + "\n"

    latex = "\\clearpage\n{\\setlength{\\parskip}{0pt}%\n"

    if caption:
        if image_on_right:
            # Caption left, image right
            latex += (
                "\\noindent\n"
                f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                f"  {caption}\n"
                "\\end{minipage}\n"
                "\\hfill\n"
                f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                f"  {img_line}"
                "\\end{minipage}%\n"
            )
        else:
            # Image left, caption right
            latex += (
                "\\noindent\n"
                f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                f"  \\hfill{img_line}"
                "\\end{minipage}\n"
                "\\hfill\n"
                f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                f"  {caption}\n"
                "\\end{minipage}%\n"
            )
    else:
        # No caption — full-width centred image
        latex += (
            "\\noindent\n"
            f"\\begin{{minipage}}[b][{h}][c]{{\\textwidth}}\n"
            "  \\centering\n"
            f"  {linked_inc}\n"
            "\\end{minipage}%\n"
        )

    latex += "}%\n"  # close \parskip=0 group
    return latex
