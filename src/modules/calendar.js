import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { clampPct, pct, uid } from '../shared/utils.js';
import { bindPin, makeDraggable, makeResizable } from '../ui/drag.js';
import { layoutRow } from '../ui/layout.js';
import {
  CALENDAR_KEY, CALENDAR_US_MONTHS, CALENDAR_BS_MONTHS, CALENDAR_BS_MONTHS_SHORT, CALENDAR_WEEKDAYS, CALENDAR_BS_ANCHOR_UTC, CALENDAR_BS_DAYS, CALENDAR_MARKS, CALENDAR_DAY_MS,
} from '../shared/calendar-data.js';



let calendar = null;
let calEls = null;
let calGraphOpen = false;
let calTipKey = null;
let calTipPinned = false;
let calTipHideTimer = null;
let calTipHost = null;
const CAL_TIP_BACK_DAYS = 20;
const CAL_TIP_FWD_DAYS = 5;
const CAL_WIDGET_ASPECT = 1.15;

function calPad(n) {
  return String(n).padStart(2, '0');
}

function calKey(y, m, d) {
  return y + '-' + calPad(m + 1) + '-' + calPad(d);
}

function calParseKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key));
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

function calTodayParts() {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
}

function bsYearDays(by) {
  return CALENDAR_BS_DAYS[by] ? CALENDAR_BS_DAYS[by].reduce((a, b) => a + b, 0) : 365;
}

function bsMonthDays(by, bm) {
  const y = CALENDAR_BS_DAYS[by];
  return y && y[bm - 1] ? y[bm - 1] : 30;
}

function adToBs(y, m, d) {
  const dayNum = Math.floor(Date.UTC(y, m, d) / CALENDAR_DAY_MS);
  const anchorNum = Math.floor(CALENDAR_BS_ANCHOR_UTC / CALENDAR_DAY_MS);
  let diff = Math.max(0, dayNum - anchorNum);
  let bsYear = 2000;
  while (bsYear < 2100) {
    const dim = bsYearDays(bsYear);
    if (diff < dim) break;
    diff -= dim;
    bsYear++;
  }
  let bsMonth = 1;
  while (bsMonth < 12) {
    const dim = bsMonthDays(bsYear, bsMonth);
    if (diff < dim) break;
    diff -= dim;
    bsMonth++;
  }
  return { year: bsYear, month: bsMonth, day: Math.min(diff, bsMonthDays(bsYear, bsMonth)) + 1 };
}

function calRatingStyle(r) {
  const v = Math.min(10, Math.max(1, Number(r) || 1));
  const hue = (120 * (v - 1)) / 9;
  const sat = 85;
  const lite = 48 + v * 0.8;
  return { hue, sat, lite };
}

function calRatingBg(r) {
  const s = calRatingStyle(r);
  return 'hsla(' + s.hue + ',' + s.sat + '%,' + s.lite + '%,0.44)';
}

function calRatingColor(r) {
  const s = calRatingStyle(r);
  return 'hsl(' + s.hue + ',' + s.sat + '%,' + s.lite + '%)';
}

function loadCalendarState() {
  const parts = calTodayParts();
  const todayKey = calKey(parts.y, parts.m, parts.d);
  const def = { viewYear: parts.y, viewMonth: parts.m, selected: todayKey, days: {} };
  try {
    const raw = localStorage.getItem(CALENDAR_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      if (c && typeof c === 'object') {
        const days = c.days && typeof c.days === 'object' ? c.days : {};
        const sel = calParseKey(c.selected) ? c.selected : todayKey;
        let vy = Math.round(Number(c.viewYear));
        let vm = Math.round(Number(c.viewMonth));
        if (!isFinite(vy) || !isFinite(vm) || vy < 1943 || vy > 2043) {
          vy = parts.y;
          vm = parts.m;
        } else {
          vm = Math.min(11, Math.max(0, vm));
        }
        const clean = {};
        for (const k of Object.keys(days)) {
          const p = calParseKey(k);
          if (!p) continue;
          const d = days[k] && typeof days[k] === 'object' ? days[k] : {};
          const rec = {};
          const rating = Number(d.rating);
          if (isFinite(rating) && rating >= 1 && rating <= 10) rec.rating = Math.round(rating);
          if (typeof d.note === 'string' && d.note.trim()) rec.note = d.note.trim();
          if (CALENDAR_MARKS[d.mark]) rec.mark = d.mark;
          if (rec.rating || rec.note || rec.mark) clean[k] = rec;
        }
        return { viewYear: vy, viewMonth: vm, selected: sel, days: clean };
      }
    }
  } catch (e) {
    /* fall through to defaults */
  }
  return def;
}

