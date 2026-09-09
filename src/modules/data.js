import { els } from '../shared/dom.js';
import { state, setState, mergeState, freshState, STORAGE_KEY, saveState } from '../shared/state.js';
import { persistState } from '../shared/storage.js';
import { captureLayout, applySavedLayout } from '../ui/layout.js';

let renderAll = () => {};

export function setRenderAll(fn) {
  renderAll = fn;
}



export function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dashboard-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      setState(mergeState(JSON.parse(reader.result)));
      renderAll();
      applySavedLayout();
      persistState();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

export function resetData() {
  if (!confirm('Reset the dashboard to defaults? All notes and clocks will be removed.')) return;
  setState(freshState());
  renderAll();
  persistState();
}

let saveFlashTimer = null;

export function manualSave() {
  const a = document.activeElement;
  if (a && typeof a.blur === 'function' && a.closest && a.closest('.note, .todo, .quote, .clock, .routine, .video')) {
    try {
      a.blur();
    } catch (e) {
      /* ignore */
    }
  }
  captureLayout();
  state.saveToken = (state.saveToken || 0) + 1;
  persistState();
  els.saveBtn.classList.add('saved');
  els.saveBtn.textContent = '✓';
  if (saveFlashTimer) clearTimeout(saveFlashTimer);
  saveFlashTimer = setTimeout(() => {
    els.saveBtn.classList.remove('saved');
    els.saveBtn.textContent = '💾';
  }, 1400);
}

