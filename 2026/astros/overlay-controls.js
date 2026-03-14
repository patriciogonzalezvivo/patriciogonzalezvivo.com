const apiKey = '16e572a980874e67af8b12c4feab7462';

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
                            <input type="number" id="lat" name="lat" step="0.0001" required />
                        </div>
                        <div class="form-group">
                            <label for="lng">Longitude:</label>
                            <input type="number" id="lng" name="lng" step="0.0001" required />
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

            switch (field.id) {
                case 'lat':
                case 'lng':
                    const lat = parseFloat(settingsPanel.querySelector('#lat').value);
                    const lng = parseFloat(settingsPanel.querySelector('#lng').value);
                    if (lat && lng) {
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

                case 'utc_year':
                case 'utc_month':
                case 'utc_day':
                case 'utc_hr':
                case 'utc_min':
                    const utc_year = parseInt(settingsPanel.querySelector('#utc_year').value);
                    const utc_month = parseInt(settingsPanel.querySelector('#utc_month').value);
                    const utc_day = parseInt(settingsPanel.querySelector('#utc_day').value);
                    const utc_hr = parseInt(settingsPanel.querySelector('#utc_hr').value);
                    const utc_min = parseInt(settingsPanel.querySelector('#utc_min').value);
                    if (utc_year && utc_month && utc_day && utc_hr >= 0 && utc_min >= 0) {
                        window.Module.setUTCTime(utc_year, utc_month, utc_day, utc_hr, utc_min);
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

        // Handle form submission
        settingsPanel.querySelector('#settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const params = new URLSearchParams();

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

            // Add UTC time params
            params.set('utc_year', formData.get('utc_year'));
            params.set('utc_month', formData.get('utc_month'));
            params.set('utc_day', formData.get('utc_day'));
            params.set('utc_hr', formData.get('utc_hr'));
            params.set('utc_min', formData.get('utc_min'));

            // Update URL and reload page
            window.location.search = params.toString();
        });

        this.shadowRoot.appendChild(settingsPanel);
        this.settingsPanel = settingsPanel;

        this.load_params_from_url();
    }
  
    toggle_settings() {
        this.showSettings = !this.showSettings;
        this.settingsPanel.style.right = this.showSettings ? '0' : '-150%';

        this.handleFocus();
    }

    // async wait for Module to be loaded
    async load_params_from_url() {
        while (window.module_loaded === undefined) {
            await new Promise(r => setTimeout(r, 100));
        }

        // Get the query parameters
        const params = new URLSearchParams(window.location.search);

        // Load location
        if (params.has('lat') && params.has('lng')) {
            const lat = parseFloat(params.get('lat'));
            const lng = parseFloat(params.get('lng'));
            this.settingsPanel.querySelector('#lat').value = lat;
            this.settingsPanel.querySelector('#lng').value = lng;
            window.Module.setLocation(lat, lng);
        }

        // Load local time
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
        }

        // Load UTC time
        if (params.has('utc_year')) {
            const utc_year = parseInt(params.get('utc_year'));
            const utc_month = parseInt(params.get('utc_month'));
            const utc_day = parseInt(params.get('utc_day'));
            const utc_hr = parseInt(params.get('utc_hr'));
            const utc_min = parseInt(params.get('utc_min'));
            
            this.settingsPanel.querySelector('#utc_year').value = utc_year;
            this.settingsPanel.querySelector('#utc_month').value = utc_month;
            this.settingsPanel.querySelector('#utc_day').value = utc_day;
            this.settingsPanel.querySelector('#utc_hr').value = utc_hr;
            this.settingsPanel.querySelector('#utc_min').value = utc_min;
            
            window.Module.setUTCTime(utc_year, utc_month, utc_day, utc_hr, utc_min);
        }

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
    background: rgba(36, 67, 79, 0.88);
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
    background: #4CAF50;
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
