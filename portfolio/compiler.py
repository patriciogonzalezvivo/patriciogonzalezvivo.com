"""
portfolio/compiler.py
---------------------
LaTeX → PDF compilation for the portfolio generator.

Responsibilities:
  - Writing the generated ``.tex`` source to a temporary directory.
  - Invoking xelatex (two passes for correct cross-references).
  - Copying the finished PDF to the requested output path.
  - Cleaning up temporary files on success (unless ``keep_temp=True``).

xelatex is required because the template uses ``fontspec`` for custom fonts.
"""

import shutil
import subprocess
from pathlib import Path


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compile_to_pdf(
    latex_content: str,
    output_pdf: str,
    base_path: Path,
    *,
    keep_temp: bool = False,
) -> bool:
    """Compile *latex_content* to a PDF file at *output_pdf*.

    Runs xelatex twice from *base_path* so that relative image paths in the
    generated ``.tex`` resolve correctly against the workspace root.

    Args:
        latex_content: Complete LaTeX document string.
        output_pdf:    Destination path for the finished PDF.
        base_path:     Workspace root; xelatex is invoked with this as ``cwd``.
        keep_temp:     When ``True``, leave the ``temp_portfolio/`` directory
                       in place after a successful build (useful for debugging).

    Returns:
        ``True`` on success, ``False`` on any error.
    """
    if not shutil.which('xelatex'):
        print(
            "Error: xelatex not found.\n"
            "Install a LaTeX distribution that includes XeLaTeX, e.g.:\n"
            "  sudo apt install texlive-xetex   # Debian / Ubuntu\n"
            "  brew install mactex              # macOS"
        )
        return False

    temp_dir = base_path / "temp_portfolio"
    temp_dir.mkdir(exist_ok=True)

    tex_file = temp_dir / "portfolio.tex"
    tex_file.write_text(latex_content)
    print(f"Generated LaTeX file: {tex_file}")

    pdf_file = temp_dir / "portfolio.pdf"

    print("Compiling PDF with XeLaTeX…")
    for pass_num in range(1, 3):
        result = subprocess.run(
            [
                'xelatex',
                '-shell-escape',
                '-interaction=nonstopmode',
                '-output-directory', str(temp_dir),
                str(tex_file),
            ],
            cwd=base_path,
            capture_output=True,
            text=True,
        )

        if not pdf_file.exists() and result.returncode != 0:
            print(f"Error during XeLaTeX pass {pass_num}:")
            # Show the last 2 000 characters of the log — enough for most errors
            print(result.stdout[-2000:])
            return False

        status = "completed (with warnings)" if pass_num == 1 else "completed"
        print(f"  Pass {pass_num} {status}")

    if not pdf_file.exists():
        print("Error: PDF was not produced — check the XeLaTeX log above.")
        return False

    shutil.copy(pdf_file, output_pdf)
    print(f"✓ Portfolio PDF generated: {output_pdf}")

    if keep_temp:
        print(f"Temporary files kept in: {temp_dir}")
    else:
        shutil.rmtree(temp_dir)

    return True


def write_latex_only(latex_content: str, output_path: str) -> bool:
    """Write *latex_content* to *output_path* without compiling.

    Useful for inspecting or manually tweaking the ``.tex`` source before
    running xelatex yourself.

    Args:
        latex_content: Complete LaTeX document string.
        output_path:   Destination ``.tex`` file path.

    Returns:
        Always ``True``.
    """
    Path(output_path).write_text(latex_content)
    print(f"✓ LaTeX file generated: {output_path}")
    print("  Run `xelatex -shell-escape <file>.tex` to compile to PDF.")
    return True
