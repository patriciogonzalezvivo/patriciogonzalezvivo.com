import './overlay-controls.js'; 
import './wasm-loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('resize-btn');
    if (!btn) return;

    const wrapper = document.getElementById('wrapper');
    let isFullscreen = wrapper.classList.contains('fullscreen');

    // A clicked button keeps the keyboard focus, and then the space bar (the app's time-lapse key) presses it again: it would
    // toggle fullscreen instead of reaching the app. The button never takes focus from the mouse, and the canvas gets it back.
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter')
            e.preventDefault();
    });
    btn.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'Enter')
            e.preventDefault();       // a button also clicks itself on the key's release
    });

    btn.addEventListener('click', () => {
        btn.blur();
        if (window.Module && window.Module.canvas)
            window.Module.canvas.focus();
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

    // Use ResizeObserver to handle the CSS transition smoothly
    // This fires repeatedly as the element resizes during transition
    const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
    });
    resizeObserver.observe(wrapper);
});
