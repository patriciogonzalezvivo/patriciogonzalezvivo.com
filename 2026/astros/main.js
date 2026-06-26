import './overlay-controls.js'; 
import './wasm-loader.js';

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

    // Use ResizeObserver to handle the CSS transition smoothly
    // This fires repeatedly as the element resizes during transition
    const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
    });
    resizeObserver.observe(wrapper);
});
