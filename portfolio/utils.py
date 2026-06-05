"""
portfolio/utils.py
------------------
Text-processing utilities shared across the portfolio generator.

Responsibilities:
  - Escaping strings for safe LaTeX inclusion.
  - Converting simple Markdown to LaTeX.
  - Stripping HTML / Markdown to plain text.
  - Locating project thumbnails by canonical naming convention.
"""

import re
from pathlib import Path
from typing import Optional, Sequence
from urllib.parse import urljoin


# ---------------------------------------------------------------------------
# Thumbnail discovery
# ---------------------------------------------------------------------------

# Canonical thumbnail extensions in priority order.
# THUMBNAIL_EXTS_ALL    — video/animated first, then static (for listings).
# THUMBNAIL_EXTS_STATIC — only formats valid for og:image and PDF inclusion.
THUMBNAIL_EXTS_ALL    = ('webm', 'gif', 'webp', 'jpg', 'jpeg', 'png')
THUMBNAIL_EXTS_STATIC = ('webp', 'jpg', 'jpeg', 'png', 'gif')


def find_thumbnail(
    directory: Path,
    kinds: Sequence[str] = ('thumb', 'thumbnail'),
    exts: Sequence[str] = THUMBNAIL_EXTS_ALL,
) -> Optional[str]:
    """Return the first existing thumbnail filename in *directory*, or None.

    Args:
        directory: Directory to search.
        kinds:     Filename prefixes in priority order (``'thumb'`` is the
                   smaller listing variant; ``'thumbnail'`` the larger one).
        exts:     Allowed extensions in priority order.

    Returns:
        Filename relative to *directory* (e.g. ``'thumb.jpg'``), or ``None``.
    """
    for kind in kinds:
        for ext in exts:
            name = f'{kind}.{ext}'
            if (directory / name).exists():
                return name
    return None


# ---------------------------------------------------------------------------
# :::wrapfig block directive
# ---------------------------------------------------------------------------

# Matches a full :::wrapfig block, capturing the side ('right'/'left'/'r'/'l')
# and the raw key-value body between the opening and closing ::: fences.
_WRAPFIG_RE = re.compile(
    r'^:::wrapfig[ \t]+(right|left|r|l)[ \t]*\n(.*?)^:::[ \t]*$',
    re.MULTILINE | re.DOTALL,
)

# Matches a self-contained HTML block element (one or more lines).
# Covers the most common block tags used in README files for rich layout;
# notably <div> flex rows, <table>, <figure>, etc.
_HTML_BLOCK_RE = re.compile(
    r'<(div|table|figure|section|article|aside|pre|details|canvas)'
    r'(?:\s[^>]*)?>.*?</\1>',
    re.DOTALL | re.IGNORECASE,
)


