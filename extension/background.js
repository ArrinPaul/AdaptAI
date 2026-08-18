// background.js - Track B Intelligence Engine & Service Worker

// Dynamically import gitignored env.js configuration file
import './env.js';

// Environment Variable Configuration Placeholder
self.ENV = self.ENV || {
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",
  GROQ_API_KEY: "YOUR_GROQ_API_KEY"
};

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

// Helper: Sends scrape_page trigger to target tab if extension is enabled and onboarding is complete
function triggerPageAdaptation(tab) {
  if (!tab || !tab.id) return;

  chrome.storage.local.get(['extensionEnabled', 'onboardingCompleted'], (res) => {
    const isEnabled = res.extensionEnabled !== false;
    const isCompleted = res.onboardingCompleted === true;

    if (!isCompleted) {
      console.log("[AdaptAI Service Worker] Onboarding incomplete. Opening onboarding setup...");
      chrome.tabs.create({ url: 'onboarding/onboarding.html' });
      return;
    }

    if (!isEnabled) {
      console.log("[AdaptAI Service Worker] Extension is currently OFF / Disabled.");
      return;
    }

    console.log(`[AdaptAI Service Worker] Triggering page scrape on Tab ID: ${tab.id}`);
    chrome.tabs.sendMessage(tab.id, { action: "scrape_page" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[AdaptAI Service Worker] Tab listener error:", chrome.runtime.lastError.message);
      }
    });
  });
}

// 2. Listen for clicks on the Extension Action Icon
chrome.action.onClicked.addListener((tab) => {
  triggerPageAdaptation(tab);
});

// Helper: Toggles Floating AI Assistant overlay on target tab
function triggerAssistantActivation(tab) {
  if (!tab || !tab.id) return;

  chrome.storage.local.get(['extensionEnabled', 'onboardingCompleted'], (res) => {
    const isEnabled = res.extensionEnabled !== false;
    const isCompleted = res.onboardingCompleted === true;

    if (!isCompleted) {
      console.log("[AdaptAI Service Worker] Onboarding incomplete. Directing user to onboarding...");
      chrome.tabs.create({ url: 'onboarding/onboarding.html' });
      return;
    }

    if (!isEnabled) {
      console.log("[AdaptAI Service Worker] Extension is OFF. AI Assistant activation ignored.");
      return;
    }

    console.log(`[AdaptAI Service Worker] Opening AI Assistant overlay on Tab ID: ${tab.id}`);
    chrome.tabs.sendMessage(tab.id, { action: "toggle_assistant" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[AdaptAI Service Worker] Assistant listener error:", chrome.runtime.lastError.message);
      }
    });
  });
}

// 3. Listen for Keyboard Commands (Chrome Ctrl+Shift+A / Ctrl+Shift+Y & Safari WebExtension Command Adapter)
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger_adaptation") {
    console.log("[AdaptAI Service Worker] Keyboard command trigger_adaptation received.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) triggerPageAdaptation(tabs[0]);
    });
  } else if (command === "activate_ai_assistant") {
    console.log("[AdaptAI Service Worker] Keyboard command activate_ai_assistant received.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) triggerAssistantActivation(tabs[0]);
    });
  }
});


// 4. Runtime Message Listener Router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "process_with_ai") {
    console.log("[AdaptAI Service Worker] Received scraped text payload from content script.");
    const tabId = sender.tab ? sender.tab.id : null;

    chrome.storage.local.get(['extensionEnabled'], (res) => {
      if (res.extensionEnabled === false) {
        console.log("[AdaptAI Service Worker] Extension is OFF. Ignoring process_with_ai request.");
        return;
      }
      if (typeof handleAiProcessRequest === 'function') {
        handleAiProcessRequest(request.pageText, tabId);
      }
    });
  }

  if (request.action === "generate_personalization_recommendations") {
    console.log("[AdaptAI Service Worker] Generating AI Personalization Recommendations for profile:", request.profile);
    generateAndStorePersonalization(request.profile).then(recommendations => {
      sendResponse({ status: "success", recommendations });
    }).catch(err => {
      console.warn("[AdaptAI Service Worker] AI Personalization generation failed:", err.message);
      sendResponse({ status: "fallback", recommendations: getFallbackRecommendations() });
    });
    return true; // Keep async channel open
  }

  return true; // Keep message channel open for async responses
});

