#!/usr/bin/env python3
"""
generate_portfolio.py
---------------------
CLI entry-point for the portfolio PDF generator.

Delegates all heavy lifting to the ``portfolio`` package.

Usage
-----
Template + JSON (recommended):
    python generate_portfolio.py -t portfolio/template.tex \\
                                 -d portfolio/data.json \\
                                 -o portfolio.pdf

Generate .tex only (skip xelatex):
    python generate_portfolio.py -t portfolio/template.tex \\
                                 -d portfolio/data.json \\
                                 -o portfolio.pdf --latex-only

Keep temp files for debugging:
    python generate_portfolio.py -t portfolio/template.tex \\
                                 -d portfolio/data.json \\
                                 -o portfolio.pdf --keep-temp
"""

import argparse
import json
import sys
from pathlib import Path

from portfolio.metadata import get_project_meta
from portfolio.latex_builder import populate_template
from portfolio.compiler import compile_to_pdf, write_latex_only


# ---------------------------------------------------------------------------
# Project loader
# ---------------------------------------------------------------------------

def load_projects(data: dict, base_path: Path) -> list:
    """Read metadata for every project listed in *data['projects']*.

    Each entry in the list may be either:
      - a plain string  "2025/hybrids"
      - a dict          {"path": "2025/hybrids", "images_per_page": 2}

    Args:
        data:      Parsed portfolio_data.json content.
        base_path: Workspace root passed to get_project_meta().

    Returns:
        List of project dicts ready for populate_template().
    """
    projects = []
    for entry in data.get('projects', []):
        if isinstance(entry, dict):
            path            = entry['path']
            images_per_page = entry.get('images_per_page', 3)
        else:
            path            = entry
            images_per_page = 3

        print(f"  - {path}")
        meta = get_project_meta(path, base_path)
        meta['images_per_page'] = images_per_page
        projects.append(meta)

    return projects


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        prog='generate_portfolio.py',
        description='Generate an artist portfolio PDF from a LaTeX template and JSON data.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_portfolio.py -t portfolio/template.tex \\
                               -d portfolio/data.json    \\
                               -o portfolio.pdf

  python generate_portfolio.py -t portfolio/template.tex \\
                               -d portfolio/data.json    \\
                               -o portfolio.pdf --latex-only

  python generate_portfolio.py -t portfolio/template.tex \\
                               -d portfolio/data.json    \\
                               -o portfolio.pdf --keep-temp
        """,
    )
    parser.add_argument('--template', '-t', required=True,
                        help='Path to the LaTeX template file')
    parser.add_argument('--data', '-d', required=True,
                        help='Path to the JSON data file')
    parser.add_argument('--output', '-o', required=True,
                        help='Output PDF path (or .tex when --latex-only)')
    parser.add_argument('--keep-temp', action='store_true',
                        help='Keep temp_portfolio/ directory after a successful build')
    parser.add_argument('--latex-only', action='store_true',
                        help='Write the .tex file only; skip xelatex compilation')
    args = parser.parse_args()

    base_path = Path(".")

    # Load JSON data file
    data = json.loads(Path(args.data).read_text())

    # Load project metadata from filesystem
    print(f"Loading metadata for {len(data.get('projects', []))} projects...")
    projects = load_projects(data, base_path)

    # Build the complete LaTeX document
    print("Populating LaTeX template...")
    template_text = Path(args.template).read_text()
    latex_content = populate_template(template_text, data, projects, base_path)

    # Write .tex only, or compile to PDF
    if args.latex_only:
        out_tex = (
            args.output.replace('.pdf', '.tex')
            if args.output.endswith('.pdf')
            else args.output + '.tex'
        )
        success = write_latex_only(latex_content, out_tex)
    else:
        success = compile_to_pdf(
            latex_content, args.output, base_path, keep_temp=args.keep_temp
        )

    sys.exit(0 if success else 1)



if __name__ == "__main__":
    main()
