import './wasm-loader.js';
import { GlslViewerIntegration } from './glslviewer_integration.js';

// ── Fullscreen toggle ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('resize-btn');
    if (!btn) return;

    const wrapper = document.getElementById('wrapper');
    let isFullscreen = wrapper.classList.contains('fullscreen');

    btn.addEventListener('click', () => {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            wrapper.classList.add('fullscreen');
            wrapper.classList.remove('windowed');
            document.body.classList.remove('windowed-mode');
        } else {
            wrapper.classList.remove('fullscreen');
            wrapper.classList.add('windowed');
            document.body.classList.add('windowed-mode');
        }
    });

    new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
    }).observe(wrapper);
});

// ── WASM / shader setup ────────────────────────────────────────────
const glslviewer = new GlslViewerIntegration();

const shadersPromise = Promise.all([
    fetch(new URL('arcana.frag', import.meta.url)).then(r => r.text()),
    fetch(new URL('arcana.vert', import.meta.url)).then(r => r.text()),
]);

let cachedFrag = null;
let activeArcana = 'magician';

// ── Arcana carousel ────────────────────────────────────────────────
function setArcana(fnName) {
    if (!cachedFrag) return;
    activeArcana = fnName;

    // Prepend a #define so the #ifndef guard in the shader uses our value
    const newFrag = `#define CARD_FNC ${fnName}\n` + cachedFrag;
    glslviewer.setFrag(newFrag);

    document.querySelectorAll('.arcana-item').forEach(el => {
        el.classList.toggle('active', el.dataset.fn === fnName);
    });

    const activeEl = document.querySelector(`.arcana-item[data-fn="${fnName}"]`);
    if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.arcana-item').forEach(btn => {
        btn.addEventListener('click', () => setArcana(btn.dataset.fn));
    });

    // Scroll the initial active item (Magician) into view
    const initial = document.querySelector('.arcana-item.active');
    if (initial) {
        setTimeout(() => initial.scrollIntoView({ inline: 'center' }), 150);
    }
});

// ── Load Fool when glslViewer echoes first "render" ───────────────
{
    let foolLoaded = false;
    window.addEventListener('wasm-stdout', (e) => {
        if (foolLoaded || typeof e.detail !== 'string') return;
        if (e.detail.trim() === 'render') {
            foolLoaded = true;
            setArcana('fool');
        }
    });
}

// ── Module ready → load geometry, camera, shaders ─────────────────
const checkModule = setInterval(() => {
    if (glslviewer.isModuleReady()) {
        clearInterval(checkModule);
        shadersPromise.then(([frag, vert]) => {
            cachedFrag = frag;
            // glslviewer.sendCommand('pcl_plane,512');
            // glslviewer.sendCommand('camera_position,0.0,0.0,-7.0');
            // glslviewer.sendCommand('look_at,0.0,0.0,0.0');
            glslviewer.setFrag(`#define CARD_FNC ${activeArcana}\n` + frag);
            glslviewer.setVert(vert);
            glslviewer.sendCommand('render');
        });
    }
}, 500);
