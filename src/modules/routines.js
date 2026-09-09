import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { layoutRow, round3 } from '../ui/layout.js';
import { bindPin, makeDraggable, makeResizable } from '../ui/drag.js';
import { clampPct, escapeHtml, pct, uid } from '../shared/utils.js';



function parseRoutineTime(str) {
  const s = String(str || '').trim().toLowerCase();
  if (!s) return null;
  let m = s.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (m) {
    const h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (h > 23 || min > 59) return null;
    return { minutes: h * 60 + min };
  }
  m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (h < 1 || h > 12 || min > 59) return null;
    if (m[3] === 'p' && h !== 12) h += 12;
    if (m[3] === 'a' && h === 12) h = 0;
    return { minutes: h * 60 + min };
  }
  return null;
}

function normalizeRoutineTime(str) {
  const p = parseRoutineTime(str);
  if (!p) return String(str || '').trim();
  const h = Math.floor(p.minutes / 60);
  const min = p.minutes % 60;
  let hr12 = h % 12;
  if (hr12 === 0) hr12 = 12;
  return hr12 + ':' + (min < 10 ? '0' : '') + min + ' ' + (h < 12 ? 'am' : 'pm');
}

function routineTimeMinutes(str) {
  const p = parseRoutineTime(str);
  return p == null ? Infinity : p.minutes;
}

function compareRoutineRows(a, b) {
  const da = routineTimeMinutes(a.time);
  const db = routineTimeMinutes(b.time);
  if (da !== db) return da - db;
  return String(a.task || '').localeCompare(String(b.task || ''));
}

export function renderRoutines() {
  els.widgets.querySelectorAll('.routine').forEach((r) => r.remove());
  for (const routine of state.routines) renderRoutine(routine);
  const changed = layoutRow(state.routines, (id) => els.widgets.querySelector('.routine[data-routine-id="' + id + '"]'), 0.7);
  if (changed) saveState();
}

