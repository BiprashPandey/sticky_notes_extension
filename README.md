# Personal Dashboard — New Tab Extension

A feature-rich Chrome extension (Manifest V3) that replaces the default `chrome://newtab/` page with a fully customizable personal dashboard:

- **Wallpaper engine** — 12 built-in wallpapers (stored locally in `wallpapers/`), a 🎨 cycle button, an auto-cycle timer (Settings), and a thumbnail gallery for direct selection. Selection persists via `chrome.storage.local`.
- **Sticky notes** — add, edit, collapse/expand, delete, change color (🎨), and choose a font per note (Sans-Serif / Serif / Monospace / Handwriting). Everything auto-saves.
- **World clocks** — add unlimited clocks, pick from 36 curated timezones or the full IANA list, rename them, and drag them anywhere.
- **Google search bar** — top-center glass pill; Enter or the ↵ button searches Google in the current tab or a new tab (configurable in Settings). Press `/` to focus it.
- **Free placement** — notes and clocks are draggable by their header and positions persist as percentages, so they stay put across reloads and window sizes.
- **Extras** — local hero clock with greeting (custom name in Settings), multi-window sync, export/import/reset of all data.

## File structure

```
sticky_notes_extension/
├── manifest.json              # MV3 config: chrome_url_overrides + storage permission
├── newtab.html                # Search bar, hero clock, widget containers, settings drawer
├── newtab.css                 # Glassmorphism UI, sticky notes, clock widgets, gallery
├── newtab.js                  # State, storage, drag & drop, timezone math, search
├── icons/                     # Generated extension icons (16/48/128)
├── wallpapers/                # 12 local wallpapers (already downloaded)
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
| Search | Type a query, press Enter — Google results open in the current tab. Change to "New tab" in Settings. Press `/` anywhere to jump to the search bar. |
| Wallpaper | Click 🎨 to cycle; open Settings → Wallpaper to pick any thumbnail; set auto-cycle in Settings → Wallpaper auto-cycle. |
| Sticky notes | Click **＋ Note**; type (auto-saves). Drag by the header. Change font via the dropdown, cycle color with 🎨, collapse with `–`, delete with `✕`. |
| Clocks | Click **＋ Clock**; pick a timezone (e.g. Kathmandu, Tokyo, UTC), rename it, drag it into place. |
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
