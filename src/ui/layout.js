import { els } from '../shared/dom.js';
import { state } from '../shared/state.js';
import { clampPct, pct } from '../shared/utils.js';

export const LAYOUT_KINDS = {
  note:  { selector: '.note',  idAttr: 'noteId',  minW: 180 },
  clock: { selector: '.clock', idAttr: 'clockId', minW: 150 },
  todo:  { selector: '.todo',  idAttr: 'todoId',  minW: 200 },
  quote: { selector: '.quote', idAttr: 'quoteId', minW: 240 },
  routine: { selector: '.routine', idAttr: 'routineId', minW: 240 },
  video: { selector: '.video', idAttr: 'videoId', minW: 240 },
  calendar: { selector: '.cal-widget', idAttr: 'calWidgetId', minW: 220 },
};

export function fitWidget(el) {
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

export function fitAllWidgets() {
  els.widgets.querySelectorAll('.note, .clock, .todo, .quote, .routine, .cal-widget').forEach(fitWidget);
}

export function layoutRow(items, getEl, startYFrac) {
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

export function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export function captureLayout() {
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

  const layout = {
    version: 1,
    savedAt: Date.now(),
    viewport: { w: vw, h: vh },
    widgets: widgets,
  };
  state.layout = layout;
  return layout;
}

export function applyLayout(layout) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (const entry of layout.widgets || []) {
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

export function applySavedLayout() {
  const layout = state.layout;
  if (!layout || layout.version !== 1 || !Array.isArray(layout.widgets)) return false;
  applyLayout(layout);
  return true;
}

export function refreshLayout() {
  fitAllWidgets();
}