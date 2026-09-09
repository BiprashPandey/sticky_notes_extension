import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { layoutRow, round3 } from '../ui/layout.js';
import { bindPin, makeDraggable, makeResizable } from '../ui/drag.js';
import { clampPct, escapeHtml, htmlFromText, pct, uid } from '../shared/utils.js';

export const QUOTE_DEFAULTS = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];

export function renderQuotes() {
  els.widgets.querySelectorAll('.quote').forEach((q) => q.remove());
  for (const quote of state.quotes) renderQuote(quote);
  const changed = layoutRow(state.quotes, (id) => els.widgets.querySelector('.quote[data-quote-id="' + id + '"]'), 0.58);
  if (changed) saveState();
}

function renderQuote(quote) {
  const el = document.createElement('div');
  el.className = 'quote' + (quote.collapsed ? ' collapsed' : '') + (quote.h || quote.hpct ? ' fixed' : '');
  el.dataset.quoteId = quote.id;
  el.style.left = clampPct(quote.x) + '%';
  el.style.top = clampPct(quote.y) + '%';
  if (quote.wpct != null) el.style.width = quote.wpct + 'vw';
  else if (quote.w) el.style.width = Math.max(240, quote.w) + 'px';
  if (quote.hpct != null) el.style.height = quote.hpct + 'vh';
  else if (quote.h) el.style.height = quote.h + 'px';

  el.innerHTML =
    '<div class="quote-header">' +
      '<button type="button" class="icon-btn quote-pin-btn" title="Pin">📌</button>' +
      '<span class="quote-mark" title="Quote">❝</span>' +
      '<span class="note-spacer"></span>' +
      '<button type="button" class="icon-btn quote-collapse-btn" title="' + (quote.collapsed ? 'Expand' : 'Collapse') + '">' + (quote.collapsed ? '＋' : '–') + '</button>' +
      '<button type="button" class="icon-btn quote-delete-btn" title="Delete quote">✕</button>' +
    '</div>' +
    '<div class="quote-text" contenteditable="true" spellcheck="false" data-placeholder="Write your quote…">' + htmlFromText(quote.text) + '</div>' +
    '<input class="quote-author" type="text" value="' + escapeHtml(quote.author || '') + '" placeholder="— Attribution (optional)" title="Author (optional)">' +
    '<div class="quote-resize" title="Drag to resize — double-click to reset"></div>';

  const textEl = el.querySelector('.quote-text');
  const authorEl = el.querySelector('.quote-author');
  if (quote.h || quote.hpct != null) textEl.style.overflowY = 'auto';

  textEl.addEventListener('input', () => {
    quote.text = textEl.innerHTML;
    saveState();
  });

  authorEl.addEventListener('input', () => {
    quote.author = authorEl.value;
    saveState();
  });

  const collapseBtn = el.querySelector('.quote-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    quote.collapsed = !quote.collapsed;
    el.classList.toggle('collapsed', quote.collapsed);
    collapseBtn.textContent = quote.collapsed ? '＋' : '–';
    collapseBtn.title = quote.collapsed ? 'Expand' : 'Collapse';
    saveState();
  });

  bindPin(el, el.querySelector('.quote-pin-btn'), quote);

  el.querySelector('.quote-delete-btn').addEventListener('click', () => {
    state.quotes = state.quotes.filter((q) => q.id !== quote.id);
    el.remove();
    saveState(true);
  });

  const resizeHandle = el.querySelector('.quote-resize');
  makeResizable(el, resizeHandle, (w, h) => {
    quote.w = Math.round(w);
    quote.h = Math.round(h);
    quote.wpct = round3((w / window.innerWidth) * 100);
    quote.hpct = round3((h / window.innerHeight) * 100);
    el.classList.add('fixed');
    textEl.style.height = '';
    textEl.style.overflowY = 'auto';
    saveState();
  }, {
    minW: Math.max(200, Math.round(window.innerWidth * 0.13)),
    minH: Math.max(80, Math.round(window.innerHeight * 0.12)),
    disabled: () => quote.pinned,
  });
  resizeHandle.addEventListener('dblclick', () => {
    delete quote.w;
    delete quote.h;
    delete quote.wpct;
    delete quote.hpct;
    el.style.width = '';
    el.style.height = '';
    el.classList.remove('fixed');
    textEl.style.overflowY = '';
    saveState();
  });

  makeDraggable(el, el, () => {
    quote.x = pct(el.style.left);
    quote.y = pct(el.style.top);
    saveState();
  }, { disabled: () => quote.pinned });

  els.widgets.appendChild(el);
}

export function addQuote() {
  const d = QUOTE_DEFAULTS[Math.floor(Math.random() * QUOTE_DEFAULTS.length)];
  const quote = { id: uid(), text: d.text, author: d.author, collapsed: false, pinned: false };
  state.quotes.push(quote);
  saveState();
  renderQuotes();
}

