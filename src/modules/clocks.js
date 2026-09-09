import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { bindPin, makeDraggable } from '../ui/drag.js';
import { layoutRow } from '../ui/layout.js';
import { clampPct, escapeHtml, pct } from '../shared/utils.js';

export const TZ_PRESETS = [
  ['UTC', 'UTC'],
  ['America/New_York', 'New York'],
  ['America/Chicago', 'Chicago'],
  ['America/Denver', 'Denver'],
  ['America/Los_Angeles', 'Los Angeles'],
  ['America/Anchorage', 'Anchorage'],
  ['America/Toronto', 'Toronto'],
  ['America/Mexico_City', 'Mexico City'],
  ['America/Sao_Paulo', 'Sao Paulo'],
  ['America/Argentina/Buenos_Aires', 'Buenos Aires'],
  ['Europe/London', 'London'],
  ['Europe/Paris', 'Paris'],
  ['Europe/Berlin', 'Berlin'],
  ['Europe/Madrid', 'Madrid'],
  ['Europe/Rome', 'Rome'],
  ['Europe/Moscow', 'Moscow'],
  ['Europe/Istanbul', 'Istanbul'],
  ['Africa/Cairo', 'Cairo'],
  ['Africa/Lagos', 'Lagos'],
  ['Africa/Nairobi', 'Nairobi'],
  ['Africa/Johannesburg', 'Johannesburg'],
  ['Asia/Dubai', 'Dubai'],
  ['Asia/Karachi', 'Karachi'],
  ['Asia/Kolkata', 'New Delhi'],
  ['Asia/Kathmandu', 'Kathmandu'],
  ['Asia/Dhaka', 'Dhaka'],
  ['Asia/Bangkok', 'Bangkok'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Hong_Kong', 'Hong Kong'],
  ['Asia/Shanghai', 'Shanghai'],
  ['Asia/Tokyo', 'Tokyo'],
  ['Asia/Seoul', 'Seoul'],
  ['Australia/Perth', 'Perth'],
  ['Australia/Sydney', 'Sydney'],
  ['Australia/Melbourne', 'Melbourne'],
  ['Pacific/Auckland', 'Auckland'],
];

let allTz = null;
const clockFormatters = new Map();
const clockEls = new Map();

function tzFriendly(tz) {
  const hit = TZ_PRESETS.find(([v]) => v === tz);
  return hit ? hit[1] : tz.split('/').pop().replace(/_/g, ' ');
}

function tzOptionsHtml(selected) {
  let html = '';
  for (const [v, label] of TZ_PRESETS) {
    html += '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + label + '</option>';
  }
  if (!allTz) {
    try {
      allTz = Intl.supportedValuesOf('timeZone')
        .filter((tz) => !TZ_PRESETS.some(([v]) => v === tz))
        .sort();
    } catch (e) {
      allTz = [];
    }
  }
  if (allTz.length) {
    html += '<optgroup label="All timezones">';
    for (const tz of allTz) {
      html += '<option value="' + tz + '"' + (tz === selected ? ' selected' : '') + '>' + tz + '</option>';
    }
    html += '</optgroup>';
  }
  return html;
}

function clockParts(timezone) {
  let f = clockFormatters.get(timezone);
  if (!f) {
    f = {
      time: new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      date: new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    };
    clockFormatters.set(timezone, f);
  }
  const now = new Date();
  return { time: f.time.format(now), date: f.date.format(now) };
}

export function renderClocks() {
  els.widgets.querySelectorAll('.clock').forEach((c) => c.remove());
  clockEls.clear();
  for (const clock of state.clocks) renderClock(clock);
  const changed = layoutRow(state.clocks, (id) => els.widgets.querySelector('.clock[data-clock-id="' + id + '"]'), 0.42);
  if (changed) saveState();
}

export function renderClock(clock) {
  const el = document.createElement('div');
  el.className = 'clock';
  el.dataset.clockId = clock.id;
  el.style.left = clampPct(clock.x) + '%';
  el.style.top = clampPct(clock.y) + '%';

  el.innerHTML =
    '<div class="clock-header">' +
      '<button type="button" class="icon-btn clock-pin-btn" title="Pin">📌</button>' +
      '<input class="clock-label" type="text" value="' + escapeHtml(clock.label || tzFriendly(clock.timezone)) + '" title="Clock name (drag to move)">' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn clock-delete-btn" title="Remove clock">✕</button>' +
    '</div>' +
    '<div class="clock-time" data-clock-time>--:--:--</div>' +
    '<div class="clock-date" data-clock-date></div>' +
    '<select class="tz-select" title="Change timezone">' + tzOptionsHtml(clock.timezone) + '</select>';

  const timeEl = el.querySelector('[data-clock-time]');
  const dateEl = el.querySelector('[data-clock-date]');
  clockEls.set(clock.id, { timeEl, dateEl });

  const p = clockParts(clock.timezone);
  timeEl.textContent = p.time;
  dateEl.textContent = p.date;

  el.querySelector('.clock-label').addEventListener('input', (e) => {
    clock.label = e.target.value;
    saveState();
  });

  el.querySelector('.tz-select').addEventListener('change', (e) => {
    clock.timezone = e.target.value;
    if (!clock.label || clock.label === tzFriendly(clock.timezone)) clock.label = tzFriendly(e.target.value);
    saveState();
    renderClocks();
  });

  el.querySelector('.clock-delete-btn').addEventListener('click', () => {
    state.clocks = state.clocks.filter((c) => c.id !== clock.id);
    clockEls.delete(clock.id);
    el.remove();
    saveState(true);
  });

  bindPin(el, el.querySelector('.clock-pin-btn'), clock);

  makeDraggable(el, el, () => {
    clock.x = pct(el.style.left);
    clock.y = pct(el.style.top);
    saveState();
  }, { disabled: () => clock.pinned });

  els.widgets.appendChild(el);
}

export function updateAllClocks() {
  for (const [id, clockEl] of clockEls) {
    const clock = state.clocks.find((c) => c.id === id);
    const p = clockParts(clock ? clock.timezone : 'UTC');
    clockEl.timeEl.textContent = p.time;
    clockEl.dateEl.textContent = p.date;
  }
}