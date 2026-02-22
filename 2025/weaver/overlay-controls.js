const apiKey = '16e572a980874e67af8b12c4feab7462';

class OverlayControls extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.showInfo = false;
      this.showSettings = false;
    }
  
    connectedCallback() {
        // Create container
        const container = document.createElement('div');
        container.className = 'overlay-controls';

        // Create control buttons
        const infoButton = document.createElement('button');
        infoButton.className = 'control-button info-button';
        // infoButton.innerHTML = '📄';
        infoButton.innerHTML = `
            <svg fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                    width="24px" height="24px" viewBox="0 0 416.979 416.979"
                    xml:space="preserve">
                <g>
                    <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
                        c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
                        c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
                        c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
                        c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
                </g>
            </svg>`

        infoButton.title = 'Information';
        infoButton.onclick = () => this.toggle_info();
  
        const settingsButton = document.createElement('button');
        settingsButton.className = 'control-button settings-button';
        // settingsButton.innerHTML = '⚙️';
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
        // container.appendChild(infoButton);
  
        // this.create_info_panel();
        this.create_settings_panel();
    }
  
    // create_info_panel() {

        // // Create info panel
        // const infoPanel = document.createElement('div');
        // infoPanel.className = 'info-panel';
        // infoPanel.innerHTML = `
        //     <div class="panel-header">
        //         <h2>Light Weaver</h2>
        //         <button class="close-button">×</button>
        //         </div>
        //     <p style="font-size:14px" >by <a href="https://patriciogonzalezvivo.com/">Patricio Gonzalez Vivo</a></p>
        //     <p style="font-size:14px" >in collaboration with <a href="https://www.jenlowe.net/">Jen Lowe</a></p>
        //     <div class="info-content">
        //         <p>Light Weaver is an artifact that lets you sync with someone distant in space and time through watching the sky together. It's an instrument for connection, presence and empathy.</p> 

        //         <div>
        //             <h2>How does it work?</h3>
        //             <p>It works by showing you two overlapping star maps of the sky. One per observer. Each one is differentiated by a unique color, and mirrors a different geographical location and date. The overlapping section is the common portion of the sky where observers can see the same stars and constellation.</p>
        //             <p>Each star map has a polar projection of the sky. Meaning the stars close to the outer edge are closer to the horizon (notice the letters of the four cardinal directions) while those at the center of the chart are directly above the head of the observer.</p>
        //             <p>At the bottom you can see two globes showing each of the observers locations. If at least one of the observers is not in the present time, you will see a timeline at the top, showing the different dates and times.</p>
                    
        //             <img class="info-images" src="svg/001.svg" alt="two people watching the same constellation" />

        //             <p>Both the map of the sky and the globes are interactive. You can drag the skymaps to change the time and date of the observers. The globes can be rotated to select other locations.</p>
        //             <p>In order to share this with someone you wish to connect with, you will need to provide a specific date and location by clicking on the gear in the top right corner.</p>
        //             <p>There, you can also customize the names and other parameters for each one of the observers.</p>
        //             <p>Once you are done, apply the changes and share the unique URL with the other person.</p>
        //         </div>

        //         <div>
        //             <h2>How to connect with someone in the past or future?</h3>
        //             <p>If you are like me, you believe Time is just the way our consciousness perceives the world. Like a play head on a disk, all that has and will happen is already there. We are just experiencing it.</p>
        //             <p>This doesn't mean we don't have a choice. Your decisions shape the world around you and the one yet to come.</p>
        //             <p>But it is also possible to influence the past by sending intentions to those that are living and shaping that moment.</p>
        //             <p>Just like memories come back to you from the past, sometimes you can have intuitions about the future. Glimpses, dreams of what is to come.</p>
        //             <p>Through transcendent acts of presence, like prayer and ritual, you can connect with the past and the future. You can connect with the people you love and the people you will love.</p>
        //             <p>You can send them the strength and love they need to overcome their challenges.</p>
        //             <p>You can whisper peace in moments of distress. You can share the fruits of their sacrifice and effort. You could become a beacon for them to follow.</p>
        //             <p>The sky, the great equalizer, is the perfect medium to connect with others. The sky has been the blanket humanity has slept under since we learned to tell stories. It has been there since the beginning for all of us. To connect through it across time and space, we just need to tap into it.</p>
        //             <p>How to tap through it?</p>
        //             <ol>
        //                 <li>Find a time and space where you can be present.</li>
        //                 <li>Think of the person you want to connect with.</li>
        //                 <li>Imagine the time and space they are in. When would be a moment they would have access to the sky? Ex: they are traveling by sea? camping? staying late at night celebrating?</li>
        //                 <li>Using this artifact, add your name and the other persons.</li>
        //                 <li>Set your location, to your here and now. Meaning to the present and the city you are at this moment.</li>
        //                 <li>Consider the other person, where that person is in the world? When would the sky be visible for them? Based on that, set their geographical location, date and time.</li>
        //                 <li>Drag the overlapping star charts to fine tune the perfect moment on which you and the other person share more stars.</li>
        //                 <li>Once you are here and they are there. Go outside.</li>
        //                 <li>Orient yourself to the direction of those constellations.</li>
        //                 <li>Imagine yourself and the other person looking at the same stars. Two travelers across the night of time.</li>
        //                 <li>Imagine an invisible string that connects you both.</li>
        //                 <li>Let that thread of light become clear by closing your eyes.</li>
        //                 <li>It's time to send the message. You can do this by praying, meditating, singing, dancing, writing, drawing, or just being present. Doesn't need to be a big gesture, let it start small and find the right shape.</li>
        //                 <li>Like tuning a radio, be curious and pay attention to how the small gestures produce big gestures.</li>
        //                 <li>You may receive a message back. Be open to it.</li>
        //                 <li>Stay in that delicate state of presence for as long as you can. It’s subtle and fragile like keeping a balloon up in the air.</li>
        //                 <li>Once you feel the connection is fading, be grateful: to you, the other and the stars you share.</li>
        //                 <li>You may want to take the time to treasure what just happened, write some thoughts or draw.</li>
        //             </ol>
        //         </div>
        //     </div>
        // `;

    //     infoPanel.querySelector('.close-button').addEventListener('click', (e) => {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         this.toggle_info();
    //         this.handleFocus();
    //     });

    //     infoPanel.addEventListener('blur', (e) => {
    //         if (!infoPanel.contains(document.activeElement)) {
    //             this.toggle_info();
    //             this.handleFocus();
    //         }
    //     });

    //     this.shadowRoot.appendChild(infoPanel);
    //     this.infoPanel = infoPanel;
    //     this.showInfo = false;
    // }
  
    // Create settings panel
    create_settings_panel() {
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        settingsPanel.innerHTML = `
            <div class="panel-header">
                <h2>Settings</h2>
                <button class="close-button">×</button>
            </div>

            <form id="settings-form" >
                <div class="a_group">
                    <div class="form-group">
                        <label for="a_name">Name:</label>
                        <input type="text" id="a_name" name="a_name" placeholder="Me" />
                    </div>
                    <div class="form-group" id="a_location_search">
                        <label for="a_city">City:</label>
                        <input type="text" id="a_city" name="a_city" placeholder="Search city..." autocomplete="off" />
                        <ul id="a_city_suggestions" class="autocomplete-suggestions"></ul>
                    </div>
                    <div class="form-group" id="a_location">
                        <div class="form-group">
                            <label for="a_lat">Latitude:</label>
                            <input type="number" id="a_lat" name="a_lat" step="0.0001" />
                        </div>
                        <div class="form-group">
                            <label for="a_lng">Longitude:</label>
                            <input type="number" id="a_lng" name="a_lng" step="0.0001" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="a_timezone">Timezone:</label>
                        <input type="text" id="a_timezone" name="a_timezone" readonly />
                    </div>
                            
                    <div class="form-group">
                        <label for="a_now">Use current time:</label>
                        <input type="checkbox" id="a_now" name="a_now" checked>
                    </div>
                    <div class="form-group time-inputs" id="a_time">
                        <label>Time:</label>
                        <div class="time-grid">
                            <div>
                                <label for="a_year">Year:</label>
                                <input type="number" id="a_year" name="a_year" />
                            </div>
                            <div>
                                <label for="a_month">Month:</label>
                                <input type="number" id="a_month" name="a_month" min="1" max="12" />
                            </div>
                            <div>
                                <label for="a_day">Day:</label>
                                <input type="number" id="a_day" name="a_day" min="1" max="31" />
                            </div>
                            <div>
                                <label for="a_hr">Hour:</label>
                                <input type="number" id="a_hr" name="a_hr" min="0" max="23" />
                            </div>
                            <div>
                                <label for="a_min">Minute:</label>
                                <input type="number" id="a_min" name="a_min" min="0" max="59" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="show_a">Visible:</label>
                        <input type="checkbox" id="show_a" name="show_a" checked />
                    </div>
                </div>

                <div class="b_group">
                    <div class="form-group">
                        <label for="b_name">Name:</label>
                        <input type="text" id="b_name" name="b_name" placeholder="You" />
                    </div>
                    <div class="form-group" id="b_location_search">
                        <label for="a_city">City:</label>
                        <input type="text" id="b_city" name="b_city" placeholder="Search city..." autocomplete="off" />
                        <ul id="b_city_suggestions" class="autocomplete-suggestions"></ul>
                    </div>
                    <div class="form-group" id="b_location">
                        <div class="form-group">
                            <label for="b_lat">Latitude:</label>
                            <input type="number" id="b_lat" name="b_lat" step="0.0001" />
                        </div>
                        <div class="form-group">
                            <label for="b_lng">Longitude:</label>
                            <input type="number" id="b_lng" name="b_lng" step="0.0001" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="b_timezone">Timezone:</label>
                        <input type="text" id="b_timezone" name="b_timezone" readonly />
                    </div>

                    <div class="form-group">
                        <label for="b_now">Use current time:</label>
                        <input type="checkbox" id="b_now" name="b_now" checked>
                    </div>
                    <div class="form-group time-inputs" id="b_time">
                        <label>Time:</label>
                        <div class="time-grid">
                            <div>
                                <label for="b_year">Year:</label>
                                <input type="number" id="b_year" name="b_year" />
                            </div>
                            <div>
                                <label for="b_month">Month:</label>
                                <input type="number" id="b_month" name="b_month" min="1" max="12" />
                            </div>
                            <div>
                                <label for="b_day">Day:</label>
                                <input type="number" id="b_day" name="b_day" min="1" max="31" />
                            </div>
                            <div>
                                <label for="b_hr">Hour:</label>
                                <input type="number" id="b_hr" name="b_hr" min="0" max="23" />
                            </div>
                            <div>
                                <label for="b_min">Minute:</label>
                                <input type="number" id="b_min" name"b_min" min="0" max="59" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="show_b">Visible:</label>
                        <input type="checkbox" id="show_b" name="show_b" checked />
                    </div>
                </div>

                <div class="form-group global_group">
                    <div>
                        <label for="theme">Theme:</label>
                        <select id="theme" name="theme">
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                    <div>
                        <label for="autohide_timeline">Auto-hide Timeline:</label>
                        <input type="checkbox" id="autohide_timeline" name="autohide_timeline" checked />
                    </div>
                    <div>
                        <label for="star_level">Amount of stars:</label>
                        <input type="range" id="star_level" name="star_level" min="0" max="4" step="1" value="3" />
                    </div>
                    <div>
                        <label for="yearless">Yearless:</label>
                        <input type="checkbox" id="yearless" name="yearless" checked />
                    </div>
                    <div>
                        <label for="show_globes">Show Globes:</label>
                        <input type="checkbox" id="show_globes" name="show_globes" checked />
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
            this.handleFocus()
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
                case 'a_name':
                    window.Module.setNameA(field.value);
                    break;
                
                // case 'a_here':
                //     const a_loc_search = settingsPanel.querySelector('#a_location_search');
                //     a_loc_search.style.display = field.checked ? 'none' : 'block';
                //     settingsPanel.querySelector('#a_lat').readOnly = field.checked;
                //     settingsPanel.querySelector('#a_lng').readOnly = field.checked;
                    
                //     if (field.checked) {
                //         navigator.geolocation.getCurrentPosition((position) => {
                //             let a_lat = position.coords.latitude;
                //             let a_lng = position.coords.longitude;
                //             window.Module.setLocationA(a_lat, a_lng);

                //             this.update_b_timezone_from_app();
                //         });
                //     }
                //     else {
                //         this.update_a_location_from_app();
                //     }

                //     break;

                case 'a_lat':
                case 'a_lng':
                    const a_lat = parseFloat( settingsPanel.querySelector('#a_lat').value );
                    const a_lng = parseFloat( settingsPanel.querySelector('#a_lng').value );
                    if (a_lat && a_lng) {
                        window.Module.setLocationA(a_lat, a_lng);
                        this.update_a_timezone_from_app();
                    }
                    break;

                // case 'a_timezone':
                //     this.update_a_time_from_app();
                //     break;
                
                case 'a_now':
                    // const a_time = settingsPanel.querySelector('#a_time');
                    // a_time.style.display = field.checked ? 'none' : 'block';
                    if (field.checked)
                        window.Module.setTimeANow();

                    this.update_a_time_from_app();

                    break;

                case 'a_year':
                case 'a_month':
                case 'a_day':
                case 'a_hr':
                case 'a_min':
                    const a_year = parseInt( settingsPanel.querySelector('#a_year').value );
                    const a_month = parseInt( settingsPanel.querySelector('#a_month').value );
                    const a_day = parseInt( settingsPanel.querySelector('#a_day').value );
                    const a_hr = parseInt( settingsPanel.querySelector('#a_hr').value );
                    const a_min = parseInt( settingsPanel.querySelector('#a_min').value );
                    if (a_year && a_month && a_day && a_hr && a_min)
                        window.Module.setTimeA(a_year, a_month, a_day, a_hr, a_min);
                    break;

                case 'b_name':
                    window.Module.setNameB(field.value);
                    break;

                // case 'b_here':
                //     const b_loc_search = settingsPanel.querySelector('#b_location_search');
                //     b_loc_search.style.display = field.checked ? 'none' : 'block';
                //     settingsPanel.querySelector('#b_lat').readOnly = field.checked;
                //     settingsPanel.querySelector('#b_lng').readOnly = field.checked;

                //     if (field.checked) {
                //         navigator.geolocation.getCurrentPosition((position) => {
                //             let b_lat = position.coords.latitude;
                //             let b_lng = position.coords.longitude;
                //             window.Module.setLocationB(b_lat, b_lng);
                //             this.update_b_timezone_from_app();
                //         });
                //     }
                //     else
                //         this.update_b_location_from_app();

                //     break;

                case 'b_lat':
                case 'b_lng':
                    const b_lat = parseFloat( settingsPanel.querySelector('#b_lat').value );
                    const b_lng = parseFloat( settingsPanel.querySelector('#b_lng').value );
                    if (b_lat && b_lng){
                        window.Module.setLocationB(b_lat, b_lng);
                        this.update_b_time_from_app();
                    }
                    break;

                // case 'b_timezone':
                //     this.update_b_time_from_app();
                //     break;

                case 'b_now':
                    // const b_time = settingsPanel.querySelector('#b_time');
                    // b_time.style.display = field.checked ? 'none' : 'block';
                    if (field.checked)
                        window.Module.setTimeBNow();
                    
                    this.update_b_time_from_app();

                    break;

                case 'b_year':
                case 'b_month':
                case 'b_day':
                case 'b_hr':
                case 'b_min':
                    const b_year = parseInt( settingsPanel.querySelector('#b_year').value );
                    const b_month = parseInt( settingsPanel.querySelector('#b_month').value );
                    const b_day = parseInt( settingsPanel.querySelector('#b_day').value );
                    const b_hr = parseInt( settingsPanel.querySelector('#b_hr').value );
                    const b_min = parseInt( settingsPanel.querySelector('#b_min').value );
                    if (b_year && b_month && b_day && b_hr && b_min)
                        window.Module.setTimeB(b_year, b_month, b_day, b_hr, b_min);
                    break;

                case 'theme':
                    window.Module.setTheme(settingsPanel.querySelector('#theme').value);
                    break;

                case 'yearless':
                    window.Module.setYearless(field.checked);
                    break;

                case 'show_globes':
                    window.Module.setShowGlobes(field.checked);
                    break;

                case 'autohide_timeline':
                    window.Module.setAutohideTimeline(field.checked);
                    break;

                case 'star_level':
                    window.Module.setStarLevel(4-parseInt(field.value));
                    break;
                
                case 'show_a':
                    window.Module.setShowA(field.checked);
                    break;

                case 'show_b':
                    window.Module.setShowB(field.checked);
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

            // add params to URL of formData that is present and valid
            if (formData.get('a_name')) {
                params.set('a_name', formData.get('a_name'));
            }

            // if (formData.get('a_here')) {
            //     params.set('a_here', 'true');
            // }
            // else if (formData.get('a_lat') && formData.get('a_lng')) 
            {
                params.set('a_lat', formData.get('a_lat'));
                params.set('a_lng', formData.get('a_lng'));
            }

            if (formData.get('a_now')) {
                params.set('a_now', 'true');
            }
            else {
                params.set('a_year', formData.get('a_year'));
                params.set('a_month', formData.get('a_month'));
                params.set('a_day', formData.get('a_day'));
                params.set('a_hr', formData.get('a_hr'));
                params.set('a_min', formData.get('a_min'));
            }

            if (formData.get('b_name')) {
                params.set('b_name', formData.get('b_name'));
            }

            // if (formData.get('b_here')) {
            //     params.set('b_here', 'true');
            // }
            // else if (formData.get('b_lat') && formData.get('b_lng')) 
            {
                params.set('b_lat', formData.get('b_lat'));
                params.set('b_lng', formData.get('b_lng'));
            }

            if (formData.get('b_now')) {
                params.set('b_now', 'true');
            }
            else {
                params.set('b_year', formData.get('b_year'));
                params.set('b_month', formData.get('b_month'));
                params.set('b_day', formData.get('b_day'));
                params.set('b_hr', formData.get('b_hr'));
                params.set('b_min', formData.get('b_min') || '0');
            }

            params.set('theme', formData.get('theme'));
            params.set('yearless', formData.get('yearless')? 'true' : 'false');
            params.set('show_globes', formData.get('show_globes')? 'true' : 'false');
            params.set('autohide_timeline', formData.get('autohide_timeline')? 'true' : 'false');
            params.set('star_level', formData.get('star_level') || '3'); // default to 4 if not set
            // params.set('show_a', formData.get('show_a')? 'true' : 'false');
            // params.set('show_b', formData.get('show_b')? 'true' : 'false');

            // Update URL and reload page
            window.location.search = params.toString();
        });

        this.shadowRoot.appendChild(settingsPanel);
        this.settingsPanel = settingsPanel;

        this.load_params_from_url();
        // this.toggle_info();
    }
  
    toggle_info() {
        this.showInfo = !this.showInfo;
        this.infoPanel.style.left = this.showInfo? '0' : '-150%';

        this.showSettings = false;
        this.settingsPanel.style.right = '-150%';

        this.handleFocus()
    }
  
    toggle_settings() {
        this.showSettings = !this.showSettings;
        this.settingsPanel.style.right = this.showSettings ? '0' : '-150%';
        
        this.showInfo = false;
        this.infoPanel.style.left = '-150%';

        if (this.showSettings) {
            this.updateSettings();
        }

        this.handleFocus()
    }

    // async wait for Module to be loaded
    async load_params_from_url() {
        while (window.module_loaded === undefined) {
            await new Promise(r => setTimeout(r, 100));
        }

        // Get the query parameters
        const params = new URLSearchParams(window.location.search);

        // Load parameters from the URL into the form fields
        if (params.has('a_name')) {
            this.settingsPanel.querySelector('#a_name').value = params.get('a_name');
            window.Module.setNameA(params.get('a_name'));
        }

        // if (params.has('a_here') && params.get('a_here') === 'true') {
        //     this.settingsPanel.querySelector('#a_here').checked = true;

        //     // const response = await fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
        //     // const loc = await response.json();
        //     navigator.geolocation.getCurrentPosition((position) => {
        //         let a_lat = position.coords.latitude;
        //         let a_lng = position.coords.longitude;
        //         window.Module.setLocationA(a_lat, a_lng);
        //         this.update_a_timezone_from_app();
        //     });
        // }
        // else 
        {
            if (params.has('a_lat')) {
                this.settingsPanel.querySelector('#a_lat').value = params.get('a_lat');
            }
            if (params.has('a_lng')) {
                this.settingsPanel.querySelector('#a_lng').value = params.get('a_lng');
            }

            if (params.has('a_lat') && params.has('a_lng')) {
                let a_lat = params.get('a_lat');
                let a_lng = params.get('a_lng');
                window.Module.setLocationA(parseFloat(a_lat), parseFloat(a_lng));
            }
            
            this.update_a_time_from_app();
        }

        if (params.has('a_now')) {
            this.settingsPanel.querySelector('#a_now').checked = true;
            window.Module.setTimeANow(true);
            this.update_a_time_from_app();
        }
        else {
            if (params.has('a_year')) {
                this.settingsPanel.querySelector('#a_year').value = params.get('a_year');
            }
            if (params.has('a_month')) {
                this.settingsPanel.querySelector('#a_month').value = params.get('a_month');
            }
            if (params.has('a_day')) {
                this.settingsPanel.querySelector('#a_day').value = params.get('a_day');
            }
            if (params.has('a_hr')) {
                this.settingsPanel.querySelector('#a_hr').value = params.get('a_hr');
            }
            if (params.has('a_min')) {
                this.settingsPanel.querySelector('#a_min').value = params.get('a_min');
            }

            let a_year = params.get('a_year');
            let a_month = params.get('a_month');
            let a_day = params.get('a_day');
            let a_hr = params.get('a_hr');
            let a_min = params.get('a_min');
            if (a_year && a_month && a_day && a_hr && a_min) {
                window.Module.setTimeA(parseInt(a_year), parseInt(a_month), parseInt(a_day), parseInt(a_hr), parseInt(a_min));
            }
        }

        if (params.has('b_name')) {
            this.settingsPanel.querySelector('#b_name').value = params.get('b_name');
            window.Module.setNameB(params.get('b_name'));
        }

        // if (params.has('b_here') && params.get('b_here') === 'true') {
        //     this.settingsPanel.querySelector('#b_here').checked = true;
        //     navigator.geolocation.getCurrentPosition((position) => {
        //         let b_lat = position.coords.latitude;
        //         let b_lng = position.coords.longitude;
        //         window.Module.setLocationB(b_lat, b_lng);
        //         this.update_a_timezone_from_app();
        //     });
        // }
        // else 
        {
            if (params.has('b_lat')) {
                this.settingsPanel.querySelector('#b_lat').value = params.get('b_lat');
            }
            if (params.has('b_lng')) {
                this.settingsPanel.querySelector('#b_lng').value = params.get('b_lng');
            }

            if (params.has('b_lat') && params.has('b_lng')) {
                let b_lat = params.get('b_lat');
                let b_lng = params.get('b_lng');
                window.Module.setLocationB(parseFloat(b_lat), parseFloat(b_lng));
            }

            this.settingsPanel.querySelector('#a_timezone').value = window.Module.getTimezoneA() || '';
        }

        if (params.has('b_now')) {
            this.settingsPanel.querySelector('#b_now').checked = true;
            window.Module.setTimeBNow(true);
            this.update_b_time_from_app();
        }
        else {
            if (params.has('b_year')) {
                this.settingsPanel.querySelector('#b_year').value = params.get('b_year');
            }
            if (params.has('b_month')) {
                this.settingsPanel.querySelector('#b_month').value = params.get('b_month');
            }
            if (params.has('b_day')) {
                this.settingsPanel.querySelector('#b_day').value = params.get('b_day');
            }
            if (params.has('b_hr')) {
                this.settingsPanel.querySelector('#b_hr').value = params.get('b_hr');
            }
            if (params.has('b_min')) {
                this.settingsPanel.querySelector('#b_min').value = params.get('b_min');
            }

            let b_year = params.get('b_year');
            let b_month = params.get('b_month');
            let b_day = params.get('b_day');
            let b_hr = params.get('b_hr');
            let b_min = params.get('b_min');
            if (b_year && b_month && b_day && b_hr && b_min) {
                window.Module.setTimeB(parseInt(b_year), parseInt(b_month), parseInt(b_day), parseInt(b_hr), parseInt(b_min));
            }
        }

        if (params.has('theme')) {
            this.settingsPanel.querySelector('#theme').value = params.get('theme');
            window.Module.setTheme(params.get('theme'));
        }

        if (params.has('yearless')) {
            this.settingsPanel.querySelector('#yearless').checked = params.get('yearless') === 'true';
            window.Module.setYearless(params.get('yearless') === 'true');
        }

        if (params.has('show_globes')) {
            this.settingsPanel.querySelector('#show_globes').checked = params.get('show_globes') === 'true';
            window.Module.setShowGlobes(params.get('show_globes') === 'true');
        }

        if (params.has('autohide_timeline')) {
            this.settingsPanel.querySelector('#autohide_timeline').checked = params.get('autohide_timeline') === 'true';
            window.Module.setAutohideTimeline(params.get('autohide_timeline') === 'true');
        } 

        if (params.has('star_level')) {
            const starLevel = parseInt(params.get('star_level'));
            this.settingsPanel.querySelector('#star_level').value = starLevel;
            window.Module.setStarLevel(4 - starLevel); // Inverse because 0 is brightest
        }

        if (params.has('show_a')) {
            this.settingsPanel.querySelector('#show_a').checked = params.get('show_a') === 'true';
            window.Module.setShowA(params.get('show_a') === 'true');
        }

        if (params.has('show_b')) {
            this.settingsPanel.querySelector('#show_b').checked = params.get('show_b') === 'true';
            window.Module.setShowB(params.get('show_b') === 'true');
        }

        // this.initiate_autocomplete(this.settingsPanel, 'a', window.Module.setLocationA);
        // this.initiate_autocomplete(this.settingsPanel, 'b', window.Module.setLocationB);

        fetch('cities.zip')
            // unzip
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
                // retrieve lat/lng values when the user selects a city
                const options = {
                    keys: ['name'], // Fields to search
                    threshold: 0.3 // Adjust for fuzzy matching sensitivity
                };

                this.fuse = new Fuse(cities, options);

                const setLocationA = (lat, lng) =>{
                    window.Module.setLocationA(lat, lng);
                    setTimeout(() => {
                        this.update_a_location_from_app();
                    }, 500);
                }

                const setLocationB = (lat, lng) =>{
                    window.Module.setLocationB(lat, lng);
                    setTimeout(() => {
                        this.update_b_location_from_app();
                    }, 500);
                }

                this.initiate_autocomplete(this.settingsPanel, 'a', setLocationA);
                this.initiate_autocomplete(this.settingsPanel, 'b', setLocationB);
            })
            .catch(error => console.error('Error loading cities.json:', error));
    }


    initiate_autocomplete(settingsPanel, inputId, getSuggestions) {
        const searchInput = settingsPanel.querySelector(`#${inputId}_city`);
        const resultsList = settingsPanel.querySelector(`#${inputId}_city_suggestions`);
        let debounceTimeout = null; // Timeout for debouncing

        searchInput.addEventListener('input', () => {

            const query = searchInput.value;

            // Clear the previous debounce timeout
            clearTimeout(debounceTimeout);

            // Set a new debounce timeout
            debounceTimeout = setTimeout(() => {
                if (query.trim().length === 0) {
                    // Clear suggestions if the input is empty
                    resultsList.innerHTML = '';
                    return;
                }
                const results = this.fuse.search(query);

                // Clear previous results
                resultsList.innerHTML = '';

                // Display new results
                results.forEach(result => {
                    const li = document.createElement('li');
                    li.textContent = `${result.item.name}, ${result.item.country}`;
                    li.className = 'autocomplete-suggestion';

                    // Add click event to retrieve lat/lng and update the location
                    li.addEventListener('click', () => {
                        // Update the input field with the selected city
                        searchInput.value = `${result.item.name}, ${result.item.country}`;

                        // Retrieve lat/lng and pass them to the callback
                        const lat = result.item.lat;
                        const lng = result.item.long; // Note: `long` is used instead of `lng` in your JSON

                        // Update input and coordinates
                        settingsPanel.querySelector(`#${inputId}_lat`).value = lat.toFixed(4);
                        settingsPanel.querySelector(`#${inputId}_lng`).value = lng.toFixed(4);

                        // Optionally, update the module with the new location
                        if (window.Module) {
                            getSuggestions(lat, lng);
                        }

                        // Clear suggestions
                        resultsList.innerHTML = '';
                    });

                    resultsList.appendChild(li);
                });
            }, 300); // Adjust the debounce delay as needed
        });
    }


    updateSettings() {
        if (window.Module) {
            // Get the current values from the Module
            const a_name = window.Module.getNameA();
            const b_name = window.Module.getNameB();
            
            // Update the form fields with the current values
            this.settingsPanel.querySelector('#a_name').value = a_name || '';
            this.update_a_location_from_app();

            this.settingsPanel.querySelector('#b_name').value = b_name || '';
            this.update_b_location_from_app();

            this.settingsPanel.querySelector('#a_now').checked = window.Module.getTimeANow();
            this.update_a_time_from_app();

            this.settingsPanel.querySelector('#b_now').checked = window.Module.getTimeBNow();
            this.update_b_time_from_app();
        }
    }

    update_a_location_from_app() {
        if (window.Module) {
            this.settingsPanel.querySelector('#a_lat').value = window.Module.getLocationALat().toFixed(4);
            this.settingsPanel.querySelector('#a_lng').value = window.Module.getLocationALng().toFixed(4);
            this.update_a_timezone_from_app();

            // const a_here = this.settingsPanel.querySelector('#a_here');
            // // const a_loc = this.settingsPanel.querySelector('#a_location');
            // // a_loc.style.display = a_here.checked ? 'none' : 'block';
            // this.settingsPanel.querySelector('#a_lat').readOnly = a_here.checked;
            // this.settingsPanel.querySelector('#a_lng').readOnly = a_here.checked;
            
        }
    }

    update_a_timezone_from_app() {
        if (window.Module) {
            console.log("Updating A timezone from app", window.Module.getTimezoneA());
            this.settingsPanel.querySelector('#a_timezone').value = window.Module.getTimezoneA() || '';
        }
    }

    update_b_location_from_app() {
        if (window.Module) {
            this.settingsPanel.querySelector('#b_lat').value = window.Module.getLocationBLat().toFixed(4);
            this.settingsPanel.querySelector('#b_lng').value = window.Module.getLocationBLng().toFixed(4);
            this.update_b_timezone_from_app();

            // const b_here = this.settingsPanel.querySelector('#b_here');
            // // const b_loc = this.settingsPanel.querySelector('#b_location');
            // // b_loc.style.display = b_here.checked ? 'none' : 'block';
            // this.settingsPanel.querySelector('#b_lat').readOnly = b_here.checked;
            // this.settingsPanel.querySelector('#b_lng').readOnly = b_here.checked;
        }
    }

    update_b_timezone_from_app() {
        if (window.Module) {
            console.log('Updating B timezone from app', window.Module.getTimezoneB());
            this.settingsPanel.querySelector('#b_timezone').value = window.Module.getTimezoneB() || '';
        }
    }

    update_a_time_from_app() {
        if (window.Module) {
            
            const a_now = this.settingsPanel.querySelector('#a_now');

            // compose the querry using user string
            this.settingsPanel.querySelector('#a_year').value = window.Module.getTimeAYear();
            this.settingsPanel.querySelector('#a_year').readOnly = a_now.checked;
            this.settingsPanel.querySelector('#a_month').value = window.Module.getTimeAMonth();
            this.settingsPanel.querySelector('#a_month').readOnly = a_now.checked;
            this.settingsPanel.querySelector('#a_day').value = Math.floor(window.Module.getTimeADay());
            this.settingsPanel.querySelector('#a_day').readOnly = a_now.checked;
            this.settingsPanel.querySelector('#a_hr').value = window.Module.getTimeAHour();
            this.settingsPanel.querySelector('#a_hr').readOnly = a_now.checked;
            this.settingsPanel.querySelector('#a_min').value = window.Module.getTimeAMinute();
            this.settingsPanel.querySelector('#a_min').readOnly = a_now.checked;

            this.update_a_timezone_from_app();
        }
    }

    update_b_time_from_app() {
        if (window.Module) {
            const b_now = this.settingsPanel.querySelector('#b_now');
            this.settingsPanel.querySelector('#b_year').value = window.Module.getTimeBYear();
            this.settingsPanel.querySelector('#b_year').readOnly = b_now.checked;
            this.settingsPanel.querySelector('#b_month').value = window.Module.getTimeBMonth();
            this.settingsPanel.querySelector('#b_month').readOnly = b_now.checked;
            this.settingsPanel.querySelector('#b_day').value = Math.floor(window.Module.getTimeBDay());
            this.settingsPanel.querySelector('#b_day').readOnly = b_now.checked;
            this.settingsPanel.querySelector('#b_hr').value = window.Module.getTimeBHour();
            this.settingsPanel.querySelector('#b_hr').readOnly = b_now.checked;
            this.settingsPanel.querySelector('#b_min').value = window.Module.getTimeBMinute();
            this.settingsPanel.querySelector('#b_min').readOnly = b_now.checked;

            this.update_b_timezone_from_app();
        }
    }

    handleFocus() {
        if (window.Module) {
            if (this.showInfo || this.showSettings) {
                window.Module.setFocus(false);
                window.Module.canvas.blur();
                // Remove keyboard event listeners when panels are open
                window.removeEventListener('keydown', GLFW.onKeydown, true);
                window.removeEventListener('keypress', GLFW.onKeyPress, true);
                window.removeEventListener('keyup', GLFW.onKeyup, true);
                // Remove mouse event listeners
                window.removeEventListener('mousedown', GLFW.onMouseDown, true);
                window.removeEventListener('mouseup', GLFW.onMouseUp, true);
                window.removeEventListener('mousemove', GLFW.onMouseMove, true);
                // Remove touch event listeners
                window.removeEventListener('touchstart', GLFW.onTouchStart, true);
                window.removeEventListener('touchend', GLFW.onTouchEnd, true);
                window.removeEventListener('touchmove', GLFW.onTouchMove, true);
            }
            else {
                window.Module.setFocus(true);
                window.Module.canvas.focus();
                // Restore keyboard event listeners when panels are closed
                window.addEventListener('keydown', GLFW.onKeydown, true);
                window.addEventListener('keypress', GLFW.onKeyPress, true);
                window.addEventListener('keyup', GLFW.onKeyup, true);
                // retore mouse event listeners
                window.addEventListener('mousedown', GLFW.onMouseDown, true);
                window.addEventListener('mouseup', GLFW.onMouseUp, true);
                window.addEventListener('mousemove', GLFW.onMouseMove, true);
                // restore touch event listeners
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

.info-button {
    top: 20px;
    left: 20px;
}

.info-panel, .settings-panel {
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
}

.info-panel {
    left: -150%;
    transition: left 0.3s ease;
    will-change: left;
}

.info-panel.visible {
    left: 0 !important;
}

.settings-panel {
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

.a_group {
    margin-top: 30px;
    padding: 15px;
    background: rgb(36 67 79 / 88%);
    border-radius: 8px;
}

.b_group {
    margin-top: 30px;
    padding: 15px;
    background: rgb(102 64 63 / 88%);
    border-radius: 8px;
}

.global_group {
    margin-top: 30px;
    padding: 15px;
    border-radius: 8px;
    grid-auto-flow: column;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-flow: row dense;
    grid-gap: .8em;
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

.form-group input[type="checkbox"] {
    margin-right: 8px;
    width: 18px;
    height: 18px;
    cursor: pointer; 
    -webkit-tap-highlight-color: transparent;
}

.form-group input[readonly] {
    color: #a0a0a0; /* Gray text */
    cursor: not-allowed; /* Show not-allowed cursor */
}


#a_location, #b_location {
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
    .settings-panel, .info-panel {
        width: 100%;
        max-width: 340px;
    }

    .info-panel {
        height: 95vh;
    }

    .settings-panel {
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

.info-content {
    line-height: 1.6;
}

.info-content p {
    margin-bottom: 20px;
    font-size: 1.1rem;
}

.info-images {
    margin: 20px 0;
    text-align: center;
}

.info-images img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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