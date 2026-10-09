import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { persistState } from '../shared/storage.js';
import { clampPct, uid } from '../shared/utils.js';
import { LAYOUT_KINDS, captureLayout, round3 } from '../ui/layout.js';
import {
  PRESET_KINDS,
  LAYOUT_KIND_KEYS,
  DEFAULT_LAYOUT_ID,
  BUILT_IN_TEMPLATES,
  CALENDAR_ASPECT,
  cloneCollections,
  emptyWidgetCollections,
  makeStarterWidget,
  entryWidgetCount,
} from './layout-templates.js';

// Wallpaper model: every layout entry owns a fixed set of widgets.
// Switching saves the outgoing dashboard into its entry (on request) and
// loads the incoming entry's widgets. Layouts never share widgets.

function num(v, fallback) {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

export function sanitizePlacement(p) {
  if (!p || typeof p !== 'object') return null;
  const out = { x: clampPct(num(p.x, 0)), y: clampPct(num(p.y, 0)) };
  if (p.wpct != null && isFinite(Number(p.wpct))) out.wpct = Math.min(90, Math.max(2, Number(p.wpct)));
  if (p.hpct != null && isFinite(Number(p.hpct))) out.hpct = Math.min(95, Math.max(3, Number(p.hpct)));
  // Non-geometry slot hints (e.g. clock timezone) survive sanitizing.
  if (p.tz != null) out.tz = String(p.tz).slice(0, 64);
  if (p.label != null) out.label = String(p.label).slice(0, 64);
  return out;
}

function sanitizePlacements(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const kind of PRESET_KINDS) {
    if (!Array.isArray(raw[kind])) continue;
    const slots = [];
    for (const p of raw[kind]) {
      const clean = sanitizePlacement(p);
      if (clean) slots.push(clean);
    }
    if (slots.length) out[kind] = slots;
  }
  return out;
}

function stateKeyForKind(kind) {
  return kind + 's';
}

export function getAllLayouts() {
  return Array.isArray(state.layouts) ? state.layouts : [];
}

export function findLayout(id) {
  return getAllLayouts().find((l) => l && l.id === id) || null;
}

export function activeEntry() {
  return findLayout(state.activeLayoutId) || getAllLayouts()[0] || null;
}

function liveCollections() {
  const out = {};
  for (const key of LAYOUT_KIND_KEYS) {
    out[key] = state[key];
  }
  return out;
}

function setLiveCollections(collections) {
  const src = collections && typeof collections === 'object' ? collections : {};
  for (const key of LAYOUT_KIND_KEYS) {
    state[key] = Array.isArray(src[key]) ? src[key] : [];
  }
}

// Write the live dashboard back into its entry (explicit save points only).
export function syncActiveEntryFromLive() {
  const entry = activeEntry();
  if (!entry) return;
  entry.widgets = cloneCollections(liveCollections());
}

// First touch of a layout: build its owned widgets from the template slots.
export function initEntryWidgets(entry) {
  const collections = emptyWidgetCollections();
  const placements = sanitizePlacements(entry.placements);
  ensureWidgets(collections, placements);
  arrangeCollections(collections, placements);
  const template = BUILT_IN_TEMPLATES.find((t) => t.id === entry.id);
  entry.rev = template && template.rev != null ? template.rev : (entry.rev != null ? entry.rev : 1);
  entry.widgets = collections;
  return collections;
}

// A freshly loaded / never-opened entry has no widgets yet.
export function ensureActiveEntryInitialized() {
  const entry = activeEntry();
  if (!entry) return false;
  if (entry.widgets) return false;
  setLiveCollections(cloneCollections(initEntryWidgets(entry)));
  return true;
}

function noteColor() {
  return (state.settings && state.settings.defaultNoteColor) || 'yellow';
}

function ensureWidgets(collections, placements) {
  let created = 0;
  for (const kind of PRESET_KINDS) {
    const slots = placements[kind] || [];
    if (!slots.length) continue;
    const key = stateKeyForKind(kind);
    if (!Array.isArray(collections[key])) collections[key] = [];
    const arr = collections[key];
    while (arr.length < slots.length) {
      const item = makeStarterWidget(kind, arr.length, noteColor(), slots[arr.length]);
      if (!item) break;
      arr.push(item);
      created++;
    }
  }
  return created;
}

function slotFor(slots, i) {
  if (!slots.length) return null;
  if (i < slots.length) return slots[i];
  const extra = i - slots.length + 1;
  const base = slots[slots.length - 1];
  return {
    x: clampPct(base.x + 3 * extra),
    y: clampPct(base.y + 4 * extra),
    wpct: base.wpct,
    hpct: base.hpct,
  };
}