def _wrapfig_to_latex(side: str, body: str) -> str:
    """Build a LaTeX ``\\begin{wrapfigure}`` block from a ``:::wrapfig`` body.

    Recognised keys in *body* (one ``key: value`` pair per line):

    =========  =============================================================
    Key        Description
    =========  =============================================================
    src        Workspace-relative image path (required).
    title      Artwork title, rendered bold on caption line 1 (optional).
    year       Artwork year, appended to title on caption line 1 (optional).
    medium     Artwork medium, rendered on caption line 2 (optional).
    caption    Plain-text caption rendered below artwork info (optional).
    link       URL to hyperlink the image via ``\\href`` (optional).
    width      Float box width as a percentage (default ``40%``).  Accepts
               either ``40%`` or the equivalent LaTeX fraction ``0.40``.
    size       Image scale within the box as a percentage (default ``100%``).
               Use this to shrink an image that fills too much of the box,
               e.g. ``size: 70%`` renders the image at 70% of the box width
               and centres it inside the float.
    size_pdf   Same as ``size`` but applies only to the PDF (LaTeX) output;
               overrides ``size`` when both are present.  Ignored by the
               website (PHP) renderer.
    margin     Gap between the float box and the surrounding text column,
               as a length with a CSS-like unit (e.g. ``0.5cm``, ``8pt``,
               ``1em``).  Defaults to LaTeX's current ``\columnsep``.
    margin_pdf Same as ``margin`` but applies only to the PDF output;
               overrides ``margin`` when both are present.
    =========  =============================================================
    """
    params: dict = {}
    for line in body.splitlines():
        if ':' in line:
            k, _, v = line.partition(':')
            params[k.strip().lower()] = v.strip()

    src     = params.get('src', '')
    title   = params.get('title', '')
    year    = params.get('year', '')
    medium  = params.get('medium', '')
    caption = params.get('caption', '')
    link    = params.get('link', '')
    width_s  = params.get('width', '40%')
    # size_pdf overrides size for PDF output; size is used by both PDF and web.
    size_s   = params.get('size_pdf') or params.get('size', '100%')
    # margin_pdf overrides margin for PDF output.
    margin_s = params.get('margin_pdf') or params.get('margin', '')

    if not src:
        return ''

    def _parse_frac(s: str, default: float) -> float:
        """Parse a percentage string or bare decimal into a 0–1 fraction."""
        s = s.strip()
        if s.endswith('%'):
            try:
                return float(s[:-1]) / 100
            except ValueError:
                return default
        try:
            return float(s)
        except ValueError:
            return default

    width_frac = _parse_frac(width_s, 0.40)
    size_frac  = _parse_frac(size_s,  1.00)
    # Clamp to sensible range
    size_frac  = max(0.05, min(1.0, size_frac))

    pos = 'r' if side[0].lower() == 'r' else 'l'
    # Scale the box width to match the actual image size so the gap between
    # the image and the surrounding text stays tight regardless of scale.
    box_frac = width_frac * size_frac

    if margin_s:
        # Widen the box by the margin so the extra gap comes from the box
        # itself rather than from \columnsep. The image width is reduced by
        # the same amount so it stays flush with the page edge. The \hspace
        # fills the gap on the text-facing side.
        box_width = f'\\dimexpr {box_frac:.2f}\\textwidth + {margin_s}\\relax'
        img_width = f'\\dimexpr\\linewidth - {margin_s}\\relax'
        img = f'\\includegraphics[width={img_width},keepaspectratio]{{{src}}}'
        if link:
            img = f'\\href{{{link}}}{{{img}}}'
        if pos == 'r':
            img = f'\\hspace{{{margin_s}}}' + img   # gap on the left (text side)
        else:
            img = img + f'\\hspace{{{margin_s}}}'   # gap on the right (text side)
    else:
        box_width = f'{box_frac:.2f}\\textwidth'
        img = f'\\includegraphics[width=\\linewidth,keepaspectratio]{{{src}}}'
        if link:
            img = f'\\href{{{link}}}{{{img}}}'

    latex  = f'\\begin{{wrapfigure}}{{{pos}}}{{{box_width}}}\n'
    latex += '\\vspace{-\\intextsep}\n'
    latex += img + '\n'

    # Build structured caption lines matching the gallery artwork style.
    caption_lines = []
    # Line 1: title (bold) and/or year
    if title or year:
        parts = []
        if title:
            parts.append(f'\\textbf{{{escape_latex(title)}}}')
        if year:
            parts.append(escape_latex(year))
        caption_lines.append(', '.join(parts))
    # Line 2: medium
    if medium:
        caption_lines.append(escape_latex(medium))
    # Line 3: plain caption text
    if caption:
        caption_lines.append(escape_latex(caption))

    if caption_lines:
        align_cmd = '\\raggedleft' if pos == 'r' else '\\raggedright'
        latex += '\\par\\vspace{0.1em}\n'
        latex += '{\\small ' + align_cmd + '\n'
        latex += ' \\\\\n'.join(caption_lines) + '\n'
        latex += '\\par}\n'

    latex += '\\vspace{-\\intextsep}\n'
    latex += '\\end{wrapfigure}\n'
    return latex


# ---------------------------------------------------------------------------

