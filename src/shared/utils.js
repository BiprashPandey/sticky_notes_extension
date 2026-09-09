export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function htmlFromText(text) {
  if (!text) return '';
  if (String(text).indexOf('<') !== -1) return String(text);
  return escapeHtml(text).replace(/\n/g, '<br>');
}

export function clampPct(v) {
  const n = Number(v);
  return isFinite(n) ? Math.min(95, Math.max(0, n)) : 0;
}

export function pct(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : 0;
}