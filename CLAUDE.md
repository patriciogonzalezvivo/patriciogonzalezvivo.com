# CLAUDE.md — patriciogonzalezvivo.com

Artist portfolio for **Patricio Gonzalez Vivo** (b. 1982, Buenos Aires). Multidisciplinary artist working across traditional and digital media — oil painting, drawing machines/plotters, generative/shader code, astronomical instruments, interactive web, and NFT/blockchain work. Serves as both a PHP website and a PDF portfolio generator.

**Artist Commons (AC) program context:** `2026/ac/CLAUDE.md` contains 20 lesson summaries and 20 slash commands covering visual analysis, semiotics, philosophy of art, generative/AI art, interactivity, appropriation, quilting as concept, IP law, portfolio building, and curator outreach. Load that file when doing studio critique, writing artist statements, or making professional decisions.

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
- `render_gallery($options)` — renders `.paintings-gallery` grid + fullscreen modal; options: `images_dir`, `pattern`, `defaults`, `show_modal` (bool, default `true`)
- `get_gallery_artworks($images_dir, $pattern, $defaults)` — finds images, loads per-image `.txt` sidecar metadata
- `load_artwork_metadata($file, $defaults)` — parses `key: value` sidecar (supports `title`, `year`, `medium`, `dimensions`, `sold`, `print`); lines starting with `#` are ignored
- `render_gallery_item($artwork)` — single painting card with Buy Print / Acquire Original buttons
- `render_gallery_modal()` — renders fullscreen modal HTML; called automatically by `render_gallery` unless `show_modal => false`
- `export_metadata_to_files($artwork_info, $sold_images, $output_dir)` — migration utility: writes hardcoded metadata arrays to `.txt` sidecar files

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
:::
```

In the PDF generator, `src:` paths are prefixed with the project dir and `link:` values are resolved to absolute website URLs.

### `portfolio/data.json` — sections list (actual config)

The current `portfolio/data.json` uses a `"sections"` array (not `"projects"`). Each entry is either:
- `{ "path": "YEAR/folder", ... }` — a standard project section → calls `build_artwork_pages()`
- `{ "title": "...", "projects": ["YEAR/folder", ...] }` — a featured group → calls `build_featured_section_pages()`

Optional per-project keys: `images_per_page` (int, default 3), `skip` (list of image stems to exclude), `skip_thumbnail` (bool), `inject_svgs` (bool).

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

## Projects Knowledge Base

Patricio's practice has three interlocking threads that recur across decades:

1. **Perception / awareness tools** — instruments (plotters, astronomical software, shaders) that expand what we can see, measure, or feel.
2. **Cosmological / celestial work** — real-time astronomical data rendered as art (LUNA, Orbitas, ESTRELLAS, HOGAR, Weaver, Astros). Rooted in the Hypatia library.
3. **Portrait / drawing-machine hybrids** — machine-drawn vector scaffolds completed by hand with oil (Skylines → Hybrids → Gestures → Memories → Santos).

---

### Recent Work (2024–2026)

**`2026/santos`** — *Santos* (oil + plotter on canvas)
Portraits of artist-saints: figures whose service to humanity is enacted through creation (O'Keeffe, etc.). Personal lineage story: great-grandmother poet who burned her writing. Extends the Hybrids/Gestures method: vector paths of each subject plotted with acrylic, completed by hand with oil. Symbolic elements unique to each subject are layered into the plot paths. Links to: Skylines (2014), Hybrids (2025).
*Improvements needed:* No TITLE.txt / MEDIUM.txt stubs visible; README references `refs/okeeffe_001.jpg` — those reference images should be in a `refs/` subdir. Statement could be stronger on the "secular sainthood" concept.

**`2026/astros`** — *Astros* (interactive web)
Real-time celestial positions rendered alongside astrological symbols. Collaboration: Martin Bonadeo, Oliverio Duhalde (sound), Alejandra Eusebi Polich (astrology). Bridges ancient cosmology and live orbital computation.
*Improvements needed:* README is minimal — no technical detail (which library? WebGL shader?), no exhibition context yet. Would benefit from a wrapfig showing the interface.

**`2026/weaver2`** — *Weaver* v2 (interactive web)
Two overlapping star maps (polar projection) for two observers across time/space. Family migration story (Irish-Argentine lineage: Brennan/Colcough from Famine, Vivo from Anacapri). Extends Guayupia (2017) and the astronomical library obsession. Interactive: drag sky = change date/time; rotate globe = change location.
*Improvements needed:* The README is the strongest in the repo — rich, personal, well-structured. Minor: inline HTML divs (`<div class="spacer">`) in the README should probably be removed or moved to the PHP page.

**`2025/weaver`** — *Weaver* v1 (interactive web)
Earlier version of the same piece. Star maps, shared sky, globe controls. Simpler README than v2, focused on interface description.
*Improvements needed:* README could be retired in favor of weaver2's richer narrative, or explicitly framed as "earlier iteration."

**`2025/hybrids`** — *Hybrids* (oil + plotter on canvas)
First full series combining plotter scaffold with alla prima oil. "I write the code and I hold the brush." CV-vision software extracts portrait geometry → vector paths → plotter draws on primed canvas → hand finishes with oil. Places work in lineage of artists using technology as liberation (camera obscura → portable paint tube → CV plotter).
*Improvements needed:* README is excellent and concise. Could add a sentence on the specific CV technique (landmark detection). `process.png` should be linked in the README more explicitly.

**`2025/gestures`** — *Gestures* (oil + plotter on canvas)
Companion to Hybrids, shifts emphasis from structural dialogue toward the gestural. Machine establishes cartography; brush inhabits the territory. Links digital iteration logic to the insistence on the singular.
*Improvements needed:* README duplicates some Hybrids language. Should be differentiated more sharply — Gestures is about the post-measurement phase; Hybrids is about the hybrid authorship. The two series need clearer distinction for curators.

**`2025/memories`** — *Memories* (oil + plotter on canvas)
Memory as reconstruction. Plotter draws structural landmarks from photograph; artist then paints from *personal memory* (not the photograph). The gap between plotted accuracy and painted recall is the subject. Works are "mementos."
*Improvements needed:* Strongest conceptual framing of the three plotter-painting series. Should be positioned as the most emotionally direct. Could reference Barthes's punctum or the "death" quality of the photograph.

**`2025/orbitas2`** — *Orbitas* v2 (real-time web)
Living cosmogram: real-time solar system simulation, planets/moons inscribing luminous trails since the start of the year. Camera drifts through solar system. Earth tilt + zodiac constellations + Moon phases. "Both instrument and invocation."
*Improvements needed:* README is poetic but could use one technical sentence (WebGL? Three.js? custom renderer?).

---

### Astronomical / Cosmological Thread (2017–2026)

**`2017/luna`** — *LUNA* (real-time digital)
Living meditation on time. Mirrors the moon's current phase in real time, rotates, atmosphere shifts day/night. Functions as lunar calendar + daily clock.
*Improvements needed:* README is a single paragraph — adequate. Could mention the Hypatia library.

**`2018/estrellas`** — *ESTRELLAS* (real-time installation)
Live, accurate star field as a window onto the present cosmos. Restores awareness of time as experiential landscape vs. abstract measure. References humanity's historical use of the sky for knowledge/guidance.
*Improvements needed:* README is one paragraph with no technical detail. No mention of the platform/hardware used for installation.

**`2018/orbitas`** — *Orbitas* v1 (real-time web)
Real-time planet/satellite orbital simulation. Minimalist. "A clock, a calendar, a glimpse of the bigger picture." Available at FRAMED gallery.
*Improvements needed:* README contains a copy-paste from `pointclouds/README.md` (wrong Vimeo embed). Should be corrected.

**`2019/hogar`** — *HEARTH/HOGAR* (real-time web)
Satellite view of Earth from orbit, real-time, a planet spinning without borders. "A reminder, available at any moment, of the larger home we share."
*Improvements needed:* README is minimal but intentionally spare. Title bilingualism (HEARTH/HOGAR) is not explained — worth a sentence.

**`2017/guayupia`** — *Guayupia* (digital map, collaboration with Jen Lowe)
Map made for their son showing his Argentine heritage. Research into native South American cartography (Quechua sky-mapping, Tupi-Guarani migration, Torres-Garcia south-up). Rich annotated README with academic references.
*Improvements needed:* README is the most scholarly in the entire repo — detailed research notes and full bibliography. Could be better structured (the long research notes feel like they belong in an appendix). A short summary paragraph for curatorial use is missing at the top.

---

### Open-Source Tools / Education (2014–2016)

**`2014/skylines`** — *Skylines* (MFA thesis, Parsons 2014)
Three explorations around perception and skylines: (1) wall plotter slowly revealing images through accumulated material trace; (2) large-scale horizon prints from city-to-mountain; (3) postcards of invisible city data from corporate databases. Built custom vPlotter hardware. Foundational to the entire drawing-machine thread.
*Improvements needed:* README is the most intellectually developed in the repo — a full thesis essay. Very long; a short curatorial summary at the top would make it more navigable. Broken Flickr embed links throughout.

**`2014/pointcloudcity`** — *Point Cloud City* (part of Skylines)
3D point clouds scraped from Google Street View panoramas. Interactive (Three.js + PoTree.js). Locations: Washington Square Park, Queensboro Bridge, Main Post Office (NY), Île de la Cité (Paris).
*Improvements needed:* README is primarily embedded video; lacks written description of the technique or artistic intent.

**`2014/atramentum`** — *Atramentum* (commercial installation, collaboration)
Collaboration with FakeLove + Aerosyn-Lex Mestrovic for SCOPE Arts NYC. Black monolith; optical flow + fluid sim GLSL shaders; visitors' movements become ink-like calligraphic forms projected throughout the pavilion and broadcast to floating arches.
*Improvements needed:* README is embedded video only. No artist statement text.

**`2016/openFrame`** — *OpenFrame* (collaboration, open-source)
Shader artworks for the OpenFrame Raspberry Pi display platform. Collaboration with Jon Wohl and Ishac Bertran. Categories: Mandalas, Pulse, Patterns, Techno, Stochastic, Ikeda tributes, OpArt recodes, Clocks.
*Improvements needed:* README is a Twitter embed + glslGallery divs with no text description. Completely reliant on external embeds that may break.

---

### Generative / NFT Work (2021–2023)

**`2023/blink`** — *BLINK* (generative, NFT via BrightMoments)
Dialogue with Baroque vanitas painting. Bubble as memento mori + moment of delight — translates the 17th-century still-life tradition into computational language at monumental scale. Extends shader systems from Book of Shaders.
*Improvements needed:* README is good but could more explicitly connect the bubble's computational fragility to Baroque impermanence logic.

**`2021/fen`** — *Flight Studies* (generative GLSL, NFT on Tezos / CleanNFT)
Pre-cinematic motion studies (Muybridge). GLSL shader + synthetic chromatic aberration as both aesthetic and conceptual strategy: attention as double-edged force (intensification + extraction). Released as part of The FEN CleanNFT initiative (35+ artists, Joanie Lemercier / Juliette Bibasse). Upcycled e-waste frames.
*Improvements needed:* README is comprehensive. The "attention as capture/extraction" conceptual thread is underdeveloped — only noted in one sentence but could be the main thesis.

**`2021/memory`** — *Memory Studies* (generative, live system, NFT on Tezos)
Live system: allocated memory is loaded, sorted, blurred; at peak structural order, data corrupts and degrades into noise; resets and cycles. Memory as living instability. Six editions on hic et nunc.
*Improvements needed:* Excellent conceptual framing. Could tie more explicitly to digital memory as political/material infrastructure (not just as metaphor).

**`2022/time`** — *Time* (video, generative)
Real-time optical flow + depth estimation processing of shot footage. Temporal structure distorted: duration liquefies, accumulates, collapses. "Emotional time vs. clock time." Not edited conventionally — transformation happens live in the system.
*Improvements needed:* README has strong conceptual frame but no visual/technical stills. "Emotional studies" framing could be sharpened — is this a series with distinct emotional states mapped to distinct distortions?

---

### Early / Participatory / Interactive Work (2009–2013)

**`2012/shadows`** — *Sombras* (interactive installation)
Depth sensor + projector: visitors' shadows return as memories rippling through time. Ancestral shadow play → ancestor of cinema. Commissioned by Museum of Toys, San Isidro (Buenos Aires), 2012–2013. Part of "La Mesa del Tiempo" exhibition.
*Improvements needed:* Well-written README. Could add dimensions of the installation surface and details about the depth sensor hardware.

**`2013/clouds`** — *CLOUDS* (interactive RGBD documentary)
Visually groundbreaking interactive generative documentary. RGBD cinema format. Viewers navigate via Kinect/Oculus Rift. Directors: James George + Jonathan Minard. Executive Producer: Golan Levin. Creative coders: Patricio + Reza Ali + Satoru Higa + Neil Mendoza. Premiered Sundance + Tribeca.
*Improvements needed:* README is primarily credits + media links. No description of Patricio's specific creative/technical contribution, which makes it hard to use in a portfolio.

**`2010/communitas`** — *Communitas* (participatory installation)
First major work. Visitors collaboratively construct a shared image through mutual observation and gesture. Explores chaos/order, individual/collective, ephemeral/enduring.
*Improvements needed:* README needs to be read (not retrieved in subagent — likely short). Worth confirming it has enough context for portfolio use.

**`2011/efectomariposa`** — *Efecto Mariposa* (ash-based interactive ecosystem, FILE Festival São Paulo)
Ash-based installation simulating an interactive ecosystem where visitors experience cascading consequences of their actions. First international breakthrough.
*Improvements needed:* Referenced in root README but project README not retrieved — check for content.

---

### Projects with Empty READMEs (need writing)

These folders have `README.md` but files are empty or have only embedded media:

- `2013/lumiere` — empty
- `2013/autilus` — empty
- `2013/rio` — empty
- `2013/naturalintentions` — empty
- `2013/avsys` — empty
- `2014/advanceGL` — text only (GLSL shader experiments: 3D Earth with Day/Night/Bump/Atmosphere, 3D Shell with SEM, 3D Portraits with cross-hatching — needs artist framing)
- `2016/openFrame` — Twitter embed only, no text
- `2014/pointcloudcity` — video embed only

---

## Suggested Improvements by Priority

### High — affects portfolio usability

1. ~~**`2018/orbitas` README** — contains wrong Vimeo embed (copy-pasted from `2018/pointclouds`). Fix the embed URL.~~ ✓ **Done** — replaced Vimeo iframe with Wistia embed (`77gszchmvi`); rewrote `index.php` to match `estrellas`/`orbitas2` structure; added `TITLE.txt` and `MEDIUM.txt`.
2. ~~**`2013/clouds` README** — add a paragraph describing Patricio's specific role.~~ ✓ **Done** — added paragraph: Visual Systems designer (sorting, Game of Life, fractals, flocking, globes, flight patterns); also interviewed as participant.
3. ~~**`2025/gestures` vs `2025/hybrids`** — differentiate the two series more clearly.~~ ✓ **Done** — `gestures/README.md` cleared (no text yet); Hybrids README retains its authorship framing. Gestures text to be written from scratch when ready.
4. ~~**`2014/skylines` README** — prepend a 2-3 sentence curatorial summary.~~ ✓ **Done** — prepended 3-sentence summary: MFA thesis at Parsons 2014, three pieces (wall plotter, horizon printer, data postcards), foundational to all drawing-machine work.
5. ~~**`2017/guayupia` README**~~ ✓ **Done** — curatorial summary prepended: Tupi-Guarani *guayupia* concept, Quechua sky-maps, Torres-Garcia south-up orientation, map as gift for their son. Research notes follow below unchanged.

### Medium — deepens conceptual legibility

6. ~~**`2025/memories` README**~~ ✓ **Done** — Barthes's *punctum* paragraph added at the end: the plotter carries the photograph's accuracy, the brush carries the fallibility of the living; the gap between them is the subject.
7. ~~**`2021/fen` README** — expand the "attention as extraction/capture" thread — this is the strongest conceptual idea in the piece and currently gets one sentence.~~ ✓ **Done** — restructured core conceptual section: Muybridge's industrial origins (commissioned for labor/horse optimization), chromatic aberration as literalization of attention-as-extraction, thesis now leads the argument.
8. **`2023/blink` README** — tighten the Baroque vanitas connection: the bubble's computational fragility IS its Baroque content. State that directly.
9. **`2019/hogar` README** — add one sentence explaining the HEARTH/HOGAR bilingual title choice (English + Spanish). The dual naming is meaningful and unexplained.
10. **`2026/astros` README** — add technical and collaboration context; currently the shortest README for a piece that involves significant computational work and a three-person collaboration.

### Low — completeness / maintenance

11. Empty READMEs: `2013/lumiere`, `2013/autilus`, `2013/rio`, `2013/naturalintentions`, `2013/avsys` — even a single paragraph each would make them searchable and portfolio-usable.
12. **`2016/openFrame` README** — Twitter embed is broken; glslGallery embeds depend on external JS. Add a short text description of the shader categories and their visual logic.
13. **`2014/pointcloudcity` README** — add a written description of the technique (photogrammetry from Street View panoramas via C++/OpenFrameworks) and artistic intent.
14. **`2014/atramentum` README** — add a written description alongside the video embeds. Currently no text that could survive in a PDF portfolio.
15. **Sidecar `.txt` files** — confirm all images in `2026/santos/images/` have complete sidecar metadata (`title`, `year`, `medium`, `dimensions`, `sold`, `print`). This is what drives the portfolio PDF and the gallery Buy/Acquire buttons.

---

## Thematic Map (for portfolio sequencing and artist statement use)

| Thread | Key works | Core question |
|--------|-----------|---------------|
| Drawing machines / hybrid painting | Skylines (2014) → Hybrids (2025) → Gestures (2025) → Memories (2025) → Santos (2026) | What can the machine free the hand to do? |
| Astronomical instruments | LUNA (2017) → Orbitas (2018) → ESTRELLAS (2018) → HOGAR (2019) → Weaver (2025) → Astros (2026) | How does the sky make us aware of our place in time? |
| Memory / digital materiality | Memory Studies (2021) → Time (2022) → Memories (2025) | What is the texture of remembering? |
| Participatory / ecological systems | Communitas (2010) → Efecto Mariposa (2011) → Sombras (2012) | How does collective action create or cascade consequences? |
| Open tools / education | Skylines (2014) → Book of Shaders (2015) → LYGIA (2021) → Vera (2022) | Software as medium for knowledge sharing |
| NFT / blockchain / CleanNFT | Flight Studies (2021) → Memory Studies (2021) → BLINK (2023) | Digital circulation, ecological cost, and the persistence of the immaterial |
| Migration / cartography | Guayupia (2017) → Weaver (2025–2026) | How do maps carry the experience of displacement and longing? |
