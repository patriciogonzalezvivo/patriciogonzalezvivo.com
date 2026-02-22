class WeaverLoader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
        // Create loader elements
        const loader = document.createElement('div');
        loader.className = 'emscripten_loader';
        loader.id = 'emscripten_loader';
        loader.innerHTML = `
            <div class='emscripten_loader' id='spinner'></div>
            <div class='emscripten_loader' id='status'>Downloading...</div>
            <progress class='emscripten_loader' value='50' max='100' id='progress'></progress>
        `;

        // Create canvas element
        const canvas = document.getElementById('canvas');
  
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100vw;
                height: 100vh;
                position: fixed;
                top: 0;
                left: 0;
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Lucida Console', Monaco, monospace;
            }

            * {
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                -moz-osx-font-smoothing: grayscale;
                -webkit-font-smoothing: antialiased;
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
            }

            .emscripten_loader {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            #spinner {
                height: 100px;
                width: 100px;
                margin: 0;
                margin-top: -50px;
                margin-left: -50px;
                display: inline-block;
                vertical-align: top;
                -webkit-animation: rotation .8s linear infinite;
                -moz-animation: rotation .8s linear infinite;
                -o-animation: rotation .8s linear infinite;
                animation: rotation 0.8s linear infinite;
                border-left: 5px solid rgb(200, 200, 200);
                border-right: 5px solid rgb(200, 200, 200);
                border-bottom: 5px solid rgba(0, 0, 0, 0);
                border-top: 5px solid rgba(0, 0, 0, 0);
                border-radius: 100%;
                background-color: rgba(0, 0, 0, 0);
            }

            @-webkit-keyframes rotation {
                from {-webkit-transform: rotate(0deg);}
                to {-webkit-transform: rotate(360deg);}
            }
            @-moz-keyframes rotation {
                from {-moz-transform: rotate(0deg);}
                to {-moz-transform: rotate(360deg);}
            }
            @-o-keyframes rotation {
                from {-o-transform: rotate(0deg);}
                to {-o-transform: rotate(360deg);}
            }
            @keyframes rotation {
                from {transform: rotate(0deg);}
                to {transform: rotate(360deg);}
            }

            #status {
                display: fixed;
                left: 50%;
                bottom: 25%;
                transform: translate(-50%, -50%);
                color: rgb(200, 200, 200);
                font-family: monospace;
            }

            #progress {
                height: 10px;
                width: 200px;
                margin-top: 90px;
                color: rgb(200, 200, 200);
                accent-color: rgb(200, 200, 200);
            }
            `;
  
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(loader);
    
        // Store reference to shadowRoot for Module methods
        const shadowRoot = this.shadowRoot;
  
        // Initialize Module before loading script
        window.Module = {
            preRun: [],
            // canvas: canvas,
            onRuntimeInitialized: function() {
                console.log('WASM Runtime Initialized');
                // Hide loader when runtime is initialized
                loader.style.display = 'none';
            },
            postRun: () => {
                // set weaver-loader visibility to hidden
                const weaverLoader = document.querySelector('weaver-loader');
                if (weaverLoader) {
                    weaverLoader.style.visibility = 'hidden';
                }

                // destroy shadowRoot to prevent memory leaks
                this.shadowRoot.innerHTML = '';

                console.log('WASM Post Run');

                // A / B Skys
                window.Module.setShowA =   window.Module.cwrap('setShowA', 'void', ['boolean']);
                window.Module.getShowA =   window.Module.cwrap('getShowA', 'bool', []);
                window.Module.setShowB =   window.Module.cwrap('setShowB', 'void', ['boolean']);
                window.Module.getShowB =   window.Module.cwrap('getShowB', 'bool', []);

                window.Module.setNameA =   window.Module.cwrap('setNameA', 'void', ['string']);
                window.Module.setNameB =   window.Module.cwrap('setNameB', 'void', ['string']);
                window.Module.getNameA =   window.Module.cwrap('getNameA', 'string', []);
                window.Module.getNameB =   window.Module.cwrap('getNameB', 'string', []);

                window.Module.setLocationA =   window.Module.cwrap('setLocationA', 'void', ['number', 'number']);
                window.Module.getLocationALat =    window.Module.cwrap('getLocationALat', 'number', []);
                window.Module.getLocationALng =   window.Module.cwrap('getLocationALng', 'number', []);

                window.Module.setLocationB =   window.Module.cwrap('setLocationB', 'void', ['number', 'number']);
                window.Module.getLocationBLat =    window.Module.cwrap('getLocationBLat', 'number', []); 
                window.Module.getLocationBLng =   window.Module.cwrap('getLocationBLng', 'number', []);
            
                window.Module.setCityIdA =     window.Module.cwrap('setCityIdA', 'void', ['number']);
                window.Module.setCityIdB =     window.Module.cwrap('setCityIdB', 'void', ['number']);
                window.Module.getCityIdA =     window.Module.cwrap('getCityIdA', 'number', []);
                window.Module.getCityIdB =     window.Module.cwrap('getCityIdB', 'number', []);

                window.Module.setTimeANow =    window.Module.cwrap('setTimeANow', 'void', ['boolean']);
                window.Module.setTimeALocal =  window.Module.cwrap('setTimeALocal', 'void', ['boolean']);
                window.Module.getTimeANow =    window.Module.cwrap('getTimeANow', 'bool', []);
                window.Module.getTimeALocal =  window.Module.cwrap('getTimeALocal', 'bool', []);

                window.Module.setTimeA =   window.Module.cwrap('setTimeA', 'void', ['number', 'number', 'number', 'number', 'number']);
                window.Module.getTimeAYear =   window.Module.cwrap('getTimeAYear', 'number', []);
                window.Module.getTimeAMonth =      window.Module.cwrap('getTimeAMonth', 'number', []);
                window.Module.getTimeADay =    window.Module.cwrap('getTimeADay', 'number', []);
                window.Module.getTimeAHour =      window.Module.cwrap('getTimeAHour', 'number', []);
                window.Module.getTimeAMinute =    window.Module.cwrap('getTimeAMinute', 'number', []);

                window.Module.setTimeBNow =    window.Module.cwrap('setTimeBNow', 'void', ['boolean']);
                window.Module.setTimeBLocal =  window.Module.cwrap('setTimeBLocal', 'void', ['boolean']);
                window.Module.getTimeBNow =    window.Module.cwrap('getTimeBNow', 'bool', []);
                window.Module.getTimeBLocal =  window.Module.cwrap('getTimeBLocal', 'bool', []);

                window.Module.setTimeB =   window.Module.cwrap('setTimeB', 'void', ['number', 'number', 'number', 'number', 'number']);
                window.Module.getTimeBYear =   window.Module.cwrap('getTimeBYear', 'number', []);
                window.Module.getTimeBMonth =      window.Module.cwrap('getTimeBMonth', 'number', []);
                window.Module.getTimeBDay =    window.Module.cwrap('getTimeBDay', 'number', []);
                window.Module.getTimeBHour =      window.Module.cwrap('getTimeBHour', 'number', []);
                window.Module.getTimeBMinute =    window.Module.cwrap('getTimeBMinute', 'number', []);

                window.Module.setTimezoneA =   window.Module.cwrap('setTimezoneA', 'void', ['string']);
                window.Module.setTimezoneB =   window.Module.cwrap('setTimezoneB', 'void', ['string']);
                window.Module.getTimezoneA =   window.Module.cwrap('getTimezoneA', 'string', []);
                window.Module.getTimezoneB =   window.Module.cwrap('getTimezoneB', 'string', []);

                window.Module.setStarLevel =   window.Module.cwrap('setStarLevel', 'void', ['number']);
                window.Module.getStarLevel =   window.Module.cwrap('getStarLevel', 'number', []);

                window.Module.setYearless =   window.Module.cwrap('setYearless', 'void', ['boolean']);
                window.Module.getYearless =   window.Module.cwrap('getYearless', 'bool', []);

                // Theme
                window.Module.setTheme =   window.Module.cwrap('setTheme', 'void', ['string']);

                window.Module.setAutohideTimeline = window.Module.cwrap('setAutohideTimeline', 'void', ['boolean']);
                window.Module.getAutohideTimeline = window.Module.cwrap('getAutohideTimeline', 'bool', []);

                window.Module.setShowGlobes =   window.Module.cwrap('setShowGlobes', 'void', ['boolean']);
                window.Module.getShowGlobes =   window.Module.cwrap('getShowGlobes', 'bool', []);

                // Interaction
                window.Module.setFocus =   window.Module.cwrap('setFocus', 'void', ['boolean']);
                window.Module.getFocus =   window.Module.cwrap('getFocus', 'bool', []);

                window.module_loaded = true;
            },

            print: function(text) {
                console.log('WASM:', text);
            },

            printErr: function(text) {
                console.error('WASM Error:', text);
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
                // console.log('WASM Status:', text);
                const statusElement = shadowRoot.getElementById('status');
                const progressElement = shadowRoot.getElementById('progress');
                const spinnerElement = shadowRoot.getElementById('spinner');

                if (statusElement && progressElement && spinnerElement) {
                    if (!window.Module.setStatus.last) 
                        window.Module.setStatus.last = { time: Date.now(), text: '' };
            
                    if (text === window.Module.setStatus.last.text) 
                        return;
                    
                    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
                    var now = Date.now();
                    if (m && now - window.Module.setStatus.last.time < 30) 
                        return; // if this is a progress update, skip it if too soon

                    window.Module.setStatus.last.time = now;
                    window.Module.setStatus.last.text = text;

                    if (m) {
                        text = m[1];
                        progressElement.value = parseInt(m[2])*100;
                        progressElement.max = parseInt(m[4])*100;
                        progressElement.hidden = false;
                        spinnerElement.hidden = false;
                    } 
                    else {
                        progressElement.value = null;
                        progressElement.max = null;
                        progressElement.hidden = true;
                        if (!text) 
                            spinnerElement.style.display = 'none';
                    }

                    // statusElement.innerHTML = text;
                    statusElement.textContent = text;
                }
            },
        
            totalDependencies: 0,
            monitorRunDependencies: function(left) {
                this.totalDependencies = Math.max(this.totalDependencies, left);
                const status = left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.';
                this.setStatus(status);
            }
        };
  
        // Load WASM script
        const script = document.createElement('script');
        script.src = 'weaver.js';
        script.async = true;
        document.body.appendChild(script);
    }
  
    disconnectedCallback() {
        // Clean up resize handler
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
    }
}
  
customElements.define('weaver-loader', WeaverLoader); 