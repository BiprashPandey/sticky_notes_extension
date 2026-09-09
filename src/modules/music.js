import { els } from '../shared/dom.js';
import { state, saveState } from '../shared/state.js';
import { escapeHtml, uid } from '../shared/utils.js';



let ytFrameEl = null;
export let musicNowPlaying = null;
let musicPaused = false;

function parsePlaylistId(url) {
  const m = String(url || '').match(/[?&]list=([A-Za-z0-9_-]+)/);
  return m ? m[1] : '';
}

export function renderMusic() {
  els.musicList.innerHTML = '';
  const lists = state.music ? state.music.playlists : [];
  if (!lists.length) {
    els.musicHint.textContent = 'No playlists yet — paste a YouTube playlist link above.';
    return;
  }
  for (const pl of lists) {
    const row = document.createElement('div');
    row.className = 'music-row' + (musicNowPlaying && musicNowPlaying.id === pl.id ? ' active' : '');
    row.innerHTML =
      '<span class="music-row-name">' + escapeHtml(pl.name || 'Untitled') + '</span>' +
      '<button type="button" class="video-nav-btn music-play-btn" title="Play">▶</button>' +
      '<button type="button" class="icon-btn music-del-btn" title="Remove">✕</button>';
    row.querySelector('.music-play-btn').addEventListener('click', () => {
      playMusic(pl);
      closeMusicOverlay();
    });
    row.querySelector('.music-del-btn').addEventListener('click', () => {
      if (musicNowPlaying && musicNowPlaying.id === pl.id) stopMusic();
      state.music.playlists = state.music.playlists.filter((p) => p.id !== pl.id);
      saveState(true);
      renderMusic();
    });
    els.musicList.appendChild(row);
  }
}

function ytCommand(func) {
  if (!ytFrameEl || !ytFrameEl.contentWindow) return;
  ytFrameEl.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func, args: [] }),
    'https://www.youtube.com'
  );
}

function playMusic(pl) {
  if (!pl || !pl.plId) return;
  const frame = els.ytHolder.querySelector('iframe') || document.createElement('iframe');
  if (!frame.parentNode) {
    frame.allow = 'autoplay; encrypted-media';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    els.ytHolder.appendChild(frame);
  }
  const samePlaylist = musicNowPlaying && musicNowPlaying.id === pl.id && frame.dataset.list === pl.plId;
  musicNowPlaying = pl;
  musicPaused = false;
  if (!samePlaylist) {
    frame.dataset.list = pl.plId;
    frame.src = 'https://www.youtube.com/embed/videoseries?list=' + encodeURIComponent(pl.plId) +
      '&enablejsapi=1&autoplay=1&playsinline=1';
  }
  ytFrameEl = frame;
  els.musicMini.hidden = false;
  els.musicMiniName.textContent = pl.name || 'Untitled playlist';
  els.musicToggleBtn.textContent = '⏸';
}

export function stopMusic() {
  musicNowPlaying = null;
  musicPaused = false;
  ytFrameEl = null;
  const frame = els.ytHolder.querySelector('iframe');
  if (frame) frame.removeAttribute('src');
  els.musicMini.hidden = true;
}

function toggleMusic() {
  if (!musicNowPlaying) return;
  if (musicPaused) {
    ytCommand('playVideo');
    musicPaused = false;
    els.musicToggleBtn.textContent = '⏸';
  } else {
    ytCommand('pauseVideo');
    musicPaused = true;
    els.musicToggleBtn.textContent = '▶';
  }
}

function openMusicOverlay() {
  renderMusic();
  els.musicOverlay.classList.add('open');
}

export function closeMusicOverlay() {
  els.musicOverlay.classList.remove('open');
}

export function bindMusic() {
  els.musicBtn.addEventListener('click', openMusicOverlay);
  els.closeMusicBtn.addEventListener('click', closeMusicOverlay);
  els.musicOverlay.addEventListener('click', (e) => {
    if (e.target === els.musicOverlay) closeMusicOverlay();
  });

  els.musicAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.musicNameInput.value.trim();
    const url = els.musicUrlInput.value.trim();
    const plId = parsePlaylistId(url);
    if (!name || !plId) {
      els.musicHint.textContent = 'Enter a name and a valid YouTube playlist link (…?list=…).';
      return;
    }
    state.music.playlists.push({ id: uid(), name, url, plId });
    saveState();
    els.musicNameInput.value = '';
    els.musicUrlInput.value = '';
    els.musicHint.textContent = '';
    renderMusic();
  });

  els.musicPrevBtn.addEventListener('click', () => ytCommand('previousVideo'));
  els.musicNextBtn.addEventListener('click', () => ytCommand('nextVideo'));
  els.musicToggleBtn.addEventListener('click', toggleMusic);
  els.musicStopBtn.addEventListener('click', stopMusic);
}

