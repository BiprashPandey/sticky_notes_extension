import { uid } from '../shared/utils.js';

// Leaf module: layout templates, starter widgets, and dashboard seeding.
// Imported by state.js (fresh defaults + migration) and layout-presets.js.
// Must NOT import state.js, quotes.js, or anything that imports them.

export const LAYOUT_MODEL_VERSION = 2;

export const DEFAULT_LAYOUT_ID = 'layout-default';

// Width / height of the calendar widget. Layout arranges must keep this
// ratio instead of blindly applying template height values.
export const CALENDAR_ASPECT = 1.15;

export const LAYOUT_KIND_KEYS = ['notes', 'clocks', 'todos', 'quotes', 'routines', 'calendars', 'videos'];

export const PRESET_KINDS = ['note', 'clock', 'todo', 'quote', 'routine', 'calendar', 'video'];

export const BUILT_IN_TEMPLATES = [
  {
    id: 'preset-classic',
    name: 'Everyday Split',
    desc: 'Notes left, clocks + to-dos right, quote along the bottom.',
    builtIn: true,
    placements: {
      note: [{ x: 4, y: 16, wpct: 16 }, { x: 4, y: 55, wpct: 16 }],
      clock: [{ x: 74, y: 8, wpct: 10 }, { x: 86, y: 8, wpct: 10 }],
      todo: [{ x: 74, y: 30, wpct: 18, hpct: 38 }],
      quote: [{ x: 28, y: 76, wpct: 32 }],
      routine: [{ x: 48, y: 28, wpct: 20, hpct: 40 }],
      calendar: [{ x: 70, y: 70, wpct: 22, hpct: 24 }],
      video: [{ x: 28, y: 28, wpct: 22, hpct: 32 }],
    },
  },
  {
    id: 'preset-focus',
    name: 'Deep Focus',
    desc: 'Clock and note on the left, to-dos centred, note and calendar on the right.',
    builtIn: true,
    rev: 2,
    placements: {
      clock: [{ x: 3, y: 6, wpct: 12, tz: 'local' }],
      note: [{ x: 3, y: 28, wpct: 16, hpct: 60 }, { x: 66, y: 6, wpct: 26 }],
      todo: [{ x: 34, y: 20, wpct: 26, hpct: 60 }],
      calendar: [{ x: 66, y: 44, wpct: 26 }],
    },
  },
  {
    id: 'preset-grid',
    name: 'Productivity Grid',
    desc: 'Clocks on top, notes in a row, lists and calendar below.',
    builtIn: true,
    placements: {
      clock: [{ x: 3, y: 6, wpct: 10 }, { x: 14, y: 6, wpct: 10 }, { x: 25, y: 6, wpct: 10 }],
      note: [{ x: 3, y: 28, wpct: 20 }, { x: 25, y: 28, wpct: 20 }, { x: 47, y: 28, wpct: 20 }],
      todo: [{ x: 69, y: 28, wpct: 24, hpct: 40 }],
      quote: [{ x: 3, y: 74, wpct: 40 }],
      routine: [{ x: 47, y: 74, wpct: 20, hpct: 20 }],
      calendar: [{ x: 69, y: 70, wpct: 24, hpct: 24 }],
      video: [{ x: 25, y: 52, wpct: 20, hpct: 22 }],
    },
  },
  {
    id: 'preset-command',
    name: 'Command Center',
    desc: 'Calendar and note stacked left, clocks and quote up top, big to-dos and note below.',
    builtIn: true,
    rev: 2,
    placements: {
      calendar: [{ x: 1.5, y: 7, wpct: 26 }],
      note: [{ x: 1.5, y: 64, wpct: 26, hpct: 30 }, { x: 69, y: 30, wpct: 28, hpct: 62 }],
      clock: [{ x: 30, y: 7, wpct: 11 }, { x: 42, y: 7, wpct: 11 }],
      quote: [{ x: 54, y: 7, wpct: 41 }],
      todo: [{ x: 30, y: 30, wpct: 37, hpct: 62 }],
    },
  },
];

const CLOCK_DEFAULTS = [
  { timezone: 'America/New_York', label: 'New York' },
  { timezone: 'Asia/Kathmandu', label: 'Kathmandu' },
  { timezone: 'Europe/London', label: 'London' },
  { timezone: 'Asia/Tokyo', label: 'Tokyo' },
  { timezone: 'UTC', label: 'UTC' },
];

