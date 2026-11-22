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
from portfolio.images import build_render_plan, parse_sidecar, svg_to_pdf
from portfolio.berthe.berthe.looom import is_looom_svg, looom_frame_to_png
from portfolio.metadata import readme_to_latex, get_featured_item_meta


# ---------------------------------------------------------------------------
# Logo helper
# ---------------------------------------------------------------------------

def _logo_if_space(logo_file: str) -> str:
    """Return a LaTeX block that places the logo only when enough vertical
    space remains on the current page (same test used in sections.py)."""
    if not logo_file:
        return ''
    return (
        # A pending wrapfigure's height isn't in \pagetotal, so reserve the
        # lines it still occupies (WF@wrappedlines) on top of the logo's 3.5cm,
        # then drop below the figure before placing the logo.
        "\\par\\ifdim\\dimexpr\\pagegoal-\\pagetotal-\\value{WF@wrappedlines}\\baselineskip\\relax > 3.5cm\n"
        "\\vspace*{\\dimexpr\\value{WF@wrappedlines}\\baselineskip\\relax}\\setcounter{WF@wrappedlines}{0}\n"
        "\\begin{center}\n"
        f"\\includegraphics[height=2cm,keepaspectratio]{{{logo_file}}}\n"
        "\\end{center}\n"
        "\\fi\n"
    )


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

