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
    
    def find_project_images(self, project_path: Path, max_images: int = 6) -> List[str]:
        """Find representative images in a project directory"""
        images = []
        
        # Check for images subfolder first
        images_dir = project_path / 'images'
        if images_dir.exists():
            search_dir = images_dir
        else:
            search_dir = project_path
        
        # Look for common image patterns
        patterns = ['*.jpg', '*.jpeg', '*.png', '*.gif']
        for pattern in patterns:
            for img in sorted(search_dir.glob(pattern)):
                # Skip thumbnails and small images
                if 'thumb' not in img.name.lower():
                    images.append(str(img.relative_to(self.base_path)))
                    if len(images) >= max_images:
                        break
            if len(images) >= max_images:
                break
        
        return images
    
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

% Use Source Sans Pro font (matching website typography)
% Font weights: 200 (ExtraLight), 300 (Light), 400 (Regular), 600 (SemiBold)
\IfFontExistsTF{Source Sans Pro}{%
    \setmainfont{Source Sans Pro}[
        UprightFont = *-Light,
        BoldFont = *-Semibold,
        ItalicFont = *-LightItalic,
        BoldItalicFont = *-SemiboldItalic
    ]
}{%
    % Fallback to a clean sans-serif font
    \setsansfont{Latin Modern Sans}
    \renewcommand{\familydefault}{\sfdefault}
}

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
    
    \vspace{0.25cm}
    
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
        latex += "\n\n\\newpage\n\n"
        
        # Add projects
        latex += r"\section*{Selected Works}" + "\n\n"
        
        for project in projects:
            latex += self.generate_project_section(project)
        
        latex += r"\end{document}"
        
        return latex
    
    def generate_project_section(self, project: Dict) -> str:
        """Generate LaTeX for a single project"""
        latex = ""
        
        # Project title and metadata
        title = self.escape_latex(project['title'])
        year = self.escape_latex(project['year'])
        
        latex += f"\\subsection*{{{title}}}\n\n"
        latex += f"\\textit{{{year}"
        
        if project['medium']:
            latex += f" | {self.escape_latex(project['medium'])}"
        
        if project['dimensions']:
            latex += f" | {self.escape_latex(project['dimensions'])}"
        
        latex += "}\n\n"
        
        # Add thumbnail or first image if available
        # Note: XeLaTeX cannot handle GIF files, so we skip them
        if project['thumb'] and not project['thumb'].endswith('.gif'):
            img_path = f"{project['path']}/{project['thumb']}"
            if (self.base_path / img_path).exists():
                latex += "\\begin{figure}[H]\n"
                latex += "    \\centering\n"
                latex += f"    \\includegraphics[width=0.8\\textwidth]{{{img_path}}}\n"
                latex += "\\end{figure}\n\n"
        elif project['images']:
            # Use first non-GIF image as main image
            for img_path in project['images']:
                if not img_path.endswith('.gif') and (self.base_path / img_path).exists():
                    latex += "\\begin{figure}[H]\n"
                    latex += "    \\centering\n"
                    latex += f"    \\includegraphics[width=0.8\\textwidth]{{{img_path}}}\n"
                    latex += "\\end{figure}\n\n"
                    break
        
        # Add description
        if project['description']:
            latex += self.markdown_to_latex(project['description']) + "\n\n"
        elif project['about']:
            # Use first paragraph of about text
            paragraphs = project['about'].split('\n\n')
            if paragraphs:
                latex += self.markdown_to_latex(paragraphs[0]) + "\n\n"
        
        # Add additional images in a grid if available (skip GIFs)
        additional_images = [img for img in project['images'][1:5] if not img.endswith('.gif')] if len(project['images']) > 1 else []
        if additional_images:
            latex += self.generate_image_grid(additional_images)
        
        latex += "\\vspace{1cm}\n\n"
        
        return latex
    
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
        """Generate \\ArtworkEntry calls for every project"""
        latex = ""
        for project in projects:
            title = self.escape_latex(project['title'])
            year = self.escape_latex(project['year'])
            medium = self.escape_latex(project['medium'] or '')
            dimensions = self.escape_latex(project['dimensions'] or '')

            # Description: prefer DESCRIPTION.txt, fall back to first paragraph of about
            desc = ""
            if project['description']:
                desc = self.markdown_to_latex(project['description'])
            elif project['about']:
                paragraphs = project['about'].split('\n\n')
                if paragraphs:
                    desc = self.markdown_to_latex(paragraphs[0])

            # Main image: prefer thumb (non-GIF), then first image
            main_image = ""
            if project['thumb'] and not project['thumb'].endswith('.gif'):
                candidate = f"{project['path']}/{project['thumb']}"
                if (self.base_path / candidate).exists():
                    main_image = candidate
            if not main_image:
                for img in project['images']:
                    if not img.endswith('.gif') and (self.base_path / img).exists():
                        main_image = img
                        break

            latex += (
                f"\\ArtworkEntry\n"
                f"{{{main_image}}}\n"
                f"{{{title}}}\n"
                f"{{{year}}}\n"
                f"{{{medium}}}\n"
                f"{{{dimensions}}}\n"
                f"{{{desc}}}\n\n"
            )

            # Optional additional images (skip GIFs, skip the main image)
            extra = [
                img for img in project['images'][1:5]
                if not img.endswith('.gif') and img != main_image
                and (self.base_path / img).exists()
            ]
            if extra:
                latex += self.generate_image_grid(extra)

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
            '%%ARTIST_STATEMENT%%':  statement if statement else bio,
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
