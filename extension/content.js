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
  // TODO: Extract text from h1, h2, h3 and p elements
  const headingsAndParagraphs = Array.from(document.querySelectorAll('h1, h2, h3, p'));
  const scrapedText = headingsAndParagraphs
    .map(el => el.innerText.trim())
    .filter(text => text.length > 0)
    .join('\n')
    .slice(0, 2000); // cap to keep payload fast

  return scrapedText || "Fallback: Sample scraped text from DOM.";
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