function saveCalendarState() {
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar));
  } catch (e) {
    /* ignore */
  }
}

function calEntry(key) {
  return calendar.days[key] || null;
}

function calPatch(key, patch) {
  const cur = calendar.days[key] || {};
  const next = Object.assign({}, cur, patch);
  if (!next.rating && !next.note && !next.mark) {
    delete calendar.days[key];
  } else {
    calendar.days[key] = next;
  }
  saveCalendarState();
}

function calendarSelectedParts() {
  const p = calParseKey(calendar.selected);
  return p || calTodayParts();
}

function calBuildGrid(daysInMonth, offset, todayKey) {
  const vy = calendar.viewYear;
  const vm = calendar.viewMonth;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div');
    e.className = 'calendar-day empty';
    frag.appendChild(e);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = calKey(vy, vm, d);
    const bs = adToBs(vy, vm, d);
    const entry = calEntry(key);
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.dataset.key = key;

    if (key === todayKey) cell.classList.add('today');
    if (key === calendar.selected) cell.classList.add('selected');

    if (entry && entry.rating) cell.style.background = calRatingBg(entry.rating);
    if (entry && entry.mark) {
      let shadow = 'inset 0 0 0 2px ' + CALENDAR_MARKS[entry.mark].color;
      if (key === calendar.selected) shadow += ', 0 0 0 2px var(--accent-soft)';
      cell.style.boxShadow = shadow;
      const dot = document.createElement('span');
      dot.className = 'calendar-day-mark';
      dot.style.background = CALENDAR_MARKS[entry.mark].color;
      dot.title = CALENDAR_MARKS[entry.mark].label;
      cell.appendChild(dot);
    }

    const en = document.createElement('div');
    en.className = 'calendar-day-en';
    en.textContent = String(d);
    cell.appendChild(en);

    const bsl = document.createElement('div');
    bsl.className = 'calendar-day-bs';
    bsl.textContent = (bs.day === 1 ? CALENDAR_BS_MONTHS_SHORT[bs.month - 1] + ' ' : '') + bs.day;
    cell.appendChild(bsl);

    if (entry && entry.note) {
      const note = document.createElement('div');
      note.className = 'calendar-day-note';
      note.textContent = entry.note;
      note.title = entry.note;
      cell.appendChild(note);
    }

    cell.addEventListener('mouseenter', () => calTipShowFromHover(cell, key));
    cell.addEventListener('mouseleave', scheduleCalTipHide);

    frag.appendChild(cell);
  }
  const remainder = offset + daysInMonth;
  for (let i = remainder; i % 7 !== 0; i++) {
    const e = document.createElement('div');
    e.className = 'calendar-day empty';
    frag.appendChild(e);
  }
  return frag;
}

function calHostDayCell(key, host) {
  if (!host || !host.querySelector) return null;
  return host.querySelector('.calendar-day[data-key="' + key + '"]');
}

