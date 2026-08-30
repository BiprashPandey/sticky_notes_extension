# Personal Dashboard — New Tab Extension

A feature-rich Chrome extension (Manifest V3) that replaces the default `chrome://newtab/` page with a fully customizable personal dashboard:

- **Wallpaper engine** — 24 built-in wallpapers (stored locally in `wallpapers/`) plus **26 dark/moody image themes and 14 dark CSS gradient themes** that always work offline (now shown first in the gallery), a 🎨 cycle button, an auto-cycle timer (Settings), and a thumbnail gallery for direct selection. Selection persists via `chrome.storage.local`. The default wallpaper is the dark "Deep Space" gradient.
- **Translucent sticky notes** — frosted-glass notes in 6 translucent colors; the **heading sits right in the top bar next to the 🎨 color picker and stays visible even when collapsed**. Add, edit, collapse/expand, delete, and resize by dragging the corner handle (double-click to reset). The body is **rich text**: select text and use the **B / I / U / S** bar (or Ctrl+B/I/U) for bold, italic, underline, and strikethrough. **📌 Pin locks a note's position and size in place.** Everything auto-saves.
- **To-do lists** — the **＋ To Dos** button adds a glass-themed, draggable checklist with its own **collapse/expand button and corner resize handle**: add tasks (Enter), tick them off (✓ circle), edit a task by clicking its text, delete individual tasks, rename or delete the whole list. Every task has a **＋ subtask button**: click it to add subtasks, which nest recursively (sub-subtasks, etc.) with their own checkboxes and delete buttons. Grab the widget body anywhere to drag it, just like clocks; **📌 pin locks it down.**
- **Quotes** — the **＋ Quote** button adds a glass quote card matching the to-do and clock style: click the text to write your own quote and add an attribution, collapse or delete it, drag it anywhere, resize it via the bottom-right corner (double-click to reset), or **📌 pin it.**
- **Floating world clocks** — no central clock; add unlimited clock widgets and drag any of them anywhere (grab the widget body or header), or **📌 pin them** to freeze their spot. Each offers 36 curated timezones or the full IANA list, and can be renamed. New clocks are auto-placed in a tidy row next to the existing ones.
- **Free placement** — notes, clocks, quotes, and to-do lists are all draggable individually (use 📌 to lock any of them). Positions are stored as **viewport ratios (percentages)**, so layout scales with the window; everything is clamped to stay fully on-screen and re-clamped live when you resize the tab. Widget widths, paddings, gaps, and fonts use `vw`/`vh`/`clamp()` units, so the whole dashboard scales proportionally from a laptop to a large monitor. Widget sizes you set manually (resize handle) are kept in pixels as-is.
- **Global JetBrains Mono font** — the bundled variable font (100–800 weights, `fonts/JetBrainsMono.woff2`) is applied to every element: notes, clocks, + Note/+ Clock buttons, and settings. The Settings → Interface font picker switches all of them at once.
- **Extras** — multi-window sync, export/import/reset of all data.

## File structure

```
sticky_notes_extension/
├── manifest.json              # MV3 config: chrome_url_overrides + storage permission
├── newtab.html                # Widget containers, settings drawer
├── newtab.css                 # Glassmorphism UI, sticky notes, clock widgets, gallery
├── newtab.js                  # State, storage, drag & drop, timezone math
├── icons/                     # Generated extension icons (16/48/128)
├── wallpapers/                # 24 local wallpapers (already downloaded)
├── fonts/                     # Bundled JetBrains Mono variable font (offline-safe)
├── generate-icons.ps1         # Regenerates icons (PowerShell, no deps)
└── download-wallpapers.ps1    # Re-downloads wallpapers into wallpapers/
```

## Loading and testing the unpacked extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this folder: `sticky_notes_extension`.
4. The extension "Personal Dashboard — New Tab" should appear with no errors. If it shows an error banner, click **Errors** and resolve it (usually a stale file path or a name collision — see Troubleshooting).
5. Open a new tab (`Ctrl + T` or `Ctrl + N`). The default new tab page is replaced by the dashboard. Reload the extension (↻ button on its card) after any code edits, then refresh the new tab.

### Test checklist

| Feature | How to test |
| --- | --- |
| Wallpaper | Click 🎨 to cycle; open Settings → Wallpaper to pick any thumbnail; set auto-cycle in Settings → Wallpaper auto-cycle. |
| Sticky notes | Click **＋ Note**; type a heading and body (auto-saves). Select body text and press **B/I/U/S** to format it, or use Ctrl+B/Ctrl+I/Ctrl+U. Drag by the header. Cycle color with 🎨, collapse with `–` (title stays visible), delete with `✕`. Drag the bottom-right corner to resize (double-click the corner to restore the default size). Click **📌** to pin — position and size stay locked. |
| To-do lists | Click **＋ To Dos** — a draggable glass checklist appears (drag it anywhere, like a clock). Type a task and press Enter to add; click the circle to check/uncheck; click a task's text to edit it; press the **＋** next to a task to add nested subtasks (repeatable to any depth); use `–` to collapse the list; use ✕ to delete a task or the whole list. Drag the bottom-right corner to resize (double-click to reset); click **📌** to pin. |
| Quotes | Click **＋ Quote** — a glass quote card appears; click its text to write your own quote (or keep the sample), type an attribution below it, collapse with `–`, delete with `✕`, and drag it anywhere. Drag the bottom-right corner to resize (double-click to reset); click **📌** to pin. |
| Clocks | Click **＋ Clock** — the new clock is auto-placed next to the previous ones; drag it anywhere by its body or header (or **📌** pin it), pick a timezone (e.g. Kathmandu, Tokyo, UTC), rename it, delete with `✕`. |
| Interface font | Settings → Interface font: change it and watch notes, clocks, + Note/+ Clock buttons all switch at once. |
| Persistence | Reload the tab / close Chrome / open a second window — notes, clocks, wallpaper, and positions all survive. |
| Data | Settings → Data: Export downloads a JSON backup; Import restores it; Reset wipes everything. |

## Notes & troubleshooting

- **Only one extension can override the New Tab page.** If yours doesn't appear, disable/remove other new-tab extensions (and check you don't have a Chrome profile policy forcing one).
- The dashboard **works fully offline** — wallpapers are local files, and 6 pure-CSS gradient wallpapers are always available as fallback. The remote Unsplash list in `newtab.js` is only used if `wallpapers/` is missing.
- **Multiple windows / monitors** — all windows live-sync through `chrome.storage.local`; positions are viewport ratios, so each monitor scales the same arrangement to its own size. Resizing or moving a tab between monitors only re-clamps widgets on screen (no full rebuild), and external updates are applied only when safe (not while you're typing or dragging), so opening new tabs simultaneously on two monitors won't scramble the layout.
- After editing `newtab.js`/`newtab.css`, click the ↻ **reload** button on the extension card in `chrome://extensions`, then refresh the new tab.
- To debug, right-click the new tab page → **Inspect** (opens DevTools for the extension page) or click **service worker** in the extension card.
- Wallpapers are from Unsplash (free license). Re-download them anytime with `powershell -ExecutionPolicy Bypass -File download-wallpapers.ps1`.
- Works in Microsoft Edge too (`edge://extensions` → Load unpacked) since it is Chromium-based.
- To package for the Chrome Web Store: `chrome://extensions` → **Pack extension** → select this folder.
