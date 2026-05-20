"""
portfolio/utils.py
------------------
Text-processing utilities shared across the portfolio generator.

Responsibilities:
  - Escaping strings for safe LaTeX inclusion.
  - Converting simple Markdown to LaTeX.
  - Stripping HTML / Markdown to plain text.
"""

import re
from urllib.parse import urljoin


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
    width      Float width as a percentage (default ``40%``).  Accepts
               either ``40%`` or the equivalent LaTeX fraction ``0.40``.
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
    width_s = params.get('width', '40%')

    if not src:
        return ''

    # Normalise width to a LaTeX fraction (e.g. '40%' → 0.40).
    if width_s.endswith('%'):
        try:
            width_frac = float(width_s[:-1]) / 100
        except ValueError:
            width_frac = 0.40
    else:
        try:
            width_frac = float(width_s)
        except ValueError:
            width_frac = 0.40

    pos = 'r' if side[0].lower() == 'r' else 'l'
    img = f'\\includegraphics[width=\\linewidth,keepaspectratio]{{{src}}}'
    if link:
        img = f'\\href{{{link}}}{{{img}}}'

    latex  = f'\\begin{{wrapfigure}}{{{pos}}}{{{width_frac:.2f}\\textwidth}}\n'
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
        latex += '\\par\\vspace{0.4em}\n'
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
    text = re.sub(r'\n{3,}', '\n\n', text)                         # collapse blank lines
    return text.strip()


# ---------------------------------------------------------------------------
# Markdown → LaTeX
# ---------------------------------------------------------------------------

def markdown_to_latex(text: str, base_url: str = '') -> str:
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

    # ------------------------------------------------------------------
    # Inline / block formatting (applied after escaping)
    # ------------------------------------------------------------------
    text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
    text = re.sub(r'\*(.+?)\*',     r'\\textit{\1}', text)
    text = re.sub(r'_(.+?)_',       r'\\textit{\1}', text)

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

    return text
