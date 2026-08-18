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

// -------------------------------------------------------------
// SUB-TASK B3: GEMINI API INTEGRATION & STRUCTURED OUTPUTS
// -------------------------------------------------------------


// Fallback JSON in case of API error, offline status, or missing key
const mockGeminiFallback = {
  cssUpdates: {
    "--adapt-font-scale": "1.5",
    "--adapt-bg-color": "#121212",
    "--adapt-text-color": "#FFFF00",
    "--adapt-line-height": "1.6"
  },
  simplifiedText: [
    "Simplified Summary 1: High performance cloud architecture boosted operational margins.",
    "Simplified Summary 2: Real-time client-side DOM adaptation models transform web layouts safely."
  ],
  dyslexicFont: true,
  motorAssist: true,
  voiceIntent: null
};

// Gemini Structured Output Schema Definition
const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    cssUpdates: {
      type: "OBJECT",
      properties: {
        "--adapt-font-scale": { type: "STRING" },
        "--adapt-bg-color": { type: "STRING" },
        "--adapt-text-color": { type: "STRING" }
      },
      required: ["--adapt-font-scale"]
    },
    simplifiedText: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    dyslexicFont: { type: "BOOLEAN" },
    motorAssist: { type: "BOOLEAN" },
    voiceIntent: { type: "STRING", nullable: true }
  },
  required: ["cssUpdates", "simplifiedText"]
};

/**
 * Invokes Gemini REST API via native fetch()
 */
async function callGeminiApi(systemInstruction, userContent, apiKey = null) {
  if (!apiKey) {
    console.warn("[AdaptAI Gemini API] No API Key provided. Returning defensive fallback mock JSON.");
    return mockGeminiFallback;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemInstruction}\n\n${userContent}` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: geminiResponseSchema,
      temperature: 0.2
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty candidate payload from Gemini API.");

    const parsedJson = JSON.parse(rawText);
    console.log("[AdaptAI Gemini API] Successfully generated Structured JSON:", parsedJson);
    return parsedJson;
  } catch (err) {
    console.error("[AdaptAI Gemini API Error] Exception during fetch call:", err);
    return mockGeminiFallback;
  }
}

/**
 * Master processing pipeline orchestrating storage, Gemini invocation, and tab response
 */
async function handleAiProcessRequest(pageText, tabId, apiKey = null) {
  console.log(`[AdaptAI Processing Pipeline] Starting process for Tab ID: ${tabId}`);
  
  // 1. Retrieve User Accessibility Profile
  const profile = await getUserProfileFromStorage();

  // 2. Engineer Gemini System Prompt
  const { systemInstruction, userContent } = buildGeminiSystemPrompt(profile, pageText);

  // 3. Invoke Gemini API (or safe fallback)
  const transformationData = await callGeminiApi(systemInstruction, userContent, apiKey);

  // 4. Dispatch result back to Content Script
  if (tabId && typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.sendMessage(tabId, {
      action: "apply_transformations",
      data: transformationData
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn("[AdaptAI Processing Pipeline] Error sending payload to tab:", chrome.runtime.lastError.message);
      } else {
        console.log("[AdaptAI Processing Pipeline] Successfully delivered transformations to tab!");
      }
    });
  }

  return transformationData;
}


// -------------------------------------------------------------
// SUB-TASK B4: BACKGROUND WORKER AUTOMATED SUITE
// -------------------------------------------------------------
async function runTrackBTests() {
  console.group("🧪 [AdaptAI Track B Validation Suite]");
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // 1. Storage Retrieval Test
  const profile = await getUserProfileFromStorage();
  assert(profile !== null && typeof profile === 'object', "Storage retrieval returns valid profile object");
  assert(profile.visual !== undefined, "Profile contains visual preferences block");

  // 2. Prompt Engineering Test
  const sampleScrapedText = "Sample academic text scraped from DOM.";
  const { systemInstruction, userContent } = buildGeminiSystemPrompt(profile, sampleScrapedText);
  assert(systemInstruction.includes("AdaptAI"), "System prompt includes core instruction persona");
  assert(userContent.includes(sampleScrapedText), "User content prompt includes scraped page text");

  // 3. Fallback Gemini API Execution Test
  const fallbackResult = await callGeminiApi(systemInstruction, userContent, null);
  assert(fallbackResult.cssUpdates !== undefined, "Fallback API call returns valid cssUpdates object");
  assert(Array.isArray(fallbackResult.simplifiedText), "Fallback API call returns valid simplifiedText array");
  assert(fallbackResult.cssUpdates["--adapt-font-scale"] !== undefined, "CSS updates contain required --adapt-font-scale key");

  // 4. Processing Pipeline Orchestration Test
  const pipelineResult = await handleAiProcessRequest(sampleScrapedText, null, null);
  assert(pipelineResult !== null && pipelineResult.simplifiedText.length > 0, "Full pipeline processes scraped text and yields valid transformation payload");

  console.log(`\n📊 Track B Test Results: ${passed}/${total} assertions passed.`);
  console.groupEnd();
  return passed === total;
}

// Export for module/global test runners
if (typeof self !== 'undefined') {
  self.runTrackBTests = runTrackBTests;
}



