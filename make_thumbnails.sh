#!/usr/bin/env bash
# make_thumbnails.sh — Generate thumbnails for render_gallery() PHP galleries
#
# Usage:
#   ./make_thumbnails.sh [images_dir] [max_width]
#
# Defaults:
#   images_dir = images
#   max_width  = 600
#
# Thumbnails are written to <images_dir>/thumbnails/ with the same filename.
# Skips files that already have an up-to-date thumbnail (unless -f is passed).
#
# Options:
#   -f  Force regeneration even if thumbnail already exists
#   -h  Show this help

set -euo pipefail

# ── defaults ──────────────────────────────────────────────────────────────────
IMAGES_DIR="images"
MAX_WIDTH=600
FORCE=false

# ── parse flags ───────────────────────────────────────────────────────────────
while getopts ":fh" opt; do
    case $opt in
        f) FORCE=true ;;
        h)
            sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        \?) echo "Unknown option: -$OPTARG" >&2; exit 1 ;;
    esac
done
shift $((OPTIND - 1))

# ── positional args ───────────────────────────────────────────────────────────
[[ $# -ge 1 ]] && IMAGES_DIR="$1"
[[ $# -ge 2 ]] && MAX_WIDTH="$2"

# ── validate ──────────────────────────────────────────────────────────────────
if [[ ! -d "$IMAGES_DIR" ]]; then
    echo "Error: directory '$IMAGES_DIR' not found." >&2
    exit 1
fi

if ! command -v convert &>/dev/null; then
    echo "Error: ImageMagick 'convert' not found. Install with: sudo apt install imagemagick" >&2
    exit 1
fi

THUMB_DIR="$IMAGES_DIR/thumbnails"
mkdir -p "$THUMB_DIR"

# ── process images ────────────────────────────────────────────────────────────
shopt -s nullglob
files=("$IMAGES_DIR"/*.{jpg,jpeg,JPG,JPEG,png,PNG,gif,GIF,webp,WEBP})
shopt -u nullglob

if [[ ${#files[@]} -eq 0 ]]; then
    echo "No images found in '$IMAGES_DIR'."
    exit 0
fi

COUNT=0
SKIPPED=0

for src in "${files[@]}"; do
    filename="$(basename "$src")"
    dest="$THUMB_DIR/$filename"

    # Skip if thumbnail is newer than source (and not forcing)
    if [[ "$FORCE" == false && -f "$dest" && "$dest" -nt "$src" ]]; then
        (( SKIPPED++ )) || true
        continue
    fi

    echo "  → $filename"
    convert "$src" \
        -auto-orient \
        -strip \
        -resize "${MAX_WIDTH}x>" \
        -quality 85 \
        "$dest"

    (( COUNT++ )) || true
done

echo ""
echo "Done. Generated: $COUNT  |  Skipped (up-to-date): $SKIPPED"
echo "Thumbnails saved to: $THUMB_DIR"
