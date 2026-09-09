import { els } from '../shared/dom.js';

const POMODORO_KEY = 'dashboardPomodoroV1';
const POMODORO_MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long:  { label: 'Long Break', minutes: 15 },
};
const POMODORO_RING_CIRCUMFERENCE = 2 * Math.PI * 90;
const POMODORO_CYCLE = 4;




let pomodoro = null;
let pomoEls = null;
let pomoAudio = null;

function loadPomodoroState() {
  const defaultDurations = {};
  for (const [mode, def] of Object.entries(POMODORO_MODES)) defaultDurations[mode] = def.minutes;
  try {
    const raw = localStorage.getItem(POMODORO_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && POMODORO_MODES[p.mode] && typeof p.completed === 'number') {
        const durations = Object.assign({}, defaultDurations);
        for (const mode of Object.keys(POMODORO_MODES)) {
          const v = p.durations ? Number(p.durations[mode]) : NaN;
          if (isFinite(v) && v >= 1) durations[mode] = Math.min(180, Math.round(v));
        }
        const total = durations[p.mode] * 60000;
        return {
          mode: p.mode,
          running: !!p.running && isFinite(p.endAt),
          endAt: p.running && isFinite(p.endAt) ? Number(p.endAt) : null,
          remainingMs: Math.min(Math.max(Number(p.remainingMs) || 0, 0), total),
          completed: Math.max(0, Math.floor(p.completed)),
          durations,
        };
      }
    }
  } catch (e) {
    /* fall through to defaults */
  }
  return { mode: 'focus', running: false, endAt: null, remainingMs: POMODORO_MODES.focus.minutes * 60000, completed: 0, durations: defaultDurations };
}

function savePomodoroState() {
  try {
    localStorage.setItem(POMODORO_KEY, JSON.stringify(pomodoro));
  } catch (e) {
    /* ignore */
  }
}

function pomoMinutes(mode) {
  const d = pomodoro && pomodoro.durations;
  return d && isFinite(d[mode]) && d[mode] >= 1 ? d[mode] : POMODORO_MODES[mode].minutes;
}

function pomoRemaining() {
  return pomodoro.running ? pomodoro.endAt - Date.now() : pomodoro.remainingMs;
}

function pomoFormat(ms) {
  const clamped = Math.max(0, ms);
  const m = Math.floor(clamped / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function initPomodoro() {
  pomodoro = loadPomodoroState();
  pomoEls = {
    modes: [...els.pomodoroOverlay.querySelectorAll('.pomodoro-mode')],
    ring: els.pomodoroOverlay.querySelector('.pomodoro-ring'),
    fg: els.pomodoroOverlay.querySelector('.pomodoro-ring-fg'),
    time: els.pomodoroOverlay.querySelector('.pomodoro-time'),
    phase: els.pomodoroOverlay.querySelector('.pomodoro-phase'),
    toggle: els.pomodoroOverlay.querySelector('.pomodoro-start'),
    reset: els.pomodoroOverlay.querySelector('.pomodoro-reset'),
    dotsWrap: els.pomodoroOverlay.querySelector('.pomodoro-dots'),
    hint: els.pomodoroOverlay.querySelector('.pomodoro-hint'),
  };

  pomoEls.dotsWrap.innerHTML = '';
  for (let i = 0; i < POMODORO_CYCLE; i++) {
    const dot = document.createElement('span');
    dot.className = 'pomodoro-dot';
    pomoEls.dotsWrap.appendChild(dot);
  }
  pomoEls.dots = [...pomoEls.dotsWrap.children];

  pomoEls.durationInputs = {};
  els.pomodoroOverlay.querySelectorAll('.pomodoro-duration').forEach((row) => {
    const mode = row.dataset.mode;
    const input = row.querySelector('.pomodoro-min');
    pomoEls.durationInputs[mode] = input;
    input.addEventListener('change', () => pomoSetDuration(mode, parseInt(input.value, 10)));
    row.querySelectorAll('.pomodoro-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cur = parseInt(input.value, 10) || POMODORO_MODES[mode].minutes;
        pomoSetDuration(mode, cur + Number(btn.dataset.step));
      });
    });
  });
  syncDurationInputs();

  els.pomodoroBtn.addEventListener('click', openPomodoro);
  els.closePomodoroBtn.addEventListener('click', closePomodoro);
  els.pomodoroOverlay.addEventListener('click', (e) => {
    if (e.target === els.pomodoroOverlay) closePomodoro();
  });

  pomoEls.modes.forEach((btn) => {
    btn.addEventListener('click', () => pomoSelectMode(btn.dataset.mode));
  });
  pomoEls.toggle.addEventListener('click', pomoToggleRun);
  pomoEls.reset.addEventListener('click', pomoResetCurrent);

  setInterval(pomodoroTick, 250);
  pomodoroTick();
}

function openPomodoro() {
  els.pomodoroOverlay.classList.add('open');
  renderPomodoro();
}

function closePomodoro() {
  els.pomodoroOverlay.classList.remove('open');
}

