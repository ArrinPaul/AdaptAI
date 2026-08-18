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
// SUB-TASK A3: ISOLATED SHADOW DOM FLOATING WIDGET (TTS & THEME CONTROL)
// -------------------------------------------------------------
let activeSimplifiedText = [];
let currentSpeechUtterance = null;
let currentSpeechState = 'idle'; // 'idle' | 'speaking' | 'paused'
let extensionThemeState = 'dark';


/**
 * Injects or updates isolated Shadow DOM floating widget
 */
function injectFloatingToolbar() {
  // Check if extension is globally enabled before mounting
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['extensionEnabled', 'extensionTheme'], (res) => {
      if (res.extensionEnabled === false) {
        removeFloatingToolbar();
        return;
      }
      if (res.extensionTheme) extensionThemeState = res.extensionTheme;
      mountShadowWidget();
    });
  } else {
    mountShadowWidget();
  }
}

function removeFloatingToolbar() {
  const shadowHost = document.getElementById('adaptai-widget-host');
  if (shadowHost) shadowHost.remove();
  const legacyBar = document.getElementById('adaptai-toolbar');
  if (legacyBar) legacyBar.remove();

  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function mountShadowWidget() {
  let shadowHost = document.getElementById('adaptai-widget-host');
  if (shadowHost) return;

  shadowHost = document.createElement('div');
  shadowHost.id = 'adaptai-widget-host';
  shadowHost.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;';
  
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    .widget-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${extensionThemeState === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.92)'};
      color: ${extensionThemeState === 'light' ? '#0f172a' : '#f8fafc'};
      border: 1px solid ${extensionThemeState === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.15)'};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 30px;
      padding: 8px 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
    }
    .widget-btn {
      background: ${extensionThemeState === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'};
      border: 1px solid ${extensionThemeState === 'light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)'};
      color: ${extensionThemeState === 'light' ? '#0f172a' : '#ffffff'};
      font-size: 16px;
      cursor: pointer;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .widget-btn:hover {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
      transform: scale(1.08);
    }
  `;

  const container = document.createElement('div');
  container.className = 'widget-container';
  container.innerHTML = `
    <button id="tts-btn" class="widget-btn" title="Text to Speech (Read Selected Text / Page)">Audio</button>
    <button id="theme-btn" class="widget-btn" title="Toggle Extension Theme (Light / Dark)">Theme</button>
    <button id="assistant-btn" class="widget-btn" title="Toggle AI Assistant Overlay (Ctrl+Shift+U)">AI</button>
  `;

  shadowRoot.appendChild(styleEl);
  shadowRoot.appendChild(container);
  document.body.appendChild(shadowHost);

  // Widget event listeners
  const ttsBtn = shadowRoot.getElementById('tts-btn');
  const themeBtn = shadowRoot.getElementById('theme-btn');
  const assistantBtn = shadowRoot.getElementById('assistant-btn');

  if (ttsBtn) ttsBtn.addEventListener('click', handleReadAloud);
  if (themeBtn) themeBtn.addEventListener('click', toggleExtensionTheme);
  if (assistantBtn) assistantBtn.addEventListener('click', toggleAiAssistant);
}


/**
 * Text-to-Speech Engine with priority queuing: Selected Text -> AI Simplified Text -> DOM Headings
 */
function handleReadAloud() {
  if (!('speechSynthesis' in window)) {
    alert("Web Speech API is not supported in this browser.");
    return;
  }

  // Toggle Pause/Resume/Stop if currently active
  if (window.speechSynthesis.speaking) {
    if (currentSpeechState === 'speaking') {
      window.speechSynthesis.pause();
      currentSpeechState = 'paused';
      updateTtsBtnIcon('Resume');
      console.log("[AdaptAI TTS] Speech paused.");
      return;
    } else if (currentSpeechState === 'paused') {
      window.speechSynthesis.resume();
      currentSpeechState = 'speaking';
      updateTtsBtnIcon('Pause');
      console.log("[AdaptAI TTS] Speech resumed.");
      return;
    }
  }

  window.speechSynthesis.cancel();

  // Priority 1: User highlighted selected text on page
  const selectedText = window.getSelection().toString().trim();
  let textToRead = selectedText;

  // Priority 2: AI simplified paragraphs
  if (!textToRead && activeSimplifiedText.length > 0) {
    textToRead = activeSimplifiedText.join('. ');
  }

  // Priority 3: Scraped DOM page headings & text
  if (!textToRead) {
    textToRead = scrapePageDOM();
  }

  if (!textToRead || textToRead.length === 0) {
    console.warn("[AdaptAI TTS] No readable text found.");
    return;
  }

  currentSpeechUtterance = new SpeechSynthesisUtterance(textToRead);
  currentSpeechUtterance.rate = 1.0;
  currentSpeechUtterance.pitch = 1.0;

  currentSpeechUtterance.onstart = () => {
    currentSpeechState = 'speaking';
    updateTtsBtnIcon('Pause');
    console.log("[AdaptAI TTS] Reading aloud started.");
  };

  currentSpeechUtterance.onend = () => {
    currentSpeechState = 'idle';
    updateTtsBtnIcon('Audio');
    console.log("[AdaptAI TTS] Reading aloud completed.");
  };

  currentSpeechUtterance.onerror = (e) => {
    currentSpeechState = 'idle';
    updateTtsBtnIcon('Audio');
    console.error("[AdaptAI TTS Error]", e);
  };

  window.speechSynthesis.speak(currentSpeechUtterance);
}

function updateTtsBtnIcon(iconText) {
  const shadowHost = document.getElementById('adaptai-widget-host');
  if (!shadowHost || !shadowHost.shadowRoot) return;
  const ttsBtn = shadowHost.shadowRoot.getElementById('tts-btn');
  if (ttsBtn) ttsBtn.innerText = iconText;
}

/**
 * Toggles Extension Light / Dark Mode without modifying host website colors
 */
function toggleExtensionTheme() {
  extensionThemeState = extensionThemeState === 'light' ? 'dark' : 'light';
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ extensionTheme: extensionThemeState }, () => {
      console.log("[AdaptAI Theme] Extension theme saved:", extensionThemeState);
    });
  }

  // Re-mount widget with new theme styles
  removeFloatingToolbar();
  mountShadowWidget();
}

function handleVoiceCommand() {
  toggleAiAssistant();
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
// FLOATING AI ASSISTANT OVERLAY PANEL (CHROME & SAFARI ADAPTER)
// -------------------------------------------------------------
function injectAiAssistantPanel() {
  if (document.getElementById('adaptai-assistant-overlay')) return;

  const panel = document.createElement('div');
  panel.id = 'adaptai-assistant-overlay';
  panel.className = 'adaptai-assistant-container';
  panel.style.display = 'none';

  panel.innerHTML = `
    <div class="assistant-header">
      <div class="assistant-title">
        <span class="logo-spark">⚡</span> AdaptAI Floating Assistant
      </div>
      <button class="assistant-close-btn" id="adaptai-assistant-close" title="Close (Esc)">✕</button>
    </div>

    <div class="assistant-body" id="adaptai-assistant-body">
      <div class="assistant-welcome">
        <p class="welcome-heading">Hello! How can I assist you on this page?</p>
        <p class="welcome-sub">Context & Persona aware assistant for accessibility and reading ease.</p>
      </div>

      <div class="suggested-chips" id="adaptai-suggested-chips">
        <button class="chip-btn" data-query="Summarize this page content briefly.">📄 Summarize Page</button>
        <button class="chip-btn" data-query="Explain complex concepts on this page simply.">🧠 Explain This</button>
        <button class="chip-btn" data-query="Highlight key action items or decisions.">🎯 Key Takeaways</button>
      </div>

      <div id="adaptai-chat-history" class="chat-history"></div>
    </div>

    <div class="assistant-footer">
      <div id="adaptai-context-indicator" class="context-indicator" style="display:none;">
        <span class="context-icon">📌</span> Selected Text Context Attached
      </div>
      <div class="input-row">
        <textarea id="adaptai-assistant-input" rows="1" placeholder="Ask anything about this page... (Enter to send, Shift+Enter for new line)"></textarea>
        <button id="adaptai-assistant-send" class="send-btn">➤</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Close event listener
  const closeBtn = document.getElementById('adaptai-assistant-close');
  if (closeBtn) closeBtn.addEventListener('click', toggleAiAssistant);

  // Suggested chip listeners
  const chips = document.querySelectorAll('#adaptai-suggested-chips .chip-btn');
  if (chips) {
    chips.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const promptText = e.target.getAttribute('data-query');
        submitAssistantQuery(promptText);
      });
    });
  }

  // Input keyboard navigation
  const inputEl = document.getElementById('adaptai-assistant-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitAssistantQuery(inputEl.value);
      }
    });
  }

  const sendBtn = document.getElementById('adaptai-assistant-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const inputVal = inputEl ? inputEl.value : '';
      submitAssistantQuery(inputVal);
    });
  }
}