function renderRoutine(routine) {
  const el = document.createElement('div');
  el.className = 'routine' + (routine.collapsed ? ' collapsed' : '') + (routine.h || routine.hpct ? ' fixed' : '');
  el.dataset.routineId = routine.id;
  el.style.left = clampPct(routine.x) + '%';
  el.style.top = clampPct(routine.y) + '%';
  if (routine.wpct != null) el.style.width = routine.wpct + 'vw';
  else if (routine.w) el.style.width = Math.max(240, routine.w) + 'px';
  if (routine.hpct != null) el.style.height = routine.hpct + 'vh';
  else if (routine.h) el.style.height = routine.h + 'px';

  el.innerHTML =
    '<div class="routine-header">' +
      '<button type="button" class="icon-btn routine-pin-btn" title="Pin">📌</button>' +
      '<input class="routine-title" type="text" value="' + escapeHtml(routine.title || '') + '" placeholder="Routine" title="Routine name">' +
      '<button type="button" class="icon-btn routine-collapse-btn" title="' + (routine.collapsed ? 'Expand' : 'Collapse') + '">' + (routine.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn routine-delete-btn" title="Delete routine">✕</button>' +
    '</div>' +
    '<div class="routine-body">' +
      '<div class="routine-head">' +
        '<span class="routine-col routine-col-check">✓</span>' +
        '<span class="routine-col routine-col-time">Time</span>' +
        '<span class="routine-col routine-col-task">Task</span>' +
        '<span class="routine-col routine-col-remarks">Remarks</span>' +
      '</div>' +
      '<div class="routine-rows"></div>' +
      '<form class="routine-add">' +
        '<input class="routine-time-input" type="text" placeholder="10:15 am" autocomplete="off">' +
        '<input class="routine-task-input" type="text" placeholder="Task" autocomplete="off">' +
        '<input class="routine-remarks-input" type="text" placeholder="Remarks" autocomplete="off">' +
        '<button type="submit" class="routine-submit" title="Add row">＋</button>' +
      '</form>' +
    '</div>' +
    '<div class="routine-resize" title="Drag to resize — double-click to reset"></div>';

  const rowsEl = el.querySelector('.routine-rows');
  const renderRows = () => {
    (routine.rows || []).sort(compareRoutineRows);
    rowsEl.innerHTML = '';
    for (const row of routine.rows || []) renderRoutineRow(rowsEl, row, routine, renderRows);
  };
  renderRows();

  el.querySelector('.routine-title').addEventListener('input', (e) => {
    routine.title = e.target.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.routine-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    routine.collapsed = !routine.collapsed;
    el.classList.toggle('collapsed', routine.collapsed);
    collapseBtn.textContent = routine.collapsed ? '＋' : '–';
    collapseBtn.title = routine.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.routine-pin-btn'), routine);

  el.querySelector('.routine-delete-btn').addEventListener('click', () => {
    state.routines = state.routines.filter((r) => r.id !== routine.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.routine-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    routine.w = Math.round(w);
    routine.h = Math.round(h);
    routine.wpct = round3((w / window.innerWidth) * 100);
    routine.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    saveState();
  }, {
    minW: Math.max(240, Math.round(window.innerWidth * 0.16)),
    minH: Math.max(120, Math.round(window.innerHeight * 0.18)),
    disabled: () => routine.pinned,
  });
  resizeHandle.addEventListener('dblclick', () => {
    delete routine.w;
    delete routine.h;
    delete routine.wpct;
    delete routine.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    saveState();
  });

  el.querySelector('.routine-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = el.querySelector('.routine-time-input');
    const task = el.querySelector('.routine-task-input');
    const remarks = el.querySelector('.routine-remarks-input');
    const taskVal = task.value.trim();
    const timeVal = time.value.trim();
    const remarksVal = remarks.value.trim();
    if (!timeVal && !taskVal && !remarksVal) return;
    if (!routine.rows) routine.rows = [];
    routine.rows.push({ id: uid(), time: normalizeRoutineTime(timeVal), task: taskVal, remarks: remarksVal, done: false });
    time.value = '';
    task.value = '';
    remarks.value = '';
    renderRows();
    saveState();
  });

  makeDraggable(el, el, () => {
    routine.x = pct(el.style.left);
    routine.y = pct(el.style.top);
    saveState();
  }, { disabled: () => routine.pinned });

  els.widgets.appendChild(el);
}

function renderRoutineRow(rowsEl, row, routine, rerender) {
  const li = document.createElement('div');
  li.className = 'routine-row' + (row.done ? ' done' : '');
  li.innerHTML =
    '<button type="button" class="icon-btn routine-check-btn" title="' + (row.done ? 'Mark not done' : 'Mark as done') + '">' + (row.done ? '✓' : '○') + '</button>' +
    '<span class="routine-col routine-col-time" contenteditable="true" spellcheck="false">' + escapeHtml(row.time) + '</span>' +
    '<span class="routine-col routine-col-task" contenteditable="true" spellcheck="false">' + escapeHtml(row.task) + '</span>' +
    '<span class="routine-col routine-col-remarks" contenteditable="true" spellcheck="false">' + escapeHtml(row.remarks) + '</span>' +
    '<button type="button" class="icon-btn routine-row-del" title="Delete row">✕</button>';

  const bindCell = (cell, key) => {
    cell.addEventListener('blur', () => {
      let val = cell.textContent.trim();
      if (key === 'time') val = normalizeRoutineTime(val);
      row[key] = val;
      if (!row.time && !row.task && !row.remarks) {
        routine.rows = (routine.rows || []).filter((r) => r.id !== row.id);
        if (rerender) rerender();
      }
      saveState();
    });
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cell.blur();
      }
    });
  };
  bindCell(li.querySelector('.routine-col-time'), 'time');
  bindCell(li.querySelector('.routine-col-task'), 'task');
  bindCell(li.querySelector('.routine-col-remarks'), 'remarks');

  li.querySelector('.routine-check-btn').addEventListener('click', () => {
    row.done = !row.done;
    li.classList.toggle('done', row.done);
    const b = li.querySelector('.routine-check-btn');
    b.textContent = row.done ? '✓' : '○';
    b.title = row.done ? 'Mark not done' : 'Mark as done';
    saveState();
  });

  li.querySelector('.routine-row-del').addEventListener('click', () => {
    routine.rows = (routine.rows || []).filter((r) => r.id !== row.id);
    li.remove();
    saveState(true);
  });

  rowsEl.appendChild(li);
}

export function addRoutine() {
  const routine = { id: uid(), title: '', rows: [], collapsed: false, pinned: false };
  state.routines.push(routine);
  saveState();
  renderRoutines();
}

