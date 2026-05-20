"""
portfolio/sections.py
---------------------
Bio, artist-statement, and optional-appendix LaTeX section builders.

Each builder reads an artist-supplied Markdown file (from ``data.json``)
and converts it to a LaTeX block that fits the portfolio template.

Section file keys are mapped to display names via ``SECTION_DISPLAY_NAMES``.
"""

import re
from pathlib import Path
from typing import Dict
from urllib.parse import urljoin

from portfolio.utils import markdown_to_latex


# Maps data.json file keys to their display names used in section headers.
SECTION_DISPLAY_NAMES: Dict[str, str] = {
    'cv_file':           'CV',
    'exhibitions_file':  'Exhibitions',
    'talks_file':        'Talks',
    'press_file':        'Press',
}


def build_bio_block(artist: Dict, base_path: Path, base_url: str = '') -> str:
    """Return the LaTeX bio block, optionally wrapped around an avatar figure."""
    bio_path_str = artist.get('bio_file')
    if not bio_path_str:
        return ''

    bio_path = base_path / bio_path_str
    if not bio_path.exists():
        print(f"  (skipping bio_file: {bio_path_str} not found)")
        return ''

    bio_raw = bio_path.read_text(encoding='utf-8')
    if base_url:
        _root = base_url.rstrip('/') + '/'
        # Resolve relative link: values in :::wrapfig blocks
        bio_raw = re.sub(
            r'^(link\s*:\s*)(?!https?://)(.+)$',
            lambda m: m.group(1) + urljoin(_root, m.group(2).strip()),
            bio_raw, flags=re.MULTILINE,
        )
        # Resolve relative URLs in markdown inline links [text](url)
        bio_raw = re.sub(
            r'\[([^\]]+)\]\((?!https?://|mailto:|#)([^)]+)\)',
            lambda m: f'[{m.group(1)}]({urljoin(_root, m.group(2).strip())})',
            bio_raw,
        )
    bio_text = markdown_to_latex(bio_raw)
    if not bio_text:
        return ''

    logo_tex = (
        "\\vspace{3em}\n"
        "\\begin{center}\n"
        "\\includegraphics[height=2cm,keepaspectratio]{images/logo-gray.png}\n"
        "\\end{center}\n"
    )

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
            "\\markright{Bio}\n"
            f"\\begin{{wrapfigure}}{{r}}{{0.35\\textwidth}}\n"
            "\\vspace{4pt}\n"
            f"{avatar_img}\n"
            "\\end{wrapfigure}\n"
            + bio_text + "\n"
            + logo_tex
        )

    return "\\markright{Bio}\n" + bio_text + "\n" + logo_tex


def build_artist_statement(artist: Dict, base_path: Path) -> str:
    """Return a LaTeX ``\\section*{Artist Statement}`` block, or empty string."""
    path_str = artist.get('artist_statement_file')
    if not path_str:
        return ''

    full_path = base_path / path_str
    if not full_path.exists():
        print(f"  (skipping artist_statement_file: {path_str} not found)")
        return ''

    content = markdown_to_latex(full_path.read_text(encoding='utf-8'))
    if not content.strip():
        return ''

    return (
        "\\clearpage\n\n"
        "\\markright{Artist Statement}\n\n"
        "\\section*{Artist Statement}\n\n"
        + content
        + "\n\n\\clearpage"
    )


def build_optional_section(file_key: str, artist: Dict, base_path: Path) -> str:
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

    content = markdown_to_latex(full_path.read_text(encoding='utf-8'))
    if not content.strip():
        return ''

    print(f"  + {file_key}: {filepath}")
    section_name = SECTION_DISPLAY_NAMES.get(file_key, '')
    mark = f"\\markright{{{section_name}}}\n\n" if section_name else ""
    return f"\\clearpage\n\n{mark}{content}\n"