/**
 * Toggles Assistant Overlay Display & Automatically Focuses Input
 */
function toggleAiAssistant() {
  injectAiAssistantPanel();
  const panel = document.getElementById('adaptai-assistant-overlay');
  if (!panel) return;

  const isHidden = panel.style.display === 'none';
  if (isHidden) {
    panel.style.display = 'flex';
    panel.classList.add('active');

    // Check for user-selected text on page
    const selectedText = window.getSelection().toString().trim();
    const contextIndicator = document.getElementById('adaptai-context-indicator');
    if (selectedText.length > 0) {
      if (contextIndicator) {
        contextIndicator.style.display = 'block';
        contextIndicator.innerText = `📌 Context: "${selectedText.slice(0, 40)}..."`;
      }
      window.__adaptAiSelectedText = selectedText;
    } else {
      if (contextIndicator) contextIndicator.style.display = 'none';
      window.__adaptAiSelectedText = null;
    }

    // Auto-focus input
    setTimeout(() => {
      const inputEl = document.getElementById('adaptai-assistant-input');
      if (inputEl) inputEl.focus();
    }, 100);
  } else {
    panel.style.display = 'none';
    panel.classList.remove('active');
  }
}

/**
 * Dispatches Assistant Prompt to Background Service Worker
 */
function submitAssistantQuery(userQuery) {
  if (!userQuery || userQuery.trim().length === 0) return;
  
  const historyEl = document.getElementById('adaptai-chat-history');
  const inputEl = document.getElementById('adaptai-assistant-input');
  
  // Render User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'chat-msg user-msg';
  userMsgEl.innerText = userQuery;
  historyEl.appendChild(userMsgEl);

  inputEl.value = '';

  // Render Thinking State
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'chat-msg ai-msg thinking';
  thinkingEl.innerText = 'AI is analyzing page context... ● ● ●';
  historyEl.appendChild(thinkingEl);

  historyEl.scrollTop = historyEl.scrollHeight;

  // Send request to background pipeline
  const pageText = scrapePageDOM();
  const selectedText = window.__adaptAiSelectedText || '';

  chrome.runtime.sendMessage({
    action: "process_with_ai",
    pageText: `User Query: ${userQuery}\nSelected Context: ${selectedText}\nPage Text: ${pageText}`
  });

  // Listen for single-shot response
  const responseHandler = (request) => {
    if (request.action === 'apply_transformations') {
      thinkingEl.className = 'chat-msg ai-msg';
      const summaryText = request.data?.simplifiedText?.[0] || "I have analyzed the page content and applied visual typography adaptations.";
      thinkingEl.innerText = `⚡ ${summaryText}`;
      historyEl.scrollTop = historyEl.scrollHeight;
      chrome.runtime.onMessage.removeListener(responseHandler);
    }
  };
  chrome.runtime.onMessage.addListener(responseHandler);
}