# Characters that have special meaning in LaTeX and must be escaped.
_LATEX_ESCAPE_MAP = {
    '\\': r'\textbackslash{}',
    '&':  r'\&',
    '%':  r'\%',
    '$':  r'\$',
    '#':  r'\#',
    '_':  r'\_',
    '{':  r'\{',
    '}':  r'\}',
    '~':  r'\textasciitilde{}',
    '^':  r'\^{}',
}
_LATEX_ESCAPE_RE = re.compile(
    '|'.join(re.escape(k) for k in _LATEX_ESCAPE_MAP)
)


def escape_latex(text: str) -> str:
    """Escape all LaTeX-special characters in *text*.

    Uses a single-pass regex so that no introduced backslash is re-processed.
    Returns an empty string when *text* is falsy.
    """
    if not text:
        return ""
    return _LATEX_ESCAPE_RE.sub(lambda m: _LATEX_ESCAPE_MAP[m.group(0)], text)


# ---------------------------------------------------------------------------
# Markdown → plain text
# ---------------------------------------------------------------------------

def strip_markdown(markdown: str) -> str:
    """Return *markdown* as plain text suitable for further processing.

    Removes:
      - ``:::wrapfig`` floating-image blocks
      - HTML tags (``<…>``)
      - Markdown image syntax (``![alt](url)``)
      - Markdown link syntax, keeping the link text
      - ATX-style headers (``# Heading``)
      - Collapses runs of 3+ blank lines to a single blank line
    """
    text = _WRAPFIG_RE.sub('', markdown)                           # :::wrapfig blocks
    text = re.sub(r'<[^>]+>', '', text)                            # HTML tags
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)                    # images
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)         # links → text
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)         # headers
    text = re.sub(r'^\s*(?:-{3,}|\*{3,}|_{3,})\s*$', '', text,
                  flags=re.MULTILINE)                              # HR lines
    text = re.sub(r'\n{3,}', '\n\n', text)                         # collapse blank lines
    return text.strip()


# ---------------------------------------------------------------------------
# Markdown → LaTeX
# ---------------------------------------------------------------------------

