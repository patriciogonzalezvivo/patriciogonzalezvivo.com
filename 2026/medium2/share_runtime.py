#!/usr/bin/env python3
"""Deduplicate glslViewer.js / glslViewer.wasm / boot.js across sandbox folders.

Run from inside 2026/medium2:

    python3 share_runtime.py              # keep one copy per distinct runtime version
    python3 share_runtime.py --use DIR    # force every sandbox onto the runtime found in DIR
    python3 share_runtime.py --dry-run    # report only, change nothing

Runtime files are moved to _runtime/<version>/ (version = short hash of the three
files) and every <script src="glslViewer.js"> / <script src="boot.js"> in the
sandbox's *.html is pointed at ../_runtime/<version>/. The wasm is found by
glslViewer.js relative to its own location, so it needs no edit.
Safe to re-run after adding new exports: folders already converted are skipped.
"""
import argparse
import hashlib
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RUNTIME = ROOT / "_runtime"
FILES = ("glslViewer.js", "glslViewer.wasm", "boot.js")
SCRIPT_RE = re.compile(r'(<script\b[^>]*\bsrc=")(glslViewer\.js|boot\.js)(")')


def digest(path):
    return hashlib.md5(path.read_bytes()).hexdigest()


def version_of(folder):
    h = hashlib.md5()
    for name in FILES:
        h.update(digest(folder / name).encode())
    return h.hexdigest()[:8]


_installed = set()


def install(version, src_folder, dry):
    dest = RUNTIME / version
    if not dest.exists() and version not in _installed:
        _installed.add(version)
        print(f"  + _runtime/{version}/  (from {src_folder.name})")
        if not dry:
            dest.mkdir(parents=True)
            for name in FILES:
                shutil.copy2(src_folder / name, dest / name)
            lic = src_folder / "LYGIA_LICENSE.md"
            if lic.exists():
                shutil.copy2(lic, dest / lic.name)
    return dest


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--use", metavar="DIR", help="folder holding the runtime every sandbox should use")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    forced = None
    if args.use:
        src = Path(args.use).resolve()
        missing = [n for n in FILES if not (src / n).exists()]
        if missing:
            sys.exit(f"{src} is missing: {', '.join(missing)}")
        forced = version_of(src)
        install(forced, src, args.dry_run)

    freed = converted = 0
    for folder in sorted(p for p in ROOT.glob("singleview__*") if p.is_dir()):
        pages = sorted(folder.glob("*.html"))
        has_runtime = all((folder / n).exists() for n in FILES)

        if has_runtime:
            version = forced or version_of(folder)
            install(version, folder, args.dry_run)
        else:
            # already converted (or incomplete): nothing to do unless forcing a version
            if not forced:
                continue
            version = forced

        rel = f"../_runtime/{version}/"
        for page in pages:
            text = page.read_text(encoding="utf-8")
            new = SCRIPT_RE.sub(lambda m: m.group(1) + rel + m.group(2) + m.group(3)
                                if not m.group(2).startswith("..") else m.group(0), text)
            # also re-point pages that already reference some other _runtime version
            new = re.sub(r'(src=")\.\./_runtime/[0-9a-f]{8}/', lambda m: m.group(1) + rel, new)
            if new != text and not args.dry_run:
                page.write_text(new, encoding="utf-8")

        for name in FILES + ("LYGIA_LICENSE.md",):
            f = folder / name
            if f.exists():
                freed += f.stat().st_size
                if not args.dry_run:
                    f.unlink()
        converted += 1

    print(f"{'Would convert' if args.dry_run else 'Converted'} {converted} folders, "
          f"{'would free' if args.dry_run else 'freed'} {freed / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
