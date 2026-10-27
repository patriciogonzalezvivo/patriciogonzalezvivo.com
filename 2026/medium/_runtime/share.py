#!/usr/bin/env python3
"""Make every sandbox in 2026/medium share ONE glslViewer runtime.

    python3 _runtime/share.py              # unify on the newest runtime found
    python3 _runtime/share.py --use DIR    # unify on the runtime inside DIR
    python3 _runtime/share.py --dry-run    # report only, change nothing

Run it after re-importing sandboxes. Each singleview__*/ folder that arrives with
its own glslViewer.js / glslViewer.wasm / boot.js has those copies deleted, and
every *.html in it is pointed at ../_runtime/<version>/ (version = short hash of
the three files). The wasm is found by glslViewer.js relative to itself, so it
needs no edit. Folders already converted are re-pointed if they reference an
older version, and _runtime/<version>/ folders nothing references are removed.

Default source: the runtime with the newest file mtime among freshly imported
folders (ties go to the most common one); if there are none, the newest existing
_runtime/<version>/. When several versions are found it says so, so pass --use
if the automatic pick isn't the one you want.
"""
import argparse
import hashlib
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

RUNTIME = Path(__file__).resolve().parent
ROOT = RUNTIME.parent
FILES = ("glslViewer.js", "glslViewer.wasm", "boot.js")
EXTRA = ("LYGIA_LICENSE.md",)
SRC_RE = re.compile(r'(<script\b[^>]*\bsrc=")(?:\.\./_runtime/[0-9a-f]{8}/)?(glslViewer\.js|boot\.js)(")')


def version_of(folder):
    h = hashlib.md5()
    for name in FILES:
        h.update(hashlib.md5((folder / name).read_bytes()).hexdigest().encode())
    return h.hexdigest()[:8]


def has_runtime(folder):
    return all((folder / n).exists() for n in FILES)


def mtime_of(folder):
    return max((folder / n).stat().st_mtime for n in FILES)


def pick_source(folders):
    local = [f for f in folders if has_runtime(f)]
    if local:
        versions = {}
        for f in local:
            v = versions.setdefault(version_of(f), {"folder": f, "mtime": 0, "n": 0})
            v["n"] += 1
            if mtime_of(f) > v["mtime"]:
                v["mtime"], v["folder"] = mtime_of(f), f
        best = max(versions, key=lambda k: (int(versions[k]["mtime"]), versions[k]["n"]))
        if len(versions) > 1:
            print("Several runtime versions found:")
            for k, v in sorted(versions.items(), key=lambda kv: -kv[1]["n"]):
                print(f"  {k}  x{v['n']}  e.g. {v['folder'].name}{'   <- chosen' if k == best else ''}")
        return best, versions[best]["folder"]
    existing = sorted((d for d in RUNTIME.iterdir() if d.is_dir() and has_runtime(d)),
                      key=mtime_of, reverse=True)
    if not existing:
        sys.exit("No runtime found in any sandbox or in _runtime/. Use --use DIR.")
    return existing[0].name, existing[0]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--use", metavar="DIR", help="folder holding the runtime every sandbox should use")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    dry = args.dry_run

    folders = sorted(p for p in ROOT.glob("singleview__*") if p.is_dir())

    if args.use:
        src = Path(args.use).resolve()
        missing = [n for n in FILES if not (src / n).exists()]
        if missing:
            sys.exit(f"{src} is missing: {', '.join(missing)}")
        version = version_of(src)
    else:
        version, src = pick_source(folders)

    dest = RUNTIME / version
    if dest.resolve() != src.resolve() and not dest.exists():
        print(f"+ _runtime/{version}/  (from {src.name})")
        if not dry:
            dest.mkdir(parents=True)
            for name in FILES + EXTRA:
                if (src / name).exists():
                    shutil.copy2(src / name, dest / name)
    print(f"Runtime: {version}")

    rel = f"../_runtime/{version}/"
    freed = repointed = 0
    for folder in folders:
        changed = False
        for page in sorted(folder.glob("*.html")):
            text = page.read_text(encoding="utf-8")
            new = SRC_RE.sub(lambda m: m.group(1) + rel + m.group(2) + m.group(3), text)
            if new != text:
                changed = True
                if not dry:
                    page.write_text(new, encoding="utf-8")
        for name in FILES + EXTRA:
            f = folder / name
            if f.exists():
                freed += f.stat().st_size
                changed = True
                if not dry:
                    f.unlink()
        repointed += changed

    # drop runtime versions nothing points at any more
    used = Counter()
    for page in ROOT.glob("singleview__*/*.html"):
        used.update(re.findall(r'\.\./_runtime/([0-9a-f]{8})/', page.read_text(encoding="utf-8")))
    for d in sorted(RUNTIME.iterdir()):
        if d.is_dir() and d.name != version and not used[d.name]:
            print(f"- _runtime/{d.name}/  (unused)")
            if not dry:
                shutil.rmtree(d)

    print(f"{'Would update' if dry else 'Updated'} {repointed}/{len(folders)} folders, "
          f"{'would free' if dry else 'freed'} {freed / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
