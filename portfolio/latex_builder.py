"""
portfolio/latex_builder.py
--------------------------
Template-population orchestrator for the portfolio generator.

Each placeholder in the LaTeX template (``%%PLACEHOLDER%%``) is mapped to
an artist value or a builder result and substituted in one pass.

Responsibilities live in dedicated modules:
  - :mod:`portfolio.pages`    — per-artwork page rendering
  - :mod:`portfolio.sections` — bio, statement, and appendix sections
  - :mod:`portfolio.legacy`   — standalone document builder (no template)

This module owns:
  - The placeholder → value substitution map.
  - The convention that ``%%FOO%%`` (URL position) is raw and
    ``%%FOO_LABEL%%`` (visible label) is LaTeX-escaped.
"""

from pathlib import Path
from typing import Dict, List

from portfolio.utils import escape_latex
from portfolio.pages import build_artwork_pages, build_caption  # re-exported
from portfolio.sections import (
    build_bio_block, build_artist_statement, build_optional_section,
)
from portfolio.legacy import build_legacy_document  # re-exported


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

    website     = artist.get('website', '')
    website_url = artist.get('website_url', f'https://{website}' if website else '')

    bio                = build_bio_block(artist, base_path, website_url)
    optional_statement = build_artist_statement(artist, base_path)

    print("Resolving optional file sections…")
    optional_cv          = build_optional_section('cv_file',          artist, base_path)
    optional_exhibitions = build_optional_section('exhibitions_file', artist, base_path)
    optional_talks       = build_optional_section('talks_file',       artist, base_path)
    optional_press       = build_optional_section('press_file',       artist, base_path)

    artworks_latex = "\n".join(
        build_artwork_pages(project, base_path, website_url) for project in projects
    )

    # URL-position placeholders go inside \href{} arguments and must stay raw.
    # _LABEL placeholders are the visible text and must be LaTeX-escaped so
    # characters like underscores or ampersands do not break the compile.
    email     = artist.get('email', '')
    instagram = artist.get('instagram', '')
    replacements = {
        '%%ARTIST_NAME%%':               escape_latex(artist.get('name', '')),
        '%%ARTIST_EMAIL%%':              email,
        '%%ARTIST_EMAIL_LABEL%%':        escape_latex(email),
        '%%ARTIST_WEBSITE%%':            escape_latex(website),
        '%%ARTIST_WEBSITE_URL%%':        website_url,
        '%%ARTIST_INSTAGRAM%%':          instagram,
        '%%ARTIST_INSTAGRAM_LABEL%%':    escape_latex(instagram),
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
