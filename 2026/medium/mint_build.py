#!/usr/bin/env python3
"""Build one Transient/IPFS mint kit per singleview__* sandbox.

  python3 mint_build.py            # build mint/<asset>/ (IPFS folder) + mint/<asset>.html (for Transient)
  python3 mint_build.py --cids mint/cids.json   # also inject folder CIDs into the HTMLs

Each IPFS folder is self-contained (runtime + scene). The runtime files are
byte-identical across all 24, so IPFS content-addressing stores them once.
Layout/loader follow artist-mint-kit/ (Transient's instructions).
"""
import argparse, glob, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
RUNTIME = os.path.join(ROOT, '_runtime', '471bc23c')
KIT_HTML = os.path.join(ROOT, 'artist-mint-kit', '2-upload-html-to-transient', 'transient-upload.html')
OUT = os.path.join(ROOT, 'mint')
RUNTIME_FILES = ['boot.js', 'glslViewer.js', 'glslViewer.wasm', 'LYGIA_LICENSE.md']
# Site-only files that must not go to IPFS.
SKIP = re.compile(r'(^index\.html$|^embed-example\.html$|^info\.txt$|^studio\.json$|\.downscale\.json$|\.html$)')
DIR_RE = re.compile(r'^singleview__(.+?)(_fit)?__splat_strokes_([A-Za-z0-9_]+)$')

# Sandboxes without an info.txt (edition number inferred: it is the only one missing from 1-24).
NUMBER_OVERRIDES = {'58f0e97c08629d737649e8c90338e9c9_fit': 6}

def edition_number(d, asset):
    """'Digital No. 13' in <sandbox>/info.txt -> 13 (the mint title is 'Medium No. 13')."""
    info = os.path.join(d, 'info.txt')
    if os.path.exists(info):
        m = re.search(r'^title:.*?No\.\s*(\d+)', open(info).read(), re.M)
        if m: return int(m.group(1))
    return NUMBER_OVERRIDES[asset]

def sub1(text, old, new):
    assert text.count(old) == 1, 'expected exactly one match for: ' + old[:60]
    return text.replace(old, new)

def patched_boot():
    """The site's boot.js + the kit's IPFS_ASSET_BASE patch (fetch via gateway base)."""
    s = open(os.path.join(RUNTIME, 'boot.js')).read()
    s = sub1(s, 'const POLL_MS = 50;', '''// When launched by a separately hosted HTML file (a Transient mint), relative
// fetches would resolve against that file's origin. The launcher sets
// IPFS_ASSET_BASE to the selected gateway folder URL; falling back to
// document.baseURI keeps this file usable in a same-folder deployment.
const ASSET_BASE = window.IPFS_ASSET_BASE || document.baseURI;
function assetUrl(path) { return new URL(path, ASSET_BASE).href; }

const POLL_MS = 50;''')
    s = sub1(s, 'const r = await fetch(url);\n  if (!r.ok) throw new Error(url + \': HTTP \' + r.status);\n  return new Uint8Array',
                'const r = await fetch(assetUrl(url));\n  if (!r.ok) throw new Error(url + \': HTTP \' + r.status);\n  return new Uint8Array')
    s = sub1(s, 'const r = await fetch(url);\n  if (!r.ok) throw new Error(url + \': HTTP \' + r.status);\n  return await r.text',
                'const r = await fetch(assetUrl(url));\n  if (!r.ok) throw new Error(url + \': HTTP \' + r.status);\n  return await r.text')
    s = sub1(s, 'await (await fetch(sceneUrl)).json()', 'await (await fetch(assetUrl(sceneUrl))).json()')
    return s

IPAD_JS = '''    <script>
      // iPad/iOS Safari: 100vh/100vw are the *largest* viewport, not the visible one.
      // Track the real visible size and expose it as --vw/--vh for the stage rules.
      (function () {
        var r = document.documentElement;
        function fit() {
          var v = window.visualViewport;
          r.style.setProperty('--vw', Math.round(v ? v.width : window.innerWidth) + 'px');
          r.style.setProperty('--vh', Math.round(v ? v.height : window.innerHeight) + 'px');
        }
        fit();
        window.addEventListener('resize', fit);
        window.addEventListener('orientationchange', function () { setTimeout(fit, 150); });
        if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
        document.addEventListener('fullscreenchange', function () { setTimeout(fit, 100); });
        document.addEventListener('webkitfullscreenchange', function () { setTimeout(fit, 100); });
      })();
    </script>
'''
IPAD_CSS = '''      #canvas { position: absolute; inset: 0; width: 100% !important; height: 100% !important; margin: 0 !important; }
'''

