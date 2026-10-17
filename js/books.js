/* mind. books: the shelf of brain books */
(function () {
  const { $, esc } = Mind;
  const Store = Mind.store;
  let sel = null;
  let shelf, detail, dlg, cover;

  const hash = (s) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  function render(shelfOnly) {
    const st = Store.state;
    if (!sel || !Store.book(sel)) sel = st.currentBook;
    shelf.innerHTML =
      st.books
        .map((b) => {
          const n = Store.thoughtsInBook(b.id).length;
          const h = 250 + (hash(b.id) % 80);
          const w = 60 + Math.min(34, n * 2);
          const cls = 'spine' + (b.id === st.currentBook ? ' current' : '') + (b.id === sel ? ' viewing' : '');
          return `<button type="button" class="${cls}" data-id="${b.id}" style="--h:${h}px;--w:${w}px;--c:${b.cover}" aria-label="${esc(b.name)}, ${n} ${n === 1 ? 'thought' : 'thoughts'}" aria-pressed="${b.id === sel}">
          <span class="t">${esc(b.name)}</span><span class="n">${n}</span></button>`;
        })
        .join('') +
      `<button type="button" class="spine add" id="spineAdd" aria-label="New brain book"><span>+</span></button>`;
    if (shelfOnly === true) return;

    const b = Store.book(sel);
    const s = Store.stats(sel);
    const isCur = sel === st.currentBook;
    detail.innerHTML = `<div class="bd">
      <label class="sr" for="bookName">Book name</label>
      <input id="bookName" class="bookName" value="${esc(b.name)}" maxlength="40" autocomplete="off">
      <p class="stats">${s.thoughts} ${s.thoughts === 1 ? 'thought' : 'thoughts'} on ${s.strings} ${s.strings === 1 ? 'string' : 'strings'}, with ${s.links} ${s.links === 1 ? 'link' : 'links'} across ${s.cats} categories.</p>
      <ul class="catPeek">${b.cats.map((c) => `<li><i class="dot" style="background:${Mind.catColor(c.hue)}"></i>${esc(c.name)}</li>`).join('')}</ul>
      <div class="bdActions">
        <button type="button" class="btn primary" data-act="open">${isCur ? 'Continue writing' : 'Open this book'}</button>
        <button type="button" class="btn" data-act="web">See its web</button>
        <button type="button" class="btn danger" data-act="del"${st.books.length < 2 ? ' disabled title="Keep at least one brain book"' : ''}>Delete book</button>
      </div></div>`;
  }

  function init() {
    shelf = $('#shelf');
    detail = $('#bookDetail');
    dlg = $('#bookDialog');
    cover = $('#coverPick');

    cover.innerHTML = Store.COVERS.map(
      (c, i) => `<label class="cv" style="--c:${c}"><input type="radio" name="cover" value="${c}"${i === 0 ? ' checked' : ''}><i></i><span class="sr">Cover ${i + 1}</span></label>`
    ).join('');

    shelf.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'spineAdd') openDialog();
      else {
        sel = b.dataset.id;
        render();
      }
    });
    $('#newBook').addEventListener('click', openDialog);

    let armed = 0;
    detail.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'open') {
        Store.setBook(sel);
        Mind.go('write');
      } else if (b.dataset.act === 'web') {
        Store.setBook(sel);
        Mind.go('web');
      } else if (b.dataset.act === 'del') {
        if (!armed) {
          b.textContent = 'Click again to delete it and its thoughts';
          armed = setTimeout(() => {
            armed = 0;
            if (b.isConnected) b.textContent = 'Delete book';
          }, 4000);
          return;
        }
        clearTimeout(armed);
        armed = 0;
        const name = Store.book(sel).name;
        Store.deleteBook(sel);
        sel = Store.state.currentBook;
        Mind.toast('Deleted “' + name + '”.');
      }
    });
    detail.addEventListener('input', (e) => {
      if (e.target.id === 'bookName' && e.target.value.trim()) Store.renameBook(sel, e.target.value.trim());
    });

    dlg.addEventListener('close', () => {
      if (dlg.returnValue !== 'create') return;
      const name = $('#newBookName').value.trim();
      if (!name) return;
      const c = (dlg.querySelector('input[name="cover"]:checked') || {}).value;
      const b = Store.newBook(name, c);
      sel = b.id;
      Mind.toast('Opened “' + b.name + '”. Tie the first knot.');
      Mind.go('write');
    });

    // keep the name field alive while someone is typing in it
    const redraw = Mind.once(() => render(document.activeElement && document.activeElement.id === 'bookName'));
    Mind.on('store', (type) => {
      if (type === 'text' || type === 'title') return;
      if (Mind.current === 'books') redraw();
    });
  }

  function openDialog() {
    $('#newBookName').value = '';
    dlg.returnValue = '';
    dlg.showModal();
    $('#newBookName').focus();
  }

  Mind.views.books = {
    init,
    show() {
      sel = Store.state.currentBook;
      render();
    },
  };
})();
