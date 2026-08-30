'use strict';

const STORAGE_KEY = 'dashboardStateV1';
const LAYOUT_KEY = 'dashboardLayoutV1';

const FONTS = {
  default: { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace" },
  mono:    { label: 'Monospace',      stack: "'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace" },
  sans:    { label: 'Sans-Serif',     stack: "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif" },
  serif:   { label: 'Serif',          stack: "Georgia, 'Times New Roman', serif" },
  hand:    { label: 'Handwriting',    stack: "'Segoe Print', 'Comic Sans MS', 'Bradley Hand', cursive" },
};

const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'purple', 'orange'];

const POMODORO_KEY = 'dashboardPomodoroV1';
const POMODORO_MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long:  { label: 'Long Break', minutes: 15 },
};
const POMODORO_RING_CIRCUMFERENCE = 2 * Math.PI * 90;
const POMODORO_CYCLE = 4;

const QUOTE_DEFAULTS = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];

const REMOTE_WALLPAPERS = [
  { id: 'u1',  name: 'Alpine Dawn',     type: 'image', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u2',  name: 'Misty Highlands', type: 'image', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u3',  name: 'Starlit Peaks',   type: 'image', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u4',  name: 'Tropical Shores', type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u5',  name: 'Golden Meadow',   type: 'image', src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u6',  name: 'Mirror Lake',     type: 'image', src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u7',  name: 'Ink Swirl',       type: 'image', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u8',  name: 'Violet Drift',    type: 'image', src: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u9',  name: 'Neon Bloom',      type: 'image', src: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u10', name: 'Minimal Ridge',   type: 'image', src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u11', name: 'Spectrum',        type: 'image', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u12', name: 'Deep Field',      type: 'image', src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u13', name: 'Milky Way',       type: 'image', src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u14', name: 'Night Sky',       type: 'image', src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u15', name: 'Starry Ridge',    type: 'image', src: 'https://images.unsplash.com/photo-1431411207774-da3c9611fd95?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u16', name: 'Misty Forest',    type: 'image', src: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u17', name: 'Foggy Pines',     type: 'image', src: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u18', name: 'Blue Planet',     type: 'image', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u19', name: 'Violet Dawn',     type: 'image', src: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u20', name: 'Aurora Night',    type: 'image', src: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u21', name: 'Dark Alpine',     type: 'image', src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u22', name: 'Midnight Lake',   type: 'image', src: 'https://images.unsplash.com/photo-1500530855697-b586dba89ee3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u23', name: 'Black Tide',      type: 'image', src: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u24', name: 'Silhouette Woods', type: 'image', src: 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=1920&q=80' },
];

