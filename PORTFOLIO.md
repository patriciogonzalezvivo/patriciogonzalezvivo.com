# Portfolio PDF Generator

A Python script that generates a professional artist portfolio PDF from a list of artworks, similar to how `works.php` creates HTML from a list of artworks.

## Features

- Reads project metadata from `TITLE.txt`, `MEDIUM.txt`, `DESCRIPTION.txt`, `DIMENSIONS.txt` files
- Includes artist biography from `README.md`
- Automatically finds and includes project images (thumbnails and additional images)
- Generates professional LaTeX document
- Compiles to PDF using pdflatex
- Configurable project list

## Requirements

1. **Python 3.6+**

2. **LaTeX Distribution** (for PDF compilation):
   - **Linux/Mac**: Install texlive
     ```bash
     # Ubuntu/Debian
     sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra texlive-xetex
     
     # macOS (with Homebrew)
     brew install --cask mactex-no-gui
     ```
   
   - **Windows**: Install MiKTeX or TeX Live

## Usage

### Basic Usage (with default project list)

```bash
python generate_portfolio.py --output portfolio.pdf
```

This will generate a PDF with the default list of projects (matching `works.php`).

### Custom Project List

1. Create a text file with your project list (one per line):

```text
# projects.txt
2026/astros
2025/imaginary
2025/hybrids
2023/blink
2022/time
```

2. Generate the portfolio:

```bash
python generate_portfolio.py --projects projects.txt --output my_portfolio.pdf
```

### Custom Biography File

```bash
python generate_portfolio.py --bio artist_bio.md --output portfolio.pdf
```

### Keep Temporary Files (for debugging)

```bash
python generate_portfolio.py --output portfolio.pdf --keep-temp
```

This will keep the generated LaTeX files in `temp_portfolio/` directory for inspection.

### Generate LaTeX Only (without PDF compilation)

If you don't have LaTeX installed or want to compile manually:

```bash
python generate_portfolio.py --output portfolio --latex-only
```

This generates `portfolio.tex` which you can compile later with:

```bash
pdflatex portfolio.tex
```

## Project Structure

Each project should have the following structure:

```
year/projectname/
├── TITLE.txt           # Project title
├── MEDIUM.txt          # Medium/technique
├── DESCRIPTION.txt     # Short description
├── DIMENSIONS.txt      # Dimensions (optional)
├── about.md            # Longer description (optional)
├── README.md           # Alternative description (optional)
├── thumb.jpg           # Thumbnail image
└── images/             # Additional project images
    ├── 01.jpg
    ├── 02.jpg
    └── ...
```

## How It Works

1. **Metadata Loading**: For each project path, the script:
   - Reads metadata from `.txt` files (title, medium, description, dimensions)
   - Reads longer descriptions from `about.md` or `README.md`
   - Finds the thumbnail image (`thumb.gif`, `thumb.jpg`, or `thumb.png`)
   - Locates additional images in the project directory or `images/` subfolder

2. **LaTeX Generation**: Creates a LaTeX document with:
   - Title page with artist name
   - Biography section
   - Selected works section with each project showing:
     - Title, year, medium, and dimensions
     - Main image (thumbnail or first available image)
     - Description text
     - Grid of additional images (up to 4)

3. **PDF Compilation**: Compiles the LaTeX document to PDF using `pdflatex`

## Command-Line Options

```
--projects, -p    Path to project list file (one project per line)
--output, -o      Output PDF filename (required)
--bio, -b         Path to biography markdown file (default: README.md)
--keep-temp       Keep temporary LaTeX files for debugging
--latex-only      Generate LaTeX file only, don't compile to PDF
```

## Example Output Structure

The generated PDF includes:

1. **Title Page**
   - Artist name
   - "Portfolio" subtitle
   - Website URL

2. **Biography**
   - Artist bio from README.md
   - Formatted with proper typography

3. **Selected Works**
   - Each project on its own section
   - Title, year, and medium
   - Main project image
   - Description text
   - Grid of additional images

## Customization

### LaTeX Template

The LaTeX template is embedded in the Python script. To customize:

1. Edit the `generate_latex()` method in `generate_portfolio.py`
2. Modify section formatting, fonts, spacing, etc.
3. Use `--keep-temp` to inspect generated LaTeX

### Image Selection

By default, the script includes:
- 1 main image (thumbnail or first found image)
- Up to 4 additional images in a 2×2 grid

Adjust `max_images` in `find_project_images()` and grid layout in `generate_image_grid()` to change this.

## Troubleshooting

### "pdflatex not found"

Install a LaTeX distribution (see Requirements section above).

### "Error compiling LaTeX"

1. Run with `--keep-temp` to keep temporary files
2. Check `temp_portfolio/portfolio.log` for detailed errors
3. Common issues:
   - Special characters in metadata (& % $ # _ { } ~ ^)
   - Image files not found or unsupported format
   - Missing LaTeX packages

### Images not appearing

1. Verify image paths are correct
2. Ensure images are in supported formats (JPG, PNG, GIF)
3. Check file permissions

## Related Files

- `works.php` - Web version that generates HTML gallery
- `project_meta.php` - PHP functions for loading project metadata
- `README.md` - Artist biography (used as input)

## License

Same as the portfolio website.
