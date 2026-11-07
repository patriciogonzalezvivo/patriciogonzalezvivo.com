const apiKey = '16e572a980874e67af8b12c4feab7462';

// The keys and command line switches of the desktop app, as controls. `id` is the name MainApp::setOption knows, `key` the key
// (or --flag) it mirrors; the same ids are URL parameters (?ui=1&mode=chord&gi=cascades&tempo=96), so a link carries them.
// `names` are the words the URL accepts besides numbers.
const ASTROS_OPTIONS = [
    { group: 'Display', items: [
        { id: 'ui',             type: 'bool',   label: 'More information',                 key: 'u' },
        { id: 'horizon',        type: 'bool',   label: 'Horizon',                          key: 'h' },
        { id: 'debug',          type: 'bool',   label: 'Aspects and what each channel plays', key: 'd' },
        { id: 'angles',         type: 'bool',   label: 'Degrees in the sign',              key: 'a' },
        { id: 'aspects',        type: 'bool',   label: 'Aspect lines',                     key: 's' },
        { id: 'extended',       type: 'bool',   label: 'Ascendant, nodes and Chiron',      key: 'e' },
        { id: 'gi',             type: 'select', label: 'Light',                            key: 'g',
          options: [[0, 'Auto'], [1, 'Raymarching'], [2, 'Radiance cascades'], [3, 'Off']], names: { auto: 0, raymarching: 1, cascades: 2, off: 3 } },
        { id: 'cascades_scale', type: 'select', label: 'Cascades resolution',              key: '[ ]',
          options: [[0.125, '1/8'], [0.25, '1/4'], [0.5, '1/2'], [1, 'Full']] },
        { id: 'timelapse',      type: 'bool',   label: 'Time-lapse',                       key: 'space' },
    ]},
    { group: 'Sound', items: [
        { id: 'play',           type: 'bool',   label: 'Play the reading',                 key: '/' },
        { id: 'mode',           type: 'select', label: 'Reading',                          key: 'm',
          options: [[0, 'Circular'], [1, 'Astrological'], [2, 'Astral chord']], names: { circular: 0, astrological: 1, chord: 2 } },
        { id: 'chord',          type: 'select', label: 'Chord style',                      key: 'c',
          options: [[0, 'Weighted'], [1, 'One by one']], names: { weighted: 0, one: 1 } },
        { id: 'period',         type: 'number', label: 'Seconds per revolution',           key: '--period', min: 20, max: 3600, step: 10 },
        { id: 'tempo',          type: 'number', label: 'Tempo (bpm)',                      key: '; \' t', min: 10, max: 300, step: 1 },
        { id: 'drone',          type: 'bool',   label: 'Sun drone',                        key: 'k' },
        { id: 'follow_clock',   type: 'bool',   label: 'Follow MIDI clock',                key: 'y' },
        { id: 'mute1',          type: 'bool',   label: 'Mute channel 1 (the Sun)',         key: '1' },
        { id: 'mute2',          type: 'bool',   label: 'Mute channel 2 (union)',           key: '2' },
        { id: 'mute3',          type: 'bool',   label: 'Mute channel 3 (harmony)',         key: '3' },
        { id: 'mute4',          type: 'bool',   label: 'Mute channel 4 (tension)',         key: '4' },
    ], actions: [
        { id: 'tap',    label: 'Tap tempo',  key: 't' },
        { id: 'slower', label: 'Slower',     key: ';' },
        { id: 'faster', label: 'Faster',     key: "'" },
        { id: 'now',    label: 'Now',        key: 'n' },
        { id: 'panic',  label: 'Silence',    key: 'p' },
    ]},
];

const astros_option_list = ASTROS_OPTIONS.flatMap(g => g.items);

