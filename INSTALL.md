# Installing on macOS

This document covers everything needed to build and run this repository on macOS:

- **`make portfolio`** — generates the PDF portfolio (§§ 1–6).
- **`make server`** — boots the local PHP development server (§7).

The portfolio build chain is:

```
make portfolio
 ├─ python generate_portfolio.py …
 │   ├─ portfolio/elements.py    → berthe (SVG label generation)  needs: shapely, numpy, Pillow
 │   ├─ portfolio/images.py      → rsvg-convert (SVG→PDF)         needs: librsvg
 │   ├─ portfolio/html_render.py → headless Chrome (HTML→PNG)     needs: Google Chrome (optional, used only when a README contains raw HTML blocks)
 │   └─ portfolio/compiler.py    → xelatex × 2                    needs: MacTeX (or BasicTeX + extras)
 └─ xdg-open <pdf>               (the Makefile uses xdg-open; on macOS swap to `open`, see "Makefile note" below)
```

---

## 0. Check current state

Before installing anything, run this block to see what is already on your machine. The portfolio build needs everything in the "Required" group to be present:

```bash
echo "=== Required ==="
which python  && python --version            # Makefile uses 'python'
which xelatex && xelatex --version | head -1
which rsvg-convert && rsvg-convert --version | head -1
python -c "import shapely, numpy, PIL; print('python pkgs OK')" 2>&1

echo "=== Optional ==="
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" 2>/dev/null && echo "chrome present"
which brew && brew --version | head -1
```

If any **Required** line errors out, install that item from §2 / §3 below.

> **Important conda gotcha:** the Makefile invokes `python` (not `python3`). On macOS systems with Miniconda or Anaconda installed, `python` typically resolves to the conda environment, while `python3` resolves to Homebrew's Python. **Python packages must be installed into the env that `python` resolves to** — see §3 for the exact pip command for your setup.

---

## 1. Quick install

If you trust Homebrew and want everything in one go (run these **one at a time**, not in parallel — see Troubleshooting on lock collisions):

```bash
# 1. System tools (small, ~1 min total)
brew install librsvg

# 2. MacTeX — large download, ~5 GB, 5–15 min
brew install --cask mactex-no-gui

# 3. Optional — only needed if any README has raw HTML blocks
brew install --cask google-chrome

# 4. Python packages — into the env that `python` resolves to
$(which python) -m pip install shapely Pillow numpy
```

Then re-open your terminal (so `xelatex` enters PATH) and jump to **§4 Run it**.

If you'd rather do it deliberately, follow the steps below.

---

## 2. System dependencies (Homebrew)

If you don't yet have Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2.1 Python 3

You need a working `python` interpreter (Python 3.9+). On macOS this usually already exists — either via:

