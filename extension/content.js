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
let activeSimplifiedText = [];

function injectFloatingToolbar() {
  if (document.getElementById('adaptai-toolbar')) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'adaptai-toolbar';
  toolbar.className = 'adaptai-floating-panel';
  toolbar.innerHTML = `
    <button id="adaptai-read-aloud" title="Read Aloud (Text-to-Speech)">🔊</button>
    <button id="adaptai-voice-cmd" title="Voice Command Listener">🎤</button>
  `;
  document.body.appendChild(toolbar);

  document.getElementById('adaptai-read-aloud').addEventListener('click', handleReadAloud);
  document.getElementById('adaptai-voice-cmd').addEventListener('click', handleVoiceCommand);
}

function handleReadAloud() {
  if (!('speechSynthesis' in window)) {
    alert("Web Speech API is not supported in this browser environment.");
    return;
  }

  const readBtn = document.getElementById('adaptai-read-aloud');

  // Toggle stop speaking if currently speaking
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (readBtn) readBtn.innerText = '🔊';
    console.log("[AdaptAI TTS] Speech canceled by user.");
    return;
  }

  // Determine text content to read: simplified text if available, else first page paragraphs
  const textToRead = activeSimplifiedText.length > 0 
    ? activeSimplifiedText.join('. ')
    : mockGeminiResponse.simplifiedText.join('. ');

  if (!textToRead) {
    console.warn("[AdaptAI TTS] No readable text found.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (readBtn) readBtn.innerText = '⏹️';
    console.log("[AdaptAI TTS] Speech started.");
  };

  utterance.onend = () => {
    if (readBtn) readBtn.innerText = '🔊';
    console.log("[AdaptAI TTS] Speech completed.");
  };

  utterance.onerror = (e) => {
    if (readBtn) readBtn.innerText = '🔊';
    console.error("[AdaptAI TTS Error]", e);
  };

  window.speechSynthesis.speak(utterance);
}

function handleVoiceCommand() {
  console.log("[AdaptAI Voice Command] Speech Recognition listener placeholder triggered.");
  const btn = document.getElementById('adaptai-voice-cmd');
  if (btn) {
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 300);
  }
}


// -------------------------------------------------------------
// SUB-TASK A4: COMPLETE DOM TRANSFORMATION & INTENT ENGINE
// -------------------------------------------------------------

/**
 * Injects or removes Dyslexic font face into document head
 */
function ensureDyslexicFont(enable) {
  let styleEl = document.getElementById('adaptai-dyslexic-style');
  if (enable) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'adaptai-dyslexic-style';
      styleEl.textContent = `
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic-regular.webfont.woff') format('woff');
        }
      `;
      document.head.appendChild(styleEl);
    }
    document.documentElement.style.setProperty('--adapt-font-family', "'OpenDyslexic', sans-serif");
  } else {
    document.documentElement.style.removeProperty('--adapt-font-family');
  }
}

/**
 * Applies CSS variables to document root
 */
function applyCssTransformations(cssUpdates) {
  if (!cssUpdates) return;
  const root = document.documentElement;
  Object.entries(cssUpdates).forEach(([varName, val]) => {
    root.style.setProperty(varName, val);
  });
}

/**
 * Toggles motor accessibility target expansion
 */
function applyMotorAssist(enable) {
  if (enable) {
    document.body.classList.add('adapt-motor-assist');
  } else {
    document.body.classList.remove('adapt-motor-assist');
  }
}

/**
 * Swaps original paragraph innerText with simplified AI texts
 */
function applyTextSimplification(simplifiedTextArray) {
  if (!Array.isArray(simplifiedTextArray) || simplifiedTextArray.length === 0) return;
  
  // Store active simplified text for Web Speech TTS engine
  activeSimplifiedText = simplifiedTextArray;

  const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => !p.closest('#adaptai-toolbar'));
  paragraphs.forEach((p, idx) => {
    if (simplifiedTextArray[idx]) {
      p.innerText = simplifiedTextArray[idx];
      p.style.transition = 'all 0.3s ease';
    }
  });
}

