# CLAUDE.md: patriciogonzalezvivo.com

Artist portfolio for **Patricio Gonzalez Vivo** (b. 1982, Buenos Aires). Multidisciplinary artist working across oil painting, drawing machines/plotters, generative and shader code, astronomical instruments, interactive web, and NFT/blockchain work. The repo is three things at once: a PHP website, a PDF portfolio generator, and the build pipeline for the *Medium* mint (`2026/medium/mint/`).

**Artist Commons (AC) program:** `2026/ac/CLAUDE.md` indexes 33 lesson summaries and 29 slash commands (visual analysis, semiotics, analytic and continental philosophy of art, generative/AI art, interactivity, appropriation, quilting, IP law, portfolio, curators, collectors, pricing, text in art, writing and revising statements, originality and authorship, portraying society, photography and evidence). Load it for critique, statements, and professional decisions. The commands live in `.claude/commands/`; the three written specifically for this practice are:
- `/review-statement`: reviews and revises the statement for one project (folder path or `.md` path as argument).
- `/gallery-strategy`: concrete plan for approaching curators and galleries, rooted in community presence over cold networking.
- `/build-portfolio`: assembles a curated portfolio for a specific audience; every decision starts from "what do I want them to decide after five minutes with this work?"

---

## Running the project

```bash
make server        # php -S localhost:8000
make portfolio     # build the PDF (template + JSON) and open it
make deploy-dry DEPLOY_HOST=user@host   # rsync preview; `make deploy` to push
```

```bash
python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json
python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json --latex-only   # .tex only
python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json --keep-temp    # keep temp_portfolio/
python generate_portfolio.py ... -o name.pdf          # explicit output name
python generate_portfolio.py -p projects.txt -o x.pdf  # legacy: one year/folder per line, no template
```

Dependencies: PHP built-in server; `xelatex` (`brew install mactex`); `rsvg-convert` or `inkscape` for SVG to PDF; headless Chrome for raw HTML blocks in READMEs (skipped with a warning if absent).

---

## Project folder structure

Each artwork lives at `YEAR/project_name/` with flat-file metadata:

```
YEAR/project_name/
  TITLE.txt  MEDIUM.txt  DESCRIPTION.txt  DIMENSIONS.txt   # display metadata
  YEAR.txt                 # optional year override (defaults to folder year)
  README.md                # long-form statement (also the PDF text)
  thumb.{webm,gif,jpg,png} # listing thumbnail (first match wins)
  thumbnail.{jpg,jpeg,png} # larger thumbnail for big_thumbnail type and the PDF title page
  index.php                # project page
  images/                  # gallery images; thumbnails/, detail/, installation/ optional
    IMGNAME.txt            # sidecar: title, year, medium, dimensions, sold, print, skip
  svg/                     # SVGs (auto-converted to PDF for LaTeX)
```

---

## PHP website

Shared helpers live in `server/` (`project_meta.php`, `header.php`, `menu.php`, `footer.php`, `gallery.php`, `slideSet.php`, `objkt.php`, `year_index.php`, Parsedown). Root `.php` files are page controllers. Every page: `project_meta.php`, set `$page_title`/`$og_image`, `header.php`, `menu.php`, content, `footer.php`. `?embed=1` hides menu, footer and item info (used by `live` iframes).

- `get_project_meta($path, $base='')`, `get_current_project_meta()`, `render_project_item()`, `list_all_projects()`, `set_random_og_image()` (call before `header.php` on listing pages).
- `render_gallery($options)` (`images_dir`, `pattern`, `defaults`, `show_modal`) renders the painting grid and fullscreen modal; per-image `.txt` sidecars supply title, year, medium, dimensions, `sold`, `print` (Buy Print / Acquire Original buttons).
- `render_slideset($options)` / `slideset($dir, $style)` render `js/slideSet.js` slideshows.
- `header.php` emits Open Graph and Twitter cards, auto-detects `$og_image` from `thumbnail.*`/`thumb.*`, loads fonts, `css/style.css` and analytics (not in embed mode).

Homepage entry types in `index.php`: `thumbnail` (default), `big_thumbnail` (`width`, `height`), `live` (iframe with `?embed=1`), `gallery` (`images_dir`, `pattern`). Metadata overrides for external works: `['path'=>..., 'url'=>..., 'title'=>..., 'year'=>..., 'medium'=>...]`.