function astros_options_html() {
    return ASTROS_OPTIONS.map(g => `
                <div class="observer_group options_group">
                    <h3>${g.group}</h3>
                    ${g.items.map(o => {
                        const hint = `<span class="key-hint">${o.key}</span>`;
                        if (o.type === 'bool')
                            return `<div class="option-row"><label for="opt_${o.id}">${o.label} ${hint}</label><input type="checkbox" id="opt_${o.id}" name="${o.id}" data-option="${o.id}" /></div>`;
                        if (o.type === 'select')
                            return `<div class="option-row"><label for="opt_${o.id}">${o.label} ${hint}</label><select id="opt_${o.id}" name="${o.id}" data-option="${o.id}">${o.options.map(v => `<option value="${v[0]}">${v[1]}</option>`).join('')}</select></div>`;
                        return `<div class="option-row"><label for="opt_${o.id}">${o.label} ${hint}</label><input type="number" id="opt_${o.id}" name="${o.id}" data-option="${o.id}" min="${o.min}" max="${o.max}" step="any" /></div>`;
                    }).join('')}
                    ${g.actions ? `<div class="option-actions">${g.actions.map(a => `<button type="button" class="action-button" data-action="${a.id}" title="key ${a.key}">${a.label}</button>`).join('')}</div>` : ''}
                </div>`).join('');
}