function renderCalendar() {
  if (!calEls) return;
  const keepKey = calTipPinned && calTipKey ? calTipKey : null;
  calTipPinned = keepKey ? true : false;
  hideCalTooltip();

  const vy = calendar.viewYear;
  const vm = calendar.viewMonth;
  const today = calTodayParts();
  const todayKey = calKey(today.y, today.m, today.d);
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const offset = new Date(vy, vm, 1).getDay();

  const firstBs = adToBs(vy, vm, 1);
  const lastBs = adToBs(vy, vm, daysInMonth);
  let bsTitle;
  if (firstBs.year === lastBs.year && firstBs.month === lastBs.month) {
    bsTitle = CALENDAR_BS_MONTHS[firstBs.month - 1] + ' ' + firstBs.year;
  } else if (firstBs.year === lastBs.year) {
    bsTitle = CALENDAR_BS_MONTHS[firstBs.month - 1] + '–' + CALENDAR_BS_MONTHS[lastBs.month - 1] + ' ' + firstBs.year;
  } else {
    bsTitle = CALENDAR_BS_MONTHS[firstBs.month - 1] + ' ' + firstBs.year + ' – ' + CALENDAR_BS_MONTHS[lastBs.month - 1] + ' ' + lastBs.year;
  }

  const enTitle = CALENDAR_US_MONTHS[vm] + ' ' + vy;
  calEls.enTitle.textContent = enTitle;
  calEls.bsTitle.textContent = bsTitle;
  calEls.prevBtn.disabled = vy === 1943 && vm === 3;
  calEls.nextBtn.disabled = vy === 2043 && vm === 3;

  const frag = calBuildGrid(daysInMonth, offset, todayKey);
  calEls.grid.innerHTML = '';
  calEls.grid.appendChild(frag);

  for (const item of state.calendars) {
    const el = els.widgets.querySelector('.cal-widget[data-cal-widget-id="' + item.id + '"]');
    if (!el) continue;
    el.querySelector('.cal-widget-en-title').textContent = enTitle;
    el.querySelector('.cal-widget-bs-title').textContent = bsTitle;
    const wgrid = el.querySelector('.cal-widget-grid');
    wgrid.innerHTML = '';
    wgrid.appendChild(calBuildGrid(daysInMonth, offset, todayKey));
  }

  renderCalendarGraph();

  if (keepKey) {
    let cell = calHostDayCell(keepKey, calTipHost);
    if (!cell) cell = document.querySelector('.calendar-day[data-key="' + keepKey + '"]');
    if (cell) calTipSync(keepKey, true, cell);
    else hideCalTooltip();
  }
}

function calTipSync(key, pinned, cell) {
  if (!calEls || !calEls.tooltip) return;
  const p = calParseKey(key);
  if (!p) return;
  calTipKey = key;
  calTipPinned = pinned;
  calTipHost = cell ? (cell.closest('.calendar-shell') || null) : null;
  const entry = calEntry(key);
  const bs = adToBs(p.y, p.m, p.d);
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dd = new Date(p.y, p.m, p.d);
  const rating = entry ? entry.rating : null;
  const mark = entry ? entry.mark : null;
  const note = entry ? entry.note : '';

  calEls.tip.en.textContent = weekdayNames[dd.getDay()] + ', ' + CALENDAR_US_MONTHS[p.m].slice(0, 3) + ' ' + p.d + ', ' + p.y;
  calEls.tip.bs.textContent = CALENDAR_BS_MONTHS[bs.month - 1] + ' ' + bs.day + ', ' + bs.year + ' BS';
  calEls.tip.rateBtns.forEach((b) => b.classList.toggle('active', rating === Number(b.dataset.rate)));
  calEls.tip.markBtns.forEach((b) => b.classList.toggle('active', mark === b.dataset.mark));
  calEls.tip.note.value = note;
  calEls.tip.root.classList.toggle('pinned', pinned);
  positionCalTip(cell);
}

function positionCalTip(cell) {
  const tip = calEls.tooltip;
  if (!cell) {
    hideCalTooltip();
    return;
  }
  clearTimeout(calTipHideTimer);
  const cellRect = cell.getBoundingClientRect();
  if (!isFinite(cellRect.width)) {
    hideCalTooltip();
    return;
  }
  const host = cell.closest('.calendar-shell');
  const hostRect = host ? host.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  if (!isFinite(hostRect.width)) {
    hideCalTooltip();
    return;
  }
  const hostLeft = hostRect.width ? hostRect.left : 0;
  const hostTop = hostRect.height ? hostRect.top : 0;
  const hostRight = hostRect.width ? hostRect.right : window.innerWidth;
  const hostBottom = hostRect.height ? hostRect.bottom : window.innerHeight;

  tip.classList.add('show');
  tip.style.visibility = 'hidden';
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  let left = cellRect.left + cellRect.width / 2 - tw / 2;
  const minLeft = hostLeft + 6;
  const maxLeft = hostRight - tw - 6;
  if (left < minLeft) left = minLeft;
  if (left > maxLeft) left = Math.max(minLeft, maxLeft);
  let top = cellRect.top - th - 8;
  if (top < hostTop + 4) top = cellRect.bottom + 8;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
  tip.style.visibility = 'visible';
}

function calTipShowFromHover(cell, key) {
  if (calTipPinned && calTipKey !== key) return;
  clearTimeout(calTipHideTimer);
  calTipSync(key, calTipPinned, cell);
}

function scheduleCalTipHide() {
  if (calTipPinned) return;
  clearTimeout(calTipHideTimer);
  calTipHideTimer = setTimeout(() => {
    if (calEls && calEls.tooltip) calEls.tooltip.classList.remove('show');
  }, 180);
}

