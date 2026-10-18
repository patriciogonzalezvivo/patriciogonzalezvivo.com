// Self-contained bundle boot script.
//
// Drives the glslViewer WASM runtime to reproduce, in the browser, exactly the
// scene apply.py would have rendered natively -- reading a sibling scene.json
// manifest (written by utils/wasm_export.py) and replaying it through the same
// runtime C API the interactive editor uses (ccall'd `command`/`setFrag`/
// `setVert`/`loadAsset`/`loadTexture`, see glslViewer/src/main.cpp).
//
// Every asset is fetched by *relative* path so the whole directory can be
// pinned to IPFS as a unit (objkt.com interactive token) with no server, no
// CDN, and no cross-origin headers -- the wasm build is single-threaded, so no
// SharedArrayBuffer/COOP-COEP is required.

const POLL_MS = 50;

// Fullscreen toggle (embed mode). Wired up immediately -- it's pure DOM and
// doesn't depend on the wasm runtime being ready. Fullscreen is requested on
// the whole document (not the stage element) so the stage's aspect-lock CSS
// keeps letterboxing the render at its true aspect instead of the UA
// stretching a :fullscreen element to fill the screen. Works from inside a
// host <iframe> as long as that iframe carries `allowfullscreen` (EMBED.md).
function setupFullscreen() {
  const btn = document.getElementById('fsbtn');
  if (!btn) return;
  const enter = document.documentElement;
  btn.addEventListener('click', () => {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      const req = enter.requestFullscreen || enter.webkitRequestFullscreen;
      const p = req && req.call(enter);
      if (p && p.catch) p.catch((e) => console.warn('fullscreen denied:', e.message));
    }
  });
  const sync = () => {
    const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.classList.toggle('is-fullscreen', on);
  };
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
}
setupFullscreen();

function moduleReady() {
  return window.Module && window.module_loaded && window.Module.ccall && window.Module.FS;
}

function hasLoadTexture() {
  // The named-texture export (glslViewer CMakeLists EXPORTED_FUNCTIONS) is only
  // present in a wasm built after that change. Degrade gracefully if it isn't.
  return typeof window.Module._loadTexture === 'function';
}

function command(cmd) {
  window.Module.ccall('command', null, ['string'], [cmd]);
}

function showError(msg) {
  const el = document.getElementById('err');
  if (el) { el.style.display = 'block'; el.textContent += msg + '\n'; }
  console.error(msg);
}

function setProgress(fraction) {
  const fill = document.getElementById('loadbar-fill');
  if (fill) fill.style.width = Math.max(0, Math.min(1, fraction)) * 100 + '%';
}

function hidePoster() {
  setProgress(1);
  const p = document.getElementById('poster');
  const bar = document.getElementById('loadbar');
  if (p) { p.classList.add('hidden'); setTimeout(() => { p.style.display = 'none'; }, 600); }
  if (bar) { bar.classList.add('hidden'); setTimeout(() => { bar.style.display = 'none'; }, 600); }
}

async function fetchBytes(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ': HTTP ' + r.status);
  return new Uint8Array(await r.arrayBuffer());
}

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ': HTTP ' + r.status);
  return await r.text();
}

function writeToFS(name, bytes) {
  window.Module.FS.writeFile(name, bytes);
}

// Write an already-fetched asset into MEMFS and dispatch it by extension --
// same path the native CLI uses for positional args (.splat/.ply/.obj/.glb...,
// .csv, and images -> u_tex0/u_tex1/... in load order).
function applyAsset(name, bytes) {
  writeToFS(name, bytes);
  const ext = name.split('.').pop().toLowerCase();
  window.Module.ccall('loadAsset', null, ['string', 'string'], [name, ext]);
}

// Named textures (u_alignedTex, u_strokeIndicesTex, ...) need the explicit
// binding export -- loadAsset can't name them.
function applyNamedTexture(uniform, name, bytes) {
  writeToFS(name, bytes);
  if (hasLoadTexture()) {
    window.Module.ccall('loadTexture', null, ['string', 'string'], [uniform, name]);
  } else {
    const ext = name.split('.').pop().toLowerCase();
    window.Module.ccall('loadAsset', null, ['string', 'string'], [name, ext]);
    showError('loadTexture export missing: ' + uniform + ' not bound by name (rebuild wasm)');
  }
}

