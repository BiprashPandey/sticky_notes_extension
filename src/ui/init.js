import { els } from '../shared/dom.js';
import { STORAGE_KEY, state, setState, mergeState } from '../shared/state.js';
import { applySavedLayout } from './layout.js';
import { buildWallpapers, wallpaperById, hasWallpaper } from '../modules/wallpaper.js';
import { detectVideos, initVideoPlayer, openVideoPlayer } from '../modules/video.js';
import { bindMusic } from '../modules/music.js';
import { initPomodoro } from '../modules/pomodoro.js';
import { initCalendar } from '../modules/calendar.js';
import { updateAllClocks } from '../modules/clocks.js';
import { setRenderAll } from '../modules/data.js';
import { bindSettings } from '../modules/settings.js';
import { bindFocusSettings } from '../modules/focus-settings.js';
import { bindUi } from './bindings.js';
import { addNote, addClock, renderEverything, applyExternal } from './app-shell.js';

export function init() {
  (async function init() {
    await buildWallpapers();
    await detectVideos();
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    setState(mergeState(stored[STORAGE_KEY]));
    if (!hasWallpaper(state.wallpaper.id)) state.wallpaper.id = wallpaperById(state.wallpaper.id).id;

    bindSettings();
    bindFocusSettings();
    bindUi(addNote, addClock);
    setRenderAll(renderEverything);
    initPomodoro();
    initCalendar();
    initVideoPlayer();
    bindMusic();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const ch = changes[STORAGE_KEY];
      if (!ch || !ch.newValue) return;
      applyExternal(ch.newValue);
    });

    applySavedLayout();
    renderEverything();
    setInterval(updateAllClocks, 1000);
    if (new URLSearchParams(location.search).get('reels') === '1') openVideoPlayer();
    document.body.classList.add('ready');
  })();
}