function hideCalTooltip() {
  clearTimeout(calTipHideTimer);
  if (calEls && calEls.tooltip) calEls.tooltip.classList.remove('show');
}

function calTipClose() {
  calTipKey = null;
  calTipPinned = false;
  hideCalTooltip();
}

function renderCalendarGraph() {
  if (!calEls) return;

  const t = calTodayParts();
  const days = [];
  const start = new Date(t.y, t.m, t.d - CAL_TIP_BACK_DAYS);
  const end = new Date(t.y, t.m, t.d + CAL_TIP_FWD_DAYS);
  const dt = new Date(start);
  while (dt <= end) {
    const yy = dt.getFullYear();
    const mm = dt.getMonth();
    const dd = dt.getDate();
    days.push({ y: yy, m: mm, d: dd, key: calKey(yy, mm, dd) });
    dt.setDate(dt.getDate() + 1);
  }
  const fmt = (day) => CALENDAR_US_MONTHS[day.m].slice(0, 3) + ' ' + day.d + ', ' + day.y;
  const last = days[days.length - 1];
  calEls.graphTitle.textContent = 'Rating trend · ' + fmt(days[0]) + ' – ' + fmt(last);

  if (!calGraphOpen) return;

  const idxByKey = {};
  days.forEach((day, i) => { idxByKey[day.key] = i; });

  const ratedByKey = {};
  for (const day of days) {
    const e = calEntry(day.key);
    if (e && e.rating) ratedByKey[day.key] = e.rating;
  }

  if (Object.keys(ratedByKey).length === 0) {
    calEls.graphSvg.style.display = 'none';
    calEls.graphEmpty.classList.add('visible');
    return;
  }
  calEls.graphSvg.style.display = 'block';
  calEls.graphEmpty.classList.remove('visible');

  const W = 600;
  const H = 220;
  const padL = 40;
  const padR = 10;
  const padT = 12;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = days.length;
  const x = (idx) => padL + (idx / (n - 1)) * plotW;
  const y = (r) => padT + ((10 - r) / 9) * plotH;

  let html = '';
  for (let r = 1; r <= 10; r++) {
    const yy = y(r);
    html += '<line class="calendar-graph-gridline" x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '"/>';
    html += '<text class="calendar-graph-axis-label" x="' + (padL - 5) + '" y="' + (yy + 3) + '" text-anchor="end">' + r + '</text>';
  }
  const xStep = Math.max(1, Math.round((n - 1) / 5));
  const xIdx = new Set([0]);
  for (let i = xStep; i < n - 1; i += xStep) xIdx.add(i);
  xIdx.add(n - 1);
  for (const i of xIdx) {
    const day = days[i];
    html += '<text class="calendar-graph-axis-label" x="' + x(i) + '" y="' + (H - padB + 15) + '" text-anchor="middle" font-size="8.5">' +
      CALENDAR_US_MONTHS[day.m].slice(0, 3) + ' ' + day.d + '</text>';
  }

  const todayIdx = idxByKey[calKey(t.y, t.m, t.d)];
  if (todayIdx != null) {
    const tx = x(todayIdx);
    html += '<line class="calendar-graph-today" x1="' + tx + '" y1="' + padT + '" x2="' + tx + '" y2="' + (H - padB) + '"/>';
    html += '<text class="calendar-graph-today-label" x="' + tx + '" y="' + (padT - 3) + '" text-anchor="middle">today</text>';
  }

  const ratedKeys = Object.keys(ratedByKey).sort((a, b) => idxByKey[a] - idxByKey[b]);
  const rated = ratedKeys.map((k) => ({ key: k, rating: ratedByKey[k], idx: idxByKey[k] }));

  const segs = [];
  let cur = [];
  for (const r of rated) {
    if (cur.length && r.idx !== cur[cur.length - 1].idx + 1) {
      segs.push(cur);
      cur = [];
    }
    cur.push(r);
  }
  if (cur.length) segs.push(cur);

  for (const seg of segs) {
    if (seg.length < 2) continue;
    const pts = seg.map((r) => x(r.idx) + ',' + y(r.rating)).join(' ');
    html += '<polyline class="calendar-graph-line" points="' + pts + '"/>';
  }
  for (const r of rated) {
    html += '<circle class="calendar-graph-point" cx="' + x(r.idx) + '" cy="' + y(r.rating) + '" r="3.5" fill="' + calRatingColor(r.rating) + '"/>';
  }
  calEls.graphSvg.innerHTML = html;
}

