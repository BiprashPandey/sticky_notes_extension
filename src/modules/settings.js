import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { restartCycleTimer } from './wallpaper.js';
import { exportData, importData, resetData } from './data.js';
import { syncFocusSettingsUI } from './focus-settings.js';

const FONTS = {
  default: { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace" },
  mono:    { label: 'Monospace',      stack: "'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace" },
  sans:    { label: 'Sans-Serif',     stack: "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif" },
  serif:   { label: 'Serif',          stack: "Georgia, 'Times New Roman', serif" },
  hand:    { label: 'Handwriting',    stack: "'Segoe Print', 'Comic Sans MS', 'Bradley Hand', cursive" },
};

export function applyGlobalFont() {
  const f = FONTS[state.settings.font] || FONTS.default;
  document.documentElement.style.setProperty('--ui-font', f.stack);
}

function buildFontOptions() {
  els.fontInput.innerHTML = Object.entries(FONTS)
    .map(([k, f]) => '<option value="' + k + '">' + f.label + '</option>')
    .join('');
}

export function bindSettings() {
  buildFontOptions();

  els.fontInput.addEventListener('change', (e) => {
    state.settings.font = e.target.value;
    applyGlobalFont();
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

export function syncSettingsUI() {
  els.fontInput.value = state.settings.font || 'default';
  els.cycleInput.value = String(state.settings.cycleMinutes || 0);
  syncFocusSettingsUI();
}