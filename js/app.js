/* mind. app: routing, panels, clock and start-up */
(function () {
  const { $, $$ } = Mind;
  const Store = Mind.store;
  const VIEWS = ['write', 'notes', 'web', 'books'];
  const TITLES = { write: 'mind.', notes: 'Notes | mind.', web: 'Web | mind.', books: 'Books | mind.' };

  /* ---------- routing ---------- */
  const hashView = () => {
    const h = location.hash.replace('#', '');
    return VIEWS.includes(h) ? h : 'write';
  };
  function show(v) {
    if (Mind.current === v) return;
    const prev = Mind.current;
    if (prev && Mind.views[prev] && Mind.views[prev].hide) Mind.views[prev].hide();
    Mind.current = v;
    $$('.view').forEach((s) => s.classList.toggle('on', s.id === 'view-' + v));
    $$('#nav button').forEach((b) => {
      if (b.dataset.view === v) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    Mind.panel('inspector', false);
    Mind.panel('settings', false);
    document.title = TITLES[v];
    if (Mind.views[v] && Mind.views[v].show) Mind.views[v].show();
  }
  Mind.go = (v) => {
    if (!VIEWS.includes(v)) v = 'write';
    show(v);
    if (location.hash !== '#' + v) history.pushState(null, '', '#' + v);
  };
  window.addEventListener('hashchange', () => show(hashView()));

  /* ---------- side panels ---------- */
  const scrim = () => $('#scrim');
  Mind.panel = (name, open) => {
    const el = document.getElementById(name);
    if (!el) return;
    const was = el.classList.contains('on');
    if (open) {
      ['inspector', 'settings'].forEach((n) => n !== name && Mind.panel(n, false));
    }
    el.classList.toggle('on', open);
    el.inert = !open;
    el.setAttribute('aria-hidden', String(!open));
    scrim().classList.toggle('on', !!document.querySelector('.panel.on'));
    if (open && !was) {
      const c = el.querySelector('[data-close]');
      if (c) c.focus({ preventScroll: true });
    }
    if (was !== open) Mind.emit('panel', { name, open });
  };
  function closePanels() {
    ['inspector', 'settings'].forEach((n) => Mind.panel(n, false));
    if (Mind.current === 'write') {
      const cap = $('#capture');
      if (cap) cap.focus({ preventScroll: true });
    }
  }

  /* ---------- the book pill and the clock ---------- */
  function updatePill() {
    const b = Store.book();
    $('#bookPillName').textContent = b.name;
    $('#bookDot').style.background = b.cover;
  }
  function tick() {
    try {
      const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' }).format(new Date());
      $('#clock').textContent = 'Wien ' + t;
    } catch (e) {
      $('#clock').hidden = true;
    }
  }

  /* ---------- start ---------- */
  Store.init();
  Mind.readTheme();
  Object.keys(Mind.views).forEach((k) => Mind.views[k].init && Mind.views[k].init());

  $('#nav').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) Mind.go(b.dataset.view);
  });
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) Mind.go(g.dataset.go);
    if (e.target.closest('[data-close]')) closePanels();
  });
  $('#bookPill').addEventListener('click', () => Mind.go('books'));
  $('#openSettings').addEventListener('click', () => Mind.panel('settings', !$('#settings').classList.contains('on')));
  scrim().addEventListener('click', closePanels);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.panel.on')) closePanels();
  });

  Mind.on('store', updatePill);
  updatePill();
  tick();
  setInterval(tick, 20000);

  show(hashView());
})();
