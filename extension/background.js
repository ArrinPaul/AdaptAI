// background.js - Person B's Domain (API & Logic)

importScripts('env.js');

// MOCK DATA FOR PARALLEL DEVELOPMENT
// Person B: Use this to test your Gemini API calls without waiting for Person A
const mockScrapedText = "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.";
const mockUserProfile = { 
  visual: { highContrast: true, fontScale: 1.5 },
  cognitive: { simplifyText: true }
};

// 1. Open onboarding page on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'onboarding/onboarding.html' });
  }
});

// 2. Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Tell content script to scrape the page
  chrome.tabs.sendMessage(tab.id, { action: "scrape_page" });
});

// 3. Listen for the scraped text from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "process_with_ai") {
    console.log("Received scraped text from content.js:", request.pageText);
    handleAiProcessing(request.pageText, sender.tab.id);
  }
});

const mockGeminiResponse = {
  cssUpdates: {
    "--adapt-font-scale": "1.5",
    "--adapt-bg-color": "#121212",
    "--adapt-text-color": "#e0e0e0"
  },
  simplifiedText: [
    "This is fake simplified text for paragraph 1.",
    "This is fake simplified text for paragraph 2."
  ]
};

async function callGeminiAPI(apiKey, profile, pageText) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are an AI accessibility assistant. Adapt the following webpage text based on the user's profile.
User Profile: ${JSON.stringify(profile)}

Your job is to provide CSS updates for visual adaptations (like font scaling and high contrast) and an array of simplified text strings for the paragraphs on the page.

If highContrast is true in the profile, use high contrast colors (e.g., #121212 for background and #e0e0e0 for text). Otherwise, leave them empty or use standard colors.
If fontScale is provided, apply it to --adapt-font-scale.
Simplify the text based on cognitive needs. Return one simplified string for each logical paragraph in the text.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: `Page Text to adapt:\n\n${pageText}` }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          cssUpdates: {
            type: "OBJECT",
            properties: {
              "--adapt-font-scale": { type: "STRING" },
              "--adapt-bg-color": { type: "STRING" },
              "--adapt-text-color": { type: "STRING" }
            }
          },
          simplifiedText: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "An array of simplified text strings, one for each input paragraph."
          }
        },
        required: ["cssUpdates", "simplifiedText"]
      }
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse);
}

async function callGroqAPI(apiKey, profile, pageText) {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  
  const systemInstruction = `You are an AI accessibility assistant. Adapt the webpage text based on the user's profile.
User Profile: ${JSON.stringify(profile)}

Your job is to provide CSS updates for visual adaptations and an array of simplified text strings for the paragraphs.
You MUST return a valid JSON object with EXACTLY this structure:
{
  "cssUpdates": {
    "--adapt-font-scale": "string",
    "--adapt-bg-color": "string",
    "--adapt-text-color": "string"
  },
  "simplifiedText": ["string", "string"]
}

If highContrast is true in the profile, use high contrast colors (#121212 for background, #e0e0e0 for text).
If fontScale is provided, apply it to --adapt-font-scale.
Simplify the text based on cognitive needs. Return one simplified string for each logical paragraph.`;

  const requestBody = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: `Page Text to adapt:\n\n${pageText}` }
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

async function handleAiProcessing(pageText, tabId) {
  try {
    // 1. Get user profile
    const data = await chrome.storage.local.get(['userProfile']);
    const profile = data.userProfile || mockUserProfile;
    
    // Get keys from env.js
    const geminiKey = self.ENV?.GEMINI_API_KEY;
    const groqKey = self.ENV?.GROQ_API_KEY;
    
    if (!geminiKey && !groqKey) {
      console.warn("No API keys found in env.js. Fallback to mock data.");
      chrome.tabs.sendMessage(tabId, { action: "apply_transformations", data: mockGeminiResponse });
      return;
    }

    let resultJson = null;

    try {
      if (!geminiKey || geminiKey === "YOUR_GEMINI_API_KEY") throw new Error("Gemini Key Missing or Invalid");
      console.log("Attempting Gemini API...");
      resultJson = await callGeminiAPI(geminiKey, profile, pageText);
    } catch (geminiError) {
      console.warn("Gemini API failed:", geminiError.message, "Falling back to Groq...");
      
      try {
        if (!groqKey || groqKey === "YOUR_GROQ_API_KEY") throw new Error("Groq Key Missing or Invalid");
        console.log("Attempting Groq API Fallback...");
        resultJson = await callGroqAPI(groqKey, profile, pageText);
      } catch (groqError) {
        console.error("Groq API Fallback failed:", groqError.message);
        throw new Error("Both Gemini and Groq APIs failed.");
      }
    }

    console.log("AI Response:", resultJson);
    
    // Merge static profile flags so Person A's content.js can toggle them
    if (resultJson) {
      resultJson.dyslexicFont = profile.cognitive?.dyslexicFont;
      // If there's a motor profile, pass it along. Otherwise default to audio enabled flag for motor assist
      resultJson.motorAssist = profile.audio?.enabled; 
    }

    chrome.tabs.sendMessage(tabId, { action: "apply_transformations", data: resultJson });

  } catch (error) {
    console.error("Error processing with AI:", error);
    // Send mock data on error so Person A isn't blocked
    chrome.tabs.sendMessage(tabId, { action: "apply_transformations", data: mockGeminiResponse });
  }
}
