import { els } from '../shared/dom.js';
import { state, MCQ_COLORS, sanitizeMcqColor, mcqAllowedDifficulties } from '../shared/state.js';
import { clampPct, pct } from '../shared/utils.js';
import { makeDraggable } from '../ui/drag.js';
import { manualSave } from './data.js';
import { MCQ_QUESTIONS } from './mcq-questions.js';

let currentIndex = -1;
let answered = false;

function allowedSet() {
  return mcqAllowedDifficulties(state && state.mcq ? state.mcq.difficulties : null);
}

function filteredIndices() {
  const allowed = allowedSet();
  const out = [];
  for (let i = 0; i < MCQ_QUESTIONS.length; i++) {
    const d = MCQ_QUESTIONS[i] && MCQ_QUESTIONS[i].difficulty;
    if (allowed.has(d)) out.push(i);
  }
  return out;
}

function stepFiltered(from, dir) {
  const n = MCQ_QUESTIONS.length;
  if (!n) return -1;
  const allowed = allowedSet();
  const base = Number.isFinite(Number(from)) ? Math.floor(Number(from)) : (dir < 0 ? 0 : -1);
  for (let step = 1; step <= n; step++) {
    const cand = (base + dir * step + n * step) % n;
    const d = MCQ_QUESTIONS[cand] && MCQ_QUESTIONS[cand].difficulty;
    if (allowed.has(d)) return cand;
  }
  return -1;
}

function isIndexAllowed(index) {
  const q = MCQ_QUESTIONS[index];
  if (!q) return false;
  return allowedSet().has(q.difficulty);
}

function isEnabled() {
  return !!(state && state.mcq && state.mcq.enabled) && filteredIndices().length > 0;
}

function shortExplanation(full) {
  if (!full) return '';
  // Show the "Why X is right" + Pro-Tip lines first; full text behind "Show more".
  const lines = String(full).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const right = lines.find((l) => /Why [A-D] is right/i.test(l));
  const tip = lines.find((l) => /Pro-Tip/i.test(l));
  const picks = [right, tip].filter(Boolean);
  return picks.length ? picks.join('\n') : lines.slice(0, 2).join('\n');
}

function letter(i) {
  return ['A', 'B', 'C', 'D'][i] || String(i + 1);
}

export function mcqColor() {
  return sanitizeMcqColor(state && state.mcq && state.mcq.color);
}

export function applyMcqColor() {
  if (!els.mcqCard) return;
  els.mcqCard.classList.remove(...MCQ_COLORS.map((c) => 'color-' + c));
  els.mcqCard.classList.add('color-' + mcqColor());
}

export function cycleMcqColor() {
  if (!state.mcq) return;
  const i = MCQ_COLORS.indexOf(mcqColor());
  state.mcq.color = MCQ_COLORS[(i + 1) % MCQ_COLORS.length];
  applyMcqColor();
  manualSave();
}

export function applyMcqPosition() {
  if (!els.mcqOverlay) return;
  const x = state && state.mcq ? state.mcq.x : null;
  const y = state && state.mcq ? state.mcq.y : null;
  if (x != null && y != null) {
    els.mcqOverlay.style.left = clampPct(x) + '%';
    els.mcqOverlay.style.top = clampPct(y) + '%';
    els.mcqOverlay.style.right = 'auto';
    els.mcqOverlay.style.bottom = 'auto';
  } else {
    els.mcqOverlay.style.left = '';
    els.mcqOverlay.style.top = '';
    els.mcqOverlay.style.right = '';
    els.mcqOverlay.style.bottom = '';
  }
}

export function resetMcqPosition() {
  if (!state.mcq) return;
  state.mcq.x = null;
  state.mcq.y = null;
  applyMcqPosition();
  manualSave();
}

export function nextMcqIndex() {
  const n = MCQ_QUESTIONS.length;
  if (!n) return -1;
  const last = Number(state.mcq && state.mcq.lastIndex);
  return stepFiltered(Number.isFinite(last) ? last : -1, 1);
}

export function filteredCount() {
  return filteredIndices().length;
}