async function boot() {
  // Each sandbox names its manifest uniquely so many can share one folder; the
  // page sets window.SANDBOX_SCENE (default 'scene.json'). Every asset listed in
  // the manifest keeps a plain base name (main.frag, camera.csv, ...), but on
  // disk it's stored as `<prefix><base>` (scene.prefix) so names don't collide
  // in the shared folder. We fetch the prefixed URL and write MEMFS under the
  // plain base name -- each iframe has its own MEMFS, so base names are unique
  // there and the wasm loader's filename conventions still apply.
  const sceneUrl = window.SANDBOX_SCENE || 'scene.json';
  let scene;
  try {
    scene = await (await fetch(sceneUrl)).json();
  } catch (e) {
    showError('Failed to load ' + sceneUrl + ': ' + e.message);
    return;
  }
  const prefix = scene.prefix || '';

  // PREFETCH everything first, THEN apply it synchronously (below) in one tick.
  // Why: the render loop (requestAnimationFrame) keeps ticking during `await`s,
  // so interleaving fetches with the ccalls would let frames render in a
  // half-set-up state -- and load *order* has side effects that must not be
  // split by a frame:
  //   * a standalone .splat picks its coordinate frame AT LOAD TIME from a flag
  //     that `camera.csv` (addCameras) sets -- so the camera MUST be loaded
  //     before the geometry or the splat lands in the wrong (non-COLMAP) frame;
  //   * addCameras also marks the scene a COLMAP frame, which suppresses the
  //     auto floor -- if a frame renders with the default scene shader (which
  //     references FLOOR) before that flag is set, a floor gets created and
  //     sticks.
  // Fetching up front and applying with no intervening `await` reproduces the
  // native CLI's "register everything, then set up once" ordering.
  let bytesFor, fragSrc, vertSrc;
  try {
    const names = new Set();
    if (scene.camera) names.add(scene.camera);
    for (const g of (scene.geometry || [])) names.add(g);
    for (const img of (scene.images || [])) names.add(img);
    for (const f of Object.values(scene.textures || {})) names.add(f);

    const list = [...names];
    const total = list.length + (scene.frag ? 1 : 0) + (scene.vert ? 1 : 0);
    let done = 0;
    const tick = () => { done++; setProgress(total ? done / total : 1); };

    // Fetch from the prefixed disk URL, key the bytes by the plain base name.
    const buffers = await Promise.all(
      list.map((n) => fetchBytes(prefix + n).then((b) => { tick(); return b; }))
    );
    bytesFor = Object.fromEntries(list.map((n, i) => [n, buffers[i]]));

    [fragSrc, vertSrc] = await Promise.all([
      scene.frag ? fetchText(prefix + scene.frag).then((s) => { tick(); return s; }) : Promise.resolve(null),
      scene.vert ? fetchText(prefix + scene.vert).then((s) => { tick(); return s; }) : Promise.resolve(null),
    ]);
  } catch (e) {
    showError('Failed to fetch assets: ' + e.message);
    hidePoster();
    return;
  }

  try {
    // Compile-time defines must land before the shaders compile.
    for (const d of (scene.defines || [])) command('define,' + d);

    // Camera FIRST (sets the COLMAP frame flag), then geometry, then textures.
    if (scene.camera) applyAsset(scene.camera, bytesFor[scene.camera]);
    for (const g of (scene.geometry || [])) applyAsset(g, bytesFor[g]);
    for (const img of (scene.images || [])) applyAsset(img, bytesFor[img]);
    for (const [uniform, file] of Object.entries(scene.textures || {})) {
      applyNamedTexture(uniform, file, bytesFor[file]);
    }

    // Shaders last, so the scene rebuilds with every asset already resident.
    // Set fragment + vertex together in a SINGLE compile via setShaders: doing
    // setFrag then setVert (two resetShaders calls) makes a 3D scene's second
    // compile see LIGHT_SHADOWMAP already defined -- the custom fragment then
    // references v_lightCoord while the custom vertex isn't paired with it yet,
    // giving "FRAGMENT varying v_lightCoord does not match any VERTEX varying".
    // The combined export compiles once, exactly like the native CLI. Fall back
    // to the two-call path on an older wasm that lacks setShaders.
    if (typeof window.Module._setShaders === 'function' && fragSrc != null && vertSrc != null) {
      window.Module.ccall('setShaders', null, ['string', 'string'], [fragSrc, vertSrc]);
    } else {
      if (vertSrc != null) window.Module.ccall('setVert', null, ['string'], [vertSrc]);
      if (fragSrc != null) window.Module.ccall('setFrag', null, ['string'], [fragSrc]);
    }

    for (const c of (scene.commands || [])) command(c);
    command('update');
  } catch (e) {
    showError('Scene setup error: ' + e.message);
  }

  hidePoster();
}

const timer = setInterval(() => {
  if (moduleReady()) { clearInterval(timer); boot(); }
}, POLL_MS);
