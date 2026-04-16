// buy-print.js - Choose options -> render high-res -> pay -> fulfil
var API_BASE = window.ASTROS_API_BASE || 'http://localhost:3001';

class BuyPrint extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.options = { materials: [], sizes: [], frames: [] };
        this.busy = false;
    }

    connectedCallback() {
        var style = document.createElement('style');
        style.textContent = BUY_PRINT_CSS;
        this.shadowRoot.appendChild(style);

        var btn = document.createElement('button');
        btn.className = 'buy-button';
        btn.title = 'Buy Print';
        btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
        btn.onclick = () => this.openModal();
        this.shadowRoot.appendChild(btn);

        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay hidden';
        this.modal.innerHTML = '<div class="modal">' +
            '<div class="modal-header"><h2>Order a Print</h2><button class="close-btn">\u00d7</button></div>' +
            '<div class="modal-body">' +

            '<div id="step-options" class="step">' +
                '<p class="description">Your current chart rendered at 300\u2009DPI on museum-quality metallic paper, shipped to your door.</p>' +
                '<div class="options-grid">' +
                    '<div class="option-group"><label>Paper</label><select id="sel-material"></select></div>' +
                    '<div class="option-group"><label>Size</label><select id="sel-size"></select></div>' +
                    '<div class="option-group"><label>Frame</label><select id="sel-frame"></select></div>' +
                '</div>' +
                '<div class="price-display"><span id="price-label">\u2014</span></div>' +
                '<div id="status-msg" class="status hidden"></div>' +
                '<button id="render-btn" class="primary-button">Render High-Resolution Preview</button>' +
            '</div>' +

            '<div id="step-render" class="step hidden">' +
                '<div class="export-progress">' +
                    '<span class="export-label">Rendering\u2026</span>' +
                    '<progress max="1" value="0"></progress>' +
                '</div>' +
                '<div id="preview-area" class="hidden">' +
                    '<div class="preview-wrap"><img id="preview-img" alt="Print preview" /></div>' +
                    '<div id="render-status" class="status hidden"></div>' +
                    '<button id="checkout-btn" class="primary-button">Proceed to Checkout</button>' +
                    '<button id="back-btn" class="secondary-button">\u2190 Change Options</button>' +
                '</div>' +
            '</div>' +

            '<div id="step-done" class="step hidden">' +
                '<div id="done-pending">' +
                    '<p class="description">Payment confirmed! Submitting your print order\u2026</p>' +
                    '<progress style="width:100%;margin-top:8px;"></progress>' +
                '</div>' +
                '<div id="done-success" class="hidden">' +
                    '<p class="description success-msg">\u2713 Your print order has been submitted! You\u2019ll receive a shipping confirmation by email.</p>' +
                '</div>' +
                '<div id="done-error" class="hidden">' +
                    '<p class="description error-msg">\u26a0 Your payment was successful, but we were unable to submit your print order automatically.</p>' +
                    '<p class="description">Please contact <a id="done-contact-link" style="color:#f0c040;text-decoration:none" href="#">...</a> and include the details below so we can fulfil your order manually.</p>' +
                    '<div id="done-error-detail" class="error-detail"></div>' +
                '</div>' +
                '<div id="done-cancelled" class="hidden">' +
                    '<p class="description error-msg">Payment was cancelled \u2014 no charge was made.</p>' +
                    '<button id="done-back-btn" class="secondary-button">\u2190 Back to Options</button>' +
                '</div>' +
            '</div>' +

            '</div></div>';
        this.shadowRoot.appendChild(this.modal);

        this.modal.querySelector('.close-btn').onclick = () => this.closeModal();
        this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.closeModal(); });
        this.modal.querySelector('#sel-material').onchange = () => this.updatePrice();
        this.modal.querySelector('#sel-size').onchange = () => this.updatePrice();
        this.modal.querySelector('#sel-frame').onchange = () => this.updatePrice();
        this.modal.querySelector('#render-btn').onclick = () => this.startRender();
        this.modal.querySelector('#checkout-btn').onclick = () => this.startCheckout();
        this.modal.querySelector('#back-btn').onclick = () => this._showStep('step-options');
        this.modal.querySelector('#done-back-btn').onclick = () => this._showStep('step-options');

        this.fetchOptions();
        this.checkReturnFromStripe();
    }

    async fetchOptions() {
        try {
            var resp = await fetch(API_BASE + '/api/options');
            this.options = await resp.json();
            this._populateSelects();
        } catch (e) { console.warn('Could not fetch options:', e); }
    }

    _populateSelects() {
        var fill = function(sel, items, fmt) {
            sel.innerHTML = '';
            for (var i = 0; i < items.length; i++) {
                var opt = document.createElement('option');
                opt.value = items[i].id;
                opt.textContent = fmt ? fmt(items[i]) : items[i].name;
                sel.appendChild(opt);
            }
        };
        fill(this.modal.querySelector('#sel-material'), this.options.materials);
        fill(this.modal.querySelector('#sel-size'), this.options.sizes,
             function(s) { return s.name + '  \u2014  $' + (s.price_cents / 100).toFixed(0); });
        fill(this.modal.querySelector('#sel-frame'), this.options.frames,
             function(f) { return f.price_cents > 0 ? f.name + '  (+$' + (f.price_cents / 100).toFixed(0) + ')' : f.name; });
        this.updatePrice();
    }

    getSelectedProductId() {
        var m = this.modal.querySelector('#sel-material').value;
        var s = this.modal.querySelector('#sel-size').value;
        var f = this.modal.querySelector('#sel-frame').value;
        return m + '_' + s + '_' + f;
    }

    updatePrice() {
        var sid = this.modal.querySelector('#sel-size').value;
        var fid = this.modal.querySelector('#sel-frame').value;
        var sz = this.options.sizes.find(function(s) { return s.id === sid; });
        var fr = this.options.frames.find(function(f) { return f.id === fid; });
        var total = (sz ? sz.price_cents : 0) + (fr ? fr.price_cents : 0);
        this.modal.querySelector('#price-label').textContent = '$' + (total / 100).toFixed(2) + ' + shipping';
    }

    _getMaxTextureSize() {
        var c = document.querySelector('canvas');
        var gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
        return gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
    }

    _getExportSize() {
        var sid = this.modal.querySelector('#sel-size').value;
        var sz = this.options.sizes.find(function(s) { return s.id === sid; });
        var maxTex = this._getMaxTextureSize();
        var w = sz ? sz.export_width  : 2048;
        var h = sz ? sz.export_height : 2048;
        // Scale both dims proportionally if either exceeds the GPU limit
        var scale = Math.min(1, maxTex / Math.max(w, h));
        return { w: Math.round(w * scale), h: Math.round(h * scale) };
    }

    _showStep(id) {
        this.modal.querySelectorAll('.step').forEach(function(s) { s.classList.add('hidden'); });
        this.modal.querySelector('#' + id).classList.remove('hidden');
    }

    openModal()  { this.modal.classList.remove('hidden'); }
    closeModal() { if (!this.busy) this.modal.classList.add('hidden'); }

    setStatus(id, msg, isError) {
        var el = this.modal.querySelector('#' + id);
        if (!el) return;
        el.textContent = msg;
        el.className = 'status' + (isError ? ' error' : '');
        el.classList.remove('hidden');
    }

    getChartParams() {
        var p = new URLSearchParams(window.location.search);
        var now = new Date();
        return {
            lat:    parseFloat(p.get('lat'))         || 40.7128,
            lng:    parseFloat(p.get('lng'))         || -74.006,
            year:   parseInt(p.get('local_year'))    || now.getFullYear(),
            month:  parseInt(p.get('local_month'))   || (now.getMonth() + 1),
            day:    parseInt(p.get('local_day'))     || now.getDate(),
            hour:   parseInt(p.get('local_hr'))      || now.getHours(),
            minute: parseInt(p.get('local_min'))     || now.getMinutes(),
        };
    }

    // Step 2: Render at full DPI for the selected size
    async startRender() {
        if (this.busy) return;
        this.busy = true;
        this.modal.querySelector('#render-btn').disabled = true;
        this._showStep('step-render');
        this.modal.querySelector('#preview-area').classList.add('hidden');
        this.modal.querySelector('.export-progress').classList.remove('hidden');

        try {
            while (!window.module_loaded)
                await new Promise(function(r) { setTimeout(r, 200); });

            var exportDims = this._getExportSize();
            var exportW = exportDims.w;
            var exportH = exportDims.h;
            var progBar = this.modal.querySelector('#step-render progress');
            var progLabel = this.modal.querySelector('#step-render .export-label');

            this._renderBlob = await this.captureHighRes(exportW, exportH, 32, function(t) {
                progBar.value = t;
                progLabel.textContent = t >= 1 ? 'Finalising\u2026' : ('Rendering\u2026 ' + Math.round(t * 100) + '%');
            });

            var img = this.modal.querySelector('#preview-img');
            if (this._previewURL) URL.revokeObjectURL(this._previewURL);
            this._previewURL = URL.createObjectURL(this._renderBlob);
            img.src = this._previewURL;
            this.modal.querySelector('.export-progress').classList.add('hidden');
            this.modal.querySelector('#preview-area').classList.remove('hidden');
        } catch (e) {
            this.modal.querySelector('.export-progress').classList.add('hidden');
            this.modal.querySelector('#preview-area').classList.remove('hidden');
            this.setStatus('render-status', 'Render error: ' + e.message, true);
        } finally {
            this.modal.querySelector('#render-btn').disabled = false;
            this.busy = false;
        }
    }

    // Step 3: Upload rendered image, then redirect to Stripe
    async startCheckout() {
        if (this.busy || !this._renderBlob) return;
        this.busy = true;
        var btn = this.modal.querySelector('#checkout-btn');
        btn.disabled = true;
        btn.textContent = 'Uploading image\u2026';

        try {
            var form = new FormData();
            form.append('file', this._renderBlob, 'astros-print.jpg');
            var upResp = await fetch(API_BASE + '/api/upload-image', { method: 'POST', body: form });
            if (!upResp.ok) { var e1 = await upResp.json().catch(function(){return {};}); throw new Error(e1.detail || 'Upload failed'); }
            var upData = await upResp.json();

            btn.textContent = 'Creating checkout\u2026';
            var chart = this.getChartParams();
            var body = {
                product_id: this.getSelectedProductId(),
                image_url: upData.image_url,
                lat: chart.lat, lng: chart.lng,
                year: chart.year, month: chart.month, day: chart.day,
                hour: chart.hour, minute: chart.minute,
            };
            var csResp = await fetch(API_BASE + '/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!csResp.ok) { var e2 = await csResp.json().catch(function(){return {};}); throw new Error(e2.detail || 'Server error'); }
            var data = await csResp.json();
            window.location.href = data.checkout_url;
        } catch (e) {
            this.setStatus('render-status', e.message, true);
            btn.disabled = false;
            btn.textContent = 'Proceed to Checkout';
            this.busy = false;
        }
    }

    // Step 4: Return from Stripe
    checkReturnFromStripe() {
        var params = new URLSearchParams(window.location.search);
        var sessionId = params.get('session_id');
        var cancelled = params.get('cancelled');
        if (!sessionId && !cancelled) return;
        this.openModal();
        this._showStep('step-done');
        var clean = new URL(window.location.href);
        clean.searchParams.delete('session_id');
        clean.searchParams.delete('product_id');
        clean.searchParams.delete('cancelled');
        window.history.replaceState({}, '', clean.toString());
        if (cancelled) {
            this._showDoneState('done-cancelled');
            return;
        }
        this._showDoneState('done-pending');
        this._pollOrderStatus(sessionId);
    }

    _showDoneState(id) {
        var ids = ['done-pending', 'done-success', 'done-error', 'done-cancelled'];
        var self = this;
        ids.forEach(function(s) {
            var el = self.modal.querySelector('#' + s);
            if (el) el.classList[s === id ? 'remove' : 'add']('hidden');
        });
    }

    async _pollOrderStatus(sessionId) {
        var deadline = Date.now() + 60000; // 60 s timeout
        while (Date.now() < deadline) {
            try {
                var resp = await fetch(API_BASE + '/api/order-status/' + encodeURIComponent(sessionId));
                if (resp.ok) {
                    var data = await resp.json();
                    if (data.status === 'ok') {
                        this._showDoneState('done-success');
                        return;
                    }
                    if (data.status === 'failed') {
                        this._showDoneState('done-error');
                        var email = data.contact_email || (this.options && this.options.contact_email) || '';
                        var link = this.modal.querySelector('#done-contact-link');
                        if (link && email) { link.href = 'mailto:' + email; link.textContent = email; }
                        var detail = this.modal.querySelector('#done-error-detail');
                        if (detail && data.image_url) {
                            detail.innerHTML = '<strong>Image reference:</strong><br>' +
                                '<a href="' + data.image_url + '" target="_blank" style="color:#f0c040;word-break:break-all">' + data.image_url + '</a>';
                        }
                        return;
                    }
                    // status === 'pending' — keep polling
                }
            } catch (e) { /* network error — keep trying */ }
            await new Promise(function(r) { setTimeout(r, 2500); });
        }
        // Timed out — show error so user knows to contact
        this._showDoneState('done-error');
        var email = (this.options && this.options.contact_email) || '';
        var link = this.modal.querySelector('#done-contact-link');
        if (link && email) { link.href = 'mailto:' + email; link.textContent = email; }
    }

    // High-res capture helper
    captureHighRes(w, h, frames, onProgress) {
        return new Promise(function(resolve, reject) {
            window.Module['onExportProgress'] = function(t) { if (onProgress) onProgress(t); };
            window.Module['onExportComplete'] = function(ptr, ew, eh) {
                delete window.Module['onExportProgress'];
                delete window.Module['onExportComplete'];
                try {
                    if (!ptr) throw new Error('null pixel pointer');
                    var len = ew * eh * 4;
                    var px = new Uint8ClampedArray(window.Module.HEAPU8.buffer, ptr, len).slice();
                    window.Module.ccall('freePixels', null, ['number'], [ptr]);
                    var row = ew * 4, tmp = new Uint8ClampedArray(row);
                    for (var t2 = 0, b = eh - 1; t2 < b; t2++, b--) {
                        var tO = t2 * row, bO = b * row;
                        tmp.set(px.subarray(tO, tO + row));
                        px.copyWithin(tO, bO, bO + row);
                        px.set(tmp, bO);
                    }
                    var c = new OffscreenCanvas(ew, eh);
                    c.getContext('2d').putImageData(new ImageData(px, ew, eh), 0, 0);
                    c.convertToBlob({ type: 'image/jpeg', quality: 0.92 }).then(resolve).catch(reject);
                } catch (e) { reject(e); }
            };
            try {
                window.Module.ccall('startExportHighRes', null, ['number','number','number'], [w, h, frames || 32]);
            } catch (e) {
                delete window.Module['onExportProgress'];
                delete window.Module['onExportComplete'];
                reject(e);
            }
        });
    }
}

