"""
portfolio/pptx_builder.py
-------------------------
Pandoc-slide Markdown builder for PPTX export.

Each project becomes:
  - A text slide  (## Title, Year  +  first paragraph of description)
  - One image slide per image (up to MAX_IMAGES)

Running the resulting Markdown through pandoc with ``--to=pptx`` produces
an editable PowerPoint file that can be opened in Microsoft Office or
LibreOffice Impress.

Public API
----------
build_pptx_markdown(data, projects, base_path)  →  str
"""

import re
from pathlib import Path
from typing import Dict, List


# Maximum images shown per project.
MAX_IMAGES = 5

# Truncate description to this many characters on the text slide.
_MAX_DESC_CHARS = 400


def build_pptx_markdown(
    data: Dict,
    projects: List[Dict],
    base_path: Path,
) -> str:
    """Return a pandoc slide Markdown string for the given projects.

    The string is meant to be written to a ``.md`` file and then compiled with:

        pandoc <file>.md --to=pptx --slide-level=2 --resource-path=. -o portfolio.pptx

    Args:
        data:      Parsed ``portfolio/data.json`` dict (for artist metadata).
        projects:  List of project dicts (from :mod:`portfolio.metadata`).
        base_path: Workspace root; used to verify that image files exist.

    Returns:
        Pandoc slide Markdown string.
    """
    artist  = data.get('artist', {})
    name    = artist.get('name', '')
    title   = artist.get('portfolio_title', 'Portfolio')
    website = artist.get('website', '')

    lines: List[str] = [
        '---',
        f'title: "{title}"',
        f'author: "{name}"',
    ]
    if website:
        lines.append(f'subtitle: "{website}"')
    lines += ['---', '']

    for project in projects:
        proj_title = project.get('title', '')
        year       = project.get('year', '')
        frame_title = f'{proj_title}, {year}' if year else proj_title

        # ── Text slide ──────────────────────────────────────────────────
        lines.append(f'## {frame_title}')
        lines.append('')

        desc = (project.get('about') or project.get('description') or '').strip()
        if desc:
            # First paragraph only, no markdown syntax
            para = desc.split('\n\n')[0].strip()
            # Strip simple markdown syntax that would look odd in pptx
            para = re.sub(r'\*+(.+?)\*+', r'\1', para)
            para = re.sub(r'_(.+?)_', r'\1', para)
            if len(para) > _MAX_DESC_CHARS:
                para = para[:_MAX_DESC_CHARS].rsplit(' ', 1)[0] + '\u2026'
            lines.append(para)
            lines.append('')

        medium = project.get('medium', '')
        dims   = project.get('dimensions', '')
        if medium or dims:
            meta_line = '  \n'.join(part for part in [medium, dims] if part)
            lines.append(meta_line)
            lines.append('')

        # ── Image slides ────────────────────────────────────────────────
        skip_stems = {Path(s).stem for s in project.get('skip', [])}
        images = [
            img for img in project.get('images', [])
            if (base_path / img).exists()
            and Path(img).stem not in skip_stems
        ][:MAX_IMAGES]

        for img in images:
            lines.append('---')
            lines.append('')
            # A lone image paragraph fills the entire slide in pandoc pptx
            lines.append(f'![{proj_title}]({img})')
            lines.append('')

    return '\n'.join(lines)
