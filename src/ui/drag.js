import { saveState } from '../shared/state.js';

export function bindPin(el, btn, obj) {
  const apply = () => {
    el.classList.toggle('pinned', !!obj.pinned);
    btn.classList.toggle('pinned', !!obj.pinned);
    btn.title = obj.pinned ? 'Unpin' : 'Pin';
  };
  btn.addEventListener('click', () => {
    obj.pinned = !obj.pinned;
    apply();
    saveState();
  });
  apply();
  return apply;
}

export function makeDraggable(el, handle, onDrop, opts) {
  const disabled = opts && typeof opts.disabled === 'function' ? opts.disabled : null;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let rect = null;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (disabled && disabled()) return;
    if (e.target.closest('button, select, input, textarea, [contenteditable]')) return;
    dragging = true;
    rect = el.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    el.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const left = Math.min(Math.max(rect.left + dx, 0), maxLeft);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const top = Math.min(Math.max(rect.top + dy, 0), maxTop);
    el.style.left = (left / window.innerWidth) * 100 + '%';
    el.style.top = (top / window.innerHeight) * 100 + '%';
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if (onDrop) onDrop();
  };

  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

export function makeResizable(el, handle, onResize, opts) {
  const minW = (opts && opts.minW) != null ? opts.minW : Math.max(140, Math.round(window.innerWidth * 0.1));
  const minH = (opts && opts.minH) != null ? opts.minH : Math.max(80, Math.round(window.innerHeight * 0.12));
  const maxW = (opts && opts.maxW) != null ? opts.maxW : Math.round(window.innerWidth * 0.85);
  const aspect = opts && opts.aspect ? opts.aspect : null;
  const disabled = opts && typeof opts.disabled === 'function' ? opts.disabled : null;
  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (disabled && disabled()) return;
    resizing = true;
    const r = el.getBoundingClientRect();
    startW = r.width;
    startH = r.height;
    startX = e.clientX;
    startY = e.clientY;
    el.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    const maxH = window.innerHeight - 60;
    let w = startW + (e.clientX - startX);
    let h = startH + (e.clientY - startY);
    if (aspect) {
      if (Math.abs(e.clientX - startX) >= Math.abs(e.clientY - startY)) {
        w = Math.min(Math.max(w, minW), maxW);
        h = w / aspect;
        if (h < minH) { h = minH; w = h * aspect; }
        if (h > maxH) { h = maxH; w = h * aspect; }
      } else {
        h = Math.min(Math.max(h, minH), maxH);
        w = h * aspect;
        if (w < minW) { w = minW; h = w / aspect; }
        if (w > maxW) { w = maxW; h = w / aspect; }
      }
    } else {
      w = Math.min(Math.max(w, minW), maxW);
      h = Math.min(Math.max(h, minH), maxH);
    }
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    if (onResize) onResize(w, h);
  });

  const end = () => {
    if (!resizing) return;
    resizing = false;
    el.classList.remove('dragging');
  };

  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}