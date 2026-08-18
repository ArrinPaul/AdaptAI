// background.js - Track B Intelligence Engine & Service Worker

// -------------------------------------------------------------
// SUB-TASK B1: SERVICE WORKER LIFECYCLE & EVENT WIRING
// -------------------------------------------------------------

// 1. Open Onboarding Setup Tab on Installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log("[AdaptAI Service Worker] Extension installed. Opening Onboarding setup tab...");
    chrome.tabs.create({ url: 'onboarding/onboarding.html' });
  }
});

// Helper: Sends scrape_page trigger to target tab
function triggerPageAdaptation(tab) {
  if (!tab || !tab.id) return;
  console.log(`[AdaptAI Service Worker] Triggering page scrape on Tab ID: ${tab.id}`);
  chrome.tabs.sendMessage(tab.id, { action: "scrape_page" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("[AdaptAI Service Worker] Tab listener error:", chrome.runtime.lastError.message);
    }
  });
}

// 2. Listen for clicks on the Extension Action Icon
chrome.action.onClicked.addListener((tab) => {
  triggerPageAdaptation(tab);
});

// 3. Listen for Keyboard Commands (e.g. Ctrl+Shift+A)
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger_adaptation") {
    console.log("[AdaptAI Service Worker] Keyboard command trigger_adaptation received.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        triggerPageAdaptation(tabs[0]);
      }
    });
  }
});

// 4. Runtime Message Listener Router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "process_with_ai") {
    console.log("[AdaptAI Service Worker] Received scraped text payload from content script.");
    const tabId = sender.tab ? sender.tab.id : null;
    
    // Delegate to processing pipeline (Implemented in Sub-Tasks B.2 & B.3)
    if (typeof handleAiProcessRequest === 'function') {
      handleAiProcessRequest(request.pageText, tabId);
    } else {
      console.log("[AdaptAI Service Worker Placeholder] Pipeline pending B.2 & B.3 implementation.");
    }
  }
  return true; // Keep message channel open for async responses
});

