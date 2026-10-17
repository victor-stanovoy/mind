/* mind. core: tiny helpers and a shared namespace */
(function () {
  const Mind = (window.Mind = { views: {}, _h: {}, current: null });

  Mind.$ = (s, r = document) => r.querySelector(s);
  Mind.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  Mind.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  Mind.uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  Mind.snip = (t, n = 48) => {
    t = String(t).replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
  };

  Mind.fmt = (ts) =>
    new Date(ts).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  Mind.fmtDay = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  Mind.on = (ev, fn) => {
    (Mind._h[ev] || (Mind._h[ev] = [])).push(fn);
  };
  Mind.emit = (ev, d) => (Mind._h[ev] || []).forEach((f) => f(d));

  /* run fn at most once per animation frame */
  Mind.once = (fn) => {
    let q = 0;
    return (...a) => {
      if (q) return;
      q = requestAnimationFrame(() => {
        q = 0;
        fn(...a);
      });
    };
  };

  /* theme colours, read from CSS variables whenever the theme changes */
  Mind.theme = { s: '50%', l: '45%', v: {} };
  Mind.readTheme = () => {
    const cs = getComputedStyle(document.documentElement);
    const g = (k) => cs.getPropertyValue(k).trim();
    Mind.theme.s = g('--cat-s') || '50%';
    Mind.theme.l = g('--cat-l') || '45%';
    Mind.theme.v = {
      bg: g('--bg'),
      surface: g('--surface'),
      ink: g('--ink'),
      ink2: g('--ink2'),
      accent: g('--accent'),
      accentInk: g('--accent-ink'),
      line: g('--line'),
      string: g('--string'),
    };
  };
  Mind.catColor = (hue) => `hsl(${hue} ${Mind.theme.s} ${Mind.theme.l})`;

  /* toast with an optional action button */
  let toastTimer = 0;
  Mind.toast = (msg, opt = {}) => {
    const el = document.getElementById('toast');
    el.textContent = '';
    const p = document.createElement('span');
    p.textContent = msg;
    el.appendChild(p);
    if (opt.action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.action;
      b.addEventListener('click', () => {
        el.classList.remove('on');
        opt.fn && opt.fn();
      });
      el.appendChild(b);
    }
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), opt.ms || (opt.action ? 7000 : 3600));
  };
})();
