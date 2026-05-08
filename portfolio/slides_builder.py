"""
portfolio/slides_builder.py
---------------------------
Beamer slide generator for the portfolio.

Each project gets one or more frames:
  - Frame 1: frame title (name + year) + first image.
             If the image is landscape and the description is short enough,
             description appears in a left column alongside the image.
  - Frame 2+: additional images (capped at MAX_IMAGES_PER_PROJECT total).

The module exposes two public functions:

    populate_slides_template(template_text, data, projects, base_path)
        Replace ``%%PLACEHOLDER%%`` markers in a Beamer ``.tex`` template.

    build_slides(projects, base_path)
        Return the Beamer frame block (the ``%%SLIDES%%`` replacement).
"""

from pathlib import Path
from typing import Dict, List

from .utils import escape_latex, strip_markdown
from .images import read_image_dimensions


# Maximum number of images shown per project (including the first).
MAX_IMAGES_PER_PROJECT = 4


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def populate_slides_template(
    template_text: str,
    data: Dict,
    projects: List[Dict],
    base_path: Path,
) -> str:
    """Replace all ``%%PLACEHOLDER%%`` markers in a Beamer template.

    Args:
        template_text: Raw contents of the ``.tex`` Beamer template.
        data:          Parsed ``portfolio/data.json`` dict.
        projects:      List of project dicts (from :mod:`portfolio.metadata`).
        base_path:     Workspace root.

    Returns:
        Complete Beamer LaTeX document string.
    """
    artist  = data.get('artist', {})
    name    = escape_latex(artist.get('name', ''))
    title   = escape_latex(artist.get('portfolio_title', 'Portfolio'))
    website = artist.get('website', '')          # used inside text, not \href

    slides_latex = build_slides(projects, base_path)

    for placeholder, value in [
        ('%%ARTIST_NAME%%',     name),
        ('%%PORTFOLIO_TITLE%%', title),
        ('%%ARTIST_WEBSITE%%',  website),
        ('%%SLIDES%%',          slides_latex),
    ]:
        template_text = template_text.replace(placeholder, value)

    return template_text


def build_slides(projects: List[Dict], base_path: Path) -> str:
    """Return Beamer frame LaTeX for all projects."""
    return "\n\n".join(_project_frames(p, base_path) for p in projects)


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _project_frames(project: Dict, base_path: Path) -> str:
    """Return one or more Beamer frames for a single project."""
    title       = escape_latex(project['title'])
    year        = escape_latex(project['year'])
    frame_title = f"{title}, {year}"

    images = [
        img for img in project.get('images', [])
        if (base_path / img).exists()
    ][:MAX_IMAGES_PER_PROJECT]

    if not images:
        return _text_frame(frame_title, project)

    frames = [_image_frame(frame_title, images[0], project, base_path, is_first=True)]
    for img in images[1:]:
        frames.append(_image_frame(frame_title, img, project, base_path, is_first=False))

    return "\n\n".join(frames)


def _image_frame(
    frame_title: str,
    img_path: str,
    project: Dict,
    base_path: Path,
    *,
    is_first: bool,
) -> str:
    """Return a single Beamer frame displaying *img_path*.

    On the first frame for a landscape image, a brief description is placed
    in a left column when one is available.
    """
    w, h = read_image_dimensions(base_path / img_path)
    is_portrait = h > w > 0

    if is_first and not is_portrait:
        desc = _brief_desc(
            project.get('about', '') or project.get('description', '') or ''
        )
        if desc:
            return (
                f"\\begin{{frame}}{{{frame_title}}}\n"
                "  \\begin{columns}[c]\n"
                "    \\column{0.38\\textwidth}\n"
                f"    {escape_latex(desc)}\n"
                "    \\column{0.59\\textwidth}\n"
                "    \\centering\n"
                f"    \\includegraphics[width=\\linewidth,height=0.80\\textheight,keepaspectratio]{{{img_path}}}\n"
                "  \\end{columns}\n"
                "\\end{frame}"
            )

    return (
        f"\\begin{{frame}}{{{frame_title}}}\n"
        "  \\centering\n"
        f"  \\includegraphics[width=\\textwidth,height=0.82\\textheight,keepaspectratio]{{{img_path}}}\n"
        "\\end{frame}"
    )


def _text_frame(frame_title: str, project: Dict) -> str:
    """Return a text-only Beamer frame for projects without images."""
    desc = _brief_desc(
        project.get('about', '') or project.get('description', '') or ''
    )
    body = f"  {escape_latex(desc)}\n" if desc else ""
    return f"\\begin{{frame}}{{{frame_title}}}\n{body}\\end{{frame}}"


def _brief_desc(text: str, max_chars: int = 280) -> str:
    """Return the first paragraph of *text*, stripped of Markdown and
    truncated to *max_chars* at a word boundary."""
    if not text:
        return ''
    text = strip_markdown(text)
    para = text.split('\n\n')[0].strip()
    if len(para) > max_chars:
        para = para[:max_chars].rsplit(' ', 1)[0] + '\u2026'
    return para
