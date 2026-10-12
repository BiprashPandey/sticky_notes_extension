(function () {
  'use strict';

  if (window.top !== window) return;
  if (document.getElementById('mcq-mode-host')) return;
  // The dashboard new-tab page has its own MCQ card; don't double-render there.
  try {
    const proto = String(location.protocol || '');
    if (proto.indexOf('chrome') === 0 || proto.indexOf('edge') === 0 || proto.indexOf('about') === 0) return;
    if (String(location.href || '').indexOf('newtab.html') !== -1) return;
  } catch (e) {
    return;
  }

  const COLORS = ['glass', 'yellow', 'pink', 'green', 'blue', 'purple', 'orange'];
  const BG = {
    glass: 'rgba(15, 23, 42, 0.94)',
    yellow: 'rgba(250, 204, 21, 0.94)',
    pink: 'rgba(244, 114, 182, 0.94)',
    green: 'rgba(74, 222, 128, 0.94)',
    blue: 'rgba(96, 165, 250, 0.94)',
    purple: 'rgba(167, 139, 250, 0.94)',
    orange: 'rgba(251, 146, 60, 0.94)',
  };
  const DARK_TEXT = { yellow: 1, pink: 1, green: 1, blue: 1, purple: 1, orange: 1 };

  let current = null; // { q, index, total }
  let answered = false;
  let color = 'glass';
  let dismissed = false;

  const host = document.createElement('div');
  host.id = 'mcq-mode-host';
  let shadow;
  try {
    shadow = host.attachShadow({ mode: 'open' });
  } catch (e) {
    return;
  }
  (document.documentElement || document.body || document.head).appendChild(host);

  const style = document.createElement('style');
  style.textContent = [
    ':host { all: initial; }',
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    '.mq-wrap {',
    '  position: fixed;',
    '  right: 16px;',
    '  bottom: 16px;',
    '  z-index: 2147483646;',
    '  width: min(92vw, 400px);',
    '  display: none;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;',
    '}',
    '.mq-wrap.show { display: block; }',
    '.mq-card {',
    '  max-height: 76vh;',
    '  overflow: auto;',
    '  padding: 14px 16px;',
    '  border-radius: 16px;',
    '  border: 1px solid rgba(255,255,255,0.2);',
    '  box-shadow: 0 18px 50px rgba(0,0,0,0.5);',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 10px;',
    '  animation: mqIn .25s cubic-bezier(.22,1,.36,1);',
    '}',
    '.mq-head { display: flex; align-items: center; gap: 8px; cursor: grab; touch-action: none; user-select: none; }',
    '.mq-head:active { cursor: grabbing; }',
    '.mq-tool { flex: none; border: none; background: transparent; color: inherit; font-size: 14px; line-height: 1; padding: 4px 6px; border-radius: 7px; cursor: pointer; opacity: .8; }',
    '.mq-tool:hover { opacity: 1; background: rgba(0,0,0,0.12); }',
    '.mq-badge { flex: none; border-radius: 999px; background: rgba(0,0,0,0.25); color: inherit; font-size: 10px; font-weight: 800; letter-spacing: .6px; padding: 2px 9px; }',
    '.mq-meta { flex: 1; min-width: 0; font-size: 11px; opacity: .75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
    '.mq-count { flex: none; font-size: 11px; opacity: .75; }',
    '.mq-q { font-size: 14px; line-height: 1.55; font-weight: 600; overflow-wrap: anywhere; }',
    '.mq-opts { display: flex; flex-direction: column; gap: 8px; }',
    '.mq-opt { display: flex; align-items: flex-start; gap: 9px; text-align: left; border: 1px solid rgba(255,255,255,0.25); border-radius: 10px; background: rgba(255,255,255,0.12); color: inherit; font-size: 13px; line-height: 1.5; padding: 8px 11px; cursor: pointer; font-family: inherit; }',
    '.mq-opt:hover:not(:disabled) { background: rgba(255,255,255,0.25); }',
    '.mq-opt:disabled { cursor: default; }',
    '.mq-opt.ok { border-color: #16a34a; background: rgba(22,163,74,0.22); }',
    '.mq-opt.no { border-color: #dc2626; background: rgba(220,38,38,0.2); }',
    '.mq-key { flex: none; width: 22px; height: 22px; border-radius: 7px; display: grid; place-items: center; background: rgba(0,0,0,0.2); font-weight: 800; font-size: 12px; }',
    '.mq-opt.ok .mq-key { background: #16a34a; color: #fff; }',
    '.mq-opt.no .mq-key { background: #dc2626; color: #fff; }',
    '.mq-txt { flex: 1; min-width: 0; overflow-wrap: anywhere; }',
    '.mq-fb { font-size: 13px; font-weight: 700; display: none; }',
    '.mq-fb.show { display: block; }',
    '.mq-exp { font-size: 12px; line-height: 1.6; opacity: .85; white-space: pre-line; overflow-wrap: anywhere; display: none; }',
    '.mq-exp.show { display: block; }',
    '.mq-more { align-self: flex-start; border: none; background: none; color: inherit; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; text-decoration: underline; display: none; }',
    '.mq-more.show { display: block; }',
    '.mq-foot { display: flex; gap: 8px; }',
    '.mq-btn { flex: 1; border: 1px solid rgba(255,255,255,0.25); border-radius: 9px; background: rgba(255,255,255,0.12); color: inherit; font-size: 13px; font-weight: 600; padding: 8px 0; cursor: pointer; font-family: inherit; }',
    '.mq-btn:hover { background: rgba(255,255,255,0.25); }',
    '@keyframes mqIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }',
  ].join('\n');
  shadow.appendChild(style);

  const wrap = document.createElement('div');
  wrap.className = 'mq-wrap';
  shadow.appendChild(wrap);

  const card = document.createElement('div');
  card.className = 'mq-card';
  wrap.appendChild(card);

  const head = document.createElement('div');
  head.className = 'mq-head';
  head.title = 'Drag to move — double-click to reset position';
  card.appendChild(head);

  const colorBtn = document.createElement('button');
  colorBtn.className = 'mq-tool';
  colorBtn.type = 'button';
  colorBtn.title = 'Change color';
  colorBtn.textContent = '🎨';
  head.appendChild(colorBtn);

  const badge = document.createElement('span');
  badge.className = 'mq-badge';
  badge.textContent = 'MCQ';
  head.appendChild(badge);

  const meta = document.createElement('span');
  meta.className = 'mq-meta';
  head.appendChild(meta);

  const count = document.createElement('span');
  count.className = 'mq-count';
  head.appendChild(count);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mq-tool';
  closeBtn.type = 'button';
  closeBtn.title = 'Dismiss for this page';
  closeBtn.textContent = '✕';
  head.appendChild(closeBtn);

  const qEl = document.createElement('div');
  qEl.className = 'mq-q';
  card.appendChild(qEl);

  const optsEl = document.createElement('div');
  optsEl.className = 'mq-opts';
  card.appendChild(optsEl);

  const fb = document.createElement('div');
  fb.className = 'mq-fb';
  card.appendChild(fb);

  const exp = document.createElement('div');
  exp.className = 'mq-exp';
  card.appendChild(exp);

  const moreBtn = document.createElement('button');
  moreBtn.className = 'mq-more';
  moreBtn.type = 'button';
  moreBtn.textContent = 'Show more';
  card.appendChild(moreBtn);

  const foot = document.createElement('div');
  foot.className = 'mq-foot';
  card.appendChild(foot);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'mq-btn';
  prevBtn.type = 'button';
  prevBtn.textContent = '◀ Prev';
  prevBtn.title = 'Previous question';
  foot.appendChild(prevBtn);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'mq-btn';
  skipBtn.type = 'button';
  skipBtn.textContent = 'Skip';
  foot.appendChild(skipBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'mq-btn';
  nextBtn.type = 'button';
  nextBtn.textContent = 'Next ▶';
  nextBtn.title = 'Next question';
  foot.appendChild(nextBtn);

  function send(type, extra) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(Object.assign({ type: type }, extra), (res) => {
          // When the service worker has no MCQ handler yet (stale worker) or is
          // still starting, the callback fires with undefined + lastError set.
          if (chrome.runtime.lastError) resolve(null);
          else resolve(res);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  function applyTheme() {
    card.style.background = BG[color] || BG.glass;
    const dark = !!DARK_TEXT[color];
    card.style.color = dark ? '#0b1220' : '#f8fafc';
  }

  function applyPos(x, y) {
    if (x != null && y != null) {
      wrap.style.left = Math.min(95, Math.max(0, Number(x))) + '%';
      wrap.style.top = Math.min(95, Math.max(0, Number(y))) + '%';
      wrap.style.right = 'auto';
      wrap.style.bottom = 'auto';
    } else {
      wrap.style.left = '';
      wrap.style.top = '';
      wrap.style.right = '';
      wrap.style.bottom = '';
    }
  }

  function shortExplanation(full) {
    if (!full) return '';
    const lines = String(full).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const right = lines.find((l) => /Why [A-D] is right/i.test(l));
    const tip = lines.find((l) => /Pro-Tip/i.test(l));
    const picks = [right, tip].filter(Boolean);
    return picks.length ? picks.join('\n') : lines.slice(0, 2).join('\n');
  }

  function letter(i) {
    return ['A', 'B', 'C', 'D'][i] || String(i + 1);
  }

  function render(payload) {
    if (!payload || !payload.enabled || !payload.q) {
      wrap.classList.remove('show');
      return;
    }
    current = payload;
    answered = false;
    if (payload.color) color = payload.color;
    applyTheme();
    if (payload.x != null && payload.y != null) applyPos(payload.x, payload.y);
    const q = payload.q;
    const parts = [q.id, q.topic || q.title, q.difficulty].filter(Boolean);
    meta.textContent = parts.join(' · ');
    meta.title = parts.join(' · ');
    count.textContent = (payload.index + 1) + ' / ' + payload.total;
    qEl.textContent = q.question;
    fb.className = 'mq-fb';
    fb.textContent = '';
    exp.className = 'mq-exp';
    exp.textContent = '';
    moreBtn.className = 'mq-more';
    moreBtn.textContent = 'Show more';
    // Previous / Next stay visible so users can navigate freely.
    optsEl.textContent = '';
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'mq-opt';
      b.type = 'button';
      const k = document.createElement('span');
      k.className = 'mq-key';
      k.textContent = letter(i);
      const t = document.createElement('span');
      t.className = 'mq-txt';
      t.textContent = opt;
      b.appendChild(k);
      b.appendChild(t);
      b.addEventListener('click', () => answer(i));
      optsEl.appendChild(b);
    });
    if (!dismissed) wrap.classList.add('show');
  }

  function answer(pick) {
    if (!current || answered) return;
    answered = true;
    const q = current.q;
    const kids = Array.from(optsEl.children);
    kids.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add('ok');
      else if (i === pick) b.classList.add('no');
    });
    const ok = pick === q.answer;
    send('MCQ_ANSWER', { correct: ok });
    fb.textContent = ok
      ? '✓ Correct — ' + letter(q.answer)
      : '✕ Correct answer: ' + letter(q.answer) + ' — you picked ' + letter(pick);
    fb.className = 'mq-fb show';
    if (q.explanation) {
      const short = shortExplanation(q.explanation);
      exp.textContent = short;
      exp.className = 'mq-exp show';
      if (q.explanation !== short) {
        moreBtn.className = 'mq-more show';
        moreBtn.onclick = () => {
          const expanded = moreBtn.textContent === 'Show more';
          exp.textContent = expanded ? q.explanation : short;
          moreBtn.textContent = expanded ? 'Show less' : 'Show more';
        };
      }
    }
  }

  skipBtn.addEventListener('click', async () => {
    const res = await send(answered ? 'MCQ_NEXT' : 'MCQ_SKIP');
    render(res);
  });

  prevBtn.addEventListener('click', async () => {
    const res = await send('MCQ_PREV');
    render(res);
  });

  nextBtn.addEventListener('click', async () => {
    const res = await send('MCQ_NEXT');
    render(res);
  });

  closeBtn.addEventListener('click', () => {
    dismissed = true;
    wrap.classList.remove('show');
  });

  colorBtn.addEventListener('click', async () => {
    const i = COLORS.indexOf(color);
    color = COLORS[(i + 1) % COLORS.length];
    applyTheme();
    send('MCQ_COLOR', { color: color });
  });

  // Drag via header (mirrors the dashboard's makeDraggable, persisted as viewport %).
  head.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    // Pin to left/top so movement is stable.
    wrap.style.left = rect.left + 'px';
    wrap.style.top = rect.top + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = rect.left;
    const oy = rect.top;
    const move = (ev) => {
      const l = Math.min(Math.max(ox + ev.clientX - sx, 0), Math.max(0, window.innerWidth - rect.width));
      const t = Math.min(Math.max(oy + ev.clientY - sy, 0), Math.max(0, window.innerHeight - rect.height));
      wrap.style.left = l + 'px';
      wrap.style.top = t + 'px';
    };
    const up = (ev) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      const r = wrap.getBoundingClientRect();
      const x = (r.left / window.innerWidth) * 100;
      const y = (r.top / window.innerHeight) * 100;
      send('MCQ_POS', { x: x, y: y });
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });

  head.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    applyPos(null, null);
    send('MCQ_POS', { x: null, y: null });
  });

  document.addEventListener('keydown', (e) => {
    if (!wrap.classList.contains('show')) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;
    if (e.key >= '1' && e.key <= '4') {
      const i = Number(e.key) - 1;
      if (current && current.q && current.q.options[i] != null) answer(i);
    } else if (e.key === 'ArrowRight') {
      send('MCQ_NEXT').then(render);
    } else if (e.key === 'ArrowLeft') {
      send('MCQ_PREV').then(render);
    } else if (e.key === 'Escape') {
      dismissed = true;
      wrap.classList.remove('show');
    }
  });

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || !msg.type) return;
      if (msg.type === 'MCQ_HIDE') {
        dismissed = true;
        wrap.classList.remove('show');
      }
    });
  } catch (e) {
    /* ignore */
  }

  // The service worker can be asleep on first navigation; a null (not
  // {enabled:false}) response means "no handler answered", so retry a few
  // times before giving up for this page load.
  let bootTries = 0;
  function boot() {
    bootTries++;
    send('MCQ_GET').then((res) => {
      if (res == null && bootTries < 4 && !dismissed) {
        if (typeof console !== 'undefined' && console.debug) console.debug('[mcq] no engine response, retry', bootTries);
        setTimeout(boot, 1500);
        return;
      }
      if (typeof console !== 'undefined' && console.debug) console.debug('[mcq] boot response:', res && res.enabled ? 'enabled' : 'disabled/empty');
      render(res);
    });
  }
  boot();
})();