const GRADIENT_WALLPAPERS = [
  { id: 'g1', name: 'Midnight',     type: 'gradient', src: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { id: 'g2', name: 'Sunset',       type: 'gradient', src: 'linear-gradient(135deg, #f83600, #f9d423)' },
  { id: 'g3', name: 'Emerald',      type: 'gradient', src: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'g4', name: 'Violet Storm', type: 'gradient', src: 'linear-gradient(135deg, #6a11cb, #2575fc)' },
  { id: 'g5', name: 'Crimson',      type: 'gradient', src: 'linear-gradient(135deg, #fc466b, #3f5efb)' },
  { id: 'g6', name: 'Graphite',     type: 'gradient', src: 'linear-gradient(160deg, #1f2937, #374151)' },
  { id: 'g7', name: 'Deep Space',   type: 'gradient', src: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'g8', name: 'Slate Night',  type: 'gradient', src: 'linear-gradient(160deg, #0f172a, #1e293b, #334155)' },
  { id: 'g9', name: 'Royal Black',  type: 'gradient', src: 'linear-gradient(160deg, #141e30, #243b55)' },
  { id: 'g10', name: 'Abyss',       type: 'gradient', src: 'linear-gradient(160deg, #020111, #20124d, #0f0f1a)' },
  { id: 'g11', name: 'Violet Dusk', type: 'gradient', src: 'linear-gradient(160deg, #1a1038, #3b2a5e)' },
  { id: 'g12', name: 'Deep Emerald', type: 'gradient', src: 'linear-gradient(160deg, #052e1f, #0f4c33)' },
  { id: 'g13', name: 'Ember Night', type: 'gradient', src: 'linear-gradient(160deg, #1c0b07, #4a1d10)' },
  { id: 'g14', name: 'Ink',          type: 'gradient', src: 'linear-gradient(160deg, #000000, #1f2937)' },
];

const LOCAL_SLOTS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
  '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];

const TZ_PRESETS = [
  ['UTC', 'UTC'],
  ['America/New_York', 'New York'],
  ['America/Chicago', 'Chicago'],
  ['America/Denver', 'Denver'],
  ['America/Los_Angeles', 'Los Angeles'],
  ['America/Anchorage', 'Anchorage'],
  ['America/Toronto', 'Toronto'],
  ['America/Mexico_City', 'Mexico City'],
  ['America/Sao_Paulo', 'Sao Paulo'],
  ['America/Argentina/Buenos_Aires', 'Buenos Aires'],
  ['Europe/London', 'London'],
  ['Europe/Paris', 'Paris'],
  ['Europe/Berlin', 'Berlin'],
  ['Europe/Madrid', 'Madrid'],
  ['Europe/Rome', 'Rome'],
  ['Europe/Moscow', 'Moscow'],
  ['Europe/Istanbul', 'Istanbul'],
  ['Africa/Cairo', 'Cairo'],
  ['Africa/Lagos', 'Lagos'],
  ['Africa/Nairobi', 'Nairobi'],
  ['Africa/Johannesburg', 'Johannesburg'],
  ['Asia/Dubai', 'Dubai'],
  ['Asia/Karachi', 'Karachi'],
  ['Asia/Kolkata', 'New Delhi'],
  ['Asia/Kathmandu', 'Kathmandu'],
  ['Asia/Dhaka', 'Dhaka'],
  ['Asia/Bangkok', 'Bangkok'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Hong_Kong', 'Hong Kong'],
  ['Asia/Shanghai', 'Shanghai'],
  ['Asia/Tokyo', 'Tokyo'],
  ['Asia/Seoul', 'Seoul'],
  ['Australia/Perth', 'Perth'],
  ['Australia/Sydney', 'Sydney'],
  ['Australia/Melbourne', 'Melbourne'],
  ['Pacific/Auckland', 'Auckland'],
];

let state = null;
let WALLPAPERS = [];
let cycleTimer = null;
let saveTimer = null;
let layoutResizeTimer = null;
let allTz = null;
let appliedWpId = null;
let pendingExternal = null;
let externalApplyTimer = null;
const clockFormatters = new Map();
const clockEls = new Map();

const els = {
  bgLayer: document.getElementById('bgLayer'),
  widgets: document.getElementById('widgets'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchPinBtn: document.getElementById('searchPinBtn'),
  addNoteBtn: document.getElementById('addNoteBtn'),
  addClockBtn: document.getElementById('addClockBtn'),
  addTodoBtn: document.getElementById('addTodoBtn'),
  addRoutineBtn: document.getElementById('addRoutineBtn'),
  addQuoteBtn: document.getElementById('addQuoteBtn'),
  addVideoBtn: document.getElementById('addVideoBtn'),
  cycleWallpaperBtn: document.getElementById('cycleWallpaperBtn'),
  pomodoroBtn: document.getElementById('pomodoroBtn'),
  pomodoroOverlay: document.getElementById('pomodoroOverlay'),
  closePomodoroBtn: document.getElementById('closePomodoroBtn'),
  videoOverlay: document.getElementById('videoOverlay'),
  closeVideoBtn: document.getElementById('closeVideoBtn'),
  musicBtn: document.getElementById('musicBtn'),
  musicOverlay: document.getElementById('musicOverlay'),
  closeMusicBtn: document.getElementById('closeMusicBtn'),
  musicAddForm: document.getElementById('musicAddForm'),
  musicNameInput: document.getElementById('musicNameInput'),
  musicUrlInput: document.getElementById('musicUrlInput'),
  musicList: document.getElementById('musicList'),
  musicHint: document.getElementById('musicHint'),
  musicMini: document.getElementById('musicMini'),
  ytHolder: document.getElementById('ytHolder'),
  musicMiniName: document.getElementById('musicMiniName'),
  musicPrevBtn: document.getElementById('musicPrevBtn'),
  musicToggleBtn: document.getElementById('musicToggleBtn'),
  musicNextBtn: document.getElementById('musicNextBtn'),
  musicStopBtn: document.getElementById('musicStopBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveLayoutBtn: document.getElementById('saveLayoutBtn'),
  searchModeRadios: document.querySelectorAll('input[name="searchMode"]'),
  fontInput: document.getElementById('fontInput'),
  cycleInput: document.getElementById('cycleInput'),
  wpGallery: document.getElementById('wpGallery'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  resetBtn: document.getElementById('resetBtn'),
};

/* ---------------- Helpers ---------------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function htmlFromText(text) {
  if (!text) return '';
  if (String(text).indexOf('<') !== -1) return String(text);
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function clampPct(v) {
  const n = Number(v);
  return isFinite(n) ? Math.min(95, Math.max(0, n)) : 0;
}

function fitWidget(el) {
  const r = el.getBoundingClientRect();
  if (!isFinite(r.width) || !isFinite(r.height)) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const edge = Math.max(4, Math.round(vw * 0.006));
  const maxX = Math.max(0, 100 - ((r.width + edge) / vw) * 100);
  const maxY = Math.max(0, 100 - ((r.height + edge) / vh) * 100);
  const x = parseFloat(el.style.left);
  const y = parseFloat(el.style.top);
  el.style.left = (isFinite(x) ? Math.min(Math.max(0, x), maxX) : 50) + '%';
  el.style.top = (isFinite(y) ? Math.min(Math.max(0, y), maxY) : 20) + '%';
}

function fitAllWidgets() {
  els.widgets.querySelectorAll('.note, .clock, .todo, .quote, .routine').forEach(fitWidget);
  fitWidget(els.searchForm);
}

function pct(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : 0;
}

function tzFriendly(tz) {
  const hit = TZ_PRESETS.find(([v]) => v === tz);
  return hit ? hit[1] : tz.split('/').pop().replace(/_/g, ' ');
}

/* ---------------- State ---------------- */

function freshState() {
  return {
    saveToken: 0,
    settings: {
      font: 'default',
      searchMode: 'currentTab',
      defaultNoteColor: 'yellow',
      cycleMinutes: 0,
    },
    wallpaper: { id: 'g7' },
    searchPos: { x: 50, y: 3.2, centered: true },
    searchPinned: false,
    notes: [
      {
        id: uid(),
        title: 'Welcome',
        text: 'Welcome to your dashboard!\n\nDrag this note by its header to move it around.\nChange its color, collapse or delete it from the header.\n\nTip: press / to search Google.',
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
    videos: [],
    music: { playlists: [] },
  };
}

function mergeState(stored) {
  const base = freshState();
  const s = stored && typeof stored === 'object' ? stored : {};
  return {
    saveToken: Number(s.saveToken) || 0,
    settings: Object.assign({}, base.settings, s.settings || {}, {
      font: (s.settings && (s.settings.font || s.settings.defaultNoteFont)) || base.settings.font,
    }),
    wallpaper: Object.assign({}, base.wallpaper, s.wallpaper || {}),
    searchPos: Object.assign({
      x: 50,
      y: 3.2,
      centered: !(s.searchPos && typeof s.searchPos === 'object'),
    }, s.searchPos || {}),
    searchPinned: !!s.searchPinned,
    notes: Array.isArray(s.notes) ? s.notes.filter((n) => n && typeof n === 'object') : [],
    clocks: Array.isArray(s.clocks) ? s.clocks.filter((c) => c && typeof c === 'object') : [],
    todos: Array.isArray(s.todos) ? s.todos.filter((t) => t && typeof t === 'object') : [],
    routines: Array.isArray(s.routines) ? s.routines.filter((r) => r && typeof r === 'object') : [],
    quotes: Array.isArray(s.quotes) ? s.quotes.filter((q) => q && typeof q === 'object') : base.quotes,
    videos: Array.isArray(s.videos) ? s.videos.filter((v) => v && typeof v === 'object') : [],
    music: {
      playlists: s.music && Array.isArray(s.music.playlists)
        ? s.music.playlists.filter((p) => p && typeof p === 'object')
        : [],
    },
  };
}

function saveState(immediate) {
  state.saveToken = (state.saveToken || 0) + 1;
  if (saveTimer) clearTimeout(saveTimer);
  const doSave = () => chrome.storage.local.set({ [STORAGE_KEY]: JSON.parse(JSON.stringify(state)) });
  if (immediate) doSave();
  else saveTimer = setTimeout(doSave, 250);
}

function flushPendingSave() {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  chrome.storage.local.set({ [STORAGE_KEY]: JSON.parse(JSON.stringify(state)) });
}

function stateFingerprint(st) {
  const copy = Object.assign({}, st || {});
  delete copy.saveToken;
  return JSON.stringify(copy);
}

function isUserInteracting() {
  if (els.widgets.querySelector('.dragging')) return true;
  const a = document.activeElement;
  if (!a || !a.closest) return false;
  return !!a.closest('.note, .todo, .quote, .clock, .routine, .video') &&
    (a.isContentEditable || a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT');
}

function flushPendingExternal() {
  if (externalApplyTimer) {
    clearTimeout(externalApplyTimer);
    externalApplyTimer = null;
  }
  if (!pendingExternal) return;
  const v = pendingExternal;
  pendingExternal = null;
  if (isUserInteracting() || document.visibilityState === 'hidden') {
    pendingExternal = v;
    return;
  }
  if ((Number(v && v.saveToken) || 0) < state.saveToken) return;
  if (stateFingerprint(state) === stateFingerprint(v)) {
    state.saveToken = Math.max(state.saveToken, Number(v.saveToken) || 0);
    return;
  }
  state = mergeState(v);
  renderChangedCollections();
}

function queueExternalApply(newValue) {
  pendingExternal = newValue;
  if (externalApplyTimer) clearTimeout(externalApplyTimer);
  externalApplyTimer = setTimeout(flushPendingExternal, 120);
}

/* ---------------- Wallpapers ---------------- */

async function detectLocalWallpapers() {
  const found = [];
  await Promise.all(LOCAL_SLOTS.map((slot) => new Promise((resolve) => {
    const url = chrome.runtime.getURL('wallpapers/' + slot + '.jpg');
    const img = new Image();
    img.onload = () => { found.push({ id: 'l' + slot, name: 'Local ' + slot, type: 'image', src: url }); resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  })));
  return found;
}

async function buildWallpapers() {
  const local = await detectLocalWallpapers();
  WALLPAPERS = [...GRADIENT_WALLPAPERS, ...local, ...REMOTE_WALLPAPERS];
}

function wallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0];
}

function applyWallpaper(w) {
  if (appliedWpId !== w.id) {
    appliedWpId = w.id;
    els.bgLayer.classList.remove('wp-image', 'wp-gradient');
    els.bgLayer.innerHTML = '';
    if (w.type === 'gradient') {
      els.bgLayer.classList.add('wp-gradient');
      els.bgLayer.style.backgroundImage = w.src;
    } else {
      els.bgLayer.classList.add('wp-image');
      const img = new Image();
      img.onload = () => { els.bgLayer.innerHTML = ''; els.bgLayer.appendChild(img); };
      img.onerror = () => {
        els.bgLayer.classList.remove('wp-image');
        els.bgLayer.classList.add('wp-gradient');
        els.bgLayer.style.backgroundImage = 'linear-gradient(135deg, #0f172a, #334155)';
      };
      img.src = w.src;
    }
    if (state.wallpaper.id !== w.id) {
      state.wallpaper.id = w.id;
      saveState();
    }
  }
  buildGallery();
}

function nextWallpaper() {
  const idx = WALLPAPERS.findIndex((w) => w.id === state.wallpaper.id);
  applyWallpaper(WALLPAPERS[(idx + 1) % WALLPAPERS.length]);
}

function restartCycleTimer() {
  if (cycleTimer) {
    clearInterval(cycleTimer);
    cycleTimer = null;
  }
  const mins = Number(state.settings.cycleMinutes) || 0;
  if (mins > 0) cycleTimer = setInterval(nextWallpaper, mins * 60 * 1000);
}

function buildGallery() {
  if (els.wpGallery.dataset.built) {
    for (const b of els.wpGallery.querySelectorAll('.wp-thumb')) {
      b.classList.toggle('selected', b.dataset.wpId === state.wallpaper.id);
    }
    return;
  }
  els.wpGallery.dataset.built = '1';
  for (const w of WALLPAPERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wp-thumb' + (w.id === state.wallpaper.id ? ' selected' : '');
    b.dataset.wpId = w.id;
    b.style.backgroundImage = w.type === 'gradient' ? w.src : 'url("' + w.src + '")';
    b.title = w.name;
    b.innerHTML = '<span class="wp-thumb-name">' + escapeHtml(w.name) + '</span><span class="wp-thumb-check">✓</span>';
    b.addEventListener('click', () => applyWallpaper(w));
    els.wpGallery.appendChild(b);
  }
}

/* ---------------- Clocks ---------------- */

function tzOptionsHtml(selected) {
  let html = '';
  for (const [v, label] of TZ_PRESETS) {
    html += '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + label + '</option>';
  }
  if (!allTz) {
    try {
      allTz = Intl.supportedValuesOf('timeZone')
        .filter((tz) => !TZ_PRESETS.some(([v]) => v === tz))
        .sort();
    } catch (e) {
      allTz = [];
    }
  }
  if (allTz.length) {
    html += '<optgroup label="All timezones">';
    for (const tz of allTz) {
      html += '<option value="' + tz + '"' + (tz === selected ? ' selected' : '') + '>' + tz + '</option>';
    }
    html += '</optgroup>';
  }
  return html;
}

function clockParts(timezone) {
  let f = clockFormatters.get(timezone);
  if (!f) {
    f = {
      time: new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      date: new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    };
    clockFormatters.set(timezone, f);
  }
  const now = new Date();
  return { time: f.time.format(now), date: f.date.format(now) };
}

function layoutRow(items, getEl, startYFrac) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = Math.max(8, Math.round(vw * 0.012));
  const rowStart = vw * 0.28;
  const maxRight = vw * 0.96;
  let cursorX = rowStart;
  let rowY = vh * startYFrac;
  let rowH = 0;
  let changed = false;
  for (const item of items) {
    const el = getEl(item.id);
    const w = el ? el.getBoundingClientRect().width : 220;
    const h = el ? el.getBoundingClientRect().height : 100;
    rowH = Math.max(rowH, h);
    if (cursorX + w > maxRight && cursorX > rowStart) {
      cursorX = rowStart;
      rowY += rowH + gap;
      rowH = 0;
    }
    if (item.x === undefined || item.y === undefined) {
      item.x = Math.round((cursorX / vw) * 1000) / 10;
      item.y = Math.round((rowY / vh) * 1000) / 10;
      if (el) {
        el.style.left = item.x + '%';
        el.style.top = item.y + '%';
      }
      changed = true;
    }
    cursorX = (item.x / 100) * vw + w + gap;
  }
  return changed;
}

function renderClocks() {
  els.widgets.querySelectorAll('.clock').forEach((c) => c.remove());
  clockEls.clear();
  for (const clock of state.clocks) renderClock(clock);
  const changed = layoutRow(state.clocks, (id) => els.widgets.querySelector('.clock[data-clock-id="' + id + '"]'), 0.42);
  if (changed) saveState();
}

function renderTodos() {
  els.widgets.querySelectorAll('.todo').forEach((t) => t.remove());
  for (const todo of state.todos) renderTodo(todo);
  const changed = layoutRow(state.todos, (id) => els.widgets.querySelector('.todo[data-todo-id="' + id + '"]'), 0.76);
  if (changed) saveState();
}

function renderTodo(todo) {
  const el = document.createElement('div');
  el.className = 'todo' + (todo.collapsed ? ' collapsed' : '') + (todo.h || todo.hpct ? ' fixed' : '');
  el.dataset.todoId = todo.id;
  el.style.left = clampPct(todo.x) + '%';
  el.style.top = clampPct(todo.y) + '%';
  if (todo.wpct != null) el.style.width = todo.wpct + 'vw';
  else if (todo.w) el.style.width = Math.max(200, todo.w) + 'px';
  if (todo.hpct != null) el.style.height = todo.hpct + 'vh';
  else if (todo.h) el.style.height = todo.h + 'px';

  el.innerHTML =
    '<div class="todo-header">' +
      '<button type="button" class="icon-btn todo-pin-btn" title="Pin">📌</button>' +
      '<input class="todo-title" type="text" value="' + escapeHtml(todo.title || '') + '" placeholder="To-Dos" title="List name">' +
      '<button type="button" class="icon-btn todo-collapse-btn" title="' + (todo.collapsed ? 'Expand' : 'Collapse') + '">' + (todo.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn todo-delete-btn" title="Delete list">✕</button>' +
    '</div>' +
    '<ul class="todo-list"></ul>' +
    '<form class="todo-add">' +
      '<input class="todo-input" type="text" placeholder="Add a task…" autocomplete="off">' +
      '<button type="submit" class="todo-submit" title="Add task">＋</button>' +
    '</form>' +
    '<div class="todo-resize" title="Drag to resize — double-click to reset"></div>';

  const listEl = el.querySelector('.todo-list');
  const renderTasks = () => {
    listEl.innerHTML = '';
    for (const task of sortByPriority(todo.tasks)) renderTask(listEl, task, todo, renderTasks);
  };
  renderTasks();
  el.querySelector('.todo-title').addEventListener('input', (e) => {
    todo.title = e.target.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.todo-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    todo.collapsed = !todo.collapsed;
    el.classList.toggle('collapsed', todo.collapsed);
    collapseBtn.textContent = todo.collapsed ? '＋' : '–';
    collapseBtn.title = todo.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.todo-pin-btn'), todo);

  el.querySelector('.todo-delete-btn').addEventListener('click', () => {
    state.todos = state.todos.filter((t) => t.id !== todo.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.todo-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    todo.w = Math.round(w);
    todo.h = Math.round(h);
    todo.wpct = round3((w / window.innerWidth) * 100);
    todo.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    saveState();
  }, { disabled: () => todo.pinned });
  resizeHandle.addEventListener('dblclick', () => {
    delete todo.w;
    delete todo.h;
    delete todo.wpct;
    delete todo.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    saveState();
  });

  el.querySelector('.todo-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = el.querySelector('.todo-input');
    const text = input.value.trim();
    if (!text) return;
    if (!todo.tasks) todo.tasks = [];
    todo.tasks.push({ id: uid(), text: text, done: false });
    input.value = '';
    renderTasks();
    saveState();
  });

  makeDraggable(el, el, () => {
    todo.x = pct(el.style.left);
    todo.y = pct(el.style.top);
    saveState();
  }, { disabled: () => todo.pinned });

  els.widgets.appendChild(el);
}

function removeTask(container, id) {
  if (!container) return;
  for (const list of [container.tasks, container.subtasks]) {
    if (!Array.isArray(list)) continue;
    const idx = list.findIndex((t) => t && t.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      return;
    }
  }
  for (const t of (container.tasks || []).concat(container.subtasks || [])) {
    if (t && Array.isArray(t.subtasks)) removeTask(t, id);
  }
}

function moveTask(container, id, dir) {
  if (!container) return false;
  for (const key of ['tasks', 'subtasks']) {
    const list = container[key];
    if (!Array.isArray(list) || !list.some((t) => t && t.id === id)) continue;
    const sorted = sortByPriority(list);
    const idx = sorted.findIndex((t) => t && t.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return false;
    const tmp = sorted[idx];
    sorted[idx] = sorted[swap];
    sorted[swap] = tmp;
    list.length = 0;
    for (const t of sorted) list.push(t);
    return true;
  }
  return false;
}

const PRIORITY_LEVELS = ['none', 'low', 'med', 'high'];

function taskPriority(task) {
  return PRIORITY_LEVELS.includes(task && task.priority) ? task.priority : 'none';
}

const PRIORITY_RANK = { high: 0, med: 1, low: 2, none: 3 };

function sortByPriority(list) {
  return [...(list || [])].sort((a, b) =>
    PRIORITY_RANK[taskPriority(a)] - PRIORITY_RANK[taskPriority(b)]);
}

function renderTask(listEl, task, container, rerender) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (task.done ? ' done' : '') +
    (taskPriority(task) !== 'none' ? ' p-' + taskPriority(task) : '');
  li.innerHTML =
    '<button type="button" class="todo-check" title="' + (task.done ? 'Mark as not done' : 'Mark as done') + '">' + (task.done ? '✓' : '') + '</button>' +
    '<button type="button" class="todo-sub-toggle" title="Add subtask">＋</button>' +
    '<span class="todo-text" contenteditable="true" spellcheck="false">' + escapeHtml(task.text) + '</span>' +
    '<button type="button" class="todo-move-btn" data-move="-1" title="Move up">↑</button>' +
    '<button type="button" class="todo-move-btn" data-move="1" title="Move down">↓</button>' +
    '<button type="button" class="icon-btn todo-item-del" title="Delete task">✕</button>' +
    '<span class="todo-urgency">' +
      '<label class="urgency-check u-low" title="Low urgency"><input type="checkbox" value="low" tabindex="-1"><i></i></label>' +
      '<label class="urgency-check u-med" title="Medium urgency"><input type="checkbox" value="med" tabindex="-1"><i></i></label>' +
      '<label class="urgency-check u-high" title="High urgency"><input type="checkbox" value="high" tabindex="-1"><i></i></label>' +
    '</span>' +
    '<div class="todo-subarea">' +
      '<ul class="todo-subs"></ul>' +
    '</div>';

  const subsEl = li.querySelector('.todo-subs');
  const renderSubs = () => {
    subsEl.innerHTML = '';
    for (const sub of sortByPriority(task.subtasks)) renderTask(subsEl, sub, task, renderSubs);
  };
  if (task.subtasks && task.subtasks.length) li.classList.add('sub-open');
  renderSubs();

  li.querySelector('.todo-check').addEventListener('click', () => {
    task.done = !task.done;
    li.classList.toggle('done', task.done);
    li.querySelector('.todo-check').textContent = task.done ? '✓' : '';
    li.querySelector('.todo-check').title = task.done ? 'Mark as not done' : 'Mark as done';
    saveState();
  });

  li.querySelector('.todo-item-del').addEventListener('click', () => {
    removeTask(container, task.id);
    li.remove();
    saveState(true);
  });

  li.querySelectorAll('.todo-move-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.move);
      if (moveTask(container, task.id, dir)) {
        if (rerender) rerender();
        saveState();
      }
    });
  });

  const urgencyWrap = li.querySelector('.todo-urgency');
  const syncUrgency = () => {
    const cur = taskPriority(task);
    urgencyWrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = cb.value === cur;
    });
  };
  urgencyWrap.addEventListener('change', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    task.priority = e.target.checked && PRIORITY_LEVELS.includes(e.target.value) ? e.target.value : 'none';
    syncUrgency();
    saveState();
    if (rerender) rerender();
  });
  syncUrgency();

  li.querySelector('.todo-sub-toggle').addEventListener('click', () => {
    if (!task.subtasks) task.subtasks = [];
    const sub = { id: uid(), text: '', done: false };
    task.subtasks.push(sub);
    li.classList.add('sub-open');
    renderSubs();
    saveState();
    const newText = subsEl.querySelector('.todo-item:last-child .todo-text');
    if (newText) newText.focus();
  });

  const span = li.querySelector('.todo-text');
  span.addEventListener('blur', () => {
    task.text = span.textContent.trim();
    if (!task.text) {
      removeTask(container, task.id);
      li.remove();
    }
    saveState();
  });
  span.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      span.blur();
    }
  });

  listEl.appendChild(li);
}