const QUOTE_STARTERS = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];

export function emptyWidgetCollections() {
  return { notes: [], clocks: [], todos: [], quotes: [], routines: [], calendars: [], videos: [] };
}

export function cloneCollections(collections) {
  const src = collections && typeof collections === 'object' ? collections : {};
  const out = emptyWidgetCollections();
  for (const key of LAYOUT_KIND_KEYS) {
    out[key] = Array.isArray(src[key])
      ? src[key].filter((w) => w && typeof w === 'object').map((w) => JSON.parse(JSON.stringify(w)))
      : [];
  }
  return out;
}

export function localTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

export function zoneLabel(timezone) {
  const tz = String(timezone || 'UTC');
  const hit = CLOCK_DEFAULTS.find((d) => d && d.timezone === tz);
  if (hit) return hit.label;
  const parts = tz.split('/');
  return (parts[parts.length - 1] || tz).replace(/_/g, ' ');
}

export function makeStarterWidget(kind, index, noteColor, slot) {
  switch (kind) {
    case 'note':
      return {
        id: uid(),
        title: 'Note',
        text: '',
        color: noteColor || 'yellow',
        collapsed: false,
        pinned: true,
      };
    case 'clock': {
      let timezone;
      let label;
      if (slot && slot.tz) {
        timezone = slot.tz === 'local' ? localTimeZone() : String(slot.tz);
        label = slot.label || zoneLabel(timezone);
      } else {
        const d = CLOCK_DEFAULTS[index % CLOCK_DEFAULTS.length];
        timezone = d.timezone;
        label = d.label;
      }
      return { id: uid(), timezone: timezone, label: label, pinned: true };
    }
    case 'todo':
      return { id: uid(), title: '', tasks: [], collapsed: false, pinned: true };
    case 'quote': {
      const d = QUOTE_STARTERS[index % QUOTE_STARTERS.length];
      return { id: uid(), text: d.text, author: d.author, color: 'glass', fontSize: 17, collapsed: false, pinned: true };
    }
    case 'routine':
      return { id: uid(), title: '', rows: [], collapsed: false, pinned: true };
    case 'calendar':
      return { id: uid(), collapsed: false, pinned: true };
    default:
      return null; // e.g. video has no placeable widget UI
  }
}

// The starter dashboard: mirrors the historical fresh install content.
export function defaultStarterCollections() {
  return {
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
    quotes: [
      { id: uid(), text: QUOTE_STARTERS[0].text, author: QUOTE_STARTERS[0].author, color: 'glass', fontSize: 17, collapsed: false, pinned: false },
    ],
    routines: [],
    calendars: [],
    videos: [],
  };
}

// Every dashboard entry owns a fixed set of widgets (wallpaper metaphor):
// { id, name, desc?, builtIn?, default?, placements, widgets: collections|null }.
// widgets === null means "never opened": starters are built on first switch.
export function seedLayoutEntries() {
  const entries = [
    {
      id: DEFAULT_LAYOUT_ID,
      name: 'Default',
      desc: 'Your home dashboard.',
      default: true,
      placements: {},
      widgets: defaultStarterCollections(),
    },
  ];
  for (const t of BUILT_IN_TEMPLATES) {
    entries.push({
      id: t.id,
      name: t.name,
      desc: t.desc,
      builtIn: true,
      placements: JSON.parse(JSON.stringify(t.placements)),
      widgets: null,
    });
  }
  return entries;
}

export function entryWidgetCount(entry) {
  if (!entry || typeof entry !== 'object') return 0;
  if (!entry.widgets || typeof entry.widgets !== 'object') {
    // Unopened: count the template slots it will create.
    let n = 0;
    const pl = entry.placements || {};
    for (const kind of PRESET_KINDS) {
      if (kind === 'video') continue;
      if (Array.isArray(pl[kind])) n += pl[kind].length;
    }
    return n;
  }
  let n = 0;
  for (const key of LAYOUT_KIND_KEYS) {
    if (Array.isArray(entry.widgets[key])) n += entry.widgets[key].length;
  }
  return n;
}
