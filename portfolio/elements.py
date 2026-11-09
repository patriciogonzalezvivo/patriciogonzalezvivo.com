import sys
import os
import random

from datetime import datetime

from portfolio.berthe.berthe import Path, Line, Rectangle, Polyline, Circle
from portfolio.berthe.berthe.tools import polar2xy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from berthe.berthe import Surface, Group

# Absolute path to the logo, resolved relative to this file so the script
# works regardless of the current working directory.
_WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_LOGO_PATH = os.path.join(_WORKSPACE_ROOT, 'images', 'logo-gray.png')
_QR_PATH   = os.path.join(_WORKSPACE_ROOT, 'images', 'qr-code.png')
_PORTRAIT_PATH = os.path.join(_WORKSPACE_ROOT, 'images', 'portrait.png')

A4_LANDSCAPE_SIZE = (297, 210)  # in mm

_PORTRAIT_MAX_WIDTH = 2000  # px; keeps the base64-embedded SVG under libxml2's 10 MB limit


def _downscaled_portrait(path):
    """Return a cached, smaller copy of *path* that rsvg-convert can parse."""
    from PIL import Image as PILImage
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'portrait_label.png')
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
        return out
    with PILImage.open(path) as img:
        if img.size[0] > _PORTRAIT_MAX_WIDTH:
            h = round(img.size[1] * _PORTRAIT_MAX_WIDTH / img.size[0])
            img = img.resize((_PORTRAIT_MAX_WIDTH, h), PILImage.LANCZOS)
        img.save(out, optimize=True)
    return out


def rays_pattern(sun_center, width, height, press=2):
    rays = Path(color="black")
    rays_count = 0
    for deg in range(360):
        angle = float(deg)
        index = int(angle % press)
        if index == 0:
            A = polar2xy(sun_center, angle, 2.0)
            B = polar2xy(sun_center, angle, max(width, height) * 1.5)
            rays.add(Line(A, B, resolution=1 + int(random.random() * 100)).getPath())
            rays_count += 1
        elif index == 1:
            A = polar2xy(sun_center, angle, random.uniform(0.5, 2.0) * 75.0)
            B = polar2xy(sun_center, angle, max(width, height) * 1.5)
            rays.add(Line(A, B, resolution=100 + int(random.random() * 100)).getPath())
            rays_count += 1
    return rays


def ripple_pattern(center, width, height, max_ripple=20):
    ripples_pattern = Path(color="black")
    for i in range(13):
        # Exponentially expanding rings give a natural wave-front appearance
        ripple_radius = 5.0 + (2.0 ** i) * 5.0
        if ripple_radius > max_ripple:
            break
        ripples_pattern.add(Circle(center=center, radius=ripple_radius).getPath())
    return ripples_pattern


