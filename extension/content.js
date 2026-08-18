// content.js - Track A Implementation Skeleton

// -------------------------------------------------------------
// MOCK RESPONSE FOR TRACK A PARALLEL TESTING
// -------------------------------------------------------------
const mockGeminiResponse = {
  cssUpdates: {
    "--adapt-font-scale": "1.5",
    "--adapt-bg-color": "#121212",
    "--adapt-text-color": "#f4f4f5",
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
    // Target key structural elements across the document: headings, articles, sections, main, p, nav
    const selectors = 'h1, h2, h3, h4, p, article, section, main, header, nav, aside';
    const elements = Array.from(document.querySelectorAll(selectors));

    // Analyze DOM structure dynamically for site-specific layout profiling
    const structuredNodes = elements
      .filter(el => {
        if (el.closest('#adaptai-toolbar') || el.closest('#adaptai-widget-host') || el.closest('#adaptai-assistant-overlay')) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.innerText.trim().length > 0;
      })
      .slice(0, 30) // Analyze first 30 structural DOM nodes
      .map(el => {
        const tag = el.tagName.toLowerCase();
        const text = el.innerText.trim().slice(0, 150).replace(/\s+/g, ' ');
        return `<${tag}>${text}</${tag}>`;
      });

    const pageMeta = {
      domain: window.location.hostname,
      title: document.title,
      structuredDOM: structuredNodes.join('\n')
    };

    const payloadString = JSON.stringify(pageMeta, null, 2);
    console.log(`[AdaptAI Structural Analyzer] Analyzed ${structuredNodes.length} DOM elements for domain: ${pageMeta.domain}`);
    return payloadString;
  } catch (err) {
    console.error("[AdaptAI Scraper Error]", err);
    return JSON.stringify({ domain: window.location.hostname, structuredDOM: document.body.innerText.slice(0, 1500) });
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
      gap: 6px;
      background: rgba(18, 18, 22, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 6px 10px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .widget-container:hover {
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.08);
    }
    .widget-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
      cursor: pointer;
      padding: 8px 14px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .widget-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.35);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .widget-btn:active {
      transform: translateY(0) scale(0.96);
    }
    .widget-btn svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;





  const container = document.createElement('div');
  container.className = 'widget-container';
  container.innerHTML = `
    <button id="tts-btn" class="widget-btn" title="Text to Speech (Read Selected Text / Page)">
      <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      <span>Audio</span>
    </button>
    <button id="theme-btn" class="widget-btn" title="Toggle Extension Theme (Light / Dark)">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      <span>Theme</span>
    </button>
    <button id="assistant-btn" class="widget-btn" title="Toggle AI Assistant Overlay (Ctrl+Shift+U)">
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.5 7.5"></path><path d="M12 12v10"></path></svg>
      <span>AI</span>
    </button>
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
 * Toggles Extension Light / Dark Mode across external web pages using clean Filter Engine
 */
function toggleExtensionTheme() {
  const root = document.documentElement;

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.runtime && chrome.runtime.id) {
      chrome.storage.local.get(['extensionTheme'], (res) => {
        if (chrome.runtime.lastError) {
          fallbackToggleTheme(root);
          return;
        }
        const currentTheme = res ? (res.extensionTheme || 'light') : 'light';

        if (currentTheme === 'light') {
          // Toggle to High-Contrast Dark Mode
          extensionThemeState = 'dark';
          root.setAttribute('data-adaptai-transformed', 'true');
          root.setAttribute('data-adaptai-theme', 'dark');
          console.log("[AdaptAI Theme] Toggled to High-Contrast Dark Theme across website.");
        } else {
          // Toggle to High-Contrast Light Mode
          extensionThemeState = 'light';
          root.setAttribute('data-adaptai-transformed', 'true');
          root.setAttribute('data-adaptai-theme', 'light');
          console.log("[AdaptAI Theme] Toggled to High-Contrast Light Theme across website.");
        }

        try {
          chrome.storage.local.set({ extensionTheme: extensionThemeState });
        } catch (e) {}

        removeFloatingToolbar();
        mountShadowWidget();
      });
    } else {
      fallbackToggleTheme(root);
    }
  } catch (err) {
    console.warn("[AdaptAI Theme] Extension context invalidated, using fallback DOM theme toggle.");
    fallbackToggleTheme(root);
  }
}

function fallbackToggleTheme(root) {
  root.setAttribute('data-adaptai-transformed', 'true');
  const current = root.getAttribute('data-adaptai-theme');
  if (current === 'dark') {
    root.setAttribute('data-adaptai-theme', 'light');
    extensionThemeState = 'light';
  } else {
    root.setAttribute('data-adaptai-theme', 'dark');
    extensionThemeState = 'dark';
  }
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
 * Applies CSS variables to document root and synchronizes theme attribute
 */
function applyCssTransformations(cssUpdates) {
  if (!cssUpdates) return;
  const root = document.documentElement;
  root.setAttribute('data-adaptai-transformed', 'true');

  Object.entries(cssUpdates).forEach(([varName, val]) => {
    root.style.setProperty(varName, val);
  });

  // Synchronize data-adaptai-theme attribute based on background color or current state
  const bg = cssUpdates['--adapt-bg-color'];
  if (bg) {
    const isLight = bg === '#ffffff' || bg.toLowerCase() === '#fff' || bg.toLowerCase() === 'white' || bg === '#f4f4f5';
    const theme = isLight ? 'light' : 'dark';
    root.setAttribute('data-adaptai-theme', theme);
    extensionThemeState = theme;
  } else if (!root.hasAttribute('data-adaptai-theme')) {
    root.setAttribute('data-adaptai-theme', extensionThemeState || 'dark');
  }
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

// Store original paragraph text before AI simplification for full DOM restore capability
let originalParagraphTexts = [];
let isPageAdaptedState = false;

/**
 * Restores the webpage back to its original un-adapted DOM state
 */
function restoreOriginalPageDOM() {
  const root = document.documentElement;

  // 1. Remove CSS variables and attribute overrides
  root.removeAttribute('data-adaptai-transformed');
  root.removeAttribute('data-adaptai-theme');
  root.style.removeProperty('--adapt-bg-color');
  root.style.removeProperty('--adapt-text-color');
  root.style.removeProperty('--adapt-font-scale');
  root.style.removeProperty('--adapt-font-family');
  root.style.removeProperty('--adapt-line-height');

  // 2. Remove Dyslexic font
  ensureDyslexicFont(false);

  // 3. Remove motor assistance
  applyMotorAssist(false);

  // 4. Restore original paragraph texts
  if (originalParagraphTexts.length > 0) {
    const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => !p.closest('#adaptai-toolbar') && !p.closest('#adaptai-widget-host') && !p.closest('#adaptai-assistant-overlay'));
    paragraphs.forEach((p, idx) => {
      if (originalParagraphTexts[idx] !== undefined) {
        p.innerText = originalParagraphTexts[idx];
      }
    });
    originalParagraphTexts = [];
  }

  isPageAdaptedState = false;
  console.log("[AdaptAI] Restored page back to original DOM state.");
}

/**
 * Swaps original paragraph innerText with simplified AI texts
 */
function applyTextSimplification(simplifiedTextArray) {
  if (!Array.isArray(simplifiedTextArray) || simplifiedTextArray.length === 0) return;
  
  const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => !p.closest('#adaptai-toolbar') && !p.closest('#adaptai-widget-host') && !p.closest('#adaptai-assistant-overlay'));

  // Cache original paragraph text first time
  if (originalParagraphTexts.length === 0) {
    originalParagraphTexts = paragraphs.map(p => p.innerText);
  }

  // Store active simplified text for Web Speech TTS engine
  activeSimplifiedText = simplifiedTextArray;

  paragraphs.forEach((p, idx) => {
    if (simplifiedTextArray[idx]) {
      p.innerText = simplifiedTextArray[idx];
      p.style.transition = 'all 0.3s ease';
    }
  });
}

/**
 * Master transformation pipeline entrypoint with Toggle ON / Restore ORIGINAL support
 */
function runFullTransformation(payload) {
  // If page is already adapted, toggle back to original DOM state!
  if (isPageAdaptedState) {
    restoreOriginalPageDOM();
    return;
  }

  console.log("[AdaptAI] Applying full persona transformation payload:", payload);

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

  isPageAdaptedState = true;
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
        <span class="brand-dot"></span> AdaptAI Floating Assistant
      </div>
      <button class="assistant-close-btn" id="adaptai-assistant-close" title="Close (Esc)">✕</button>
    </div>

    <div class="assistant-body" id="adaptai-assistant-body">
      <div class="assistant-welcome">
        <p class="welcome-heading">Hello! How can I assist you on this page?</p>
        <p class="welcome-sub">Context & Persona aware assistant for accessibility and reading ease.</p>
      </div>

      <div class="suggested-chips" id="adaptai-suggested-chips">
        <button class="chip-btn" data-query="Summarize this page content briefly.">Summarize Page</button>
        <button class="chip-btn" data-query="Explain complex concepts on this page simply.">Explain This</button>
        <button class="chip-btn" data-query="Highlight key action items or decisions.">Key Takeaways</button>
      </div>

      <div id="adaptai-chat-history" class="chat-history"></div>
    </div>

    <div class="assistant-footer">
      <div id="adaptai-context-indicator" class="context-indicator" style="display:none;">
        <span class="context-icon">/</span> Selected Text Context Attached
      </div>
      <div class="input-row">
        <textarea id="adaptai-assistant-input" rows="1" placeholder="Ask anything about this page..."></textarea>
        <button id="adaptai-assistant-send" class="send-btn">→</button>
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

  const isHidden = panel.style.display === 'none' || window.getComputedStyle(panel).display === 'none';
  if (isHidden) {
    panel.style.setProperty('display', 'flex', 'important');
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
    panel.style.setProperty('display', 'none', 'important');
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFloatingToolbar);
} else {
  injectFloatingToolbar();
}
window.addEventListener('load', injectFloatingToolbar);



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




