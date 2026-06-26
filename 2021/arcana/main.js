import './wasm-loader.js';
import { GlslViewerIntegration } from './glslviewer_integration.js';

// ── Fullscreen toggle ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('resize-btn');
    if (!btn) return;

    const wrapper = document.getElementById('wrapper');
    let isFullscreen = false;

    const setFullscreen = (enable) => {
        isFullscreen = enable;
        if (enable) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            wrapper.classList.add('fullscreen');
            wrapper.classList.remove('windowed');
            document.body.classList.remove('windowed-mode');
        } else {
            wrapper.classList.remove('fullscreen');
            wrapper.classList.add('windowed');
            document.body.classList.add('windowed-mode');
        }
        const params = new URLSearchParams(window.location.search);
        if (enable) params.set('fullscreen', 'true');
        else params.delete('fullscreen');
        const s = params.toString();
        history.replaceState(null, '', s ? '?' + s : window.location.pathname);
    };

    if (new URLSearchParams(window.location.search).get('fullscreen') === 'true') setFullscreen(true);

    btn.addEventListener('click', () => setFullscreen(!isFullscreen));

    new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
    }).observe(wrapper);
});

// ── WASM / shader setup ────────────────────────────────────────────
const glslviewer = new GlslViewerIntegration((msg) => {
    console.log(msg);
    if (msg === '> render') {
        const loader = document.querySelector('wasm-loader');
        if (loader) {
            loader.style.visibility = 'hidden';
            loader.shadowRoot.innerHTML = '';
        }
        const urlCard = new URLSearchParams(window.location.search).get('card');
        const initialCard = (urlCard && ARCANA_INDEX[urlCard] !== undefined) ? urlCard : 'fool';
        setArcana(initialCard, { select: true, scroll: true });
    }
});

const shadersPromise = Promise.all([
    fetch(new URL('arcana.frag', import.meta.url)).then(r => r.text()),
    fetch(new URL('arcana.vert', import.meta.url)).then(r => r.text()),
]);

let cachedFrag = null;
let selectedArcana = 'fool';

const ARCANA_INDEX = {
    fool: 0, magician: 1, highPriestess: 2, empress: 3, emperator: 4,
    hierophant: 5, lovers: 6, chariot: 7, strength: 8, hermit: 9,
    fortune: 10, justice: 11, hanged: 12, death: 13, temperance: 14,
    devil: 15, tower: 16, star: 17, moon: 18, sun: 19, judgement: 20, world: 21,
};

// ── Arcana carousel ────────────────────────────────────────────────
function setArcana(fnName, { select = false, scroll = false } = {}) {
    if (!cachedFrag) return;
    if (select) {
        selectedArcana = fnName;
        const params = new URLSearchParams(window.location.search);
        params.set('card', fnName);
        const s = params.toString();
        history.replaceState(null, '', s ? '?' + s : window.location.pathname);
    }

    glslviewer.sendCommand(`u_card,${ARCANA_INDEX[fnName] ?? 0}`);

    const btn = document.querySelector(`.arcana-item[data-fn="${fnName}"]`);
    document.querySelectorAll('.arcana-item').forEach(el => el.classList.toggle('active', el === btn));

    const link = document.getElementById('arcana-link');
    if (link && btn) {
        link.textContent = btn.dataset.label ?? fnName;
        link.href = btn.dataset.url ?? '#';
    }

    if (scroll && btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.arcana-item').forEach(btn => {
        btn.addEventListener('mouseenter', () => setArcana(btn.dataset.fn));
        btn.addEventListener('click', () => setArcana(btn.dataset.fn, { select: true, scroll: true }));
    });

    const carousel = document.getElementById('arcana-carousel');
    carousel.addEventListener('mouseleave', () => setArcana(selectedArcana));

    const initial = document.querySelector('.arcana-item.active');
    if (initial) setTimeout(() => initial.scrollIntoView({ block: 'nearest', inline: 'center' }), 150);
});

// ── Module ready → load geometry, camera, shaders ─────────────────
const checkModule = setInterval(() => {
    if (glslviewer.isModuleReady()) {
        clearInterval(checkModule);
        shadersPromise.then(([frag, vert]) => {
            cachedFrag = frag;
            // glslviewer.sendCommand('pcl_plane,512');
            // glslviewer.sendCommand('camera_position,0.0,0.0,-7.0');
            // glslviewer.sendCommand('look_at,0.0,0.0,0.0');
            glslviewer.setFrag(frag);
            glslviewer.setVert(vert);
            glslviewer.sendCommand('render');
        });
    }
}, 500);
