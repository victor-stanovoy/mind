/* mind. inspector: open any thought to edit it, sort it and link it to others */
(function () {
  const { $, esc, snip } = Mind;
  const Store = Mind.store;
  let id = null;
  let body, panel;

  const open = () => panel.classList.contains('on');

  Mind.openInspector = (tid) => {
    id = tid;
    render();
    Mind.panel('inspector', true);
    Mind.emit('select', tid);
  };
  Mind.closeInspector = () => {
    if (open()) Mind.panel('inspector', false);
  };

  function dot(hue) {
    return hue === null || hue === undefined ? '<i class="dot none"></i>' : `<i class="dot" style="background:${Mind.catColor(hue)}"></i>`;
  }
  function hueOf(t) {
    const c = t.cat && Store.cat(t.cat, t.bookId);
    return c ? c.hue : null;
  }

  function resultsHtml(t, q) {
    q = (q || '').trim().toLowerCase();
    let pool = Store.thoughtsInBook(t.bookId).filter((o) => o.id !== t.id && !t.links.includes(o.id));
    if (q) pool = pool.filter((o) => o.text.toLowerCase().includes(q));
    pool.sort((a, b) => {
      const ae = a.created <= t.created ? 0 : 1;
      const be = b.created <= t.created ? 0 : 1;
      return ae - be || b.created - a.created;
    });
    pool = pool.slice(0, 6);
    if (!pool.length) return `<li class="muted">${q ? 'No thoughts match that search.' : 'There is nothing else to link yet.'}</li>`;
    return pool
      .map(
        (o) => `<li>${dot(hueOf(o))}<span class="liText">${esc(snip(o.text, 70))}<small>${Mind.fmtDay(o.created)}</small></span>
        <button type="button" class="btn small" data-link="${o.id}">Link</button></li>`
      )
      .join('');
  }

  function render() {
    const t = Store.thought(id);
    if (!t) {
      Mind.closeInspector();
      return;
    }
    const str = Store.string(t.stringId);
    const cats = Store.cats(t.bookId);
    const linked = t.links.map((l) => Store.thought(l)).filter(Boolean);
    const echoes = Store.echoes(t, 3);
    body.innerHTML = `
      <label class="sr" for="insText">Thought</label>
      <textarea id="insText" class="insText" rows="4">${esc(t.text)}</textarea>
      <p class="insMeta">Tied ${Mind.fmt(t.created)} on <button type="button" class="linkBtn" data-act="show">${esc((str && str.title) || 'an untitled string')}</button></p>

      <h3>Category</h3>
      <div class="chips" role="group" aria-label="Category">
        ${cats
          .map((c) => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${t.cat === c.id}">${dot(c.hue)}${esc(c.name)}</button>`)
          .join('')}
        <button type="button" class="chip" data-cat="" aria-pressed="${!t.cat}">None</button>
      </div>

      <h3>Linked thoughts <span class="count">${linked.length}</span></h3>
      <ul class="linkList" id="insLinked">
        ${
          linked.length
            ? linked
                .map(
                  (o) => `<li>${dot(hueOf(o))}<button type="button" class="liText linkOpen" data-open="${o.id}">${esc(snip(o.text, 70))}<small>${Mind.fmtDay(o.created)}</small></button>
                  <button type="button" class="x" data-unlink="${o.id}" aria-label="Unlink this thought">&times;</button></li>`
                )
                .join('')
            : '<li class="muted">Nothing linked yet. Link a thought this one grew out of, or one it led to.</li>'
        }
      </ul>

      <h3>Link another thought</h3>
      <label class="sr" for="insFind">Search your thoughts</label>
      <input type="search" id="insFind" class="field" placeholder="Search your thoughts" autocomplete="off">
      <ul class="linkList" id="insResults">${resultsHtml(t, '')}</ul>

      ${
        echoes.length
          ? `<h3>Echoes</h3><p class="muted">Other thoughts that use the same words.</p>
        <ul class="linkList">${echoes
          .map(
            (e) => `<li>${dot(hueOf(e.t))}<span class="liText">${esc(snip(e.t.text, 70))}<small>shares “${esc(e.words[0])}”</small></span>
          <button type="button" class="btn small" data-link="${e.t.id}">Link</button></li>`
          )
          .join('')}</ul>`
          : ''
      }

      <div class="insFoot"><button type="button" class="btn danger small" data-act="del">Delete thought</button></div>`;
  }

  function init() {
    panel = $('#inspector');
    body = $('#inspectorBody');

    body.addEventListener('input', (e) => {
      const t = Store.thought(id);
      if (!t) return;
      if (e.target.id === 'insText') {
        Store.updateThought(id, { text: e.target.value }, 'text');
      } else if (e.target.id === 'insFind') {
        $('#insResults').innerHTML = resultsHtml(t, e.target.value);
      }
    });

    let armed = 0;
    body.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const t = Store.thought(id);
      if (!t) return;
      if (b.dataset.cat !== undefined) Store.updateThought(id, { cat: b.dataset.cat || null }, 'cat');
      else if (b.dataset.link) Store.link(id, b.dataset.link);
      else if (b.dataset.unlink) Store.unlink(id, b.dataset.unlink);
      else if (b.dataset.open) {
        id = b.dataset.open;
        render();
        Mind.emit('select', id);
      } else if (b.dataset.act === 'show') {
        if (t.bookId !== Store.state.currentBook) Store.setBook(t.bookId);
        Store.setString(t.stringId);
        Mind.closeInspector();
        Mind.go('write');
        Mind.views.write.reveal(t.id);
      } else if (b.dataset.act === 'del') {
        if (!armed) {
          b.textContent = 'Click again to delete';
          armed = setTimeout(() => {
            armed = 0;
            if (b.isConnected) b.textContent = 'Delete thought';
          }, 3500);
          return;
        }
        clearTimeout(armed);
        armed = 0;
        Store.removeThought(id);
        Mind.closeInspector();
        Mind.toast('Thought deleted.');
      }
    });

    Mind.on('store', (type) => {
      if (!id || !open() || type === 'text' || type === 'title') return;
      render();
    });
    Mind.on('panel', ({ name, open: o }) => {
      if (name === 'inspector' && !o) {
        id = null;
        Mind.emit('select', null);
      }
    });
  }

  Mind.views.inspector = { init };
})();
