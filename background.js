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

chrome.runtime.onInstalled.addListener(setupYtRefererRule);
chrome.runtime.onStartup.addListener(setupYtRefererRule);