def markdown_to_latex(text: str, base_url: str = '', divider=None) -> str:
    """Convert a subset of Markdown to LaTeX.

    Handles (in processing order):
      - ``:::wrapfig`` blocks  → ``\\begin{wrapfigure}…\\end{wrapfigure}``
      - Markdown links         → ``\\href{url}{text}``
      - HTML tag stripping
      - Markdown image removal (``![alt](url)``)
      - ATX header stripping   (``# Heading``)
      - LaTeX character escaping
      - Bold (``**text**``)    → ``\\textbf{text}``
      - Italic (``*text*``)    → ``\\textit{text}``
      - Block-quotes           → ``\\begin{quote}…\\end{quote}``
      - Unordered list items   → ``\\item …``
      - Single newlines promoted to paragraph breaks
    """
    if not text:
        return ""

    # ------------------------------------------------------------------
    # Pre-escape pass: extract items whose content must not be run
    # through escape_latex (paths, URLs, image sources).
    # ------------------------------------------------------------------

    # Horizontal rules (---, ***, ___) → deferred divider placeholder
    _HR_RE = re.compile(r'^\s*(?:-{3,}|\*{3,}|_{3,})\s*$', re.MULTILINE)
    _hr_key = '\x01HR\x01'
    text = _HR_RE.sub(_hr_key, text)

    # :::wrapfig blocks → deferred LaTeX wrapfigure
    _wf_map: dict = {}
    def _wf_store(m: re.Match) -> str:
        key = f'\x01WF{len(_wf_map)}\x01'
        _wf_map[key] = _wrapfig_to_latex(m.group(1), m.group(2))
        return key
    text = _WRAPFIG_RE.sub(_wf_store, text)

    # Markdown links [text](url) → deferred \href{url}{text}
    _lk_map: dict = {}
    _base = base_url.rstrip('/') + '/' if base_url else ''
    def _lk_store(m: re.Match) -> str:
        key = f'\x01LK{len(_lk_map)}\x01'
        url = m.group(2)
        if _base and not url.startswith(('http://', 'https://', '#', 'mailto:')):
            url = urljoin(_base, url)
        _lk_map[key] = (m.group(1), url)  # (display_text, url)
        return key
    text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', _lk_store, text)

    # Bold/italic markers must be captured BEFORE escape_latex runs, because
    # underscores become \_ after escaping and the italic regex would
    # otherwise corrupt them. We store the inner content raw and re-escape
    # it during restoration.
    _bf_map: dict = {}
    def _bf_store(m: re.Match, tag: str) -> str:
        key = f'\x01{tag}{len(_bf_map)}\x01'
        _bf_map[key] = (tag, m.group(1))
        return key
    text = re.sub(r'\*\*(.+?)\*\*', lambda m: _bf_store(m, 'B'), text)
    text = re.sub(r'\*(.+?)\*',     lambda m: _bf_store(m, 'I'), text)
    # Underscore italics: avoid matching intraword underscores (e.g. file_name,
    # snake_case identifiers) by requiring non-word boundaries on both sides.
    text = re.sub(
        r'(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])',
        lambda m: _bf_store(m, 'I'),
        text,
    )

    # Remove constructs with no LaTeX equivalent
    text = re.sub(r'<[^>]+>', '', text)                         # HTML tags
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)                 # Markdown images
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)      # ATX headers

    # ------------------------------------------------------------------
    # Escape LaTeX special characters in the remaining prose
    # ------------------------------------------------------------------
    text = escape_latex(text)

    # Restore links as \href — URL kept raw, display text bold and escaped.
    for key, (ltext, url) in _lk_map.items():
        text = text.replace(key, f'\\href{{{url}}}{{\\textbf{{{escape_latex(ltext)}}}}}')

    # Restore bold/italic with their inner content properly escaped.
    for key, (tag, content) in _bf_map.items():
        cmd = 'textbf' if tag == 'B' else 'textit'
        text = text.replace(key, f'\\{cmd}{{{escape_latex(content)}}}')

    # ------------------------------------------------------------------
    # Block formatting (applied after escaping)
    # ------------------------------------------------------------------
    text = re.sub(
        r'^>\s+(.+)$',
        r'\\begin{quote}\1\\end{quote}',
        text, flags=re.MULTILINE
    )
    text = re.sub(
        r'^\s*[\*\-]\s+(.+)$',
        r'\\item \1',
        text, flags=re.MULTILINE
    )

    # Wrap consecutive \item lines in an itemize environment so bare \item
    # commands do not crash XeLaTeX.
    text = _wrap_item_runs(text)

    # Promote single newlines to paragraph breaks.
    # Strategy: protect existing double-newlines, convert remaining single
    # newlines, then restore the protected ones.
    text = re.sub(r'\n{2,}', '\x00', text)   # mark existing paragraph breaks
    text = text.replace('\n', '\n\n')          # single → double
    text = text.replace('\x00', '\n\n')        # restore

    # ------------------------------------------------------------------
    # Re-inject wrapfig LaTeX blocks
    # ------------------------------------------------------------------
    for key, wf_latex in _wf_map.items():
        text = text.replace(key, wf_latex)

    # Re-inject divider LaTeX (replaces --- / *** / ___ HR patterns)
    if _hr_key in text:
        if divider:
            div_latex = (
                '\n\n\\vspace{0.5em}\\begin{center}\n'
                f'\\includegraphics[height=2em,keepaspectratio]{{{divider}}}\n'
                '\\end{center}\\vspace{0.5em}\n\n'
            )
        else:
            div_latex = (
                '\n\n\\vspace{0.8em}\\begin{center}'
                '\\rule{0.3\\textwidth}{0.4pt}'
                '\\end{center}\\vspace{0.8em}\n\n'
            )
        text = text.replace(_hr_key, div_latex)

    return text


def _wrap_item_runs(text: str) -> str:
    """Wrap each run of consecutive ``\\item`` lines in an itemize block."""
    lines = text.split('\n')
    out: list = []
    in_list = False
    for line in lines:
        is_item = line.lstrip().startswith('\\item ')
        if is_item and not in_list:
            out.append('\\begin{itemize}')
            in_list = True
        elif not is_item and in_list:
            out.append('\\end{itemize}')
            in_list = False
        out.append(line)
    if in_list:
        out.append('\\end{itemize}')
    return '\n'.join(out)
