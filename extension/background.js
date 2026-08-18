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
// -------------------------------------------------------------
// SUB-TASK B2: STORAGE RETRIEVAL & GEMINI PROMPT ENGINEERING
// -------------------------------------------------------------

/**
 * Retrieves User Accessibility Profile / Persona from storage
 */
async function getUserProfileFromStorage() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userProfile'], (result) => {
        if (result && result.userProfile) {
          console.log("[AdaptAI Storage] Retrieved user profile from storage:", result.userProfile);
          resolve(result.userProfile);
        } else {
          console.log("[AdaptAI Storage] No profile found. Using fallback default profile.");
          resolve(getDefaultFallbackProfile());
        }
      });
    } else {
      resolve(getDefaultFallbackProfile());
    }
  });
}

function getDefaultFallbackProfile() {
  return {
    personaName: "Standard Assist Persona",
    visual: { highContrast: true, fontScale: 1.5 },
    cognitive: { dyslexicFont: true, simplifyText: true },
    audio: { enabled: true }
  };
}

/**
 * Builds dynamic system prompt enforcing Frozen Data Contract output rules
 */
function buildGeminiSystemPrompt(userProfile, scrapedPageText) {
  const visual = userProfile.visual || {};
  const cognitive = userProfile.cognitive || {};

  const systemInstruction = `You are AdaptAI, an intelligent real-time web accessibility adaptation engine.
Analyze the user's accessibility profile and the provided webpage text content.

User Persona: ${userProfile.personaName || 'Accessibility User'}
Preferences:
- High Contrast Theme Required: ${visual.highContrast ? 'YES' : 'NO'}
- Font Scale Required: ${visual.fontScale || 1.0}x
- Dyslexia-Friendly Font Required: ${cognitive.dyslexicFont ? 'YES' : 'NO'}
- AI Text Simplification Required: ${cognitive.simplifyText ? 'YES' : 'NO'}

CRITICAL INSTRUCTIONS:
1. CSS Updates:
   - If High Contrast is YES: set "--adapt-bg-color": "#121212", "--adapt-text-color": "#FFFF00", "--adapt-font-scale": "${visual.fontScale || 1.5}".
   - Else: set "--adapt-font-scale": "${visual.fontScale || 1.0}".
2. Simplified Text:
   - If Text Simplification is YES: return an array of simplified, clear bullet-point string summaries corresponding to the input webpage paragraphs.
3. Voice Intent:
   - Determine if navigation intent (e.g. "scroll_down") is requested or set to null.

You MUST respond strictly using the required JSON schema. Do NOT include markdown formatting.`;

  const userContent = `Webpage Content Scraped From DOM:\n${scrapedPageText}`;

  return { systemInstruction, userContent };
}
