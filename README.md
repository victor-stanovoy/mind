# mind.

A quiet place to write down strings of thoughts, sort them into brain books and watch them connect. Built to feel like a jazzy afternoon in a Vienna coffeehouse.

No build step and no dependencies. Open `index.html`, or serve the folder (for example `python3 -m http.server`). To publish it, turn on GitHub Pages for the `main` branch.

## What is in it

- **Write.** Thoughts are written along a literal string. Type to feed the string, press Enter to tie a knot, and the string carries on to the next thought. Backspace on an empty line unties the last knot. Drag or scroll to travel along the string. Linked thoughts hang under it as loops.
- **Notes.** Every thought in a brain book, grouped by string. Sort thoughts into your own categories (rename, recolour, add, delete) and search or sort the list.
- **Linking.** Open any thought to link it to earlier ones. mind. also suggests echoes: other thoughts that share words with the one you just tied.
- **Web.** All thoughts as an explorable web. Three layouts: Drift (free floating), Strings (one row per string) and Clusters (grouped by category). Drag dots, zoom, filter by category, search, and include every brain book.
- **Books.** A shelf of brain books. Each keeps its own strings, thoughts and categories.
- **Settings.** Four themes (Melange, Blue note, Banquette, Schönbrunn dusk), accent colour, four writing typefaces, text size, string style and waviness, window light, paper grain, the time in Vienna, optional soft jazz notes while you type, and calm motion.

Everything is saved in your browser (`localStorage`). Export and import a JSON copy from Settings.

## Files

| File | Job |
| --- | --- |
| `index.html`, `styles.css` | Page and design |
| `js/store.js` | Brain books, strings, thoughts, categories, links, echoes |
| `js/string.js` | The writing interface |
| `js/notes.js`, `js/inspector.js` | Notes list and the thought panel |
| `js/web.js` | The web of thoughts |
| `js/books.js` | The shelf |
| `js/settings.js`, `js/sound.js`, `js/app.js` | Settings, sound, routing |
