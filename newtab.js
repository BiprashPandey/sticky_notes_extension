'use strict';

const STORAGE_KEY = 'dashboardStateV1';

const FONTS = {
  default: { label: 'Sans-Serif', stack: "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif" },
  serif:   { label: 'Serif',      stack: "Georgia, 'Times New Roman', serif" },
  mono:    { label: 'Monospace',  stack: "'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace" },
  hand:    { label: 'Handwriting', stack: "'Segoe Print', 'Comic Sans MS', 'Bradley Hand', cursive" },
};

const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'purple', 'orange'];

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
];

const GRADIENT_WALLPAPERS = [
  { id: 'g1', name: 'Midnight',     type: 'gradient', src: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { id: 'g2', name: 'Sunset',       type: 'gradient', src: 'linear-gradient(135deg, #f83600, #f9d423)' },
  { id: 'g3', name: 'Emerald',      type: 'gradient', src: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'g4', name: 'Violet Storm', type: 'gradient', src: 'linear-gradient(135deg, #6a11cb, #2575fc)' },
  { id: 'g5', name: 'Crimson',      type: 'gradient', src: 'linear-gradient(135deg, #fc466b, #3f5efb)' },
  { id: 'g6', name: 'Graphite',     type: 'gradient', src: 'linear-gradient(160deg, #1f2937, #374151)' },
];

const LOCAL_SLOTS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

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
let allTz = null;
const clockFormatters = new Map();
const clockEls = new Map();

const heroTimeFmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
const heroDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const els = {
  bgLayer: document.getElementById('bgLayer'),
  widgets: document.getElementById('widgets'),
  heroClock: document.getElementById('heroClock'),
  heroGreet: document.getElementById('heroGreet'),
  heroDate: document.getElementById('heroDate'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  addNoteBtn: document.getElementById('addNoteBtn'),
  addClockBtn: document.getElementById('addClockBtn'),
  cycleWallpaperBtn: document.getElementById('cycleWallpaperBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  nameInput: document.getElementById('nameInput'),
  searchModeRadios: document.querySelectorAll('input[name="searchMode"]'),
  noteFontInput: document.getElementById('noteFontInput'),
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

function clampPct(v) {
  const n = Number(v);
  return isFinite(n) ? Math.min(95, Math.max(0, n)) : 0;
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
      name: '',
      searchMode: 'currentTab',
      defaultNoteFont: 'default',
      defaultNoteColor: 'yellow',
      cycleMinutes: 0,
    },
    wallpaper: { id: null },
    notes: [
      {
        id: uid(),
        text: 'Welcome to your dashboard!\n\nDrag this note by its header to move it around.\nChange its font, color, collapse or delete it from the header.\n\nTip: press / to search Google.',
        font: 'default',
        color: 'yellow',
        collapsed: false,
        x: 5,
        y: 18,
      },
    ],
    clocks: [
      { id: uid(), timezone: 'America/New_York', label: 'New York', x: 66, y: 16 },
      { id: uid(), timezone: 'Asia/Kathmandu', label: 'Kathmandu', x: 66, y: 44 },
    ],
  };
}

function mergeState(stored) {
  const base = freshState();
  const s = stored && typeof stored === 'object' ? stored : {};
  return {
    saveToken: Number(s.saveToken) || 0,
    settings: Object.assign({}, base.settings, s.settings || {}),
    wallpaper: Object.assign({}, base.wallpaper, s.wallpaper || {}),
    notes: Array.isArray(s.notes) ? s.notes.filter((n) => n && typeof n === 'object') : [],
    clocks: Array.isArray(s.clocks) ? s.clocks.filter((c) => c && typeof c === 'object') : [],
  };
}

function saveState(immediate) {
  state.saveToken = (state.saveToken || 0) + 1;
  if (saveTimer) clearTimeout(saveTimer);
  const doSave = () => chrome.storage.local.set({ [STORAGE_KEY]: JSON.parse(JSON.stringify(state)) });
  if (immediate) doSave();
  else saveTimer = setTimeout(doSave, 250);
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
  WALLPAPERS = [...local, ...REMOTE_WALLPAPERS, ...GRADIENT_WALLPAPERS];
}

function wallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0];
}

function applyWallpaper(w) {
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
  els.wpGallery.innerHTML = '';
  for (const w of WALLPAPERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wp-thumb' + (w.id === state.wallpaper.id ? ' selected' : '');
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

function renderClocks() {
  els.widgets.querySelectorAll('.clock').forEach((c) => c.remove());
  clockEls.clear();
  for (const clock of state.clocks) renderClock(clock);
}

function renderClock(clock) {
  const el = document.createElement('div');
  el.className = 'clock';
  el.style.left = clampPct(clock.x) + '%';
  el.style.top = clampPct(clock.y) + '%';

  el.innerHTML =
    '<div class="clock-header">' +
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
    saveState();
  });

  makeDraggable(el, el.querySelector('.clock-header'), () => {
    clock.x = pct(el.style.left);
    clock.y = pct(el.style.top);
    saveState();
  });

  els.widgets.appendChild(el);
}

/* ---------------- Notes ---------------- */

function renderNotes() {
  els.widgets.querySelectorAll('.note').forEach((n) => n.remove());
  for (const note of state.notes) renderNote(note);
}

function autosize(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.max(ta.scrollHeight, 88) + 'px';
}