function arrangeCollections(collections, placements) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let moved = 0;
  for (const kind of PRESET_KINDS) {
    const slots = placements[kind] || [];
    if (!slots.length) continue;
    const arr = collections[stateKeyForKind(kind)];
    if (!Array.isArray(arr)) continue;
    arr.forEach((item, i) => {
      if (!item || typeof item !== 'object') return;
      const slot = slotFor(slots, i);
      if (!slot) return;
      item.x = clampPct(slot.x);
      item.y = clampPct(slot.y);
      item.pinned = true;
      if (slot.wpct != null) {
        const minW = (LAYOUT_KINDS[kind] && LAYOUT_KINDS[kind].minW) || 150;
        item.wpct = round3(slot.wpct);
        item.w = Math.max(minW, Math.round((slot.wpct / 100) * vw));
      }
      if (slot.hpct != null) {
        item.hpct = round3(slot.hpct);
        item.h = Math.max(60, Math.round((slot.hpct / 100) * vh));
      }
      if (kind === 'calendar' && item.wpct != null) {
        // The calendar keeps its original dimensional ratio on every layout:
        // width wins, height is derived (same rule as manual resizing).
        const hpx = ((item.wpct / 100) * vw) / CALENDAR_ASPECT;
        item.hpct = round3((hpx / vh) * 100);
        item.h = Math.max(60, Math.round(hpx));
      }
      moved++;
    });
  }
  return moved;
}

function loadEntryToLive(entry) {
  if (!entry.widgets) initEntryWidgets(entry);
  setLiveCollections(cloneCollections(entry.widgets));
}

function capturePlacements() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const placements = {};
  for (const kind of PRESET_KINDS) {
    const spec = LAYOUT_KINDS[kind];
    const arr = state[stateKeyForKind(kind)];
    if (!spec || !Array.isArray(arr) || !arr.length) continue;
    const slots = [];
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const el = els.widgets.querySelector(spec.selector + '[data-' + spec.idAttr + '="' + item.id + '"]');
      if (!el && item.x == null && item.y == null) continue;
      let x = num(item.x, 0);
      let y = num(item.y, 0);
      let wpct = item.wpct;
      let hpct = item.hpct;
      if (el) {
        if (el.style.left) {
          const v = parseFloat(el.style.left);
          if (isFinite(v)) x = round3(v);
        }
        if (el.style.top) {
          const v = parseFloat(el.style.top);
          if (isFinite(v)) y = round3(v);
        }
        if (el.style.width) {
          const r = el.getBoundingClientRect();
          if (isFinite(r.width) && isFinite(r.height) && r.width > 0 && r.height > 0) {
            wpct = round3((r.width / vw) * 100);
            hpct = round3((r.height / vh) * 100);
          }
        }
      }
      const clean = sanitizePlacement({ x: x, y: y, wpct: wpct, hpct: hpct });
      if (clean) {
        if (wpct == null) delete clean.wpct;
        if (hpct == null) delete clean.hpct;
        slots.push(clean);
      }
    }
    if (slots.length) placements[kind] = slots;
  }
  return placements;
}

function placementSlotCount(placements) {
  let n = 0;
  for (const kind of PRESET_KINDS) {
    if (kind === 'video') continue;
    if (Array.isArray(placements[kind])) n += placements[kind].length;
  }
  return n;
}

// Save the live dashboard as a brand-new entry (with all its data).
export function saveLiveAsNewEntry(name) {
  const placements = capturePlacements();
  if (!placementSlotCount(placements)) return null;
  const entry = {
    id: uid(),
    name: String(name || '').trim().slice(0, 40) || 'My dashboard',
    savedAt: Date.now(),
    placements: placements,
    widgets: cloneCollections(liveCollections()),
  };
  if (!Array.isArray(state.layouts)) state.layouts = [];
  state.layouts.push(entry);
  state.activeLayoutId = entry.id;
  return entry;
}

export function deleteEntry(id) {
  const entry = findLayout(id);
  if (!entry || entry.builtIn || entry.default || entry.id === DEFAULT_LAYOUT_ID) return false;
  if (!Array.isArray(state.layouts)) return false;
  if (state.activeLayoutId === id) {
    const home = findLayout(DEFAULT_LAYOUT_ID) || getAllLayouts()[0];
    if (home) {
      loadEntryToLive(home);
      state.activeLayoutId = home.id;
    }
  }
  state.layouts = state.layouts.filter((l) => l && l.id !== id);
  return true;
}

