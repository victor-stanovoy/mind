/* mind. settings: themes, writing, atmosphere, data */
(function () {
  const { $ } = Mind;
  const KEY = 'mind.settings.v1';
  const DEF = {
    theme: 'melange', accent: '', font: 'serif', size: 30, strand: 'twine', wave: 50,
    light: true, grain: true, clock: true, notes: false, volume: 50, calm: false,
  };
  const THEMES = [
    { id: 'melange', name: 'Melange', desc: 'Marble tabletop, milk and gold', sw: ['#E3E1DC', '#F1EFEA', '#9B6B1B', '#5E4630'] },
    { id: 'bluenote', name: 'Blue note', desc: 'Late set, saxophone brass', sw: ['#0E1424', '#192140', '#F0B24A', '#86B6EE'] },
    { id: 'banquette', name: 'Banquette', desc: 'Green velvet, copper light', sw: ['#12211B', '#1D3329', '#E8A18B', '#8FC1B0'] },
    { id: 'dusk', name: 'Schönbrunn dusk', desc: 'Plum evening, apricot lamp', sw: ['#201729', '#33243F', '#F3A95F', '#97ADF2'] },
  ];
  const FONTS = {
    serif: { name: 'Serif', css: '"Newsreader", Georgia, serif', scale: 1 },
    sans: { name: 'Sans', css: '"Hanken Grotesk", system-ui, sans-serif', scale: 0.92 },
    type: { name: 'Typewriter', css: '"Courier Prime", "Courier New", monospace', scale: 0.85 },
    hand: { name: 'Handwritten', css: '"Caveat", "Segoe Script", cursive', scale: 1.22 },
  };
  const STRANDS = { twine: 'Twine', plain: 'Plain', dashed: 'Stitched', wire: 'Wire' };

  let V = Object.assign({}, DEF);
  try {
    Object.assign(V, JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch (e) {}

  const api = (Mind.settings = {
    FONTS,
    get: (k) => V[k],
    set(k, v) {
      V[k] = v;
      try {
        localStorage.setItem(KEY, JSON.stringify(V));
      } catch (e) {}
      apply();
      sync();
      Mind.emit('settings', k);
    },
  });

  function onAccent(hex) {
    const n = parseInt(hex.slice(1), 16);
    const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return l > 0.58 ? '#1a1204' : '#ffffff';
  }

  function apply() {
    const r = document.documentElement;
    r.dataset.theme = V.theme;
    r.dataset.strand = V.strand;
    const f = FONTS[V.font] || FONTS.serif;
    r.style.setProperty('--font-write', f.css);
    r.style.setProperty('--fs', Math.round(V.size * f.scale) + 'px');
    if (V.accent) {
      r.style.setProperty('--accent', V.accent);
      r.style.setProperty('--accent-ink', V.accent);
      r.style.setProperty('--on-accent', onAccent(V.accent));
    } else {
      ['--accent', '--accent-ink', '--on-accent'].forEach((p) => r.style.removeProperty(p));
    }
    document.body.classList.toggle('has-light', !!V.light);
    document.body.classList.toggle('has-grain', !!V.grain);
    document.body.classList.toggle('calm', !!V.calm);
    const clock = $('#clock');
    if (clock) clock.hidden = !V.clock;
    Mind.readTheme();
  }

  function sync() {
    $('#themeList').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === V.theme)));
    $('#fontChips').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === V.font)));
    $('#strandChips').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === V.strand)));
    $('#sizeRange').value = V.size;
    $('#waveRange').value = V.wave;
    $('#volRange').value = V.volume;
    $('#volRange').disabled = !V.notes;
    $('#optLight').checked = V.light;
    $('#optGrain').checked = V.grain;
    $('#optClock').checked = V.clock;
    $('#optNotes').checked = V.notes;
    $('#optCalm').checked = V.calm;
    if (V.accent) $('#accentInput').value = V.accent;
    else {
      const a = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      if (/^#[0-9a-f]{6}$/i.test(a)) $('#accentInput').value = a;
    }
  }

  function init() {
    $('#themeList').innerHTML = THEMES.map(
      (t) => `<button type="button" class="themeCard" data-id="${t.id}" aria-pressed="false">
        <span class="sw">${t.sw.map((c) => `<i style="background:${c}"></i>`).join('')}</span>
        <strong>${t.name}</strong><small>${t.desc}</small></button>`
    ).join('');
    $('#fontChips').innerHTML = Object.entries(FONTS)
      .map(([id, f]) => `<button type="button" class="chip" data-id="${id}" aria-pressed="false" style="font-family:${f.css}">${f.name}</button>`)
      .join('');
    $('#strandChips').innerHTML = Object.entries(STRANDS)
      .map(([id, n]) => `<button type="button" class="chip" data-id="${id}" aria-pressed="false">${n}</button>`)
      .join('');

    $('#themeList').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) {
        api.set('theme', b.dataset.id);
        api.set('accent', '');
      }
    });
    $('#fontChips').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) api.set('font', b.dataset.id);
    });
    $('#strandChips').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) api.set('strand', b.dataset.id);
    });
    $('#accentInput').addEventListener('input', (e) => api.set('accent', e.target.value));
    $('#accentReset').addEventListener('click', () => api.set('accent', ''));
    $('#sizeRange').addEventListener('input', (e) => api.set('size', +e.target.value));
    $('#waveRange').addEventListener('input', (e) => api.set('wave', +e.target.value));
    $('#volRange').addEventListener('input', (e) => api.set('volume', +e.target.value));
    [['optLight', 'light'], ['optGrain', 'grain'], ['optClock', 'clock'], ['optNotes', 'notes'], ['optCalm', 'calm']].forEach(([id, k]) => {
      $('#' + id).addEventListener('change', (e) => {
        api.set(k, e.target.checked);
        if (k === 'notes' && e.target.checked) Mind.sound && Mind.sound.knot();
      });
    });

    $('#dataExport').addEventListener('click', () => {
      const blob = new Blob([Mind.store.export()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mind-export-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      Mind.toast('Exported. Keep the file somewhere safe.');
    });
    $('#dataImport').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        Mind.store.import(await file.text());
        Mind.toast('Imported. Your brain books are back.');
      } catch (err) {
        Mind.toast(err.message || 'That file could not be read.');
      }
    });
    $('#dataSample').addEventListener('click', () => {
      Mind.store.addSample();
      Mind.toast('Added a sample string to this book.');
    });
    let armed = 0;
    $('#dataClear').addEventListener('click', (e) => {
      const b = e.currentTarget;
      if (!armed) {
        b.textContent = 'Click again to clear everything';
        armed = setTimeout(() => {
          armed = 0;
          b.textContent = 'Clear everything';
        }, 4000);
        return;
      }
      clearTimeout(armed);
      armed = 0;
      b.textContent = 'Clear everything';
      Mind.store.reset();
      Mind.toast('Cleared. A fresh brain book is ready.');
    });

    apply();
    sync();
  }

  Mind.views.settings = { init };
  apply(); // apply the saved theme straight away so the page never flashes the wrong one
})();
