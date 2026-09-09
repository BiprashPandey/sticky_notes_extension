(function () {
  'use strict';

  if (window.top !== window) return;
  if (document.getElementById('focus-mode-host')) return;

  let focusDurationMin = 5;
  let allowMixes = true;

  function isMixPage() {
    const host = location.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) return false;
    const q = location.search || '';
    if (q.indexOf('index=') !== -1) return true;
    if (q.indexOf('start_radio=1') !== -1) return true;
    return /[?&]list=RD/i.test(q);
  }

  const HOST_ID = 'focus-mode-host';
  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  (document.documentElement || document.body).appendChild(host);

  const style = document.createElement('style');
  style.textContent = [
    ':host { all: initial; }',
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    '.fm-layer {',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 2147483647;',
    '  display: flex;',
    '  justify-content: center;',
    '  align-items: center;',
    '  padding: 24px;',
    '  pointer-events: auto;',
    '  background: rgba(2, 6, 23, 0.68);',
    '  backdrop-filter: blur(6px);',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;',
    '}',
    '.fm-layer:not(.show) { display: none; }',
    '.fm-card {',
    '  pointer-events: auto;',
    '  width: min(92vw, 460px);',
    '  padding: 24px 26px;',
    '  border-radius: 16px;',
    '  border: 1px solid rgba(255,255,255,0.18);',
    '  background: rgba(15, 23, 42, 0.96);',
    '  box-shadow: 0 18px 50px rgba(0,0,0,0.5);',
    '  color: #f8fafc;',
    '  animation: fmIn .25s cubic-bezier(.22,1,.36,1);',
    '}',
    '.fm-title {',
    '  font-size: 18px;',
    '  font-weight: 700;',
    '  letter-spacing: .3px;',
    '}',
    '.fm-card.warn .fm-title { color: #fbbf24; }',
    '.fm-body {',
    '  margin-top: 8px;',
    '  font-size: 14px;',
    '  line-height: 1.5;',
    '  color: rgba(248,250,252,0.85);',
    '}',
    '.fm-actions {',
    '  margin-top: 18px;',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  gap: 10px;',
    '}',
    '.fm-btn {',
    '  flex: 1 1 auto;',
    '  border: 1px solid rgba(255,255,255,0.18);',
    '  border-radius: 10px;',
    '  padding: 11px 16px;',
    '  font-size: 14px;',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  color: #f8fafc;',
    '  background: rgba(255,255,255,0.08);',
    '  transition: filter .15s ease, background .15s ease, transform .1s ease;',
    '}',
    '.fm-btn:hover { filter: brightness(1.12); }',
    '.fm-btn:active { transform: scale(.97); }',
    '.fm-btn.primary { background: #7aa2ff; color: #0b1220; border-color: #7aa2ff; font-weight: 700; }',
    '.fm-btn.danger { background: rgba(255,107,107,0.18); border-color: rgba(255,107,107,0.5); color: #fecaca; }',
    '.fm-btn.ghost { background: transparent; }',
    '@keyframes fmIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform:none; } }',
  ].join('\n');
  shadow.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'fm-layer';
  shadow.appendChild(layer);

  const card = document.createElement('div');
  card.className = 'fm-card';
  layer.appendChild(card);

  const title = document.createElement('div');
  title.className = 'fm-title';
  const body = document.createElement('div');
  body.className = 'fm-body';
  const actions = document.createElement('div');
  actions.className = 'fm-actions';
  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(actions);

  function addBtn(label, kind, fn) {
    const b = document.createElement('button');
    b.className = 'fm-btn ' + kind;
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', fn);
    actions.appendChild(b);
  }

  function clearActions() {
    actions.textContent = '';
  }

  function showInitial() {
    title.textContent = 'Focus mode is on';
    body.textContent = 'This site is limited to help you stay focused. Use it for a short while, or exit.';
    clearActions();
    addBtn('Use for ' + focusDurationMin + ' mins', 'primary', () => send('FOCUS_START'));
    addBtn('Exit', 'danger', () => send('FOCUS_EXIT'));
    addBtn('Motivation', 'ghost', () => send('FOCUS_MOTIVATE'));
    card.classList.remove('warn');
    show();
  }

  function showWarn(msg) {
    title.textContent = 'Web to be closed in 1 minute';
    body.textContent = 'Your time is almost up. Use it for another ' + (msg && msg.minutes ? msg.minutes : focusDurationMin) + ' minutes, or the tab will close.';
    clearActions();
    addBtn('Use for ' + (msg && msg.minutes ? msg.minutes : focusDurationMin) + ' mins', 'primary', () => send('FOCUS_EXTEND'));
    addBtn('Exit', 'danger', () => send('FOCUS_EXIT'));
    addBtn('Motivation', 'ghost', () => send('FOCUS_MOTIVATE'));
    card.classList.add('warn');
    show();
  }

  function show() {
    layer.classList.add('show');
  }

  function hide() {
    layer.classList.remove('show');
  }

  function send(type) {
    try {
      chrome.runtime.sendMessage({ type: type });
    } catch (e) {
      /* ignore */
    }
  }

  function applyInit(res) {
    if (!res || !res.isTarget) return;
    if (res.minutes) focusDurationMin = res.minutes;
    if (typeof res.playMixes === 'boolean') allowMixes = res.playMixes;
    if (!res.active) showInitial();
  }

  try {
    chrome.runtime.sendMessage({ type: 'FOCUS_INIT' }, applyInit);
  } catch (e) {
    /* ignore */
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (typeof msg.playMixes === 'boolean') allowMixes = msg.playMixes;
    if (msg.type === 'FOCUS_ACTIVE') {
      if (allowMixes && isMixPage()) { hide(); return; }
      hide();
    } else if (msg.type === 'FOCUS_WARN') {
      if (allowMixes && isMixPage()) { hide(); return; }
      showWarn(msg);
    } else if (msg.type === 'FOCUS_HIDE') {
      hide();
    }
  });

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      if (allowMixes && isMixPage()) hide();
    }
  }, 800);
})();
