"""
portfolio
=========
Package for generating artist portfolio PDFs from per-project flat-file
metadata and a LaTeX template.

Sub-modules
-----------
utils          – LaTeX escaping and Markdown conversion helpers.
images         – Image discovery, dimension reading, and render-plan building.
metadata       – Per-project metadata reader (TITLE.txt, README.md, …).
latex_builder  – LaTeX content generation and template population.
compiler       – XeLaTeX compilation and output management.
elements       – SVG/label generation (label page, gallery name).
"""