function calBuildWeekdays(container) {
  container.innerHTML = '';
  CALENDAR_WEEKDAYS.forEach((w, i) => {
    const el = document.createElement('span');
    el.className = 'calendar-weekday' + (i === 0 || i === 6 ? ' weekend' : '');
    el.textContent = w;
    container.appendChild(el);
  });
}

function selectCalendarDay(key, cell) {
  if (!calParseKey(key)) return;
  calTipHost = cell ? (cell.closest('.calendar-shell') || null) : calTipHost;
  calendar.selected = key;
  calTipKey = null;
  calTipPinned = false;
  saveCalendarState();
  renderCalendar();
  const c = calHostDayCell(key, calTipHost) || document.querySelector('.calendar-day[data-key="' + key + '"]');
  calTipSync(key, true, c);
}

function shiftCalendarMonth(step) {
  const vy = calendar.viewYear;
  const vm = calendar.viewMonth;
  let ny = vy;
  let nm = vm + step;
  if (nm < 0) { nm = 11; ny -= 1; }
  if (nm > 11) { nm = 0; ny += 1; }
  if (ny < 1943 || ny > 2043) return;
  calendar.viewYear = ny;
  calendar.viewMonth = nm;
  calTipClose();
  saveCalendarState();
  renderCalendar();
}

function goCalendarToday() {
  const t = calTodayParts();
  calendar.viewYear = t.y;
  calendar.viewMonth = t.m;
  calendar.selected = calKey(t.y, t.m, t.d);
  calTipClose();
  saveCalendarState();
  renderCalendar();
}

export function openCalendar() {
  els.calendarOverlay.classList.add('open');
  calendar = loadCalendarState();
  renderCalendar();
}

export function closeCalendar() {
  calTipClose();
  els.calendarOverlay.classList.remove('open');
}

