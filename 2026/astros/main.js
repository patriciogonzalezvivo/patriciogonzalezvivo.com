import './overlay-controls.js'; 
import './wasm-loader.js';

// The right button plays the header (the app reads window.AstrosPointer.right every frame). It counts when it went down on the chart
// (the canvas or the layers around it), not on the settings panel or the page's buttons, and it lets go when the button comes up
// anywhere, on window blur, or when a move arrives with the button no longer held. Check it in the console: AstrosPointer.right.
window.AstrosPointer = { right: false };
(function () {
    const pointer = window.AstrosPointer;
    const onChart = (e) => {
        const path = e.composedPath ? e.composedPath() : [e.target];
        for (const n of path) {
            if (n === window.Module?.canvas || n.id === 'canvas' || n.id === 'wrapper') return true;
            if (n.tagName === 'OVERLAY-CONTROLS' || n.id === 'ui' || n.tagName === 'BUTTON' || n.tagName === 'INPUT' || n.tagName === 'SELECT') return false;
        }
        return e.target === document.body || e.target === document.documentElement;
    };
    window.addEventListener('mousedown', (e) => { if (e.button === 2 && onChart(e)) pointer.right = true; }, true);
    window.addEventListener('pointerdown', (e) => { if (e.button === 2 && e.pointerType === 'mouse' && onChart(e)) pointer.right = true; }, true);
    window.addEventListener('mouseup', (e) => { if (e.button === 2) pointer.right = false; }, true);
    window.addEventListener('pointerup', (e) => { if (e.button === 2) pointer.right = false; }, true);
    window.addEventListener('mousemove', (e) => { if (pointer.right && !(e.buttons & 2)) pointer.right = false; }, true);
    window.addEventListener('blur', () => { pointer.right = false; });
    window.addEventListener('contextmenu', (e) => { if (onChart(e)) e.preventDefault(); }, true);
})();

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
