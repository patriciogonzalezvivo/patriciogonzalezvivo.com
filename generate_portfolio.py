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
import struct
import subprocess
import shutil
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple

from portfolio.metadata import get_project_meta
from portfolio.latex_builder import populate_template, build_legacy_document
from portfolio.compiler import compile_to_pdf
from portfolio.utils import strip_markdown
from portfolio.images import svg_to_pdf


# ---------------------------------------------------------------------------
# Workflow helpers
# ---------------------------------------------------------------------------

def _load_json(path: str) -> dict:
    with open(path) as fh:
        return json.load(fh)


def _generate_label_pdf(gallery_name: str, base_path: Path) -> Optional[str]:
    """Generate a label SVG/PDF and return the PDF path relative to *base_path*.

    Uses portfolio/label.py to create a full A4-landscape SVG with the label
    near the lower-right corner, then converts it to PDF via rsvg-convert /
    inkscape.  Returns a workspace-relative path string on success, or None.
    """
    from portfolio.label import generate_label_svg

    svg_path = base_path / 'portfolio' / 'label_output.svg'
    generate_label_svg(gallery_name, str(svg_path))

    pdf_path = svg_to_pdf(svg_path)
    if pdf_path is None:
        print("Warning: could not convert label SVG to PDF — label page skipped.")
        return None

    return str(pdf_path.relative_to(base_path))


def generate_from_template(
    template_file: str,
    data_file: str,
    output_pdf: str,
    *,
    base_path: Path = Path('.'),
    latex_only: bool = False,
    keep_temp: bool = False,
) -> bool:
    """Generate a portfolio PDF from a LaTeX template and a JSON data file."""
    data = _load_json(data_file)
    projects_list = data.get('projects', [])

    # ------------------------------------------------------------------
    # Label page (first page) — generated from gallery_name in data.json
    # ------------------------------------------------------------------
    gallery_name = data.get('gallery_name', '')
    label_page_latex = ''
    if gallery_name:
        print(f"Generating label page for gallery: {gallery_name}")
        label_pdf = _generate_label_pdf(gallery_name, base_path)
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
        output_tex = (
            output_pdf.replace('.pdf', '.tex')
            if output_pdf.endswith('.pdf')
            else output_pdf + '.tex'
        )
        Path(output_tex).write_text(latex_content)
        print(f"✓ LaTeX file generated: {output_tex}")
        print("  Run `xelatex -shell-escape <file>.tex` to compile to PDF.")
        return True

    return compile_to_pdf(latex_content, output_pdf, base_path, keep_temp=keep_temp)


