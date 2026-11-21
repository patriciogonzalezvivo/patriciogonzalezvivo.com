#!/usr/bin/env python3
"""Write sitemap.xml for patriciogonzalezvivo.com and report metadata gaps.

    python3 generate_sitemap.py            # writes sitemap.xml next to this file
    python3 generate_sitemap.py --report   # also lists project pages that still need
                                           # their own TITLE.txt / DESCRIPTION.txt

What goes in: the home page, the listing pages, every YEAR/ index and every
YEAR/project/ page with an index.php. What stays out: whatever .deploy-filter
excludes (private notes, local tooling), redirect stubs, ?embed=1 variants.

<lastmod> is the last git commit that touched the page's folder (files for the
root pages); a date we can't verify is left out rather than guessed. Each project
with a static thumbnail also lists it as an <image:image>, which is what image
search uses.

Run by `make deploy` / `make deploy-dry` (see Makefile), so it never goes stale.
"""
import argparse
import glob
import os
import re
import subprocess
import sys
from urllib.parse import quote
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = 'https://patriciogonzalezvivo.com'
ROOT_PAGES = ['about.php', 'works.php', 'analog.php', 'astro.php', 'teaching.php', 'tools.php', 'collab.php']
STATIC_THUMBS = ['thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.png', 'thumbnail.webp',
                 'thumb.jpg', 'thumb.jpeg', 'thumb.png', 'thumb.webp']


def excluded_prefixes():
    """Paths .deploy-filter never uploads ('- /2026/ac/' -> '2026/ac/')."""
    out = []
    try:
        for line in open(os.path.join(ROOT, '.deploy-filter')):
            line = line.strip()
            if line.startswith('- /') and not any(c in line for c in '*?'):
                out.append(line[3:])
    except OSError:
        pass
    return out


def git_date(*paths):
    """Date (YYYY-MM-DD) of the latest commit touching any of `paths`, or None."""
    try:
        r = subprocess.run(['git', 'log', '-1', '--format=%cs', '--'] + list(paths), cwd=ROOT,
                           capture_output=True, text=True, timeout=30)
        d = r.stdout.strip()
        return d if re.fullmatch(r'\d{4}-\d{2}-\d{2}', d) else None
    except (OSError, subprocess.SubprocessError):
        return None


def read(path):
    try:
        return open(path, encoding='utf-8').read().strip()
    except OSError:
        return ''


def is_redirect(php_path):
    head = read(php_path)[:600]
    return bool(re.search(r'REFRESH|header\(\s*[\'"]Location', head, re.I))


def thumb_url(folder):
    for name in STATIC_THUMBS:
        if os.path.isfile(os.path.join(ROOT, folder, name)):
            return f'{SITE}/{quote(folder)}/{name}'
    return None


def url_entry(loc, lastmod=None, image=None):
    x = f'  <url>\n    <loc>{escape(loc)}</loc>\n'
    if lastmod:
        x += f'    <lastmod>{lastmod}</lastmod>\n'
    if image:
        x += f'    <image:image><image:loc>{escape(image)}</image:loc></image:image>\n'
    return x + '  </url>\n'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--report', action='store_true', help='list project pages missing TITLE.txt / DESCRIPTION.txt')
    ap.add_argument('--out', default=os.path.join(ROOT, 'sitemap.xml'))
    args = ap.parse_args()

    skip = excluded_prefixes()
    skipped = lambda rel: any(rel.startswith(p) or rel + '/' == p for p in skip)

    entries = [url_entry(SITE + '/', git_date('index.php'))]
    for f in ROOT_PAGES:
        if os.path.isfile(os.path.join(ROOT, f)):
            entries.append(url_entry(f'{SITE}/{f}', git_date(f)))

    years = sorted(d for d in os.listdir(ROOT) if re.fullmatch(r'\d{4}', d) and os.path.isdir(os.path.join(ROOT, d)))
    missing_title, missing_desc, n_projects = [], [], 0
    for y in years:
        if os.path.isfile(os.path.join(ROOT, y, 'index.php')):
            entries.append(url_entry(f'{SITE}/{y}/'))
        for d in sorted(os.listdir(os.path.join(ROOT, y))):
            rel = f'{y}/{d}'
            php = os.path.join(ROOT, rel, 'index.php')
            if skipped(rel) or not os.path.isfile(php) or is_redirect(php):
                continue
            n_projects += 1
            entries.append(url_entry(f'{SITE}/{rel}/', git_date(rel), thumb_url(rel)))
            if not read(os.path.join(ROOT, rel, 'TITLE.txt')):
                missing_title.append(rel)
            if not read(os.path.join(ROOT, rel, 'DESCRIPTION.txt')) and len(read(os.path.join(ROOT, rel, 'README.md'))) < 80:
                missing_desc.append(rel)

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
           'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + ''.join(entries) + '</urlset>\n')
    with open(args.out, 'w', encoding='utf-8') as fh:
        fh.write(xml)
    print(f'{os.path.relpath(args.out, ROOT)}: {len(entries)} URLs ({n_projects} project pages)')

    if args.report:
        print(f'\n{len(missing_title)} project pages have no TITLE.txt (title falls back to the folder name):')
        print('  ' + ', '.join(missing_title))
        print(f'\n{len(missing_desc)} have neither a DESCRIPTION.txt nor a README to describe them '
              f'(description falls back to "<title> (<year>). A work by Patricio Gonzalez Vivo."):')
        print('  ' + ', '.join(missing_desc))


if __name__ == '__main__':
    sys.exit(main())
