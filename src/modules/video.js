import { els } from '../shared/dom.js';
import { LOCAL_SLOTS } from './wallpaper.js';



const VIDEO_EXTS = ['mp4', 'm4v', 'webm', 'mov', 'mkv', 'ogv', 'ogg'];

let videoLibrary = [];

function isVideoName(name) {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  return VIDEO_EXTS.includes(name.slice(dot + 1).toLowerCase());
}

export async function detectVideos() {
  const allNames = [];
  try {
    const packaged = await listPackagedVideos();
    allNames.push(...packaged);
  } catch (e) {
    console.warn('[dashboard] Package folder scan failed:', e);
  }
  try {
    const fromPlaylist = await fetchPlaylistNames();
    for (const n of fromPlaylist) {
      if (!allNames.includes(n)) allNames.push(n);
    }
  } catch (e) {
    console.warn('[dashboard] Playlist manifest scan failed:', e);
  }
  if (!allNames.length) {
    try {
      const probed = await probeNumberedVideos();
      allNames.push(...probed);
    } catch (e) {
      /* ignore */
    }
  }
  const names = [...new Set(allNames)];
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  videoLibrary = names.map((name) => ({ name, src: chrome.runtime.getURL('videos/' + name) }));
}

async function fetchPlaylistNames() {
  const res = await fetch(chrome.runtime.getURL('videos/playlist.json'));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter((n) => typeof n === 'string' && isVideoName(n));
}

async function listPackagedVideos() {
  const root = await new Promise((resolve, reject) => {
    try {
      chrome.runtime.getPackageDirectoryEntry(resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
  const dir = await new Promise((resolve, reject) => root.getDirectory('videos', { create: false }, resolve, reject));
  const files = [];
  const reader = dir.createReader();
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) break;
    for (const f of batch) {
      if (f.isFile && isVideoName(f.name)) files.push(f.name);
    }
  }
  return files;
}

async function probeNumberedVideos() {
  const found = [];
  await Promise.all(LOCAL_SLOTS.map((slot) => ['mp4', 'webm'].map((ext) => new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => { found.push(slot + '.' + ext); resolve(); };
    v.onerror = () => resolve();
    v.src = chrome.runtime.getURL('videos/' + slot + '.' + ext);
  }))).flat());
  return [...new Set(found)];
}



const VIDEO_STATE_KEY = 'dashboardReelsV1';
let videoEls = null;
let videoState = { order: [], pos: 0 };

function loadVideoState() {
  try {
    const raw = localStorage.getItem(VIDEO_STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.order)) {
      return {
        order: parsed.order.filter((n) => typeof n === 'string'),
        pos: Number(parsed.pos) || 0,
      };
    }
  } catch (e) {
    /* ignore */
  }
  return { order: [], pos: 0 };
}

function saveVideoState() {
  try {
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(videoState));
  } catch (e) {
    /* ignore */
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reshuffleDeck(prevName) {
  let order;
  do {
    order = shuffleArray(videoLibrary.map((v) => v.name));
  } while (prevName && order.length > 1 && order[0] === prevName);
  videoState.order = order;
  videoState.pos = 0;
}

function syncVideoOrder() {
  const names = videoLibrary.map((v) => v.name);
  const isValid = videoState.order.length === names.length &&
    videoState.order.every((n) => names.includes(n));
  if (!isValid) reshuffleDeck(null);
  if (videoState.pos < 0 || videoState.pos >= videoState.order.length) videoState.pos = 0;
}

function currentVideoItem() {
  const name = videoState.order[videoState.pos];
  return videoLibrary.find((v) => v.name === name) || null;
}

export function initVideoPlayer() {
  videoState = loadVideoState();
  videoEls = {
    vid: els.videoOverlay.querySelector('.video-player'),
    name: els.videoOverlay.querySelector('.video-name'),
    count: els.videoOverlay.querySelector('.video-count'),
    navBtns: els.videoOverlay.querySelectorAll('.video-nav-btn'),
    openBtn: els.videoOverlay.querySelector('.video-open-btn'),
    refreshBtn: els.videoOverlay.querySelector('.video-refresh-btn'),
  };

  videoEls.navBtns.forEach((btn) => {
    btn.addEventListener('click', () => stepVideo(Number(btn.dataset.dir)));
  });
  videoEls.openBtn.addEventListener('click', () => {
    const item = currentVideoItem();
    if (!item) return;
    chrome.tabs.create({ url: item.src });
  });
  videoEls.refreshBtn.addEventListener('click', async () => {
    const btn = videoEls.refreshBtn;
    btn.disabled = true;
    btn.classList.add('spinning');
    try {
      await detectVideos();
      videoState.order = [];
      videoState.pos = 0;
      reshuffleDeck(null);
      applyVideoSource();
      saveVideoState();
    } catch (e) {
      console.warn('[dashboard] Refresh playlist failed:', e);
    }
    setTimeout(() => {
      btn.classList.remove('spinning');
      btn.disabled = false;
    }, 600);
  });

  els.addVideoBtn.addEventListener('click', openVideoPlayer);
  els.closeVideoBtn.addEventListener('click', closeVideoPlayer);
  els.videoOverlay.addEventListener('click', (e) => {
    if (e.target === els.videoOverlay) closeVideoPlayer();
  });
}

function applyVideoSource() {
  const { vid, name, count, navBtns, openBtn } = videoEls;
  if (!videoLibrary.length) {
    name.textContent = 'No videos in /videos folder';
    count.textContent = '';
    navBtns.forEach((b) => { b.disabled = true; });
    openBtn.disabled = true;
    vid.removeAttribute('src');
    vid.load();
    return;
  }
  syncVideoOrder();
  const item = currentVideoItem();
  if (!item) return;
  if (vid.dataset.src !== item.src) {
    vid.dataset.src = item.src;
    vid.src = item.src;
    vid.load();
  }
  name.textContent = item.name.replace(/\.[^.]+$/, '');
  name.title = item.name;
  count.textContent = (videoState.pos + 1) + ' / ' + videoState.order.length;
  navBtns.forEach((b) => { b.disabled = false; });
  openBtn.disabled = false;
}

export function stepVideo(dir) {
  if (!videoState.order.length) return;
  const len = videoState.order.length;
  if (dir > 0) {
    if (videoState.pos + 1 >= len) reshuffleDeck(videoState.order[videoState.pos]);
    else videoState.pos += 1;
  } else {
    videoState.pos = videoState.pos - 1 < 0 ? len - 1 : videoState.pos - 1;
  }
  applyVideoSource();
  saveVideoState();
  videoEls.vid.play().catch(() => {});
}

export function openVideoPlayer() {
  applyVideoSource();
  saveVideoState();
  els.videoOverlay.classList.add('open');
  videoEls.vid.play().catch(() => {});
}

export function closeVideoPlayer() {
  els.videoOverlay.classList.remove('open');
  videoEls.vid.pause();
}

