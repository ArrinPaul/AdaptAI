// content.js - Track A Implementation Skeleton

// -------------------------------------------------------------
// MOCK RESPONSE FOR TRACK A PARALLEL TESTING
// -------------------------------------------------------------
const mockGeminiResponse = {
  cssUpdates: {
    "--adapt-font-scale": "1.5",
    "--adapt-bg-color": "#121212",
    "--adapt-text-color": "#FFFF00",
    "--adapt-line-height": "1.6"
  },
  simplifiedText: [
    "Simplified Summary 1: This is a placeholder for paragraph simplification.",
    "Simplified Summary 2: AI simplifies complex web content for easy reading."
  ],
  voiceIntent: null
};

// -------------------------------------------------------------
// SUB-TASK A2: DOM SCRAPER ENGINE
// -------------------------------------------------------------
function scrapePageDOM() {
  try {
    // Target main content tags: h1, h2, h3, article, section, p
    const selectors = 'h1, h2, h3, p, article p, main p';
    const elements = Array.from(document.querySelectorAll(selectors));

    // Filter out hidden, script/style, or toolbar elements
    const validTexts = elements
      .filter(el => {
        // Exclude AdaptAI toolbar elements
        if (el.closest('#adaptai-toolbar')) return false;
        // Check visibility
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.innerText.trim().length > 0;
      })
      .map(el => el.innerText.trim());

    // Remove duplicates while maintaining document order
    const uniqueTexts = Array.from(new Set(validTexts));
    
    // Join and cap to 2000 characters maximum for fast LLM processing
    const fullScrapedText = uniqueTexts.join('\n\n');
    const cappedText = fullScrapedText.length > 2000 
      ? fullScrapedText.slice(0, 2000) + '...' 
      : fullScrapedText;

    console.log(`[AdaptAI Scraper] Scraped ${uniqueTexts.length} elements (${cappedText.length} chars).`);
    return cappedText || "Fallback: Page contains no readable paragraph or heading content.";
  } catch (err) {
    console.error("[AdaptAI Scraper Error]", err);
    return "Fallback: Exception occurred while scraping DOM content.";
  }
}


// -------------------------------------------------------------
// SUB-TASK A3: ACCESSIBILITY TOOLBAR & SPEECH SYNTHESIS
// -------------------------------------------------------------
function injectFloatingToolbar() {
  if (document.getElementById('adaptai-toolbar')) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'adaptai-toolbar';
  toolbar.className = 'adaptai-floating-panel';
  toolbar.innerHTML = `
    <button id="adaptai-read-aloud" title="Read Aloud">🔊</button>
    <button id="adaptai-voice-cmd" title="Voice Command">🎤</button>
  `;
  document.body.appendChild(toolbar);

  document.getElementById('adaptai-read-aloud').addEventListener('click', handleReadAloud);
  document.getElementById('adaptai-voice-cmd').addEventListener('click', handleVoiceCommand);
}

function handleReadAloud() {
  // SpeechSynthesis Web API integration
  const firstSimplifiedPara = mockGeminiResponse.simplifiedText.join(' ');
  const utterance = new SpeechSynthesisUtterance(firstSimplifiedPara);
  window.speechSynthesis.speak(utterance);
}

function handleVoiceCommand() {
  console.log("Voice Command Listener Triggered");
}

// -------------------------------------------------------------
// SUB-TASK A4: DOM TRANSFORMATION ENGINE
// -------------------------------------------------------------
function applyCssTransformations(cssUpdates) {
  if (!cssUpdates) return;
  const root = document.documentElement;
  Object.entries(cssUpdates).forEach(([varName, val]) => {
    root.style.setProperty(varName, val);
  });
}

function applyTextSimplification(simplifiedTextArray) {
  if (!Array.isArray(simplifiedTextArray) || simplifiedTextArray.length === 0) return;
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach((p, idx) => {
    if (simplifiedTextArray[idx]) {
      p.innerText = simplifiedTextArray[idx];
    }
  });
}

// -------------------------------------------------------------
// MESSAGE LISTENER & RUNTIME HANDLERS
// -------------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape_page") {
    const pageText = scrapePageDOM();
    chrome.runtime.sendMessage({ 
      action: "process_with_ai", 
      pageText: pageText 
    });
  }

  if (request.action === "apply_transformations") {
    const payload = request.data || mockGeminiResponse;
    applyCssTransformations(payload.cssUpdates);
    applyTextSimplification(payload.simplifiedText);
  }
});

// Auto-inject UI toolbar on load
injectFloatingToolbar();

