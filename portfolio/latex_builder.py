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

import tempfile
from pathlib import Path
from typing import Dict, List, Optional

from portfolio.utils import escape_latex, markdown_to_latex, strip_markdown
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
        tab_col = "r" if align_right else "l"
        prefix  = "\\hfill" if align_right else ""
        rows    = "\\\\\n".join(lines)
        return (
            f"{prefix}{{\\renewcommand{{\\arraystretch}}{{1.0}}\\setstretch{{1.0}}\\selectfont\n"
            f"\\begin{{tabular}}[b]{{@{{}}{tab_col}@{{}}}}\n"
            + rows + "\n"
            "\\end{tabular}}"
        )

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

    # Use a tabular so row spacing is not affected by the parskip package.
    # \\[0pt] in a paragraph is overridden by parskip's \everypar hooks;
    # tabular rows have no paragraphs and therefore no parskip interference.
    tab_col = "r" if align_right else "l"
    prefix  = "\\hfill" if align_right else ""
    rows    = "\\\\\n".join(caption_lines)
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
    if project.get('readme_raw') and project.get('inject_svgs', True):
        # Full README with embedded SVG figures
        desc = readme_to_latex(project['readme_raw'], base_path / project['path'])
    elif project.get('readme_raw'):
        # SVG injection disabled — use the pre-stripped plain text
        desc = markdown_to_latex(project.get('about') or '')
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

    # Project and year URLs for hyperlinks
    _root = base_url.rstrip('/') if base_url else ''
    project_url = f"{_root}/{project['path']}/" if _root else ''
    year_url    = f"{_root}/{year}/" if _root else ''

    # ------------------------------------------------------------------
    # Page 1: title bar + description (+ optional first image)
    # ------------------------------------------------------------------
    latex += "\\clearpage\n"
    latex += (
        f"\\noindent{{\\Large\\textbf{{\\href{{{project_url}}}{{{title}}}}}}}"
        f"\\hfill{{\\large \\href{{{year_url}}}{{\\textcolor{{red}}{{{year}}}}}}}\n\n"
    )
    # latex += "\\vspace{0.3em}\\hrule\\vspace{1em}\n\n"

    if images and len(images) == 1 and Path(images[0]).name.lower().startswith('thumbnail'):
        # Wasm / thumbnail-only project: full-width description on page 1,
        # thumbnail gets its own full-height page.
        if desc:
            latex += desc + "\n\n"
        additional_images = images[:]
    else:
        # All other projects: description always fills page 1; every image
        # gets its own page so nothing is squeezed alongside the text.
        if desc:
            latex += desc + "\n\n"
        additional_images = images[:]

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

