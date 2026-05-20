"""
portfolio
=========
Package for generating artist portfolio PDFs from per-project flat-file
metadata and a LaTeX template.

Sub-modules
-----------
utils          – LaTeX escaping, Markdown conversion, thumbnail discovery.
images         – Image discovery, dimension reading, render-plan building.
metadata       – Per-project metadata reader (TITLE.txt, README.md, …).
pages          – Per-artwork LaTeX page rendering (caption, group, individual).
sections       – Bio, artist statement, and appendix section builders.
latex_builder  – Template-population orchestrator that ties everything together.
legacy         – Standalone document builder (no-template fallback CLI mode).
compiler       – XeLaTeX compilation and output management.
elements       – SVG/label generation (label page, gallery name).
html_render    – Headless-Chrome renderer for raw HTML blocks in READMEs.
"""
