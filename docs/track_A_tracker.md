# Track A Master Execution Tracker (PrepMaster Structured Format)

> **Strategy:** Build → Test → Validate → Ship to `main`. No rushing. Quality over speed.
> **Role:** Person A (Frontend / DOM Engine / Extension UI)
> **Active Branch:** `track-A`
> **Philosophy:** Every sub-task ships with concrete test verification, quality gates, and automated/manual validation steps before merging to `main`.

---

## How to Use This Tracker

- **Status:** `[ ]` Not started | `[~]` In progress | `[x]` Done | `[!]` Blocked
- **Quality Gate:** Must pass all test checks before merging sub-task to `main`
- **Testing:** Required test coverage specified per sub-task
- **Git Commit Rule:** Every completed sub-task is committed to `track-A` and merged to `main`

---

## TRACK A EXECUTION MODULES

### A.1 Onboarding UI & Profile Storage Setup
- [x] Build interactive 3-section selection form (`onboarding.html`, `onboarding.css`)
- [x] Build form state handler capturing visual, cognitive, audio options (`onboarding.js`)
- [x] Save profile JSON payload securely to `chrome.storage.local` under key `userProfile`
- [x] Retrieve and pre-populate options when reopening onboarding page

**Tests:**
- [x] Profile JSON schema valid: `{"highContrast": bool, "dyslexicFont": bool, "fontScale": string, "audioEnabled": bool}`
- [x] `chrome.storage.local.set` persists options without error
- [x] `chrome.storage.local.get` accurately restores saved profile state
- [x] Visual styling responsive across screen viewports

**Quality Gate:**
- [x] Zero console errors on form submit
- [x] Profile data verified in Chrome Extension Storage DevTools
- [x] Pushed to `main` via git merge workflow


---

### A.2 DOM Scraper Engine & Event Wiring
- [x] Write `scrapePageDOM()` function targeting `<h1>`-`<h3>` and `<p>` elements (`content.js`)
- [x] Sanitize scraped inner text and enforce 2000 character maximum limit
- [x] Wire scraper to trigger on `chrome.runtime.onMessage` action `"scrape_page"`
- [x] Emit structured `process_with_ai` message payload to background worker

**Tests:**
- [x] Scraper extracts text from dense sample HTML structures
- [x] Truncation logic caps output at 2000 characters without crashing
- [x] Empty or image-only DOMs return fallback text gracefully
- [x] Message payload successfully received by runtime listener

**Quality Gate:**
- [x] Clean text payload output with zero DOM element references
- [x] Message passing confirmed in extension background console
- [x] Sub-task baseline verified on `track-A` branch


---

### A.3 Floating Accessibility Toolbar & Web Speech Engine (TTS)
- [x] Inject floating accessibility panel `#adaptai-toolbar` into DOM (`content.js`, `styles.css`)
- [x] Add 🔊 (Read Aloud) and 🎤 (Voice Command) interactive buttons
- [x] Implement SpeechSynthesis engine (`window.speechSynthesis`) for Read Aloud button
- [x] Wire voice command listener placeholder for future intent routing

**Tests:**
- [x] Toolbar renders fixed in bottom-right corner without disrupting page layout
- [x] 🔊 click triggers SpeechSynthesisUtterance with clear audio output
- [x] `speechSynthesis.cancel()` stops previous speech when re-triggered
- [x] Hover and click visual transitions smooth on all elements

**Quality Gate:**
- [x] Toolbar `z-index` stays on top of external site elements (`z-index: 999999`)
- [x] Web Speech API runs cleanly without browser permission blocks
- [x] Sub-task baseline verified on `track-A` branch


---

### A.4 DOM Transformation Engine & Mock Execution
- [ ] Implement `applyCssTransformations(cssUpdates)` mutating `:root` CSS variables
- [ ] Implement `applyTextSimplification(simplifiedTextArray)` replacing paragraph `innerText`
- [ ] Connect `apply_transformations` message listener to execution engine
- [ ] Test full transformation flow locally using `mockGeminiResponse` fallback

**Tests:**
- [ ] CSS variable injection correctly scales font sizes and changes colors
- [ ] Paragraph text replacement preserves DOM layout structure
- [ ] Missing or empty `cssUpdates` handled safely without throwing errors
- [ ] Complete pipeline executes from extension trigger to visual update

**Quality Gate:**
- [ ] Visual transition takes effect in < 300ms
- [ ] DOM transformation verified on hostile demo page (`demo/index.html`)
- [ ] Final Track A merge to `main` complete

---

## 🔄 SUB-TASK GIT MERGE WORKFLOW

After completing and passing tests for **each sub-task** (A.1, A.2, A.3, A.4):

```bash
git add .
git commit -m "feat(track-A): complete Sub-Task A.<X> with tests and quality gates"
git checkout main
git merge track-A
git push origin main
git checkout track-A
```
