# CLAUDE.md — patriciogonzalezvivo.com

Artist portfolio for **Patricio Gonzalez Vivo** (b. 1982, Buenos Aires). Multidisciplinary artist working across traditional and digital media — oil painting, drawing machines/plotters, generative/shader code, astronomical instruments, interactive web, and NFT/blockchain work. Serves as both a PHP website and a PDF portfolio generator.

**Artist Commons (AC) program context:** `2026/ac/CLAUDE.md` contains 23 lesson summaries and 20 slash commands covering visual analysis, semiotics, philosophy of art, generative/AI art, interactivity, appropriation, quilting as concept, IP law, portfolio building, curator outreach, text in visual art, systems-based/generative practice, and writing/revising artist statements. Load that file when doing studio critique, writing artist statements, or making professional decisions.

**Custom slash commands** (`.claude/commands/`):
- `/review-statement` — reviews and improves the artist statement / README for a specific project; pass a folder path (e.g. `2026/santos`) or a direct `.md` path as the argument.
- `/gallery-strategy` — builds a concrete strategy for approaching curators and galleries; rooted in community presence over cold networking.
- `/build-portfolio` — assembles or revises a curated portfolio for a specific audience and purpose; drives all decisions from the question "what do I want them to decide after five minutes with this work?"

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
  README.md          # long-form description (also used as bio source)
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

The Python generator strips Markdown from `README.md` before LaTeX conversion (unless SVG injection is needed, in which case it processes inline).

---

## PHP Website

All shared PHP helper files live in `server/`. Root-level `.php` files (`index.php`, `works.php`, `about.php`, etc.) are page controllers; they include helpers with `../../server/` prefixes.

### Page layout

Every page includes:
1. `server/project_meta.php` — shared metadata functions
2. Variables set (e.g. `$page_title`, `$og_image`)
3. `server/header.php` — `<html>` through `<body>`, full Open Graph + Twitter Card meta
4. `server/menu.php` — navigation bar
5. Page-specific content
6. `server/footer.php` — `slideSet.js`, `gallery.js` scripts, `</body></html>`

### Embed mode

Appending `?embed=1` hides menu, footer, and item info — used for `live` type iframes.

### Key PHP files

**`server/project_meta.php`**
- `get_project_meta($path, $base='')` — reads flat files from a project dir, returns array with `path, year, folder, title, medium, description, dimensions, thumb`
- `get_current_project_meta($dir='.')` — same but infers year/folder from CWD; use inside a project's `index.php`
- `render_project_item($meta, $commented=false)` — renders an `<article class="item">` with thumb and info
- `list_all_projects($base, $excluded)` — scans `20*/` year dirs for folders containing `TITLE.txt`
- `set_random_og_image($projects, $root='.')` — picks a random static thumbnail, sets global `$og_image` as absolute URL; call BEFORE `header.php` on listing pages

**`server/gallery.php`** — for painting galleries (e.g. `2026/santos`)
- `render_gallery($options)` — renders `.paintings-gallery` grid + fullscreen modal; options: `images_dir`, `pattern`, `defaults`, `show_modal` (bool, default `true`)
- `get_gallery_artworks($images_dir, $pattern, $defaults)` — finds images, loads per-image `.txt` sidecar metadata
- `load_artwork_metadata($file, $defaults)` — parses `key: value` sidecar (supports `title`, `year`, `medium`, `dimensions`, `sold`, `print`); lines starting with `#` are ignored
- `render_gallery_item($artwork)` — single painting card with Buy Print / Acquire Original buttons
- `render_gallery_modal()` — renders fullscreen modal HTML; called automatically by `render_gallery` unless `show_modal => false`
- `export_metadata_to_files($artwork_info, $sold_images, $output_dir)` — migration utility: writes hardcoded metadata arrays to `.txt` sidecar files

**`server/slideSet.php`** — for slideshows
- `render_slideset($options)` — renders `<div id="..." class="slideSet ...">` with `<img>` tags; animated by `js/slideSet.js`
- `slideset($dir, $style)` — convenience wrapper
- `get_slide_images($dir, $pattern)` — natural-sorted glob