// Global Keyboard Shortcut Listener for Chrome & Safari (Ctrl+Shift+U / Ctrl+Shift+Y / Esc)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'U' || e.key === 'u' || e.key === 'Y' || e.key === 'y')) {
    e.preventDefault();
    toggleAiAssistant();
  }
  if (e.key === 'Escape') {
    const panel = document.getElementById('adaptai-assistant-overlay');
    if (panel && panel.style.display !== 'none') {
      toggleAiAssistant();
    }
  }
});


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

  if (request.action === "toggle_assistant") {
    toggleAiAssistant();
  }

  if (request.action === "extension_state_changed") {
    if (request.enabled) {
      injectFloatingToolbar();
    } else {
      removeFloatingToolbar();
    }
  }

  if (request.action === "extension_theme_changed") {
    extensionThemeState = request.theme || 'dark';
    removeFloatingToolbar();
    mountShadowWidget();
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

  // 2. Shadow DOM Toolbar Injection Test
  const shadowHost = document.getElementById('adaptai-widget-host');
  assert(shadowHost !== null, "Floating Shadow DOM widget host #adaptai-widget-host is injected");
  const shadowRoot = shadowHost ? shadowHost.shadowRoot : null;
  assert(shadowRoot !== null, "Shadow Root is attached to widget host");
  assert(shadowRoot && shadowRoot.children.length > 0, "Read Aloud TTS button rendered inside Shadow DOM");



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
  const hasMotorClass = document.body.classList.contains ? document.body.classList.contains('adapt-motor-assist') : document.body.classList.classes.has('adapt-motor-assist');
  assert(hasMotorClass, "Motor assist class added to body tag");

  // 6. Text Simplification Test
  applyTextSimplification(["Test simplified paragraph text."]);
  const firstP = document.querySelector('p');
  assert(firstP && firstP.innerText === "Test simplified paragraph text.", "First paragraph text swapped with simplified string");

  console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.`);
  console.groupEnd();
  return passed === total;
};




