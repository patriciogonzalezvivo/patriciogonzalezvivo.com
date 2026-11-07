// Web MIDI output for the Astros sound layer (the WASM build's counterpart of RtMidi).
// The C++ side (Pianola::transmit) calls AstrosMidi.send() for every MIDI message and
// AstrosMidi.connect() once at startup; nothing else is needed from the page.
//
// A browser page cannot create a virtual MIDI port, so to reach another web page (the FM-1
// emulator at https://joakimeriksson.github.io/fm1-emu) or a program, route through a loopback
// port: IAC Driver (macOS), loopMIDI (Windows) or ALSA virtual MIDI (Linux). Astros sends to the
// loopback's output, the emulator listens on its input.
//
// Port choice: ?midi=NAME in the URL, else the port picked in the selector (remembered), else the
// first output matching the names in the sound config (FM-1, FM1, (emu)), else one that looks like
// a loopback, else the first output.
//
// The page is the only source of truth for what is sounding: messages sent before a port is open
// (the permission prompt takes a moment, and the sun's pedal starts at launch) are tracked and
// replayed when it opens, and again if the port changes.
(function () {
    'use strict';

    const LOOPBACK = /FM-?1|\(emu\)|IAC|loopMIDI|virtual|astros/i;
    const STORE = 'astros.midi.out';

    const state = {
        access: null,
        out: null,
        wanted: [],
        status: 'idle',         // idle | pending | ready | none | unsupported | denied
        cc: new Map(),          // channel << 8 | controller -> value
        pc: new Map(),          // channel -> program
        held: new Map(),        // channel << 8 | note -> velocity
        ui: null,
    };

    function remember(value) { try { localStorage.setItem(STORE, value); } catch (e) { /* private window */ } }
    function remembered() { try { return localStorage.getItem(STORE) || ''; } catch (e) { return ''; } }

    // What is sounding, per channel: enough to put a late or new port in the same state.
    function track(a, b, c) {
        const type = a & 0xf0, ch = a & 0x0f;
        if (type === 0x90 && c > 0) state.held.set((ch << 8) | b, c);
        else if (type === 0x80 || type === 0x90) state.held.delete((ch << 8) | b);
        else if (type === 0xb0) {
            if (b === 123 || b === 120) {
                for (const key of Array.from(state.held.keys()))
                    if ((key >> 8) === ch) state.held.delete(key);
            }
            else state.cc.set((ch << 8) | b, c);
        }
        else if (type === 0xc0) state.pc.set(ch, b);
    }

    function raw(out, bytes) {
        try { out.send(bytes); } catch (e) { /* a port that went away */ }
    }

    function silence(out) {
        for (let ch = 0; ch < 16; ch++) {
            raw(out, [0xb0 | ch, 123, 0]);
            raw(out, [0xb0 | ch, 120, 0]);
        }
    }

    // Program, controllers, then the notes that are held.
    function replay(out) {
        state.pc.forEach((program, ch) => raw(out, [0xc0 | ch, program]));
        state.cc.forEach((value, key) => raw(out, [0xb0 | (key >> 8), key & 0xff, value]));
        state.held.forEach((velocity, key) => raw(out, [0x90 | (key >> 8), key & 0xff, velocity]));
    }

    function outputs() {
        return state.access ? Array.from(state.access.outputs.values()) : [];
    }

    function choose(list) {
        if (!list.length) return null;
        const url = new URLSearchParams(location.search).get('midi');
        const names = (url ? [url] : [remembered()]).concat(url ? [] : state.wanted).filter(Boolean);
        for (const name of names) {
            const hit = list.find(o => (o.name || '').toLowerCase().includes(name.toLowerCase()) || o.id === name);
            if (hit) return hit;
        }
        return list.find(o => LOOPBACK.test(o.name || '')) || list[0];
    }

    function setStatus(status) {
        state.status = status;
        draw();
        if (window.AstrosMidi && typeof window.AstrosMidi.onchange === 'function') window.AstrosMidi.onchange(status, state.out);
    }

    function use(port) {
        if (port === state.out && state.status !== 'pending') return;
        if (state.out) silence(state.out);
        state.out = port;
        if (port) {
            console.log('Astros MIDI: sending to "' + port.name + '"');
            replay(port);
        }
        setStatus(port ? 'ready' : 'none');
    }

    function refresh() {
        const list = outputs();
        // keep the current port while it is still there
        const current = state.out && list.find(o => o.id === state.out.id && o.state !== 'disconnected');
        use(current || choose(list.filter(o => o.state !== 'disconnected')));
        draw();
    }

    // A small selector, only when there is something to choose or to explain.
    function draw() {
        if (!state.ui) {
            const box = document.createElement('div');
            box.id = 'astros-midi';
            box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:20;font:11px "Lucida Console",Monaco,monospace;' +
                'color:#fff;background:rgba(0,0,0,.55);padding:6px 8px;border-radius:4px;display:none;max-width:60vw';
            const label = document.createElement('span');
            const select = document.createElement('select');
            select.style.cssText = 'margin-left:6px;font:inherit;max-width:40vw';
            select.addEventListener('change', () => {
                const port = outputs().find(o => o.id === select.value);
                if (port) { remember(port.name || port.id); use(port); }
            });
            box.appendChild(label);
            box.appendChild(select);
            document.body.appendChild(box);
            state.ui = { box, label, select };
        }
        const { box, label, select } = state.ui;
        const list = outputs().filter(o => o.state !== 'disconnected');
        const messages = {
            unsupported: 'MIDI out: this browser has no Web MIDI (use Chrome, Edge or Firefox over https)',
            denied: 'MIDI out: permission denied',
            none: 'MIDI out: no output port. Create a loopback (IAC Driver, loopMIDI) to reach the FM-1 emulator',
        };
        const problem = state.status === 'unsupported' || state.status === 'denied' || state.status === 'none';
        box.style.display = (problem || (state.status === 'ready' && list.length > 1)) ? 'block' : 'none';
        label.textContent = messages[state.status] || 'MIDI out';
        select.style.display = list.length > 1 ? 'inline-block' : 'none';
        while (select.firstChild) select.removeChild(select.firstChild);
        for (const o of list) {
            const opt = document.createElement('option');
            opt.value = o.id;
            opt.textContent = o.name || o.id;
            opt.selected = state.out && o.id === state.out.id;
            select.appendChild(opt);
        }
    }

    const api = {
        status: () => state.status,
        // names: comma separated substrings (the sound config's ports)
        connect(names) {
            state.wanted = String(names || '').split(',').map(s => s.trim()).filter(Boolean);
            if (state.status === 'pending' || state.access) return;
            if (!navigator.requestMIDIAccess) { setStatus('unsupported'); return; }
            state.status = 'pending';
            navigator.requestMIDIAccess({ sysex: false }).then(access => {
                state.access = access;
                access.onstatechange = refresh;
                refresh();
            }).catch(err => {
                console.warn('Astros MIDI: no access to Web MIDI', err);
                setStatus('denied');
            });
        },
        send(a, b, c, n) {
            track(a, b, c);
            if (state.out) raw(state.out, n === 2 ? [a, b] : [a, b, c]);
        },
        silence() { if (state.out) silence(state.out); state.held.clear(); },
        // for tests
        _state: state,
    };
    window.AstrosMidi = api;

    // never leave a note hanging on the synth when the page goes away
    window.addEventListener('pagehide', () => { if (state.out) silence(state.out); });
})();
