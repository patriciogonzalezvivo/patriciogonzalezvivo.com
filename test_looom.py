#!/usr/bin/env python3
"""
test_looom.py — smoke-test for Berthe's Looom SVG frame extractor.

Converts 2026/weaver2/svg/001_light.svg to PNG using the same pipeline
the portfolio generator uses when it encounters a :::wrapfig src: *.svg.

Usage:
    python test_looom.py                  # frame 0 (default)
    python test_looom.py --frame 2        # explicit frame index
    python test_looom.py --time 1.5       # time-based frame selection
    python test_looom.py --all-frames     # dump every frame for every thread
"""

import argparse
import sys
from pathlib import Path

# Allow running from the workspace root without installing the package.
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from portfolio.berthe.berthe.looom import (
    LoomSVG,
    is_looom_svg,
    looom_frame_to_png,
    get_frame_index,
    compute_bbox,
)

SVG_PATH = ROOT / "2026/weaver2/svg/001_light.svg"
OUT_DIR  = ROOT / "temp_looom_test"


def print_info(looom: LoomSVG) -> None:
    """Print a summary of the parsed Looom SVG."""
    print(f"\nFile  : {looom.path}")
    print(f"viewBox: {looom.viewBox}")
    print(f"Threads: {len(looom.threads)}")
    for t in looom.threads:
        opts = t['opts']
        print(
            f"  [{t['id']}]  frames={opts['_n_frames']:2d}"
            f"  speed={opts.get('speed',12):5.1f}"
            f"  timeOffset={opts.get('timeOffset',0):7.3f}"
            f"  stroke={opts.get('stroke','?')}"
            f"  visible={opts.get('visible',True)}"
        )
    print()


def test_single_frame(frame: int | None, time: float) -> None:
    """Extract one frame and report the result."""
    tag = f"frame={frame}" if frame is not None else f"time={time}s"
    out = OUT_DIR / f"001_light_{tag.replace('=','').replace('.','p')}.png"

    print(f"→ Extracting {tag}  →  {out.relative_to(ROOT)}")
    bbox = compute_bbox(LoomSVG(SVG_PATH), time=time, frame_override=frame)
    if bbox:
        bw = bbox[2] - bbox[0]
        bh = bbox[3] - bbox[1]
        print(f"  bbox  : ({bbox[0]:.1f}, {bbox[1]:.1f}, {bbox[2]:.1f}, {bbox[3]:.1f})"
              f"  → {bw:.1f} × {bh:.1f}")

    ok = looom_frame_to_png(SVG_PATH, out, frame=frame, time=time,
                            margin_frac=0.08, width=800)
    if ok:
        size_kb = out.stat().st_size / 1024
        print(f"  OK    : {size_kb:.1f} KB")
    else:
        print("  FAILED — see messages above.")
        sys.exit(1)


def test_all_frames(looom: LoomSVG) -> None:
    """Dump the first frame of every thread, and every frame of the first thread."""
    print("=== All frames of first visible thread ===")
    first = next(
        (t for t in looom.threads if t['opts'].get('visible', True)), None
    )
    if first is None:
        print("  No visible threads.")
        return

    n = first['opts']['_n_frames']
    print(f"Thread {first['id']}  ({n} frames)")
    for f in range(n):
        out = OUT_DIR / f"001_light_{first['id']}_f{f:02d}.png"
        print(f"  frame {f:2d}  →  {out.name}", end="", flush=True)
        ok = looom_frame_to_png(SVG_PATH, out, frame=f, margin_frac=0.08, width=400)
        print("  OK" if ok else "  FAILED")

    print()
    print("=== Frame 0 for every thread (via time=0) ===")
    for t in looom.threads:
        opts = t['opts']
        if not opts.get('visible', True):
            continue
        idx = get_frame_index(opts, time=0.0)
        print(f"  [{t['id']}]  frame index at t=0 → {idx}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Test Looom SVG → PNG extraction.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--frame",      type=int,   default=0,
                       help="Frame index to extract (default: 0).")
    group.add_argument("--time",       type=float,
                       help="Time in seconds (overrides --frame).")
    group.add_argument("--all-frames", action="store_true",
                       help="Dump every frame of the first thread.")
    args = parser.parse_args()

    # ------------------------------------------------------------------ #
    # 1.  Detect                                                           #
    # ------------------------------------------------------------------ #
    print(f"is_looom_svg: {is_looom_svg(SVG_PATH)}")
    if not is_looom_svg(SVG_PATH):
        print("ERROR: file does not look like a Looom SVG.")
        sys.exit(1)

    # ------------------------------------------------------------------ #
    # 2.  Parse and print summary                                          #
    # ------------------------------------------------------------------ #
    looom = LoomSVG(SVG_PATH)
    print_info(looom)
    OUT_DIR.mkdir(exist_ok=True)

    # ------------------------------------------------------------------ #
    # 3.  Extract frame(s)                                                 #
    # ------------------------------------------------------------------ #
    if args.all_frames:
        test_all_frames(looom)
    elif args.time is not None:
        test_single_frame(frame=None, time=args.time)
    else:
        test_single_frame(frame=args.frame, time=0.0)


if __name__ == "__main__":
    main()
