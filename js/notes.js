/* mind. notes: every thought in a book, sorted into categories and linked together */
(function () {
  const { $, esc } = Mind;
  const Store = Mind.store;
  let f = { q: '', cat: 'all', sort: 'new' };
  let manage = false;
  let sel = null;
  let rail, list;

  function dot(hue) {
    return hue === null || hue === undefined ? '<i class="dot none"></i>' : `<i class="dot" style="background:${Mind.catColor(hue)}"></i>`;
  }

  function renderRail() {
    const th = Store.thoughtsInBook();
    const cats = Store.cats();
    const n = { all: th.length, none: th.filter((t) => !t.cat).length };
    cats.forEach((c) => (n[c.id] = th.filter((t) => t.cat === c.id).length));
    const row = (key, label, hue, count) =>
      `<button type="button" class="catRow" data-cat="${key}" aria-pressed="${f.cat === key}">${key === 'all' ? '' : dot(hue)}<span>${esc(label)}</span><em>${count}</em></button>`;

    let html = '<h2 class="railTitle">Categories</h2><ul class="catList">';
    html += `<li>${row('all', 'All thoughts', null, n.all)}</li>`;
    cats.forEach((c) => {
      if (manage) {
        html += `<li class="catEdit"><button type="button" class="hueBtn" data-hue="${c.id}" aria-label="Change the colour of ${esc(c.name)}">${dot(c.hue)}</button>
          <input class="field small" value="${esc(c.name)}" data-rename="${c.id}" aria-label="Rename ${esc(c.name)}" maxlength="24">
          <button type="button" class="x" data-delcat="${c.id}" aria-label="Delete ${esc(c.name)}">&times;</button></li>`;
      } else html += `<li>${row(c.id, c.name, c.hue, n[c.id])}</li>`;
    });
    if (!manage) html += `<li>${row('none', 'Uncategorised', null, n.none)}</li>`;
    html += '</ul>';
    if (manage) {
      html += `<form class="newCat" id="newCat"><input class="field small" name="n" placeholder="New category" maxlength="24" aria-label="New category name" autocomplete="off"><button class="btn small" type="submit">Add</button></form>`;
    }
    html += `<button type="button" class="btn quiet small" id="catManage">${manage ? 'Done' : 'Edit categories'}</button>`;
    rail.innerHTML = html;
  }

  function filtered() {
    let th = Store.thoughtsInBook();
    if (f.cat === 'none') th = th.filter((t) => !t.cat);
    else if (f.cat !== 'all') th = th.filter((t) => t.cat === f.cat);
    const q = f.q.trim().toLowerCase();
    if (q) th = th.filter((t) => t.text.toLowerCase().includes(q));
    return th;
  }

  function noteHtml(t) {
    const c = t.cat && Store.cat(t.cat, t.bookId);
    const n = t.links.length;
    const opts =
      `<option value="">No category</option>` +
      Store.cats(t.bookId)
        .map((x) => `<option value="${x.id}"${x.id === t.cat ? ' selected' : ''}>${esc(x.name)}</option>`)
        .join('');
    return `<article class="note${sel === t.id ? ' sel' : ''}" data-id="${t.id}">
      ${dot(c ? c.hue : null)}
      <button type="button" class="noteText" data-open>${esc(t.text)}</button>
      <div class="noteSide">
        <select class="miniSel" data-catsel aria-label="Category for this thought">${opts}</select>
        <button type="button" class="linkBadge${n ? ' has' : ''}" data-open title="Open this thought to manage its links">${n ? n + (n === 1 ? ' link' : ' links') : 'No links'}</button>
      </div></article>`;
  }

  function renderList() {
    const th = filtered();
    const total = Store.thoughtsInBook().length;
    if (!total) {
      list.innerHTML = `<div class="empty"><p>Nothing written in this book yet.</p><button class="btn primary" type="button" data-go="write">Tie your first knot</button></div>`;
      return;
    }
    if (!th.length) {
      list.innerHTML = `<div class="empty"><p>No thoughts match. Clear the search or pick another category.</p></div>`;
      return;
    }
    if (f.sort === 'links') {
      const s = th.slice().sort((a, b) => b.links.length - a.links.length || b.created - a.created);
      list.innerHTML = `<div class="group">${s.map(noteHtml).join('')}</div>`;
      return;
    }
    const strings = Store.stringsOf().slice().sort((a, b) => (f.sort === 'new' ? b.created - a.created : a.created - b.created));
    let html = '';
    strings.forEach((s) => {
      let items = th.filter((t) => t.stringId === s.id);
      if (!items.length) return;
      if (f.sort === 'new') items = items.slice().reverse();
      html += `<section class="group"><h3>${esc(s.title || 'Untitled string')}</h3><time>${Mind.fmt(s.created)}</time>${items.map(noteHtml).join('')}</section>`;
    });
    list.innerHTML = html;
  }

  function render() {
    if (f.cat !== 'all' && f.cat !== 'none' && !Store.cat(f.cat, Store.state.currentBook)) f.cat = 'all';
    renderRail();
    renderList();
  }

  function init() {
    rail = $('#notesRail');
    list = $('#notesList');

    $('#notesSearch').addEventListener('input', (e) => {
      f.q = e.target.value;
      renderList();
    });
    $('#notesSort').addEventListener('change', (e) => {
      f.sort = e.target.value;
      renderList();
    });

    rail.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'catManage') {
        manage = !manage;
        renderRail();
      } else if (b.dataset.cat) {
        f.cat = b.dataset.cat;
        renderRail();
        renderList();
      } else if (b.dataset.hue) {
        const c = Store.cat(b.dataset.hue);
        const i = Store.HUES.indexOf(c.hue);
        Store.updateCat(c.id, { hue: Store.HUES[(i + 1) % Store.HUES.length] });
      } else if (b.dataset.delcat) {
        const c = Store.cat(b.dataset.delcat);
        const n = Store.thoughtsInBook().filter((t) => t.cat === c.id).length;
        if (!n || confirm('Delete “' + c.name + '”? Its ' + n + ' thoughts stay, without a category.')) Store.removeCat(c.id);
      }
    });
    rail.addEventListener('change', (e) => {
      if (e.target.dataset.rename) {
        const v = e.target.value.trim();
        if (v) Store.updateCat(e.target.dataset.rename, { name: v });
        else renderRail();
      }
    });
    rail.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = new FormData(e.target).get('n').trim();
      if (v) Store.addCat(v, Store.state.currentBook);
    });

    list.addEventListener('click', (e) => {
      const note = e.target.closest('.note');
      if (!note) return;
      if (e.target.closest('[data-catsel]')) return;
      if (e.target.closest('[data-open]')) {
        sel = note.dataset.id;
        Mind.openInspector(note.dataset.id);
      }
    });
    list.addEventListener('change', (e) => {
      const s = e.target.closest('[data-catsel]');
      if (!s) return;
      Store.updateThought(e.target.closest('.note').dataset.id, { cat: s.value || null }, 'cat');
    });

    const redraw = Mind.once(render);
    Mind.on('store', () => {
      if (Mind.current === 'notes') redraw();
    });
    Mind.on('select', (id) => {
      sel = id;
      list.querySelectorAll('.note').forEach((n) => n.classList.toggle('sel', n.dataset.id === id));
    });
  }

  Mind.views.notes = { init, show: render };
})();