export function renderMcq(index) {
  const q = MCQ_QUESTIONS[index];
  if (!q || !els.mcqCard) return;
  currentIndex = index;
  answered = false;
  els.mcqCard.dataset.index = String(index);
  if (els.mcqMeta) {
    const parts = [q.id, q.topic || q.title, q.difficulty].filter(Boolean);
    els.mcqMeta.textContent = parts.join(' · ');
  }
  if (els.mcqQuestion) els.mcqQuestion.textContent = q.question;
  if (els.mcqFeedback) {
    els.mcqFeedback.hidden = true;
    els.mcqFeedback.textContent = '';
    els.mcqFeedback.className = 'mcq-feedback';
  }
  if (els.mcqFull) {
    els.mcqFull.hidden = true;
    els.mcqFull.textContent = '';
  }
  if (els.mcqMoreBtn) els.mcqMoreBtn.hidden = true;
  // Previous / Next stay visible so users can navigate freely
  // (Next no longer waits for an answer).
  if (els.mcqPrevBtn) els.mcqPrevBtn.hidden = false;
  if (els.mcqNextBtn) els.mcqNextBtn.hidden = false;
  if (els.mcqCount) {
    const filt = filteredIndices();
    const pos = filt.indexOf(index);
    const total = filt.length || MCQ_QUESTIONS.length;
    els.mcqCount.textContent = pos >= 0 ? `${pos + 1} / ${total}` : `${index + 1} / ${total}`;
  }
  if (!els.mcqOptions) return;
  els.mcqOptions.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mcq-option';
    const k = document.createElement('span');
    k.className = 'mcq-key';
    k.textContent = letter(i);
    const t = document.createElement('span');
    t.className = 'mcq-text';
    t.textContent = opt;
    b.append(k, t);
    b.addEventListener('click', () => answerMcq(i));
    els.mcqOptions.appendChild(b);
  });
}

export function answerMcq(pick) {
  const q = MCQ_QUESTIONS[currentIndex];
  if (!q || answered || !els.mcqOptions) return;
  answered = true;
  const kids = [...els.mcqOptions.children];
  kids.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === pick) b.classList.add('wrong');
  });
  const ok = pick === q.answer;
  if (state.mcq) {
    state.mcq.answered = (Number(state.mcq.answered) || 0) + 1;
    if (ok) state.mcq.correct = (Number(state.mcq.correct) || 0) + 1;
  }
  if (els.mcqFeedback) {
    els.mcqFeedback.hidden = false;
    els.mcqFeedback.classList.toggle('ok', ok);
    els.mcqFeedback.classList.toggle('bad', !ok);
    els.mcqFeedback.textContent = ok
      ? `✓ Correct — ${letter(q.answer)}`
      : `✕ Correct answer: ${letter(q.answer)} — you picked ${letter(pick)}`;
  }
  if (els.mcqFull && q.explanation) {
    els.mcqFull.textContent = shortExplanation(q.explanation);
    els.mcqFull.hidden = false;
    if (els.mcqMoreBtn) {
      const full = q.explanation;
      const short = shortExplanation(q.explanation);
      els.mcqMoreBtn.hidden = full === short;
      els.mcqMoreBtn.textContent = 'Show more';
      els.mcqMoreBtn.onclick = () => {
        const expanded = els.mcqMoreBtn.textContent === 'Show more';
        els.mcqFull.textContent = expanded ? full : short;
        els.mcqMoreBtn.textContent = expanded ? 'Show less' : 'Show more';
      };
    }
  }
  manualSave();
}

export function showMcq() {
  if (!isEnabled() || !els.mcqOverlay) return;
  if (currentIndex < 0 || !isIndexAllowed(currentIndex)) renderMcq(nextMcqIndex());
  applyMcqColor();
  applyMcqPosition();
  els.mcqOverlay.classList.add('open');
}

export function hideMcq() {
  if (els.mcqOverlay) els.mcqOverlay.classList.remove('open');
}

