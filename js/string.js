/* mind. string: the writing interface.
   Thoughts are written along a literal string. Enter ties a knot and the string carries on. */
(function () {
  const { $, snip } = Mind;
  const Store = Mind.store;
  const NS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const START = 150; // where the first thought begins along the string
  const GAP = 56; // room for a knot between thoughts
  const PROMPTS = [
    'What is on the table in front of you?',
    'Something you overheard and kept thinking about.',
    'A question you have been carrying around.',
    'What would you tell yourself this morning?',
    'The last thing that made you slow down.',
    'Something you keep almost remembering.',
    'What are you circling without landing on?',
    'A small thing that went well today.',
    'Who have you been thinking about, and why?',
    'What would you write if nobody would ever read it?',
  ];

  let svg, pan, loom, cap, thoughtL, beadL, knotL, linkL, ringG, strandG, liveTP, caret, jumpBtn, promptEl, titleEl, pickEl;
  let W = 800, H = 500;
  let manual = false, panX = 0, panY = 0;
  let caretX = 0, liveStart = START, fs = 30, SHIFT = 15;
  let sel = null, popId = null, loadedSid = null, pos = [];
  let drag = null;

  /* ---------- the path the string follows ---------- */
  let xs = [0], ys = [0], cum = [0], px = 0, AMP = 40;
  const PH = 0.7;
  function Yf(x) {
    return AMP * (0.62 * Math.sin(x / 260 + PH) + 0.38 * Math.sin(x / 113 + PH * 1.7)) * Math.min(1, x / 320);
  }
  function resetPath() {
    AMP = 6 + 74 * (Mind.settings.get('wave') / 100);
    xs = [0];
    ys = [Yf(0)];
    cum = [0];
    px = 0;
    $('#strandPath').setAttribute('d', 'M0 ' + ys[0]);
  }
  function extend(minLen) {
    if (cum[cum.length - 1] >= minLen) return;
    const target = minLen + 3500;
    while (cum[cum.length - 1] < target) {
      px += 5;
      const y = Yf(px);
      const i = xs.length - 1;
      xs.push(px);
      ys.push(y);
      cum.push(cum[i] + Math.hypot(5, y - ys[i]));
    }
    let d = 'M' + xs[0] + ' ' + ys[0].toFixed(1);
    for (let i = 1; i < xs.length; i++) d += 'L' + xs[i] + ' ' + ys[i].toFixed(1);
    $('#strandPath').setAttribute('d', d);
  }
  function pointAt(L) {
    if (L <= 0) return { x: xs[0], y: ys[0], a: 0 };
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (cum[m] < L) lo = m;
      else hi = m;
    }
    const seg = cum[hi] - cum[lo] || 1;
    const f = (L - cum[lo]) / seg;
    return {
      x: xs[lo] + (xs[hi] - xs[lo]) * f,
      y: ys[lo] + (ys[hi] - ys[lo]) * f,
      a: Math.atan2(ys[hi] - ys[lo], xs[hi] - xs[lo]),
    };
  }

  /* ---------- svg helpers ---------- */
  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function textOnPath(text, offset, cls, id) {
    const t = el('text', { class: cls });
    if (id) t.setAttribute('data-id', id);
    t.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    const tp = el('textPath', { href: '#strandPath', startOffset: offset });
    tp.setAttributeNS(XLINK, 'xlink:href', '#strandPath');
    tp.textContent = text;
    t.appendChild(tp);
    return { t, tp };
  }
  let mctx;
  function measure(tp, text) {
    let len = 0;
    try {
      len = tp.getComputedTextLength();
    } catch (e) {}
    if (!len && text) {
      mctx = mctx || document.createElement('canvas').getContext('2d');
      mctx.font = fs + 'px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-write');
      len = mctx.measureText(text).width;
    }
    return len;
  }
  const catHue = (t) => {
    const c = t.cat && Store.cat(t.cat, t.bookId);
    return c ? c.hue : null;
  };

  /* ---------- drawing ---------- */
  function measureBox() {
    const r = loom.getBoundingClientRect();
    W = r.width || 800;
    H = r.height || 500;
  }

  function render() {
    if (Mind.current !== 'write') return;
    measureBox();
    fs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fs')) || 30;
    SHIFT = fs * 0.26 + 7;
    strandG.setAttribute('transform', 'translate(0 ' + SHIFT + ')');
    caret.firstElementChild.setAttribute('y', -fs * 0.82);
    caret.firstElementChild.setAttribute('height', fs * 1.05);

    const sid = Store.ensureString(Store.state.currentBook);
    if (loadedSid !== sid) {
      cap.value = Store.state.drafts[sid] || '';
      loadedSid = sid;
      manual = false;
    }
    const list = Store.thoughtsOf(sid);
    const est = list.reduce((a, t) => a + t.text.length * fs * 0.75 + GAP, START) + W + 2500;
    extend(est);

    [thoughtL, beadL, knotL, linkL].forEach((g) => (g.textContent = ''));
    ringG.textContent = '';
    const p0 = pointAt(0);
    ringG.appendChild(el('circle', { class: 'ring', cx: p0.x, cy: p0.y + SHIFT, r: 11 }));
    ringG.appendChild(el('circle', { class: 'ringIn', cx: p0.x, cy: p0.y + SHIFT, r: 4 }));

    let off = START;
    pos = [];
    list.forEach((t) => {
      const { t: node, tp } = textOnPath(t.text, off, 'thoughtText done' + (sel === t.id ? ' sel' : ''), t.id);
      thoughtL.appendChild(node);
      const len = measure(tp, t.text);
      pos.push({ t, off, len });
      off += len + GAP;
    });
    liveStart = off;
    if (liveStart > cum[cum.length - 1] - W) extend(liveStart + W * 1.5);

    // beads at the start of each thought, knots after it
    pos.forEach((p) => {
      const b = pointAt(p.off - 20);
      const hue = catHue(p.t);
      const bead = el('circle', {
        class: 'bead' + (hue === null ? ' none' : ''),
        cx: b.x, cy: b.y + SHIFT, r: 5.5, 'data-id': p.t.id,
      });
      if (hue !== null) bead.style.fill = Mind.catColor(hue);
      beadL.appendChild(bead);

      const k = pointAt(p.off + p.len + GAP / 2);
      const g = el('g', { class: 'knot' + (popId === p.t.id ? ' pop' : ''), transform: 'translate(' + k.x + ' ' + (k.y + SHIFT) + ') rotate(' + (k.a * 180) / Math.PI + ')' });
      const inner = el('g', { class: 'kin' });
      inner.appendChild(el('ellipse', { class: 'k1', rx: 8, ry: 6 }));
      inner.appendChild(el('path', { class: 'k2', d: 'M-5 -1 C-2 -5 2 5 5 1' }));
      g.appendChild(inner);
      knotL.appendChild(g);
    });
    popId = null;

    // loops hang under the string between linked thoughts on this string
    const idx = new Map(pos.map((p, i) => [p.t.id, i]));
    const done = new Set();
    pos.forEach((p, i) => {
      p.t.links.forEach((lid) => {
        const j = idx.get(lid);
        if (j === undefined) return;
        const key = i < j ? i + '-' + j : j + '-' + i;
        if (done.has(key)) return;
        done.add(key);
        const a = pointAt(pos[Math.min(i, j)].off - 20);
        const b = pointAt(pos[Math.max(i, j)].off - 20);
        const dist = Math.abs(b.x - a.x);
        const drop = Math.min(130, 34 + dist * 0.16);
        linkL.appendChild(el('path', {
          class: 'loop',
          d: 'M' + a.x + ' ' + (a.y + SHIFT) + ' Q' + (a.x + b.x) / 2 + ' ' + ((a.y + b.y) / 2 + SHIFT + drop * 1.6) + ' ' + b.x + ' ' + (b.y + SHIFT),
        }));
      });
    });

    updateLive(true);
    follow();
    refreshHeader();
    $('#writeCount').textContent = list.length + (list.length === 1 ? ' thought' : ' thoughts') + ' on this string';
  }

  function updateLive(skipFollow) {
    const v = cap.value;
    extend(liveStart + v.length * fs * 0.75 + W);
    liveTP.textContent = v;
    liveTP.setAttribute('startOffset', liveStart);
    let len = v ? measure(liveTP, v) : 0;
    const p = pointAt(liveStart + len);
    caret.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (p.a * 180) / Math.PI + ')');
    caretX = p.x;
    promptEl.hidden = !(pos.length === 0 && !v);
    if (!skipFollow) follow();
  }

  function clampPan() {
    panX = Math.max(W * 0.9 - (caretX + W * 0.1), Math.min(W * 0.22, panX));
  }
  function applyPan() {
    pan.style.transform = 'translate(' + panX + 'px,' + panY + 'px)';
  }
  function follow() {
    if (manual) return;
    panX = Math.min(W * 0.22, W * 0.58 - caretX);
    panY = H * 0.52;
    applyPan();
    jumpBtn.hidden = true;
  }
  function goManual() {
    manual = true;
    jumpBtn.hidden = false;
  }

  /* ---------- tying and untying knots ---------- */
  function sid() {
    return Store.ensureString(Store.state.currentBook);
  }
  function tie() {
    const text = cap.value.replace(/\s+/g, ' ').trim();
    if (!text) {
      Mind.toast('Write a thought first, then tie the knot.');
      return;
    }
    const t = Store.addThought(sid(), text);
    cap.value = '';
    Store.setDraft(sid(), '');
    popId = t.id;
    manual = false;
    render();
    Mind.sound && Mind.sound.knot();
    const e = Store.echoes(t, 1, true)[0];
    if (e) {
      Mind.toast('That echoes “' + snip(e.t.text, 44) + '”.', {
        action: 'Link them',
        fn: () => Store.link(t.id, e.t.id),
      });
    }
  }
  function untie() {
    const list = Store.thoughtsOf(sid());
    const t = list[list.length - 1];
    if (!t) return;
    if (t.links.length) {
      Mind.toast('That thought has links. Open it to change it.');
      return;
    }
    cap.value = t.text;
    Store.removeThought(t.id);
    Store.setDraft(sid(), t.text);
    manual = false;
    render();
    Mind.toast('Knot untied. Press Enter to tie it again.');
  }

  /* ---------- header: title, string picker ---------- */
  function refreshHeader() {
    const id = sid();
    const s = Store.string(id);
    if (document.activeElement !== titleEl) titleEl.value = s.title;
    const all = Store.stringsOf().slice().sort((a, b) => b.created - a.created);
    pickEl.innerHTML = all
      .map((x) => `<option value="${x.id}"${x.id === id ? ' selected' : ''}>${Mind.esc(x.title || 'Untitled string')} (${Mind.fmtDay(x.created)})</option>`)
      .join('');
  }

  function reveal(id) {
    render();
    const p = pos.find((q) => q.t.id === id);
    if (!p) return;
    const mid = pointAt(p.off + p.len / 2);
    manual = true;
    panX = W * 0.5 - mid.x;
    clampPan();
    applyPan();
    jumpBtn.hidden = false;
  }

  /* ---------- wiring ---------- */
  function init() {
    svg = $('#stringSvg');
    pan = $('#pan');
    loom = $('#loom');
    cap = $('#capture');
    thoughtL = $('#thoughtLayer');
    beadL = $('#beadLayer');
    knotL = $('#knotLayer');
    linkL = $('#linkLayer');
    ringG = $('#ringG');
    strandG = $('#strandG');
    liveTP = $('#liveTP');
    caret = $('#caret');
    jumpBtn = $('#jumpEnd');
    promptEl = $('#prompt');
    titleEl = $('#stringTitle');
    pickEl = $('#stringPicker');

    const day = Math.floor(Date.now() / 86400000);
    $('#promptText').textContent = PROMPTS[day % PROMPTS.length];
    resetPath();

    cap.addEventListener('input', () => {
      manual = false;
      Store.setDraft(sid(), cap.value);
      updateLive();
    });
    cap.addEventListener('keydown', (e) => {
      if (e.isComposing) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        tie();
        return;
      }
      if (e.key === 'Backspace' && cap.value === '') {
        e.preventDefault();
        untie();
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && Mind.sound) Mind.sound.key();
    });
    cap.addEventListener('select', () => cap.setSelectionRange(cap.value.length, cap.value.length));

    // typing anywhere on the Write view goes to the string
    document.addEventListener('keydown', (e) => {
      if (Mind.current !== 'write' || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const a = document.activeElement;
      if (a && a !== document.body && a !== cap) return;
      if (document.querySelector('.panel.on') || document.querySelector('dialog[open]')) return;
      cap.focus({ preventScroll: true });
    });

    // pan by dragging; a tap on a thought opens it
    loom.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('button,select,input')) return;
      drag = { x: e.clientX, px: panX, moved: false, target: e.target, id: e.pointerId };
    });
    loom.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        goManual();
        pan.classList.add('drag');
        try {
          loom.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      if (drag.moved) {
        panX = drag.px + dx;
        clampPan();
        applyPan();
      }
    });
    loom.addEventListener('pointerup', () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      pan.classList.remove('drag');
      if (!d.moved) {
        const hit = d.target.closest && d.target.closest('[data-id]');
        if (hit) Mind.openInspector(hit.getAttribute('data-id'));
        else cap.focus({ preventScroll: true });
      }
    });
    loom.addEventListener('pointercancel', () => {
      drag = null;
      pan.classList.remove('drag');
    });
    loom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        goManual();
        pan.classList.add('drag');
        panX -= Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        clampPan();
        applyPan();
        clearTimeout(init.wt);
        init.wt = setTimeout(() => pan.classList.remove('drag'), 120);
      },
      { passive: false }
    );
    jumpBtn.addEventListener('click', () => {
      manual = false;
      follow();
      cap.focus({ preventScroll: true });
    });

    titleEl.addEventListener('input', () => Store.renameString(sid(), titleEl.value));
    titleEl.addEventListener('blur', refreshHeader);
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') cap.focus({ preventScroll: true });
    });
    pickEl.addEventListener('change', () => {
      manual = false;
      Store.setString(pickEl.value);
      cap.focus({ preventScroll: true });
    });
    $('#newString').addEventListener('click', () => {
      const cur = Store.string(sid());
      if (!Store.thoughtsOf(cur.id).length && !cap.value && !cur.title) {
        Mind.toast('This string is still empty. Write on it first.');
        cap.focus({ preventScroll: true });
        return;
      }
      manual = false;
      Store.newString('');
      cap.focus({ preventScroll: true });
    });

    new ResizeObserver(() => {
      if (Mind.current !== 'write') return;
      measureBox();
      follow();
    }).observe(loom);

    const redraw = Mind.once(render);
    Mind.on('store', (type) => {
      if (type === 'title') return;
      if (Mind.current === 'write') redraw();
    });
    Mind.on('select', (id) => {
      sel = id;
      document.querySelectorAll('#thoughtLayer .thoughtText.done').forEach((n) => n.classList.toggle('sel', n.getAttribute('data-id') === id));
    });
    Mind.on('settings', (k) => {
      if (!['font', 'size', 'wave', 'strand'].includes(k)) return;
      if (k === 'wave') resetPath();
      if (Mind.current === 'write') {
        render();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
      }
    });
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', () => {
        if (Mind.current === 'write') render();
      });
    }
  }

  function show() {
    resetPath();
    render();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => Mind.current === 'write' && render());
    cap.focus({ preventScroll: true });
  }

  Mind.views.write = { init, show, reveal };
})();
