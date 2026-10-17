/* mind. store: brain books, strings, thoughts, categories and links */
(function () {
  const KEY = 'mind.data.v1';
  const DEF_CATS = [['Wonder', 205], ['Plan', 150], ['Feeling', 345], ['Idea', 42], ['Memory', 275]];
  const COVERS = ['#7B3A34', '#2F5D50', '#2E4A78', '#6C4A86', '#B3811F', '#3B3B3F'];
  const HUES = [205, 150, 345, 42, 275, 0, 180, 95, 310, 25];
  const STOP = new Set(
    ('about above after again also because been before being between both could does doing done down during each even ' +
      'from have having here into just like made make many more most much only other over same should some such than that ' +
      'their them then there these they this those through under very want were what when where which while will with ' +
      'would your mine ours maybe never always still thing things really nicht eine einen aber auch oder wenn dass sind wird noch nach')
      .split(' ')
  );

  let S = null;
  let timer = 0;
  const Store = { COVERS, HUES };
  Mind.store = Store;

  function mkBook(name, cover) {
    return {
      id: Mind.uid(),
      name,
      cover: cover || COVERS[0],
      created: Date.now(),
      cats: DEF_CATS.map(([n, h]) => ({ id: Mind.uid(), name: n, hue: h })),
    };
  }
  function mkString(bookId, title) {
    return { id: Mind.uid(), bookId, title: title || '', created: Date.now() };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.books) && d.books.length) return norm(d);
      }
    } catch (e) {}
    return null;
  }
  function norm(d) {
    d.strings = d.strings || [];
    d.thoughts = d.thoughts || [];
    d.drafts = d.drafts || {};
    d.currentString = d.currentString || {};
    if (!d.books.find((b) => b.id === d.currentBook)) d.currentBook = d.books[0].id;
    d.thoughts.forEach((t) => {
      t.links = t.links || [];
      if (t.cat === undefined) t.cat = null;
    });
    return d;
  }
  function flush() {
    clearTimeout(timer);
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      if (!flush.warned) {
        flush.warned = true;
        Mind.toast('This browser has no room left to save. Export your data from Settings.');
      }
    }
  }

  Store.init = function () {
    S = load();
    if (!S) {
      const b = mkBook('First brain book', COVERS[1]);
      S = { books: [b], strings: [], thoughts: [], currentBook: b.id, currentString: {}, drafts: {} };
      Store.seed(b.id);
      flush();
    }
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
  };
  Object.defineProperty(Store, 'state', { get: () => S });

  Store.save = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 250);
  };
  Store.change = (type) => {
    Store.save();
    Mind.emit('store', type);
  };

  /* ---- reading ---- */
  Store.book = (id) => S.books.find((b) => b.id === (id || S.currentBook));
  Store.string = (id) => S.strings.find((s) => s.id === id);
  Store.thought = (id) => S.thoughts.find((t) => t.id === id);
  Store.cats = (bookId) => (Store.book(bookId) || { cats: [] }).cats;
  Store.cat = (id, bookId) => {
    for (const b of S.books) {
      if (bookId && b.id !== bookId) continue;
      const c = b.cats.find((x) => x.id === id);
      if (c) return c;
    }
    return null;
  };
  Store.stringsOf = (bookId) => S.strings.filter((s) => s.bookId === (bookId || S.currentBook));
  Store.thoughtsOf = (stringId) => S.thoughts.filter((t) => t.stringId === stringId);
  Store.thoughtsInBook = (bookId) => S.thoughts.filter((t) => t.bookId === (bookId || S.currentBook));
  Store.stats = (bookId) => {
    const th = Store.thoughtsInBook(bookId);
    return {
      thoughts: th.length,
      strings: Store.stringsOf(bookId).length,
      links: Math.round(th.reduce((a, t) => a + t.links.length, 0) / 2),
      cats: Store.cats(bookId).length,
    };
  };

  /* the string being written in a book; makes one if the book has none */
  Store.ensureString = (bookId) => {
    bookId = bookId || S.currentBook;
    const cur = S.currentString[bookId];
    if (cur && Store.string(cur)) return cur;
    const all = Store.stringsOf(bookId);
    if (all.length) {
      S.currentString[bookId] = all[all.length - 1].id;
    } else {
      const s = mkString(bookId, '');
      S.strings.push(s);
      S.currentString[bookId] = s.id;
    }
    return S.currentString[bookId];
  };

  /* ---- writing ---- */
  Store.addThought = (stringId, text) => {
    const s = Store.string(stringId);
    const t = { id: Mind.uid(), bookId: s.bookId, stringId, text, created: Date.now(), cat: null, links: [] };
    S.thoughts.push(t);
    Store.change('thoughts');
    return t;
  };
  Store.updateThought = (id, patch, type) => {
    const t = Store.thought(id);
    if (!t) return;
    Object.assign(t, patch);
    Store.change(type || 'thoughts');
  };
  Store.removeThought = (id) => {
    S.thoughts = S.thoughts.filter((t) => t.id !== id);
    S.thoughts.forEach((t) => {
      t.links = t.links.filter((l) => l !== id);
    });
    Store.change('thoughts');
  };
  Store.link = (a, b, silent) => {
    const x = Store.thought(a);
    const y = Store.thought(b);
    if (!x || !y || a === b) return;
    if (!x.links.includes(b)) x.links.push(b);
    if (!y.links.includes(a)) y.links.push(a);
    if (!silent) Store.change('links');
  };
  Store.unlink = (a, b) => {
    const x = Store.thought(a);
    const y = Store.thought(b);
    if (x) x.links = x.links.filter((l) => l !== b);
    if (y) y.links = y.links.filter((l) => l !== a);
    Store.change('links');
  };
  Store.setDraft = (stringId, text) => {
    if (text) S.drafts[stringId] = text;
    else delete S.drafts[stringId];
    Store.save();
  };

  /* ---- strings ---- */
  Store.newString = (title) => {
    const s = mkString(S.currentBook, title);
    S.strings.push(s);
    S.currentString[S.currentBook] = s.id;
    Store.change('current');
    return s;
  };
  Store.setString = (id) => {
    const s = Store.string(id);
    if (!s) return;
    S.currentBook = s.bookId;
    S.currentString[s.bookId] = id;
    Store.change('current');
  };
  Store.renameString = (id, title) => {
    const s = Store.string(id);
    if (!s) return;
    s.title = title;
    Store.change('title');
  };

  /* ---- books ---- */
  Store.setBook = (id) => {
    if (!Store.book(id)) return;
    S.currentBook = id;
    Store.ensureString(id);
    Store.change('current');
  };
  Store.newBook = (name, cover) => {
    const b = mkBook(name, cover);
    S.books.push(b);
    S.currentBook = b.id;
    Store.ensureString(b.id);
    Store.change('books');
    return b;
  };
  Store.renameBook = (id, name) => {
    const b = Store.book(id);
    if (b) {
      b.name = name;
      Store.change('books');
    }
  };
  Store.deleteBook = (id) => {
    if (S.books.length < 2) return false;
    S.books = S.books.filter((b) => b.id !== id);
    const gone = new Set(S.strings.filter((s) => s.bookId === id).map((s) => s.id));
    S.strings = S.strings.filter((s) => s.bookId !== id);
    S.thoughts = S.thoughts.filter((t) => t.bookId !== id);
    gone.forEach((g) => delete S.drafts[g]);
    delete S.currentString[id];
    if (S.currentBook === id) S.currentBook = S.books[0].id;
    Store.ensureString(S.currentBook);
    Store.change('books');
    return true;
  };

  /* ---- categories ---- */
  Store.addCat = (name, bookId) => {
    const b = Store.book(bookId);
    const used = new Set(b.cats.map((c) => c.hue));
    const hue = HUES.find((h) => !used.has(h)) ?? Math.floor(Math.random() * 360);
    const c = { id: Mind.uid(), name, hue };
    b.cats.push(c);
    Store.change('cats');
    return c;
  };
  Store.updateCat = (id, patch) => {
    const c = Store.cat(id);
    if (c) {
      Object.assign(c, patch);
      Store.change('cats');
    }
  };
  Store.removeCat = (id) => {
    S.books.forEach((b) => {
      b.cats = b.cats.filter((c) => c.id !== id);
    });
    S.thoughts.forEach((t) => {
      if (t.cat === id) t.cat = null;
    });
    Store.change('cats');
  };

  /* ---- echoes: earlier thoughts that share words ---- */
  function toks(text) {
    const words = (text.toLowerCase().match(/\p{L}{4,}/gu) || [])
      .map((w) => (w.length > 4 ? w.replace(/s$/, '') : w))
      .filter((w) => !STOP.has(w));
    return new Set(words);
  }
  Store.echoes = (t, n = 3, strict = false) => {
    const a = toks(t.text);
    if (!a.size) return [];
    const out = [];
    for (const o of S.thoughts) {
      if (o.id === t.id || o.bookId !== t.bookId || t.links.includes(o.id)) continue;
      const b = toks(o.text);
      const shared = [];
      a.forEach((w) => {
        if (b.has(w)) shared.push(w);
      });
      if (!shared.length) continue;
      if (strict && !(shared.length >= 2 || shared.some((w) => w.length >= 7))) continue;
      const score = shared.length + shared.reduce((m, w) => Math.max(m, w.length), 0) / 20;
      out.push({ t: o, score, words: shared });
    }
    out.sort((x, y) => y.score - x.score);
    return out.slice(0, n);
  };

  /* ---- sample string ---- */
  Store.seed = (bookId) => {
    const b = Store.book(bookId);
    const cat = (n) => (b.cats.find((c) => c.name === n) || {}).id || null;
    const s = mkString(bookId, 'A first string, for the table');
    s.created = Date.now() - 55 * 60000;
    S.strings.push(s);
    const base = Date.now() - 50 * 60000;
    const items = [
      ['The waiter never hurries me here, and I think better because of it.', 'Wonder'],
      ['Ask Lena about the Naschmarkt on Saturday.', 'Plan'],
      ['Rain on the window makes the room feel smaller, in a good way.', 'Feeling'],
      ['What if every thought were a knot I could walk back along and untie?', 'Idea'],
      ['My grandmother stirred her coffee exactly three times. Never two, never four.', 'Memory'],
      ['Slow rooms make slow thoughts, and slow thoughts are the ones worth keeping.', 'Wonder'],
      ['Bring the notebook to the coffeehouse on Saturday, not the laptop.', 'Plan'],
    ];
    const made = items.map(([text, c], i) => {
      const t = { id: Mind.uid(), bookId, stringId: s.id, text, created: base + i * 7 * 60000, cat: cat(c), links: [] };
      S.thoughts.push(t);
      return t;
    });
    [[0, 5], [1, 6], [3, 0], [4, 2]].forEach(([x, y]) => Store.link(made[x].id, made[y].id, true));
    S.currentString[bookId] = s.id;
    return s;
  };
  Store.addSample = () => {
    Store.seed(S.currentBook);
    Store.change('current');
  };

  /* ---- export / import / reset ---- */
  Store.export = () => JSON.stringify({ app: 'mind', version: 1, exported: Date.now(), data: S }, null, 2);
  Store.import = (text) => {
    const j = JSON.parse(text);
    const d = j && j.app === 'mind' ? j.data : j;
    if (!d || !Array.isArray(d.books) || !d.books.length || !Array.isArray(d.thoughts)) throw new Error('That file is not a mind. export.');
    S = norm(d);
    Store.ensureString(S.currentBook);
    Store.change('all');
  };
  Store.reset = () => {
    const b = mkBook('First brain book', COVERS[1]);
    S = { books: [b], strings: [], thoughts: [], currentBook: b.id, currentString: {}, drafts: {} };
    Store.ensureString(b.id);
    Store.change('all');
  };
})();
