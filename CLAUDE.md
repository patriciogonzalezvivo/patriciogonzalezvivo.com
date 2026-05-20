# CLAUDE.md — patriciogonzalezvivo.com

Artist portfolio for Patricio Gonzalez Vivo. Serves as both a PHP website and a PDF portfolio generator.

---

## Running the project

```bash
make server        # php -S localhost:8000
make portfolio     # generate PDF (template + JSON workflow)
```

Manual equivalents:

```bash
php -S localhost:8000

python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json
python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json --latex-only   # inspect .tex only
python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json --keep-temp    # keep temp_portfolio/
```

Legacy workflow (no template, inline LaTeX):

```bash
python generate_portfolio.py --output portfolio.pdf   # uses hardcoded project list
python generate_portfolio.py -p projects.txt --output portfolio.pdf  # one path per line
```

### Dependencies

- PHP built-in server (no Apache/Nginx needed)
- `xelatex` — required for PDF compilation (`brew install mactex` on macOS)
- `rsvg-convert` (preferred) or `inkscape` — SVG-to-PDF conversion for label page

---

## Project folder structure

Each artwork lives at `YEAR/project_name/` with flat-file metadata:

```
YEAR/project_name/
  TITLE.txt          # display title
  MEDIUM.txt         # medium / material
  DESCRIPTION.txt    # short description
  DIMENSIONS.txt     # dimensions string
  YEAR.txt           # optional year override (defaults to folder year)
  about.md           # long-form description (preferred over README.md)
  README.md          # long-form description fallback (also used as bio source)
  thumb.{webm,gif,jpg,png}   # thumbnail for listing pages (first match wins)
  thumbnail.{jpg,jpeg,png}   # larger thumbnail for big_thumbnail type & PDF
  index.php          # project page
  images/            # gallery images (JPG/PNG, sorted)
    thumbnails/      # smaller versions for gallery grid
    detail/          # detail shots (optional)
    installation/    # installation shots (optional)
    IMGNAME.txt      # sidecar metadata: title, year, medium, dimensions, sold, print
  svg/               # SVG files (auto-converted to PDF for LaTeX)
```

For `about.md`, the Python generator uses it as-is; for `README.md` it strips Markdown before LaTeX conversion (unless SVG injection is needed, in which case it processes inline).

---

## PHP Website

### Page layout

Every page includes:
1. `project_meta.php` — shared metadata functions
2. Variables set (e.g. `$page_title`, `$og_image`)
3. `header.php` — `<html>` through `<body>`, full Open Graph + Twitter Card meta
4. `menu.php` — navigation bar
5. Page-specific content
6. `footer.php` — `slideSet.js`, `gallery.js` scripts, `</body></html>`

### Embed mode

Appending `?embed=1` hides menu, footer, and item info — used for `wasm` type iframes.

### Key PHP files

**`project_meta.php`**
- `get_project_meta($path, $base='')` — reads flat files from a project dir, returns array with `path, year, folder, title, medium, description, dimensions, thumb`
- `get_current_project_meta($dir='.')` — same but infers year/folder from CWD; use inside a project's `index.php`
- `render_project_item($meta, $commented=false)` — renders an `<article class="item">` with thumb and info
- `list_all_projects($base, $excluded)` — scans `20*/` year dirs for folders containing `TITLE.txt`
- `set_random_og_image($projects, $root='.')` — picks a random static thumbnail, sets global `$og_image` as absolute URL; call BEFORE `header.php` on listing pages

**`gallery.php`** — for painting galleries (e.g. `2026/santos`)
- `render_gallery($options)` — renders `.paintings-gallery` grid + fullscreen modal
- `get_gallery_artworks($images_dir, $pattern, $defaults)` — finds images, loads per-image `.txt` sidecar metadata
- `load_artwork_metadata($file, $defaults)` — parses `key: value` sidecar (supports `title`, `year`, `medium`, `dimensions`, `sold`, `print`)
- `render_gallery_item($artwork)` — single painting card with Buy Print / Acquire Original buttons

**`slideSet.php`** — for slideshows
- `render_slideset($options)` — renders `<div id="..." class="slideSet ...">` with `<img>` tags; animated by `js/slideSet.js`
- `slideset($dir, $style)` — convenience wrapper
- `get_slide_images($dir, $pattern)` — natural-sorted glob

**`header.php`**
- Sets defaults for `$page_title`, `$page_description`, `$page_keywords`, `$og_*` vars
- Auto-detects `$og_image` from `thumbnail.*` / `thumb.*` in CWD if not already set
- Auto-calculates image dimensions via `getimagesize()`
- Emits full Open Graph + Twitter/X Card meta block
- Loads Google Fonts, `css/style.css`, Google Analytics (skipped in embed mode)

### `index.php` (homepage) project entry types

```php
['path' => 'YEAR/folder', 'type' => 'thumbnail']       // thumb.* image link (default)
['path' => 'YEAR/folder', 'type' => 'big_thumbnail',    // thumbnail.jpg as larger img
 'width' => 320, 'height' => 540]
['path' => 'YEAR/folder', 'type' => 'wasm',             // iframe with ?embed=1
 'width' => 516, 'height' => 810]
['path' => 'YEAR/folder', 'type' => 'gallery',          // slideSet of images
 'images_dir' => 'YEAR/folder/images/thumbnails',
 'pattern' => 'DSF*.{jpg,jpeg,png,gif}']
```

Metadata overrides (works.php and project index.php):
```php
['path' => '2017/pixelspirit', 'url' => 'http://...', 'title' => '...', 'year' => '2017', 'medium' => '...']
```

### Project `index.php` pattern