export function initCalendar() {
  calendar = loadCalendarState();
  calEls = {
    overlay: els.calendarOverlay,
    card: els.calendarOverlay.querySelector('.calendar-card'),
    prevBtn: els.calendarPrevBtn,
    nextBtn: els.calendarNextBtn,
    todayBtn: els.calendarTodayBtn,
    graphBtn: els.calendarGraphBtn,
    graph: els.calendarGraph,
    graphTitle: els.calendarGraphTitle,
    graphSvg: els.calendarGraphSvg,
    graphEmpty: els.calendarGraphEmpty,
    enTitle: els.calEnTitle,
    bsTitle: els.calBsTitle,
    weekdays: els.calendarWeekdays,
    grid: els.calendarGrid,
    tooltip: null,
    tip: null,
  };

  const tip = document.createElement('div');
  tip.className = 'calendar-tooltip';
  tip.innerHTML =
    '<div class="calendar-tooltip-head">' +
      '<div class="calendar-tooltip-date">' +
        '<span class="calendar-tooltip-date-en"></span>' +
        '<span class="calendar-tooltip-date-bs"></span>' +
      '</div>' +
      '<button type="button" class="calendar-tooltip-close" title="Close">✕</button>' +
    '</div>' +
    '<div class="calendar-tooltip-rate">' +
      '<span class="calendar-tooltip-label">Rate your day</span>' +
      '<div class="calendar-tooltip-rate-btns"></div>' +
    '</div>' +
    '<div class="calendar-tooltip-marks">' +
      '<span class="calendar-tooltip-label">Mark date</span>' +
      '<div class="calendar-tooltip-mark-btns"></div>' +
    '</div>' +
    '<input type="text" class="calendar-tooltip-note-input" maxlength="200" placeholder="Add a note…">';
  document.body.appendChild(tip);
  calEls.tooltip = tip;

  const rateWrap = tip.querySelector('.calendar-tooltip-rate-btns');
  const markWrap = tip.querySelector('.calendar-tooltip-mark-btns');
  const noteInput = tip.querySelector('.calendar-tooltip-note-input');
  const closeBtn = tip.querySelector('.calendar-tooltip-close');

  const rateBtns = [];
  for (let r = 1; r <= 10; r++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-tooltip-rate-btn';
    btn.dataset.rate = String(r);
    btn.textContent = String(r);
    btn.title = 'Rating ' + r + (r === 1 ? ' — unproductive' : r === 10 ? ' — productive' : '');
    btn.style.background = calRatingColor(r);
    rateWrap.appendChild(btn);
    rateBtns.push(btn);
  }

  const markBtns = [];
  for (const [key, mk] of Object.entries(CALENDAR_MARKS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-tooltip-mark-btn swatch';
    btn.dataset.mark = key;
    btn.style.background = mk.color;
    btn.title = mk.label;
    markWrap.appendChild(btn);
    markBtns.push(btn);
  }

  calEls.tip = {
    root: tip,
    en: tip.querySelector('.calendar-tooltip-date-en'),
    bs: tip.querySelector('.calendar-tooltip-date-bs'),
    close: closeBtn,
    rateBtns: rateBtns,
    markBtns: markBtns,
    note: noteInput,
  };

  calEls.weekdays.innerHTML = '';
  calBuildWeekdays(calEls.weekdays);

  calEls.card.addEventListener('scroll', () => {
    if (!calTipPinned) hideCalTooltip();
  });
  tip.addEventListener('mouseenter', () => clearTimeout(calTipHideTimer));
  tip.addEventListener('mouseleave', scheduleCalTipHide);
  tip.addEventListener('pointerdown', () => {
    if (calTipKey) {
      calTipPinned = true;
      tip.classList.add('pinned');
    }
  });
  closeBtn.addEventListener('click', calTipClose);

  noteInput.addEventListener('input', () => {
    if (!calTipKey) return;
    const text = noteInput.value.trim();
    if (text) calPatch(calTipKey, { note: text });
    else calPatch(calTipKey, { note: null });
    document.querySelectorAll('.calendar-day[data-key="' + calTipKey + '"]').forEach((cell) => {
      let noteEl = cell.querySelector('.calendar-day-note');
      if (text) {
        if (!noteEl) {
          noteEl = document.createElement('div');
          noteEl.className = 'calendar-day-note';
          cell.appendChild(noteEl);
        }
        noteEl.textContent = text;
        noteEl.title = text;
      } else if (noteEl) {
        noteEl.remove();
      }
    });
  });

  rateBtns.forEach((b) => {
    b.addEventListener('click', () => {
      if (!calTipKey) return;
      const r = Number(b.dataset.rate);
      const cur = calEntry(calTipKey);
      if (cur && cur.rating === r) calPatch(calTipKey, { rating: null });
      else calPatch(calTipKey, { rating: r });
      renderCalendar();
    });
  });

  markBtns.forEach((b) => {
    b.addEventListener('click', () => {
      if (!calTipKey) return;
      const key = b.dataset.mark;
      const cur = calEntry(calTipKey);
      if (cur && cur.mark === key) calPatch(calTipKey, { mark: null });
      else calPatch(calTipKey, { mark: key });
      renderCalendar();
    });
  });

  els.calendarBtn.addEventListener('click', openCalendar);
  els.closeCalendarBtn.addEventListener('click', closeCalendar);
  els.calendarOverlay.addEventListener('click', (e) => {
    if (e.target === els.calendarOverlay) closeCalendar();
  });
  document.addEventListener('click', (e) => {
    if (!calEls || !calEls.tooltip) return;
    if (e.target.closest('.calendar-tooltip')) return;
    if (e.target.closest('.calendar-day[data-key]')) return;
    if (calTipPinned || calEls.tooltip.classList.contains('show')) calTipClose();
  });
  calEls.prevBtn.addEventListener('click', () => shiftCalendarMonth(-1));
  calEls.nextBtn.addEventListener('click', () => shiftCalendarMonth(1));
  calEls.todayBtn.addEventListener('click', goCalendarToday);
  calEls.graphBtn.addEventListener('click', () => {
    calGraphOpen = !calGraphOpen;
    calEls.graph.classList.toggle('open', calGraphOpen);
    calEls.graphBtn.textContent = calGraphOpen ? '📉 Hide graph' : '📈 Graph';
    calEls.graphBtn.title = calGraphOpen ? 'Hide rating trend graph' : 'Show rating trend graph';
    if (calGraphOpen) renderCalendarGraph();
  });

  calEls.grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day[data-key]');
    if (cell) selectCalendarDay(cell.dataset.key, cell);
  });
}



export function addCalendar() {
  const item = { id: uid(), collapsed: false, pinned: false };
  state.calendars.push(item);
  saveState();
  renderCalendarWidgets();
}

