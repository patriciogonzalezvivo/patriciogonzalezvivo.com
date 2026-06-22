import './wasm-loader.js';
import { GlslViewerIntegration } from './glslviewer_integration.js';

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

const glslviewer = new GlslViewerIntegration();

// Pre-fetch the pre-resolved shaders in parallel with WASM loading
const shadersPromise = Promise.all([
    fetch(new URL('arcana.frag', import.meta.url)).then(r => r.text()),
    fetch(new URL('arcana.vert', import.meta.url)).then(r => r.text())
]);

// Once WASM is ready: send geometry + camera commands first, then the shaders
const checkModule = setInterval(() => {
    if (glslviewer.isModuleReady()) {
        clearInterval(checkModule);
        shadersPromise.then(([frag, vert]) => {
            // glslviewer.sendCommand('pcl_plane,512');
            // glslviewer.sendCommand('camera_position,0.0,0.0,-7.0');
            glslviewer.setFrag(frag);
            glslviewer.setVert(vert);
            glslviewer.sendCommand('render');
        });
    }
}, 500);
