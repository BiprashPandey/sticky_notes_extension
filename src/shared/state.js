import {
  LAYOUT_MODEL_VERSION,
  DEFAULT_LAYOUT_ID,
  LAYOUT_KIND_KEYS,
  BUILT_IN_TEMPLATES,
  seedLayoutEntries,
} from '../modules/layout-templates.js';

export const STORAGE_KEY = 'dashboardStateV1';

export let state = null;

export function setState(next) {
  state = next;
}

function liveFromCollections(collections) {
  const c = collections && typeof collections === 'object' ? collections : {};
  const out = {};
  for (const key of LAYOUT_KIND_KEYS) {
    // Deep clone: live widgets must not alias the entry's stored copies,
    // otherwise "discard on switch" could not drop unsaved edits.
    out[key] = Array.isArray(c[key])
      ? c[key].filter((w) => w && typeof w === 'object').map((w) => JSON.parse(JSON.stringify(w)))
      : [];
  }
  return out;
}

export function freshState() {
  const layouts = seedLayoutEntries();
  const home = layouts.find((l) => l.id === DEFAULT_LAYOUT_ID);
  return {
    saveToken: 0,
    layoutModel: LAYOUT_MODEL_VERSION,
    settings: {
      font: 'default',
      defaultNoteColor: 'yellow',
      cycleMinutes: 0,
    },
    wallpaper: { id: 'l01' },
    layout: null,
    layouts: layouts,
    activeLayoutId: DEFAULT_LAYOUT_ID,
    ...liveFromCollections(home.widgets),
    music: { playlists: [] },
    focus: { enabled: true, sites: [], minutes: 5, playMixes: true },
  };
}

export function clampMinutes(m) {
  const n = Number(m);
  return isFinite(n) && n >= 1 ? Math.min(180, Math.round(n)) : 5;
}

function sanitizeLayoutEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  const entry = {
    id: raw.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 40) : 'Untitled',
    desc: typeof raw.desc === 'string' ? raw.desc.slice(0, 140) : '',
    builtIn: raw.builtIn === true,
    default: raw.default === true,
    placements: raw.placements && typeof raw.placements === 'object' ? raw.placements : {},
    widgets: null,
  };
  if (raw.widgets && typeof raw.widgets === 'object') {
    const w = {};
    for (const key of LAYOUT_KIND_KEYS) {
      w[key] = Array.isArray(raw.widgets[key])
        ? raw.widgets[key].filter((x) => x && typeof x === 'object')
        : [];
    }
    entry.widgets = w;
  }
  if (raw.savedAt != null && isFinite(Number(raw.savedAt))) entry.savedAt = Number(raw.savedAt);
  if (raw.rev != null && isFinite(Number(raw.rev))) entry.rev = Number(raw.rev);
  // A redesigned built-in template resets its stored widgets so the new
  // slots rebuild on next switch.
  if (entry.builtIn) {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === entry.id);
    const templateRev = template && template.rev != null ? template.rev : 1;
    const entryRev = entry.rev != null ? entry.rev : 1;
    if (template && entryRev !== templateRev) {
      entry.widgets = null;
      entry.rev = templateRev;
    }
  }
  return entry;
}

export function mergeState(stored) {
  const base = freshState();
  const s = stored && typeof stored === 'object' ? stored : {};
  const migrated = s.layoutModel !== LAYOUT_MODEL_VERSION;
  // Model v2: each layout entry owns its widgets (wallpaper metaphor).
  // Older stored data keeps only appearance + music/focus; live widgets
  // always start fresh from the Default starter set (explicit user choice).
  let layouts;
  if (!migrated && Array.isArray(s.layouts) && s.layouts.length) {
    layouts = s.layouts.map(sanitizeLayoutEntry).filter(Boolean);
    if (!layouts.length) {
      layouts = seedLayoutEntries();
    } else {
      // Carry over pre-v2 geometry-only presets as unopened dashboards.
      for (const l of layouts) {
        if (!l.widgets && !(l.placements && Object.keys(l.placements).length)) l.placements = {};
      }
      if (!layouts.some((l) => l.id === DEFAULT_LAYOUT_ID)) {
        layouts.unshift(seedLayoutEntries()[0]);
      }
    }
  } else {
    layouts = seedLayoutEntries();
    // Carry pre-v2 geometry-only presets over as unopened dashboards.
    if (Array.isArray(s.layouts)) {
      for (const raw of s.layouts) {
        const conv = sanitizeLayoutEntry(raw);
        if (conv && !layouts.some((l) => l.id === conv.id)) {
          conv.widgets = null;
          layouts.push(conv);
        }
      }
    }
  }
  const home = layouts.find((l) => l.id === DEFAULT_LAYOUT_ID) || layouts[0];
  let activeLayoutId = typeof s.activeLayoutId === 'string' ? s.activeLayoutId : home.id;
  if (!layouts.some((l) => l.id === activeLayoutId)) activeLayoutId = home.id;
  const active = layouts.find((l) => l.id === activeLayoutId) || home;
  // Live collections are authoritative for the active dashboard; the entry
  // copy is synced back on save/switch. Null widgets (unopened layout)
  // initialize on load via ensureActiveEntryInitialized().
  const live = liveFromCollections(active.widgets);
  return {
    saveToken: Number(s.saveToken) || 0,
    layoutModel: LAYOUT_MODEL_VERSION,
    settings: Object.assign({}, base.settings, s.settings || {}, {
      font: (s.settings && (s.settings.font || s.settings.defaultNoteFont)) || base.settings.font,
    }),
    wallpaper: Object.assign({}, base.wallpaper, s.wallpaper || {}),
    layout: null,
    layouts: layouts,
    activeLayoutId: activeLayoutId,
    ...live,
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