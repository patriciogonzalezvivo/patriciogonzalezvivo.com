# Medium: mint pipeline

How the 24 *Medium* studies went from `singleview__*` sandbox folders to minted tokens on
[Transient](https://www.transient.xyz/nfts/ethereum/0x16d291efbfa270835399b45c7452669caa3f8230).
Written so the pipeline can be repeated for a new batch.

```
singleview__<asset>__splat_strokes_<shader>/     (24 sandboxes, one per painting)
        |  share_runtime.py      one shared copy of the glslViewer runtime
        |  mint_build.py         IPFS folder + launcher HTML per asset (into build/)
        v
build/<asset>/<asset>/   ->  upload to IPFS (Filebase, also on Pinata)  ->  folder CID
build/medium_nNN.html    ->  CID written into it (--cids), copy to mint/
mint/medium_nNN.gif/.webm   preview animation
        |  upload medium_nNN.html to Transient (it is part of the token metadata)
        v
tokens on Ethereum (contract 0x16d291ef...3f8230)
```

## What each piece is

| Piece | Role |
|---|---|
| `singleview__<asset>__splat_strokes_<shader>/` | One sandbox per painting: stroke splat, shaders, textures, `scene.json`, `poster.jpg`/`poster.webm`, `info.txt` ("Digital No. N"). |
| `_runtime/471bc23c/` | The shared runtime (`glslViewer.js`, `glslViewer.wasm`, `boot.js`, license). Made by `share_runtime.py`. The folder name is a hash of the three files. |
| `mint_build.py` | Builds one IPFS folder and one launcher HTML (`medium_nNN.html`) per sandbox, into `build/`. |
| `mint_launcher.py` | The IPFS launcher block (gateway order, probe, per-asset failover) applied to every HTML. |
| `build/<asset>/<asset>/` | The folder uploaded to IPFS: runtime + scene + poster. Output of `mint_build.py`, gitignored. |
| `mint/medium_nNN.html` | The launcher HTML minted on Transient. It loads the piece from IPFS by `ARTWORK_CID`. |
| `mint/medium_nNN.webm` | Looping preview, used by `index.php`. Committed. |
| `mint/medium_nNN.gif` | Large preview for the mint. Gitignored (about 7 MB each). |
| `mint/cids.json` | `{asset: folder CID}`. Starts from `cids.template.json` (all empty). |
| `mint/index.json` | Per-asset source folder, shader, size and file count. |
| `tokens.json` | Edition number to on-chain token ID. |
| `index.php` | The site page. It lists studies from `mint/medium_n*.html` and matches each CID back to its asset. |

## Pipeline

### 1. Get the sandboxes
The `singleview__*` folders are not in the working tree. They were deleted in commit
`e87e564f0` and live in git history. To get them back:

```bash
cd 2026/medium
git checkout e87e564f0^ -- 'singleview__*'
```

For a new batch, export new sandboxes into this folder using the same naming:
`singleview__<asset>[_fit]__splat_strokes_<shader>`.
Each needs a `<prefix>.scene.json`, its shaders and textures, `<prefix>.poster.jpg`,
`<prefix>.poster.webm`, and an `info.txt` containing a line like `title: ... No. 13`.
`mint_build.py` stops with `MISSING in <asset>` if a file referenced by the scene or a poster is absent.

### 2. Share the runtime
```bash
python3 share_runtime.py --dry-run     # report only
python3 share_runtime.py               # one copy per runtime version, in _runtime/<version>/
python3 share_runtime.py --use DIR     # force every sandbox onto the runtime in DIR
```
`mint_build.py` reads the runtime from `_runtime/471bc23c`. If you change the runtime
version, update `RUNTIME` at the top of `mint_build.py`. The runtime files are
identical in every folder, so IPFS stores them once.

### 3. Build the IPFS folders and HTMLs
```bash
python3 mint_build.py                          # -> build/<asset>/<asset>/ and build/medium_nNN.html
python3 mint_build.py --cids mint/cids.json    # same, with the folder CIDs written into the HTMLs
python3 mint_build.py --sandboxes DIR          # sandboxes somewhere else (e.g. restored from git)
python3 mint_build.py --template FILE          # force a base HTML
python3 mint_build.py --out DIR [--force]
```
- Output goes to `build/` (gitignored). The script **refuses to write into a folder that
  already holds `medium_n*.html` or `.webm` files** unless you pass `--force`, so it can no
  longer wipe `mint/` by accident.
- **Base HTML.** If Transient's kit (`artist-mint-kit/2-upload-html-to-transient/transient-upload.html`)
  exists, it is used. That kit is not in the repo, so the script falls back to
  `mint/medium_n01.html` and turns it back into a template. Either way, the launcher
  block is replaced from `mint_launcher.py`, so new HTMLs always get the current launcher.
- Per-artwork values (`@TITLE@`, `@ASPECT@`, `@WIDTH@`, `@HEIGHT@`, `@SCENE@`,
  `@POSTER_JPG@`, `@POSTER_WEBM@`) are filled from each sandbox's `scene.json` and `info.txt`.
- The file is named `medium_nNN.html` from the edition number in `info.txt`
  (`NUMBER_OVERRIDES` covers the one sandbox without an `info.txt`).
- `boot.js` is patched so all its fetches go through the selected gateway
  (`IPFS_ASSET_BASE`). Edit `mint_launcher.py` to change gateways or retry behaviour.
- `--cids` writes `cids.json`; without it the HTMLs keep `ARTWORK_CID = ""` until you fill
  them. `index.json` (now with an `edition` field), `cids.template.json` and a `.gitignore`
  for the IPFS folders are written next to the HTMLs.

Tested on 2026-11-21: sandboxes restored from git, built with `--cids mint/cids.json`. All 24
HTMLs match the minted ones, except that 23 of them differ in one CSS comment (wording only).

### 4. Upload the folders to IPFS
Upload each `mint/<asset>/<asset>/` **as a folder**. The folder CID is what you need,
not the CID of any single file. The 24 folders were uploaded to Filebase (S3 bucket
`medium`) and are also on Pinata. Write the CIDs into `mint/cids.json`:

```json
{ "06d9122360608c8fb5b7fa8373c74e86": "bafybei..." }
```
Then rebuild with `--cids` or edit `const ARTWORK_CID = "..."` in each HTML.
Before minting, check every CID on the gateway you will rely on:

```bash
curl -sI -H "Origin: null" https://ipfs.filebase.io/ipfs/<CID>/scene.json
# expect HTTP 200 and Access-Control-Allow-Origin: *
```

### 5. Copy the HTMLs into `mint/`
Copy `build/medium_nNN.html` into `mint/` (already named by edition). The asset-to-edition
mapping is in the table at the bottom. For a new batch, set the numbers in each sandbox's
`info.txt` and keep `tokens.json` in sync.

### 6. Previews (`.gif` and `.webm`)
Each edition needs `medium_nNN.gif` and `medium_nNN.webm` in `mint/`. The GIF was used for
the mint; the site uses the WebM (`index.php` reads `mint/medium_n*.webm`). The GIFs were
replaced by WebMs on the site in commit `ff1023359` because of size (7 MB vs 0.2 MB).

> **Not recorded.** The tool and settings used to make the GIFs/WebMs are not in the repo.
> Each sandbox already has a `<prefix>.poster.webm`, which is probably the source, but I
> could not confirm that. Fill in the actual command here the next time you do it.

### 7. Upload the HTML to Transient and mint
`medium_nNN.html` is part of the token metadata on Transient. Upload it there and mint.
`tokens.json` records which token ID each edition received (editions 8 to 11, 12 to 15
and 20 to 23 are in reverse order on chain).

## Launcher behaviour (important)
The launcher inside each HTML decides how the piece loads from IPFS. The mint HTML runs
in a sandboxed iframe with origin `null`, so every fetch is cross-origin and a gateway
error without a CORS header shows up as a CORS error.

The version minted first picked one random gateway after probing only `scene.json`, and
had no retry. Occasionally (usually the first load of the day, on a cold public gateway)
the shaders then failed and the piece did not render. It was fixed on 2026-11-20 by editing
the 24 HTMLs in place (commit `0ca12601a`):

- gateway order: Filebase, Pinata, 4EVERLAND, seadn, Transient, ipfs.io (no random rotation);
- the probe fetches `scene.json` **and** a shader before picking a gateway;
- `window.fetch` is wrapped, so a failed or timed-out artwork request retries on the next
  gateway (two rounds, 30 s timeout);
- the `glslViewer.js` script load and the `boot.js` import fail over the same way.

The launcher now lives in `mint_launcher.py`, and `mint_build.py` applies it to every HTML,
so new batches get it automatically.

Verified in headless Chrome inside a sandboxed iframe: normal load, Filebase blocked,
Filebase and Pinata blocked, and Filebase failing on shader/texture/wasm files after the
probe passed. All four rendered.

## Checklist for a new batch
1. Sandboxes in place and runtime shared (steps 1 and 2).
2. `python3 mint_build.py --out build_new` (it uses Transient's kit if present, else `mint/medium_n01.html`).
3. Upload the folders to Filebase **and** Pinata, record CIDs in `cids.json`, then check each
   CID on `ipfs.filebase.io` (200 plus CORS header).
4. Rebuild with `--cids` so the CIDs are inside the HTMLs.
5. Warm the CIDs on the other gateways once with `curl -I` before minting.
6. Test one HTML in a `sandbox="allow-scripts"` iframe, once normally and once with
   `ipfs.filebase.io` blocked.
7. Make previews, upload the HTMLs to Transient, mint, and update `tokens.json`.

## Edition map

| Edition | File | Token ID | Asset | Shader |
|---|---|---|---|---|
| 1 | medium_n01 | 1 | `06d9122360608c8fb5b7fa8373c74e86` | paint_rt |
| 2 | medium_n02 | 2 | `3cc876bb65e2756936596b6aa8507089` | solvent |
| 3 | medium_n03 | 3 | `okeeffe_001_fit` | fill2 |
| 4 | medium_n04 | 4 | `2212d8cc710620d64f6a5efd494eed27` | paint |
| 5 | medium_n05 | 5 | `ac1c4534a9c444ca626a0180c30348a4` | solvent |
| 6 | medium_n06 | 6 | `58f0e97c08629d737649e8c90338e9c9_fit` | fill2 |
| 7 | medium_n07 | 7 | `b9e4b33399ba7602a648f0dbc8f1abc1` | fill2 |
| 8 | medium_n08 | 11 | `eb1ab75d654051126f5bf5f4841ed66d` | paint |
| 9 | medium_n09 | 10 | `22bb3f9d1ad87946917f647a120eb440` | disolve |
| 10 | medium_n10 | 9 | `303ddbc50da6b3bc0b69c12c4c5300b3` | fill2 |
| 11 | medium_n11 | 8 | `fa3d64d246f1fc64a74ed15a2ccb59cb_fit` | disolve |
| 12 | medium_n12 | 15 | `05e14f4dd67655eabfe72d9f531f36f8` | fill2 |
| 13 | medium_n13 | 14 | `3a6a7d43775d925c1bab1cb1a243b746` | fill2 |
| 14 | medium_n14 | 13 | `27139018e1337f1171924809cbb19230_fit` | paint_rt |
| 15 | medium_n15 | 12 | `354728908173446889` | solvent |
| 16 | medium_n16 | 16 | `3d185ffde1158174d492bce1357e1261_fit` | richter |
| 17 | medium_n17 | 17 | `4040dc20f6e9196ec2e341131c9ace56_fit` | solvent |
| 18 | medium_n18 | 18 | `43fd8e2c47a0c738811eea8888d16af8_fit` | fluid2 |
| 19 | medium_n19 | 19 | `49471902089a08ff21404df3ca673911_fit` | paint |
| 20 | medium_n20 | 23 | `54ccdf5131f483e3874487ff28fd6119_fit` | paint2 |
| 21 | medium_n21 | 22 | `63c2363ef8e1133b8313c1172a518dde_fit` | paint2_rt |
| 22 | medium_n22 | 21 | `97d055f528e17f87b91f7bb320b5d8ad_fit` | paint_rt |
| 23 | medium_n23 | 20 | `e5d7e5beb8fb068932ee20e6b436f231_fit` | fluid2 |
| 24 | medium_n24 | 24 | `me_005` | solvent |