/**
 * Fallback recommendations if AI API fails or is offline
 */
function getFallbackRecommendations() {
  return [
    { type: "visual", instruction: "Enforce Dark Zinc High-Contrast background (#09090b) and white text hierarchy." },
    { type: "reading", instruction: "Apply 1.5x typography font scaling and expanded paragraph line spacing." },
    { type: "content", instruction: "Prioritize primary headings and synthesize concise paragraph summaries." },
    { type: "interaction", instruction: "Highlight action targets and links with high-contrast yellow accents." }
  ];
}

/**
 * Validates Gemini AI recommendation output structure
 */
function validatePersonalizationPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (!Array.isArray(payload.recommendations)) return false;
  return payload.recommendations.every(rec => typeof rec.type === 'string' && typeof rec.instruction === 'string');
}

/**
 * Invokes Gemini AI to synthesize structured recommendations and caches profile locally
 */
async function generateAndStorePersonalization(userProfile) {
  const geminiKey = self.ENV?.GEMINI_API_KEY;
  const systemInstruction = `You are AdaptAI's Expert Accessibility Personalization Engine.
Analyze the user's test score diagnostics and profile settings:
Persona: ${userProfile.personaName || 'Custom Assist Persona'}
Scores: Visual ${userProfile.diagnosticScores?.visualScore || '85/100'}, Cognitive ${userProfile.diagnosticScores?.cognitiveScore || '90/100'}, Motor ${userProfile.diagnosticScores?.motorScore || '95/100'}

Generate exactly 4 structured, actionable UI personalization recommendations.
You MUST return a JSON object strictly matching this schema:
{
  "persona": "${userProfile.personaName || 'Custom Assist Persona'}",
  "recommendations": [
    { "type": "visual", "instruction": "string" },
    { "type": "reading", "instruction": "string" },
    { "type": "content", "instruction": "string" },
    { "type": "interaction", "instruction": "string" }
  ]
}`;

  let recommendations = getFallbackRecommendations();

  if (geminiKey && geminiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (validatePersonalizationPayload(parsed)) {
            recommendations = parsed.recommendations;
          }
        }
      }
    } catch (e) {
      console.warn("[AdaptAI Service Worker] Gemini recommendation call failed, using fallback:", e.message);
    }
  }

  // Update profile with cached recommendations
  userProfile.personalizationRecommendations = recommendations;
  userProfile.lastUpdated = new Date().toISOString();

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ userProfile: userProfile });
  }

  return recommendations;
}



// 5. Chrome Storage Change Listener (Cross-Tab Synchronization)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab && tab.id) {
          if (changes.extensionEnabled) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "extension_state_changed", 
              enabled: changes.extensionEnabled.newValue !== false 
            }, () => { if (chrome.runtime.lastError) {} });
          }
          if (changes.extensionTheme) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "extension_theme_changed", 
              theme: changes.extensionTheme.newValue || 'dark' 
            }, () => { if (chrome.runtime.lastError) {} });
          }
        }
      });
    });
  }
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
 * Constructs dynamic system prompt and payload for Gemini API
 */
