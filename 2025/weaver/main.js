import './overlay-controls.js'; 
import './wasm-loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('resize-btn');
    if (!btn) return;

    const wrapper = document.getElementById('wrapper');
    let isFullscreen = false;

    btn.addEventListener('click', () => {
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            wrapper.classList.add('fullscreen');
            wrapper.classList.remove('windowed');
            document.body.classList.remove('windowed-mode');
        } else {
            wrapper.classList.remove('fullscreen');
            wrapper.classList.add('windowed');
            document.body.classList.add('windowed-mode');
        }
    });

    // Use ResizeObserver to handle the CSS transition smoothly
    // This fires repeatedly as the element resizes during transition
    const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
    });
    resizeObserver.observe(wrapper);
});
