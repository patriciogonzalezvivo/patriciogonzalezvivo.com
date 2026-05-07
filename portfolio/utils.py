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


# ---------------------------------------------------------------------------
# LaTeX escaping
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
      - HTML tags (``<…>``)
      - Markdown image syntax (``![alt](url)``)
      - Markdown link syntax, keeping the link text
      - ATX-style headers (``# Heading``)
      - Collapses runs of 3+ blank lines to a single blank line
    """
    text = re.sub(r'<[^>]+>', '', markdown)                        # HTML tags
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)                    # images
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)         # links → text
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)         # headers
    text = re.sub(r'\n{3,}', '\n\n', text)                         # collapse blank lines
    return text.strip()


# ---------------------------------------------------------------------------
# Markdown → LaTeX
# ---------------------------------------------------------------------------

def markdown_to_latex(text: str) -> str:
    """Convert a subset of Markdown to LaTeX.

    Handles:
      - LaTeX character escaping
      - Bold (``**text**``) → ``\\textbf{text}``
      - Italic (``*text*`` / ``_text_``) → ``\\textit{text}``
      - Block-quotes (``> text``) → ``\\begin{quote}…\\end{quote}``
      - Unordered list items (``- item`` / ``* item``) → ``\\item …``
      - Single newlines promoted to paragraph breaks (double newline in LaTeX)
    """
    if not text:
        return ""

    text = escape_latex(text)

    # Inline formatting (applied after escaping so we only touch Markdown delimiters)
    text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
    text = re.sub(r'\*(.+?)\*',     r'\\textit{\1}', text)
    text = re.sub(r'_(.+?)_',       r'\\textit{\1}', text)

    # Block-level elements
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

    return text