function buildSystemPrompt(userProfile, scrapedPageText) {
  const visual = userProfile?.visual || {};
  const cognitive = userProfile?.cognitive || {};

  const systemInstruction = `You are AdaptAI, an intelligent real-time web accessibility and text restructuring engine.
Analyze the user's accessibility profile and the provided webpage text content.

User Persona: ${userProfile?.personaName || 'Accessibility User'}
Preferences:
- High Contrast Theme Required: ${visual.highContrast ? 'YES' : 'NO'}
- Font Scale Required: ${visual.fontScale || 1.0}x
- Dyslexia-Friendly Font Required: ${cognitive.dyslexicFont ? 'YES' : 'NO'}
- AI Text Restructuring Required: ${cognitive.simplifyText ? 'YES' : 'NO'}

CRITICAL INSTRUCTIONS:
1. CSS Variable Overrides:
   - If High Contrast is YES: set "--adapt-bg-color": "#09090b", "--adapt-text-color": "#f4f4f5", "--adapt-font-scale": "${visual.fontScale || 1.4}".
   - Else: set "--adapt-bg-color": "#09090b", "--adapt-text-color": "#f4f4f5", "--adapt-font-scale": "${visual.fontScale || 1.0}".
2. Text Restructuring (Keep SAME text/facts, restructured for plain-language legibility):
   - If Text Restructuring is YES: Take each original paragraph from the webpage content and RESTRUCTURE the text in-place.
     * Keep the EXACT same facts, entities, numbers, names, and information from the original text.
     * Do NOT write high-level summaries or meta-labels (NEVER prepend with "Summary:", "Simplified Summary:", etc.).
     * Restructure long, convoluted, passive sentences into clear, direct, readable sentences using plain language.
     * Return an array of strings in "simplifiedText", where each string directly corresponds to the restructured version of each input paragraph.
   - If NO: return an empty array [] for "simplifiedText".
3. Voice Intent:
   - Determine if navigation intent (e.g. "scroll_down") is requested or set to null.

You MUST respond strictly using the required JSON schema without markdown formatting.`;

  const userContent = `Webpage Content Scraped From DOM:\n${scrapedPageText}`;

  return { systemInstruction, userContent };
}




// -------------------------------------------------------------
// SUB-TASK B3: GEMINI API INTEGRATION & STRUCTURED OUTPUTS
// -------------------------------------------------------------

// Fallback JSON in case of API error, offline status, or missing key
const mockGeminiFallback = {
  cssUpdates: {
    "--adapt-font-scale": "1.4",
    "--adapt-bg-color": "#09090b",
    "--adapt-text-color": "#f4f4f5",
    "--adapt-line-height": "1.6"
  },
  simplifiedText: [],
  dyslexicFont: false,
  motorAssist: false,
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
async function callGeminiApi(systemInstruction, userContent, apiKey) {
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("No valid Gemini API Key provided.");
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }


  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty candidate payload from Gemini API.");

  const parsedJson = JSON.parse(rawText);
  console.log("[AdaptAI Gemini API] Successfully generated Structured JSON:", parsedJson);
  return parsedJson;
}

/**
 * Invokes Groq API via native fetch() as a Fallback
 */
async function callGroqAPI(systemInstruction, userContent, apiKey) {
  if (!apiKey || apiKey === "YOUR_GROQ_API_KEY") {
    throw new Error("No valid Groq API Key provided.");
  }

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  
  // Groq requires JSON structure defined in prompt when using json_object response format
  const groqSystemInstruction = systemInstruction + `\n\nYou MUST return a valid JSON object with EXACTLY this structure:
{
  "cssUpdates": {
    "--adapt-font-scale": "string",
    "--adapt-bg-color": "string",
    "--adapt-text-color": "string"
  },
  "simplifiedText": ["string", "string"],
  "dyslexicFont": true,
  "motorAssist": true,
  "voiceIntent": null
}`;

  const requestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: groqSystemInstruction },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" }
  };


  const response = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.choices[0].message.content;
  return JSON.parse(textResponse);
}

/**
 * Master processing pipeline orchestrating storage, Gemini invocation, and tab response
 */