def _build_group_page(group: List, project_url: str = '') -> str:
    """Return LaTeX for a page showing ``len(group)`` portrait images side-by-side.

    Args:
        group:       List of ``(img_path, meta_dict)`` tuples (2–4 items).
        project_url: Base project URL used to build image hyperlinks.

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    n        = len(group)
    img_frac = {2: '0.47', 3: '0.31', 4: '0.235'}.get(n, '0.235')
    img_h    = '0.78\\textheight'

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

    first_meta   = group[0][1]
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

    img_url = _image_url(img_path, project_url) if project_url else ''
    raw_inc = f"\\includegraphics[width=\\linewidth,height={h},keepaspectratio]{{{img_path}}}"
    linked_inc = f"\\href{{{img_url}}}{{{raw_inc}}}" if img_url else raw_inc
    img_line = linked_inc + "\n"

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
        build_artwork_pages(project, base_path, website_url) for project in projects
    )

    # ------------------------------------------------------------------
    # Substitution map
    # ------------------------------------------------------------------
    portfolio_title = artist.get('portfolio_title', 'Portfolio')
    for_name        = artist.get('for', '')
    header_title    = (
        escape_latex(f"{portfolio_title} \u2014 {for_name}")
        if for_name
        else escape_latex(portfolio_title)
    )

    replacements = {
        '%%ARTIST_NAME%%':               escape_latex(artist.get('name', '')),
        '%%PORTFOLIO_TITLE%%':           escape_latex(portfolio_title),
        '%%HEADER_TITLE%%':              header_title,
        # Email / website go inside \href — must NOT be LaTeX-escaped
        '%%ARTIST_EMAIL%%':              artist.get('email', ''),
        '%%ARTIST_WEBSITE%%':            artist.get('website', ''),
        '%%ARTIST_INSTAGRAM%%':          artist.get('instagram', ''),
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

    # Append the registration mark centered at the end of the bio
    from portfolio.elements import generate_registration_mark_tex

    with tempfile.NamedTemporaryFile(suffix='.tex', delete=False, mode='r') as _tmp:
        _tmp_path = _tmp.name
    generate_registration_mark_tex(_tmp_path)
    with open(_tmp_path) as _f:
        registration_mark_tex = _f.read()
    Path(_tmp_path).unlink(missing_ok=True)

    avatar_file = artist.get('avatar_file', '')
    if avatar_file and (base_path / avatar_file).exists():
        # Bio URL: artist website + /about
        website     = artist.get('website', '')
        website_url = artist.get('website_url', f'https://{website}' if website else '')
        bio_url     = f"{website_url.rstrip('/')}/about.php" if website_url else ''

        avatar_img = f"\\includegraphics[width=\\linewidth,height=0.85\\textheight,keepaspectratio]{{{avatar_file}}}"
        if bio_url:
            avatar_img = f"\\href{{{bio_url}}}{{{avatar_img}}}"

        # wrapfigure lets the bio text flow naturally (and break to a second page
        # if needed) while the portrait floats to the right — no fixed-height
        # minipage means no clipping and the bottom margin is always respected.
        return (
            f"\\begin{{wrapfigure}}{{r}}{{0.35\\textwidth}}\n"
            "\\vspace{4pt}\n"
            f"{avatar_img}\n"
            "\\end{wrapfigure}\n"
            + bio_text + "\n"
            + "\n\\vspace{10em}\n"
            + registration_mark_tex
        )

    return bio_text + "\n\\vspace{2em}\n" + registration_mark_tex


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


# ---------------------------------------------------------------------------
# Legacy standalone document builder (no external template)
# ---------------------------------------------------------------------------

def build_legacy_document(bio: str, projects: List[Dict], base_path: Path) -> str:
    """Build a complete LaTeX document string without an external template.

    This is the "legacy" workflow: a self-contained preamble is generated
    in-line and project pages are appended after a biography section.

    Args:
        bio:       Plain-text or Markdown biography.
        projects:  List of project dicts (from :mod:`portfolio.metadata`).
        base_path: Workspace root (passed to :func:`build_artwork_pages`).

    Returns:
        A complete LaTeX document string ready to pass to xelatex.
    """
    preamble = r"""\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{graphicx}
\usepackage{float}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{hyperref}
\usepackage{parskip}
% SVGs are pre-converted to PDF by the Python generator (rsvg-convert)
\usepackage{fontspec}

% Montserrat from local folder
\setmainfont{Montserrat}[
    Path           = montserrat/,
    UprightFont    = *-Light,
    BoldFont       = *-SemiBold,
    ItalicFont     = *-LightItalic,
    BoldItalicFont = *-SemiBoldItalic,
    Extension      = .ttf
]

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{Patricio Gonzalez Vivo}
\fancyhead[R]{Portfolio}
\renewcommand{\headrulewidth}{0.4pt}

\titleformat{\section}{\Large\bfseries}{}{0em}{}[\titlerule]
\titleformat{\subsection}{\large\bfseries}{}{0em}{}

\hypersetup{colorlinks=true,linkcolor=black,urlcolor=blue}
\setlength{\parindent}{0pt}

\begin{document}

\begin{titlepage}
    \centering
    \vspace*{3cm}
    \includegraphics[width=0.15\textwidth]{images/logo-gray.png}\\[1em]
    {\Huge\bfseries Patricio Gonzalez Vivo}\\[0.5em]
    {\Large Portfolio}
    \vfill
    {\small \url{https://patriciogonzalezvivo.com}}
    \vspace{1cm}
\end{titlepage}

\section*{Biography}
"""

    body = preamble + markdown_to_latex(bio) + "\n\n"
    for project in projects:
        body += build_artwork_pages(project, base_path) + "\n"  # no base_url in legacy mode
    body += r"\end{document}" + "\n"
    return body