Project `index.php` pattern:

```php
<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    include("../../server/header.php");
    include("../../server/gallery.php");
    include("../../server/menu.php");
    echo render_gallery(['images_dir' => 'images', 'pattern' => 'DSF*.jpg']);
    /* ParsedownExtended renders README.md inside <div id="longer-info"> */
    include("../../server/footer.php");
```

For related works inside a project page, pass `'../../'` as base to `get_project_meta()` and prepend `'../../'` to the returned path.

---

## Python portfolio generator

```
generate_portfolio.py     # CLI entry point
portfolio/
  metadata.py     # flat files -> project dict; readme_to_latex()
  latex_builder.py# populate_template(): %%PLACEHOLDER%% substitution, section dispatch
  pages.py        # per-artwork pages, featured groups, divider pages
  sections.py     # bio, statement, CV/exhibitions/talks/press
  images.py       # image discovery, render plan (groups portraits by medium+dimensions)
  elements.py     # first-page label SVG (berthe)
  html_render.py  # raw HTML blocks -> PNG via headless Chrome
  compiler.py     # xelatex twice from the workspace root, then copy the PDF
  utils.py        # escape_latex, markdown_to_latex, find_thumbnail
  legacy.py       # no-template document builder
  template.tex    # A4 landscape, XeLaTeX, Montserrat from portfolio/montserrat/
  data.json       # artist info + sections for the current PDF
  berthe/         # vector drawing submodule (has its own README)
```

### `portfolio/data.json`

`artist` block: `name, email, website, instagram, phone, location, logo, bio_file` plus optional `artist_statement_file, avatar_file, cv_file, exhibitions_file, talks_file, press_file`. (`artist_statement.md` is **not** wired in right now; add `"artist_statement_file": "artist_statement.md"` to include it.)

`sections` (the legacy key `projects` is still read) is an ordered list; each entry is one of:

```json
{ "divider": "Selected Works",                       // full page, title (+ optional quote) centred
  "quote": "Line one\nLine two", "author": "Name",   // newline = line break in the quote
  "background": true }                                // rays and ripples behind the text (default true; false = plain)
{ "path": "2026/santos", "images_per_page": 1, "skip": ["DSF1046"], "skip_thumbnail": false,
  "inject_svgs": false, "logo": false }               // a project; logo: absent=inherit, false=none, "img.png"=override
{ "title": "Related Works", "logo": false,
  "projects": ["2026/astros", "2017/luna"] }          // featured group (grid of thumbnails)
```

Current order: divider "Selected Works" (T.S. Eliot, *Four Quartets*: "Time present and time past / Are both perhaps present in time future, / And time future contained in time past."), then `2026/medium`, `2026/santos`, `2026/weaver2`, and a "Related Works" group (`2026/astros`, `2017/luna`, `2017/pixelspirit`).

### Page layout

- The label page's rays-and-ripples pattern is reused (`generate_rays_svg()` in `elements.py`) as the background of divider pages (`portfolio/divider_rays.*`) and of the contact page (`portfolio/contact_rays.*`, rays converge on the tree logo; window geometry in `pages.py`, `_CONTACT_*`). Both are gitignored. Backgrounds attach through the `shipout/background` hook so they never shift the page layout; the contact page no longer holds the logo in its TeX, the background draws it.
- Running header is off (`\pagestyle{empty}`): images and captions use the whole page.
- **Project page 1:** large bold title with linked year, description, `thumbnail.jpg` as a `\wrapfigure` if present. **Further pages:** portraits sharing the same `medium`+`dimensions` sidecar are grouped (`images_per_page`); others get one page each, with caption from the sidecar. Sidecar `skip: yes` excludes an image.
- The logo is added to the bottom of title pages, group pages and featured pages when at least 3.5 cm remain; never on single-image pages.
- Macros in `template.tex`: `\ArtworkEntry{img}{title}{year}{medium}{dims}{desc}`, `\SeriesPage{title}`.

### Placeholders in `template.tex`