```php
<?php
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../header.php");
    include("../../gallery.php");
?>
<?php include("../../menu.php"); ?>
    <?php echo render_gallery(['images_dir' => 'images', 'pattern' => 'DSF*.jpg', ...]); ?>
    <div id="longer-info">
        <h2><?php echo $meta['title']; ?></h2>
        <?php /* ParsedownExtended to render README.md */ ?>
    </div>
<?php include("../../footer.php"); ?>
```

For related works inside a project page, pass `'../../'` as base to `get_project_meta()` and prepend `'../../'` to the returned path.

---

## Python Portfolio Generator

### Architecture

```
generate_portfolio.py       # CLI entry point; thin orchestrator
portfolio/
  metadata.py               # reads flat files → project dict
  latex_builder.py          # builds LaTeX per-project + populates template
  compiler.py               # runs xelatex x2, copies PDF to output
  images.py                 # image discovery, dimension reading, render plan
  elements.py               # label SVG generation (berthe library)
  utils.py                  # escape_latex, markdown_to_latex, strip_markdown
  html_render.py            # renders HTML blocks to PNG via headless Chrome
  pptx_builder.py           # PowerPoint builder (unused in main workflow)
  template.tex              # LaTeX template with %%PLACEHOLDER%% markers
  data.json                 # artist info + project list for portfolio build
  berthe/                   # vector drawing submodule (SVG generation)
```

### `portfolio/data.json`

Controls what goes into the PDF:

```json
{
  "artist": {
    "name": "...", "email": "...", "website": "...", "instagram": "...",
    "phone": "...", "location": "...", "logo": "images/logo-gray.png",
    "bio_file": "README.md",
    "avatar_file": "...",              // optional — floats right beside bio
    "artist_statement_file": "...",    // optional clearpage section
    "cv_file": "cv.md",               // optional appendix
    "exhibitions_file": "exhibitions.md",
    "talks_file": "talks.md",
    "press_file": "press.md"
  },
  "gallery_name": "...",               // for label page
  "projects": [
    { "path": "2026/santos", "images_per_page": 1, "skip": ["DSF1046"] },
    { "path": "2026/weaver2", "images_per_page": 1, "inject_svgs": false }
  ]
}
```

### Project dict (from `metadata.py`)

```python
{
  'path':           "2025/hybrids",
  'year':           "2025",
  'folder':         "hybrids",
  'title':          "Hybrids",
  'medium':         None,          # MEDIUM.txt
  'description':    None,          # DESCRIPTION.txt
  'dimensions':     None,          # DIMENSIONS.txt
  'about':          "...",         # about.md or stripped README.md
  'readme_raw':     "...",         # raw README.md (for SVG injection)
  'thumb':          "thumb.jpg",
  'images':         ["2025/hybrids/images/01.jpg", ...],
  'svgs':           ["/abs/path/svg/000.svg", ...],
  'images_per_page': 3,            # from data.json; default 3
  # extra keys from data.json entry (e.g. 'skip', 'inject_svgs')
}
```

### PDF page layout

- **Page 1**: Title bar (large bold title + red linked year) + description text + `thumbnail.jpg` as a `\wrapfigure{r}` (if present)
- **Additional pages**: images from `images/` sub-directory
  - Portrait images sharing the same `medium` + `dimensions` sidecar → grouped side-by-side (`images_per_page` per page)
  - Other images → individual pages, alternating left/right layout with caption from `.txt` sidecar

### Image sidecar format (`images/IMGNAME.txt`)

```
title: Portrait of Jane
year: 2025
medium: Oil over cardboard
dimensions: 16 x 12 inches
sold: yes
print: https://...        # Buy Print URL
```

### `template.tex` placeholders

```
%%ARTIST_NAME%%  %%ARTIST_EMAIL%%  %%ARTIST_WEBSITE%%  %%ARTIST_WEBSITE_URL%%
%%ARTIST_INSTAGRAM%%  %%ARTIST_LOCATION%%  %%ARTIST_PHONE%%  %%ARTIST_LOGO%%
%%ARTIST_BIO%%                  # bio_file content (with optional avatar wrapfigure)
%%OPTIONAL_ARTIST_STATEMENT%%   # artist_statement_file content
%%ARTWORKS%%                    # all project pages
%%OPTIONAL_CV%%  %%OPTIONAL_EXHIBITIONS%%  %%OPTIONAL_TALKS%%  %%OPTIONAL_PRESS%%
%%LABEL_PAGE%%                  # first-page label SVG (auto-generated)
```

### Compilation

- `temp_portfolio/portfolio.tex` is written, then `xelatex` runs twice from workspace root (for cross-references)
- Output PDF is copied to the requested filename (derived from `artist.name` + `artist.for` + year if not specified)
- `temp_portfolio/` is deleted unless `--keep-temp`

---

## CSS / JS assets

- `css/style.css` — main stylesheet
- `js/slideSet.js` — animates `.slideSet` divs (cycles through child `<img>` tags)
- `js/gallery.js` — fullscreen modal for `.paintings-gallery`
- `montserrat/` — local Montserrat TTF fonts (used by XeLaTeX via `fontspec`)
- `images/` — site-wide images (logo, icons, etc.)
- `parsedown/` — Parsedown submodule (PHP Markdown parser)
- `ParsedownExtended.php` — extended Parsedown with extra features

---

## Markdown extensions (`:::wrapfig`)

Used in README.md and bio files; rendered by both PHP (ParsedownExtended) and Python (utils.py):

```markdown
:::wrapfig right
src: YEAR/project/images/01.jpg
title: Title
year: 2010
caption: Venue, City
link: ./YEAR/project/
:::
```

In the PDF generator, `src:` paths are prefixed with the project dir and `link:` values are resolved to absolute website URLs.
