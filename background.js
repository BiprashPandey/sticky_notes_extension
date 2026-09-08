// YouTube rejects embedded players whose requests carry no HTTP Referer
// (error 153, embedder.identity.missing.referrer). Chrome never sends a
// Referer for iframes on extension pages, so we set one for sub-frame
// requests to YouTube initiated by THIS extension only.

function setupYtRefererRule() {
  const rule = {
    id: 1,
    priority: 1,
    condition: {
      initiatorDomains: [chrome.runtime.id],
      requestDomains: ['www.youtube.com'],
      resourceTypes: ['sub_frame'],
    },
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        {
          header: 'referer',
          operation: 'set',
          value: 'https://chrome.google.com/webstore/detail/' + chrome.runtime.id,
        },
      ],
    },
  };
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1], addRules: [rule] });
}

/* ---------------- Focus mode ---------------- */

const WARN_LEAD_MS = 60 * 1000;
const BLOCKADE_KEY = 'focusBlockade';

let focusSites = [];
let focusMinutes = 5;
let focusEnabled = true;
let focusPlayMixes = true;
let blockades = {}; // { [site]: { endAt, warned } }
let configReady = Promise.resolve();

function saveBlockades() {
  const payload = Object.fromEntries(
    Object.entries(blockades).map(([site, b]) => [site, { endAt: b.endAt, warned: b.warned }])
  );
  chrome.storage.session.set({ [BLOCKADE_KEY]: payload }).catch(() => {});
}

async function loadBlockades() {
  try {
    const got = await chrome.storage.session.get(BLOCKADE_KEY);
    const obj = got[BLOCKADE_KEY];
    blockades = {};
    if (obj && typeof obj === 'object') {
      const now = Date.now();
      for (const [site, b] of Object.entries(obj)) {
        if (b && typeof b.endAt === 'number' && b.endAt > now) {
          blockades[site] = { endAt: b.endAt, warned: !!b.warned };
        }
      }
    }
  } catch (e) {
    blockades = {};
  }
}

function normalizeDomain(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]
    .trim();
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function matchedSite(hostname) {
  const h = normalizeDomain(hostname);
  for (let i = 0; i < focusSites.length; i++) {
    const s = normalizeDomain(focusSites[i]);
    if (s && (h === s || h.endsWith('.' + s))) return s;
  }
  return '';
}

function isMixPlaylist(url) {
  try {
    const u = new URL(url);
    const host = normalizeDomain(u.hostname);
    if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) return false;
    if (u.searchParams.has('index')) return true;
    if (u.searchParams.get('start_radio') === '1') return true;
    const list = String(u.searchParams.get('list') || '');
    return list.slice(0, 2).toUpperCase() === 'RD';
  } catch (e) {
    return false;
  }
}

function shouldExemptFocusUrl(url) {
  return focusPlayMixes && isMixPlaylist(url);
}

function isFocusHost(hostname, url) {
  if (!focusEnabled) return false;
  if (url && shouldExemptFocusUrl(url)) return false;
  return !!matchedSite(hostname);
}

function applyFocusConfig(cfg) {
  const f = cfg && cfg.focus;
  focusEnabled = f ? f.enabled !== false : true;
  focusPlayMixes = f ? f.playMixes !== false : true;
  if (f && Array.isArray(f.sites)) {
    focusSites = f.sites.filter((x) => typeof x === 'string' && x.trim());
  } else if (f && f.url) {
    focusSites = [f.url];
  } else {
    focusSites = [];
  }
  const m = Number(f && f.minutes);
  focusMinutes = isFinite(m) && m >= 1 ? Math.min(180, Math.round(m)) : 5;
  if (!focusEnabled && Object.keys(blockades).length) clearAllBlockades();
}

async function loadFocusConfig() {
  try {
    const stored = await chrome.storage.local.get('dashboardStateV1');
    applyFocusConfig(stored['dashboardStateV1']);
  } catch (e) {
    /* ignore */
  }
}

async function siteTabs(site) {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs.filter((t) => t.url && matchedSite(hostOf(t.url)) === site && !shouldExemptFocusUrl(t.url));
  } catch (e) {
    return [];
  }
}

async function allSiteTabs(site) {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs.filter((t) => t.url && matchedSite(hostOf(t.url)) === site);
  } catch (e) {
    return [];
  }
}

