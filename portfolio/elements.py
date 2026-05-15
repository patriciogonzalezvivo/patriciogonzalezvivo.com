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

A4_LANDSCAPE_SIZE = (297, 210)  # in mm


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


def label(gallery_name, top_left=[10,10], size=(90, 50), scale=1.0, for_name=None):
    grp_label_black = Group( name='label_black' )
    grp_label_red = Group( name='label_red', color='red' )
    
    # ----------------------------------------------------------------------

    x = top_left[0] 
    y = top_left[1]
    w = size[0] * scale
    h = size[1] * scale

    rows_pct = [0.3, 0.1, 0.15, 0.15, 0.15]
    rows = len(rows_pct)
    row_height = h / rows
    margin = 1.5 * scale
    stroke_width = 0.5

    for i in range(rows):
        row_height = h * rows_pct[i]
        y += row_height

        if i > 1 and i < 3:
            grp_label_black.line( (x, y), (x+w, y), stroke_width=stroke_width )

        if i == 1:
            grp_label_black.text( 'Patricio Gonzalez Vivo'.upper(), (x+margin, y + row_height * 0.4), scale=0.12 * scale, align='left', weight=150, letter_spacing=6 )
            # if os.path.exists(_LOGO_PATH):
            #     grp_label_black.bitmap(
            #         _LOGO_PATH,
            #         pos=(x - margin * 4, y - 4 * scale),
            #         align='top_right',
            #         scale=0.5,
            #     )
        # elif i == 3:
        #     _for_name = for_name if for_name is not None else gallery_name
        #     grp_label_black.text( "For", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140 )
        #     grp_label_black.text( _for_name, (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
        #     grp_label_black.line( (x+w*0.6, y), (x + w*0.6, y+row_height), stroke_width=stroke_width )
        #     grp_label_black.text( "Date" , (x + w * 0.6 + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140  )
        #     grp_label_red.text( datetime.now().strftime("%m-%d-%Y"), (x + w * 0.6 + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
        # elif i == 4:
        #     grp_label_black.text( "Web", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140 )
        #     grp_label_black.text( "patriciogonzalezvivo.com", (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )

    return Group( name='label', children=[grp_label_black, grp_label_red] )


def generate_label_svg(gallery_name: str, output_path: str, for_name: str = None) -> None:
    """Generate a full A4-landscape SVG with the label near the lower-right corner."""
    axi = Surface(size='A4_landscape')
    top_left = [185, 140]
    size = [90, 50]
    scale = 1.0

    grp_label = label(gallery_name, top_left=top_left, size=size, scale=scale,
                      for_name=for_name)
    axi.add(grp_label)

    color_extra = 'rgb(200, 200, 200)'
    grp_extra = Group( name='rays', color='gray' )
 
    y = top_left[1]

    width = A4_LANDSCAPE_SIZE[0]
    height = A4_LANDSCAPE_SIZE[1]
    margin = 1.5 * scale

    logo_center = (40, y + size[1] * 0.5)

    if os.path.exists(_LOGO_PATH):
        grp_extra.bitmap(
            _LOGO_PATH,
            pos=(logo_center[0], logo_center[1]),
            align='center',
            scale=0.5,
            # rotate=5,
        )

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

    axi.add(grp_extra)

    axi.toSVG(output_path)

if __name__ == '__main__':
    generate_label_svg("Example Gallery", "label.svg")