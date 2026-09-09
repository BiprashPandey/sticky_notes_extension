import { setupYtRefererRule } from './youtube-referer.js';
import { initFocusEngine } from './focus-engine.js';

chrome.runtime.onInstalled.addListener(() => setupYtRefererRule());
chrome.runtime.onStartup.addListener(() => setupYtRefererRule());

initFocusEngine();