function addTodo() {
  const todo = { id: uid(), title: '', tasks: [], collapsed: false, pinned: false };
  state.todos.push(todo);
  saveState();
  renderTodos();
}

/* ---------------- Routine widgets ---------------- */

function renderRoutines() {
  els.widgets.querySelectorAll('.routine').forEach((r) => r.remove());
  for (const routine of state.routines) renderRoutine(routine);
  const changed = layoutRow(state.routines, (id) => els.widgets.querySelector('.routine[data-routine-id="' + id + '"]'), 0.7);
  if (changed) saveState();
}

function renderRoutine(routine) {
  const el = document.createElement('div');
  el.className = 'routine' + (routine.collapsed ? ' collapsed' : '') + (routine.h || routine.hpct ? ' fixed' : '');
  el.dataset.routineId = routine.id;
  el.style.left = clampPct(routine.x) + '%';
  el.style.top = clampPct(routine.y) + '%';
  if (routine.wpct != null) el.style.width = routine.wpct + 'vw';
  else if (routine.w) el.style.width = Math.max(240, routine.w) + 'px';
  if (routine.hpct != null) el.style.height = routine.hpct + 'vh';
  else if (routine.h) el.style.height = routine.h + 'px';

  el.innerHTML =
    '<div class="routine-header">' +
      '<button type="button" class="icon-btn routine-pin-btn" title="Pin">📌</button>' +
      '<input class="routine-title" type="text" value="' + escapeHtml(routine.title || '') + '" placeholder="Routine" title="Routine name">' +
      '<button type="button" class="icon-btn routine-collapse-btn" title="' + (routine.collapsed ? 'Expand' : 'Collapse') + '">' + (routine.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn routine-delete-btn" title="Delete routine">✕</button>' +
    '</div>' +
    '<div class="routine-body">' +
      '<div class="routine-head">' +
        '<span class="routine-col routine-col-time">Time</span>' +
        '<span class="routine-col routine-col-task">Task</span>' +
        '<span class="routine-col routine-col-remarks">Remarks</span>' +
      '</div>' +
      '<div class="routine-rows"></div>' +
      '<form class="routine-add">' +
        '<input class="routine-time-input" type="text" placeholder="Time" autocomplete="off">' +
        '<input class="routine-task-input" type="text" placeholder="Task" autocomplete="off">' +
        '<input class="routine-remarks-input" type="text" placeholder="Remarks" autocomplete="off">' +
        '<button type="submit" class="routine-submit" title="Add row">＋</button>' +
      '</form>' +
    '</div>' +
    '<div class="routine-resize" title="Drag to resize — double-click to reset"></div>';

  const rowsEl = el.querySelector('.routine-rows');
  const renderRows = () => {
    rowsEl.innerHTML = '';
    for (const row of routine.rows || []) renderRoutineRow(rowsEl, row, routine, renderRows);
  };
  renderRows();

  el.querySelector('.routine-title').addEventListener('input', (e) => {
    routine.title = e.target.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.routine-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    routine.collapsed = !routine.collapsed;
    el.classList.toggle('collapsed', routine.collapsed);
    collapseBtn.textContent = routine.collapsed ? '＋' : '–';
    collapseBtn.title = routine.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.routine-pin-btn'), routine);

  el.querySelector('.routine-delete-btn').addEventListener('click', () => {
    state.routines = state.routines.filter((r) => r.id !== routine.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.routine-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    routine.w = Math.round(w);
    routine.h = Math.round(h);
    routine.wpct = round3((w / window.innerWidth) * 100);
    routine.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    saveState();
  }, {
    minW: Math.max(240, Math.round(window.innerWidth * 0.16)),
    minH: Math.max(120, Math.round(window.innerHeight * 0.18)),
    disabled: () => routine.pinned,
  });
  resizeHandle.addEventListener('dblclick', () => {
    delete routine.w;
    delete routine.h;
    delete routine.wpct;
    delete routine.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    saveState();
  });

  el.querySelector('.routine-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = el.querySelector('.routine-time-input');
    const task = el.querySelector('.routine-task-input');
    const remarks = el.querySelector('.routine-remarks-input');
    const taskVal = task.value.trim();
    const timeVal = time.value.trim();
    const remarksVal = remarks.value.trim();
    if (!timeVal && !taskVal && !remarksVal) return;
    if (!routine.rows) routine.rows = [];
    routine.rows.push({ id: uid(), time: timeVal, task: taskVal, remarks: remarksVal });
    time.value = '';
    task.value = '';
    remarks.value = '';
    renderRows();
    saveState();
  });

  makeDraggable(el, el, () => {
    routine.x = pct(el.style.left);
    routine.y = pct(el.style.top);
    saveState();
  }, { disabled: () => routine.pinned });

  els.widgets.appendChild(el);
}

function renderRoutineRow(rowsEl, row, routine, rerender) {
  const li = document.createElement('div');
  li.className = 'routine-row';
  li.innerHTML =
    '<button type="button" class="icon-btn routine-move-btn" data-dir="-1" title="Move up">↑</button>' +
    '<button type="button" class="icon-btn routine-move-btn" data-dir="1" title="Move down">↓</button>' +
    '<span class="routine-col routine-col-time" contenteditable="true" spellcheck="false">' + escapeHtml(row.time) + '</span>' +
    '<span class="routine-col routine-col-task" contenteditable="true" spellcheck="false">' + escapeHtml(row.task) + '</span>' +
    '<span class="routine-col routine-col-remarks" contenteditable="true" spellcheck="false">' + escapeHtml(row.remarks) + '</span>' +
    '<button type="button" class="icon-btn routine-row-del" title="Delete row">✕</button>';

  const bindCell = (cell, key) => {
    cell.addEventListener('blur', () => {
      row[key] = cell.textContent.trim();
      if (!row.time && !row.task && !row.remarks) {
        routine.rows = (routine.rows || []).filter((r) => r.id !== row.id);
        if (rerender) rerender();
      }
      saveState();
    });
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cell.blur();
      }
    });
  };
  bindCell(li.querySelector('.routine-col-time'), 'time');
  bindCell(li.querySelector('.routine-col-task'), 'task');
  bindCell(li.querySelector('.routine-col-remarks'), 'remarks');

  li.querySelectorAll('.routine-move-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      const list = routine.rows || [];
      const idx = list.findIndex((r) => r.id === row.id);
      const swap = idx + dir;
      if (idx === -1 || swap < 0 || swap >= list.length) return;
      const tmp = list[idx];
      list[idx] = list[swap];
      list[swap] = tmp;
      if (rerender) rerender();
      saveState();
    });
  });

  li.querySelector('.routine-row-del').addEventListener('click', () => {
    routine.rows = (routine.rows || []).filter((r) => r.id !== row.id);
    li.remove();
    saveState(true);
  });

  rowsEl.appendChild(li);
}