export function resetEntry(id) {
  const entry = findLayout(id);
  if (!entry || (!entry.builtIn && !entry.default)) return false;
  entry.widgets = null;
  if (state.activeLayoutId === id) {
    loadEntryToLive(entry);
  }
  return true;
}

let renderer = null;

export function setLayoutRenderer(fn) {
  renderer = fn;
}

let saveFlashTimer = null;

function flashSaveBtn(label) {
  if (!els.saveBtn) return;
  els.saveBtn.classList.add('saved');
  els.saveBtn.textContent = label || '✓';
  els.saveBtn.title = label && label !== '✓' ? label + ' — all changes saved' : 'Save all changes';
  if (saveFlashTimer) clearTimeout(saveFlashTimer);
  saveFlashTimer = setTimeout(() => {
    els.saveBtn.classList.remove('saved');
    els.saveBtn.textContent = '💾';
    els.saveBtn.title = 'Save all changes';
  }, 1400);
}

function widgetGeometry() {
  const map = {};
  for (const [kind, spec] of Object.entries(LAYOUT_KINDS)) {
    els.widgets.querySelectorAll(spec.selector).forEach((el) => {
      map[kind + ':' + el.dataset[spec.idAttr]] =
        el.style.left + '|' + el.style.top + '|' + el.style.width + '|' + el.style.height;
    });
  }
  return map;
}

function countGeometryChanges(before, after) {
  let changed = 0;
  const keys = new Set(Object.keys(before).concat(Object.keys(after)));
  for (const k of keys) {
    if (before[k] !== after[k]) changed++;
  }
  return changed;
}

function snapshotAndPersist(flashLabel) {
  captureLayout();
  state.saveToken = (state.saveToken || 0) + 1;
  persistState();
  flashSaveBtn(flashLabel);
}

function refreshAfterChange(flashLabel) {
  // State was mutated first, so render before snapshotting the DOM.
  if (typeof renderer === 'function') renderer();
  snapshotAndPersist(flashLabel);
  renderLayoutList();
}

// Three-way switch prompt: save outgoing dashboard, discard it, or cancel.
let switchResolver = null;

function hideSwitchModal() {
  if (els.switchOverlay) els.switchOverlay.classList.remove('open');
  switchResolver = null;
}

export function confirmLayoutSwitch(fromName, toName) {
  if (els.switchTitle) els.switchTitle.textContent = 'Switch dashboard?';
  if (els.switchMessage) {
    els.switchMessage.textContent =
      'Save the current dashboard (“' + fromName + '”) before loading (“' + toName + '”)? ' +
      'Discard drops any unsaved changes there; Cancel stays put.';
  }
  if (els.switchOverlay) els.switchOverlay.classList.add('open');
  return new Promise((resolve) => {
    switchResolver = resolve;
  });
}

function resolveSwitch(choice) {
  const r = switchResolver;
  hideSwitchModal();
  if (typeof r === 'function') r(choice);
}

export function cancelLayoutSwitch() {
  if (switchResolver) resolveSwitch('cancel');
  else hideSwitchModal();
}

function bindSwitchModalOnce() {
  if (!els.switchOverlay || bindSwitchModalOnce.done) return;
  bindSwitchModalOnce.done = true;
  if (els.switchSaveBtn) els.switchSaveBtn.addEventListener('click', () => resolveSwitch('save'));
  if (els.switchDiscardBtn) els.switchDiscardBtn.addEventListener('click', () => resolveSwitch('discard'));
  if (els.switchCancelBtn) els.switchCancelBtn.addEventListener('click', () => resolveSwitch('cancel'));
  els.switchOverlay.addEventListener('click', (e) => {
    if (e.target === els.switchOverlay) resolveSwitch('cancel');
  });
}

async function switchToEntry(entry) {
  const current = activeEntry();
  if (current && current.id === entry.id) {
    console.info('[dashboard] Already showing "' + entry.name + '".');
    flashSaveBtn('✓');
    return;
  }
  const choice = await confirmLayoutSwitch(current ? current.name : 'dashboard', entry.name);
  if (choice === 'cancel' || !choice) return;
  const before = widgetGeometry();
  if (choice === 'save' && current) {
    syncActiveEntryFromLive();
  }
  loadEntryToLive(entry);
  state.activeLayoutId = entry.id;
  refreshAfterChange();
  const changed = countGeometryChanges(before, widgetGeometry());
  const total = entryWidgetCount(entry);
  console.info('[dashboard] Switched to "' + entry.name + '" (' + choice + '): ' + total + ' widget(s), ' + changed + ' visibly moved.');
  flashSaveBtn(changed ? '✓ ' + changed : '✓');
  if (els.settingsOverlay) els.settingsOverlay.classList.remove('open');
}