def build_artwork_pages(project: Dict, base_path: Path, base_url: str = '', logo_file: str = '') -> str:
    """Return LaTeX for all pages belonging to a single artwork / project.

    Args:
        project:   Project dict produced by :func:`~portfolio.metadata.get_project_meta`.
        base_path: Workspace root.
        base_url:  Artist website base URL (e.g. ``https://patriciogonzalezvivo.com``).

    Returns:
        LaTeX string (starts with ``\\clearpage``).
    """
    title = escape_latex(project['title'])
    title_caps = escape_latex(project['title'].upper())   # big opening title: capitals (upper-cased before escaping)
    year  = escape_latex(project['year'])

    # ------------------------------------------------------------------
    # Resolve description text
    # ------------------------------------------------------------------
    project_url = _project_page_url(project, base_url)

    # ------------------------------------------------------------------
    # Resolve divider image (from data.json "divider" key)
    # ------------------------------------------------------------------
    divider_path = None
    raw_divider  = project.get('divider')
    if raw_divider:
        divider_abs = base_path / raw_divider
        if str(raw_divider).lower().endswith('.svg'):
            if is_looom_svg(divider_abs):
                # Render frame 0 of a Looom SVG to PNG
                png_out = base_path / 'temp_portfolio' / 'html_renders' / f'divider_{divider_abs.stem}_f0.png'
                looom_frame_to_png(divider_abs, png_out, frame=0, margin_frac=0.05, width=400)
                divider_path = str(png_out.relative_to(base_path)) if png_out.exists() else None
            else:
                pdf = svg_to_pdf(divider_abs)
                divider_path = str(pdf.relative_to(base_path)) if pdf else None
        elif divider_abs.exists():
            divider_path = raw_divider  # PNG/JPG — use as-is (workspace-relative)

    if project.get('readme_raw'):
        desc = readme_to_latex(project['readme_raw'], base_path / project['path'],
                               project_dir=project['path'], base_url=base_url,
                               center_svgs=project.get('inject_svgs', True),
                               divider=divider_path)
    elif project.get('about'):
        desc = markdown_to_latex(project['about'], base_url=project_url,
                                 divider=divider_path)
    elif project.get('description'):
        desc = markdown_to_latex(project['description'], base_url=project_url,
                                 divider=divider_path)
    else:
        desc = ""

    # Exclude GIFs, missing files, and any names listed in project['skip']
    skip_stems = {Path(s).stem for s in project.get('skip', [])}

    def _sidecar_skip(img):
        """True when the image's .txt sidecar has ``skip: yes`` (portfolio only)."""
        txt = (base_path / img).with_suffix('.txt')
        if not txt.exists():
            return False
        for line in txt.read_text().splitlines():
            key, _, val = line.partition(':')
            if key.strip().lower() == 'skip':
                return val.strip().lower() in ('yes', 'true', '1', 'skip')
        return False

    images = [
        img for img in project['images']
        if not img.endswith('.gif')
        and (base_path / img).exists()
        and Path(img).stem not in skip_stems
        and not _sidecar_skip(img)
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
        f"\\noindent{{\\huge\\textbf{{\\href{{{project_url}}}{{{title_caps}}}}}}}"
        f"\\hfill{{\\large \\href{{{year_url}}}{{\\textcolor{{red}}{{{year}}}}}}}\n\n"
    )
    # Detect a thumbnail.* in the project root to place beside the
    # description. Check the filesystem directly so this works even when
    # images/ sub-folder exists (find_images only falls back to the root
    # thumbnail when images/ is absent or empty).
    project_root = base_path / project['path']
    if project.get('skip_thumbnail'):
        thumb_img = None
    else:
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
        # \noindent\hfill right-aligns the image within the wrapfigure box so
        # that portrait thumbnails (where keepaspectratio makes the rendered
        # width narrower than the box) stay flush with the right margin.
        # Optional per-section "thumbnail_size" (e.g. "60%" or 0.6) scales
        # the thumbnail down for the PDF only.
        _scale = 1.0
        _ts = str(project.get('thumbnail_size') or '').strip()
        if _ts:
            try:
                _v = float(_ts.rstrip('%'))
                _scale = _v / 100.0 if (_ts.endswith('%') or _v > 1) else _v
            except ValueError:
                pass
        _wfrac = 0.40 * _scale
        _hfrac = 0.75 * _scale
        thumb_inc = f"\\includegraphics[width=\\linewidth,height={_hfrac:.3f}\\textheight,keepaspectratio]{{{thumb_img}}}"
        thumb_href = f"\\href{{{project_url}}}{{{thumb_inc}}}" if project_url else thumb_inc
        latex += (
            f"\\begin{{wrapfigure}}{{r}}{{{_wfrac:.3f}\\textwidth}}\n"
            "\\vspace{-\\intextsep}\n"
            "\\noindent\\hfill "
            + thumb_href + "\n"
            "\\vspace{-\\intextsep}\n"
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

    latex += _logo_if_space(logo_file)

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

# Fraction of \textwidth for each image in a 2/3-image group page.
# Trailing entries assume each image takes ~1/n with a small margin for gutters.
_GROUP_IMG_FRAC: Dict[int, str] = {2: '0.47', 3: '0.31'}
_GROUP_IMG_HEIGHT = '0.88\\textheight'

# 4-image groups render as a 2x2 grid instead of a single row of 4.
_GRID_IMG_FRAC   = '0.47'
_GRID_IMG_HEIGHT = '0.42\\textheight'


def _meta_caption(meta: Dict) -> str:
    """Caption lines (title, year / medium / dimensions) for one image's metadata."""
    t = escape_latex(meta.get('title', ''))
    y = escape_latex(meta.get('year', ''))
    first = ", ".join(filter(None, [f"\\textit{{{t}}}" if t else "", y]))
    lines = [first] if first else []
    if meta.get('medium'):
        lines.append(escape_latex(meta['medium']))
    dim = meta.get('dimensions') or meta.get('dimension', '')
    if dim:
        lines.append(escape_latex(dim))
    if not lines:
        return ""
    return (
        "  \\par\\vspace{0.6em}\\noindent\n"
        "  {\\renewcommand{\\arraystretch}{1.0}\\setstretch{1.0}\\selectfont\n"
        "  \\begin{tabular}[t]{@{}l@{}}\n  "
        + "\\\\\n  ".join(lines) + "\n"
        "  \\end{tabular}}\n"
    )


def _image_minipage(img_path: str, meta: Dict, project_url: str, frac: str, height: str) -> str:
    """Return a top-aligned ``minipage`` with a linked, height/width-capped image
    and its own caption directly underneath."""
    img_url = _image_url(img_path, project_url) if project_url else ''
    img_content = (
        f"  \\href{{{img_url}}}{{\\includegraphics[width=\\linewidth,height={height},keepaspectratio]{{{img_path}}}}}\n"
        if img_url else
        f"  \\includegraphics[width=\\linewidth,height={height},keepaspectratio]{{{img_path}}}\n"
    )
    return (f"\\begin{{minipage}}[t]{{{frac}\\textwidth}}\n" + img_content
            + _meta_caption(meta) + "\\end{minipage}")


def _build_group_page(group: List, project_url: str = '') -> str:
    """Return LaTeX for a page showing ``len(group)`` portrait images.

    Groups of 2 or 3 are placed side-by-side in a single row; groups of 4
    are laid out as a 2x2 grid.

    Args:
        group:       List of ``(img_path, meta_dict)`` tuples (2–4 items).
        project_url: Base project URL used to build image hyperlinks.

    Returns:
        LaTeX string starting with ``\\clearpage``.
    """
    n = len(group)

    latex = "\\clearpage\\newgeometry{margin=0.35in}\n{\\setlength{\\parskip}{0pt}%\n\\noindent\n"

    if n == 4:
        # 2x2 grid: two rows of two images each.
        for row in (group[0:2], group[2:4]):
            for k, (img_path, meta) in enumerate(row):
                latex += _image_minipage(img_path, meta, project_url, _GRID_IMG_FRAC, _GRID_IMG_HEIGHT)
                latex += "\\hfill\n" if k < len(row) - 1 else "\n"
            latex += "\\vspace{0.4em}\n\\noindent\n"
    else:
        # Single row, side-by-side.
        img_frac = _GROUP_IMG_FRAC.get(n, _GROUP_IMG_FRAC[3])
        for k, (img_path, meta) in enumerate(group):
            latex += _image_minipage(img_path, meta, project_url, img_frac, _GROUP_IMG_HEIGHT)
            latex += "\\hfill\n" if k < n - 1 else "\n"

    latex += "}%\n\\restoregeometry\n"  # close \parskip=0 group, back to wide margins
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

    latex = "\\clearpage\\newgeometry{margin=0.35in}\n{\\setlength{\\parskip}{0pt}%\n"

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

    latex += "}%\n\\restoregeometry\n"  # close \parskip=0 group, back to wide margins
    return latex


# ---------------------------------------------------------------------------
# Featured-section page builder
# ---------------------------------------------------------------------------

# Maximum thumbnails (each with a caption) to place on a single page.
_FEATURED_MAX_PER_PAGE = 4

# Minipage width fractions per number of items on the page (same proportions
# as _GROUP_IMG_FRAC for gallery groups, extended to cover the single-item case).
_FEATURED_IMG_FRAC: Dict[int, str] = {1: '0.60', 2: '0.47', 3: '0.31', 4: '0.235'}

# Image height — all items share the same fixed maximum so thumbnails align.
# Kept a bit below \textheight to leave vertical space for the caption block.
_FEATURED_IMG_HEIGHT = '0.72\\textheight'


def _featured_thumb_path(meta: Dict, base_path: Path):
    """Return the workspace-relative thumbnail path for a featured item, or None."""
    if meta.get('thumb'):
        candidate = base_path / meta['path'] / meta['thumb']
        if candidate.exists():
            return str(candidate.relative_to(base_path))
    return None


def _crop_to_aspect(img_rel: str, aspect: float, base_path: Path) -> str:
    """Centre-crop an image (sides or top/bottom) to ``aspect`` (w/h).

    The cropped copy is cached under ``temp_portfolio/featured_crops/`` and its
    workspace-relative path is returned.  If the image already matches (within
    1 %) or cannot be opened, the original path is returned unchanged.
    """
    import hashlib
    from PIL import Image
    src = base_path / img_rel
    try:
        with Image.open(src) as im:
            w, h = im.size
            cur = w / h
            if abs(cur - aspect) / aspect < 0.01:
                return img_rel
            if cur > aspect:           # too wide → crop the sides
                nw, nh = round(h * aspect), h
            else:                      # too tall → crop top/bottom
                nw, nh = w, round(w / aspect)
            x0, y0 = (w - nw) // 2, (h - nh) // 2
            out_dir = base_path / 'temp_portfolio' / 'featured_crops'
            out_dir.mkdir(parents=True, exist_ok=True)
            key = hashlib.md5(f"{img_rel}{aspect:.4f}{src.stat().st_mtime}".encode()).hexdigest()[:10]
            out = out_dir / f"{src.stem}_{key}.png"
            if not out.exists():
                im.convert('RGB').crop((x0, y0, x0 + nw, y0 + nh)).save(out)
            return str(out.relative_to(base_path))
    except Exception:
        return img_rel


def _background_overlay(pdf_rel, extra: str = '') -> str:
    """Stretch a full-page PDF behind the next page shipped out.

    Uses the shipout background hook, so the drawing takes no space in the page
    flow (an in-flow box would push the page content down). Call right after a
    \\clearpage, so the next page shipped is the one being built.
    """
    return (
        "\\AddToHookNext{shipout/background}{%\n"
        f"  \\put(0,-\\paperheight){{\\includegraphics[width=\\paperwidth,height=\\paperheight]{{{pdf_rel}}}}}%\n"
        + extra +
        "}\n"
    )


# Contact page geometry (mm, origin top-left, A4 landscape, 25.4 mm margins). The
# text sits in two columns: contact on the left, the exhibitions list on the right.
# The QR code is the sun: the rays start at its edge and radiate over the page
# wherever there is no text.
_CONTACT_QR_FILE = 'images/qr-code.png'
_CONTACT_QR_MM = 40.0
_CONTACT_SUN = (81.0, 151.0)               # centre of the QR code (centre of the left column)
_CONTACT_QR_QUIET = 5.0                    # mm of clear air around the QR code
_CONTACT_CAPTION_MM = 6.0                  # extra clear air below it for the caption
_CONTACT_CLEAR_RECTS = [
    (20.0, 20.0, 122.0, 104.0),            # left column text
    (150.0, 20.0, 127.0, 172.0),           # right column list
    (_CONTACT_SUN[0] - _CONTACT_QR_MM / 2 - _CONTACT_QR_QUIET,
     _CONTACT_SUN[1] - _CONTACT_QR_MM / 2 - _CONTACT_QR_QUIET,
     _CONTACT_QR_MM + 2 * _CONTACT_QR_QUIET,
     _CONTACT_QR_MM + 2 * _CONTACT_QR_QUIET + _CONTACT_CAPTION_MM),   # QR and caption
]


def _contact_qr(website_url: str) -> str:
    """QR code (linked to the website) and its caption, centred on the sun, as picture-env puts."""
    x, y = _CONTACT_SUN
    w = _CONTACT_QR_MM
    img = f"\\includegraphics[width={w}mm,keepaspectratio]{{{_CONTACT_QR_FILE}}}"
    if website_url:
        img = f"\\href{{{website_url}}}{{{img}}}"
    cap_y = y + w / 2 + 3.5
    return (
        "  {\\setlength{\\unitlength}{1mm}%\n"
        f"   \\put({x},-{y}){{\\makebox(0,0){{{img}}}}}%\n"
        f"   \\put({x},-{cap_y}){{\\makebox(0,0){{\\scriptsize Scan to visit the site}}}}}}%\n"
    )


def build_contact_background(website_url: str, base_path: Path) -> str:
    """Contact page background: rays emerging from the QR code, plus the QR code itself.

    Falls back to the QR code alone if the rays PDF cannot be made.
    """
    from portfolio.elements import generate_rays_svg

    qr = _contact_qr(website_url)
    svg_path = base_path / 'portfolio' / 'contact_rays.svg'
    generate_rays_svg(str(svg_path), center=_CONTACT_SUN, clear_rects=_CONTACT_CLEAR_RECTS)
    pdf_path = svg_to_pdf(svg_path)
    if pdf_path:
        return _background_overlay(pdf_path.relative_to(base_path), extra=qr)
    return (
        "\\AddToHookNext{shipout/background}{%\n"
        + qr +
        "}\n"
    )


# ---------------------------------------------------------------------------
# Divider pages
# ---------------------------------------------------------------------------
# Every line of a divider is placed at an absolute position (mm from the top-left
# of the A4 landscape page), so the drawing behind it can follow the text.
_PAGE_W, _PAGE_H = 297.0, 210.0
_PT = 25.4 / 72.0
_MONT = Path(__file__).resolve().parent / 'montserrat'
# (font file, size pt, line height pt, visible band height mm) per kind of line
_DIV_STYLES = {
    'title':  ('Montserrat-SemiBold.ttf',    36, 44, 11.0),
    'quote':  ('Montserrat-LightItalic.ttf', 10, 12,  5.0),
    'author': ('Montserrat-Light.ttf',        8, 10,  3.6),
}
_QUOTE_PITCH = 6.5      # mm between quote baselines
_TITLE_TO_QUOTE = 22.3  # mm, title centre to first quote line centre
_QUOTE_TO_AUTHOR = 11.3 # mm, last quote line centre to author centre
_PAD_X = {'title': 7.0, 'quote': 5.5, 'author': 5.5}   # air left/right of a line (mm)
_PAD_Y = 3.0                                           # air above/below a line (mm)


def _text_width_mm(text: str, kind: str) -> float:
    from PIL import ImageFont
    font, size, _lh, _band = _DIV_STYLES[kind]
    return ImageFont.truetype(str(_MONT / font), 1000).getlength(text) * size / 1000 * _PT


def _divider_layout(title: str, quote: str, author: str):
    """Return [(kind, raw_text, cx, cy, width_mm)] with the block centred on the page."""
    items = [('title', title, 0.0)]
    cy = 0.0
    if quote:
        lines = quote.split("\n")
        lines[0] = "\u201c" + lines[0]
        lines[-1] = lines[-1] + "\u201d"
        cy = _TITLE_TO_QUOTE
        for line in lines:
            items.append(('quote', line, cy))
            cy += _QUOTE_PITCH
        cy -= _QUOTE_PITCH
        if author:
            cy += _QUOTE_TO_AUTHOR
            items.append(('author', author, cy))
    # visible extent: top of the title band to bottom of the last line
    top = -_DIV_STYLES['title'][3] / 2
    bottom = cy + _DIV_STYLES[items[-1][0]][3] / 2
    shift = _PAGE_H / 2 - (top + bottom) / 2
    return [(k, t, _PAGE_W / 2, y + shift, _text_width_mm(t, k)) for k, t, y in items]


def build_divider_page(section: Dict, base_path: Path = Path('.')) -> str:
    """A page with a title and an optional quote, centred on the page both ways.

    Section keys:
      divider     (str)   title, e.g. "Selected Works"
      quote       (str)   optional phrase or quote; one line per newline (lines are
                          not wrapped, keep them short)
      author      (str)   optional attribution under the quote
      background  (bool)  rays-and-ripples drawing behind the text (default true);
                          the clear area follows the outline of the text
    """
    layout = _divider_layout(section.get('divider', ''), section.get('quote') or '',
                             section.get('author') or '')

    latex = "\\clearpage\n\\thispagestyle{empty}\n"

    if section.get('background', True):
        from portfolio.elements import generate_rays_svg
        capsules = []
        prev = None   # (top, bottom, narrow width) of the previous line's window
        for kind, _t, cx, cy, w in layout:
            band = _DIV_STYLES[kind][3]
            cw, ch = w + 2 * _PAD_X[kind], band + 2 * _PAD_Y
            capsules.append((cx, cy, cw, ch))
            top, bottom = cy - ch / 2, cy + ch / 2
            if prev and prev[1] < top + 1.0:
                # bridge the gap with the narrower of the two windows, so no stray
                # rays are left between lines and the outline stays continuous
                gap_top, gap_bottom = prev[1] - 2.0, top + 2.0
                capsules.append((cx, (gap_top + gap_bottom) / 2, min(prev[2], cw), gap_bottom - gap_top))
            prev = (top, bottom, cw)
        svg_path = base_path / 'portfolio' / 'divider_rays.svg'
        generate_rays_svg(str(svg_path), clear_capsules=capsules)
        pdf_path = svg_to_pdf(svg_path)
        if pdf_path:
            latex += _background_overlay(pdf_path.relative_to(base_path))

    latex += "\\vbox to 0pt{%\n\\begin{tikzpicture}[overlay, remember picture]\n"
    for kind, text, cx, cy, _w in layout:
        _font, size, lh, _band = _DIV_STYLES[kind]
        face = {'title': '\\bfseries', 'quote': '\\itshape', 'author': ''}[kind]
        latex += (
            f"  \\node[anchor=center, inner sep=0pt] at "
            f"([xshift={cx:.2f}mm, yshift=-{cy:.2f}mm]current page.north west) "
            f"{{\\fontsize{{{size}}}{{{lh}}}\\selectfont{face} {escape_latex(text)}}};\n"
        )
    latex += "\\end{tikzpicture}\\vss}\\nointerlineskip\n\\clearpage\n"
    return latex


def build_featured_section_pages(section: Dict, base_path: Path, base_url: str = '', logo_file: str = '') -> str:
    """Return LaTeX for a *featured projects* section.

    A featured section is identified by the presence of a ``projects`` key
    (a list of workspace-relative path strings) and the **absence** of a
    ``path`` key.  Each project contributes a thumbnail image and a caption
    block placed directly below it (title, year / medium / dimensions), styled
    with the same ``\\begin{tabular}`` block used for individual gallery captions.

    Layout rules
    ~~~~~~~~~~~~
    - All items on a page appear in a **single row**, side-by-side:

      * 1 item  → centred at 60 % of \\textwidth
      * 2 items → two equal columns  (47 % each)
      * 3 items → three equal columns (31 % each)
      * 4 items → four equal columns  (23.5 % each)

    - At most :data:`_FEATURED_MAX_PER_PAGE` thumbnails are placed on one page;
      additional items overflow to the next page.
    - The section title and a horizontal rule appear at the top of the first
      page only.

    Args:
        section:   Section dict containing ``title`` (str) and ``projects``
                   (list of workspace-relative path strings).
        base_path: Workspace root.
        base_url:  Artist website base URL used to build thumbnail hyperlinks.

    Returns:
        LaTeX string starting with ``\\clearpage``, or an empty string when
        the section has no valid projects.
    """
    title     = escape_latex(section.get('title', 'Featured Works'))
    raw_paths = section.get('projects', [])
    if not raw_paths:
        return ""

    # Resolve minimal metadata (thumbnail + caption fields) for every item.
    items = [get_featured_item_meta(p, base_path) for p in raw_paths]

    # Chunk into pages of at most _FEATURED_MAX_PER_PAGE items.
    pages = [
        items[i : i + _FEATURED_MAX_PER_PAGE]
        for i in range(0, len(items), _FEATURED_MAX_PER_PAGE)
    ]

    latex = ""
    for page_idx, page_items in enumerate(pages):
        latex += "\\clearpage\n"

        # Section heading + full-width rule — first page only.
        if page_idx == 0:
            latex += (
                f"\\noindent{{\\Large\\textbf{{{title}}}}}\n"
                "\\par\\vspace{1em}\n"
            )

        n         = len(page_items)
        img_frac  = _FEATURED_IMG_FRAC.get(n, _FEATURED_IMG_FRAC[4])
        img_h     = _FEATURED_IMG_HEIGHT

        # Crop every thumbnail on this page to the narrowest aspect ratio so
        # all images share the same height (sides of wider ones are trimmed).
        from PIL import Image as _PILImage
        _aspects = []
        for _m in page_items:
            _t = _featured_thumb_path(_m, base_path)
            if _t:
                try:
                    with _PILImage.open(base_path / _t) as _im:
                        _aspects.append(_im.size[0] / _im.size[1])
                except Exception:
                    pass
        target_aspect = min(_aspects) if _aspects else None

        # All N items in a single row, separated by \hfill.
        latex += "{\\setlength{\\parskip}{0pt}%\n\\noindent\n"

        for idx, meta in enumerate(page_items):
            # Absolute project URL for hyperlinks.
            project_url = (
                f"{base_url.rstrip('/')}/{meta['path'].rstrip('/')}/"
                if base_url else ''
            )

            # Workspace-relative thumbnail path (must exist on disk).
            thumb_rel = _featured_thumb_path(meta, base_path)
            if thumb_rel and target_aspect:
                thumb_rel = _crop_to_aspect(thumb_rel, target_aspect, base_path)

            # Image — linked to project page when base_url is available.
            if thumb_rel:
                raw_inc = (
                    f"\\includegraphics"
                    f"[width=\\linewidth,height={img_h},keepaspectratio]"
                    f"{{{thumb_rel}}}"
                )
                img_line = (
                    f"\\href{{{project_url}}}{{{raw_inc}}}"
                    if project_url else raw_inc
                )
            else:
                img_line = ""

            # Caption: title + year on line 1, medium on line 2, dimensions on
            # line 3 — assembled with _caption_tabular for consistent styling.
            caption_lines: List[str] = []
            t = escape_latex(meta.get('title', ''))
            y = escape_latex(meta.get('year', ''))
            line1 = ", ".join(filter(None, [t, y]))
            if line1:
                caption_lines.append(line1)
            if meta.get('medium'):
                caption_lines.append(escape_latex(meta['medium']))
            if meta.get('dimensions'):
                caption_lines.append(escape_latex(meta['dimensions']))

            caption = _caption_tabular(caption_lines, align_right=False) if caption_lines else ""

            # Minipage: image on top, caption block below (top-aligned so
            # all thumbnails start at the same baseline).
            latex += f"\\begin{{minipage}}[t]{{{img_frac}\\textwidth}}\n"
            if img_line:
                latex += img_line + "\n"
            if caption:
                latex += "\\vspace{0.5em}\n" + caption + "\n"
            latex += "\\end{minipage}"

            # Separate items with \hfill; no separator after the last item.
            latex += "\n" if idx == n - 1 else "\\hfill\n"

        latex += "}%\n"  # close \parskip=0 group
        latex += _logo_if_space(logo_file)

    return latex