**`server/header.php`**
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
['path' => 'YEAR/folder', 'type' => 'live',             // iframe with ?embed=1
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
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");
    include("../../server/gallery.php");
?>
<?php include("../../server/menu.php"); ?>
    <?php echo render_gallery(['images_dir' => 'images', 'pattern' => 'DSF*.jpg', ...]); ?>
    <div id="longer-info">
        <h2><?php echo $meta['title']; ?></h2>
        <?php /* ParsedownExtended to render README.md */ ?>
    </div>
<?php include("../../server/footer.php"); ?>
```

For related works inside a project page, pass `'../../'` as base to `get_project_meta()` and prepend `'../../'` to the returned path.

---

## Python Portfolio Generator

### Architecture

```
generate_portfolio.py       # CLI entry point; thin orchestrator
portfolio/
  metadata.py               # reads flat files → project dict
  latex_builder.py          # template-population orchestrator
  pages.py                  # per-artwork LaTeX page rendering
  sections.py               # bio / statement / appendix builders
  legacy.py                 # standalone document builder (no-template mode)
  compiler.py               # runs xelatex x2, copies PDF to output
  images.py                 # image discovery, dimension reading, render plan
  elements.py               # label SVG generation (berthe library)
  utils.py                  # escape_latex, markdown_to_latex, find_thumbnail
  html_render.py            # renders HTML blocks to PNG via headless Chrome
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
  'about':          "...",         # stripped README.md content
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
# lines starting with # are ignored (comments)
```

`sold` truthy values: `yes`, `true`, `1`, `sold` — anything else is treated as not sold.

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
- `portfolio/montserrat/` — local Montserrat TTF fonts (used by XeLaTeX via `fontspec`; **not** a root-level `montserrat/` folder)
- `images/` — site-wide images (logo, icons, etc.)
- `parsedown/` — Parsedown submodule (PHP Markdown parser)
- `ParsedownExtended.php` — extended Parsedown with extra features

### Montserrat font variants available

All files live at `portfolio/montserrat/Montserrat-{Variant}.ttf`. Variants: `Light`, `LightItalic`, `Regular`, `Italic`, `Medium`, `MediumItalic`, `SemiBold`, `SemiBoldItalic`, `Bold`, `BoldItalic`, `ExtraLight`, `ExtraLightItalic`, `ExtraBold`, `ExtraBoldItalic`, `Black`, `BlackItalic`, `Thin`, `ThinItalic`.

In `template.tex`, the font is loaded as:
```latex
\setmainfont{Montserrat}[
    Path           = portfolio/montserrat/,
    UprightFont    = *-Light,
    BoldFont       = *-SemiBold,
    ItalicFont     = *-LightItalic,
    BoldItalicFont = *-SemiBoldItalic,
    Extension      = .ttf
]
```
xelatex must be run from the **workspace root** so the relative `portfolio/montserrat/` path resolves correctly.

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
width: 40%
size: 70%
size_pdf: 60%   # overrides size for PDF only; ignored by PHP
:::
```

In the PDF generator, `src:` paths are prefixed with the project dir and `link:` values are resolved to absolute website URLs.

### Raw HTML blocks in README.md

**Website:** The PHP renderer (via `ParsedownExtended`) passes raw HTML blocks through as-is — they render as HTML in the browser. Inline styles, flex layouts, flip-card divs (e.g. PixelSpirit) all work normally.

**PDF generator:** Raw block-level HTML in README.md (`<div>`, `<table>`, `<figure>`, `<section>`, `<article>`, `<aside>`, `<pre>`, `<details>`, `<canvas>`) is detected by `portfolio/utils.py` (`_HTML_BLOCK_RE`) and handled as follows:

1. The HTML fragment is written to a temporary `.html` file inside the project directory (so `file://` URLs can load sibling images)
2. Headless Chrome renders it to a 1200-px-wide screenshot
3. Pillow auto-crops the white margins
4. The cropped PNG is cached in `temp_portfolio/html_renders/` (keyed by MD5 of project path + HTML content)
5. Embedded in the PDF with `\includegraphics[width=\linewidth]` centred on the page

**If Chrome is not installed:** HTML blocks are silently skipped with a warning; the rest of the PDF builds normally.

**If `src` images inside an HTML block don't exist:** Chrome renders a broken-image placeholder. For example, `2026/santos` has a `<div class="spacer">` referencing `refs/okeeffe_*.jpg` — if those files are absent the block renders as a blank PNG. Move such HTML blocks to `index.php` if they are website-only.

### Looom SVG handling

When a `:::wrapfig` block's `src:` points to a Looom animation SVG (detected by the Looom CSS property signature), the generator extracts a single frame to PNG before processing:

```markdown
:::wrapfig right
src: svg/animation.svg
frame: 0         # explicit frame index (takes priority over time:)
time: 2.5        # time in seconds (used if frame: absent)
:::
```

Generated PNGs are cached in `temp_portfolio/html_renders/` as `looom_<stem>_f<N>.png`.

### `portfolio/data.json` — sections list (actual config)

The current `portfolio/data.json` uses a `"sections"` array (not `"projects"`). Each entry is either:
- `{ "path": "YEAR/folder", ... }` — a standard project section → calls `build_artwork_pages()`
- `{ "title": "...", "projects": ["YEAR/folder", ...] }` — a featured group → calls `build_featured_section_pages()`

Optional per-project keys: `images_per_page` (int, default 3), `skip` (list of image stems to exclude), `skip_thumbnail` (bool), `inject_svgs` (bool), `logo` (see below).

**Per-section `logo` key** — controls whether the logo appears at the bottom of the section's pages (when space permits):
- absent → inherits `artist.logo` (default behaviour)
- `false` / `null` / `""` → suppresses the logo for this section
- `"path/to/img.png"` → uses a different image for this section only

```json
{ "path": "2026/santos" }                           // inherits artist.logo
{ "path": "2026/santos", "logo": false }            // no logo
{ "path": "2026/santos", "logo": "images/alt.png" } // custom image
```

The logo is placed with `\ifdim\dimexpr\pagegoal-\pagetotal\relax > 3.5cm` so it only renders when at least 3.5 cm of vertical space remains on the page. It is added to: the title/description page (Page 1 of each project), group image pages, and featured-section pages. Individual full-page image pages are excluded.

### Key `portfolio/` Python modules

**`latex_builder.py`** — `populate_template(template_text, data, sections, base_path)` — replaces all `%%PLACEHOLDER%%` markers; dispatches each section to `pages.py` builders.

**`pages.py`** — `build_artwork_pages(project, base_path, base_url)` — generates the title page + image pages for one project. `build_featured_section_pages(section, base_path, base_url)` — renders a grouped "Related Works" style page. `build_caption(img_path, base_path, align_right)` — builds LaTeX caption from `.txt` sidecar.

**`sections.py`** — `build_bio_block(artist, base_path, base_url)` — bio from `bio_file`, optional `avatar_file` as `\wrapfigure{r}`. `build_artist_statement(artist, base_path)` — `\section*{Artist Statement}` from `artist_statement_file`. `build_optional_section(file_key, artist, base_path)` — CV / Exhibitions / Talks / Press appendix pages.

**`metadata.py`** — reads flat `.txt` files into project dict; `readme_to_latex()` strips Markdown for LaTeX.

**`images.py`** — `build_render_plan()` groups portrait images by shared medium+dimensions for side-by-side layout; `parse_sidecar()` reads `.txt` metadata files.

**`elements.py`** — generates the label SVG (first page of PDF) using the `berthe` vector library.

**`utils.py`** — `escape_latex()`, `markdown_to_latex()`, `find_thumbnail()`.

### `template.tex` structure

Document class: A4 landscape, 0.8in margins, `fontspec` (XeLaTeX required), Montserrat from `portfolio/montserrat/`. Header: artist name (left) + `\rightmark` section name (right). Macros: `\ArtworkEntry{img}{title}{year}{medium}{dims}{desc}`, `\SeriesPage{title}`.

---

## Berthe Library (`portfolio/berthe/`)

Berthe is a first-party Python library (submodule at `portfolio/berthe/`) for **100% vector line composition**, used both for generating portfolio label SVGs and for driving the AxiDraw plotter. It exports SVG, PNG, Blender paths, and G-Code.

### Installation

```bash
cd portfolio/berthe
conda env create -f environment.yml   # or: pip install -e .
conda activate Surface
```

### Core concepts

All elements inherit from `Element` (base class with `color`, `stroke_width`, `fill`, `translate`, `rotate`, `scale`). A `Surface` (subclass of `Group`) is the root canvas — it holds all elements and is saved to SVG/PNG/G-Code.

### Class reference

**`Surface(size)`** — root canvas / document  
`size` can be: `'A4'`, `'A4_landscape'`, `'A3'`, `'A3_landscape'`, `'V2'`, `'V2_landscape'`, `'V3'`, `'V3_landscape'`, `'12in x 16in'`, `'16in x 12in'`, or a `(width_mm, height_mm)` tuple. Properties: `.width`, `.height`, `.size`, `.center`. Call `.save(path)` to export SVG.

**`Group(id, name, children, color)`** — container for elements and nested groups  
Methods: `.add(element)`. Supports `clip_rect` (SVG clipPath) and `clip_poly_invert` (even-odd punch-through).

**`Path(path, color, stroke_width)`** — ordered list of pen-up/pen-down segments; core plotter primitive  
Optimised for AxiDraw: reorders and reverses sub-paths to minimise pen-up travel. Call `.add(other_path)` to merge paths.

**`Line(A, B, resolution)`** — straight line between two points. `.getPath()` returns a `Path`.

**`Circle(center, radius)`** — circular arc. `.getPath()` returns a `Path`.

**`Arc(start, end, radius, large_arc, sweep)`** — SVG arc segment.

**`Rectangle(pos, size)`** — axis-aligned rectangle.

**`Polyline(points)`** / **`Polygon(points)`** — open / closed point sequences.

**`Text(text, pos, font, size)`** — text rendered via Hershey vector fonts (plottable, no raster).

**`Image(path)`** / **`Bitmap(array)`** — raster image embedding.

**`Pattern(surface, func)`** — surface-projection based pattern generator.

### `tools.py` math helpers

```python
from portfolio.berthe.berthe.tools import polar2xy, rotate, normalize, distance, transform

polar2xy(center, angle_deg, radius)  # → [x, y] point on circle
rotate(xy, deg, anchor)              # rotate point around anchor
normalize(v)                         # unit vector
distance(A, B)                       # Euclidean distance
transform(xy, rotate, scale, translate, anchor)  # combined affine transform
```

### `looom.py` — Looom animation SVG parser

Looom (iOS app) exports animations as SVGs with CSS custom properties per thread. `looom.py` re-implements the CSS animation logic in Python to extract a single static frame for PDF embedding.

```python
from portfolio.berthe.berthe.looom import is_looom_svg, looom_frame_to_png

is_looom_svg(path)                          # → bool: is this a Looom SVG?
looom_frame_to_png(svg_path, output_path,   # render one frame to PNG via Inkscape
    frame=0,    # explicit frame index (takes priority over time:)
    time=0.0,   # time in seconds
    margin_frac=0.10, width=800)
```

In `:::wrapfig` blocks, use `frame: 0` or `time: 2.5` keys to control which frame is extracted.

### How `elements.py` uses Berthe for the label page

`portfolio/elements.py` uses Berthe to generate the portfolio's first-page label SVG (gallery cover sheet). Key functions:

```python
from portfolio.elements import label

label(gallery_name, top_left=[10,10], size=(90, 50), scale=1.0, for_name=None)
# Returns (grp_label_black, grp_label_red) — two Groups for the label design
# Uses: rays_pattern(), ripple_pattern(), Path, Line, Rectangle, Polyline, Circle, polar2xy
```

- `rays_pattern(sun_center, width, height, press)` — alternating dense/sparse ray lines from a center point
- `ripple_pattern(center, width, height, max_ripple)` — exponentially expanding concentric rings
- Label outputs two colour layers (black + red) as separate SVG groups, suitable for two-colour pen plotting or PDF overlay
- Final SVG is saved to `portfolio/label_output.svg` then converted to `portfolio/label_output.pdf` (via `rsvg-convert` or `inkscape`) for inclusion as `%%LABEL_PAGE%%` in the template

---


## Practice: Threads, Motifs, and Personal Mythology

### The Through-Line

Patricio González Vivo makes instruments of attention and wonder. Not metaphorical ones — actual instruments: plotters, satellite feeds, depth sensors, shaders, astronomical libraries, tarot decks. Each is built to make present what ordinary perception has filtered out, at scales from the cosmic (the solar system, the star field, the rotating planet) to the ecological (the ash that records geological force) to the human face. The through-line from 2010 to 2026 is not medium — the work moves freely between oil and code, ash and satellite, shader and canvas — but question: *what does it take for an artifact to develop presence?*

**Three gestures that recur across every major work:**

**1. Restoration of filtered perception.** Something real has been removed — city light erased the stars (ESTRELLAS), satellite filters stripped the atmosphere's glow (HOGAR), urban life made the moon an illustration (LUNA), the plotter reduces the face to skeleton before the hand arrives (Hybrids, Memories, Santos). The work restores what was removed, or exposes the skeleton, or makes the absence the subject.

**2. The mark as presence.** A mark is indexical: a causal trace of something that was here. The plotter's line, the hand in the ash, the shadow that ripples back, the code that generates the image, the trails that planets leave across the year. Every mark in this practice carries the same question: *whose presence is recorded here, and what did it cost?* The great-grandmother who burned her poems inverted this — an anti-mark, an erasure. The Santos series is restoration against that specific burning.

**3. Two systems on one surface.** The strongest works hold two incompatible knowledge systems simultaneously without resolving them: code and tarot (PixelSpirit), astronomy and astrology (Astros), machine precision and human presence (Hybrids/Santos), intimate home and planetary home (HOGAR), migration story and star map (Weaver), English and Spanish (HEARTH/HOGAR). The irresolution is the content — and it is often in that contact between two systems that presence develops.

### The Personal Mythology

The works form a personal mythology around a single question: *what does it take for an artifact to develop presence?*

The practice traces a threshold that runs through every medium. A plotter drawing alone is a diagram; completed by hand, it becomes something that addresses you like a face. Satellite data alone is an instrument; with its atmospheric scattering restored, it becomes a planet that looks alive and breathable. Stellar coordinates alone are data; tied to a family migration and shared between two people, they become a connection that outlasts the screen. Volcanic ash alone is material; holding the consequence of every hand that shaped it, it becomes something that persists and responds.

The question is always the same: *what does it take for an artifact to develop presence?* The systems change — machine and hand, code and gesture, data and imagination, migration and sky — but the question persists.

Personal stakes running through the work: parenting (LUNA, HOGAR), family migration (Weaver, Guayupia, Santos), Argentine/immigrant identity (HOGAR, Efecto Mariposa, Santos), and a consistent pedagogy — building open tools for others to develop their own sense of presence (Book of Shaders, PixelSpirit, LYGIA, Vera, Shell Initiation).

---

## Projects: Statement Status and Context

🟢 = strong and complete · 🟡 = functional but has a named gap · 🔴 = empty, press-release, or full rewrite needed

**Drawing machines / hybrid painting**
- `2014/skylines` 🟡 — Foundational thesis essay with curatorial summary already at top. Two broken Flickr image embeds remain (lines 39 and 67); not a priority.
- `2025/hybrids` 🟢 — "I write the code and I hold the brush." Strong. Could name medium/scale.
- `2025/gestures` 🟢 — Written. Opens with the plotted/painted body contrast; distinguishes from Hybrids; hands as self-referential subject. Complete.
- `2025/memories` 🟢 — Best statement in the collection. Opens with "What we retain of those we love, and what we lose." Barthes punctum closes it. Complete.
- `2026/santos` 🟢 — Strong. The `<div class="spacer">` block references `refs/okeeffe_*.jpg` — if those files exist Chrome renders them as a PNG in the PDF; if absent it renders blank. Move to `index.php` if website-only. Closing sentence updated to return to the great-grandmother/burning image.

**Astronomical instruments**
- `2017/luna` 🟢 — *Goodnight Moon* / Brooklyn opening. Full lineage to Hypatia named. Complete.
- `2018/estrellas` 🟢 — "The stars have not gone anywhere." Hypatia credited. Complete.
- `2018/orbitas` 🟡 — Functional but superseded by orbitas2. Consider framing as "the earlier version" or retiring it from portfolio use.
- `2019/hogar` 🟢 — Second birth / nesting opening. GOES satellite and atmospheric scattering restoration named. Complete.
- `2025/orbitas2` 🟢 — Pale blue dot / scale meditation / camera journey. Complete.
- `2025/weaver` 🟡 — Feature-list; superseded by weaver2. Frame explicitly as "the earlier iteration."
- `2026/weaver2` 🟢 — Family migration opening (Irish-Argentine lineage). Complete.
- `2026/astros` 🟢 — Two incompatible knowledge systems. Complete.

**Ecological / participatory systems**
- `2010/communitas` 🟢 — Has personal motivation sentence. Complete.
- `2011/efectomariposa` 🟢 — Puyehue opening / asymmetry of destruction vs. life / the trap framing. Complete.
- `2012/shadows` 🟢 — Visual behavior described (lingers, fades, layers); large projected surface noted; shadow-play lineage kept. Complete.

**Memory and digital materiality**
- `2021/memory` 🟢 — "Not an archive but a living instability." Could add one sentence naming the actual RAM/energy cost to ground the political dimension.
- `2022/time` 🟡 — Visual sentence added (trails, dense/turbid, duration as weight). Series structure named but specific emotional states per piece are not named yet; Patricio should fill those in if each piece has a distinct title/emotion.

**Migration and cartography**
- `2017/guayupia` 🟢 — Rewritten as a "we" voice statement (Jen Lowe collaboration). Curatorial summary at top. Research notes and bibliography are in `NOTES.md`. Complete.

**Computation as education / open tools**
- `2017/pixelspirit` 🟢 — Light as main theme / prismatic tarot / code as archetypal DNA. Complete.
- `2014/pointcloudcity` 🔴 — Link list only. Write: what point clouds do to the experience of a familiar place.
- `2014/advanceGL` 🔴 — Technical log only. Frame as: the R&D sketchbook that made ESTRELLAS and Hybrids possible.
- `2016/openFrame` 🔴 — Relies on broken external embeds. Write: OpenFrame platform, Jon Wohl + Ishac Bertran collaboration, the shader genre taxonomy.

**NFT / blockchain / ecological cost**
- `2021/fen` 🟢 — "Intensification and extraction are the same gesture, performed simultaneously." Cut the soft final "birds in open flight" metaphor — end on that line.
- `2023/blink` 🟢 — Vanitas + NFT market impermanence. The self-reflexive transaction layer is present. Complete.

**Collaborative / early work**
- `2013/clouds` 🟡 — Credits page; Patricio's specific creative contribution is one sentence. Write a paragraph about the experience of translating interview ideas into generative visual systems.
- `2014/atramentum` 🟡 — Press release tone. Write: Patricio's specific GLSL contribution, why optical flow + fluid sim was the right language for that space.
- `2010/calos` 🟡 — Expressive arts for children, Korean community in Buenos Aires. Short documentation, not a statement.
- `2013/lumiere`, `2013/autilus`, `2013/rio`, `2013/naturalintentions`, `2013/avsys` 🔴 — All empty. Low portfolio priority; minimum one-sentence context each.

---

## Communication Strategy

### The Unifying Frame

For curators, gallerists, and grant applications, the practice can be introduced in one sentence: *Patricio González Vivo builds instruments of attention and wonder — plotters, satellite feeds, shaders, astronomical libraries — that ask a single question through every medium: what does it take for an artifact to develop presence?*

This holds the full range: the portrait that begins as a machine drawing and develops into a face that addresses you; the satellite visualization that restores what the sensor stripped and becomes a planet that looks alive; the celestial map that connects two people across time and becomes a shared sky; the volcanic ash that holds the consequence of every gesture made in it.

### Three Entry Points by Curatorial Context

**Ecological / contemplative** (environmental programs, climate commissions, mindfulness contexts):
Lead with Efecto Mariposa + ESTRELLAS + HOGAR + ORBITAS. Common thread: *we cannot act responsibly toward what we cannot feel at scale.* Efecto Mariposa is the strongest single work for this context — it makes ecological consequence physical and immediate.

**Technology / digital art** (media art festivals, digital galleries, code-based or new media contexts):
Lead with Hybrids or Santos + PixelSpirit + BLINK + Flight Studies. The work as dialogue between computation and craft — algorithm and hand, digital impermanence and physical permanence, the language of light made learnable and material.

**Personal / narrative / Latin American identity** (diaspora-focused, identity, immigrant experience):
Lead with Weaver + LUNA + HOGAR + Santos + Guayupia. The practice as personal mythology of family migration (Irish-Italian-Argentine lineage), parenting and place, the Argentine inheritance of making under cultural pressure.

### Portfolio Sequencing Logic

Anchor any curated selection around one thread; include one work from a contrasting thread to show range.

- **Drawing machines arc**: Skylines → Hybrids → Memories → Santos (12-year development, thesis to mature practice)
- **Astronomical instruments arc**: LUNA → ESTRELLAS → HOGAR → Weaver (personal motivation → cosmic scale → family migration)
- **Dual registers arc**: PixelSpirit → Astros → Hybrids → Santos (two-system logic across very different media)

For a first meeting with a curator: lead with the most recent work in the primary thread, then show one work that crosses into a different thread to establish range. The goal is for them to ask: *what is the oldest piece that shows this sensibility?*

---

## Thematic Map

| Thread | Key works | Core question |
|--------|-----------|---------------|
| Drawing machines / hybrid painting | Skylines (2014) → Hybrids (2025) → Gestures (2025) → Memories (2025) → Santos (2026) | What can the machine free the hand to do? |
| Astronomical instruments | LUNA (2017) → ESTRELLAS (2018) → Orbitas (2018/2025) → HOGAR (2019) → Weaver (2025–2026) → Astros (2026) | How does the sky make us aware of our place in time? |
| Ecological / participatory systems | Communitas (2010) → Efecto Mariposa (2011) → Sombras (2012) | How does collective action cascade beyond its visible scale? |
| Memory and digital materiality | Memory Studies (2021) → Time (2022) → Memories (2025) | What is the texture of remembering? |
| Migration and cartography | Guayupia (2017) → Weaver (2025–2026) | How do maps carry the experience of displacement and longing? |
| Computation as education / open tools | Skylines (2014) → Book of Shaders (2015) → PixelSpirit (2017) → LYGIA (2021) → Vera (2022) | What happens when the tool is also the teaching? |
| NFT / blockchain / ecological cost | Flight Studies (2021) → Memory Studies (2021) → BLINK (2023) | What does digital circulation cost, and who bears it? |

---

## Artist Statement Style Guide

Extracted from validated writing sessions across this collection. Apply when writing or reviewing any project README.

### Opening patterns — choose one

- **Historical specificity**: A specific date, name, or event that carries the work's stakes ("On Saturday June 4, 2011…"; "In the middle of the nineteenth century…")
- **Cultural observation**: A custom, tradition, or practice the work extends or questions ("In Latin America, it is common to receive the name of the saint…")
- **Conceptual metaphor**: A physical or structural image that unlocks the work's logic ("A prism doesn't change the light. It reveals what was already inside it.")
- **Declarative claim**: A short counter-intuitive sentence the work goes on to prove ("Memory is not a recording. It is a reconstruction.")

Never open with: "This work…", the piece's own name in the first sentence, "explores themes of", "invites the viewer to", or any sentence that could appear in another artist's statement.

### Structure

1. **Conceptual key** — the metaphor, claim, or story that unlocks the work's logic
2. **Pivot line** — a short sentence bridging the opening to the work itself ("The same ash is the surface of this work.")
3. **What the work is** — physical description, medium, what it feels like to encounter
4. **The structural tension** — every strong statement names a paradox, two registers, or two time scales in conflict (machine/hand; code/image; invitation/consequence; destruction/life)
5. **Why that tension matters** — what it produces in the viewer, what it proposes
6. **Lineage** — connect to earlier works; name the thread this extends
7. **Closing** — must return to the opening metaphor or a concrete physical image; never generic; often the most specific sentence in the piece

### Voice rules

- First person when personal stake is present; third person for installation descriptions where the visitor is the subject
- Intimate but precise — "I" without apology
- Mix long rhythmic sentences with short declarative ones for contrast and rhythm
- Semicolons and em-dashes preferred over commas for complex clauses

### What to avoid

- "Explores themes of…" — name the specific theme instead
- "Invites the viewer to…" — describe what the viewer actually does or experiences
- "Bridges X and Y" — name the specific tension or structural kinship instead
- "Transcend boundaries / connect us to something beyond" — failure endings; return to something concrete
- Generic closings — the last sentence should be the most specific in the piece
- Instructional "how to use" language — belongs in documentation sections, not the statement

### The stranger test

If a sentence could appear word-for-word in another artist's statement, it fails. Every sentence must be traceable to *this* work, *this* artist, *this* specific tension. Test each sentence by asking: could I swap in a different artist's name and have it still ring true? If yes, rewrite.

### Technical description

Process appears once it illuminates meaning — never as a feature list, never before the conceptual frame is set. Describe *what the medium does*, not *what it is*.

### The asymmetry principle (for time-based and ecological works)

When a work involves multiple time scales or response rates, name them explicitly and make the asymmetry the subject rather than a technical note. The disproportion between cause and consequence is often the meaning.