export function refreshMcqDifficulties() {
  // Called when difficulty checkboxes change: keep current Q if still
  // allowed (refreshing only the counter), else jump to first allowed Q.
  if (!isEnabled()) {
    hideMcq();
    return;
  }
  if (currentIndex < 0 || !isIndexAllowed(currentIndex)) {
    const next = nextMcqIndex();
    if (next >= 0) {
      if (state.mcq) {
        state.mcq.lastIndex = next;
        manualSave();
      }
      renderMcq(next);
    }
    showMcq();
    return;
  }
  // Still allowed: refresh counter without losing answer state.
  if (els.mcqCount) {
    const filt = filteredIndices();
    const pos = filt.indexOf(currentIndex);
    if (pos >= 0) els.mcqCount.textContent = `${pos + 1} / ${filt.length}`;
  }
  showMcq();
}

export function refreshMcqVisibility() {
  // Called after external storage sync so all tabs agree on on/off.
  if (!els.mcqOverlay) return;
  if (isEnabled()) {
    if (currentIndex < 0 || !isIndexAllowed(currentIndex)) renderMcq(nextMcqIndex());
    showMcq();
  } else {
    hideMcq();
  }
}

export function skipMcq() {
  // Skip advances rotation without scoring, staying within selected difficulties.
  const from = currentIndex >= 0 ? currentIndex : Number(state.mcq && state.mcq.lastIndex);
  const next = stepFiltered(from, 1);
  if (next < 0) return;
  if (state.mcq) state.mcq.lastIndex = next;
  manualSave();
  renderMcq(next);
}

function advancePersisted() {
  // Persist rotation point when leaving a question (answer or Next).
  if (state.mcq && currentIndex >= 0) {
    if (Number(state.mcq.lastIndex) !== currentIndex) {
      state.mcq.lastIndex = currentIndex;
      manualSave();
    }
  }
}

export function goMcq(dir) {
  // Navigate freely without scoring: dir = +1 (next) or -1 (previous).
  const n = MCQ_QUESTIONS.length;
  if (!n) return;
  const step = dir < 0 ? -1 : 1;
  const base = currentIndex >= 0 ? currentIndex : nextMcqIndex();
  if (base < 0) return;
  const target = stepFiltered(base, step);
  if (target < 0) return;
  advancePersisted();
  if (state.mcq) state.mcq.lastIndex = target;
  manualSave();
  renderMcq(target);
}

export function initMcq() {
  if (!els.mcqOverlay) return;
  applyMcqColor();
  applyMcqPosition();
  els.mcqColorBtn?.addEventListener('click', cycleMcqColor);
  if (els.mcqHead) {
    makeDraggable(els.mcqOverlay, els.mcqHead, () => {
      if (!state.mcq) return;
      state.mcq.x = pct(els.mcqOverlay.style.left);
      state.mcq.y = pct(els.mcqOverlay.style.top);
      manualSave();
    });
    els.mcqHead.addEventListener('dblclick', (e) => {
      if (e.target.closest('button')) return;
      resetMcqPosition();
    });
  }
  els.mcqCloseBtn?.addEventListener('click', hideMcq);
  els.mcqSkipBtn?.addEventListener('click', () => {
    if (!answered) skipMcq();
    else goMcq(1);
  });
  els.mcqPrevBtn?.addEventListener('click', () => goMcq(-1));
  els.mcqNextBtn?.addEventListener('click', () => goMcq(1));
  els.mcqOverlay.addEventListener('click', (e) => {
    // Card is dismissible but non-modal: clicks outside the card do nothing
    // (dashboard stays usable). Only ✕ closes.
    void e;
  });
  document.addEventListener('mcq:toggle', (e) => {
    if (e.detail && e.detail.enabled) {
      currentIndex = -1;
      renderMcq(nextMcqIndex());
      showMcq();
    } else {
      hideMcq();
    }
  });
  document.addEventListener('mcq:difficulties', () => {
    refreshMcqDifficulties();
  });
  document.addEventListener('keydown', (e) => {
    if (!els.mcqOverlay?.classList.contains('open')) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key >= '1' && e.key <= '4') {
      const i = Number(e.key) - 1;
      if (MCQ_QUESTIONS[currentIndex]?.options[i] != null) answerMcq(i);
    } else if (e.key === 'ArrowRight') {
      goMcq(1);
    } else if (e.key === 'ArrowLeft') {
      goMcq(-1);
    }
  });
  if (isEnabled()) {
    renderMcq(nextMcqIndex());
    showMcq();
  }
}
