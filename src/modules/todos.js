import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { layoutRow, round3 } from '../ui/layout.js';
import { bindPin, makeDraggable, makeResizable } from '../ui/drag.js';
import { clampPct, escapeHtml, pct, uid } from '../shared/utils.js';



export function renderTodos() {
  els.widgets.querySelectorAll('.todo').forEach((t) => t.remove());
  for (const todo of state.todos) renderTodo(todo);
  const changed = layoutRow(state.todos, (id) => els.widgets.querySelector('.todo[data-todo-id="' + id + '"]'), 0.76);
  if (changed) saveState();
}

function renderTodo(todo) {
  const el = document.createElement('div');
  el.className = 'todo' + (todo.collapsed ? ' collapsed' : '') + (todo.h || todo.hpct ? ' fixed' : '');
  el.dataset.todoId = todo.id;
  el.style.left = clampPct(todo.x) + '%';
  el.style.top = clampPct(todo.y) + '%';
  if (todo.wpct != null) el.style.width = todo.wpct + 'vw';
  else if (todo.w) el.style.width = Math.max(200, todo.w) + 'px';
  if (todo.hpct != null) el.style.height = todo.hpct + 'vh';
  else if (todo.h) el.style.height = todo.h + 'px';

  el.innerHTML =
    '<div class="todo-header">' +
      '<button type="button" class="icon-btn todo-pin-btn" title="Pin">📌</button>' +
      '<input class="todo-title" type="text" value="' + escapeHtml(todo.title || '') + '" placeholder="To-Dos" title="List name">' +
      '<button type="button" class="icon-btn todo-collapse-btn" title="' + (todo.collapsed ? 'Expand' : 'Collapse') + '">' + (todo.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn todo-delete-btn" title="Delete list">✕</button>' +
    '</div>' +
    '<ul class="todo-list"></ul>' +
    '<form class="todo-add">' +
      '<input class="todo-input" type="text" placeholder="Add a task…" autocomplete="off">' +
      '<button type="submit" class="todo-submit" title="Add task">＋</button>' +
    '</form>' +
    '<div class="todo-resize" title="Drag to resize — double-click to reset"></div>';

  const listEl = el.querySelector('.todo-list');
  const renderTasks = () => {
    listEl.innerHTML = '';
    for (const task of sortByPriority(todo.tasks)) renderTask(listEl, task, todo, renderTasks);
  };
  renderTasks();
  el.querySelector('.todo-title').addEventListener('input', (e) => {
    todo.title = e.target.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.todo-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    todo.collapsed = !todo.collapsed;
    el.classList.toggle('collapsed', todo.collapsed);
    collapseBtn.textContent = todo.collapsed ? '＋' : '–';
    collapseBtn.title = todo.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.todo-pin-btn'), todo);

  el.querySelector('.todo-delete-btn').addEventListener('click', () => {
    state.todos = state.todos.filter((t) => t.id !== todo.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.todo-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    todo.w = Math.round(w);
    todo.h = Math.round(h);
    todo.wpct = round3((w / window.innerWidth) * 100);
    todo.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    saveState();
  }, { disabled: () => todo.pinned });
  resizeHandle.addEventListener('dblclick', () => {
    delete todo.w;
    delete todo.h;
    delete todo.wpct;
    delete todo.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    saveState();
  });

  el.querySelector('.todo-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = el.querySelector('.todo-input');
    const text = input.value.trim();
    if (!text) return;
    if (!todo.tasks) todo.tasks = [];
    todo.tasks.push({ id: uid(), text: text, done: false });
    input.value = '';
    renderTasks();
    saveState();
  });

  makeDraggable(el, el, () => {
    todo.x = pct(el.style.left);
    todo.y = pct(el.style.top);
    saveState();
  }, { disabled: () => todo.pinned });

  els.widgets.appendChild(el);
}

function removeTask(container, id) {
  if (!container) return;
  for (const list of [container.tasks, container.subtasks]) {
    if (!Array.isArray(list)) continue;
    const idx = list.findIndex((t) => t && t.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      return;
    }
  }
  for (const t of (container.tasks || []).concat(container.subtasks || [])) {
    if (t && Array.isArray(t.subtasks)) removeTask(t, id);
  }
}

function moveTask(container, id, dir) {
  if (!container) return false;
  for (const key of ['tasks', 'subtasks']) {
    const list = container[key];
    if (!Array.isArray(list) || !list.some((t) => t && t.id === id)) continue;
    const sorted = sortByPriority(list);
    const idx = sorted.findIndex((t) => t && t.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return false;
    const tmp = sorted[idx];
    sorted[idx] = sorted[swap];
    sorted[swap] = tmp;
    list.length = 0;
    for (const t of sorted) list.push(t);
    return true;
  }
  return false;
}

const PRIORITY_LEVELS = ['none', 'low', 'med', 'high'];

function taskPriority(task) {
  return PRIORITY_LEVELS.includes(task && task.priority) ? task.priority : 'none';
}

const PRIORITY_RANK = { high: 0, med: 1, low: 2, none: 3 };

function sortByPriority(list) {
  return [...(list || [])].sort((a, b) =>
    PRIORITY_RANK[taskPriority(a)] - PRIORITY_RANK[taskPriority(b)]);
}

function renderTask(listEl, task, container, rerender) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (task.done ? ' done' : '') +
    (taskPriority(task) !== 'none' ? ' p-' + taskPriority(task) : '');
  li.innerHTML =
    '<button type="button" class="todo-check" title="' + (task.done ? 'Mark as not done' : 'Mark as done') + '">' + (task.done ? '✓' : '') + '</button>' +
    '<button type="button" class="todo-sub-toggle" title="Add subtask">＋</button>' +
    '<span class="todo-text" contenteditable="true" spellcheck="false">' + escapeHtml(task.text) + '</span>' +
    '<button type="button" class="todo-move-btn" data-move="-1" title="Move up">↑</button>' +
    '<button type="button" class="todo-move-btn" data-move="1" title="Move down">↓</button>' +
    '<button type="button" class="icon-btn todo-item-del" title="Delete task">✕</button>' +
    '<span class="todo-urgency">' +
      '<label class="urgency-check u-low" title="Low urgency"><input type="checkbox" value="low" tabindex="-1"><i></i></label>' +
      '<label class="urgency-check u-med" title="Medium urgency"><input type="checkbox" value="med" tabindex="-1"><i></i></label>' +
      '<label class="urgency-check u-high" title="High urgency"><input type="checkbox" value="high" tabindex="-1"><i></i></label>' +
    '</span>' +
    '<div class="todo-subarea">' +
      '<ul class="todo-subs"></ul>' +
    '</div>';

  const subsEl = li.querySelector('.todo-subs');
  const renderSubs = () => {
    subsEl.innerHTML = '';
    for (const sub of sortByPriority(task.subtasks)) renderTask(subsEl, sub, task, renderSubs);
  };
  if (task.subtasks && task.subtasks.length) li.classList.add('sub-open');
  renderSubs();

  li.querySelector('.todo-check').addEventListener('click', () => {
    task.done = !task.done;
    li.classList.toggle('done', task.done);
    li.querySelector('.todo-check').textContent = task.done ? '✓' : '';
    li.querySelector('.todo-check').title = task.done ? 'Mark as not done' : 'Mark as done';
    saveState();
  });

  li.querySelector('.todo-item-del').addEventListener('click', () => {
    removeTask(container, task.id);
    li.remove();
    saveState(true);
  });

  li.querySelectorAll('.todo-move-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.move);
      if (moveTask(container, task.id, dir)) {
        if (rerender) rerender();
        saveState();
      }
    });
  });

  const urgencyWrap = li.querySelector('.todo-urgency');
  const syncUrgency = () => {
    const cur = taskPriority(task);
    urgencyWrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = cb.value === cur;
    });
  };
  urgencyWrap.addEventListener('change', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    task.priority = e.target.checked && PRIORITY_LEVELS.includes(e.target.value) ? e.target.value : 'none';
    syncUrgency();
    saveState();
    if (rerender) rerender();
  });
  syncUrgency();

  li.querySelector('.todo-sub-toggle').addEventListener('click', () => {
    if (!task.subtasks) task.subtasks = [];
    const sub = { id: uid(), text: '', done: false };
    task.subtasks.push(sub);
    li.classList.add('sub-open');
    renderSubs();
    saveState();
    const newText = subsEl.querySelector('.todo-item:last-child .todo-text');
    if (newText) newText.focus();
  });

  const span = li.querySelector('.todo-text');
  span.addEventListener('blur', () => {
    task.text = span.textContent.trim();
    if (!task.text) {
      removeTask(container, task.id);
      li.remove();
    }
    saveState();
  });
  span.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      span.blur();
    }
  });

  listEl.appendChild(li);
}

export function addTodo() {
  const todo = { id: uid(), title: '', tasks: [], collapsed: false, pinned: false };
  state.todos.push(todo);
  saveState();
  renderTodos();
}

