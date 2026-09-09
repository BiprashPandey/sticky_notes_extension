import { state, STORAGE_KEY } from './state.js';

export function persistState() {
  chrome.storage.local.set({ [STORAGE_KEY]: JSON.parse(JSON.stringify(state)) });
}