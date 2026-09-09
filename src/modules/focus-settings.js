import { els } from '../shared/dom.js';
import { state, clampMinutes } from '../shared/state.js';
import { manualSave } from './data.js';

export function updatePlayMixesToggleUi(on) {
  els.focusPlayMixesLabel.textContent = on ? 'On' : 'Off';
  els.focusPlayMixesLabel.classList.toggle('on', on);
  els.focusPlayMixesLabel.classList.toggle('off', !on);
}

export function updateFocusToggleUi(on) {
  els.focusEnabledLabel.textContent = on ? 'On' : 'Off';
  els.focusEnabledLabel.classList.toggle('on', on);
  els.focusEnabledLabel.classList.toggle('off', !on);
  els.focusSitesInput.disabled = !on;
  els.focusMinutesInput.disabled = !on;
  els.focusPlayMixesInput.disabled = !on;
  els.focusLed.classList.toggle('on', on);
}

export function syncFocusSettingsUI() {
  els.focusSitesInput.value = (state.focus && Array.isArray(state.focus.sites) ? state.focus.sites : []).join('\n');
  els.focusMinutesInput.value = String(clampMinutes(state.focus && state.focus.minutes));
  const focusEnabled = state.focus ? state.focus.enabled !== false : true;
  els.focusEnabledInput.checked = focusEnabled;
  els.focusPlayMixesInput.checked = state.focus ? state.focus.playMixes !== false : true;
  updatePlayMixesToggleUi(els.focusPlayMixesInput.checked);
  updateFocusToggleUi(focusEnabled);
}

export function bindFocusSettings() {
  els.focusSitesInput.addEventListener('change', (e) => {
    const sites = e.target.value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    state.focus.sites = sites;
    manualSave();
  });

  els.focusMinutesInput.addEventListener('change', (e) => {
    state.focus.minutes = clampMinutes(e.target.value);
    manualSave();
  });

  els.focusEnabledInput.addEventListener('change', (e) => {
    state.focus.enabled = e.target.checked;
    updateFocusToggleUi(e.target.checked);
    manualSave();
  });

  els.focusPlayMixesInput.addEventListener('change', (e) => {
    state.focus.playMixes = e.target.checked;
    updatePlayMixesToggleUi(e.target.checked);
    manualSave();
  });

  els.focusBtn.addEventListener('click', () => els.focusOverlay.classList.add('open'));
  els.closeFocusBtn.addEventListener('click', () => els.focusOverlay.classList.remove('open'));
  els.focusOverlay.addEventListener('click', (e) => {
    if (e.target === els.focusOverlay) els.focusOverlay.classList.remove('open');
  });
}