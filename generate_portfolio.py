#!/usr/bin/env python3
"""
generate_portfolio.py
---------------------
Command-line driver for the artist portfolio PDF generator.

All logic lives in the ``portfolio/`` package.  This script is a thin
orchestrator that parses arguments and delegates to that package.

Usage (recommended — template + JSON):
    python generate_portfolio.py -t portfolio/template.tex \\
                                 -d portfolio/data.json \\
                                 -o portfolio.pdf

Usage (legacy — inline LaTeX, no external template):
    python generate_portfolio.py --output portfolio.pdf
"""

import json
import sys
import argparse
import re
from pathlib import Path
from typing import List, Dict, Optional

from portfolio.metadata import get_project_meta
from portfolio.latex_builder import populate_template, build_legacy_document
from portfolio.compiler import compile_to_pdf, write_latex_only
from portfolio.utils import strip_markdown
from portfolio.images import svg_to_pdf


# ---------------------------------------------------------------------------
# Workflow helpers
# ---------------------------------------------------------------------------

def _load_json(path: str) -> dict:
    with open(path) as fh:
        return json.load(fh)


def _slugify(text: str) -> str:
    """Convert a string to a lowercase, hyphen-separated filename-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def _derive_output_filename(data: dict) -> str:
    """Derive the output PDF filename from data.json artist fields.
    All components are slugified (lowercase, hyphens).
    """
    from datetime import datetime
    artist         = data.get('artist', {})
    name            = _slugify(artist.get('name', 'artist'))
    for_name        = _slugify(artist.get('for', ''))
    year            = str(datetime.now().year)
    parts = [p for p in [name, for_name, year] if p]
    return '-'.join(parts) + '.pdf'


def _generate_label_pdf(gallery_name: str, base_path: Path,
                        for_name: str = None) -> Optional[str]:
    """Generate a label SVG/PDF and return the PDF path relative to *base_path*.

    Uses portfolio/elements.py to create a full A4-landscape SVG with the label
    near the lower-right corner, then converts it to PDF via rsvg-convert /
    inkscape.  Returns a workspace-relative path string on success, or None.
    """
    from portfolio.elements import generate_label_svg

    svg_path = base_path / 'portfolio' / 'label_output.svg'
    generate_label_svg(gallery_name, str(svg_path), for_name=for_name)

    pdf_path = svg_to_pdf(svg_path)
    if pdf_path is None:
        print("Warning: could not convert label SVG to PDF — label page skipped.")
        return None

    return str(pdf_path.relative_to(base_path))


def generate_from_template(
    template_file: str,
    data_file: str,
    output_pdf: str = '',
    *,
    base_path: Path = Path('.'),
    latex_only: bool = False,
    keep_temp: bool = False,
) -> bool:
    """Generate a portfolio PDF from a LaTeX template and a JSON data file."""
    data = _load_json(data_file)
    projects_list = data.get('projects', [])

    # Derive output filename from data.json if not explicitly provided
    if not output_pdf:
        output_pdf = _derive_output_filename(data)
    print(f"Output: {output_pdf}")

    # ------------------------------------------------------------------
    # Label page (first page) — generated from gallery_name in data.json
    # ------------------------------------------------------------------
    artist       = data.get('artist', {})
    gallery_name = data.get('gallery_name', '')
    label_page_latex = ''
    print("Generating label page...")
    label_pdf = _generate_label_pdf(
        gallery_name, base_path,
        for_name=artist.get('for', None),
    )
    if label_pdf:
        label_page_latex = (
            "\\thispagestyle{empty}\n"
            "\\begin{tikzpicture}[overlay, remember picture]\n"
            "  \\node[anchor=center] at (current page.center) {%\n"
            f"    \\includegraphics[width=\\paperwidth,height=\\paperheight]{{{label_pdf}}}%\n"
            "  };\n"
            "\\end{tikzpicture}\n"
            "\\clearpage"
        )

    print(f"Loading metadata for {len(projects_list)} projects...")
    projects = []
    for p in projects_list:
        print(f"  - {p}")
        projects.append(get_project_meta(p, base_path))

    print("Populating LaTeX template...")
    template_text = Path(template_file).read_text()
    latex_content = populate_template(template_text, data, projects, base_path)
    latex_content = latex_content.replace('%%LABEL_PAGE%%', label_page_latex)

    if latex_only:
        output_tex = output_pdf.replace('.pdf', '.tex') if output_pdf.endswith('.pdf') else output_pdf + '.tex'
        return write_latex_only(latex_content, output_tex)

    return compile_to_pdf(latex_content, output_pdf, base_path, keep_temp=keep_temp)


def generate(
    projects_list: List[str],
    output_pdf: str,
    bio_file: str = "README.md",
    *,
    base_path: Path = Path('.'),
    latex_only: bool = False,
    keep_temp: bool = False,
) -> bool:
    """Generate a portfolio PDF using the legacy inline-LaTeX workflow."""
    bio_path = base_path / bio_file
    if not bio_path.exists():
        print(f"Error: biography file not found: {bio_file}")
        return False

    bio = strip_markdown(bio_path.read_text())

    print(f"Loading metadata for {len(projects_list)} projects...")
    projects = []
    for p in projects_list:
        print(f"  - {p}")
        projects.append(get_project_meta(p, base_path))

    print("Generating LaTeX document...")
    latex_content = build_legacy_document(bio, projects, base_path)

    if latex_only:
        output_tex = output_pdf.replace('.pdf', '.tex') if output_pdf.endswith('.pdf') else output_pdf + '.tex'
        return write_latex_only(latex_content, output_tex)

    return compile_to_pdf(latex_content, output_pdf, base_path, keep_temp=keep_temp)


def main():
    parser = argparse.ArgumentParser(
        description='Generate artist portfolio PDF from project list',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Template + JSON workflow (recommended)
  python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json -o portfolio.pdf

  # Generate .tex only (no PDF compilation)
  python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json \\
                               -o portfolio.pdf --latex-only

  # Legacy: generate with default project list
  python generate_portfolio.py --output portfolio.pdf
        """
    )

    parser.add_argument('--template', '-t', type=str,
                        help='Path to LaTeX template file (use with --data)')
    parser.add_argument('--data', '-d', type=str,
                        help='Path to JSON data file (use with --template)')
    parser.add_argument('--projects', '-p', type=str,
                        help='Path to text file with project list (one per line: year/folder)')
    parser.add_argument('--output', '-o', type=str, default='',
                        help='Output PDF filename (derived from data.json when omitted)')
    parser.add_argument('--bio', '-b', type=str, default='README.md',
                        help='Path to biography markdown file (default: README.md)')
    parser.add_argument('--keep-temp', action='store_true',
                        help='Keep temporary LaTeX files for debugging')
    parser.add_argument('--latex-only', action='store_true',
                        help='Generate LaTeX file only, don\'t compile to PDF')

    args = parser.parse_args()

    # Template + JSON workflow
    if args.template or args.data:
        if not args.template or not args.data:
            print("Error: --template and --data must be used together")
            sys.exit(1)
        success = generate_from_template(
            args.template, args.data, args.output,
            latex_only=args.latex_only, keep_temp=args.keep_temp,
        )
    else:
        # Legacy workflow: inline LaTeX generation
        if args.projects:
            with open(args.projects) as f:
                projects_list = [
                    line.strip() for line in f
                    if line.strip() and not line.startswith('#')
                ]
        else:
            projects_list = [
                '2026/astros',
                '2026/santos',
                '2025/hybrids',
                '2022/time',
                '2021/memory',
                '2021/fen',
            ]
        success = generate(
            projects_list, args.output or 'portfolio.pdf', args.bio,
            latex_only=args.latex_only, keep_temp=args.keep_temp,
        )

    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()

