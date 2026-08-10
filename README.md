# Personal Dashboard — New Tab Extension

A feature-rich Chrome extension (Manifest V3) that replaces the default `chrome://newtab/` page with a fully customizable personal dashboard:

- **Wallpaper engine** — 12 built-in wallpapers (stored locally in `wallpapers/`) plus **14 dark/moody CSS gradient themes** that always work offline (now shown first in the gallery), a 🎨 cycle button, an auto-cycle timer (Settings), and a thumbnail gallery for direct selection. Selection persists via `chrome.storage.local`. The default wallpaper is the dark "Deep Space" gradient.
- **Translucent sticky notes** — frosted-glass notes in 6 translucent colors; the **heading sits right in the top bar next to the 🎨 color picker and stays visible even when collapsed**. Add, edit, collapse/expand, delete, and resize by dragging the corner handle (double-click to reset). Everything auto-saves.
- **To-do lists** — the **＋ To Dos** button adds a glass-themed, draggable checklist with its own **collapse/expand button and corner resize handle**: add tasks (Enter), tick them off (✓ circle), edit a task by clicking its text, delete individual tasks, rename or delete the whole list.
- **Floating world clocks** — no central clock; add unlimited clock widgets and drag any of them anywhere (grab the widget body or header). Each offers 36 curated timezones or the full IANA list, and can be renamed. New clocks are auto-placed in a tidy row next to the existing ones.
- **Google search bar** — glass pill that is itself draggable (grab its icon/edges; press `/` to focus it); Enter or the ↵ button searches Google in the current tab or a new tab (configurable in Settings).
- **Free placement** — notes, clocks, and the search bar are all draggable individually. Positions persist as percentages, so everything stays put across reloads and window sizes.
- **Global JetBrains Mono font** — the bundled variable font (100–800 weights, `fonts/JetBrainsMono.woff2`) is applied to every element: notes, clocks, + Note/+ Clock buttons, the search bar, and settings. The Settings → Interface font picker switches all of them at once.
- **Extras** — multi-window sync, export/import/reset of all data.

## File structure

```
sticky_notes_extension/
├── manifest.json              # MV3 config: chrome_url_overrides + storage permission
├── newtab.html                # Search bar, widget containers, settings drawer
├── newtab.css                 # Glassmorphism UI, sticky notes, clock widgets, gallery
├── newtab.js                  # State, storage, drag & drop, timezone math, search
├── icons/                     # Generated extension icons (16/48/128)
├── wallpapers/                # 12 local wallpapers (already downloaded)
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
| Search | Type a query, press Enter — Google results open in the current tab. Change to "New tab" in Settings. Press `/` anywhere to jump to the search bar; drag the bar by its icon/edges to move it. |
| Wallpaper | Click 🎨 to cycle; open Settings → Wallpaper to pick any thumbnail; set auto-cycle in Settings → Wallpaper auto-cycle. |
| Sticky notes | Click **＋ Note**; type a heading and body (auto-saves). Drag by the header. Cycle color with 🎨, collapse with `–` (title stays visible), delete with `✕`. Drag the bottom-right corner to resize (double-click the corner to restore the default size). |
| To-do lists | Click **＋ To Dos** — a draggable glass checklist appears (drag by its header). Type a task and press Enter to add; click the circle to check/uncheck; click a task's text to edit it; use `–` to collapse the list; use ✕ to delete a task or the whole list. Drag the bottom-right corner to resize (double-click to reset). |
| Clocks | Click **＋ Clock** — the new clock is auto-placed next to the previous ones; drag it anywhere by its body or header, pick a timezone (e.g. Kathmandu, Tokyo, UTC), rename it, delete with `✕`. |
| Interface font | Settings → Interface font: change it and watch notes, clocks, + Note/+ Clock buttons, and the search bar all switch at once. |
| Persistence | Reload the tab / close Chrome / open a second window — notes, clocks, wallpaper, and positions all survive. |
| Data | Settings → Data: Export downloads a JSON backup; Import restores it; Reset wipes everything. |

## Notes & troubleshooting

- **Only one extension can override the New Tab page.** If yours doesn't appear, disable/remove other new-tab extensions (and check you don't have a Chrome profile policy forcing one).
- The dashboard **works fully offline** — wallpapers are local files, and 6 pure-CSS gradient wallpapers are always available as fallback. The remote Unsplash list in `newtab.js` is only used if `wallpapers/` is missing.
- After editing `newtab.js`/`newtab.css`, click the ↻ **reload** button on the extension card in `chrome://extensions`, then refresh the new tab.
- To debug, right-click the new tab page → **Inspect** (opens DevTools for the extension page) or click **service worker** in the extension card.
- Wallpapers are from Unsplash (free license). Re-download them anytime with `powershell -ExecutionPolicy Bypass -File download-wallpapers.ps1`.
- Works in Microsoft Edge too (`edge://extensions` → Load unpacked) since it is Chromium-based.
- To package for the Chrome Web Store: `chrome://extensions` → **Pack extension** → select this folder.
