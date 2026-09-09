import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { bindPin, makeDraggable, makeResizable } from '../ui/drag.js';
import { round3 } from '../ui/layout.js';
import { clampPct, escapeHtml, htmlFromText, pct } from '../shared/utils.js';

const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'purple', 'orange'];

export function renderNotes() {
  els.widgets.querySelectorAll('.note').forEach((n) => n.remove());
  for (const note of state.notes) renderNote(note);
}

function autosize(ta) {
  const minH = Math.max(64, Math.min(160, Math.round(window.innerHeight * 0.11)));
  ta.style.height = 'auto';
  ta.style.height = Math.max(ta.scrollHeight, minH) + 'px';
}

export function renderNote(note) {
  const el = document.createElement('div');
  el.className = 'note color-' + note.color + (note.collapsed ? ' collapsed' : '');
  el.dataset.noteId = note.id;
  el.style.left = clampPct(note.x) + '%';
  el.style.top = clampPct(note.y) + '%';
  if (note.wpct != null) el.style.width = note.wpct + 'vw';
  else if (note.w) el.style.width = Math.max(180, note.w) + 'px';
  if (note.hpct != null) el.style.height = note.hpct + 'vh';
  else if (note.h) el.style.height = note.h + 'px';

  el.innerHTML =
    '<div class="note-header">' +
      '<button type="button" class="icon-btn note-color-btn" title="Change color">🎨</button>' +
      '<button type="button" class="icon-btn note-pin-btn" title="Pin">📌</button>' +
      '<input class="note-title" type="text" value="' + escapeHtml(note.title || '') + '" placeholder="Note title">' +
      '<button type="button" class="icon-btn note-collapse-btn" title="' + (note.collapsed ? 'Expand' : 'Collapse') + '">' + (note.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn note-delete-btn" title="Delete note">✕</button>' +
    '</div>' +
    '<div class="note-fmt">' +
      '<button type="button" class="fmt-btn" data-fmt="bold" title="Bold (Ctrl+B)"><b>B</b></button>' +
      '<button type="button" class="fmt-btn" data-fmt="italic" title="Italic (Ctrl+I)"><i>I</i></button>' +
      '<button type="button" class="fmt-btn" data-fmt="underline" title="Underline (Ctrl+U)"><u>U</u></button>' +
      '<button type="button" class="fmt-btn" data-fmt="strikeThrough" title="Strikethrough"><s>S</s></button>' +
    '</div>' +
    '<div class="note-text" contenteditable="true" spellcheck="false" data-placeholder="Write something…"></div>' +
    '<div class="note-resize" title="Drag to resize — double-click to reset"></div>';

  const ta = el.querySelector('.note-text');
  ta.innerHTML = htmlFromText(note.text);
  if (note.h || note.hpct != null) ta.style.overflowY = 'auto';
  else autosize(ta);

  el.querySelector('.note-title').addEventListener('input', (e) => {
    note.title = e.target.value;
    saveState();
  });

  ta.addEventListener('input', () => {
    note.text = ta.innerHTML;
    if (!note.h && note.hpct == null) autosize(ta);
    saveState();
  });

  const fmtBar = el.querySelector('.note-fmt');
  fmtBar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.fmt-btn')) e.preventDefault();
  });
  fmtBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.fmt-btn');
    if (!btn) return;
    ta.focus();
    document.execCommand(btn.dataset.fmt, false);
    note.text = ta.innerHTML;
    if (!note.h && note.hpct == null) autosize(ta);
    saveState();
  });

  el.querySelector('.note-color-btn').addEventListener('click', () => {
    const i = NOTE_COLORS.indexOf(note.color);
    note.color = NOTE_COLORS[(i + 1) % NOTE_COLORS.length];
    el.className = el.className.replace(/color-\w+/, 'color-' + note.color);
    saveState();
  });

  const collapseBtn = el.querySelector('.note-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    note.collapsed = !note.collapsed;
    el.classList.toggle('collapsed', note.collapsed);
    collapseBtn.textContent = note.collapsed ? '＋' : '–';
    collapseBtn.title = note.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.note-pin-btn'), note);

  el.querySelector('.note-delete-btn').addEventListener('click', () => {
    state.notes = state.notes.filter((n) => n.id !== note.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.note-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    note.w = Math.round(w);
    note.h = Math.round(h);
    note.wpct = round3((w / window.innerWidth) * 100);
    note.hpct = round3((h / window.innerHeight) * 100);
    ta.style.height = '';
    ta.style.overflowY = 'auto';
    saveState();
  }, { disabled: () => note.pinned });
  resizeHandle.addEventListener('dblclick', () => {
    delete note.w;
    delete note.h;
    delete note.wpct;
    delete note.hpct;
    el.style.width = '';
    el.style.height = '';
    ta.style.overflowY = '';
    autosize(ta);
    saveState();
  });

  makeDraggable(el, el.querySelector('.note-header'), () => {
    note.x = pct(el.style.left);
    note.y = pct(el.style.top);
    saveState();
  }, { disabled: () => note.pinned });

  els.widgets.appendChild(el);
}