`%%ARTIST_NAME%%`, `%%ARTIST_EMAIL%%` / `%%ARTIST_EMAIL_LABEL%%`, `%%ARTIST_WEBSITE%%` / `%%ARTIST_WEBSITE_URL%%`, `%%ARTIST_INSTAGRAM%%` / `%%ARTIST_INSTAGRAM_LABEL%%`, `%%ARTIST_LOCATION%%`, `%%ARTIST_PHONE%%`, `%%ARTIST_LOGO%%`, `%%ARTIST_BIO%%`, `%%OPTIONAL_ARTIST_STATEMENT%%`, `%%ARTWORKS%%`, `%%OPTIONAL_CV%%`, `%%OPTIONAL_EXHIBITIONS%%`, `%%OPTIONAL_TALKS%%`, `%%OPTIONAL_PRESS%%`, `%%LABEL_PAGE%%`. Convention: plain placeholders go in URL position and stay raw; `_LABEL` ones are visible text and LaTeX-escaped.

### Image sidecar (`images/IMGNAME.txt`)

```
title: Portrait of Jane
year: 2025
medium: Oil on canvas
dimensions: 16 x 12 inches
sold: yes          # truthy: yes, true, 1, sold
print: https://... # Buy Print URL
skip: yes          # leave out of the PDF
# comment lines are ignored
```

### Project dict (`metadata.py`)

`path, year, folder, title, medium, description, dimensions, about` (stripped README), `readme_raw`, `thumb`, `images`, `svgs`, `images_per_page` (default 3), plus any extra keys from the `data.json` entry.

### Compilation

`temp_portfolio/portfolio.tex` is written, `xelatex` runs twice from the workspace root (so `portfolio/montserrat/` resolves), the PDF is copied to the output name (derived from `artist.name` + `artist.for` + year if not given), and `temp_portfolio/` is deleted unless `--keep-temp`. Fonts: Montserrat TTFs in `portfolio/montserrat/` (Light is the body weight, SemiBold the bold).

---

## Markdown extensions

`:::wrapfig` works in READMEs and bio files, in PHP (ParsedownExtended) and in the PDF (`utils.py`):

```markdown
:::wrapfig right
src: YEAR/project/images/01.jpg
title: Title
year: 2010
medium: Oil on Canvas
caption: Venue, City
link: ./YEAR/project/
width: 40%
size: 70%
size_pdf: 60%     # PDF only
margin_pdf: 1cm   # PDF only
:::
```

In the PDF, `src:` is prefixed with the project dir and `link:` becomes an absolute website URL. If `src:` is a Looom animation SVG, a single frame is extracted to PNG (`frame: 0` or `time: 2.5`; cached in `temp_portfolio/html_renders/`).

**Raw HTML blocks** (`<div>`, `<table>`, `<figure>`, `<section>`, `<article>`, `<aside>`, `<pre>`, `<details>`, `<canvas>`) pass through untouched on the website. For the PDF they are rendered by headless Chrome to a 1200 px PNG, auto-cropped, cached by MD5, and embedded full width. If `src` images inside the block are missing, the PNG is blank: `2026/santos` has a `<div class="spacer">` pointing at `refs/okeeffe_*.jpg` (the files exist today). Move website-only HTML to `index.php`.

---

## Medium mint (`2026/medium/`)

24 animated oil-portrait studies minted on Transient (Ethereum). The pipeline from `singleview__*` sandboxes to IPFS folders, launcher HTMLs and previews is documented in `2026/medium/mint/README.md` and implemented by `mint_build.py` (output to `build/`, never over `mint/`), `mint_launcher.py` (gateway order and failover: Filebase first, per-asset retry) and `share_runtime.py`. Assets are on Filebase and Pinata; CIDs in `mint/cids.json`, edition to token map in `tokens.json`. Not recorded anywhere yet: how the GIF/WebM previews were made.

---

## Berthe (`portfolio/berthe/`)

First-party vector line library (also drives the AxiDraw plotter; exports SVG, PNG, Blender paths, G-Code). Full API in `portfolio/berthe/README.md`. What this repo uses:
- `elements.py`: `label(gallery_name, top_left, size=(90, 57.5), scale, for_name, email)` returns black and red `Group`s built with `rays_pattern()` and `ripple_pattern()`; `generate_label_svg()` writes `portfolio/label_output.svg`, converted to `label_output.pdf` for `%%LABEL_PAGE%%`.
- `berthe.looom`: `is_looom_svg(path)` and `looom_frame_to_png(svg, out, frame=0, time=0.0, margin_frac=0.10, width=800)` for Looom frames.

