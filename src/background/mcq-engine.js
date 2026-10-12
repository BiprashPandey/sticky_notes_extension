import { MCQ_QUESTIONS } from '../modules/mcq-questions.js';

const STORAGE_KEY = 'dashboardStateV1';
const VALID_COLORS = ['glass', 'yellow', 'pink', 'green', 'blue', 'purple', 'orange'];

function sanitizeColor(c) {
  return VALID_COLORS.includes(c) ? c : 'glass';
}

function sanitizePctOrNull(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(95, Math.max(0, n)) : null;
}

async function readState() {
  try {
    const got = await chrome.storage.local.get(STORAGE_KEY);
    return got[STORAGE_KEY] && typeof got[STORAGE_KEY] === 'object' ? got[STORAGE_KEY] : null;
  } catch (e) {
    return null;
  }
}

async function writeState(stored) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: stored });
  } catch (e) {
    /* ignore */
  }
}

function nextIndex(last) {
  const n = MCQ_QUESTIONS.length;
  if (!n) return -1;
  const base = Number.isFinite(Number(last)) ? Math.floor(Number(last)) : -1;
  return (base + 1) % n;
}

function prevIndex(last) {
  const n = MCQ_QUESTIONS.length;
  if (!n) return -1;
  const raw = Number(last);
  const base = Number.isFinite(raw) ? Math.floor(raw) : 0;
  return (base - 1 + n) % n;
}

// Steps rotation (dir = +1 forward, -1 backward) and returns the question payload.
// Used for initial load, Skip, Previous, and Next (skip/answer scoring is separate).
async function takeStep(dir) {
  const stored = (await readState()) || {};
  const mcq = stored.mcq && typeof stored.mcq === 'object' ? stored.mcq : {};
  if (!mcq.enabled || !MCQ_QUESTIONS.length) return { enabled: false };
  const idx = dir < 0 ? prevIndex(mcq.lastIndex) : nextIndex(mcq.lastIndex);
  const q = MCQ_QUESTIONS[idx];
  if (!q) return { enabled: false };
  stored.mcq = { ...mcq, lastIndex: idx };
  await writeState(stored);
  return {
    enabled: true,
    index: idx,
    total: MCQ_QUESTIONS.length,
    color: sanitizeColor(mcq.color),
    x: sanitizePctOrNull(mcq.x),
    y: sanitizePctOrNull(mcq.y),
    q: {
      id: q.id,
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options.slice(0, 4),
      answer: q.answer,
      explanation: q.explanation,
    },
  };
}

async function recordAnswer(correct) {
  const stored = (await readState()) || {};
  const mcq = stored.mcq && typeof stored.mcq === 'object' ? stored.mcq : {};
  stored.mcq = {
    ...mcq,
    answered: Math.max(0, (Math.floor(Number(mcq.answered) || 0) || 0) + 1),
    correct: Math.max(0, (Math.floor(Number(mcq.correct) || 0) || 0) + (correct ? 1 : 0)),
  };
  await writeState(stored);
  return { ok: true };
}

async function setColor(color) {
  const stored = (await readState()) || {};
  const mcq = stored.mcq && typeof stored.mcq === 'object' ? stored.mcq : {};
  stored.mcq = { ...mcq, color: sanitizeColor(color) };
  await writeState(stored);
  return { ok: true, color: stored.mcq.color };
}

async function setPos(x, y) {
  const stored = (await readState()) || {};
  const mcq = stored.mcq && typeof stored.mcq === 'object' ? stored.mcq : {};
  stored.mcq = { ...mcq, x: sanitizePctOrNull(x), y: sanitizePctOrNull(y) };
  await writeState(stored);
  return { ok: true };
}

export function initMcqEngine() {
  const reply = (fn, fallback) => (msg, sender, sendResponse) => {
    // Always answer: an unhandled rejection would otherwise leave the
    // content script's sendMessage callback hanging forever.
    fn(msg).then(sendResponse, () => {
      try {
        sendResponse(fallback);
      } catch (e) {
        /* ignore */
      }
    });
    return true;
  };
  const replyNext = reply(() => takeStep(1), { enabled: false });
  const replyPrev = reply(() => takeStep(-1), { enabled: false });
  const replyOk = (fn) => reply(fn, { ok: false });
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg.type !== 'string') return;
    if (msg.type === 'MCQ_GET' || msg.type === 'MCQ_NEXT' || msg.type === 'MCQ_SKIP') {
      return replyNext(msg, sender, sendResponse);
    }
    if (msg.type === 'MCQ_PREV') {
      return replyPrev(msg, sender, sendResponse);
    }
    if (msg.type === 'MCQ_ANSWER') {
      return replyOk(() => recordAnswer(!!msg.correct))(msg, sender, sendResponse);
    }
    if (msg.type === 'MCQ_COLOR') {
      return replyOk(() => setColor(msg.color))(msg, sender, sendResponse);
    }
    if (msg.type === 'MCQ_POS') {
      return replyOk(() => setPos(msg.x, msg.y))(msg, sender, sendResponse);
    }
  });

  // Mirror the focus engine: when MCQ mode is turned off, hide open site cards.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const ch = changes[STORAGE_KEY];
    if (!ch || !ch.newValue) return;
    const on = !!(ch.newValue.mcq && ch.newValue.mcq.enabled);
    if (on) return;
    try {
      chrome.tabs.query({}).then((tabs) => {
        for (const t of tabs) {
          if (t.id == null) continue;
          chrome.tabs.sendMessage(t.id, { type: 'MCQ_HIDE' }).catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {
      /* ignore */
    }
  });
}
