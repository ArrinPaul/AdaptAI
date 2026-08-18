# AdaptAI — Curated Onboarding Tests

The onboarding sequence determines the user's base "Preset" which will be saved to local storage. Each test maps directly to the adaptation parameters in our JSON contract (`fontScale`, `lineHeight`, `highContrast`, `hideAnimations`, `simplifyText`, `readAloud`).

## Phase 0: Localization
**Question:** "What is your preferred language?"
*   **Action:** Sets the language for the remaining tests and dictates the language parameter for the Gemini text simplification.

---

## Phase 1: Visual Impairment Test
*Goal: Establish baseline font scaling, weight, and contrast needs.*

**Test 1.1: Size & Weight (A/B/C Test)**
*   **Prompt:** "Select the text block that is most comfortable for you to read."
*   **Option A:** Standard font size (16px), normal weight.
*   **Option B:** Medium font size (20px), medium weight.
*   **Option C:** Large font size (24px), bold weight.
*   **Maps to:** `fontScale` (1.0, 1.25, 1.5)

**Test 1.2: Contrast & Glare (A/B/C/D Test)**
*   **Prompt:** "Which background and text color combination causes the least eye strain?"
*   **Option A:** Standard (Black text on White).
*   **Option B:** Dark Mode (White text on Dark Gray).
*   **Option C:** Soft Contrast (Dark Brown text on Sepia/Warm background).
*   **Option D:** Maximum Contrast (Yellow text on Black background).
*   **Maps to:** `highContrast` boolean and specific CSS color variables.

---

## Phase 2: Dyslexia & Cognitive Test
*Goal: Determine typographic tracking, line height, and information density preferences.*

**Test 2.1: Typography & Spacing (A/B Test)**
*   **Prompt:** "Which layout feels easier to follow without losing your place?"
*   **Option A:** Standard web typography (Arial/Helvetica, standard line-height 1.5, standard letter spacing).
*   **Option B:** Dyslexia-optimized typography (OpenDyslexic or Comic Sans, line-height 2.0, increased letter and word spacing).
*   **Maps to:** `lineHeight` (1.5 vs 2.0) and CSS `font-family` override.

**Test 2.2: Information Density (Direct Question)**
*   **Prompt:** "When reading a long article, how do you prefer the information to be presented?"
*   **Option A:** "I want to read the original, detailed paragraphs."
*   **Option B:** "I prefer the AI to summarize it into simple bullet points."
*   **Maps to:** `simplifyText` boolean (triggers AI text summarization on dense pages).

---

## Phase 3: Auditory, Motor & Focus Test
*Goal: Determine need for read-aloud features, animation blocking, and UI simplification.*

**Test 3.1: Text-to-Speech (Direct Question)**
*   **Prompt:** "Do you find it helpful to have the page read aloud to you?"
*   **Option A:** "No, I prefer to read silently."
*   **Option B:** "Yes, add a 'Read Aloud' button to pages."
*   **Option C:** "Yes, automatically start reading pages when I open them."
*   **Maps to:** Extension TTS state (Off, On-Demand, Auto-Play).

**Test 3.2: Motion & Focus (Direct Question)**
*   **Prompt:** "Do moving elements, videos, or pop-ups distract you or cause discomfort?"
*   **Option A:** "No, they are fine."
*   **Option B:** "Yes, please hide animations and unnecessary menus."
*   **Maps to:** `hideAnimations` (true) and `reduceNavigation` (true). 

---

### Result Generation
Once these 6 questions are answered, the frontend compiles the answers into a single JSON preset, stores it in `chrome.storage.local`, and transitions the user to the "Ready" state.