def label(gallery_name, top_left=[10,10], size=(90, 57.5), scale=1.0, for_name=None, email=None):
    grp_label_black = Group( name='label_black' )
    grp_label_red = Group( name='label_red', color='red' )
    
    # ----------------------------------------------------------------------

    x = top_left[0] 
    y = top_left[1]
    w = size[0] * scale
    h = size[1] * scale

    # Row heights in mm: image area, name, web/date, email (email only if given)
    rows_mm = [30, 5, 7.5] + ([7.5] if email else [])
    rows_pct = [m / size[1] for m in rows_mm]
    rows = len(rows_pct)
    row_height = h / rows
    margin = 1.5 * scale
    stroke_width = 0.1

    for i in range(rows):
        row_height = h * rows_pct[i]
        y += row_height

        if i > 1:
            grp_label_black.line( (x, y), (x+w, y), stroke_width=stroke_width )

        if i == 1:
            grp_label_black.text( 'Patricio Gonzalez Vivo'.upper(), (x+margin, y + row_height * 0.4), scale=0.15 * scale, align='left', weight=150, letter_spacing=8 )
        elif i == 2:
            _for_name = for_name if for_name is not None else gallery_name
            # grp_label_black.text( "For", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140 )
            # grp_label_black.text( _for_name, (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
            grp_label_black.text( "Web", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=130 )
            grp_label_black.text( "patriciogonzalezvivo.com", (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
            grp_label_black.line( (x+w*0.6, y), (x + w*0.6, y+row_height), stroke_width=stroke_width )
            grp_label_black.text( "Date" , (x + w * 0.6 + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=130  )
            grp_label_red.text( datetime.now().strftime("%m-%d-%Y"), (x + w * 0.6 + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
        elif i == 3:
            grp_label_black.text( "Email", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=130 )
            grp_label_black.text( email, (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )

    return Group( name='label', children=[grp_label_black, grp_label_red] )


def generate_label_svg(gallery_name: str, output_path: str, for_name: str = None,
                       email: str = None) -> None:
    """Generate a full A4-landscape SVG with the label near the lower-right corner."""
    axi = Surface(size='A4_landscape')
    top_left = [185, 140]
    size = [90, 57.5 if email else 50]
    scale = 1.0

    color_extra = 'rgb(200, 200, 200)'
    grp_extra = Group( name='rays', color='gray' )

    y = top_left[1]

    width = A4_LANDSCAPE_SIZE[0]
    height = A4_LANDSCAPE_SIZE[1]
    margin = 1.5 * scale

    # Label plate geometry (mm).  The QR code is sized and placed to match it:
    # same top and bottom edges, and the same distance from the page edge as
    # the plate has on the opposite (right) side.
    pad, radius = 3.0, 3.0   # air around the label content, plate corner radius
    plate_x = top_left[0] - pad
    plate_y = top_left[1] + 30 + 1.0 - pad   # name row starts at +30mm; ~6mm of air above the text
    plate_w = size[0] * scale + 2 * pad
    plate_h = top_left[1] + size[1] * scale + pad - plate_y
    side_margin = width - (plate_x + plate_w)
    qr_mm = plate_h
    logo_center = (side_margin + qr_mm / 2, plate_y + plate_h / 2)

    moon_edge = 50
    circle = Circle(center=logo_center, radius=moon_edge, color=color_extra).getPath()
    grp_extra.add( circle )

    sun_center = logo_center

    # moon is on the radius of Circle, opposite to the sun, at 90% of the radius
    moon_center = polar2xy(sun_center, -45, moon_edge)
    ripple_pat = ripple_pattern(moon_center, width, height, max_ripple=300).getPattern(width, height)
    ripple_pat.carve( circle )

    pattern_path = rays_pattern(sun_center, width, height, press=2)
    pattern_path.add( ripple_pat.getPath() )
    pattern = pattern_path.getPattern(width, height)

    rect = Rectangle( [top_left[0] - margin * 2.0, top_left[1] - margin * 2.0], [size[0] + 2 * margin * 2.0, size[1] + 2 * margin * 2.0], align='top_left' )
    circle = Circle(logo_center, 30 * scale)
    pattern.carve(Polyline(rect.getPoints()))
    pattern.carve(Polyline(circle.getPoints()))
    pattern_path = pattern.getPath(optimize=True)
    grp_extra.path(pattern_path, color=color_extra, stroke_width=0.5)

    # Draw order: rays (bottom) → full-page background → logo → label
    axi.add(grp_extra)

    if os.path.exists(_PORTRAIT_PATH):
        from PIL import Image as PILImage
        portrait_path = _downscaled_portrait(_PORTRAIT_PATH)
        with PILImage.open(portrait_path) as img:
            natural_width_mm = img.size[0] * 0.264583  # px → mm @ 96 DPI
        grp_background = Group( name='background' )
        grp_background.bitmap(
            portrait_path,
            pos=(0, 0),
            align='top_left',
            scale=A4_LANDSCAPE_SIZE[0] / natural_width_mm,
        )
        axi.add(grp_background)

    # The QR code replaces the tree logo (it carries the contact page's job).
    # Falls back to the logo when no QR image is available.
    from PIL import Image as PILImage
    mark_path, mark_mm = (_QR_PATH, qr_mm) if os.path.exists(_QR_PATH) else (_LOGO_PATH, 31.0)
    if os.path.exists(mark_path):
        with PILImage.open(mark_path) as img:
            natural_mm = img.size[0] * 0.264583  # px → mm @ 96 DPI
        grp_logo = Group( name='logo', color='gray' )
        grp_logo.bitmap(
            mark_path,
            pos=(logo_center[0], logo_center[1]),
            align='center',
            scale=mark_mm / natural_mm,
        )
        axi.add(grp_logo)

    grp_label = label(gallery_name, top_left=top_left, size=size, scale=scale,
                      for_name=for_name, email=email)
    axi.add(grp_label)

    axi.toSVG(output_path)

    # Translucent white plate behind the name / web rows so the text reads
    # against the painting.  Inserted just before the label group (berthe has
    # no opacity support), i.e. above background + logo, below the text.
    plate = (f'<rect id="label_plate" x="{plate_x}" y="{plate_y}" width="{plate_w}" '
             f'height="{plate_h}" rx="{radius}" ry="{radius}" '
             f'fill="white" fill-opacity="0.8" stroke="none"/>')
    with open(output_path, 'r', encoding='utf-8') as f:
        svg = f.read()
    svg = svg.replace('<g id="label"', plate + '<g id="label"', 1)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg)

if __name__ == '__main__':
    generate_label_svg("Example Gallery", "label.svg")