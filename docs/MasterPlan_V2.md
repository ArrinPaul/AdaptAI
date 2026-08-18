# AdaptAI — The Master Execution Plan (Serverless Chrome Extension)

This is the end-to-end technical roadmap for building AdaptAI. This plan assumes a 2-person team building a serverless Chrome Extension (Manifest V3) that communicates directly with the Gemini API.

It includes **all** accessibility modules: Visual, Cognitive, Motor, and Audio (Text-to-Speech & Voice Commands).

---

## 🛠️ Phase 1: Project Skeleton & Configuration
*Setting up the foundations so Chrome recognizes the app.*

1. **Initialize Directory:**
   * Create `F:\media-hack\AdaptAI\extension`
2. **The Blueprint (`manifest.json`):**
   * Set `manifest_version: 3`.
   * **Permissions:** `"storage"` (saving profiles), `"activeTab"` (modifying DOM), `"scripting"` (injecting code), and `"speechRecognition"` (if Chrome requires, though Web Speech API usually asks via DOM).
   * Register `background.js` as the service worker.
   * Register `content.js` to inject into `<all_urls>`.
   * Set up keyboard shortcut commands (e.g., `Ctrl+Shift+A` to trigger the Assistant).
3. **Assets:**
   * Create an `/icons` folder and add a basic logo (16x16, 48x48, 128x128).

---

## 🚀 Phase 2: Onboarding & User Profiling
*Building the standalone interface where the user sets their accessibility needs.*

1. **The Installation Hook (`background.js`):**
   * Implement `chrome.runtime.onInstalled.addListener()`.
   * When installed, automatically open a new tab pointing to `onboarding.html`.
2. **Onboarding UI (`onboarding.html` & `onboarding.css`):**
   * Build a clean, full-screen HTML page.
   * Create 3 interactive test sections:
     * *Visual:* High contrast vs Low contrast preference.
     * *Cognitive:* Dense paragraph vs Dyslexic font & simplified text.
     * *Audio/Motor:* "Enable Voice Assistant & Read Aloud features" toggle.
3. **Profiling Logic (`onboarding.js`):**
   * Capture the test results.
   * Format into a JSON profile: `{"highContrast": true, "dyslexicFont": true, "audioEnabled": true}`.
   * Securely save this to the browser using `chrome.storage.local.set()`.

---

## 📖 Phase 3: Page Analysis & Audio Injection
*Extracting context from the webpage and inserting the audio controls.*

1. **Content Script Setup (`content.js`):**
   * Ensure it loads successfully into the webpage.
2. **DOM Traversal (Reading the Page):**
   * Use `document.querySelectorAll()` to extract text from `<h1>` to `<h6>` and `<p>` tags. Limit to the main article body to keep API payloads fast.
3. **Assistant Injection (The UI on the Webpage):**
   * Inject a floating UI panel on the screen with two buttons:
     * 🔊 **Read Aloud Button** (Text-to-Speech)
     * 🎤 **Voice Command Button** (Microphone)
4. **Message Passing:**
   * Listen for the extension icon click or the `Ctrl+Shift+A` keybind. When triggered, send the extracted DOM text to `background.js`.

---

## 🧠 Phase 4: AI Intelligence Layer
*The background script orchestrating data between the DOM, Local Storage, and Gemini.*

1. **Data Assembly (`background.js`):**
   * Retrieve the scraped webpage text from `content.js`.
   * Retrieve the User Profile from `chrome.storage.local.get()`.
2. **The Gemini API Call:**
   * Use native `fetch()` to call the Gemini API endpoint.
   * **Prompt Engineering:** Combine the scraped text and user profile. Ask Gemini to return a strict JSON payload using Structured Outputs.
   * *Required JSON structure:* `{"fontScale": 1.5, "highContrast": true, "textReplacements": [...], "voiceIntent": "scroll_down"}`.
3. **Voice Command Routing (Optional Branch):**
   * If the user clicked the Microphone button, send the captured voice transcript to Gemini, asking it to return a `voiceIntent` (e.g., "scroll to bottom", "read page").
4. **Sending Data Back:**
   * Route the resulting JSON payload back to `content.js`.

---

## 🎨 Phase 5: Transformation & Audio Execution
*Applying the AI's recommendations physically to the screen and speakers.*

1. **Visual & Cognitive Modifications (`content.js`):**
   * Receive the JSON from `background.js`.
   * **CSS Variables:** Inject CSS into the `:root` to force font scaling, dyslexic fonts, and high contrast background/text colors.
   * **Motor Targets:** Increase `padding` and `margin` on all `<button>` and `<a>` tags so they are easier to click.
   * **Text Swapping:** Replace the `innerText` of dense paragraphs with the simplified text from Gemini.
   * *Crucial:* Apply `transition: all 0.3s ease;` in CSS for smooth visual morphing.
2. **Text-to-Speech (Web Speech API):**
   * If the user clicks "Read Aloud" (or if the profile auto-triggers it), use `window.speechSynthesis.speak()`.
   * Pass the *simplified* AI text into the speech engine, not the complex original text.
3. **Voice Command Execution:**
   * If Gemini returns a `voiceIntent` like `"scroll_down"`, use `window.scrollBy(0, 500)` to move the page via voice.

---

## 🎬 Phase 6: Local Hosting & The Demo
*Preparing the application for hackathon presentation.*

1. **The "Hostile" Demo Page (`demo.html`):**
   * Build a local HTML file that is intentionally inaccessible. Give it tiny grey text, no button padding, and extremely complex academic jargon. This is your "Before" state.
2. **"Hosting" (Loading Unpacked):**
   * Chrome Web Store reviews take 3-5 days. For a hackathon, you "host" the app locally.
   * Go to `chrome://extensions`.
   * Turn on **Developer Mode** (top right).
   * Click **Load Unpacked** and select your `AdaptAI/extension` folder.
3. **The Presentation Flow:**
   * Show the terrible `demo.html` page.
   * Run through the `onboarding.html` tests.
   * Return to the demo page and click the extension icon.
   * Watch the page visually transform, highlight the simplified text, and click the 🔊 button to have the AI read the simplified text out loud.