function addRoutine() {
  const routine = { id: uid(), title: '', rows: [], collapsed: false, pinned: false };
  state.routines.push(routine);
  saveState();
  renderRoutines();
}

/* ---------------- Video players ---------------- */

const VIDEO_EXTS = ['mp4', 'm4v', 'webm', 'mov', 'mkv', 'ogv', 'ogg'];

let videoLibrary = [];

function isVideoName(name) {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  return VIDEO_EXTS.includes(name.slice(dot + 1).toLowerCase());
}

async function detectVideos() {
  const allNames = [];
  try {
    const packaged = await listPackagedVideos();
    allNames.push(...packaged);
  } catch (e) {
    console.warn('[dashboard] Package folder scan failed:', e);
  }
  try {
    const fromPlaylist = await fetchPlaylistNames();
    for (const n of fromPlaylist) {
      if (!allNames.includes(n)) allNames.push(n);
    }
  } catch (e) {
    console.warn('[dashboard] Playlist manifest scan failed:', e);
  }
  if (!allNames.length) {
    try {
      const probed = await probeNumberedVideos();
      allNames.push(...probed);
    } catch (e) {
      /* ignore */
    }
  }
  const names = [...new Set(allNames)];
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  videoLibrary = names.map((name) => ({ name, src: chrome.runtime.getURL('videos/' + name) }));
}

async function fetchPlaylistNames() {
  const res = await fetch(chrome.runtime.getURL('videos/playlist.json'));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter((n) => typeof n === 'string' && isVideoName(n));
}

async function listPackagedVideos() {
  const root = await new Promise((resolve, reject) => {
    try {
      chrome.runtime.getPackageDirectoryEntry(resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
  const dir = await new Promise((resolve, reject) => root.getDirectory('videos', { create: false }, resolve, reject));
  const files = [];
  const reader = dir.createReader();
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) break;
    for (const f of batch) {
      if (f.isFile && isVideoName(f.name)) files.push(f.name);
    }
  }
  return files;
}

async function probeNumberedVideos() {
  const found = [];
  await Promise.all(LOCAL_SLOTS.map((slot) => ['mp4', 'webm'].map((ext) => new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => { found.push(slot + '.' + ext); resolve(); };
    v.onerror = () => resolve();
    v.src = chrome.runtime.getURL('videos/' + slot + '.' + ext);
  }))).flat());
  return [...new Set(found)];
}

/* ---------------- Reel overlay player ---------------- */

const VIDEO_STATE_KEY = 'dashboardReelsV1';
let videoEls = null;
let videoState = { order: [], pos: 0 };

function loadVideoState() {
  try {
    const raw = localStorage.getItem(VIDEO_STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.order)) {
      return {
        order: parsed.order.filter((n) => typeof n === 'string'),
        pos: Number(parsed.pos) || 0,
      };
    }
  } catch (e) {
    /* ignore */
  }
  return { order: [], pos: 0 };
}