def make_template():
    s = open(KIT_HTML).read()
    s = s.replace('100vh * var(--aspect)', 'var(--vh, 100vh) * var(--aspect)')
    s = re.sub(r'(min\((?:\d+px, )?)100vw,', r'\1var(--vw, 100vw),', s)
    s = sub1(s, 'position: fixed; inset: 0;\n        display: flex',
                'position: fixed; left: 0; top: 0; width: var(--vw, 100%); height: var(--vh, 100%);\n        display: flex')
    s = sub1(s, '    </style>', IPAD_CSS + '    </style>')
    s = sub1(s, '  </head>', IPAD_JS + '  </head>')
    # per-artwork placeholders
    s = sub1(s, '<title>me_005 — Transient mint</title>', '<title>@TITLE@</title>')
    s = sub1(s, 'content="me_005"', 'content="@TITLE@"')
    s = sub1(s, 'style="--aspect: 0.750000"', 'style="--aspect: @ASPECT@"')
    s = sub1(s, 'min(768px,', 'min(@WIDTH@px,')
    s = sub1(s, 'NATIVE size (768x1024)', 'NATIVE size (@WIDTH@x@HEIGHT@)')
    s = sub1(s, 'const SCENE_FILE = "scene.json";', 'const SCENE_FILE = "@SCENE@";')
    s = sub1(s, '"splat_strokes_solvent_me_005.poster.jpg"', '"@POSTER_JPG@"')
    s = sub1(s, '"splat_strokes_solvent_me_005.poster.webm"', '"@POSTER_WEBM@"')
    return s

def inject_cid(html, cid):
    return re.sub(r'const ARTWORK_CID = "[^"]*";', 'const ARTWORK_CID = "%s";' % cid, html, count=1)

def build(cids):
    template = make_template()
    boot = patched_boot()
    shutil.rmtree(OUT, ignore_errors=True)
    index = {}
    for d in sorted(glob.glob(os.path.join(ROOT, 'singleview__*'))):
        name = os.path.basename(d)
        m = DIR_RE.match(name)
        if not m: print('skip (name)', name); continue
        asset = m.group(1) + (m.group(2) or '')
        scenes = glob.glob(os.path.join(d, '*.scene.json'))
        assert len(scenes) == 1, (name, scenes)
        scene = json.load(open(scenes[0]))
        prefix = scene['prefix']
        folder = os.path.join(OUT, asset, asset)  # IPFS folder named like the artwork
        os.makedirs(folder)
        for f in RUNTIME_FILES:
            if f == 'boot.js': open(os.path.join(folder, f), 'w').write(boot)
            else: shutil.copy(os.path.join(RUNTIME, f), folder)
        for f in sorted(os.listdir(d)):
            if SKIP.search(f) or f.endswith('.scene.json'): continue
            if not f.startswith(prefix): print('  warn: unprefixed', name, f); continue
            shutil.copy(os.path.join(d, f), folder)
        shutil.copy(scenes[0], os.path.join(folder, 'scene.json'))
        # every manifest-referenced file + poster must be present
        refs = list(scene.get('geometry', [])) + list(scene.get('images', [])) + list(scene.get('textures', {}).values())
        refs += [scene[k] for k in ('frag', 'vert', 'camera') if scene.get(k)]
        missing = [prefix + r for r in refs if not os.path.exists(os.path.join(folder, prefix + r))]
        poster_jpg, poster_webm = prefix + 'poster.jpg', prefix + 'poster.webm'
        missing += [p for p in (poster_jpg, poster_webm) if not os.path.exists(os.path.join(folder, p))]
        if missing: sys.exit('MISSING in %s: %s' % (asset, missing))
        w, h = scene['width'], scene['height']
        title = 'Medium No. %d' % edition_number(d, asset)
        html = template
        for k, v in {'@TITLE@': title, '@ASPECT@': '%.6f' % (w / h), '@WIDTH@': str(w), '@HEIGHT@': str(h),
                     '@SCENE@': 'scene.json', '@POSTER_JPG@': poster_jpg, '@POSTER_WEBM@': poster_webm}.items():
            html = html.replace(k, v)
        assert '@' not in re.sub(r'[\w.+-]+@[\w.-]+', '', html.split('<script')[0]), 'unfilled placeholder'
        if asset in cids: html = inject_cid(html, cids[asset])
        open(os.path.join(OUT, asset + '.html'), 'w').write(html)  # the one file for Transient
        size = sum(os.path.getsize(os.path.join(folder, f)) for f in os.listdir(folder))
        index[asset] = {'source': name, 'shader': m.group(3), 'size_bytes': size, 'files': len(os.listdir(folder))}
        print('%-44s %5.1f MB  %d files  %dx%d' % (asset, size / 1e6, index[asset]['files'], w, h))
    json.dump({a: '' for a in index}, open(os.path.join(OUT, 'cids.template.json'), 'w'), indent=1)
    if cids: json.dump({a: cids.get(a, '') for a in index}, open(os.path.join(OUT, 'cids.json'), 'w'), indent=1)  # rmtree above would otherwise delete it
    json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
    open(os.path.join(OUT, '.gitignore'), 'w').write(''.join('%s/%s/\n' % (a, a) for a in index))
    print('built %d kits in %s' % (len(index), OUT))

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--cids', help='JSON {asset: folder CID} to inject into the HTMLs')
    a = ap.parse_args()
    cids = json.load(open(a.cids)) if a.cids else {}
    build({k: v for k, v in cids.items() if v})