- **Miniconda / Anaconda** (recommended if you also do data work; `python` resolves to the conda env)
- **Homebrew Python** (`brew install python`; `python3` lives at `/opt/homebrew/bin/python3`)
- **System Python** (Apple's, on macOS Big Sur and later)

The Makefile invokes `python` (not `python3`), so whichever interpreter that name resolves to is the one that needs the third-party packages from §3. Confirm with:

```bash
which python && python --version    # → Python 3.9+
```

### 2.2 XeLaTeX (MacTeX)

The portfolio compiles with `xelatex`, which lives in a TeX Live distribution. Two options:

**Recommended — MacTeX (full, ~5 GB):**

```bash
brew install --cask mactex-no-gui
```

`mactex-no-gui` skips the GUI front-ends (TeXShop etc.) but keeps the full set of LaTeX packages, which means the build won't fail later asking for a missing `.sty`.

**Lighter — BasicTeX (~100 MB) + extras (~hundreds of MB):**

```bash
brew install --cask basictex
# Then install the LaTeX packages used by the template:
sudo tlmgr update --self
sudo tlmgr install \
    fontspec wrapfig fancyhdr titlesec hyperref parskip \
    geometry caption subcaption setspace xcolor
```

After install, close and re-open your terminal so the `xelatex` binary is on PATH (`/Library/TeX/texbin`).

Verify:

```bash
xelatex --version | head -1     # → "XeTeX 3.141592653-2.6-…"
```

### 2.3 rsvg-convert (SVG → PDF)

The build converts the per-page label SVG (and any project-supplied SVGs) to PDF before they go into the LaTeX document. `rsvg-convert` from `librsvg` is the preferred tool because it is small, fast, and deterministic.

```bash
brew install librsvg
```

Verify:

```bash
rsvg-convert --version          # → "rsvg-convert version 2.x.x"
```

> Alternative: if you already have Inkscape and don't want `librsvg`, the code falls back to it automatically. There's no benefit to using Inkscape if you can install `librsvg`.

### 2.4 Headless Chrome (optional)

`portfolio/html_render.py` uses a headless Chrome instance to rasterize raw HTML blocks (`<div>`, `<table>`, `<figure>`, etc.) that appear inside `README.md` files. The generator falls back to ignoring those blocks if Chrome is missing — so this is only required if any project's README has rich HTML.

```bash
brew install --cask google-chrome
# Chromium also works:
# brew install --cask chromium
```

The code searches for Chrome in the usual macOS locations (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`); no further configuration is needed.

---

## 3. Python dependencies

Three third-party packages are required by the `berthe` submodule (which generates the label-page SVG):

| Package  | Used by                                                                    |
|----------|----------------------------------------------------------------------------|
| `shapely` | `berthe.Polyline.getSimplify()` (line simplification + topology ops)       |
| `numpy`   | `berthe` geometry math                                                     |
| `Pillow`  | `berthe.Bitmap` (embedded raster preview, used by the label page)          |

### Install into the same env that `python` uses

This is the part that trips most people up. Run the install with the exact interpreter the Makefile will use:

```bash
$(which python) -m pip install shapely Pillow numpy
```

`$(which python)` substitutes the absolute path of whatever `python` resolves to — so the packages always land in the right place whether that is conda, Homebrew, or a venv.

**Example for a Miniconda base env** (the working setup on this machine):

```bash
$ which python
/Users/<you>/miniconda3/bin/python
$ /Users/<you>/miniconda3/bin/pip install shapely Pillow numpy
```

**Example for a project-local venv:**

```bash
cd /path/to/patriciogonzalezvivo.com
python3 -m venv .venv
source .venv/bin/activate
pip install shapely Pillow numpy
# Remember to `source .venv/bin/activate` before every `make portfolio` run.
```

### Verify

```bash
python -c "import shapely, numpy, PIL; print('OK')"   # → OK
```

If this prints `ModuleNotFoundError` even after a successful pip install, you almost certainly installed into a different interpreter than the one `python` resolves to. Re-run with `$(which python) -m pip install …`.

---

## 4. Run it

From the repository root:

```bash
cd /path/to/patriciogonzalezvivo.com
make portfolio
```

A successful build prints a sequence of "Resolving optional file sections…" lines, runs `xelatex` twice, and drops a `.pdf` named like `patricio-gonzalez-vivo-2026.pdf` in the repo root.

### Makefile note

The Makefile's `portfolio` target ends with `xdg-open` to launch the generated PDF — that command is Linux-only. On macOS you have two options:

- **Quick:** ignore the trailing error; the PDF is still produced.
- **Better:** edit the [Makefile](Makefile) and change `xdg-open` to `open`:

```makefile
portfolio:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json && open $$(ls -t *.pdf | head -1)
```

---

## 5. Verifying the full install

Run each of these and confirm they print the expected output:

```bash
python --version                                            # Python 3.9+
xelatex --version | head -1                                 # XeTeX 3.x
rsvg-convert --version | head -1                            # rsvg-convert 2.x
python -c "import shapely, numpy, PIL; print('OK')"         # OK
```

Optional (only if your project READMEs contain raw HTML blocks):

```bash
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"  # path exists
```

---

## 6. Troubleshooting

**`xelatex: command not found` even after installing MacTeX.**  
MacTeX adds itself to `/Library/TeX/texbin`. Open a *new* terminal, or run:

```bash
eval "$(/usr/libexec/path_helper)"
```

**`Exception: …requires shapely. Try: pip install shapely`** during label generation.  
You installed shapely into a different Python than the one `python` resolves to. Run:

```bash
$(which python) -m pip install shapely Pillow numpy
```

…and then re-test with `python -c "import shapely; print(shapely.__version__)"`.

**`Error: Another 'brew vendor-install ruby' process is already running.`**  
Two `brew install` commands ran in parallel and one grabbed the auto-update lock. Either run brew installs one at a time, or skip auto-update:

```bash
HOMEBREW_NO_AUTO_UPDATE=1 brew install --cask mactex-no-gui
```

**`! LaTeX Error: File 'fontspec.sty' not found.`**  
You installed BasicTeX but not the extra packages. Run the `tlmgr install` line in §2.2.

**Build runs but the PDF has missing glyphs / boxes where text should be.**  
This usually means the Montserrat font files in `montserrat/` weren't picked up — make sure you ran `make portfolio` from the repo root (not from inside a subdirectory), so XeLaTeX can find the `montserrat/` folder.

**`rsvg-convert: command not found`.**  
`brew install librsvg`. The binary is installed alongside the library.

**`make: command not found`.**  
macOS includes `make` with the Command Line Tools: `xcode-select --install`.

**The Makefile fails on `xdg-open` at the end.**  
Expected on macOS — see "Makefile note" in §4. The PDF was still generated.

---

## 7. The PHP website (`make server`)

`make server` runs the bundled PHP development server, which serves the website at `http://localhost:8000`. It is entirely independent of the portfolio build — no MacTeX, no Python, no `librsvg` needed.

### Requirements

| Tool | Minimum | Notes |
|------|---------|-------|
| `php` | **8.0+** | The codebase uses `str_ends_with()`, the null-coalescing assignment `??=`, and other PHP 8 features. PHP 8.4+ recommended (some Parsedown library deprecation warnings on 8.4+ are cosmetic, see Troubleshooting). |
| `make` | any | Ships with macOS Command Line Tools (`xcode-select --install`). Only needed if you invoke via `make server`; you can also run the underlying command directly. |

That's it. No Composer, no database, no Node toolchain — every PHP dependency is vendored under [`parsedown/`](parsedown/) and [`ParsedownExtended.php`](ParsedownExtended.php).

### Installing PHP

macOS no longer ships PHP starting with **macOS Monterey (12.x)** — Apple removed the bundled PHP. On any modern macOS, install via Homebrew:

```bash
brew install php
```

This installs the latest stable PHP (currently 8.5+) at `/opt/homebrew/bin/php`. Verify:

```bash
php --version | head -1     # → PHP 8.x.x …
```

If you have an older macOS that still ships PHP 7.x, you must upgrade — the codebase will not run on PHP 7.

### Running the server

From the repository root:

```bash
make server
```

Or directly, without `make`:

```bash
php -S localhost:8000
```

Then open [http://localhost:8000/](http://localhost:8000/) in a browser. `Ctrl-C` stops the server.

### Optional — change the port

If something else is already on port 8000:

```bash
php -S localhost:8001
```

(The Makefile target is hard-coded to 8000; edit [Makefile](Makefile) if you want a different default.)

### Troubleshooting the server

**`php: command not found`.**  
Install via Homebrew (`brew install php`). macOS Monterey and later no longer bundle PHP.

**`Failed to listen on localhost:8000 (reason: Address already in use)`.**  
Another process is on port 8000. Find it with `lsof -i :8000` and kill it, or use a different port via `php -S localhost:8001`.

**`Deprecated: Parsedown::blockSetextHeader(): Implicitly marking parameter $Block as nullable is deprecated`.**  
Cosmetic warnings emitted by the bundled [parsedown/Parsedown.php](parsedown/Parsedown.php) library on PHP 8.4+. The site still renders correctly. Safe to ignore, or upgrade the Parsedown submodule to a newer release that handles PHP 8.4+ nullable-parameter syntax.

**Pages render but the `:::wrapfig` blocks show as literal text.**  
The page is using base `Parsedown` instead of `ParsedownExtended`. As of the recent refactor every page uses `ParsedownExtended`, so this should not happen — but if you add a new project page, copy the include pattern from an existing one (e.g. [2026/santos/index.php](2026/santos/index.php)).