function entrySubLabel(entry) {
  const count = entryWidgetCount(entry);
  const base = entry.default
    ? 'Your home dashboard'
    : entry.builtIn
      ? (entry.desc || 'Preloaded dashboard')
      : 'Saved by you' + (entry.savedAt ? ' · ' + new Date(entry.savedAt).toLocaleDateString() : '');
  const setup = entry.widgets ? '' : ' · not set up yet';
  return base + ' · ' + count + ' widget' + (count === 1 ? '' : 's') + setup;
}

export function renderLayoutList() {
  const list = els.layoutList;
  if (!list) return;
  const layouts = getAllLayouts();
  list.innerHTML = '';
  for (const entry of layouts) {
    const row = document.createElement('div');
    row.className = 'layout-item' + (state.activeLayoutId === entry.id ? ' active' : '');
    const info = document.createElement('div');
    info.className = 'layout-info';
    const title = document.createElement('div');
    title.className = 'layout-name';
    title.textContent = entry.name || 'Untitled dashboard';
    info.appendChild(title);
    const sub = document.createElement('div');
    sub.className = 'layout-desc';
    sub.textContent = entrySubLabel(entry);
    info.appendChild(sub);
    if (state.activeLayoutId === entry.id) {
      const badge = document.createElement('span');
      badge.className = 'layout-badge';
      badge.textContent = 'Active';
      info.appendChild(badge);
    }
    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'layout-actions';
    const switchBtn = document.createElement('button');
    switchBtn.type = 'button';
    switchBtn.className = 'ghost-btn layout-apply-btn';
    switchBtn.dataset.id = entry.id;
    switchBtn.textContent = state.activeLayoutId === entry.id ? 'Showing' : 'Switch';
    actions.appendChild(switchBtn);
    if (!entry.builtIn && !entry.default && entry.id !== DEFAULT_LAYOUT_ID) {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'ghost-btn danger layout-del-btn';
      delBtn.dataset.id = entry.id;
      delBtn.textContent = '✕';
      delBtn.title = 'Delete this dashboard and its widgets';
      actions.appendChild(delBtn);
    } else {
      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'ghost-btn layout-reset-btn';
      resetBtn.dataset.id = entry.id;
      resetBtn.textContent = '↺';
      resetBtn.title = 'Reset this dashboard to its starter widgets';
      actions.appendChild(resetBtn);
    }
    row.appendChild(actions);
    list.appendChild(row);
  }
  if (!layouts.length) {
    const empty = document.createElement('p');
    empty.className = 'field-hint';
    empty.textContent = 'No dashboards yet.';
    list.appendChild(empty);
  }
}

export function bindLayoutUI() {
  if (!els.layoutList || !els.saveLayoutBtn) return;
  bindSwitchModalOnce();
  renderLayoutList();

  els.saveLayoutBtn.addEventListener('click', () => {
    const fallback = 'My dashboard ' + (getAllLayouts().filter((l) => !l.builtIn && !l.default).length + 1);
    const name = els.layoutNameInput && els.layoutNameInput.value.trim()
      ? els.layoutNameInput.value.trim()
      : fallback;
    const entry = saveLiveAsNewEntry(name);
    if (!entry) {
      saveState();
      alert('Nothing to save yet — add a widget first.');
      renderLayoutList();
      return;
    }
    if (els.layoutNameInput) els.layoutNameInput.value = '';
    refreshAfterChange();
  });

  els.layoutList.addEventListener('click', (e) => {
    const switchBtn = e.target.closest('.layout-apply-btn');
    const delBtn = e.target.closest('.layout-del-btn');
    const resetBtn = e.target.closest('.layout-reset-btn');
    if (switchBtn) {
      const entry = findLayout(switchBtn.dataset.id);
      if (entry) switchToEntry(entry);
      return;
    }
    if (delBtn) {
      const entry = findLayout(delBtn.dataset.id);
      if (!entry) return;
      const n = entryWidgetCount(entry);
      if (!confirm('Delete dashboard "' + entry.name + '" and its ' + n + ' widget(s)? This cannot be undone.')) return;
      deleteEntry(entry.id);
      refreshAfterChange();
      return;
    }
    if (resetBtn) {
      const entry = findLayout(resetBtn.dataset.id);
      if (!entry) return;
      if (!confirm('Reset "' + entry.name + '" to its starter widgets? Its current widgets will be replaced.')) return;
      resetEntry(entry.id);
      refreshAfterChange();
    }
  });
}
