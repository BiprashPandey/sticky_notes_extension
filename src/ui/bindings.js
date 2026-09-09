import { els } from '../shared/dom.js';
import { manualSave } from '../modules/data.js';
import { refreshLayout } from './layout.js';
import { nextWallpaper } from '../modules/wallpaper.js';
import { closeVideoPlayer, stepVideo } from '../modules/video.js';
import { closeMusicOverlay, stopMusic, musicNowPlaying } from '../modules/music.js';
import { closeCalendar } from '../modules/calendar.js';
import { addTodo } from '../modules/todos.js';
import { addRoutine } from '../modules/routines.js';
import { addQuote } from '../modules/quotes.js';
import { addCalendar } from '../modules/calendar.js';

let layoutResizeTimer = null;

export function bindUi(addNote, addClock) {
  els.addNoteBtn.addEventListener('click', addNote);
  els.addClockBtn.addEventListener('click', addClock);
  els.addTodoBtn.addEventListener('click', addTodo);
  els.addRoutineBtn.addEventListener('click', addRoutine);
  els.addQuoteBtn.addEventListener('click', addQuote);
  els.addCalendarBtn.addEventListener('click', addCalendar);
  els.cycleWallpaperBtn.addEventListener('click', nextWallpaper);
  els.saveBtn.addEventListener('click', manualSave);
  document.addEventListener('contextmenu', manualSave);

  const overlays = [
    els.settingsOverlay,
    els.focusOverlay,
    els.pomodoroOverlay,
    els.calendarOverlay,
    els.videoOverlay,
    els.musicOverlay,
  ];
  els.powerBtn.addEventListener('click', () => {
    const hiding = !els.powerBtn.classList.contains('active');
    document.body.classList.toggle('power-hidden', hiding);
    els.powerBtn.classList.toggle('active', hiding);
    els.powerBtn.title = hiding ? 'Show all widgets' : 'Hide all widgets';
    for (const o of overlays) o.classList.remove('open');
    closeVideoPlayer();
    closeMusicOverlay();
    if (hiding) {
      if (musicNowPlaying) stopMusic();
      els.musicMini.hidden = true;
    } else if (musicNowPlaying) {
      els.musicMini.hidden = false;
    }
  });

  els.settingsBtn.addEventListener('click', () => els.settingsOverlay.classList.add('open'));
  els.closeSettingsBtn.addEventListener('click', () => els.settingsOverlay.classList.remove('open'));
  els.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === els.settingsOverlay) els.settingsOverlay.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      els.settingsOverlay.classList.remove('open');
      els.focusOverlay.classList.remove('open');
      els.pomodoroOverlay.classList.remove('open');
      closeCalendar();
      closeVideoPlayer();
      closeMusicOverlay();
      return;
    }
    const tag = document.activeElement && document.activeElement.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (els.videoOverlay.classList.contains('open') && !typing) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepVideo(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); stepVideo(1); }
      return;
    }
  });

  window.addEventListener('resize', () => {
    if (layoutResizeTimer) clearTimeout(layoutResizeTimer);
    layoutResizeTimer = setTimeout(refreshLayout, 250);
  });
}