---

## The practice (working frame, November 2026)

### How the practice is introduced

Patricio's own bio sentence is the current lead and should be quoted, not paraphrased: *a multidisciplinary artist whose research-driven practice follows non-linear experiences such as memory, awareness and self-expression. Each project is another iteration of that inquiry, bridging analog and digital languages as ways of knowing.* The statement adds the register: art making as encoding meaning into matter, reaching toward the transcendent, with an earnest tone anchored in concrete work.

**Retired as leads (do not reintroduce):** "instruments of attention and wonder"; "what does it take for an artifact to develop presence?"; "what neither holds alone / what neither produces alone"; any double meaning on the word "medium" (binder, conduit). The interest in presence survives only implicitly, in images like a face that looks back.

`README.md` (bio) is edited only on explicit request. Keep it thematic: no catalogue of projects or libraries, and no prose that repeats what a nearby `:::wrapfig` caption already names.

### Non-linear time: the thread through the work

*A synthesis proposed in November 2026 from the bio, the Santos, Weaver and Medium statements, and the Eliot epigraph. Treat it as a working hypothesis and confirm with Patricio before using it as his own claim.*

Time in this practice is a field, not a line: the past does not end, it keeps arriving.
- **Sky.** Starlight is old and present at once (ESTRELLAS, Orbitas, HOGAR). Weaver overlays two skies seen from two places and moments, a shared sky that "exists beyond distance or time"; its statement credits Alexis Pauline Gumbs's work on nonlinear time. Astros reads the sky as it is now and sounds it.
- **Lineage.** Santos builds a chosen lineage across time against a break in the inherited one: the great-grandmother who burned her poems, and saints who "transcend linear time" into "a more circular, mythological temporality."
- **Loop.** Medium animates oil portraits into "a recurring reenactment of the psychological exercise of recognition": each viewing is a first meeting and a repetition.
- **Trace.** The plotter line, the brushstroke, the trails of planets across a year are marks made at different moments and held on one surface (Skylines, Hybrids, Time).

**Interlocutors** (named by Patricio): T.S. Eliot (*Four Quartets*, the portfolio epigraph), Alexis Pauline Gumbs, Jorge Luis Borges, Octavia Butler, James Baldwin, and the other sitters of Santos, titled by first name: Audre, David, Georgia, Hilma, James, Jorge Luis, Lygia, Maria Elena, Mercedes, Octavia, Toni, Toni Cade, Xul. (Surnames are not in the repo; ask before naming anyone beyond the four above and Eliot.) Useful lenses, to be checked against his intent: Borges on forking and circular time; Butler's *Kindred* and the *Parables* on the past written onto the present body; Baldwin on history carried rather than behind; Gumbs on ancestors as present collaborators.

### Recurring gestures

1. **Restoration of filtered perception:** something real was removed (city light erased the stars, satellite filters stripped the glow, the plotter reduces the face to skeleton); the work restores it or makes the absence the subject.
2. **The mark as presence:** a mark is indexical, a trace of something that was here. Ask whose presence is recorded and what it cost. The great-grandmother's burning is an anti-mark; Santos answers it.
3. **Two systems on one surface:** code and tarot, astronomy and astrology, machine and hand, home and planet, migration story and star map, English and Spanish. Describe the two systems concretely in the body of a statement; never frame them as "what neither holds alone."

Personal stakes: parenting (LUNA, HOGAR), family migration (Weaver, Guayupia, Santos), Argentine and immigrant identity, and an open-tool pedagogy (Book of Shaders, PixelSpirit, LYGIA, Vera, Shell Initiation).

---

## Projects: statement status

🟢 strong and complete · 🟡 functional with a named gap · 🔴 empty, press-release, or needs a full rewrite