var BUY_PRINT_CSS = [
':host { z-index: 1000; }',
'.buy-button { position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid white; color: white; display: flex; justify-content: center; align-items: center; cursor: pointer; outline: none; transition: background 0.2s; z-index: 1001; }',
'.buy-button:hover { background: rgba(0,0,0,0.8); }',
'.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 2000; }',
'.modal-overlay.hidden { display: none; }',
'.modal { background: #1a1a2e; color: white; border-radius: 12px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; padding: 24px; font-family: "Lucida Console", Monaco, monospace; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }',
'.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 12px; }',
'.modal-header h2 { margin: 0; font-size: 1.3rem; }',
'.close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }',
'.close-btn:hover { background: rgba(255,255,255,0.1); }',
'.step.hidden { display: none; }',
'.hidden { display: none; }',
'.description { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin: 0 0 16px 0; line-height: 1.5; }',
'.success-msg { color: #a5d6a7; }',
'.error-msg { color: #ef9a9a; }',
'.error-detail { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 12px; font-size: 0.8rem; margin-top: 8px; word-break: break-all; line-height: 1.6; }',
'.preview-wrap { display: flex; justify-content: center; margin-bottom: 16px; background: #f5f0e8; border-radius: 6px; padding: 16px; box-shadow: inset 0 0 20px rgba(0,0,0,0.08); }',
'.preview-wrap img { max-width: 100%; max-height: 40vh; object-fit: contain; border-radius: 2px; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }',
'.options-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px; }',
'.option-group label { display: block; font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }',
'.option-group select { width: 100%; padding: 8px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: white; font-size: 0.8rem; font-family: inherit; cursor: pointer; }',
'select option { background: #1a1a2e; color: white; }',
'.price-display { text-align: center; font-size: 1.6rem; font-weight: bold; margin: 12px 0 20px 0; color: #f0c040; }',
'.status { padding: 10px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 12px; background: rgba(76,175,80,0.15); border: 1px solid rgba(76,175,80,0.4); color: #a5d6a7; line-height: 1.4; }',
'.status.error { background: rgba(244,67,54,0.15); border-color: rgba(244,67,54,0.4); color: #ef9a9a; }',
'.status.hidden { display: none; }',
'.primary-button { width: 100%; padding: 14px; background: #4CAF50; color: white; border: none; border-radius: 6px; font-size: 1rem; font-family: inherit; cursor: pointer; transition: background 0.2s; }',
'.primary-button:hover:not(:disabled) { background: #45a049; }',
'.primary-button:disabled { opacity: 0.6; cursor: wait; }',
'.secondary-button { width: 100%; padding: 10px; margin-top: 8px; background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 0.85rem; font-family: inherit; cursor: pointer; transition: background 0.2s, color 0.2s; }',
'.secondary-button:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }',
'.export-progress { margin-bottom: 12px; }',
'.export-progress.hidden { display: none; }',
'.export-label { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 4px; }',
'.export-progress progress { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; border: none; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.1); }',
'.export-progress progress::-webkit-progress-bar { background: rgba(255,255,255,0.1); border-radius: 3px; }',
'.export-progress progress::-webkit-progress-value { background: #f0c040; border-radius: 3px; transition: width 0.1s ease; }',
'.export-progress progress::-moz-progress-bar { background: #f0c040; border-radius: 3px; }',
'@media (max-width: 480px) { .modal { width: 95%; padding: 16px; } .options-grid { grid-template-columns: 1fr; } }',
].join('\n');

customElements.define('buy-print', BuyPrint);
