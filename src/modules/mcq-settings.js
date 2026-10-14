import { els } from '../shared/dom.js';
import { state, sanitizeMcqDifficulties } from '../shared/state.js';
import { manualSave } from './data.js';

function ensureMcqState() {
  if (!state.mcq) {
    state.mcq = { enabled: false, lastIndex: -1, answered: 0, correct: 0, color: 'glass', x: null, y: null, difficulties: { basic: true, intermediate: true, advanced: true } };
  }
  if (!state.mcq.difficulties) {
    state.mcq.difficulties = { basic: true, intermediate: true, advanced: true };
  }
  state.mcq.difficulties = sanitizeMcqDifficulties(state.mcq.difficulties);
  return state.mcq;
}

function syncDifficultyVisibility(on) {
  if (els.mcqDifficultyRow) els.mcqDifficultyRow.hidden = !on;
  if (els.mcqDifficultyHint) els.mcqDifficultyHint.hidden = !on;
}

function syncDifficultyChecks() {
  const mcq = ensureMcqState();
  if (els.mcqDiffBasic) els.mcqDiffBasic.checked = !!mcq.difficulties.basic;
  if (els.mcqDiffIntermediate) els.mcqDiffIntermediate.checked = !!mcq.difficulties.intermediate;
  if (els.mcqDiffAdvanced) els.mcqDiffAdvanced.checked = !!mcq.difficulties.advanced;
}

export function updateMcqToggleUi(on) {
  if (!els.mcqEnabledLabel) return;
  els.mcqEnabledLabel.textContent = on ? 'On' : 'Off';
  els.mcqEnabledLabel.classList.toggle('on', on);
  els.mcqEnabledLabel.classList.toggle('off', !on);
  syncDifficultyVisibility(on);
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
  syncDifficultyChecks();
  updateMcqToggleUi(on);
}

function readChecksFromInputs() {
  return {
    basic: els.mcqDiffBasic ? els.mcqDiffBasic.checked : true,
    intermediate: els.mcqDiffIntermediate ? els.mcqDiffIntermediate.checked : true,
    advanced: els.mcqDiffAdvanced ? els.mcqDiffAdvanced.checked : true,
  };
}

function handleDifficultyChange(changedInput) {
  const mcq = ensureMcqState();
  let next = readChecksFromInputs();
  if (!next.basic && !next.intermediate && !next.advanced) {
    // Block unchecking the last box: revert and hint.
    if (changedInput) changedInput.checked = true;
    next = readChecksFromInputs();
    if (els.mcqStatsLine) {
      els.mcqStatsLine.textContent = 'Select at least one difficulty — Basic, Intermediate, or Advanced.';
    }
    return;
  }
  mcq.difficulties = sanitizeMcqDifficulties(next);
  updateMcqToggleUi(!!mcq.enabled);
  manualSave();
  // Live-update open cards (new-tab listens; engine reads stored state).
  document.dispatchEvent(new CustomEvent('mcq:difficulties', { detail: { difficulties: { ...mcq.difficulties } } }));
}

export function bindMcqSettings() {
  if (!els.mcqEnabledInput) return;
  els.mcqEnabledInput.addEventListener('change', (e) => {
    const mcq = ensureMcqState();
    mcq.enabled = e.target.checked;
    updateMcqToggleUi(e.target.checked);
    manualSave();
    // Live-update the card without requiring a reload.
    document.dispatchEvent(new CustomEvent('mcq:toggle', { detail: { enabled: e.target.checked } }));
  });
  if (els.mcqDiffBasic) els.mcqDiffBasic.addEventListener('change', (e) => handleDifficultyChange(e.target));
  if (els.mcqDiffIntermediate) els.mcqDiffIntermediate.addEventListener('change', (e) => handleDifficultyChange(e.target));
  if (els.mcqDiffAdvanced) els.mcqDiffAdvanced.addEventListener('change', (e) => handleDifficultyChange(e.target));
}