**Drawing machines / hybrid painting**
- `2026/medium` 🟡: the sitter paragraph (masculinity in crisis, "what is being shaped from its pieces?") is the strong part. The opening is abstract ("the elusive essence of singularity") and never says what the viewer sees; the loop, the strongest idea, is unnamed; the closing ("refusing to settle on an answer") is generic. Needs a concrete first image and the time structure named.
- `2026/santos` 🟢: custom of the saint's name, grandfather's red book, great-grandmother, lineage. Already names circular temporality. Possible additions: name a few sitters and what each carries. Keep the closing on the great-grandmother.
- `2025/hybrids` 🟢: "I write the code and I hold the brush." Its lineage paragraph tells technology as a linear progression (optics, Flemish oil, the paint tube); worth testing against the non-linear frame. Uses semicolons; trim.
- `2025/gestures` 🟢, `2025/memories` 🟢 (best statement in the collection; Barthes punctum closes it).
- `2014/skylines` 🟡: foundational essay; two broken Flickr embeds remain (not a priority).

**Astronomical instruments**
- `2026/weaver2` 🟢: Irish-Argentine migration opening. The Gumbs credit sits in the last section; consider whether non-linear time should surface earlier.
- `2026/astros` 🟡: opens with the piece's own name and generic phrases ("living, luminous meditation", "poetic visual language") that fail the stranger test. The music paragraph (four voices on one scale, Sun theme over a Moon pedal, planets as echoes) is the specific, strong material; build the statement from it. No stakes or lineage yet.
- `2017/luna` 🟢, `2018/estrellas` 🟢, `2019/hogar` 🟢, `2025/orbitas2` 🟢.
- `2018/orbitas` 🟡: superseded by orbitas2. `2025/weaver` 🟡: frame as "the earlier iteration" of weaver2.

**Ecological / participatory:** `2010/communitas` 🟢, `2011/efectomariposa` 🟢, `2012/shadows` 🟢.

**Memory and digital materiality:** `2021/memory` 🟢 (could name the actual RAM/energy cost); `2022/time` 🟡 (series structure named, the emotional state of each piece is not).

**Migration and cartography:** `2017/guayupia` 🟢 ("we" voice, Jen Lowe; research notes in `NOTES.md`).

**Open tools / education:** `2017/pixelspirit` 🟢; `2014/pointcloudcity` 🔴 (link list: write what point clouds do to a familiar place); `2014/advanceGL` 🔴 (technical log: frame as the R&D sketchbook behind ESTRELLAS and Hybrids); `2016/openFrame` 🔴 (broken embeds: write the platform, the Jon Wohl and Ishac Bertran collaboration, the shader genre taxonomy).

**NFT / blockchain:** `2021/fen` 🟢 (end on "Intensification and extraction are the same gesture, performed simultaneously"; cut the soft final image); `2023/blink` 🟢.

**Collaborative / early:** `2013/clouds` 🟡, `2014/atramentum` 🟡 (press-release tone; name the specific GLSL contribution), `2010/calos` 🟡 (documentation, not a statement). `2013/lumiere`, `autilus`, `rio`, `naturalintentions`, `avsys` 🔴 (empty `README.md`; low priority, one sentence each).

---

## Communication strategy

**One sentence for curators, galleries and grants:** use the bio's own: Patricio González Vivo is a multidisciplinary artist whose research-driven practice follows non-linear experiences such as memory, awareness and self-expression, bridging analog and digital languages as ways of knowing.

**Entry points by context**
- **Technology / digital art:** lead with Medium or Santos, then Hybrids, PixelSpirit, BLINK. Plotted line and oil, animated strokes and a still painting, code and tarot.
- **Personal / narrative / Latin American and diaspora identity:** Weaver, Santos, Guayupia, HOGAR, LUNA. Migration, the burned poems, a chosen lineage, the Argentine inheritance of making under cultural pressure.
- **Ecological / contemplative:** Efecto Mariposa (the strongest single work for this context), ESTRELLAS, HOGAR, Orbitas. Common thread: we cannot act responsibly toward what we cannot feel at scale.

**Current PDF sequence:** bio, then the "Selected Works" divider with the Eliot epigraph, then Medium, Santos, Weaver, and a Related Works group (Astros, LUNA, PixelSpirit). The epigraph states the logic of the order: the newest work leads, and each later piece reaches back.