function pomoSelectMode(mode) {
  if (!POMODORO_MODES[mode]) return;
  pomodoro = {
    mode,
    running: false,
    endAt: null,
    remainingMs: pomoMinutes(mode) * 60000,
    completed: pomodoro.completed,
    durations: Object.assign({}, pomodoro.durations),
  };
  savePomodoroState();
  renderPomodoro();
}

function pomoToggleRun() {
  ensurePomoAudio();
  if (pomodoro.running) {
    pomodoro.remainingMs = Math.max(0, pomodoro.endAt - Date.now());
    pomodoro.running = false;
    pomodoro.endAt = null;
  } else {
    const rem = pomodoro.remainingMs > 0 ? pomodoro.remainingMs : pomoMinutes(pomodoro.mode) * 60000;
    pomodoro.remainingMs = rem;
    pomodoro.endAt = Date.now() + rem;
    pomodoro.running = true;
  }
  savePomodoroState();
  renderPomodoro();
}

function pomoResetCurrent() {
  pomodoro.running = false;
  pomodoro.endAt = null;
  pomodoro.remainingMs = pomoMinutes(pomodoro.mode) * 60000;
  savePomodoroState();
  renderPomodoro();
}

function pomoSetDuration(mode, mins) {
  if (!POMODORO_MODES[mode]) return;
  if (!isFinite(mins)) {
    syncDurationInputs();
    return;
  }
  mins = Math.min(180, Math.max(1, Math.round(mins)));
  pomodoro.durations = Object.assign({}, pomodoro.durations);
  pomodoro.durations[mode] = mins;
  if (pomodoro.mode === mode && !pomodoro.running) {
    pomodoro.remainingMs = mins * 60000;
  }
  savePomodoroState();
  syncDurationInputs();
  renderPomodoro();
}

function syncDurationInputs() {
  for (const [mode, input] of Object.entries(pomoEls.durationInputs)) {
    input.value = pomoMinutes(mode);
  }
}

function pomodoroAdvance() {
  const wasFocus = pomodoro.mode === 'focus';
  const completed = wasFocus ? pomodoro.completed + 1 : pomodoro.completed;
  const next = wasFocus
    ? (completed % POMODORO_CYCLE === 0 ? 'long' : 'short')
    : 'focus';
  pomoPlayChime();
  pomodoro = {
    mode: next,
    running: true,
    endAt: Date.now() + pomoMinutes(next) * 60000,
    remainingMs: 0,
    completed,
    durations: Object.assign({}, pomodoro.durations),
  };
  savePomodoroState();
}

function pomodoroTick() {
  pomodoro = loadPomodoroState();
  if (pomodoro.running && pomodoro.endAt - Date.now() <= 0) pomodoroAdvance();
  renderPomodoro();
}

function renderPomodoro() {
  if (!pomoEls) return;
  const def = POMODORO_MODES[pomodoro.mode];
  const total = pomoMinutes(pomodoro.mode) * 60000;
  const rem = Math.min(Math.max(pomoRemaining(), 0), total);
  const mmss = pomoFormat(rem);

  pomoEls.time.textContent = mmss;
  pomoEls.phase.textContent = def.label;
  pomoEls.fg.style.strokeDashoffset = (POMODORO_RING_CIRCUMFERENCE * (1 - rem / total)).toFixed(2);
  pomoEls.ring.classList.toggle('break', pomodoro.mode !== 'focus');
  pomoEls.toggle.textContent = pomodoro.running ? 'Pause' : (rem < total ? 'Resume' : 'Start');
  pomoEls.modes.forEach((b) => b.classList.toggle('active', b.dataset.mode === pomodoro.mode));
  pomoEls.hint.textContent =
    pomoMinutes('focus') + ' min focus · ' + pomoMinutes('short') + ' min short break · long break after every ' + POMODORO_CYCLE + ' sessions';

  const filled = pomodoro.completed % POMODORO_CYCLE;
  pomoEls.dots.forEach((d, i) => d.classList.toggle('done', i < filled));

  document.title = pomodoro.running ? mmss + ' · ' + def.label : 'New Tab';
  els.pomodoroBtn.classList.toggle('active', pomodoro.running);
  els.pomodoroBtn.title = pomodoro.running ? 'Pomodoro · ' + mmss + ' — open timer' : 'Pomodoro timer';
}

function ensurePomoAudio() {
  try {
    if (!pomoAudio) pomoAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (pomoAudio.state === 'suspended') pomoAudio.resume();
  } catch (e) {
    /* audio unavailable */
  }
}

function pomoPlayChime() {
  ensurePomoAudio();
  if (!pomoAudio) return;
  try {
    const t = pomoAudio.currentTime;
    [0, 0.3, 0.6].forEach((off) => {
      const osc = pomoAudio.createOscillator();
      const gain = pomoAudio.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t + off);
      gain.gain.exponentialRampToValueAtTime(0.2, t + off + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.25);
osc.connect(gain).connect(pomoAudio.destination);
      osc.start(t + off);
      osc.stop(t + off + 0.27);
    });
  } catch (e) {
    /* ignore */
  }
}

