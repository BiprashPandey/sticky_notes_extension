import { uid } from './utils.js';
import { QUOTE_DEFAULTS } from '../modules/quotes.js';

export const STORAGE_KEY = 'dashboardStateV1';

export let state = null;

export function setState(next) {
  state = next;
}

export function freshState() {
  return {
    saveToken: 0,
    settings: {
      font: 'default',
      defaultNoteColor: 'yellow',
      cycleMinutes: 0,
    },
    wallpaper: { id: 'g7' },
    layout: null,
    notes: [
      {
        id: uid(),
        title: 'Welcome',
        text: 'Welcome to your dashboard!\n\nDrag this note by its header to move it around.\nChange its color, collapse or delete it from the header.',
        color: 'yellow',
        collapsed: false,
        pinned: false,
        x: 5,
        y: 18,
      },
    ],
    clocks: [
      { id: uid(), timezone: 'America/New_York', label: 'New York', pinned: false },
      { id: uid(), timezone: 'Asia/Kathmandu', label: 'Kathmandu', pinned: false },
    ],
    todos: [],
    routines: [],
    quotes: [
      { id: uid(), text: QUOTE_DEFAULTS[0].text, author: QUOTE_DEFAULTS[0].author, collapsed: false, pinned: false },
    ],
    calendars: [],
    videos: [],
    music: { playlists: [] },
    focus: { enabled: true, sites: [], minutes: 5, playMixes: true },
  };
}

export function clampMinutes(m) {
  const n = Number(m);
  return isFinite(n) && n >= 1 ? Math.min(180, Math.round(n)) : 5;
}

export function mergeState(stored) {
  const base = freshState();
  const s = stored && typeof stored === 'object' ? stored : {};
  return {
    saveToken: Number(s.saveToken) || 0,
    settings: Object.assign({}, base.settings, s.settings || {}, {
      font: (s.settings && (s.settings.font || s.settings.defaultNoteFont)) || base.settings.font,
    }),
    wallpaper: Object.assign({}, base.wallpaper, s.wallpaper || {}),
    layout: s.layout && typeof s.layout === 'object' ? s.layout : null,
    notes: Array.isArray(s.notes) ? s.notes.filter((n) => n && typeof n === 'object') : [],
    clocks: Array.isArray(s.clocks) ? s.clocks.filter((c) => c && typeof c === 'object') : [],
    todos: Array.isArray(s.todos) ? s.todos.filter((t) => t && typeof t === 'object') : [],
    routines: Array.isArray(s.routines) ? s.routines.filter((r) => r && typeof r === 'object') : [],
    quotes: Array.isArray(s.quotes) ? s.quotes.filter((q) => q && typeof q === 'object') : base.quotes,
    calendars: Array.isArray(s.calendars) ? s.calendars.filter((c) => c && typeof c === 'object') : [],
    videos: Array.isArray(s.videos) ? s.videos.filter((v) => v && typeof v === 'object') : [],
    music: {
      playlists: s.music && Array.isArray(s.music.playlists)
        ? s.music.playlists.filter((p) => p && typeof p === 'object')
        : [],
    },
    focus: {
      enabled: s.focus ? s.focus.enabled !== false : true,
      sites: Array.isArray(s.focus && s.focus.sites)
        ? s.focus.sites.filter((x) => typeof x === 'string' && x.trim())
        : (s.focus && s.focus.url ? [s.focus.url] : []),
      minutes: clampMinutes(s.focus && s.focus.minutes),
      playMixes: s.focus ? s.focus.playMixes !== false : true,
    },
  };
}

export function saveState() {
  // Edits only live in-memory until the user clicks Save. Nothing is written to
  // storage here; the token just records that something changed locally.
  state.saveToken = (state.saveToken || 0) + 1;
}