def generate_pptx(
    data_file: str,
    output_pptx: str,
    *,
    base_path: Path = Path('.'),
) -> bool:
    """Generate an editable PPTX slideshow via pandoc.

    Writes a pandoc-slide Markdown file next to *output_pptx*, then calls
    pandoc to convert it to ``.pptx``.  The Markdown file is kept so it can
    be inspected or further customised before re-running pandoc manually.
    """
    import shutil
    import subprocess
    from portfolio.pptx_builder import build_pptx_markdown

    if not shutil.which('pandoc'):
        print("Error: pandoc not found.  Install it with:  sudo apt install pandoc")
        return False

    data = _load_json(data_file)
    projects_list = data.get('projects', [])

    print(f"Loading metadata for {len(projects_list)} projects...")
    projects = []
    for p in projects_list:
        print(f"  - {p}")
        projects.append(get_project_meta(p, base_path))

    print("Building slide Markdown...")
    md_content = build_pptx_markdown(data, projects, base_path)

    md_path = Path(output_pptx).with_suffix('.md')
    md_path.write_text(md_content)
    print(f"  Slide Markdown written to: {md_path}")

    print("Converting to PPTX with pandoc...")
    result = subprocess.run(
        [
            'pandoc', str(md_path),
            '--to=pptx',
            '--slide-level=2',
            f'--resource-path={base_path}',
            '-o', output_pptx,
        ],
        cwd=base_path,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print("Error: pandoc failed:")
        print(result.stderr[-2000:])
        return False

    print(f"✓ PPTX slideshow generated: {output_pptx}")
    print(f"  Markdown source kept at:  {md_path}  (edit & re-run pandoc to customise)")
    return True


def generate_slides(
    template_file: str,
    data_file: str,
    output_pdf: str,
    *,
    base_path: Path = Path('.'),
    latex_only: bool = False,
    keep_temp: bool = False,
) -> bool:
    """Generate a Beamer slideshow PDF from a template and a JSON data file."""
    from portfolio.slides_builder import populate_slides_template

    data = _load_json(data_file)
    projects_list = data.get('projects', [])

    print(f"Loading metadata for {len(projects_list)} projects...")
    projects = []
    for p in projects_list:
        print(f"  - {p}")
        projects.append(get_project_meta(p, base_path))

    print("Building Beamer slides...")
    template_text = Path(template_file).read_text()
    latex_content = populate_slides_template(template_text, data, projects, base_path)

    if latex_only:
        output_tex = (
            output_pdf.replace('.pdf', '.tex')
            if output_pdf.endswith('.pdf')
            else output_pdf + '.tex'
        )
        Path(output_tex).write_text(latex_content)
        print(f"✓ Beamer LaTeX file generated: {output_tex}")
        print("  Run `xelatex -shell-escape <file>.tex` to compile to PDF.")
        return True

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
        output_tex = (
            output_pdf.replace('.pdf', '.tex')
            if output_pdf.endswith('.pdf')
            else output_pdf + '.tex'
        )
        Path(output_tex).write_text(latex_content)
        print(f"✓ LaTeX file generated: {output_tex}")
        print("  Run `xelatex -shell-escape <file>.tex` to compile to PDF.")
        return True

    return compile_to_pdf(latex_content, output_pdf, base_path, keep_temp=keep_temp)


# ---------------------------------------------------------------------------
# Kept for backwards-compatibility with any code that instantiates this class
# ---------------------------------------------------------------------------

class PortfolioGenerator:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.temp_dir = self.base_path / "temp_portfolio"
        
    def read_metadata_file(self, filepath: Path) -> Optional[str]:
        """Read a metadata file and return its content (trimmed)"""
        if filepath.exists():
            return filepath.read_text().strip()
        return None
    
    def get_project_meta(self, project_path: str) -> Dict:
        """Get project metadata from a project path (e.g., '2023/blink')"""
        full_path = self.base_path / project_path
        
        # Extract year and folder from path
        parts = project_path.strip('/').split('/')
        year = parts[0] if len(parts) > 0 else ''
        folder = parts[1] if len(parts) > 1 else ''
        
        # Read metadata files
        title = self.read_metadata_file(full_path / 'TITLE.txt')
        medium = self.read_metadata_file(full_path / 'MEDIUM.txt')
        description = self.read_metadata_file(full_path / 'DESCRIPTION.txt')
        dimensions = self.read_metadata_file(full_path / 'DIMENSIONS.txt')
        
        # Read about.md or README.md for longer description
        about = self.read_metadata_file(full_path / 'about.md')
        readme_raw = None
        if not about:
            readme = self.read_metadata_file(full_path / 'README.md')
            if readme:
                readme_raw = readme
                # Extract text content (skip iframe/html tags)
                about = self.extract_text_from_markdown(readme)
        
        # Auto-detect thumbnail
        thumb = None
        for img in ['thumb.gif', 'thumb.jpg', 'thumb.png']:
            if (full_path / img).exists():
                thumb = img
                break
        
        # Find images in project directory
        images = self.find_project_images(full_path)

        # Find SVG files
        svgs = self.find_project_svgs(full_path)
        
        return {
            'path': project_path,
            'year': year,
            'folder': folder,
            'title': title or folder.replace('_', ' ').title(),
            'medium': medium,
            'description': description,
            'dimensions': dimensions,
            'about': about,
            'readme_raw': readme_raw,
            'thumb': thumb,
            'images': images,
            'svgs': svgs,
        }
    
    def extract_text_from_markdown(self, markdown: str) -> str:
        """Extract plain text from markdown, removing HTML tags"""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', markdown)
        # Remove image syntax
        text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
        # Remove link syntax but keep text
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        # Remove headers but keep text
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        # Clean up multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
    
    def readme_to_latex(self, markdown: str, project_path: str) -> str:
        """Convert README.md to LaTeX, embedding SVG image refs inline as centered figures."""
        proj_full = self.base_path / project_path
        # Split on markdown SVG image syntax: ![alt](svg/path.svg)
        svg_pattern = re.compile(r'!\[([^\]]*)\]\((svg/[^\)]+\.svg)\)')
        parts = svg_pattern.split(markdown)
        # parts = [text, alt, svg_path, text, alt, svg_path, ..., text]
        result = []
        for i, part in enumerate(parts):
            mod = i % 3
            if mod == 0:
                # Text chunk — run through normal pipeline
                chunk = self.extract_text_from_markdown(part)
                result.append(self.markdown_to_latex(chunk))
            elif mod == 1:
                pass  # alt text — skip
            else:
                # svg relative path like "svg/000_light.svg"
                abs_path = str((proj_full / part).resolve())
                # result.append(
                #     f"\n\n\\begin{{center}}\n"
                #     f"  \\includesvg[scale=0.5]{{{abs_path}}}\n"
                #     f"\\end{{center}}\n\n"
                # )
        return ''.join(result)

    def find_project_images(self, project_path: Path) -> List[str]:
        """Find all images in the project's images/ subdirectory (no thumb, no gif).

        Falls back to thumbnail.jpg/jpeg/png in the project root when images/ is
        absent or empty — this covers wasm projects that only ship a thumbnail."""
        images_dir = project_path / 'images'
        images = []
        if images_dir.exists():
            for img in sorted(images_dir.iterdir()):
                if img.suffix.lower() in ('.jpg', '.jpeg', '.png') and 'thumb' not in img.name.lower():
                    images.append(str(img.relative_to(self.base_path)))

        # Fallback: use root thumbnail when no images found in images/
        if not images:
            for tf in ['thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.png']:
                tf_path = project_path / tf
                if tf_path.exists():
                    images.append(str(tf_path.relative_to(self.base_path)))
                    break

        return images

    def find_project_svgs(self, project_path: Path) -> List[str]:
        """Find all SVG files in the project's svg/ subdirectory."""
        svg_dir = project_path / 'svg'
        if not svg_dir.exists():
            return []
        svgs = []
        for svg in sorted(svg_dir.iterdir()):
            if svg.suffix.lower() == '.svg':
                svgs.append(str(svg.absolute()))
        return svgs

    def get_image_dimensions(self, img_path: str) -> Tuple[int, int]:
        """Return (width, height) for a JPEG or PNG image, or (0, 0) on failure."""
        full_path = self.base_path / img_path
        try:
            with open(full_path, 'rb') as f:
                header = f.read(26)
            # PNG: 8-byte signature + IHDR (4 len + 4 type + 4 w + 4 h)
            if header[:8] == b'\x89PNG\r\n\x1a\n':
                w = struct.unpack('>I', header[16:20])[0]
                h = struct.unpack('>I', header[20:24])[0]
                return (w, h)
            # JPEG: scan for SOF marker
            with open(full_path, 'rb') as f:
                data = f.read()
            i = 0
            while i < len(data) - 1:
                if data[i] != 0xFF:
                    i += 1
                    continue
                marker = data[i + 1]
                if marker in (0xC0, 0xC1, 0xC2, 0xC3):
                    h = struct.unpack('>H', data[i + 5:i + 7])[0]
                    w = struct.unpack('>H', data[i + 7:i + 9])[0]
                    return (w, h)
                if marker in (0xD8, 0xD9, 0x01) or (0xD0 <= marker <= 0xD7):
                    i += 2
                else:
                    if i + 4 > len(data):
                        break
                    length = struct.unpack('>H', data[i + 2:i + 4])[0]
                    i += 2 + length
        except Exception:
            pass
        return (0, 0)

    def parse_image_sidecar_meta(self, img_path: str) -> dict:
        """Parse structured key:value sidecar .txt for an image."""
        txt_file = (self.base_path / img_path).with_suffix('.txt')
        result = {}
        if txt_file.exists():
            for line in txt_file.read_text().strip().splitlines():
                if ':' in line:
                    key, _, value = line.partition(':')
                    key = key.strip().lower()
                    value = value.strip()
                    if key in ('title', 'year', 'medium', 'dimension', 'dimensions'):
                        result[key] = value
        return result

    def _build_render_plan(self, images: List[str]) -> List[tuple]:
        """Classify images into portrait groups of 3 per page and individuals.

        Collects the full consecutive run of portrait images sharing the same
        medium + dimensions, then divides into groups of 3.  A remainder of 1
        or 2 images (which cannot fill a group) falls back to individual pages
        with the old alternating left/right layout.

        Returns a list of:
          ('group', [(img_path, meta_dict), ...])  – exactly 3 portrait images
          ('individual', img_path)                 – everything else
        """
        plan = []
        i = 0
        while i < len(images):
            img = images[i]
            w, h = self.get_image_dimensions(img)
            if h > w > 0:
                meta = self.parse_image_sidecar_meta(img)
                medium = meta.get('medium', '')
                dims   = meta.get('dimensions') or meta.get('dimension', '')
                if medium or dims:
                    # Collect the full consecutive run with same medium+dims
                    run: List[Tuple[str, dict]] = [(img, meta)]
                    j = i + 1
                    while j < len(images):
                        img2 = images[j]
                        w2, h2 = self.get_image_dimensions(img2)
                        if h2 > w2 > 0:
                            meta2 = self.parse_image_sidecar_meta(img2)
                            med2  = meta2.get('medium', '')
                            dims2 = meta2.get('dimensions') or meta2.get('dimension', '')
                            if med2 == medium and dims2 == dims:
                                run.append((img2, meta2))
                                j += 1
                            else:
                                break
                        else:
                            break
                    if len(run) >= 3:
                        # Full groups of 3; remainder of 1 or 2 → individual
                        n_groups = len(run) // 3
                        for g in range(n_groups):
                            plan.append(('group', run[g * 3:(g + 1) * 3]))
                        for img_path, _ in run[n_groups * 3:]:
                            plan.append(('individual', img_path))
                        i = j
                        continue
            plan.append(('individual', img))
            i += 1
        return plan

    def get_image_caption(self, img_path: str, align_right: bool = False) -> str:
        """Return a formatted LaTeX caption from a same-name .txt sidecar file.

        The sidecar file may use structured ``key:value`` lines.  Recognised
        keys (case-insensitive): title, year, medium, dimension/dimensions,
        description.

        Structured layout:
            Line 1 – title, year  (comma-separated, whichever are present)
            Line 2 – medium
            Line 3 – dimension / description

        Alignment:
            align_right=True  (caption on the left)  → \\raggedleft
            align_right=False (caption on the right) → \\raggedright

        Falls back to plain line-by-line rendering for unstructured files.
        """
        txt_file = (self.base_path / img_path).with_suffix('.txt')
        if not txt_file.exists():
            return ""

        raw = txt_file.read_text().strip()

        # Try to parse as key:value pairs
        parsed = {}
        for line in raw.splitlines():
            if ':' in line:
                key, _, value = line.partition(':')
                key = key.strip().lower()
                value = value.strip()
                if key in ('title', 'year', 'medium', 'dimension', 'dimensions', 'description'):
                    parsed[key] = value

        if not parsed:
            # Fallback: plain multi-line text
            escaped_lines = [self.escape_latex(ln) for ln in raw.splitlines()]
            return "{\\setstretch{1.0}" + "\\\\\n".join(escaped_lines) + "}"

        align_cmd = "\\raggedleft" if align_right else "\\raggedright"

        caption_lines = []

        # Line 1: title, year
        line1_parts = []
        if parsed.get('title'):
            line1_parts.append(self.escape_latex(parsed['title']))
        if parsed.get('year'):
            line1_parts.append(self.escape_latex(parsed['year']))
        if line1_parts:
            caption_lines.append(', '.join(line1_parts))

        # Line 2: medium
        if parsed.get('medium'):
            caption_lines.append(self.escape_latex(parsed['medium']))

        # Line 3: dimension(s) or description
        dim = parsed.get('dimension') or parsed.get('dimensions')
        if dim:
            caption_lines.append(self.escape_latex(dim))
        elif parsed.get('description'):
            caption_lines.append(self.escape_latex(parsed['description']))

        if not caption_lines:
            return ""

        return "{\\setstretch{1.0}" + align_cmd + "\n" + "\\\\\n".join(caption_lines) + "}"
    
    def escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters"""
        if not text:
            return ""

        # Use a single-pass regex substitution so that no character is
        # processed twice (e.g. the backslashes introduced by '\&' must not
        # themselves get escaped in a later pass).
        escape_map = {
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
        pattern = re.compile('|'.join(re.escape(k) for k in escape_map))
        return pattern.sub(lambda m: escape_map[m.group(0)], text)
    
    def markdown_to_latex(self, text: str) -> str:
        """Convert simple markdown to LaTeX"""
        if not text:
            return ""
        
        # First escape LaTeX special characters
        text = self.escape_latex(text)
        
        # Convert markdown bold/italic (after escaping)
        text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
        text = re.sub(r'\*(.+?)\*', r'\\textit{\1}', text)
        text = re.sub(r'_(.+?)_', r'\\textit{\1}', text)
        
        # Convert blockquotes
        text = re.sub(r'^>\s+(.+)$', r'\\begin{quote}\1\\end{quote}', text, flags=re.MULTILINE)

        # Convert list items
        text = re.sub(r'^\s*[\*\-]\s+(.+)$', r'\\item \1', text, flags=re.MULTILINE)

        # Ensure every single newline becomes a blank line (paragraph break in LaTeX)
        # First normalise: collapse 2+ newlines to a sentinel, convert remaining single
        # newlines to double, then restore the sentinel.
        text = re.sub(r'\n{2,}', '\x00', text)   # protect existing paragraph breaks
        text = text.replace('\n', '\n\n')          # single newline → paragraph break
        text = text.replace('\x00', '\n\n')        # restore paragraph breaks

        return text
    
    def generate_latex(self, bio: str, projects: List[Dict]) -> str:
        """Generate LaTeX document from bio and projects"""
        
        latex = r"""\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{graphicx}
\usepackage{float}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{hyperref}
\usepackage{parskip}
\usepackage[inkscapelatex=false]{svg}
\usepackage{fontspec}

% Montserrat from local folder
\setmainfont{Montserrat}[
    Path           = montserrat/,
    UprightFont    = *-Light,
    BoldFont       = *-SemiBold,
    ItalicFont     = *-LightItalic,
    BoldItalicFont = *-SemiBoldItalic,
    Extension      = .ttf
]

% Set up page style
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{Patricio Gonzalez Vivo}
\fancyhead[R]{Portfolio}
\renewcommand{\headrulewidth}{0.4pt}

% Customize section titles
\titleformat{\section}
  {\Large\bfseries}
  {}
  {0em}
  {}
  [\titlerule]

\titleformat{\subsection}
  {\large\bfseries}
  {}
  {0em}
  {}

% Hyperlink styling
\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue,
}

