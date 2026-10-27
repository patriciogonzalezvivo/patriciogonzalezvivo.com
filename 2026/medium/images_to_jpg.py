#!/usr/bin/env python3
"""Convert every non-JPG image in a folder to JPG (default: ./images next to this script).

    python3 images_to_jpg.py                  # convert images/*.png etc., delete the originals
    python3 images_to_jpg.py DIR              # another folder
    python3 images_to_jpg.py --keep           # keep the originals
    python3 images_to_jpg.py --quality 95 --background black --dry-run

Transparent pixels are flattened onto --background (default white). Existing .jpg
files are left alone; an existing .jpg with the same stem is never overwritten
unless --force is given.
"""
import argparse
from pathlib import Path

from PIL import Image

EXTS = {".png", ".webp", ".tif", ".tiff", ".bmp", ".gif"}


def to_rgb(img, background):
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        flat = Image.new("RGB", img.size, background)
        flat.paste(img, mask=img.getchannel("A"))
        return flat
    return img.convert("RGB")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", nargs="?", default=Path(__file__).resolve().parent / "images")
    ap.add_argument("--quality", type=int, default=92)
    ap.add_argument("--background", default="white", help="colour for transparent areas")
    ap.add_argument("--keep", action="store_true", help="keep the original files")
    ap.add_argument("--force", action="store_true", help="overwrite existing .jpg files")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    folder = Path(args.folder)
    if not folder.is_dir():
        raise SystemExit(f"{folder} is not a folder")

    done = skipped = 0
    before = after = 0
    for src in sorted(p for p in folder.iterdir() if p.suffix.lower() in EXTS):
        dst = src.with_suffix(".jpg")
        if dst.exists() and not args.force:
            print(f"skip {src.name} ({dst.name} exists)")
            skipped += 1
            continue
        print(f"{src.name} -> {dst.name}")
        if args.dry_run:
            done += 1
            continue
        with Image.open(src) as img:
            exif = img.info.get("exif")
            rgb = to_rgb(img, args.background)
            kw = {"exif": exif} if exif else {}
            rgb.save(dst, "JPEG", quality=args.quality, optimize=True, **kw)
        before += src.stat().st_size
        after += dst.stat().st_size
        if not args.keep:
            src.unlink()
        done += 1

    print(f"{'Would convert' if args.dry_run else 'Converted'} {done}, skipped {skipped}"
          + ("" if args.dry_run else f"  ({before / 1e6:.1f} MB -> {after / 1e6:.1f} MB)"))


if __name__ == "__main__":
    main()
