import { uid } from '../shared/utils.js';
import { els } from '../shared/dom.js';
import { state, setState, mergeState, saveState } from '../shared/state.js';
import { applySavedLayout, fitAllWidgets } from './layout.js';
import { renderClocks, updateAllClocks } from '../modules/clocks.js';
import { renderNotes, renderNote } from '../modules/notes.js';
import { renderTodos } from '../modules/todos.js';
import { renderRoutines } from '../modules/routines.js';
import { renderQuotes } from '../modules/quotes.js';
import { wallpaperById, applyWallpaper, restartCycleTimer } from '../modules/wallpaper.js';
import { renderMusic } from '../modules/music.js';
import { renderCalendarWidgets } from '../modules/calendar.js';
import { applyGlobalFont, syncSettingsUI } from '../modules/settings.js';

export function addNote() {
  const n = state.notes.length;
  const note = {
    id: uid(),
    text: '',
    color: state.settings.defaultNoteColor,
    collapsed: false,
    x: 6 + ((n * 2) % 22),
    y: 20 + ((n * 7) % 46),
  };
  state.notes.push(note);
  saveState();
  renderNote(note);
  const ta = els.widgets.querySelector('[data-note-id="' + note.id + '"] .note-text');
  if (ta) ta.focus();
}

export function addClock() {
  const clock = {
    id: uid(),
    timezone: 'UTC',
    label: 'UTC',
  };
  state.clocks.push(clock);
  saveState();
  renderClocks();
}

let renderedPrints = null;

function collectionPrints(st) {
  return {
    wallpaper: JSON.stringify(st.wallpaper),
    settings: JSON.stringify(st.settings),
    notes: JSON.stringify(st.notes),
    clocks: JSON.stringify(st.clocks),
    todos: JSON.stringify(st.todos),
    routines: JSON.stringify(st.routines),
    quotes: JSON.stringify(st.quotes),
    music: JSON.stringify(st.music),
  };
}

export function renderEverything() {
  applyWallpaper(wallpaperById(state.wallpaper.id));
  applyGlobalFont();
  renderNotes();
  renderClocks();
  renderTodos();
  renderRoutines();
  renderQuotes();
  renderCalendarWidgets();
  renderMusic();
  syncSettingsUI();
  restartCycleTimer();
  updateAllClocks();
  fitAllWidgets();
  renderedPrints = collectionPrints(state);
}

export function renderChangedCollections(skip) {
  skip = skip || [];
  const prev = renderedPrints || {};
  const next = collectionPrints(state);
  renderedPrints = next;
  const chk = (k) => skip.indexOf(k) === -1;
  const wpChanged = chk('wallpaper') && prev.wallpaper !== next.wallpaper;
  const setChanged = chk('settings') && prev.settings !== next.settings;
  if (wpChanged || setChanged) {
    if (wpChanged) applyWallpaper(wallpaperById(state.wallpaper.id));
    if (setChanged) applyGlobalFont();
    restartCycleTimer();
  }
  if (chk('notes') && prev.notes !== next.notes) renderNotes();
  if (chk('clocks') && prev.clocks !== next.clocks) renderClocks();
  if (chk('todos') && prev.todos !== next.todos) renderTodos();
  if (chk('routines') && prev.routines !== next.routines) renderRoutines();
  if (chk('quotes') && prev.quotes !== next.quotes) renderQuotes();
  if (chk('music') && prev.music !== next.music) renderMusic();
  syncSettingsUI();
  updateAllClocks();
  fitAllWidgets();
}

export function applyExternal(newValue) {
  setState(mergeState(newValue));
  applySavedLayout();
  renderEverything();
}