% No paragraph indentation
\setlength{\parindent}{0pt}

\begin{document}

% Title page
\begin{titlepage}
    \centering
    \vspace*{3cm}
    
    % Logo
    \includegraphics[width=0.15\textwidth]{images/logo-gray.png}
    
    % Name
    {\Huge\bfseries Patricio Gonzalez Vivo}
    % Portfolio label
    {\Large Portfolio}

    \vfill
    
    {\small \url{https://patriciogonzalezvivo.com}}
    
    \vspace{1cm}
    
\end{titlepage}

% Biography section
\section*{Biography}
"""
        
        # Add biography
        latex += self.markdown_to_latex(bio)
        
        for project in projects:
            latex += self.generate_project_section(project)
        
        latex += r"\end{document}"
        
        return latex
    
    def generate_artwork_pages(self, project: Dict) -> str:
        """Generate LaTeX pages for a single artwork.

        Layout rules:
        - Page 1: title (left) + year (right) heading, rule, then
                  description text (left column) | first image (right column).
        - Additional images (images[1:]): one image per page, alternating
          left/right starting from the left.
        - If a same-name .txt sidecar exists for an image, display that text
          on the opposite side, bottom-aligned.
        """
        title = self.escape_latex(project['title'])
        year  = self.escape_latex(project['year'])

        # Description: prefer README.md raw content (SVGs inline), then plain about, then DESCRIPTION.txt
        if project.get('readme_raw'):
            desc = self.readme_to_latex(project['readme_raw'], project['path'])
        elif project['about']:
            desc = self.markdown_to_latex(project['about'])
        elif project['description']:
            desc = self.markdown_to_latex(project['description'])
        else:
            desc = ""

        images = [img for img in project['images']
                  if not img.endswith('.gif') and (self.base_path / img).exists()]
        svgs   = project.get('svgs', [])

        latex = ""

        # ── Page 1 ──────────────────────────────────────────────────────────
        latex += "\\clearpage\n"
        # Title bar: bold title flush-left, year flush-right
        latex += f"\\noindent{{\\Large\\textbf{{{title}}}}}\\hfill{{\\large {year}}}\n\n"
        latex += "\\vspace{0.3em}\\hrule\\vspace{1em}\n\n"

        # Heuristic: if description is long (> ~800 chars), there is no room
        # for an image on page 1 — treat all images as additional images instead.
        DESC_CHAR_LIMIT = 800
        desc_fits_with_image = len(desc) <= DESC_CHAR_LIMIT

        if images and desc_fits_with_image:
            first_img = images[0]
            caption   = self.get_image_caption(first_img)

            # Left column: full description, top-aligned
            # Right column: first image pinned to bottom-right
            col_h = "0.82\\textheight"
            latex += "\\noindent"
            latex += f"\\begin{{minipage}}[t][{col_h}][t]{{0.52\\textwidth}}\n"
            latex += "\\raggedright\n"
            if desc:
                latex += desc + "\n"
            latex += "\\end{minipage}\n"
            latex += "\\hfill\n"
            latex += f"\\begin{{minipage}}[t][{col_h}][b]{{0.44\\textwidth}}\n"

            latex += f"\\includegraphics[width=\\linewidth,height=0.85\\textheight,keepaspectratio]{{{first_img}}}\n"
            # latex += f"\\includegraphics[width=\\linewidth,height=0.5\\textheight,keepaspectratio]{{{first_img}}}\n"
            # if caption:
            #     latex += f"  \\vspace{{0.3em}}\n\n  {caption}\n"
            latex += "\\end{minipage}\n\n"
            # First image already placed; remaining images start alternating from left
            additional_images = images[1:]
        else:
            # Description too long (or no images): fill page with text only
            if desc:
                latex += desc + "\n\n"
            # All images go into the alternating pages
            additional_images = images

        # ── Additional images: portrait-group pages + individual pages ──────
        render_plan = self._build_render_plan(additional_images)
        indiv_idx = 0   # counter for alternating left/right on individual images

        for entry in render_plan:
            kind = entry[0]

            if kind == 'group':
                group = entry[1]  # list of (img_path, meta_dict)
                n = len(group)
                # Image width fraction: share textwidth evenly across n images
                img_frac = {2: '0.47', 3: '0.31', 4: '0.235'}.get(n, '0.235')
                img_h    = '0.78\\textheight'

                latex += "\\clearpage\n"
                latex += "\\noindent\n"
                for k, (img_path, _meta) in enumerate(group):
                    latex += (
                        f"\\begin{{minipage}}[b]{{{img_frac}\\textwidth}}\n"
                        f"  \\includegraphics[width=\\linewidth,height={img_h},keepaspectratio]{{{img_path}}}\n"
                        f"\\end{{minipage}}"
                    )
                    if k < n - 1:
                        latex += "\\hfill\n"
                    else:
                        latex += "\n"

                # Caption: titles+years on one line, then medium, then dimensions
                title_parts = []
                for _img, m in group:
                    t = self.escape_latex(m.get('title', ''))
                    y = self.escape_latex(m.get('year', ''))
                    if t and y:
                        title_parts.append(f"\\textit{{{t}}} ({y})")
                    elif t:
                        title_parts.append(f"\\textit{{{t}}}")

                first_meta = group[0][1]
                common_medium = self.escape_latex(first_meta.get('medium', ''))
                common_dims   = self.escape_latex(
                    first_meta.get('dimensions') or first_meta.get('dimension', '')
                )

                latex += "\n\\vspace{0.6em}\n\\noindent\n"
                latex += "{\\setstretch{1.0}\\raggedright\n"
                if title_parts:
                    latex += ", ".join(title_parts) + "\\\\\n"
                if common_medium:
                    latex += common_medium + "\\\\\n"
                if common_dims:
                    latex += common_dims + "\n"
                latex += "}\n"

            else:  # 'individual'
                img_path = entry[1]
                latex += "\\clearpage\n"
                image_on_right = (indiv_idx % 2 == 1)
                indiv_idx += 1
                # caption left  → align_right=True ; caption right → align_right=False
                caption = self.get_image_caption(img_path, align_right=image_on_right)
                h = "0.85\\textheight"
                img_line = (f"\\includegraphics[width=\\linewidth,"
                            f"height={h},keepaspectratio]{{{img_path}}}\n")

                if caption:
                    if image_on_right:
                        latex += (
                            "\\noindent\n"
                            f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                            f"  {caption}\n"
                            "\\end{minipage}\n"
                            "\\hfill\n"
                            f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                            f"  {img_line}"
                            "\\end{minipage}\n\n"
                        )
                    else:
                        latex += (
                            "\\noindent\n"
                            f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                            f"  \\hfill{img_line}"
                            "\\end{minipage}\n"
                            "\\hfill\n"
                            f"\\begin{{minipage}}[t][{h}][b]{{0.48\\textwidth}}\n"
                            f"  {caption}\n"
                            "\\end{minipage}\n\n"
                        )
                else:
                    latex += (
                        "\\noindent\n"
                        f"\\begin{{minipage}}[t][{h}][c]{{\\textwidth}}\n"
                        "  \\centering\n"
                        f"  \\includegraphics[width=\\linewidth,height={h},keepaspectratio]{{{img_path}}}\n"
                        "\\end{minipage}\n\n"
                    )

        return latex

    def generate_project_section(self, project: Dict) -> str:
        """Generate LaTeX for a single project (legacy workflow)."""
        return self.generate_artwork_pages(project)
    
    def generate_image_grid(self, images: List[str], per_row: int = 2) -> str:
        """Generate a grid of images"""
        latex = "\\begin{figure}[H]\n"
        latex += "    \\centering\n"
        
        for i, img_path in enumerate(images):
            if not (self.base_path / img_path).exists():
                continue
            
            width = 0.45 if per_row == 2 else 0.3
            
            latex += f"    \\includegraphics[width={width}\\textwidth]{{{img_path}}}\n"
            
            # Add spacing
            if (i + 1) % per_row != 0 and i < len(images) - 1:
                latex += "    \\hfill\n"
            elif i < len(images) - 1:
                latex += "    \\vspace{0.5cm}\n\n"
        
        latex += "\\end{figure}\n\n"
        
        return latex
    
    def compile_latex(self, latex_content: str, output_pdf: str) -> bool:
        """Compile LaTeX to PDF"""
        # Create temp directory
        self.temp_dir.mkdir(exist_ok=True)
        
        # Write LaTeX file
        tex_file = self.temp_dir / "portfolio.tex"
        tex_file.write_text(latex_content)
        
        print(f"Generated LaTeX file: {tex_file}")
        
        # Check if xelatex is available
        if not shutil.which('xelatex'):
            print("Error: xelatex not found. Please install a LaTeX distribution (e.g., texlive-xetex)")
            return False
        
        # Compile with xelatex (twice for proper references)
        print("Compiling PDF with XeLaTeX...")
        for i in range(2):
            result = subprocess.run(
                ['xelatex', '-shell-escape', '-interaction=nonstopmode', '-output-directory', str(self.temp_dir), str(tex_file)],
                cwd=self.base_path,  # Run from base path so image paths work
                capture_output=True,
                text=True
            )
            
            # Check if PDF was generated (xelatex may return non-zero even on success with warnings)
            pdf_file = self.temp_dir / "portfolio.pdf"
            if not pdf_file.exists() and result.returncode != 0:
                print(f"Error compiling LaTeX (pass {i+1}):")
                print(result.stdout[-2000:])  # Last 2000 chars
                return False
            elif i == 0 and pdf_file.exists():
                print(f"  Pass {i+1} completed (with warnings)")
            elif pdf_file.exists():
                print(f"  Pass {i+1} completed")
        
        # Move PDF to output location
        pdf_file = self.temp_dir / "portfolio.pdf"
        if pdf_file.exists():
            shutil.copy(pdf_file, output_pdf)
            print(f"✓ Portfolio PDF generated: {output_pdf}")
            return True
        else:
            print("Error: PDF file not generated")
            return False
    
    # ------------------------------------------------------------------
    # TEMPLATE-BASED WORKFLOW
    # ------------------------------------------------------------------

    def load_json_data(self, json_file: str) -> Dict:
        """Load portfolio data from a JSON file"""
        with open(json_file, 'r') as f:
            return json.load(f)

    def generate_artworks_latex(self, projects: List[Dict]) -> str:
        """Generate LaTeX artwork pages for every project."""
        latex = ""
        for project in projects:
            latex += self.generate_artwork_pages(project)
            latex += "\n"
        return latex

    def _optional_section(self, section_title: str, file_key: str, artist: Dict,
                          section_latex: Optional[str] = None) -> str:
        """Return a LaTeX section block from a markdown file, or '' if the file is absent."""
        filepath = artist.get(file_key)
        if not filepath:
            return ''
        full_path = self.base_path / filepath
        if not full_path.exists():
            print(f"  (skipping {file_key}: {filepath} not found)")
            return ''
        content = self.markdown_to_latex(
            self.extract_text_from_markdown(full_path.read_text())
        )
        if not content.strip():
            return ''
        print(f"  + {file_key}: {filepath}")
        # return f"\\clearpage\n\\section*{{{section_title}}}\n\n{content}\n"
        return f"\\clearpage\n\n{content}\n"

    def populate_template(self, template_file: str, data: Dict, projects: List[Dict]) -> str:
        """Populate a LaTeX template by replacing %%PLACEHOLDER%% markers"""
        template = Path(template_file).read_text()

        artist = data.get('artist', {})

        # Artist statement: only populated when artist_statement_file key is present
        optional_artist_statement = ''
        stmt_path_str = artist.get('artist_statement_file')
        if stmt_path_str:
            stmt_path = self.base_path / stmt_path_str
            if stmt_path.exists():
                statement = self.markdown_to_latex(
                    self.extract_text_from_markdown(stmt_path.read_text())
                )
                if statement.strip():
                    optional_artist_statement = (
                        "\\section*{Artist Statement}\n\n"
                        + statement
                        + "\n\n\\clearpage"
                    )

        # Bio (for places where a short bio is needed separately from statement)
        bio = ''
        bio_path_str = artist.get('bio_file')
        if bio_path_str:
            bio_path = self.base_path / bio_path_str
            if bio_path.exists():
                bio_text = self.markdown_to_latex(
                    self.extract_text_from_markdown(bio_path.read_text())
                )
                avatar_file = artist.get('avatar_file', '')
                if bio_text and avatar_file and (self.base_path / avatar_file).exists():
                    bio = (
                        "\\begin{wrapfigure}{r}{0.35\\textwidth}\n"
                        "  \\vspace{-10pt}\n"
                        f"  \\includegraphics[width=\\linewidth]{{{avatar_file}}}\n"
                        "  \\vspace{-20pt}\n"
                        "\\end{wrapfigure}\n\n"
                        + bio_text
                    )
                else:
                    bio = bio_text

        website = artist.get('website', '')
        website_url = artist.get('website_url', f'https://{website}' if website else '')

        print("Resolving optional file sections...")
        optional_cv          = self._optional_section('Curriculum Vitae',       'cv_file',           artist)
        optional_exhibitions = self._optional_section('Exhibitions \\& Residencies', 'exhibitions_file', artist)
        optional_talks       = self._optional_section('Talks',                  'talks_file',        artist)
        optional_press       = self._optional_section('Press',                  'press_file',        artist)

        replacements = {
            '%%ARTIST_NAME%%':       self.escape_latex(artist.get('name', '')),
            '%%PORTFOLIO_TITLE%%':   self.escape_latex(artist.get('portfolio_title', 'Artist Portfolio')),
            # Email and website are used raw inside \href — do not LaTeX-escape them
            '%%ARTIST_EMAIL%%':      artist.get('email', ''),
            '%%ARTIST_WEBSITE%%':    artist.get('website', ''),
            '%%ARTIST_WEBSITE_URL%%': website_url,
            '%%ARTIST_LOCATION%%':   self.escape_latex(artist.get('location', '')),
            '%%ARTIST_PHONE%%':      self.escape_latex(artist.get('phone', '')),
            '%%ARTIST_LOGO%%':       artist.get('logo', ''),
            '%%ARTIST_BIO%%':        bio,
            '%%OPTIONAL_ARTIST_STATEMENT%%': optional_artist_statement,
            '%%ARTWORKS%%':          self.generate_artworks_latex(projects),
            '%%OPTIONAL_CV%%':          optional_cv,
            '%%OPTIONAL_EXHIBITIONS%%': optional_exhibitions,
            '%%OPTIONAL_TALKS%%':       optional_talks,
            '%%OPTIONAL_PRESS%%':       optional_press,
        }

        for placeholder, value in replacements.items():
            template = template.replace(placeholder, value)

        return template

    def generate_from_template(self, template_file: str, data_file: str, output_pdf: str,
                               latex_only: bool = False, keep_temp: bool = False) -> bool:
        """Generate a portfolio PDF from a LaTeX template and a JSON data file"""
        data = self.load_json_data(data_file)
        projects_list = data.get('projects', [])

        print(f"Loading metadata for {len(projects_list)} projects...")
        projects = []
        for p in projects_list:
            print(f"  - {p}")
            projects.append(self.get_project_meta(p))

        print("Populating LaTeX template...")
        latex_content = self.populate_template(template_file, data, projects)

        if latex_only:
            output_tex = (
                output_pdf.replace('.pdf', '.tex')
                if output_pdf.endswith('.pdf')
                else output_pdf + '.tex'
            )
            Path(output_tex).write_text(latex_content)
            print(f"✓ LaTeX file generated: {output_tex}")
            print("  (Run xelatex manually to compile to PDF)")
            return True

        success = self.compile_latex(latex_content, output_pdf)
        if success and self.temp_dir.exists() and not keep_temp:
            shutil.rmtree(self.temp_dir)
        elif success and keep_temp:
            print(f"Temporary files kept in: {self.temp_dir}")
        return success

    # ------------------------------------------------------------------
    # LEGACY WORKFLOW (generate LaTeX inline without an external template)
    # ------------------------------------------------------------------

    def generate(self, projects_list: List[str], output_pdf: str, bio_file: str = "README.md", latex_only: bool = False, keep_temp: bool = False) -> bool:
        """Generate portfolio PDF"""
        
        # Read artist bio
        bio_path = self.base_path / bio_file
        if not bio_path.exists():
            print(f"Error: Biography file not found: {bio_file}")
            return False
        
        bio = self.extract_text_from_markdown(bio_path.read_text())
        
        # Load project metadata
        print(f"Loading metadata for {len(projects_list)} projects...")
        projects = []
        for project_path in projects_list:
            print(f"  - {project_path}")
            meta = self.get_project_meta(project_path)
            projects.append(meta)
        
        # Generate LaTeX
        print("Generating LaTeX document...")
        latex_content = self.generate_latex(bio, projects)
        
        # If latex-only mode, just write the .tex file
        if latex_only:
            output_tex = output_pdf.replace('.pdf', '.tex') if output_pdf.endswith('.pdf') else output_pdf + '.tex'
            Path(output_tex).write_text(latex_content)
            print(f"✓ LaTeX file generated: {output_tex}")
            print("  (Run xelatex manually to compile to PDF)")
            return True
        
        # Compile to PDF
        success = self.compile_latex(latex_content, output_pdf)
        
        # Cleanup
        if success and self.temp_dir.exists() and not keep_temp:
            print("Cleaning up temporary files...")
            shutil.rmtree(self.temp_dir)
        elif success and keep_temp:
            print(f"Temporary files kept in: {self.temp_dir}")
        
        return success


def main():
    parser = argparse.ArgumentParser(
        description='Generate artist portfolio PDF from project list',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Template + JSON workflow (recommended)
  python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json -o portfolio.pdf

  # Beamer slideshow
  python generate_portfolio.py -t portfolio/beamer_template.tex -d portfolio/data.json \\
                               -o portfolio_slides.pdf --slides

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
    parser.add_argument('--output', '-o', type=str, required=True,
                        help='Output PDF filename')
    parser.add_argument('--bio', '-b', type=str, default='README.md',
                        help='Path to biography markdown file (default: README.md)')
    parser.add_argument('--keep-temp', action='store_true',
                        help='Keep temporary LaTeX files for debugging')
    parser.add_argument('--latex-only', action='store_true',
                        help='Generate LaTeX file only, don\'t compile to PDF')
    parser.add_argument('--slides', action='store_true',
                        help='Generate a Beamer slideshow instead of a print portfolio')
    parser.add_argument('--pptx', action='store_true',
                        help='Generate an editable PPTX slideshow via pandoc (use with --data)')

    args = parser.parse_args()

    # PPTX workflow (only needs --data)
    if args.pptx:
        if not args.data:
            print("Error: --pptx requires --data")
            sys.exit(1)
        success = generate_pptx(args.data, args.output)
        if not success:
            sys.exit(1)
        return

    # Template + JSON workflow
    if args.template or args.data:
        if not args.template or not args.data:
            print("Error: --template and --data must be used together")
            sys.exit(1)
        if args.slides:
            success = generate_slides(
                args.template, args.data, args.output,
                latex_only=args.latex_only, keep_temp=args.keep_temp,
            )
        else:
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
            projects_list, args.output, args.bio,
            latex_only=args.latex_only, keep_temp=args.keep_temp,
        )

    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()

