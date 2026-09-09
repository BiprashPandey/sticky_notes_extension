import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { escapeHtml } from '../shared/utils.js';

const REMOTE_WALLPAPERS = [
  { id: 'u1',  name: 'Alpine Dawn',     type: 'image', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u2',  name: 'Misty Highlands', type: 'image', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u3',  name: 'Starlit Peaks',   type: 'image', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u4',  name: 'Tropical Shores', type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u5',  name: 'Golden Meadow',   type: 'image', src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u6',  name: 'Mirror Lake',     type: 'image', src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u7',  name: 'Ink Swirl',       type: 'image', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u8',  name: 'Violet Drift',    type: 'image', src: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u9',  name: 'Neon Bloom',      type: 'image', src: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u10', name: 'Minimal Ridge',   type: 'image', src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u11', name: 'Spectrum',        type: 'image', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u12', name: 'Deep Field',      type: 'image', src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u13', name: 'Milky Way',       type: 'image', src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u14', name: 'Night Sky',       type: 'image', src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u15', name: 'Starry Ridge',    type: 'image', src: 'https://images.unsplash.com/photo-1431411207774-da3c9611fd95?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u16', name: 'Misty Forest',    type: 'image', src: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u17', name: 'Foggy Pines',     type: 'image', src: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u18', name: 'Blue Planet',     type: 'image', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u19', name: 'Violet Dawn',     type: 'image', src: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u20', name: 'Aurora Night',    type: 'image', src: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u21', name: 'Dark Alpine',     type: 'image', src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u22', name: 'Midnight Lake',   type: 'image', src: 'https://images.unsplash.com/photo-1500530855697-b586dba89ee3?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u23', name: 'Black Tide',      type: 'image', src: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80' },
  { id: 'u24', name: 'Silhouette Woods', type: 'image', src: 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=1920&q=80' },
];

const GRADIENT_WALLPAPERS = [
  { id: 'g1', name: 'Midnight',     type: 'gradient', src: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { id: 'g2', name: 'Sunset',       type: 'gradient', src: 'linear-gradient(135deg, #f83600, #f9d423)' },
  { id: 'g3', name: 'Emerald',      type: 'gradient', src: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'g4', name: 'Violet Storm', type: 'gradient', src: 'linear-gradient(135deg, #6a11cb, #2575fc)' },
  { id: 'g5', name: 'Crimson',      type: 'gradient', src: 'linear-gradient(135deg, #fc466b, #3f5efb)' },
  { id: 'g6', name: 'Graphite',     type: 'gradient', src: 'linear-gradient(160deg, #1f2937, #374151)' },
  { id: 'g7', name: 'Deep Space',   type: 'gradient', src: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'g8', name: 'Slate Night',  type: 'gradient', src: 'linear-gradient(160deg, #0f172a, #1e293b, #334155)' },
  { id: 'g9', name: 'Royal Black',  type: 'gradient', src: 'linear-gradient(160deg, #141e30, #243b55)' },
  { id: 'g10', name: 'Abyss',       type: 'gradient', src: 'linear-gradient(160deg, #020111, #20124d, #0f0f1a)' },
  { id: 'g11', name: 'Violet Dusk', type: 'gradient', src: 'linear-gradient(160deg, #1a1038, #3b2a5e)' },
  { id: 'g12', name: 'Deep Emerald', type: 'gradient', src: 'linear-gradient(160deg, #052e1f, #0f4c33)' },
  { id: 'g13', name: 'Ember Night', type: 'gradient', src: 'linear-gradient(160deg, #1c0b07, #4a1d10)' },
  { id: 'g14', name: 'Ink',          type: 'gradient', src: 'linear-gradient(160deg, #000000, #1f2937)' },
];

export const LOCAL_SLOTS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
  '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];


let WALLPAPERS = [];
let cycleTimer = null;
let appliedWpId = null;

async function detectLocalWallpapers() {
  const found = [];
  await Promise.all(LOCAL_SLOTS.map((slot) => new Promise((resolve) => {
    const url = chrome.runtime.getURL('wallpapers/' + slot + '.jpg');
    const img = new Image();
    img.onload = () => { found.push({ id: 'l' + slot, name: 'Local ' + slot, type: 'image', src: url }); resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  })));
  return found;
}

export async function buildWallpapers() {
  const local = await detectLocalWallpapers();
  WALLPAPERS = [...GRADIENT_WALLPAPERS, ...local, ...REMOTE_WALLPAPERS];
}

export function hasWallpaper(id) {
  return WALLPAPERS.some((w) => w.id === id);
}

export function wallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0];
}

export function applyWallpaper(w) {
  if (appliedWpId !== w.id) {
    appliedWpId = w.id;
    els.bgLayer.classList.remove('wp-image', 'wp-gradient');
    els.bgLayer.innerHTML = '';
    if (w.type === 'gradient') {
      els.bgLayer.classList.add('wp-gradient');
      els.bgLayer.style.backgroundImage = w.src;
    } else {
      els.bgLayer.classList.add('wp-image');
      const img = new Image();
      img.onload = () => { els.bgLayer.innerHTML = ''; els.bgLayer.appendChild(img); };
      img.onerror = () => {
        els.bgLayer.classList.remove('wp-image');
        els.bgLayer.classList.add('wp-gradient');
        els.bgLayer.style.backgroundImage = 'linear-gradient(135deg, #0f172a, #334155)';
      };
      img.src = w.src;
    }
    if (state.wallpaper.id !== w.id) {
      state.wallpaper.id = w.id;
      saveState();
    }
  }
  buildGallery();
}

export function nextWallpaper() {
  const idx = WALLPAPERS.findIndex((w) => w.id === state.wallpaper.id);
  applyWallpaper(WALLPAPERS[(idx + 1) % WALLPAPERS.length]);
}

export function restartCycleTimer() {
  if (cycleTimer) {
    clearInterval(cycleTimer);
    cycleTimer = null;
  }
  const mins = Number(state.settings.cycleMinutes) || 0;
  if (mins > 0) cycleTimer = setInterval(nextWallpaper, mins * 60 * 1000);
}

function buildGallery() {
  if (els.wpGallery.dataset.built) {
    for (const b of els.wpGallery.querySelectorAll('.wp-thumb')) {
      b.classList.toggle('selected', b.dataset.wpId === state.wallpaper.id);
    }
    return;
  }
  els.wpGallery.dataset.built = '1';
  for (const w of WALLPAPERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wp-thumb' + (w.id === state.wallpaper.id ? ' selected' : '');
    b.dataset.wpId = w.id;
    b.style.backgroundImage = w.type === 'gradient' ? w.src : 'url("' + w.src + '")';
    b.title = w.name;
    b.innerHTML = '<span class="wp-thumb-name">' + escapeHtml(w.name) + '</span><span class="wp-thumb-check">✓</span>';
    b.addEventListener('click', () => applyWallpaper(w));
    els.wpGallery.appendChild(b);
  }
}