function notifySite(site, type, data) {
  siteTabs(site).then((tabs) => {
    for (const t of tabs) {
      chrome.tabs.sendMessage(t.id, Object.assign({ type: type }, data)).catch(() => {});
    }
  });
}

function notifySiteAll(site, type, data) {
  allSiteTabs(site).then((tabs) => {
    for (const t of tabs) {
      chrome.tabs.sendMessage(t.id, Object.assign({ type: type }, data)).catch(() => {});
    }
  });
}

function startBlockade(site) {
  blockades[site] = { endAt: Date.now() + focusMinutes * 60 * 1000, warned: false };
  saveBlockades();
  notifySite(site, 'FOCUS_ACTIVE', { remainingMs: focusMinutes * 60 * 1000, playMixes: focusPlayMixes });
}

function clearAllBlockades() {
  const sites = Object.keys(blockades);
  blockades = {};
  saveBlockades();
  for (const site of sites) notifySiteAll(site, 'FOCUS_HIDE', { playMixes: focusPlayMixes });
  for (const site of focusSites) notifySiteAll(normalizeDomain(site), 'FOCUS_HIDE', { playMixes: focusPlayMixes });
}

async function endBlockade(site, closeNow) {
  delete blockades[site];
  saveBlockades();
  notifySiteAll(site, 'FOCUS_HIDE', { playMixes: focusPlayMixes });
  if (closeNow) {
    const tabs = await siteTabs(site);
    for (const t of tabs) {
      chrome.tabs.remove(t.id).catch(() => {});
    }
  }
}

function openMotivation() {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') + '?reels=1' }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tab = sender.tab;
  const senderHost = tab && tab.url ? hostOf(tab.url) : '';
  if (!tab) return;
  const site = matchedSite(senderHost);
  if (msg && msg.type === 'FOCUS_INIT') {
    configReady.then(() => {
      if (!focusEnabled) {
        sendResponse({ isTarget: false });
        return;
      }
      if (shouldExemptFocusUrl(sender.tab.url)) {
        sendResponse({ isTarget: false });
        return;
      }
      const s = matchedSite(senderHost);
      if (!s) {
        sendResponse({ isTarget: false });
        return;
      }
      const b = blockades[s];
      sendResponse({
        isTarget: true,
        active: !!b,
        warned: b ? b.warned : false,
        remainingMs: b ? Math.max(0, b.endAt - Date.now()) : 0,
        minutes: focusMinutes,
        playMixes: focusPlayMixes,
      });
    });
    return true;
  }
  if (!site) return;
  switch (msg && msg.type) {
    case 'FOCUS_START':
      startBlockade(site);
      sendResponse({ ok: true });
      return;
    case 'FOCUS_EXTEND':
      startBlockade(site);
      sendResponse({ ok: true });
      return;
    case 'FOCUS_EXIT':
      endBlockade(site, true);
      sendResponse({ ok: true });
      return;
    case 'FOCUS_MOTIVATE':
      openMotivation();
      sendResponse({ ok: true });
      return;
  }
});

async function focusTick() {
  const now = Date.now();
  for (const site of Object.keys(blockades)) {
    const b = blockades[site];
    if (!b) continue;
    const rem = b.endAt - now;
    if (rem <= 0) {
      await endBlockade(site, true);
    } else if (rem <= WARN_LEAD_MS && !b.warned) {
      b.warned = true;
      notifySite(site, 'FOCUS_WARN', { remainingMs: rem, minutes: focusMinutes, playMixes: focusPlayMixes });
      saveBlockades();
    }
  }
}

function setupFocusTicking() {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'focusTick') focusTick();
  });
  chrome.alarms.create('focusTick', { periodInMinutes: 0.5 });
}

chrome.runtime.onInstalled.addListener(() => {
  setupYtRefererRule();
  loadFocusConfig();
});
chrome.runtime.onStartup.addListener(() => {
  setupYtRefererRule();
  loadFocusConfig();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const ch = changes['dashboardStateV1'];
  if (ch) applyFocusConfig(ch.newValue);
});

(async function initFocus() {
  configReady = loadFocusConfig();
  await configReady;
  await loadBlockades();
  for (const site of Object.keys(blockades)) {
    const b = blockades[site];
    if (b && b.endAt <= Date.now()) {
      await endBlockade(site, true);
    }
  }
  setupFocusTicking();
})();