export function renderCalendarWidgets() {
  els.widgets.querySelectorAll('.cal-widget').forEach((w) => w.remove());
  for (const item of state.calendars) renderCalendarWidget(item);
  const changed = layoutRow(state.calendars, (id) => els.widgets.querySelector('.cal-widget[data-cal-widget-id="' + id + '"]'), 0.42);
  if (changed) saveState();
  renderCalendar();
}

function renderCalendarWidget(item) {
  const el = document.createElement('div');
  el.className = 'cal-widget calendar-shell' + (item.collapsed ? ' collapsed' : '') + (item.h || item.hpct ? ' fixed' : '');
  el.dataset.calWidgetId = item.id;
  el.style.left = clampPct(item.x) + '%';
  el.style.top = clampPct(item.y) + '%';
  if (item.wpct != null) el.style.width = item.wpct + 'vw';
  else if (item.w) el.style.width = Math.max(220, item.w) + 'px';
  if (item.hpct != null) el.style.height = item.hpct + 'vh';
  else if (item.h) el.style.height = item.h + 'px';

  el.innerHTML =
    '<div class="cal-widget-header">' +
      '<button type="button" class="icon-btn cal-widget-pin-btn" title="Pin">📌</button>' +
      '<span class="cal-widget-title"><span class="cal-widget-en-title"></span> <span class="cal-widget-bs-title"></span></span>' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn cal-widget-expand-btn" title="Open full calendar">⛶</button>' +
      '<button type="button" class="icon-btn cal-widget-collapse-btn" title="Collapse">–</button>' +
      '<button type="button" class="icon-btn cal-widget-delete-btn" title="Remove calendar widget">✕</button>' +
    '</div>' +
    '<div class="cal-widget-tools">' +
      '<button type="button" class="cal-widget-nav" title="Previous month">◀</button>' +
      '<button type="button" class="cal-widget-today" title="Jump to today">Today</button>' +
      '<button type="button" class="cal-widget-nav" title="Next month">▶</button>' +
    '</div>' +
    '<div class="cal-widget-weekdays calendar-weekdays"></div>' +
    '<div class="cal-widget-scroll"><div class="cal-widget-grid calendar-grid"></div></div>' +
    '<div class="cal-widget-resize" title="Drag to resize — double-click to reset"></div>';
  els.widgets.appendChild(el);

  calBuildWeekdays(el.querySelector('.cal-widget-weekdays'));

  bindPin(el, el.querySelector('.cal-widget-pin-btn'), item);

  el.querySelector('.cal-widget-collapse-btn').addEventListener('click', () => {
    item.collapsed = !item.collapsed;
    el.classList.toggle('collapsed', item.collapsed);
    saveState();
  });
  el.querySelector('.cal-widget-expand-btn').addEventListener('click', openCalendar);
  el.querySelector('.cal-widget-delete-btn').addEventListener('click', () => {
    state.calendars = state.calendars.filter((c) => c.id !== item.id);
    el.remove();
    saveState();
  });

  const navBtns = el.querySelectorAll('.cal-widget-nav');
  navBtns[0].addEventListener('click', () => shiftCalendarMonth(-1));
  navBtns[1].addEventListener('click', () => shiftCalendarMonth(1));
  el.querySelector('.cal-widget-today').addEventListener('click', goCalendarToday);

  const grid = el.querySelector('.cal-widget-grid');
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day[data-key]');
    if (cell) selectCalendarDay(cell.dataset.key, cell);
  });

  el.querySelector('.cal-widget-scroll').addEventListener('scroll', () => {
    if (!calTipPinned) hideCalTooltip();
  });

  makeDraggable(el, el.querySelector('.cal-widget-header'), () => {
    item.x = pct(el.style.left);
    item.y = pct(el.style.top);
    saveState();
  });

  const resizeHandle = el.querySelector('.cal-widget-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    item.w = w;
    item.h = h;
    delete item.wpct;
    delete item.hpct;
    el.classList.add('fixed');
    saveState();
  }, { aspect: CAL_WIDGET_ASPECT, disabled: () => item.pinned });
  resizeHandle.addEventListener('dblclick', () => {
    delete item.w;
    delete item.h;
    delete item.wpct;
    delete item.hpct;
    el.classList.remove('fixed');
    el.style.width = '';
    el.style.height = '';
    saveState();
  });
}

export function calTestHandle() {
  return { calendar, calEls, calGraphOpen, calTipKey, calTipPinned, calTipHost };
}