class OverlayControls extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.showSettings = false;
    }
  
    connectedCallback() {
        // Create container
        const container = document.createElement('div');
        container.className = 'overlay-controls';

        const settingsButton = document.createElement('button');
        settingsButton.className = 'control-button settings-button';
        settingsButton.innerHTML = `
            <svg fill="#FFFFFF" width="30px" height="30px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg">
                <path d="M16.417 9.583A7.917 7.917 0 1 1 8.5 1.666a7.917 7.917 0 0 1 7.917 7.917zm-2.327-.557a.391.391 0 0 0-.312-.371l-.952-.165a.315.315 0 0 0-.05-.003 4.386 4.386 0 0 0-.467-1.125.344.344 0 0 0 .034-.039l.556-.79a.391.391 0 0 0-.041-.482l-.81-.81a.391.391 0 0 0-.483-.042l-.79.557a.315.315 0 0 0-.039.033 4.41 4.41 0 0 0-1.124-.466.284.284 0 0 0-.004-.05l-.164-.952a.391.391 0 0 0-.37-.312H7.926a.39.39 0 0 0-.37.312l-.165.951a.315.315 0 0 0-.004.05 4.408 4.408 0 0 0-1.125.467.293.293 0 0 0-.039-.033L5.435 5.2a.391.391 0 0 0-.483.042l-.81.81a.391.391 0 0 0-.042.483l.557.79a.313.313 0 0 0 .033.038 4.397 4.397 0 0 0-.466 1.125.316.316 0 0 0-.05.003l-.952.165a.391.391 0 0 0-.312.37v1.147a.39.39 0 0 0 .312.37l.952.165a.317.317 0 0 0 .05.004 4.396 4.396 0 0 0 .466 1.124.313.313 0 0 0-.033.04l-.557.789a.391.391 0 0 0 .042.482l.81.81a.39.39 0 0 0 .483.042l.79-.557a.293.293 0 0 0 .039-.033 4.375 4.375 0 0 0 1.124.466.316.316 0 0 0 .004.051l.164.952a.39.39 0 0 0 .371.312h1.146a.391.391 0 0 0 .37-.312l.165-.952a.285.285 0 0 0 .004-.05 4.377 4.377 0 0 0 1.124-.467.315.315 0 0 0 .04.033l.789.557a.39.39 0 0 0 .483-.041l.81-.81a.391.391 0 0 0 .042-.483l-.557-.79a.344.344 0 0 0-.033-.039 4.386 4.386 0 0 0 .466-1.124.316.316 0 0 0 .05-.004l.952-.165a.39.39 0 0 0 .312-.37zm-3.686.573A1.904 1.904 0 1 1 8.5 7.695a1.904 1.904 0 0 1 1.904 1.904z"/>
            </svg>`;

        settingsButton.title = 'Settings';
        this.settingsButton = settingsButton;
        settingsButton.onclick = () => this.toggle_settings();
  
        // Add styles
        const style = document.createElement('style');
        style.textContent = overlay_controls_css;
  
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
        
        container.appendChild(settingsButton);
  
        this.create_settings_panel();
    }
  
    // Create settings panel
    create_settings_panel() {
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        settingsPanel.innerHTML = `
            <div class="panel-header">
                <h2>Settings</h2>
                <button class="close-button">×</button>
            </div>

            <form id="settings-form">
                <div class="observer_group">
                    <h3>Location</h3>
                    
                    <div class="form-group" id="location_search">
                        <label for="city">City:</label>
                        <input type="text" id="city" name="city" placeholder="Search city..." autocomplete="off" />
                        <ul id="city_suggestions" class="autocomplete-suggestions"></ul>
                    </div>
                    
                    <div class="form-group" id="location">
                        <div class="form-group">
                            <label for="lat">Latitude:</label>
                            <input type="number" id="lat" name="lat" step="0.0001" />
                        </div>
                        <div class="form-group">
                            <label for="lng">Longitude:</label>
                            <input type="number" id="lng" name="lng" step="0.0001" />
                        </div>
                    </div>
                            
                    <h3>Time</h3>
                    <div class="form-group time-inputs">
                        <div class="time-grid">
                            <div>
                                <label for="local_year">Year:</label>
                                <input type="number" id="local_year" name="local_year" required />
                            </div>
                            <div>
                                <label for="local_month">Month:</label>
                                <input type="number" id="local_month" name="local_month" min="1" max="12" required />
                            </div>
                            <div>
                                <label for="local_day">Day:</label>
                                <input type="number" id="local_day" name="local_day" min="1" max="31" required />
                            </div>
                            <div>
                                <label for="local_hr">Hour:</label>
                                <input type="number" id="local_hr" name="local_hr" min="0" max="23" required />
                            </div>
                            <div>
                                <label for="local_min">Minute:</label>
                                <input type="number" id="local_min" name="local_min" min="0" max="59" required />
                            </div>
                        </div>
                    </div>
                </div>
  
                ${astros_options_html()}

                <button type="submit" class="submit-button">Apply Settings</button>
            </form>
        `;
  
        // Add close button handlers
        settingsPanel.querySelector('.close-button').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle_settings();
            this.handleFocus();
        });

        settingsPanel.addEventListener('blur', (e) => {
            if (!settingsPanel.contains(document.activeElement)) {
                this.toggle_settings();
                this.handleFocus();
            }
        });

        const fieldChanged = (field) => {
            if (!window.Module)
                return;

            // a key / command line switch of the app (Display, Sound)
            if (field.dataset.option) {
                if (window.Module.setOption) {
                    const v = field.type === 'checkbox' ? (field.checked ? 1 : 0) : parseFloat(field.value);
                    if (!isNaN(v))
                        window.Module.setOption(field.dataset.option, v);
                    // some switches move others (the reading stops, a mode starts): show what the app says now
                    if (field.dataset.option === 'mode' || field.dataset.option === 'play')
                        this.sync_options();
                }
                return;
            }

            switch (field.id) {
                case 'lat':
                case 'lng':
                    const lat = parseFloat(settingsPanel.querySelector('#lat').value);
                    const lng = parseFloat(settingsPanel.querySelector('#lng').value);
                    if (Number.isFinite(lat) && Number.isFinite(lng)) {
                        window.Module.setLocation(lat, lng);
                    }
                    break;

                case 'local_year':
                case 'local_month':
                case 'local_day':
                case 'local_hr':
                case 'local_min':
                    const local_year = parseInt(settingsPanel.querySelector('#local_year').value);
                    const local_month = parseInt(settingsPanel.querySelector('#local_month').value);
                    const local_day = parseInt(settingsPanel.querySelector('#local_day').value);
                    const local_hr = parseInt(settingsPanel.querySelector('#local_hr').value);
                    const local_min = parseInt(settingsPanel.querySelector('#local_min').value);
                    if (local_year && local_month && local_day && local_hr >= 0 && local_min >= 0) {
                        window.Module.setLocalTime(local_year, local_month, local_day, local_hr, local_min);
                    }
                    break;

            }
        }

        // Add event listeners for all form fields
        const formFields = settingsPanel.querySelectorAll('input, select');
        formFields.forEach(field => {
            // debounce input fields
            let timeout = null;
            field.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fieldChanged(field);
                }, 500);
            });

            field.addEventListener('change', () => {
                clearTimeout(timeout);
                fieldChanged(field);
            });
        });

        settingsPanel.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                if (window.Module && window.Module.doAction)
                    window.Module.doAction(button.dataset.action);
                setTimeout(() => this.sync_options(), 100);      // tempo, the reading ... may have moved
            });
        });

        // Handle form submission
        settingsPanel.querySelector('#settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const params = new URLSearchParams(window.location.search);     // keeps what the panel does not own (?midi=...)

            // Add location params
            if (formData.get('lat') && formData.get('lng')) {
                params.set('lat', formData.get('lat'));
                params.set('lng', formData.get('lng'));
            }

            // Add local time params
            params.set('local_year', formData.get('local_year'));
            params.set('local_month', formData.get('local_month'));
            params.set('local_day', formData.get('local_day'));
            params.set('local_hr', formData.get('local_hr'));
            params.set('local_min', formData.get('local_min'));

            // Add the display and sound switches (the same names as the URL reads back)
            astros_option_list.forEach(o => {
                const field = settingsPanel.querySelector('#opt_' + o.id);
                if (field)
                    params.set(o.id, o.type === 'bool' ? (field.checked ? '1' : '0') : field.value);
            });

            // Update URL and reload page
            window.location.search = params.toString();
        });

        this.shadowRoot.appendChild(settingsPanel);
        this.settingsPanel = settingsPanel;

        this.load_params_from_url();
    }
  
    // Shows the app's current state in the Display and Sound controls (the keys change it too).
    sync_options() {
        if (!window.module_loaded || !window.Module || !window.Module.getOption || !this.settingsPanel)
            return;
        astros_option_list.forEach(o => {
            const field = this.settingsPanel.querySelector('#opt_' + o.id);
            if (!field)
                return;
            const v = window.Module.getOption(o.id);
            if (o.type === 'bool')
                field.checked = v > 0.5;
            else if (o.type === 'select') {
                let best = field.options[0], bestD = Infinity;
                for (const opt of field.options) {
                    const d = Math.abs(parseFloat(opt.value) - v);
                    if (d < bestD) { bestD = d; best = opt; }
                }
                field.value = best.value;
            }
            else if (document.activeElement !== field && this.shadowRoot.activeElement !== field)
                field.value = Math.round(v * 10) / 10;
        });
    }

    toggle_settings() {
        this.showSettings = !this.showSettings;
        this.settingsPanel.style.right = this.showSettings ? '0' : '-150%';
        // the gear gives way to the panel (its own × closes it) and comes back with it closed
        if (this.settingsButton)
            this.settingsButton.style.display = this.showSettings ? 'none' : '';
        if (this.showSettings)
            this.sync_options();        // the keys may have changed things since it was last open

        this.handleFocus();
    }

    // async wait for Module to be loaded
    async load_params_from_url() {
        while (window.module_loaded === undefined) {
            await new Promise(r => setTimeout(r, 100));
        }

        // Get the query parameters
        const params = new URLSearchParams(window.location.search);

        // Load location from URL params or get current location
        if (params.has('lat') && params.has('lng')) {
            const lat = parseFloat(params.get('lat'));
            const lng = parseFloat(params.get('lng'));
            this.settingsPanel.querySelector('#lat').value = lat.toFixed(4);
            this.settingsPanel.querySelector('#lng').value = lng.toFixed(4);
            window.Module.setLocation(lat, lng);
        } else {
            // Get current geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.settingsPanel.querySelector('#lat').value = lat.toFixed(4);
                    this.settingsPanel.querySelector('#lng').value = lng.toFixed(4);
                    window.Module.setLocation(lat, lng);
                }, (error) => {
                    console.warn('Geolocation error:', error);
                });
            }
        }

        // Load local time from URL params or get current time
        if (params.has('local_year')) {
            const local_year = parseInt(params.get('local_year'));
            const local_month = parseInt(params.get('local_month'));
            const local_day = parseInt(params.get('local_day'));
            const local_hr = parseInt(params.get('local_hr'));
            const local_min = parseInt(params.get('local_min'));
            
            this.settingsPanel.querySelector('#local_year').value = local_year;
            this.settingsPanel.querySelector('#local_month').value = local_month;
            this.settingsPanel.querySelector('#local_day').value = local_day;
            this.settingsPanel.querySelector('#local_hr').value = local_hr;
            this.settingsPanel.querySelector('#local_min').value = local_min;
            
            window.Module.setLocalTime(local_year, local_month, local_day, local_hr, local_min);
        } else {
            // Get current local time
            const now = new Date();
            const local_year = now.getFullYear();
            const local_month = now.getMonth() + 1; // JavaScript months are 0-indexed
            const local_day = now.getDate();
            const local_hr = now.getHours();
            const local_min = now.getMinutes();
            
            this.settingsPanel.querySelector('#local_year').value = local_year;
            this.settingsPanel.querySelector('#local_month').value = local_month;
            this.settingsPanel.querySelector('#local_day').value = local_day;
            this.settingsPanel.querySelector('#local_hr').value = local_hr;
            this.settingsPanel.querySelector('#local_min').value = local_min;
            
            window.Module.setLocalTime(local_year, local_month, local_day, local_hr, local_min);
        }

        // The display and sound switches from the URL (?ui=1&mode=chord&gi=cascades&tempo=96&mute3=1), as the command line would
        astros_option_list.forEach(o => {
            if (!params.has(o.id))
                return;
            const raw = params.get(o.id).toLowerCase();
            let v;
            if (o.names && raw in o.names)
                v = o.names[raw];
            else if (raw === 'true' || raw === 'on')
                v = 1;
            else if (raw === 'false' || raw === 'off')
                v = 0;
            else
                v = parseFloat(raw);
            if (!isNaN(v))
                window.Module.setOption(o.id, v);
        });
        this.sync_options();

        // Initialize city autocomplete
        fetch('cities.zip')
            .then(response => response.blob())
            .then(blob => {
                const zip = new JSZip();
                return zip.loadAsync(blob);
            })
            .then(zip => {
                return zip.file('cities.json').async('string');
            })
            .then(data => {
                const cities = JSON.parse(data);

                // Initialize Fuse.js
                const options = {
                    keys: ['name'],
                    threshold: 0.3
                };

                this.fuse = new Fuse(cities, options);

                const setLocation = (lat, lng) => {
                    window.Module.setLocation(lat, lng);
                };

                this.initiate_autocomplete(this.settingsPanel, setLocation);
            })
            .catch(error => console.error('Error loading cities.json:', error));
    }

    initiate_autocomplete(settingsPanel, setLocation) {
        const searchInput = settingsPanel.querySelector('#city');
        const resultsList = settingsPanel.querySelector('#city_suggestions');
        let debounceTimeout = null;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value;

            clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(() => {
                if (query.trim().length === 0) {
                    resultsList.innerHTML = '';
                    return;
                }
                const results = this.fuse.search(query);

                resultsList.innerHTML = '';

                results.forEach(result => {
                    const li = document.createElement('li');
                    li.textContent = `${result.item.name}, ${result.item.country}`;
                    li.className = 'autocomplete-suggestion';

                    li.addEventListener('click', () => {
                        searchInput.value = `${result.item.name}, ${result.item.country}`;

                        const lat = result.item.lat;
                        const lng = result.item.long;

                        settingsPanel.querySelector('#lat').value = lat.toFixed(4);
                        settingsPanel.querySelector('#lng').value = lng.toFixed(4);

                        if (window.Module) {
                            setLocation(lat, lng);
                        }

                        resultsList.innerHTML = '';
                    });

                    resultsList.appendChild(li);
                });
            }, 300);
        });
    }

    handleFocus() {
        if (window.Module && window.Module.canvas) {
            if (this.showSettings) {
                window.Module.canvas.blur();
                // Remove event listeners when panel is open
                window.removeEventListener('keydown', GLFW.onKeydown, true);
                window.removeEventListener('keypress', GLFW.onKeyPress, true);
                window.removeEventListener('keyup', GLFW.onKeyup, true);
                window.removeEventListener('mousedown', GLFW.onMouseDown, true);
                window.removeEventListener('mouseup', GLFW.onMouseUp, true);
                window.removeEventListener('mousemove', GLFW.onMouseMove, true);
                window.removeEventListener('touchstart', GLFW.onTouchStart, true);
                window.removeEventListener('touchend', GLFW.onTouchEnd, true);
                window.removeEventListener('touchmove', GLFW.onTouchMove, true);
            }
            else {
                window.Module.canvas.focus();
                // Restore event listeners when panel is closed
                window.addEventListener('keydown', GLFW.onKeydown, true);
                window.addEventListener('keypress', GLFW.onKeyPress, true);
                window.addEventListener('keyup', GLFW.onKeyup, true);
                window.addEventListener('mousedown', GLFW.onMouseDown, true);
                window.addEventListener('mouseup', GLFW.onMouseUp, true);
                window.addEventListener('mousemove', GLFW.onMouseMove, true);
                window.addEventListener('touchstart', GLFW.onTouchStart, true);
                window.addEventListener('touchend', GLFW.onTouchEnd, true);
                window.addEventListener('touchmove', GLFW.onTouchMove, true);
            }
        }
    }
}