function renderNote(note) {
  const el = document.createElement('div');
  el.className = 'note color-' + note.color + (note.collapsed ? ' collapsed' : '');
  el.dataset.noteId = note.id;
  el.style.left = clampPct(note.x) + '%';
  el.style.top = clampPct(note.y) + '%';
  el.style.fontFamily = (FONTS[note.font] || FONTS.default).stack;

  const fontOptions = Object.entries(FONTS)
    .map(([k, f]) => '<option value="' + k + '"' + (k === (note.font || 'default') ? ' selected' : '') + '>' + f.label + '</option>')
    .join('');

  el.innerHTML =
    '<div class="note-header">' +
      '<select class="note-font-select" title="Note font">' + fontOptions + '</select>' +
      '<button type="button" class="icon-btn note-color-btn" title="Change color">🎨</button>' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn note-collapse-btn" title="' + (note.collapsed ? 'Expand' : 'Collapse') + '">' + (note.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn note-delete-btn" title="Delete note">✕</button>' +
    '</div>' +
    '<textarea class="note-text" placeholder="Write something…">' + escapeHtml(note.text) + '</textarea>';

  const ta = el.querySelector('.note-text');
  autosize(ta);

  ta.addEventListener('input', () => {
    note.text = ta.value;
    autosize(ta);
    saveState();
  });

  el.querySelector('.note-font-select').addEventListener('change', (e) => {
    note.font = e.target.value;
    el.style.fontFamily = FONTS[note.font].stack;
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

  el.querySelector('.note-delete-btn').addEventListener('click', () => {
    state.notes = state.notes.filter((n) => n.id !== note.id);
    el.remove();
    saveState();
  });

  makeDraggable(el, el.querySelector('.note-header'), () => {
    note.x = pct(el.style.left);
    note.y = pct(el.style.top);
    saveState();
  });

  els.widgets.appendChild(el);
}

/* ---------------- Drag ---------------- */

function makeDraggable(el, handle, onDrop) {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let rect = null;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, select, input, textarea')) return;
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
    const maxLeft = window.innerWidth - Math.min(rect.width, window.innerWidth * 0.9);
    const left = Math.min(Math.max(rect.left + dx, 0), maxLeft);
    const top = Math.min(Math.max(rect.top + dy, 0), window.innerHeight - 30);
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

/* ---------------- Hero / ticker ---------------- */

function updateGreeting() {
  const h = new Date().getHours();
  const part = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
  const name = (state.settings.name || '').trim();
  els.heroGreet.textContent = name ? part + ', ' + name : part;
}

function updateAllClocks() {
  const now = new Date();
  els.heroClock.textContent = heroTimeFmt.format(now);
  els.heroDate.textContent = heroDateFmt.format(now);
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
    font: state.settings.defaultNoteFont,
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
  const n = state.clocks.length;
  const clock = {
    id: uid(),
    timezone: 'UTC',
    label: 'UTC',
    x: 60 + ((n * 4) % 30),
    y: 16 + ((n * 10) % 40),
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

function bindSettings() {
  els.nameInput.addEventListener('input', () => {
    state.settings.name = els.nameInput.value;
    updateGreeting();
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

  els.noteFontInput.addEventListener('change', (e) => {
    state.settings.defaultNoteFont = e.target.value;
    saveState();
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
}

function syncSettingsUI() {
  els.nameInput.value = state.settings.name || '';
  els.searchModeRadios.forEach((r) => {
    r.checked = state.settings.searchMode === r.value;
  });
  els.noteFontInput.value = state.settings.defaultNoteFont || 'default';
  els.cycleInput.value = String(state.settings.cycleMinutes || 0);
}

function bindUi() {
  els.addNoteBtn.addEventListener('click', addNote);
  els.addClockBtn.addEventListener('click', addClock);
  els.cycleWallpaperBtn.addEventListener('click', nextWallpaper);
  els.settingsBtn.addEventListener('click', () => els.settingsOverlay.classList.add('open'));
  els.closeSettingsBtn.addEventListener('click', () => els.settingsOverlay.classList.remove('open'));
  els.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === els.settingsOverlay) els.settingsOverlay.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') els.settingsOverlay.classList.remove('open');
    const tag = document.activeElement && document.activeElement.tagName;
    if (e.key === '/' && !(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')) {
      e.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
    }
  });
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
  state = freshState();
  saveState(true);
  renderEverything();
}

/* ---------------- Render ---------------- */

function renderEverything() {
  applyWallpaper(wallpaperById(state.wallpaper.id));
  renderNotes();
  renderClocks();
  syncSettingsUI();
  restartCycleTimer();
  updateAllClocks();
  updateGreeting();
}

/* ---------------- Init ---------------- */

(async function init() {
  await buildWallpapers();
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  state = mergeState(stored[STORAGE_KEY]);
  if (!WALLPAPERS.some((w) => w.id === state.wallpaper.id)) state.wallpaper.id = WALLPAPERS[0].id;

  els.noteFontInput.innerHTML = Object.entries(FONTS)
    .map(([k, f]) => '<option value="' + k + '">' + f.label + '</option>')
    .join('');

  bindSearch();
  bindSettings();
  bindUi();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const ch = changes[STORAGE_KEY];
    if (!ch || !ch.newValue) return;
    if (ch.newValue.saveToken === state.saveToken) return;
    state = mergeState(ch.newValue);
    renderEverything();
  });

  renderEverything();
  setInterval(updateAllClocks, 1000);
  document.body.classList.add('ready');
})();
