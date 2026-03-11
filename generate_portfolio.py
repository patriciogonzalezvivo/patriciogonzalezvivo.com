#!/usr/bin/env python3
"""
Portfolio PDF Generator

Generates an artist portfolio PDF from a list of artworks using LaTeX.
Similar to how works.php creates HTML from a list of artworks.

Usage:
    python generate_portfolio.py --output portfolio.pdf

Or with custom project list:
    python generate_portfolio.py --projects projects.txt --output portfolio.pdf
"""

import json
import os
import sys
import argparse
import subprocess
import shutil
import re
from pathlib import Path
from typing import List, Dict, Optional

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
        if not about:
            readme = self.read_metadata_file(full_path / 'README.md')
            if readme:
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
        
        return {
            'path': project_path,
            'year': year,
            'folder': folder,
            'title': title or folder.replace('_', ' ').title(),
            'medium': medium,
            'description': description,
            'dimensions': dimensions,
            'about': about,
            'thumb': thumb,
            'images': images
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
    
    def find_project_images(self, project_path: Path) -> List[str]:
        """Find all images in the project's images/ subdirectory (no thumb, no gif)."""
        images_dir = project_path / 'images'
        if not images_dir.exists():
            return []

        images = []
        for img in sorted(images_dir.iterdir()):
            if img.suffix.lower() in ('.jpg', '.jpeg', '.png') and 'thumb' not in img.name.lower():
                images.append(str(img.relative_to(self.base_path)))
        return images

    def get_image_caption(self, img_path: str) -> str:
        """Return the text content of a same-name .txt sidecar file, or empty string.

        Each line is preserved as a separate line in the PDF using LaTeX forced
        line breaks (\\\\), so the caption renders exactly as written.
        """
        txt_file = (self.base_path / img_path).with_suffix('.txt')
        if not txt_file.exists():
            return ""
        lines = txt_file.read_text().strip().splitlines()
        escaped_lines = [self.escape_latex(line) for line in lines]
        return "\\\\\n".join(escaped_lines)
    
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
\fancyfoot[C]{\thepage}
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

        # Description: prefer README.md content (about), fall back to DESCRIPTION.txt
        if project['about']:
            desc = self.markdown_to_latex(project['about'])
        elif project['description']:
            desc = self.markdown_to_latex(project['description'])
        else:
            desc = ""

        images = [img for img in project['images']
                  if not img.endswith('.gif') and (self.base_path / img).exists()]

        latex = ""

        # ── Page 1 ──────────────────────────────────────────────────────────
        latex += "\\clearpage\n"
        # Title bar: bold title flush-left, year flush-right
        latex += f"\\noindent{{\\Large\\textbf{{{title}}}}}\\hfill{{\\large {year}}}\n\n"
        latex += "\\vspace{0.3em}\\hrule\\vspace{1em}\n\n"

        if images:
            first_img = images[0]
            caption   = self.get_image_caption(first_img)

            # Left column: description text (top-aligned)
            latex += "\\noindent\n"
            latex += "\\begin{minipage}[t]{0.48\\textwidth}\n"
            if desc:
                latex += desc + "\n"
            latex += "\\end{minipage}\n"
            latex += "\\hfill\n"

            # Right column: image, optional caption pinned to bottom
            if caption:
                latex += "\\begin{minipage}[t][0.82\\textheight][b]{0.48\\textwidth}\n"
                latex += (f"  \\includegraphics[width=\\linewidth,"
                          f"height=0.72\\textheight,keepaspectratio]{{{first_img}}}\n\n")
                latex += f"  \\vspace{{0.5em}}\n\n  {caption}\n"
                latex += "\\end{minipage}\n\n"
            else:
                latex += "\\begin{minipage}[t]{0.48\\textwidth}\n"
                latex += (f"  \\includegraphics[width=\\linewidth,"
                          f"height=0.82\\textheight,keepaspectratio]{{{first_img}}}\n")
                latex += "\\end{minipage}\n\n"
        elif desc:
            latex += desc + "\n\n"

        # ── Additional images (one per page) ────────────────────────────────
        # idx=0 → image LEFT, idx=1 → image RIGHT, idx=2 → LEFT, …
        for idx, img_path in enumerate(images[1:]):
            latex += "\\clearpage\n"
            caption       = self.get_image_caption(img_path)
            image_on_right = (idx % 2 == 1)
            h = "0.85\\textheight"
            img_line = (f"\\includegraphics[width=\\linewidth,"
                        f"height={h},keepaspectratio]{{{img_path}}}\n")

            if caption:
                # Fixed-height minipages so bottom-alignment works
                if image_on_right:
                    # caption bottom-left, image bottom-right
                    latex += (
                        "\\noindent\n"
                        f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                        f"  {caption}\n"
                        "\\end{minipage}\n"
                        "\\hfill\n"
                        f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                        f"  {img_line}"
                        "\\end{minipage}\n\n"
                    )
                else:
                    # image bottom-left, caption bottom-right
                    latex += (
                        "\\noindent\n"
                        f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                        f"  {img_line}"
                        "\\end{minipage}\n"
                        "\\hfill\n"
                        f"\\begin{{minipage}}[b][{h}][b]{{0.48\\textwidth}}\n"
                        f"  {caption}\n"
                        "\\end{minipage}\n\n"
                    )
            else:
                # No caption: image occupies its half of the page
                if image_on_right:
                    latex += (
                        "\\noindent\\hfill\n"
                        "\\begin{minipage}[t]{0.48\\textwidth}\n"
                        f"  {img_line}"
                        "\\end{minipage}\n\n"
                    )
                else:
                    latex += (
                        "\\noindent\n"
                        "\\begin{minipage}[t]{0.48\\textwidth}\n"
                        f"  {img_line}"
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
                ['xelatex', '-interaction=nonstopmode', '-output-directory', str(self.temp_dir), str(tex_file)],
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
        return f"\\clearpage\n\\section*{{{section_title}}}\n\n{content}\n"

    def populate_template(self, template_file: str, data: Dict, projects: List[Dict]) -> str:
        """Populate a LaTeX template by replacing %%PLACEHOLDER%% markers"""
        template = Path(template_file).read_text()

        artist = data.get('artist', {})

        # Artist statement: prefer artist_statement_file, fall back to inline field
        statement = ''
        stmt_path_str = artist.get('artist_statement_file')
        if stmt_path_str:
            stmt_path = self.base_path / stmt_path_str
            if stmt_path.exists():
                statement = self.markdown_to_latex(
                    self.extract_text_from_markdown(stmt_path.read_text())
                )
        if not statement:
            statement = self.markdown_to_latex(artist.get('statement', ''))

        # Bio (for places where a short bio is needed separately from statement)
        bio = ''
        bio_path_str = artist.get('bio_file')
        if bio_path_str:
            bio_path = self.base_path / bio_path_str
            if bio_path.exists():
                bio = self.markdown_to_latex(
                    self.extract_text_from_markdown(bio_path.read_text())
                )

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
            '%%ARTIST_STATEMENT%%':  statement,
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
  python generate_portfolio.py --template portfolio_template.tex \\
                               --data portfolio_data.json \\
                               --output portfolio.pdf

  # Template + JSON, generate .tex only (no PDF compilation)
  python generate_portfolio.py --template portfolio_template.tex \\
                               --data portfolio_data.json \\
                               --output portfolio.pdf --latex-only

  # Legacy: generate with default project list
  python generate_portfolio.py --output portfolio.pdf

  # Legacy: generate with custom project list
  python generate_portfolio.py --projects projects.txt --output my_portfolio.pdf

  # Keep temporary files for debugging
  python generate_portfolio.py --output portfolio.pdf --keep-temp
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
    
    args = parser.parse_args()
    
    generator = PortfolioGenerator()

    # Template + JSON workflow
    if args.template or args.data:
        if not args.template or not args.data:
            print("Error: --template and --data must be used together")
            sys.exit(1)
        success = generator.generate_from_template(
            args.template, args.data, args.output,
            latex_only=args.latex_only, keep_temp=args.keep_temp
        )
    else:
        # Legacy workflow: inline LaTeX generation
        if args.projects:
            with open(args.projects, 'r') as f:
                projects_list = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        else:
            projects_list = [
                '2026/astros',
                '2025/imaginary',
                '2025/hybrids',
                '2022/time',
                '2021/memory',
                '2021/fen',
            ]
        success = generator.generate(
            projects_list, args.output, args.bio,
            latex_only=args.latex_only, keep_temp=args.keep_temp
        )
    
    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()
