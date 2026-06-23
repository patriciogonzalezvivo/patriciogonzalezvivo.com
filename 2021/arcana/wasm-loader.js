class WasmLoader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
        // Move this element inside #wrapper so it overlays only the canvas area
        const canvas = document.getElementById('canvas');
        if (canvas && this.parentElement !== canvas.parentElement) {
            canvas.parentElement.appendChild(this);
            return;  // connectedCallback fires again after re-parenting
        }

        // Thumbnail covers the canvas while WASM loads; cleared on '> render'
        const thumb = document.createElement('img');
        thumb.id = 'thumbnail';
        thumb.src = new URL('thumbnail.png', import.meta.url).href;
        thumb.onerror = () => { thumb.style.display = 'none'; };
        this.shadowRoot.appendChild(thumb);

        // Intercept global event listener registration to constrain WASM keyboard input
        // This must be done before the WASM script is loaded.
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
            if ((type === 'keydown' || type === 'keyup' || type === 'keypress') && typeof listener === 'function') {
                const wrappedListener = function(e) {
                    const canvas = document.getElementById('canvas');
                    const wrapper = document.getElementById('wrapper');
                    
                    // 1. Never intercept if the target is an input field (Editor/Console)
                    const target = e.target;
                    const isInput = target.tagName === 'INPUT' || 
                                  target.tagName === 'TEXTAREA' || 
                                  target.isContentEditable ||
                                  (target.closest && target.closest('.CodeMirror')); // Check CodeMirror
                    
                    if (isInput) return; // Let it bubble naturally, don't pass to WASM if it's GLOBAL listener
                    
                    // 2. Only allow WASM to see keys if mouse is over the wrapper OR canvas is focused
                    const isHovering = wrapper && wrapper.matches && wrapper.matches(':hover');
                    const isFocused = document.activeElement === canvas;
                    
                    if (isHovering || isFocused) {
                        listener.call(this, e);
                    }
                };
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        // Keep canvas pixel dimensions in sync with its CSS container so the
        // WASM viewport stays correct after layout changes.
        const syncCanvasSize = () => {
            const parent = canvas.parentElement;
            const rect = parent ? parent.getBoundingClientRect() : null;
            const w = (rect && rect.width  > 0) ? Math.round(rect.width)  : window.innerWidth;
            const h = (rect && rect.height > 0) ? Math.round(rect.height) : window.innerHeight;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width  = w;
                canvas.height = h;
                // Notify the WASM module so it re-evaluates the viewport
                window.dispatchEvent(new Event('resize'));
            }
        };
        syncCanvasSize();
        const _resizeObserver = new ResizeObserver(syncCanvasSize);
        _resizeObserver.observe(canvas.parentElement || canvas);
        this._resizeObserver = _resizeObserver;

        // Create loader elements
        const loader = document.createElement('div');
        loader.className = 'emscripten_loader';
        loader.id = 'emscripten_loader';
        loader.innerHTML = `
            <div id='spinner'></div>
            <div id='status'>Downloading...</div>
            <progress value='50' max='100' id='progress'></progress>
        `;

        // Single unified style block — :host fills #wrapper exactly (position:absolute; inset:0)
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                position: absolute;
                inset: 0;
                z-index: 3;
                overflow: hidden;
                pointer-events: none;
                font-family: 'Lucida Console', Monaco, monospace;
            }

            #thumbnail {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                object-fit: cover;
            }

            .emscripten_loader {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 4;
            }

            #spinner {
                width: 100px;
                height: 100px;
                border-left: 5px solid rgb(200, 200, 200);
                border-right: 5px solid rgb(200, 200, 200);
                border-bottom: 5px solid transparent;
                border-top: 5px solid transparent;
                border-radius: 50%;
                animation: rotation 0.8s linear infinite;
            }

            @keyframes rotation {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }

            #status {
                margin-top: 16px;
                color: rgb(200, 200, 200);
                font-family: monospace;
                font-size: 12px;
            }

            #progress {
                margin-top: 10px;
                height: 10px;
                width: 200px;
                accent-color: rgb(200, 200, 200);
            }
        `;
        
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(loader);

        // Initialize Module before loading script
        window.Module = {
            arguments: ['-e', 'pcl_plane,512', '-e', 'camera_position,0.0,0.0,-7.0', '-e', 'look_at,0.0,0.0,0.0'], //, '-e', 'blend,screen'], //, '-e', 'cursor,off'],
            preRun: [],
            // Opaque black background — no transparency bleed-through from the page
            webglContextAttributes: {
                alpha: false,
                premultipliedAlpha: false,
                antialias: true,
                depth: true,
                stencil: false,
                preserveDrawingBuffer: false,
            },
            keyboardListeningElement: canvas,
            doNotCaptureKeyboard: true,
            // canvas: canvas,
            onRuntimeInitialized: function() {
                console.log('WASM Runtime Initialized');
                if (window.glslViewerLoader) {
                   if (window.glslViewerLoader.loading) {
                       window.glslViewerLoader.hide();
                       window.glslViewerLoader.loading = false;
                   }
                }
            },
            postRun: () => {
                window.module_loaded = true;

                // Force hide the loader in case setStatus was called after monitorRunDependencies(0)
                if (window.glslViewerLoader) {
                    window.glslViewerLoader.hide();
                    window.glslViewerLoader.loading = false;
                }
            },

            print: function(text) {
                console.log('WASM:', text);
                window.dispatchEvent(new CustomEvent('wasm-stdout', { detail: text }));
            },

            printErr: function(text) {
                console.error('WASM Error:', text);
                window.dispatchEvent(new CustomEvent('wasm-stderr', { detail: text }));
            },

            // canvas: canvas,
            canvas: (function() {
                // var canvas = document.getElementById('canvas');

                // As a default initial behavior, pop up an alert when webgl context is lost. To make your
                // application robust, you may want to override this behavior before shipping!
                // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
                canvas.addEventListener("webglcontextlost", function(e) { 
                    e.preventDefault(); 
                    // alert('WebGL context lost. You will need to reload the page.'); 
                    location.reload();
                }, false);
            
                return canvas;
            })(),
            
            setStatus: function(text) {
                // Don't show loader if module is already loaded
                if (window.module_loaded) return;
                
                if (window.glslViewerLoader) {
                    if (window.glslViewerLoader.loading) {
                        window.glslViewerLoader.update(text);
                    } else {
                        // Only show if we explicitly want to (usually controlled by monitorRunDependencies)
                        // But if something else calls setStatus, we might want to show it?
                        // Emscripten calls setStatus for "Running..."
                        // Let's allow it.
                        window.glslViewerLoader.loading = true;
                        window.glslViewerLoader.show(text);
                    }
                }
            },
        
            totalDependencies: 0,
            monitorRunDependencies: function(left) {
                this.totalDependencies = Math.max(this.totalDependencies, left);
                
                if (left === 0) {
                    if (window.glslViewerLoader && window.glslViewerLoader.loading) {
                        window.glslViewerLoader.hide();
                        window.glslViewerLoader.loading = false;
                    }
                } else {
                    const status = 'Downloading... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')';
                    
                    if (window.glslViewerLoader) {
                        if (window.glslViewerLoader.loading) {
                            window.glslViewerLoader.update(status);
                        } else {
                            window.glslViewerLoader.loading = true;
                            window.glslViewerLoader.show(status);
                        }
                    }
                }
            }
        };
  
        // Load WASM script – resolve path relative to this module, not the page URL
        const script = document.createElement('script');
        script.src = new URL('glslViewer.js', import.meta.url).href;
        script.async = true;
        document.body.appendChild(script);
    }
  
    disconnectedCallback() {
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }
    }
}
  
customElements.define('wasm-loader', WasmLoader); 