const overlay_controls_css = `
:host {
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
}

a {
  color: white;
}

.overlay-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.control-button {
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: 1px solid white;
    z-index: 1001;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    outline: none;
    transition: background 0.2s;
}

.control-button:hover {
    background: rgba(0,0,0,0.8);
}

.settings-button {
    top: 20px;
    right: 20px;
}

.settings-panel {
    position: fixed;
    top: 0;
    width: 100%;
    max-width: 400px;
    height: 95vh;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    overflow-y: auto;
    z-index: 1002;
    -webkit-overflow-scrolling: touch;
    right: -150%;
    transition: right 0.3s ease;
    will-change: right;
}

.settings-panel.visible {
    right: 0 !important;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.close-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;
    -webkit-tap-highlight-color: transparent;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.close-button:active {
    background: rgba(255, 255, 255, 0.2);
}

.observer_group {
    margin-top: 20px;
    padding: 15px;
    background: rgba(30, 30, 30, 1.0);
    border-radius: 8px;
}

.observer_group h3 {
    margin-top: 15px;
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.9);
}

.form-group {
    margin-bottom: 15px;
}

.option-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
}

.option-row label {
    flex: 1;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
}

.option-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #8ec5d6;
}

.option-row select,
.option-row input[type="number"] {
    width: 45%;
    padding: 4px;
    border-radius: 4px;
    font-size: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.option-row select option {
    color: black;
}

.key-hint {
    margin-left: 4px;
    padding: 0 5px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.55);
}

.option-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.action-button {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
}

.action-button:hover {
    background: rgba(255, 255, 255, 0.2);
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
    width: 97%;
    padding: 4px;
    border-radius: 4px;
    font-size: 1rem;
    -webkit-tap-highlight-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.form-group input[readonly] {
    color: #a0a0a0;
    cursor: not-allowed;
}

#location {
    display: flex;
    gap: 10px;
    width: 98%;
}

.time-grid {
    display: flex;
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    gap: 10px;
    margin-top: 5px;
    width: 98%;
}

.time-grid > div {
    display: flex;
    flex-direction: column;
}

.time-grid label {
    font-size: 0.8rem;
    margin-bottom: 2px;
}

.time-grid input {
    width: 100%;
    padding: 4px;
    font-size: 0.9rem;
}

.submit-button {
    width: 100%;
    padding: 10px;
    background: #000000;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s;
    -webkit-tap-highlight-color: transparent;
}

.submit-button:hover {
    background: #45a049;
}

.submit-button:active {
    background: #3d8b40;
}

@media (max-width: 480px) {
    .settings-panel {
        width: 100%;
        max-width: 340px;
        height: 80vh;
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group select {
        font-size: 16px; /* Prevent zoom on iOS */
    }

    .panel-header h2 {
        font-size: 1.2rem;
    }

    .form-group label {
        font-size: 0.85rem;
    }

    .time-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.autocomplete-suggestions {
    width: 83%;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    background: black;
    border: 1px solid #ccc;
    max-height: 150px;
    overflow-y: auto;
    z-index: 2000;
}

.autocomplete-suggestion {
    padding: 8px;
    cursor: pointer;
}

.autocomplete-suggestion:hover {
    background: rgba(255, 255, 255, 0.1);
}
`;
  
customElements.define('overlay-controls', OverlayControls);