/**
 * Executes navigation / scrolling voice intents
 */
function executeVoiceIntent(intent) {
  if (!intent) return;
  console.log(`[AdaptAI Voice Intent Execution] Executing intent: ${intent}`);
  
  switch (intent.toLowerCase()) {
    case 'scroll_down':
      window.scrollBy({ top: 500, behavior: 'smooth' });
      break;
    case 'scroll_up':
      window.scrollBy({ top: -500, behavior: 'smooth' });
      break;
    case 'scroll_top':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    case 'scroll_bottom':
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      break;
    case 'read_page':
      handleReadAloud();
      break;
    default:
      console.warn(`[AdaptAI Voice Intent] Unrecognized intent: ${intent}`);
  }
}

/**
 * Master transformation pipeline entrypoint
 */
function runFullTransformation(payload) {
  console.log("[AdaptAI] Applying full transformations payload:", payload);

  // 1. Apply CSS variable overrides
  if (payload.cssUpdates) {
    applyCssTransformations(payload.cssUpdates);
  }

  // 2. Enable Dyslexic font if requested
  if (payload.dyslexicFont) {
    ensureDyslexicFont(true);
  }

  // 3. Enable motor assistance if requested
  if (payload.motorAssist) {
    applyMotorAssist(true);
  }

  // 4. Swap paragraph inner text
  if (payload.simplifiedText) {
    applyTextSimplification(payload.simplifiedText);
  }

  // 5. Execute voice intent if returned
  if (payload.voiceIntent) {
    executeVoiceIntent(payload.voiceIntent);
  }
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
    runFullTransformation(payload);
  }
});

// Auto-inject UI toolbar on load
injectFloatingToolbar();

// -------------------------------------------------------------
// TRACK A AUTOMATED SUITE (Run window.__runTrackATests() in console)
// -------------------------------------------------------------
window.__runTrackATests = function() {
  console.group("🧪 [AdaptAI Track A Validation Suite]");
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

  // 1. Scraper Test
  const scraped = scrapePageDOM();
  assert(typeof scraped === 'string' && scraped.length > 0, "Scraper extracts non-empty string payload");
  assert(scraped.length <= 2005, "Scraper payload does not exceed character cap ceiling");

  // 2. Toolbar Injection Test
  const toolbar = document.getElementById('adaptai-toolbar');
  assert(toolbar !== null, "Floating toolbar element #adaptai-toolbar is injected");
  assert(document.getElementById('adaptai-read-aloud') !== null, "Read Aloud button is rendered");
  assert(document.getElementById('adaptai-voice-cmd') !== null, "Voice Command button is rendered");

  // 3. CSS Variable Override Test
  applyCssTransformations({ "--adapt-bg-color": "#000000", "--adapt-font-scale": "1.4" });
  assert(document.documentElement.style.getPropertyValue("--adapt-bg-color") === "#000000", "CSS variable --adapt-bg-color injected correctly");
  assert(document.documentElement.style.getPropertyValue("--adapt-font-scale") === "1.4", "CSS variable --adapt-font-scale injected correctly");

  // 4. Dyslexic Font Injection Test
  ensureDyslexicFont(true);
  assert(document.getElementById('adaptai-dyslexic-style') !== null, "Dyslexic font style element injected into document head");
  assert(document.documentElement.style.getPropertyValue('--adapt-font-family') === "'OpenDyslexic', sans-serif", "Dyslexic font family variable set");

  // 5. Motor Assist Toggle Test
  applyMotorAssist(true);
  assert(document.body.classList.contains('adapt-motor-assist'), "Motor assist class added to body tag");

  // 6. Text Simplification Test
  applyTextSimplification(["Test simplified paragraph text."]);
  const firstP = document.querySelector('p:not(#adaptai-toolbar p)');
  assert(firstP && firstP.innerText === "Test simplified paragraph text.", "First paragraph text swapped with simplified string");

  console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.`);
  console.groupEnd();
  return passed === total;
};