function saveVideoState() {
  try {
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(videoState));
  } catch (e) {
    /* ignore */
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reshuffleDeck(prevName) {
  let order;
  do {
    order = shuffleArray(videoLibrary.map((v) => v.name));
  } while (prevName && order.length > 1 && order[0] === prevName);
  videoState.order = order;
  videoState.pos = 0;
}

function syncVideoOrder() {
  const names = videoLibrary.map((v) => v.name);
  const isValid = videoState.order.length === names.length &&
    videoState.order.every((n) => names.includes(n));
  if (!isValid) reshuffleDeck(null);
  if (videoState.pos < 0 || videoState.pos >= videoState.order.length) videoState.pos = 0;
}

function currentVideoItem() {
  const name = videoState.order[videoState.pos];
  return videoLibrary.find((v) => v.name === name) || null;
}

function initVideoPlayer() {
  videoState = loadVideoState();
  videoEls = {
    vid: els.videoOverlay.querySelector('.video-player'),
    name: els.videoOverlay.querySelector('.video-name'),
    count: els.videoOverlay.querySelector('.video-count'),
    navBtns: els.videoOverlay.querySelectorAll('.video-nav-btn'),
    openBtn: els.videoOverlay.querySelector('.video-open-btn'),
    refreshBtn: els.videoOverlay.querySelector('.video-refresh-btn'),
  };

  videoEls.navBtns.forEach((btn) => {
    btn.addEventListener('click', () => stepVideo(Number(btn.dataset.dir)));
  });
  videoEls.openBtn.addEventListener('click', () => {
    const item = currentVideoItem();
    if (!item) return;
    chrome.tabs.create({ url: item.src });
  });
  videoEls.refreshBtn.addEventListener('click', async () => {
    const btn = videoEls.refreshBtn;
    btn.disabled = true;
    btn.classList.add('spinning');
    try {
      await detectVideos();
      videoState.order = [];
      videoState.pos = 0;
      reshuffleDeck(null);
      applyVideoSource();
      saveVideoState();
    } catch (e) {
      console.warn('[dashboard] Refresh playlist failed:', e);
    }
    setTimeout(() => {
      btn.classList.remove('spinning');
      btn.disabled = false;
    }, 600);
  });

  els.addVideoBtn.addEventListener('click', openVideoPlayer);
  els.closeVideoBtn.addEventListener('click', closeVideoPlayer);
  els.videoOverlay.addEventListener('click', (e) => {
    if (e.target === els.videoOverlay) closeVideoPlayer();
  });
}

function applyVideoSource() {
  const { vid, name, count, navBtns, openBtn } = videoEls;
  if (!videoLibrary.length) {
    name.textContent = 'No videos in /videos folder';
    count.textContent = '';
    navBtns.forEach((b) => { b.disabled = true; });
    openBtn.disabled = true;
    vid.removeAttribute('src');
    vid.load();
    return;
  }
  syncVideoOrder();
  const item = currentVideoItem();
  if (!item) return;
  if (vid.dataset.src !== item.src) {
    vid.dataset.src = item.src;
    vid.src = item.src;
    vid.load();
  }
  name.textContent = item.name.replace(/\.[^.]+$/, '');
  name.title = item.name;
  count.textContent = (videoState.pos + 1) + ' / ' + videoState.order.length;
  navBtns.forEach((b) => { b.disabled = false; });
  openBtn.disabled = false;
}

function stepVideo(dir) {
  if (!videoState.order.length) return;
  const len = videoState.order.length;
  if (dir > 0) {
    if (videoState.pos + 1 >= len) reshuffleDeck(videoState.order[videoState.pos]);
    else videoState.pos += 1;
  } else {
    videoState.pos = videoState.pos - 1 < 0 ? len - 1 : videoState.pos - 1;
  }
  applyVideoSource();
  saveVideoState();
  videoEls.vid.play().catch(() => {});
}

function openVideoPlayer() {
  applyVideoSource();
  saveVideoState();
  els.videoOverlay.classList.add('open');
  videoEls.vid.play().catch(() => {});
}

function closeVideoPlayer() {
  els.videoOverlay.classList.remove('open');
  videoEls.vid.pause();
}

/* ---------------- Music (YouTube playlists) ---------------- */

let ytFrameEl = null;
let musicNowPlaying = null;
let musicPaused = false;

function parsePlaylistId(url) {
  const m = String(url || '').match(/[?&]list=([A-Za-z0-9_-]+)/);
  return m ? m[1] : '';
}

function renderMusic() {
  els.musicList.innerHTML = '';
  const lists = state.music ? state.music.playlists : [];
  if (!lists.length) {
    els.musicHint.textContent = 'No playlists yet — paste a YouTube playlist link above.';
    return;
  }
  for (const pl of lists) {
    const row = document.createElement('div');
    row.className = 'music-row' + (musicNowPlaying && musicNowPlaying.id === pl.id ? ' active' : '');
    row.innerHTML =
      '<span class="music-row-name">' + escapeHtml(pl.name || 'Untitled') + '</span>' +
      '<button type="button" class="video-nav-btn music-play-btn" title="Play">▶</button>' +
      '<button type="button" class="icon-btn music-del-btn" title="Remove">✕</button>';
    row.querySelector('.music-play-btn').addEventListener('click', () => {
      playMusic(pl);
      closeMusicOverlay();
    });
    row.querySelector('.music-del-btn').addEventListener('click', () => {
      if (musicNowPlaying && musicNowPlaying.id === pl.id) stopMusic();
      state.music.playlists = state.music.playlists.filter((p) => p.id !== pl.id);
      saveState(true);
      renderMusic();
    });
    els.musicList.appendChild(row);
  }
}

function ytCommand(func) {
  if (!ytFrameEl || !ytFrameEl.contentWindow) return;
  ytFrameEl.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func, args: [] }),
    'https://www.youtube.com'
  );
}

function playMusic(pl) {
  if (!pl || !pl.plId) return;
  const frame = els.ytHolder.querySelector('iframe') || document.createElement('iframe');
  if (!frame.parentNode) {
    frame.allow = 'autoplay; encrypted-media';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    els.ytHolder.appendChild(frame);
  }
  const samePlaylist = musicNowPlaying && musicNowPlaying.id === pl.id && frame.dataset.list === pl.plId;
  musicNowPlaying = pl;
  musicPaused = false;
  if (!samePlaylist) {
    frame.dataset.list = pl.plId;
    frame.src = 'https://www.youtube.com/embed/videoseries?list=' + encodeURIComponent(pl.plId) +
      '&enablejsapi=1&autoplay=1&playsinline=1';
  }
  ytFrameEl = frame;
  els.musicMini.hidden = false;
  els.musicMiniName.textContent = pl.name || 'Untitled playlist';
  els.musicToggleBtn.textContent = '⏸';
}

function stopMusic() {
  musicNowPlaying = null;
  musicPaused = false;
  ytFrameEl = null;
  const frame = els.ytHolder.querySelector('iframe');
  if (frame) frame.removeAttribute('src');
  els.musicMini.hidden = true;
}

function toggleMusic() {
  if (!musicNowPlaying) return;
  if (musicPaused) {
    ytCommand('playVideo');
    musicPaused = false;
    els.musicToggleBtn.textContent = '⏸';
  } else {
    ytCommand('pauseVideo');
    musicPaused = true;
    els.musicToggleBtn.textContent = '▶';
  }
}

function openMusicOverlay() {
  renderMusic();
  els.musicOverlay.classList.add('open');
}

function closeMusicOverlay() {
  els.musicOverlay.classList.remove('open');
}

function bindMusic() {
  els.musicBtn.addEventListener('click', openMusicOverlay);
  els.closeMusicBtn.addEventListener('click', closeMusicOverlay);
  els.musicOverlay.addEventListener('click', (e) => {
    if (e.target === els.musicOverlay) closeMusicOverlay();
  });

  els.musicAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.musicNameInput.value.trim();
    const url = els.musicUrlInput.value.trim();
    const plId = parsePlaylistId(url);
    if (!name || !plId) {
      els.musicHint.textContent = 'Enter a name and a valid YouTube playlist link (…?list=…).';
      return;
    }
    state.music.playlists.push({ id: uid(), name, url, plId });
    saveState();
    els.musicNameInput.value = '';
    els.musicUrlInput.value = '';
    els.musicHint.textContent = '';
    renderMusic();
  });

  els.musicPrevBtn.addEventListener('click', () => ytCommand('previousVideo'));
  els.musicNextBtn.addEventListener('click', () => ytCommand('nextVideo'));
  els.musicToggleBtn.addEventListener('click', toggleMusic);
  els.musicStopBtn.addEventListener('click', stopMusic);
}

/* ---------------- Pomodoro timer ---------------- */

let pomodoro = null;
let pomoEls = null;
let pomoAudio = null;

function loadPomodoroState() {
  const defaultDurations = {};
  for (const [mode, def] of Object.entries(POMODORO_MODES)) defaultDurations[mode] = def.minutes;
  try {
    const raw = localStorage.getItem(POMODORO_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && POMODORO_MODES[p.mode] && typeof p.completed === 'number') {
        const durations = Object.assign({}, defaultDurations);
        for (const mode of Object.keys(POMODORO_MODES)) {
          const v = p.durations ? Number(p.durations[mode]) : NaN;
          if (isFinite(v) && v >= 1) durations[mode] = Math.min(180, Math.round(v));
        }
        const total = durations[p.mode] * 60000;
        return {
          mode: p.mode,
          running: !!p.running && isFinite(p.endAt),
          endAt: p.running && isFinite(p.endAt) ? Number(p.endAt) : null,
          remainingMs: Math.min(Math.max(Number(p.remainingMs) || 0, 0), total),
          completed: Math.max(0, Math.floor(p.completed)),
          durations,
        };
      }
    }
  } catch (e) {
    /* fall through to defaults */
  }
  return { mode: 'focus', running: false, endAt: null, remainingMs: POMODORO_MODES.focus.minutes * 60000, completed: 0, durations: defaultDurations };
}

function savePomodoroState() {
  try {
    localStorage.setItem(POMODORO_KEY, JSON.stringify(pomodoro));
  } catch (e) {
    /* ignore */
  }
}

function pomoMinutes(mode) {
  const d = pomodoro && pomodoro.durations;
  return d && isFinite(d[mode]) && d[mode] >= 1 ? d[mode] : POMODORO_MODES[mode].minutes;
}

function pomoRemaining() {
  return pomodoro.running ? pomodoro.endAt - Date.now() : pomodoro.remainingMs;
}

function pomoFormat(ms) {
  const clamped = Math.max(0, ms);
  const m = Math.floor(clamped / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function initPomodoro() {
  pomodoro = loadPomodoroState();
  pomoEls = {
    modes: [...els.pomodoroOverlay.querySelectorAll('.pomodoro-mode')],
    ring: els.pomodoroOverlay.querySelector('.pomodoro-ring'),
    fg: els.pomodoroOverlay.querySelector('.pomodoro-ring-fg'),
    time: els.pomodoroOverlay.querySelector('.pomodoro-time'),
    phase: els.pomodoroOverlay.querySelector('.pomodoro-phase'),
    toggle: els.pomodoroOverlay.querySelector('.pomodoro-start'),
    reset: els.pomodoroOverlay.querySelector('.pomodoro-reset'),
    dotsWrap: els.pomodoroOverlay.querySelector('.pomodoro-dots'),
    hint: els.pomodoroOverlay.querySelector('.pomodoro-hint'),
  };

  pomoEls.dotsWrap.innerHTML = '';
  for (let i = 0; i < POMODORO_CYCLE; i++) {
    const dot = document.createElement('span');
    dot.className = 'pomodoro-dot';
    pomoEls.dotsWrap.appendChild(dot);
  }
  pomoEls.dots = [...pomoEls.dotsWrap.children];

  pomoEls.durationInputs = {};
  els.pomodoroOverlay.querySelectorAll('.pomodoro-duration').forEach((row) => {
    const mode = row.dataset.mode;
    const input = row.querySelector('.pomodoro-min');
    pomoEls.durationInputs[mode] = input;
    input.addEventListener('change', () => pomoSetDuration(mode, parseInt(input.value, 10)));
    row.querySelectorAll('.pomodoro-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cur = parseInt(input.value, 10) || POMODORO_MODES[mode].minutes;
        pomoSetDuration(mode, cur + Number(btn.dataset.step));
      });
    });
  });
  syncDurationInputs();

  els.pomodoroBtn.addEventListener('click', openPomodoro);
  els.closePomodoroBtn.addEventListener('click', closePomodoro);
  els.pomodoroOverlay.addEventListener('click', (e) => {
    if (e.target === els.pomodoroOverlay) closePomodoro();
  });

  pomoEls.modes.forEach((btn) => {
    btn.addEventListener('click', () => pomoSelectMode(btn.dataset.mode));
  });
  pomoEls.toggle.addEventListener('click', pomoToggleRun);
  pomoEls.reset.addEventListener('click', pomoResetCurrent);

  setInterval(pomodoroTick, 250);
  pomodoroTick();
}

