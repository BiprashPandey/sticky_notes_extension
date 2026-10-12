import { setupYtRefererRule } from './youtube-referer.js';
import { initFocusEngine } from './focus-engine.js';
import { initMcqEngine } from './mcq-engine.js';

chrome.runtime.onInstalled.addListener(() => setupYtRefererRule());
chrome.runtime.onStartup.addListener(() => setupYtRefererRule());

initFocusEngine();
initMcqEngine();