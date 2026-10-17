/* mind. web: every thought as a dot, every link as a line, explorable in three layouts */
(function () {
  const { $, esc, snip } = Mind;
  const Store = Mind.store;

  let canvas, ctx, tip, empty, legendEl;
  let W = 0, H = 0, dpr = 1;
  let nodes = [], byId = new Map(), links = [], threads = [], catMap = new Map();
  let view = { x: 0, y: 0, k: 1 };
  let mode = 'drift', showThreads = true, allBooks = false, fcat = null, query = '';
  let alpha = 1, raf = 0, hover = null, sel = null, drag = null, panning = null;
  let active = false, needFit = true;

  /* ---------- building the graph ---------- */
  function build() {
    const st = Store.state;
    const th = allBooks ? st.thoughts : Store.thoughtsInBook();
    const old = byId;
    byId = new Map();
    catMap = new Map();
    st.books.forEach((b) => b.cats.forEach((c) => catMap.set(c.id, c)));

    nodes = th.map((t) => {
      let n = old.get(t.id);
      if (!n) {
        const a = Math.random() * 6.283;
        const r = 40 + Math.random() * 140;
        n = { id: t.id, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, tx: 0, ty: 0 };
      }
      n.t = t;
      n.r = 6.5 + Math.min(9, t.links.length * 1.6);
      byId.set(t.id, n);
      return n;
    });

    links = [];
    const seen = new Set();
    nodes.forEach((n) =>
      n.t.links.forEach((o) => {
        const m = byId.get(o);
        if (!m) return;
        const k = n.id < o ? n.id + o : o + n.id;
        if (seen.has(k)) return;
        seen.add(k);
        links.push([n, m]);
      })
    );
    threads = [];
    const by = new Map();
    th.forEach((t) => {
      if (!by.has(t.stringId)) by.set(t.stringId, []);
      by.get(t.stringId).push(t);
    });
    by.forEach((a) => {
      for (let i = 1; i < a.length; i++) threads.push([byId.get(a[i - 1].id), byId.get(a[i].id)]);
    });

    computeTargets();
    renderLegend();
    empty.hidden = nodes.length > 0;
    if (needFit && nodes.length) {
      // settle the layout a little before the first fit so the view lands well
      for (let i = 0; i < 120; i++) {
        alpha = Math.max(alpha, 0.5);
        stepDrift();
      }
      alpha = 0.5;
      fit();
      needFit = false;
    }
    wake(0.6);
  }

  function strCreated(id) {
    const s = Store.string(id);
    return s ? s.created : 0;
  }

  function computeTargets() {
    if (mode === 'strings') {
      const by = new Map();
      nodes.forEach((n) => {
        if (!by.has(n.t.stringId)) by.set(n.t.stringId, []);
        by.get(n.t.stringId).push(n);
      });
      const rows = Array.from(by.entries()).sort((a, b) => strCreated(a[0]) - strCreated(b[0]));
      rows.forEach(([, arr], ri) =>
        arr.forEach((n, j) => {
          n.tx = (j - (arr.length - 1) / 2) * 120;
          n.ty = (ri - (rows.length - 1) / 2) * 130 + Math.sin(j * 0.9) * 18;
        })
      );
    } else if (mode === 'clusters') {
      const groups = new Map();
      nodes.forEach((n) => {
        const k = n.t.cat || 'none';
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(n);
      });
      const keys = Array.from(groups.keys());
      const R = keys.length > 1 ? Math.max(170, Math.sqrt(nodes.length) * 36) : 0;
      keys.forEach((k, ci) => {
        const ang = (ci / keys.length) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(ang) * R;
        const cy = Math.sin(ang) * R;
        groups.get(k).forEach((n, m) => {
          const r = 24 * Math.sqrt(m + 0.6);
          const a = m * 2.399;
          n.tx = cx + Math.cos(a) * r;
          n.ty = cy + Math.sin(a) * r;
        });
      });
    }
  }

  /* ---------- physics ---------- */
  function spring(edges, len, k) {
    for (let i = 0; i < edges.length; i++) {
      const a = edges[i][0], b = edges[i][1];
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - len) * k * alpha;
      dx = (dx / d) * f;
      dy = (dy / d) * f;
      a.vx += dx; a.vy += dy; b.vx -= dx; b.vy -= dy;
    }
  }
  function stepDrift() {
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < N; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 > 160000) continue;
        if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
        const d = Math.sqrt(d2);
        const f = (2800 / d2) * alpha;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
    }
    spring(links, 110, 0.05);
    if (showThreads) spring(threads, 85, 0.02);
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      if (drag && drag.node === n && drag.moved) continue;
      n.vx -= n.x * 0.004 * alpha;
      n.vy -= n.y * 0.004 * alpha;
      n.vx *= 0.78;
      n.vy *= 0.78;
      n.x += n.vx;
      n.y += n.vy;
    }
    alpha *= 0.992;
  }
  function step() {
    if (mode === 'drift') {
      if (alpha < 0.012) return !!drag;
      stepDrift();
      return true;
    }
    let moving = false;
    nodes.forEach((n) => {
      if (drag && drag.node === n && drag.moved) return;
      const dx = n.tx - n.x, dy = n.ty - n.y;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        n.x += dx * 0.14;
        n.y += dy * 0.14;
        moving = true;
      }
    });
    return moving;
  }

  /* ---------- drawing ---------- */
  function matches(n) {
    if (fcat === 'none' && n.t.cat) return false;
    if (fcat && fcat !== 'none' && n.t.cat !== fcat) return false;
    if (query && !n.t.text.toLowerCase().includes(query)) return false;
    return true;
  }
  function colorOf(n) {
    const c = n.t.cat && catMap.get(n.t.cat);
    return c ? Mind.catColor(c.hue) : null;
  }
  function curve(a, b, sag) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(mx, my + sag, b.x, b.y);
  }

  function draw() {
    const v = Mind.theme.v;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 + view.x, H / 2 + view.y);
    ctx.scale(view.k, view.k);
    const lw = 1 / Math.sqrt(view.k);

    const focus = hover || (sel && byId.get(sel)) || null;
    const neigh = new Set();
    if (focus) focus.t.links.forEach((l) => neigh.add(l));

    if (showThreads) {
      ctx.lineWidth = 1.3 * lw;
      ctx.strokeStyle = v.ink2;
      ctx.setLineDash([2 * lw, 5 * lw]);
      ctx.lineCap = 'round';
      threads.forEach(([a, b]) => {
        ctx.globalAlpha = focus && focus !== a && focus !== b ? 0.12 : 0.4;
        ctx.beginPath();
        curve(a, b, Math.min(26, Math.hypot(a.x - b.x, a.y - b.y) * 0.16));
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = v.accentInk;
    ctx.lineWidth = 2 * lw;
    links.forEach(([a, b]) => {
      const lit = focus && (focus === a || focus === b);
      ctx.globalAlpha = lit ? 0.95 : focus ? 0.15 : 0.6;
      ctx.beginPath();
      curve(a, b, -Math.min(30, Math.hypot(a.x - b.x, a.y - b.y) * 0.1));
      ctx.stroke();
    });

    const fsz = 13 / Math.sqrt(view.k);
    ctx.font = '500 ' + fsz + 'px "Hanken Grotesk", system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    const labelAll = nodes.length <= 24 || view.k >= 1.2;

    nodes.forEach((n) => {
      const m = matches(n);
      const isNeigh = focus && (n === focus || neigh.has(n.id));
      let a = m ? 1 : 0.16;
      if (focus && !isNeigh) a = Math.min(a, 0.28);
      ctx.globalAlpha = a;
      const col = colorOf(n);
      if (sel === n.id) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, 6.283);
        ctx.strokeStyle = v.accentInk;
        ctx.lineWidth = 2 * lw;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, 6.283);
      if (col) {
        ctx.fillStyle = col;
        ctx.fill();
      } else {
        ctx.fillStyle = v.surface;
        ctx.fill();
        ctx.strokeStyle = v.ink2;
        ctx.lineWidth = 1.6 * lw;
        ctx.stroke();
      }
      ctx.strokeStyle = v.surface;
      ctx.lineWidth = 1.6 * lw;
      if (col) ctx.stroke();

      if (labelAll || isNeigh || (query && m)) {
        const label = snip(n.t.text, labelAll ? 26 : 34);
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4 * lw;
        ctx.strokeStyle = v.surface;
        ctx.strokeText(label, n.x + n.r + 7, n.y + 1);
        ctx.fillStyle = v.ink;
        ctx.fillText(label, n.x + n.r + 7, n.y + 1);
      }
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function frame() {
    raf = 0;
    const act = step();
    draw();
    if (act || drag || panning) raf = requestAnimationFrame(frame);
  }
  function wake(a) {
    if (a) alpha = Math.max(alpha, a);
    if (!raf && active) raf = requestAnimationFrame(frame);
  }

  /* ---------- view helpers ---------- */
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    wake();
  }
  function toWorld(x, y) {
    return { x: (x - W / 2 - view.x) / view.k, y: (y - H / 2 - view.y) / view.k };
  }
  function hit(x, y) {
    const w = toWorld(x, y);
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const r = n.r + 5 / view.k;
      const dx = n.x - w.x, dy = n.y - w.y;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }
  function fit() {
    if (!nodes.length || !W) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    nodes.forEach((n) => {
      const x = mode === 'drift' ? n.x : n.tx, y = mode === 'drift' ? n.y : n.ty;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    });
    const bw = x1 - x0 + 220, bh = y1 - y0 + 200;
    view.k = Math.max(0.25, Math.min(W / bw, H / bh, 1.5));
    view.x = -((x0 + x1) / 2) * view.k;
    view.y = -((y0 + y1) / 2) * view.k;
    wake();
  }
  function zoom(f) {
    view.k = Math.max(0.25, Math.min(3, view.k * f));
    wake();
  }

  function renderLegend() {
    const cats = allBooks ? Array.from(catMap.values()) : Store.cats();
    const seen = new Set();
    const uniq = cats.filter((c) => (seen.has(c.name + c.hue) ? false : seen.add(c.name + c.hue)));
    legendEl.innerHTML =
      uniq
        .map(
          (c) => `<button type="button" class="chip small" data-cat="${c.id}" aria-pressed="${fcat === c.id}"><i class="dot" style="background:${Mind.catColor(c.hue)}"></i>${esc(c.name)}</button>`
        )
        .join('') + `<button type="button" class="chip small" data-cat="none" aria-pressed="${fcat === 'none'}"><i class="dot none"></i>Uncategorised</button>`;
  }

  /* ---------- wiring ---------- */
  function init() {
    canvas = $('#webCanvas');
    ctx = canvas.getContext('2d');
    tip = $('#webTip');
    empty = $('#webEmpty');
    legendEl = $('#webLegend');

    new ResizeObserver(() => {
      if (active) resize();
    }).observe($('#webStage'));

    $('.seg').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      mode = b.dataset.mode;
      $('.seg')
        .querySelectorAll('button')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      nodes.forEach((n) => { n.vx = 0; n.vy = 0; });
      computeTargets();
      if (mode !== 'drift') fit();
      wake(mode === 'drift' ? 0.7 : 0);
    });
    $('#webThreads').addEventListener('change', (e) => {
      showThreads = e.target.checked;
      wake(0.4);
    });
    $('#webAll').addEventListener('change', (e) => {
      allBooks = e.target.checked;
      fcat = null;
      needFit = true;
      build();
    });
    $('#webFind').addEventListener('input', (e) => {
      query = e.target.value.trim().toLowerCase();
      wake();
    });
    legendEl.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      fcat = fcat === b.dataset.cat ? null : b.dataset.cat;
      renderLegend();
      wake();
    });
    $('#zoomIn').addEventListener('click', () => zoom(1.25));
    $('#zoomOut').addEventListener('click', () => zoom(0.8));
    $('#zoomFit').addEventListener('click', fit);

    canvas.addEventListener('pointerdown', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const n = hit(x, y);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
      if (n) drag = { node: n, sx: x, sy: y, moved: false };
      else panning = { sx: x, sy: y, vx: view.x, vy: view.y, moved: false };
      tip.hidden = true;
      wake();
    });
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (drag) {
        if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 4) drag.moved = true;
        if (drag.moved) {
          const w = toWorld(x, y);
          const n = drag.node;
          n.x = n.tx = w.x;
          n.y = n.ty = w.y;
          n.vx = n.vy = 0;
          if (mode === 'drift') alpha = Math.max(alpha, 0.35);
        }
        wake();
      } else if (panning) {
        panning.moved = true;
        view.x = panning.vx + (x - panning.sx);
        view.y = panning.vy + (y - panning.sy);
        wake();
      } else {
        const n = hit(x, y);
        if (n !== hover) {
          hover = n;
          canvas.style.cursor = n ? 'pointer' : 'grab';
          wake();
        }
        if (n) {
          tip.hidden = false;
          tip.textContent = snip(n.t.text, 140);
          tip.style.left = Math.min(W - 280, x + 16) + 'px';
          tip.style.top = Math.min(H - 70, y + 16) + 'px';
        } else tip.hidden = true;
      }
    });
    const up = () => {
      if (drag && !drag.moved) {
        sel = drag.node.id;
        Mind.openInspector(sel);
      } else if (panning && !panning.moved) {
        sel = null;
        Mind.closeInspector();
      }
      drag = null;
      panning = null;
      wake();
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', () => {
      drag = null;
      panning = null;
    });
    canvas.addEventListener('pointerleave', () => {
      if (hover) {
        hover = null;
        tip.hidden = true;
        wake();
      }
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const w = toWorld(x, y);
        const k = Math.min(3, Math.max(0.25, view.k * Math.exp(-e.deltaY * 0.0016)));
        view.k = k;
        view.x = x - W / 2 - w.x * k;
        view.y = y - H / 2 - w.y * k;
        wake();
      },
      { passive: false }
    );
    canvas.style.cursor = 'grab';

    const rebuild = Mind.once(() => {
      if (active) build();
    });
    Mind.on('store', (type) => {
      if (type === 'title') return;
      if (active) rebuild();
    });
    Mind.on('select', (id) => {
      sel = id;
      wake();
    });
    Mind.on('settings', () => {
      if (active) {
        Mind.readTheme();
        wake();
      }
    });
  }

  Mind.views.web = {
    init,
    show() {
      active = true;
      Mind.readTheme();
      resize();
      needFit = true;
      build();
    },
    hide() {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
})();