function openPomodoro() {
  els.pomodoroOverlay.classList.add('open');
  renderPomodoro();
}

function closePomodoro() {
  els.pomodoroOverlay.classList.remove('open');
}

function pomoSelectMode(mode) {
  if (!POMODORO_MODES[mode]) return;
  pomodoro = {
    mode,
    running: false,
    endAt: null,
    remainingMs: pomoMinutes(mode) * 60000,
    completed: pomodoro.completed,
    durations: Object.assign({}, pomodoro.durations),
  };
  savePomodoroState();
  renderPomodoro();
}

function pomoToggleRun() {
  ensurePomoAudio();
  if (pomodoro.running) {
    pomodoro.remainingMs = Math.max(0, pomodoro.endAt - Date.now());
    pomodoro.running = false;
    pomodoro.endAt = null;
  } else {
    const rem = pomodoro.remainingMs > 0 ? pomodoro.remainingMs : pomoMinutes(pomodoro.mode) * 60000;
    pomodoro.remainingMs = rem;
    pomodoro.endAt = Date.now() + rem;
    pomodoro.running = true;
  }
  savePomodoroState();
  renderPomodoro();
}

function pomoResetCurrent() {
  pomodoro.running = false;
  pomodoro.endAt = null;
  pomodoro.remainingMs = pomoMinutes(pomodoro.mode) * 60000;
  savePomodoroState();
  renderPomodoro();
}

function pomoSetDuration(mode, mins) {
  if (!POMODORO_MODES[mode]) return;
  if (!isFinite(mins)) {
    syncDurationInputs();
    return;
  }
  mins = Math.min(180, Math.max(1, Math.round(mins)));
  pomodoro.durations = Object.assign({}, pomodoro.durations);
  pomodoro.durations[mode] = mins;
  if (pomodoro.mode === mode && !pomodoro.running) {
    pomodoro.remainingMs = mins * 60000;
  }
  savePomodoroState();
  syncDurationInputs();
  renderPomodoro();
}

function syncDurationInputs() {
  for (const [mode, input] of Object.entries(pomoEls.durationInputs)) {
    input.value = pomoMinutes(mode);
  }
}

function pomodoroAdvance() {
  const wasFocus = pomodoro.mode === 'focus';
  const completed = wasFocus ? pomodoro.completed + 1 : pomodoro.completed;
  const next = wasFocus
    ? (completed % POMODORO_CYCLE === 0 ? 'long' : 'short')
    : 'focus';
  pomoPlayChime();
  pomodoro = {
    mode: next,
    running: true,
    endAt: Date.now() + pomoMinutes(next) * 60000,
    remainingMs: 0,
    completed,
    durations: Object.assign({}, pomodoro.durations),
  };
  savePomodoroState();
}

function pomodoroTick() {
  pomodoro = loadPomodoroState();
  if (pomodoro.running && pomodoro.endAt - Date.now() <= 0) pomodoroAdvance();
  renderPomodoro();
}

function renderPomodoro() {
  if (!pomoEls) return;
  const def = POMODORO_MODES[pomodoro.mode];
  const total = pomoMinutes(pomodoro.mode) * 60000;
  const rem = Math.min(Math.max(pomoRemaining(), 0), total);
  const mmss = pomoFormat(rem);

  pomoEls.time.textContent = mmss;
  pomoEls.phase.textContent = def.label;
  pomoEls.fg.style.strokeDashoffset = (POMODORO_RING_CIRCUMFERENCE * (1 - rem / total)).toFixed(2);
  pomoEls.ring.classList.toggle('break', pomodoro.mode !== 'focus');
  pomoEls.toggle.textContent = pomodoro.running ? 'Pause' : (rem < total ? 'Resume' : 'Start');
  pomoEls.modes.forEach((b) => b.classList.toggle('active', b.dataset.mode === pomodoro.mode));
  pomoEls.hint.textContent =
    pomoMinutes('focus') + ' min focus · ' + pomoMinutes('short') + ' min short break · long break after every ' + POMODORO_CYCLE + ' sessions';

  const filled = pomodoro.completed % POMODORO_CYCLE;
  pomoEls.dots.forEach((d, i) => d.classList.toggle('done', i < filled));

  document.title = pomodoro.running ? mmss + ' · ' + def.label : 'New Tab';
  els.pomodoroBtn.classList.toggle('active', pomodoro.running);
  els.pomodoroBtn.title = pomodoro.running ? 'Pomodoro · ' + mmss + ' — open timer' : 'Pomodoro timer';
}

function ensurePomoAudio() {
  try {
    if (!pomoAudio) pomoAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (pomoAudio.state === 'suspended') pomoAudio.resume();
  } catch (e) {
    /* audio unavailable */
  }
}

function pomoPlayChime() {
  ensurePomoAudio();
  if (!pomoAudio) return;
  try {
    const t = pomoAudio.currentTime;
    [0, 0.3, 0.6].forEach((off) => {
      const osc = pomoAudio.createOscillator();
      const gain = pomoAudio.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t + off);
      gain.gain.exponentialRampToValueAtTime(0.2, t + off + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.25);
      osc.connect(gain).connect(pomoAudio.destination);
      osc.start(t + off);
      osc.stop(t + off + 0.27);
    });
  } catch (e) {
    /* ignore */
  }
}



/* ---------------- Quotes ---------------- */

function renderQuotes() {
  els.widgets.querySelectorAll('.quote').forEach((q) => q.remove());
  for (const quote of state.quotes) renderQuote(quote);
  const changed = layoutRow(state.quotes, (id) => els.widgets.querySelector('.quote[data-quote-id="' + id + '"]'), 0.58);
  if (changed) saveState();
}

