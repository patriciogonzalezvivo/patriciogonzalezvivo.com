"""
portfolio/latex_builder.py
--------------------------
LaTeX content generation for the portfolio generator.

Responsibilities:
  - Building per-artwork LaTeX pages (title bar, description, images).
  - Formatting image captions from sidecar metadata.
  - Populating a ``%%PLACEHOLDER%%``-based LaTeX template with artist data.

All LaTeX string construction lives here so that ``generate_portfolio.py``
stays a thin orchestrator.

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
from typing import Dict, List, Optional

from portfolio.utils import escape_latex, markdown_to_latex, strip_markdown
from portfolio.images import build_render_plan, parse_sidecar
from portfolio.metadata import readme_to_latex


# ---------------------------------------------------------------------------
# Caption builder
# ---------------------------------------------------------------------------

# Maximum description character count that still allows an image on page 1.
_DESC_CHAR_LIMIT = 800


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
        lines = [escape_latex(ln) for ln in raw.splitlines()]
        return "{\\setstretch{1.0}\\selectfont " + "\\\\\n".join(lines) + "}"

    align_cmd     = "\\raggedleft" if align_right else "\\raggedright"
    caption_lines = []

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

    body = "\\\\\n".join(caption_lines)
    return f"{{\\setstretch{{1.0}}\\selectfont {align_cmd}\n{body}}}"


# ---------------------------------------------------------------------------
# Per-artwork page builder
# ---------------------------------------------------------------------------

def build_artwork_pages(project: Dict, base_path: Path) -> str:
    """Return LaTeX for all pages belonging to a single artwork / project.

    Args:
        project:   Project dict produced by :func:`~portfolio.metadata.get_project_meta`.
        base_path: Workspace root.

    Returns:
        LaTeX string (starts with ``\\clearpage``).
    """
    title = escape_latex(project['title'])
    year  = escape_latex(project['year'])

    # ------------------------------------------------------------------
    # Resolve description text
    # ------------------------------------------------------------------
    if project.get('readme_raw'):
        desc = readme_to_latex(project['readme_raw'], base_path / project['path'])
    elif project.get('about'):
        desc = markdown_to_latex(project['about'])
    elif project.get('description'):
        desc = markdown_to_latex(project['description'])
    else:
        desc = ""

    # Exclude GIFs and missing files
    images = [
        img for img in project['images']
        if not img.endswith('.gif') and (base_path / img).exists()
    ]

    latex = ""

    # ------------------------------------------------------------------
    # Page 1: title bar + description (+ optional first image)
    # ------------------------------------------------------------------
    latex += "\\clearpage\n"
    latex += f"\\noindent{{\\Large\\textbf{{{title}}}}}\\hfill{{\\large {year}}}\n\n"
    latex += "\\vspace{0.3em}\\hrule\\vspace{1em}\n\n"

    desc_fits = len(desc) <= _DESC_CHAR_LIMIT

    if images and desc_fits:
        first_img = images[0]
        caption   = build_caption(first_img, base_path)
        col_h     = "0.82\\textheight"

        # Left column: description, top-aligned
        latex += "\\noindent"
        latex += f"\\begin{{minipage}}[t][{col_h}][t]{{0.52\\textwidth}}\n"
        latex += "\\raggedright\n"
        if desc:
            latex += desc + "\n"
        latex += "\\end{minipage}\n"
        latex += "\\hfill\n"
        # Right column: image, bottom-aligned
        latex += f"\\begin{{minipage}}[t][{col_h}][b]{{0.44\\textwidth}}\n"
        latex += f"\\includegraphics[width=\\linewidth,height=0.85\\textheight,keepaspectratio]{{{first_img}}}\n"
        latex += "\\end{minipage}\n\n"

        additional_images = images[1:]
    else:
        # Long description or no images: full-width text, all images additional
        if desc:
            latex += desc + "\n\n"
        additional_images = images

    # ------------------------------------------------------------------
    # Additional image pages
    # ------------------------------------------------------------------
    render_plan = build_render_plan(
        additional_images, base_path, project.get('images_per_page', 3)
    )
    indiv_idx = 0   # drives left/right alternation for individual images

    for kind, payload in render_plan:
        if kind == 'group':
            latex += _build_group_page(payload)
        else:  # 'individual'
            latex += _build_individual_page(payload, base_path, indiv_idx)
            indiv_idx += 1

    return latex


# ---------------------------------------------------------------------------
# Group page helper
# ---------------------------------------------------------------------------

def _build_group_page(group: List) -> str:
    """Return LaTeX for a page showing ``len(group)`` portrait images side-by-side.

    Args:
        group: List of ``(img_path, meta_dict)`` tuples (2–4 items).

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    n        = len(group)
    img_frac = {2: '0.47', 3: '0.31', 4: '0.235'}.get(n, '0.235')
    img_h    = '0.78\\textheight'

    latex  = "\\clearpage\n\\noindent\n"

    # Images side-by-side
    for k, (img_path, _meta) in enumerate(group):
        latex += (
            f"\\begin{{minipage}}[b]{{{img_frac}\\textwidth}}\n"
            f"  \\includegraphics[width=\\linewidth,height={img_h},keepaspectratio]{{{img_path}}}\n"
            f"\\end{{minipage}}"
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

    first_meta   = group[0][1]
    common_medium = escape_latex(first_meta.get('medium', ''))
    common_dims   = escape_latex(
        first_meta.get('dimensions') or first_meta.get('dimension', '')
    )

    latex += "\n\\vspace{0.6em}\n\\noindent\n"
    latex += "{\\setstretch{1.0}\\selectfont\\raggedright\n"
    if title_parts:
        latex += ", ".join(title_parts) + "\\\\\n"
    if common_medium:
        latex += common_medium + "\\\\\n"
    if common_dims:
        latex += common_dims + "\n"
    latex += "}\n"

    return latex


# ---------------------------------------------------------------------------
# Individual page helper
# ---------------------------------------------------------------------------

def _build_individual_page(img_path: str, base_path: Path, index: int) -> str:
    """Return LaTeX for a single-image page with optional sidecar caption.

    Images alternate left and right.  The caption appears on the opposite side.

    Args:
        img_path:  Workspace-relative image path.
        base_path: Workspace root.
        index:     Zero-based sequential index used for left/right alternation.
                   Even → image on left; odd → image on right.

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    image_on_right = (index % 2 == 1)
    # align_right=True means caption text is right-aligned (used when caption
    # is on the left side, i.e. image is on the right).
    caption = build_caption(img_path, base_path, align_right=image_on_right)
    h       = "0.85\\textheight"
    img_line = (
        f"\\includegraphics[width=\\linewidth,"
        f"height={h},keepaspectratio]{{{img_path}}}\n"
    )

    latex = "\\clearpage\n"

    if caption:
        if image_on_right:
            # Caption left, image right
            latex += (
                "\\noindent\n"
                f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                f"  {caption}\n"
                "\\end{minipage}\n"
                "\\hfill\n"
                f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                f"  {img_line}"
                "\\end{minipage}\n\n"
            )
        else:
            # Image left, caption right
            latex += (
                "\\noindent\n"
                f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                f"  \\hfill{img_line}"
                "\\end{minipage}\n"
                "\\hfill\n"
                f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                f"  {caption}\n"
                "\\end{minipage}\n\n"
            )
    else:
        # No caption — full-width centred image
        latex += (
            "\\noindent\n"
            f"\\begin{{minipage}}[t][{h}][c]{{\\textwidth}}\n"
            "  \\centering\n"
            f"  \\includegraphics[width=\\linewidth,height={h},keepaspectratio]{{{img_path}}}\n"
            "\\end{minipage}\n\n"
        )

    return latex


# ---------------------------------------------------------------------------
# Template population
# ---------------------------------------------------------------------------

def populate_template(
    template_text: str,
    data: Dict,
    projects: List[Dict],
    base_path: Path,
) -> str:
    """Replace all ``%%PLACEHOLDER%%`` markers in *template_text*.

    Args:
        template_text: Raw contents of a ``.tex`` template file.
        data:          Parsed ``portfolio_data.json`` dict.
        projects:      List of project dicts (from :mod:`portfolio.metadata`).
        base_path:     Workspace root.

    Returns:
        Complete LaTeX document string, ready to pass to xelatex.
    """
    artist = data.get('artist', {})

    # ------------------------------------------------------------------
    # Bio block (text + optional avatar wrap-figure)
    # ------------------------------------------------------------------
    bio = _build_bio_block(artist, base_path)

    # ------------------------------------------------------------------
    # Optional artist statement
    # ------------------------------------------------------------------
    optional_statement = _build_artist_statement(artist, base_path)

    # ------------------------------------------------------------------
    # Optional appendix sections (CV, exhibitions, talks, press)
    # ------------------------------------------------------------------
    website     = artist.get('website', '')
    website_url = artist.get('website_url', f'https://{website}' if website else '')

    print("Resolving optional file sections…")
    optional_cv          = _optional_section('cv_file',          artist, base_path)
    optional_exhibitions = _optional_section('exhibitions_file', artist, base_path)
    optional_talks       = _optional_section('talks_file',       artist, base_path)
    optional_press       = _optional_section('press_file',       artist, base_path)

    # ------------------------------------------------------------------
    # Artwork pages
    # ------------------------------------------------------------------
    artworks_latex = "\n".join(
        build_artwork_pages(project, base_path) for project in projects
    )

    # ------------------------------------------------------------------
    # Substitution map
    # ------------------------------------------------------------------
    replacements = {
        '%%ARTIST_NAME%%':               escape_latex(artist.get('name', '')),
        '%%PORTFOLIO_TITLE%%':           escape_latex(artist.get('portfolio_title', 'Artist Portfolio')),
        # Email / website go inside \href — must NOT be LaTeX-escaped
        '%%ARTIST_EMAIL%%':              artist.get('email', ''),
        '%%ARTIST_WEBSITE%%':            artist.get('website', ''),
        '%%ARTIST_WEBSITE_URL%%':        website_url,
        '%%ARTIST_LOCATION%%':           escape_latex(artist.get('location', '')),
        '%%ARTIST_PHONE%%':              escape_latex(artist.get('phone', '')),
        '%%ARTIST_LOGO%%':               artist.get('logo', ''),
        '%%ARTIST_BIO%%':                bio,
        '%%OPTIONAL_ARTIST_STATEMENT%%': optional_statement,
        '%%ARTWORKS%%':                  artworks_latex,
        '%%OPTIONAL_CV%%':               optional_cv,
        '%%OPTIONAL_EXHIBITIONS%%':      optional_exhibitions,
        '%%OPTIONAL_TALKS%%':            optional_talks,
        '%%OPTIONAL_PRESS%%':            optional_press,
    }

    for placeholder, value in replacements.items():
        template_text = template_text.replace(placeholder, value)

    return template_text


# ---------------------------------------------------------------------------
# Private helpers for populate_template
# ---------------------------------------------------------------------------

def _build_bio_block(artist: Dict, base_path: Path) -> str:
    """Return the LaTeX bio block, optionally wrapped around an avatar figure."""
    bio_path_str = artist.get('bio_file')
    if not bio_path_str:
        return ''

    bio_path = base_path / bio_path_str
    if not bio_path.exists():
        print(f"  (skipping bio_file: {bio_path_str} not found)")
        return ''

    bio_text = markdown_to_latex(strip_markdown(bio_path.read_text()))
    if not bio_text:
        return ''

    avatar_file = artist.get('avatar_file', '')
    if avatar_file and (base_path / avatar_file).exists():
        return (
            "\\begin{wrapfigure}{r}{0.35\\textwidth}\n"
            "  \\vspace{-10pt}\n"
            f"  \\includegraphics[width=\\linewidth]{{{avatar_file}}}\n"
            "  \\vspace{-20pt}\n"
            "\\end{wrapfigure}\n\n"
            + bio_text
        )

    return bio_text


def _build_artist_statement(artist: Dict, base_path: Path) -> str:
    """Return a LaTeX ``\\section*{Artist Statement}`` block, or empty string."""
    path_str = artist.get('artist_statement_file')
    if not path_str:
        return ''

    full_path = base_path / path_str
    if not full_path.exists():
        print(f"  (skipping artist_statement_file: {path_str} not found)")
        return ''

    content = markdown_to_latex(strip_markdown(full_path.read_text()))
    if not content.strip():
        return ''

    return (
        "\\section*{Artist Statement}\n\n"
        + content
        + "\n\n\\clearpage"
    )


def _optional_section(file_key: str, artist: Dict, base_path: Path) -> str:
    """Return a LaTeX clearpage + section body for an optional appendix section.

    Returns an empty string when the key is absent or the file is missing.
    """
    filepath = artist.get(file_key)
    if not filepath:
        return ''

    full_path = base_path / filepath
    if not full_path.exists():
        print(f"  (skipping {file_key}: {filepath} not found)")
        return ''

    content = markdown_to_latex(strip_markdown(full_path.read_text()))
    if not content.strip():
        return ''

    print(f"  + {file_key}: {filepath}")
    return f"\\clearpage\n\n{content}\n"
