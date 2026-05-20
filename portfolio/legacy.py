"""
portfolio/legacy.py
-------------------
Legacy standalone document builder used by the no-template CLI workflow.

The main workflow uses ``populate_template()`` with an external
``template.tex``. This module is a self-contained fallback that emits
a minimal preamble + biography + project pages document. It is kept
for backwards compatibility with the historical ``--output`` CLI mode.

Note: this preamble drifts independently from ``template.tex`` and lacks
many features (avatar, artist statement, CV / Exhibitions / Talks /
Press sections, label page, SVG injection).
"""

from pathlib import Path
from typing import Dict, List

from portfolio.utils import markdown_to_latex
from portfolio.pages import build_artwork_pages


_LEGACY_PREAMBLE = r"""\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{graphicx}
\usepackage{float}
\usepackage{wrapfig}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{hyperref}
\usepackage{parskip}
% SVGs are pre-converted to PDF by the Python generator (rsvg-convert)
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

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{Patricio Gonzalez Vivo}
\fancyhead[R]{Portfolio}
\renewcommand{\headrulewidth}{0.4pt}

\titleformat{\section}{\Large\bfseries}{}{0em}{}[\titlerule]
\titleformat{\subsection}{\large\bfseries}{}{0em}{}

\hypersetup{colorlinks=true,linkcolor=black,urlcolor=blue}
\setlength{\parindent}{0pt}

\begin{document}

\begin{titlepage}
    \centering
    \vspace*{3cm}
    \includegraphics[width=0.15\textwidth]{images/logo-gray.png}\\[1em]
    {\Huge\bfseries Patricio Gonzalez Vivo}\\[0.5em]
    {\Large Portfolio}
    \vfill
    {\small \url{https://patriciogonzalezvivo.com}}
    \vspace{1cm}
\end{titlepage}

\section*{Biography}
"""


def build_legacy_document(bio: str, projects: List[Dict], base_path: Path) -> str:
    """Build a complete LaTeX document string without an external template.

    This is the "legacy" workflow: a self-contained preamble is emitted
    in-line and project pages are appended after a biography section.

    Args:
        bio:       Plain-text or Markdown biography.
        projects:  List of project dicts (from :mod:`portfolio.metadata`).
        base_path: Workspace root (passed to :func:`build_artwork_pages`).

    Returns:
        A complete LaTeX document string ready to pass to xelatex.
    """
    body = _LEGACY_PREAMBLE + markdown_to_latex(bio) + "\n\n"
    for project in projects:
        body += build_artwork_pages(project, base_path) + "\n"  # no base_url in legacy mode
    body += r"\end{document}" + "\n"
    return body