**Arcs when curating:** drawing machines (Skylines, Hybrids, Memories, Santos, Medium); astronomical instruments (LUNA, ESTRELLAS, HOGAR, Weaver, Astros); two systems (PixelSpirit, Astros, Hybrids, Santos). For a first curator meeting, lead with the most recent work in the main thread, add one work from another thread to show range, and let them ask what the oldest piece with this sensibility is.

### Thematic map

| Thread | Key works | Core question |
|---|---|---|
| Drawing machines / hybrid painting | Skylines (2014), Hybrids, Gestures, Memories (2025), Santos, Medium (2026) | What can the machine free the hand to do? |
| Astronomical instruments | LUNA (2017), ESTRELLAS (2018), HOGAR (2019), Weaver, Astros (2026) | How does the sky make us aware of our place in time? |
| Non-linear time and lineage | Guayupia (2017), Weaver, Santos, Medium (2026) | Who is present across time, and how is a lineage built when the inherited one was cut? |
| Ecological / participatory | Communitas (2010), Efecto Mariposa (2011), Sombras (2012) | How does collective action cascade beyond its visible scale? |
| Memory and digital materiality | Memory Studies (2021), Time (2022), Memories (2025) | What is the texture of remembering? |
| Open tools / education | Book of Shaders (2015), PixelSpirit (2017), LYGIA (2021), Vera (2022) | What happens when the tool is also the teaching? |
| NFT / blockchain | Flight Studies, Memory Studies (2021), BLINK (2023) | What does digital circulation cost, and who bears it? |

---

## Artist statement style guide

Validated across the strongest statements (Weaver2, Santos, Memories, PixelSpirit, Efecto Mariposa). Apply when writing or reviewing any README or `artist_statement.md`. The AC writing frame sits underneath it: what is it, what might it mean, why does it matter; specificity as the primary virtue; scaffolding, not explanation; the opening is often written last.

**Openings (choose one):** historical specificity ("On Saturday June 4, 2011…"); cultural observation ("In Latin America, it is common to receive the name of the saint…"); conceptual metaphor ("A prism doesn't change the light. It reveals what was already inside it."); declarative claim ("Memory is not a recording. It is a reconstruction."). Never open with "This work…", the piece's own name, "explores themes of", "invites the viewer to", or a sentence that fits any artist.

**Structure:** conceptual key; pivot line; what the work is (physical, what it is like to meet it); the structural tension (two registers, two time scales); why it matters; lineage; a closing that returns to the opening image or a concrete object and is the most specific sentence in the piece.

**Voice**
- First person where the stake is personal, third person for installations. Intimate and precise, "I" without apology. Mix long rhythmic sentences with short ones.
- **No em dashes, anywhere.** Go easy on semicolons. Use commas, colons and periods. Both read as signs of AI authorship. Grep for the character before finishing.
- **No clever wordplay.** Sincerity over cleverness.
- **A spiritual, transcendent register is welcome,** but it has to be earned by the concrete work (the halo in the grandfather's book of saints, the burned poems). Do not assert "transcend"; show the object that earns it.
- "Bridging languages / combining mediums" is Patricio's own thesis and may be used where it names his real practice. Do not use it as filler.

**Avoid:** "explores themes of", "invites the viewer to", "transcend boundaries", "connects us to something beyond", generic closings, instructional "how to use" language in the statement, process as a feature list or before the conceptual frame (describe what the medium does, not what it is), the AC clichés (immersive, liminal, urgent, "interrogates", "creates a dialogue between").

**Tests:** the stranger test (could another artist's name be swapped in?); can a first-time viewer picture the work after the first paragraph; read it aloud; where does attention drift. For time-based or ecological works, name the different time scales and make the asymmetry the subject.

**Philosophy checks that fit this work** (details in `2026/ac/CLAUDE.md`): what myth is already in the material (Barthes); who is the decoder and is the work guided, open or underbuilt (Hall, Eco); what kind of sign is the mark (Peirce: icon, index, symbol); what lineage is being claimed and where it swerves (Eliot, Bloom: `/what-makes-it-mine`); what the author's situated position brings and whether the making is collective (Haraway, Becker); who is allowed to be seen (Rancière, `/portraying-society` for the Santos, Hybrids and Medium portraits); what truth-claim the image makes (`/photo-epistemology` for satellite, sky and plotted-face work).