function renderQuote(quote) {
  const el = document.createElement('div');
  el.className = 'quote' + (quote.collapsed ? ' collapsed' : '') + (quote.h || quote.hpct ? ' fixed' : '');
  el.dataset.quoteId = quote.id;
  el.style.left = clampPct(quote.x) + '%';
  el.style.top = clampPct(quote.y) + '%';
  if (quote.wpct != null) el.style.width = quote.wpct + 'vw';
  else if (quote.w) el.style.width = Math.max(240, quote.w) + 'px';
  if (quote.hpct != null) el.style.height = quote.hpct + 'vh';
  else if (quote.h) el.style.height = quote.h + 'px';

  el.innerHTML =
    '<div class="quote-header">' +
      '<button type="button" class="icon-btn quote-pin-btn" title="Pin">📌</button>' +
      '<span class="quote-mark" title="Quote">❝</span>' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn quote-collapse-btn" title="' + (quote.collapsed ? 'Expand' : 'Collapse') + '">' + (quote.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn quote-delete-btn" title="Delete quote">✕</button>' +
    '</div>' +
    '<div class="quote-text" contenteditable="true" spellcheck="false" data-placeholder="Write your quote…">' + htmlFromText(quote.text) + '</div>' +
    '<input class="quote-author" type="text" value="' + escapeHtml(quote.author || '') + '" placeholder="— Attribution (optional)" title="Author (optional)">' +
    '<div class="quote-resize" title="Drag to resize — double-click to reset"></div>';

  const textEl = el.querySelector('.quote-text');
  const authorEl = el.querySelector('.quote-author');
  if (quote.h || quote.hpct != null) textEl.style.overflowY = 'auto';

  textEl.addEventListener('input', () => {
    quote.text = textEl.innerHTML;
    saveState();
  });

  authorEl.addEventListener('input', () => {
    quote.author = authorEl.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.quote-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    quote.collapsed = !quote.collapsed;
    el.classList.toggle('collapsed', quote.collapsed);
    collapseBtn.textContent = quote.collapsed ? '＋' : '–';
    collapseBtn.title = quote.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.quote-pin-btn'), quote);

  el.querySelector('.quote-delete-btn').addEventListener('click', () => {
    state.quotes = state.quotes.filter((q) => q.id !== quote.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.quote-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    quote.w = Math.round(w);
    quote.h = Math.round(h);
    quote.wpct = round3((w / window.innerWidth) * 100);
    quote.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    textEl.style.height = '';
    textEl.style.overflowY = 'auto';
    saveState();
  }, {
    minW: Math.max(200, Math.round(window.innerWidth * 0.13)),
    minH: Math.max(80, Math.round(window.innerHeight * 0.12)),
    disabled: () => quote.pinned,
  });
  resizeHandle.addEventListener('dblclick', () => {
    delete quote.w;
    delete quote.h;
    delete quote.wpct;
    delete quote.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    textEl.style.overflowY = '';
    saveState();
  });

  makeDraggable(el, el, () => {
    quote.x = pct(el.style.left);
    quote.y = pct(el.style.top);
    saveState();
  }, { disabled: () => quote.pinned });

  els.widgets.appendChild(el);
}

function addQuote() {
  const d = QUOTE_DEFAULTS[Math.floor(Math.random() * QUOTE_DEFAULTS.length)];
  const quote = { id: uid(), text: d.text, author: d.author, collapsed: false, pinned: false };
  state.quotes.push(quote);
  saveState();
  renderQuotes();
}

function renderClock(clock) {
  const el = document.createElement('div');
  el.className = 'clock';
  el.dataset.clockId = clock.id;
  el.style.left = clampPct(clock.x) + '%';
  el.style.top = clampPct(clock.y) + '%';

  el.innerHTML =
    '<div class="clock-header">' +
      '<button type="button" class="icon-btn clock-pin-btn" title="Pin">📌</button>' +
      '<input class="clock-label" type="text" value="' + escapeHtml(clock.label || tzFriendly(clock.timezone)) + '" title="Clock name (drag to move)">' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn clock-delete-btn" title="Remove clock">✕</button>' +
    '</div>' +
    '<div class="clock-time" data-clock-time>--:--:--</div>' +
    '<div class="clock-date" data-clock-date></div>' +
    '<select class="tz-select" title="Change timezone">' + tzOptionsHtml(clock.timezone) + '</select>';

  const timeEl = el.querySelector('[data-clock-time]');
  const dateEl = el.querySelector('[data-clock-date]');
  clockEls.set(clock.id, { timeEl, dateEl });

  const p = clockParts(clock.timezone);
  timeEl.textContent = p.time;
  dateEl.textContent = p.date;

  el.querySelector('.clock-label').addEventListener('input', (e) => {
    clock.label = e.target.value;
    saveState();
  });

  el.querySelector('.tz-select').addEventListener('change', (e) => {
    clock.timezone = e.target.value;
    if (!clock.label || clock.label === tzFriendly(clock.timezone)) clock.label = tzFriendly(e.target.value);
    saveState();
    renderClocks();
  });

  el.querySelector('.clock-delete-btn').addEventListener('click', () => {
    state.clocks = state.clocks.filter((c) => c.id !== clock.id);
    clockEls.delete(clock.id);
    el.remove();
    saveState(true);
  });

  bindPin(el, el.querySelector('.clock-pin-btn'), clock);

  makeDraggable(el, el, () => {
    clock.x = pct(el.style.left);
    clock.y = pct(el.style.top);
    saveState();
  }, { disabled: () => clock.pinned });

  els.widgets.appendChild(el);
}

/* ---------------- Notes ---------------- */

function renderNotes() {
  els.widgets.querySelectorAll('.note').forEach((n) => n.remove());
  for (const note of state.notes) renderNote(note);
}

function autosize(ta) {
  const minH = Math.max(64, Math.min(160, Math.round(window.innerHeight * 0.11)));
  ta.style.height = 'auto';
  ta.style.height = Math.max(ta.scrollHeight, minH) + 'px';
}

function renderNote(note) {
  const el = document.createElement('div');
  el.className = 'note color-' + note.color + (note.collapsed ? ' collapsed' : '');
  el.dataset.noteId = note.id;
  el.style.left = clampPct(note.x) + '%';
  el.style.top = clampPct(note.y) + '%';
  if (note.wpct != null) el.style.width = note.wpct + 'vw';
  else if (note.w) el.style.width = Math.max(180, note.w) + 'px';
  if (note.hpct != null) el.style.height = note.hpct + 'vh';
  else if (note.h) el.style.height = note.h + 'px';

  el.innerHTML =
    '<div class="note-header">' +
      '<button type="button" class="icon-btn note-color-btn" title="Change color">🎨</button>' +
      '<button type="button" class="icon-btn note-pin-btn" title="Pin">📌</button>' +
      '<input class="note-title" type="text" value="' + escapeHtml(note.title || '') + '" placeholder="Note title">' +
      '<button type="button" class="icon-btn note-collapse-btn" title="' + (note.collapsed ? 'Expand' : 'Collapse') + '">' + (note.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn note-delete-btn" title="Delete note">✕</button>' +
    '</div>' +
    '<div class="note-fmt">' +
      '<button type="button" class="fmt-btn" data-fmt="bold" title="Bold (Ctrl+B)"><b>B</b></button>' +
      '<button type="button" class="fmt-btn" data-fmt="italic" title="Italic (Ctrl+I)"><i>I</i></button>' +
      '<button type="button" class="fmt-btn" data-fmt="underline" title="Underline (Ctrl+U)"><u>U</u></button>' +
      '<button type="button" class="fmt-btn" data-fmt="strikeThrough" title="Strikethrough"><s>S</s></button>' +
    '</div>' +
    '<div class="note-text" contenteditable="true" spellcheck="false" data-placeholder="Write something…"></div>' +
    '<div class="note-resize" title="Drag to resize — double-click to reset"></div>';

  const ta = el.querySelector('.note-text');
  ta.innerHTML = htmlFromText(note.text);
  if (note.h || note.hpct != null) ta.style.overflowY = 'auto';
  else autosize(ta);

  el.querySelector('.note-title').addEventListener('input', (e) => {
    note.title = e.target.value;
    saveState();
  });

  ta.addEventListener('input', () => {
    note.text = ta.innerHTML;
    if (!note.h && note.hpct == null) autosize(ta);
    saveState();
  });

  const fmtBar = el.querySelector('.note-fmt');
  fmtBar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.fmt-btn')) e.preventDefault();
  });
  fmtBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.fmt-btn');
    if (!btn) return;
    ta.focus();
    document.execCommand(btn.dataset.fmt, false);
    note.text = ta.innerHTML;
    if (!note.h && note.hpct == null) autosize(ta);
    saveState();
  });

  el.querySelector('.note-color-btn').addEventListener('click', () => {
    const i = NOTE_COLORS.indexOf(note.color);
    note.color = NOTE_COLORS[(i + 1) % NOTE_COLORS.length];
    el.className = el.className.replace(/color-\w+/, 'color-' + note.color);
    saveState();
  });

  const collapseBtn = el.querySelector('.note-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    note.collapsed = !note.collapsed;
    el.classList.toggle('collapsed', note.collapsed);
    collapseBtn.textContent = note.collapsed ? '＋' : '–';
    collapseBtn.title = note.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.note-pin-btn'), note);

  el.querySelector('.note-delete-btn').addEventListener('click', () => {
    state.notes = state.notes.filter((n) => n.id !== note.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.note-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    note.w = Math.round(w);
    note.h = Math.round(h);
    note.wpct = round3((w / window.innerWidth) * 100);
    note.hpct = round3((h / window.innerHeight) * 100);
    ta.style.height = '';
    ta.style.overflowY = 'auto';
    saveState();
  }, { disabled: () => note.pinned });
  resizeHandle.addEventListener('dblclick', () => {
    delete note.w;
    delete note.h;
    delete note.wpct;
    delete note.hpct;
    el.style.width = '';
    el.style.height = '';
    ta.style.overflowY = '';
    autosize(ta);
    saveState();
  });

  makeDraggable(el, el.querySelector('.note-header'), () => {
    note.x = pct(el.style.left);
    note.y = pct(el.style.top);
    saveState();
  }, { disabled: () => note.pinned });

  els.widgets.appendChild(el);
}

/* ---------------- Drag ---------------- */

function bindPin(el, btn, obj) {
  const apply = () => {
    el.classList.toggle('pinned', !!obj.pinned);
    btn.classList.toggle('pinned', !!obj.pinned);
    btn.title = obj.pinned ? 'Unpin' : 'Pin';
  };
  btn.addEventListener('click', () => {
    obj.pinned = !obj.pinned;
    apply();
    saveState();
  });
  apply();
  return apply;
}

function makeDraggable(el, handle, onDrop, opts) {
  const disabled = opts && typeof opts.disabled === 'function' ? opts.disabled : null;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let rect = null;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (disabled && disabled()) return;
    if (e.target.closest('button, select, input, textarea, [contenteditable]')) return;
    dragging = true;
    rect = el.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    el.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const left = Math.min(Math.max(rect.left + dx, 0), maxLeft);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const top = Math.min(Math.max(rect.top + dy, 0), maxTop);
    el.style.left = (left / window.innerWidth) * 100 + '%';
    el.style.top = (top / window.innerHeight) * 100 + '%';
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if (onDrop) onDrop();
  };

  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

function makeResizable(el, handle, onResize, opts) {
  const minW = (opts && opts.minW) != null ? opts.minW : Math.max(140, Math.round(window.innerWidth * 0.1));
  const minH = (opts && opts.minH) != null ? opts.minH : Math.max(80, Math.round(window.innerHeight * 0.12));
  const maxW = (opts && opts.maxW) != null ? opts.maxW : Math.round(window.innerWidth * 0.85);
  const disabled = opts && typeof opts.disabled === 'function' ? opts.disabled : null;
  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (disabled && disabled()) return;
    resizing = true;
    const r = el.getBoundingClientRect();
    startW = r.width;
    startH = r.height;
    startX = e.clientX;
    startY = e.clientY;
    el.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    const w = Math.min(Math.max(startW + (e.clientX - startX), minW), maxW);
    const h = Math.min(Math.max(startH + (e.clientY - startY), minH), window.innerHeight - 60);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    if (onResize) onResize(w, h);
  });

  const end = () => {
    if (!resizing) return;
    resizing = false;
    el.classList.remove('dragging');
  };

  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

/* ---------------- Layout ---------------- */

const LAYOUT_KINDS = {
  note:  { selector: '.note',  idAttr: 'noteId',  minW: 180 },
  clock: { selector: '.clock', idAttr: 'clockId', minW: 150 },
  todo:  { selector: '.todo',  idAttr: 'todoId',  minW: 200 },
  quote: { selector: '.quote', idAttr: 'quoteId', minW: 240 },
  routine: { selector: '.routine', idAttr: 'routineId', minW: 240 },
  video: { selector: '.video', idAttr: 'videoId', minW: 240 },
};

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function captureLayout() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const widgets = [];

  for (const [kind, spec] of Object.entries(LAYOUT_KINDS)) {
    els.widgets.querySelectorAll(spec.selector).forEach((el) => {
      const r = el.getBoundingClientRect();
      const entry = {
        kind: kind,
        id: el.dataset[spec.idAttr],
        x: round3(pct(el.style.left)),
        y: round3(pct(el.style.top)),
      };
      if (el.style.width) {
        entry.fixed = true;
        entry.w = round3((r.width / vw) * 100);
        entry.h = round3((r.height / vh) * 100);
      }
      widgets.push(entry);
    });
  }

  const sr = els.searchForm.getBoundingClientRect();
  widgets.push({
    kind: 'search',
    x: round3(pct(els.searchForm.style.left)),
    y: round3(pct(els.searchForm.style.top)),
    w: round3((sr.width / vw) * 100),
    h: round3((sr.height / vh) * 100),
  });

  const layout = {
    version: 1,
    savedAt: Date.now(),
    viewport: { w: vw, h: vh },
    widgets: widgets,
  };
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  return layout;
}

