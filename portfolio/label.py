import sys
import os

from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from berthe.berthe import Surface, Group

# Absolute path to the logo, resolved relative to this file so the script
# works regardless of the current working directory.
_WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_LOGO_PATH = os.path.join(_WORKSPACE_ROOT, 'images', 'logo-gray.png')


def label(gallery_name, top_left=[10,10], size=(90, 50), scale=1.0):
    grp_label_black = Group( name='label_black' )
    grp_label_red = Group( name='label_red', color='red' )

    # grp_label_black.rect( top_left, size, align='top_left' )

    x = top_left[0] 
    y = top_left[1]
    w = size[0] * scale
    h = size[1] * scale

    rows_pct = [0.3, 0.1, 0.15, 0.15, 0.15]
    rows = len(rows_pct)
    row_height = h / rows
    margin = 1.5 * scale
    stroke_width = 0.5

    if os.path.exists(_LOGO_PATH):
        grp_label_black.bitmap(
            _LOGO_PATH,
            pos=(20, top_left[1] + h + margin),
            align='bottom_left',
            scale=0.5,
            # rotate=5,
        )

    # ----------------------------------------------------------------------

    for i in range(rows):
        row_height = h * rows_pct[i]
        y += row_height

        if i > 1:
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
        elif i == 2:
            grp_label_black.text( "Portfolio".upper(), (x+margin, y + row_height * 0.5), scale=0.09 * scale, align='left', letter_spacing=4 )
        elif i == 3:
            grp_label_black.text( "For", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140 )
            grp_label_black.text( gallery_name, (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
            grp_label_black.line( (x+w*0.6, y), (x + w*0.6, y+row_height), stroke_width=stroke_width )
            grp_label_black.text( "Date" , (x + w * 0.6 + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140  )
            grp_label_red.text( datetime.now().strftime("%m-%d-%Y"), (x + w * 0.6 + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )
        elif i == 4:
            grp_label_black.text( "Web", (x + margin, y + row_height * 0.5), scale=0.1 * scale, align='left', weight=140 )
            grp_label_black.text( "patriciogonzalezvivo.com", (x + margin + 10 * scale, y + row_height * 0.5), scale=0.1 * scale, align='left' )

    return Group( name='label', children=[grp_label_black, grp_label_red] )


def generate_label_svg(gallery_name: str, output_path: str) -> None:
    """Generate a full A4-landscape SVG with the label near the lower-right corner."""
    axi = Surface(size='A4_landscape')
    grp_label = label(gallery_name, top_left=[185, 140], size=(90, 50))
    axi.add(grp_label)
    axi.toSVG(output_path)


if __name__ == '__main__':
    gallery_name = "< Gallery Name >"
    axi = Surface( size='A4_landscape' )
    grp_label = label( gallery_name, top_left=[185,140], size=(90, 50))

    axi.add( grp_label )

    axi.toSVG( 'label.svg' )
    axi.toPNG( 'label.png' )
    axi.toTeX( 'label.tex' )