async function handleAiProcessRequest(pageText, tabId) {
  console.log(`[AdaptAI Processing Pipeline] Starting process for Tab ID: ${tabId}`);
  
  // 1. Retrieve User Accessibility Profile
  const profile = await getUserProfileFromStorage();

  // 2. Engineer Gemini System Prompt
  const { systemInstruction, userContent } = buildSystemPrompt(profile, pageText);


  // Get keys from env.js
  const geminiKey = self.ENV?.GEMINI_API_KEY;
  const groqKey = self.ENV?.GROQ_API_KEY;
  
  let transformationData = mockGeminiFallback;

  // 3. Invoke API Pipeline with Groq Fallback
  try {
    console.log("Attempting Gemini API...");
    transformationData = await callGeminiApi(systemInstruction, userContent, geminiKey);
  } catch (geminiError) {
    console.warn("Gemini API failed:", geminiError.message, "- Falling back to Groq...");
    try {
      console.log("Attempting Groq API Fallback...");
      transformationData = await callGroqAPI(systemInstruction, userContent, groqKey);
    } catch (groqError) {
      console.error("Groq API Fallback failed:", groqError.message);
      console.warn("[AdaptAI Processing Pipeline] Both APIs failed. Using fallback mock JSON.");
    }
  }

  // 4. Override transformation output with exact user profile persona settings
  const visual = profile.visual || {};
  const cognitive = profile.cognitive || {};
  const motor = profile.motor || {};

  if (!transformationData.cssUpdates) transformationData.cssUpdates = {};

  if (visual.highContrast) {
    transformationData.cssUpdates["--adapt-bg-color"] = "#09090b";
    transformationData.cssUpdates["--adapt-text-color"] = "#f4f4f5";
  } else {
    transformationData.cssUpdates["--adapt-bg-color"] = transformationData.cssUpdates["--adapt-bg-color"] || "#09090b";
    transformationData.cssUpdates["--adapt-text-color"] = transformationData.cssUpdates["--adapt-text-color"] || "#f4f4f5";
  }

  if (visual.fontScale && visual.fontScale > 1.0) {
    transformationData.cssUpdates["--adapt-font-scale"] = String(visual.fontScale);
  }

  if (visual.lineHeight) {
    transformationData.cssUpdates["--adapt-line-height"] = String(visual.lineHeight);
  }

  transformationData.dyslexicFont = Boolean(cognitive.dyslexicFont);
  transformationData.motorAssist = Boolean(motor.targetExpansion);

  // If cognitive text restructuring was not requested, keep original text
  if (!cognitive.simplifyText) {
    transformationData.simplifiedText = [];
  } else if (!Array.isArray(transformationData.simplifiedText) || transformationData.simplifiedText.length === 0) {
    // If AI was offline or returned empty, restructure the actual scraped paragraphs locally without dummy text
    try {
      const parsed = typeof pageText === 'string' ? JSON.parse(pageText) : null;
      if (parsed && Array.isArray(parsed.paragraphs) && parsed.paragraphs.length > 0) {
        transformationData.simplifiedText = parsed.paragraphs.map(p => {
          return p
            .replace(/;\s+/g, '. ')
            .replace(/,\s+which\s+/gi, '. This ')
            .replace(/,\s+and\s+furthermore\s+/gi, '. Also, ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        });
      }
    } catch (e) {
      transformationData.simplifiedText = [];
    }
  }

  console.log("[AdaptAI Pipeline] Final Profile-Enforced Payload:", transformationData);

  // 5. Dispatch result back to Content Script
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
  const { systemInstruction, userContent } = buildSystemPrompt(profile, sampleScrapedText);
  assert(systemInstruction.includes("AdaptAI"), "System prompt includes core instruction persona");
  assert(userContent.includes(sampleScrapedText), "User content prompt includes scraped page text");

  // 3. Fallback Execution Test
  const fallbackResult = await handleAiProcessRequest(sampleScrapedText, null);
  assert(fallbackResult.cssUpdates !== undefined, "Pipeline returns valid cssUpdates object");
  assert(Array.isArray(fallbackResult.simplifiedText), "Pipeline returns valid simplifiedText array");

  console.log(`\n📊 Track B Test Results: ${passed}/${total} assertions passed.`);
  console.groupEnd();
  return passed === total;
}

// Export for module/global test runners
if (typeof self !== 'undefined') {
  self.runTrackBTests = runTrackBTests;
}
