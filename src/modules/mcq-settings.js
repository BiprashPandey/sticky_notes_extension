import { els } from '../shared/dom.js';
import { state } from '../shared/state.js';
import { manualSave } from './data.js';

export function updateMcqToggleUi(on) {
  if (!els.mcqEnabledLabel) return;
  els.mcqEnabledLabel.textContent = on ? 'On' : 'Off';
  els.mcqEnabledLabel.classList.toggle('on', on);
  els.mcqEnabledLabel.classList.toggle('off', !on);
  if (els.mcqStatsLine) {
    const a = Number(state.mcq && state.mcq.answered) || 0;
    const c = Number(state.mcq && state.mcq.correct) || 0;
    els.mcqStatsLine.textContent = a > 0 ? `Answered ${a} · ${c} correct` : 'One question per new tab and on sites you visit. Answer, skip, or dismiss.';
  }
}

export function syncMcqSettingsUI() {
  if (!els.mcqEnabledInput) return;
  const on = !!(state.mcq && state.mcq.enabled);
  els.mcqEnabledInput.checked = on;
  updateMcqToggleUi(on);
}

export function bindMcqSettings() {
  if (!els.mcqEnabledInput) return;
  els.mcqEnabledInput.addEventListener('change', (e) => {
    if (!state.mcq) state.mcq = { enabled: false, lastIndex: -1, answered: 0, correct: 0, color: 'glass', x: null, y: null };
    state.mcq.enabled = e.target.checked;
    updateMcqToggleUi(e.target.checked);
    manualSave();
    // Live-update the card without requiring a reload.
    document.dispatchEvent(new CustomEvent('mcq:toggle', { detail: { enabled: e.target.checked } }));
  });
}