function applyLayout(layout) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (const entry of layout.widgets || []) {
    if (entry.kind === 'search') {
      state.searchPos.x = clampPct(entry.x);
      state.searchPos.y = clampPct(entry.y);
      state.searchPos.centered = false;
      continue;
    }
    const spec = LAYOUT_KINDS[entry.kind];
    if (!spec) continue;
    const arr = state[entry.kind + 's'];
    const obj = Array.isArray(arr) ? arr.find((i) => i && i.id === entry.id) : null;
    if (!obj) continue;
    obj.x = clampPct(entry.x);
    obj.y = clampPct(entry.y);
    if (entry.fixed && entry.w != null && entry.h != null) {
      obj.wpct = round3(Math.max((spec.minW / vw) * 100, entry.w));
      obj.hpct = round3(Math.max((60 / vh) * 100, entry.h));
      obj.w = Math.max(spec.minW, Math.round((entry.w / 100) * vw));
      obj.h = Math.max(60, Math.round((entry.h / 100) * vh));
    }
  }
}

function applySavedLayout() {
  let raw = null;
  try {
    raw = localStorage.getItem(LAYOUT_KEY);
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  let layout = null;
  try {
    layout = JSON.parse(raw);
  } catch (e) {
    return false;
  }
  if (!layout || layout.version !== 1 || !Array.isArray(layout.widgets)) return false;
  const before = stateFingerprint(state);
  applyLayout(layout);
  const changed = stateFingerprint(state) !== before;
  if (changed) saveState();
  return changed;
}

function refreshLayout() {
  fitAllWidgets();
}

/* ---------------- Hero / ticker ---------------- */

function updateAllClocks() {
  for (const [id, clockEl] of clockEls) {
    const clock = state.clocks.find((c) => c.id === id);
    const p = clockParts(clock ? clock.timezone : 'UTC');
    clockEl.timeEl.textContent = p.time;
    clockEl.dateEl.textContent = p.date;
  }
}

/* ---------------- Actions ---------------- */

function addNote() {
  const n = state.notes.length;
  const note = {
    id: uid(),
    text: '',
    color: state.settings.defaultNoteColor,
    collapsed: false,
    x: 6 + ((n * 2) % 22),
    y: 20 + ((n * 7) % 46),
  };
  state.notes.push(note);
  saveState();
  renderNote(note);
  const ta = els.widgets.querySelector('[data-note-id="' + note.id + '"] .note-text');
  if (ta) ta.focus();
}

function addClock() {
  const clock = {
    id: uid(),
    timezone: 'UTC',
    label: 'UTC',
  };
  state.clocks.push(clock);
  saveState();
  renderClocks();
}

/* ---------------- Search ---------------- */

function bindSearch() {
  els.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = els.searchInput.value.trim();
    if (!q) return;
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    if (state.settings.searchMode === 'currentTab') {
      window.location.href = url;
    } else {
      chrome.tabs.create({ url });
    }
  });
}

/* ---------------- Settings ---------------- */

function applyGlobalFont() {
  const f = FONTS[state.settings.font] || FONTS.default;
  document.documentElement.style.setProperty('--ui-font', f.stack);
}

function applySearchPos() {
  const p = state.searchPos || { x: 50, y: 3.2 };
  let x = Number(p.x);
  if (p.centered && isFinite(x)) {
    const w = Math.min(els.searchForm.offsetWidth, window.innerWidth);
    x = x - (w / window.innerWidth) * 50;
  }
  els.searchForm.style.left = (isFinite(x) ? x : 50) + '%';
  els.searchForm.style.top = (isFinite(Number(p.y)) ? Number(p.y) : 3.2) + '%';
  els.searchForm.classList.toggle('pinned', !!state.searchPinned);
  els.searchPinBtn.classList.toggle('pinned', !!state.searchPinned);
  els.searchPinBtn.title = state.searchPinned ? 'Unpin position' : 'Pin position';
}

function bindSettings() {
  els.fontInput.addEventListener('change', (e) => {
    state.settings.font = e.target.value;
    applyGlobalFont();
    saveState();
  });

  els.searchModeRadios.forEach((r) => {
    r.addEventListener('change', () => {
      if (r.checked) {
        state.settings.searchMode = r.value;
        saveState();
      }
    });
  });

  els.cycleInput.addEventListener('change', (e) => {
    state.settings.cycleMinutes = Number(e.target.value);
    saveState();
    restartCycleTimer();
  });

  els.exportBtn.addEventListener('click', exportData);
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });
  els.resetBtn.addEventListener('click', resetData);

  els.saveLayoutBtn.addEventListener('click', () => {
    captureLayout();
    const btn = els.saveLayoutBtn;
    const label = btn.textContent;
    btn.textContent = 'Saved ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = label;
      btn.disabled = false;
    }, 1200);
  });
}

function syncSettingsUI() {
  els.fontInput.value = state.settings.font || 'default';
  els.searchModeRadios.forEach((r) => {
    r.checked = state.settings.searchMode === r.value;
  });
  els.cycleInput.value = String(state.settings.cycleMinutes || 0);
}

function bindUi() {
  els.addNoteBtn.addEventListener('click', addNote);
  els.addClockBtn.addEventListener('click', addClock);
  els.addTodoBtn.addEventListener('click', addTodo);
  els.addRoutineBtn.addEventListener('click', addRoutine);
  els.addQuoteBtn.addEventListener('click', addQuote);
  els.cycleWallpaperBtn.addEventListener('click', nextWallpaper);
  els.settingsBtn.addEventListener('click', () => els.settingsOverlay.classList.add('open'));
  els.closeSettingsBtn.addEventListener('click', () => els.settingsOverlay.classList.remove('open'));
  els.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === els.settingsOverlay) els.settingsOverlay.classList.remove('open');
  });

  els.searchPinBtn.addEventListener('click', () => {
    state.searchPinned = !state.searchPinned;
    applySearchPos();
    saveState();
  });

  makeDraggable(els.searchForm, els.searchForm, () => {
    state.searchPos = {
      x: pct(els.searchForm.style.left),
      y: pct(els.searchForm.style.top),
      centered: false,
    };
    saveState();
  }, { disabled: () => state.searchPinned });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      els.settingsOverlay.classList.remove('open');
      els.pomodoroOverlay.classList.remove('open');
      closeVideoPlayer();
      closeMusicOverlay();
      return;
    }
    const tag = document.activeElement && document.activeElement.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (els.videoOverlay.classList.contains('open') && !typing) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepVideo(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); stepVideo(1); }
      return;
    }
    if (e.key === '/' && !typing) {
      e.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
    }
  });

  window.addEventListener('resize', () => {
    if (layoutResizeTimer) clearTimeout(layoutResizeTimer);
    layoutResizeTimer = setTimeout(refreshLayout, 250);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingSave();
    else flushPendingExternal();
  });
  window.addEventListener('pagehide', flushPendingSave);
  window.addEventListener('focus', flushPendingExternal);
  document.addEventListener('focusout', (e) => {
    const next = e.relatedTarget;
    if (next && next.closest && next.closest('.note, .todo, .quote, .clock, .routine')) return;
    flushPendingExternal();
  });
  document.addEventListener('pointerup', flushPendingExternal);
}

/* ---------------- Data ---------------- */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dashboard-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = mergeState(JSON.parse(reader.result));
      saveState(true);
      renderEverything();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (!confirm('Reset the dashboard to defaults? All notes and clocks will be removed.')) return;
  try {
    localStorage.removeItem(LAYOUT_KEY);
  } catch (e) {
    /* ignore */
  }
  state = freshState();
  saveState(true);
  renderEverything();
}

/* ---------------- Render ---------------- */

function renderEverything() {
  applyWallpaper(wallpaperById(state.wallpaper.id));
  applyGlobalFont();
  applySearchPos();
  renderNotes();
  renderClocks();
  renderTodos();
  renderRoutines();
  renderQuotes();
  renderMusic();
  syncSettingsUI();
  restartCycleTimer();
  updateAllClocks();
  fitAllWidgets();
  renderedPrints = collectionPrints(state);
}

let renderedPrints = null;

function collectionPrints(st) {
  return {
    wallpaper: JSON.stringify(st.wallpaper),
    settings: JSON.stringify(st.settings),
    search: JSON.stringify([st.searchPos, st.searchPinned]),
    notes: JSON.stringify(st.notes),
    clocks: JSON.stringify(st.clocks),
    todos: JSON.stringify(st.todos),
    routines: JSON.stringify(st.routines),
    quotes: JSON.stringify(st.quotes),
    music: JSON.stringify(st.music),
  };
}

function renderChangedCollections() {
  const prev = renderedPrints || {};
  const next = collectionPrints(state);
  renderedPrints = next;
  if (prev.wallpaper !== next.wallpaper || prev.settings !== next.settings) {
    applyWallpaper(wallpaperById(state.wallpaper.id));
    applyGlobalFont();
    restartCycleTimer();
  }
  if (prev.search !== next.search) applySearchPos();
  if (prev.notes !== next.notes) renderNotes();
  if (prev.clocks !== next.clocks) renderClocks();
  if (prev.todos !== next.todos) renderTodos();
  if (prev.routines !== next.routines) renderRoutines();
  if (prev.quotes !== next.quotes) renderQuotes();
  if (prev.music !== next.music) renderMusic();
  syncSettingsUI();
  updateAllClocks();
  fitAllWidgets();
}

/* ---------------- Init ---------------- */

(async function init() {
  await buildWallpapers();
  await detectVideos();
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  state = mergeState(stored[STORAGE_KEY]);
  if (!WALLPAPERS.some((w) => w.id === state.wallpaper.id)) state.wallpaper.id = WALLPAPERS[0].id;

  els.fontInput.innerHTML = Object.entries(FONTS)
    .map(([k, f]) => '<option value="' + k + '">' + f.label + '</option>')
    .join('');

  bindSearch();
  bindSettings();
  bindUi();
  initPomodoro();
  initVideoPlayer();
  bindMusic();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const ch = changes[STORAGE_KEY];
    if (!ch || !ch.newValue) return;
    queueExternalApply(ch.newValue);
  });

  applySavedLayout();
  renderEverything();
  setInterval(updateAllClocks, 1000);
  document.body.classList.add('ready');
})();
