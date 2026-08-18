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
- [ ] Build interactive 3-section selection form (`onboarding.html`, `onboarding.css`)
- [ ] Build form state handler capturing visual, cognitive, audio options (`onboarding.js`)
- [ ] Save profile JSON payload securely to `chrome.storage.local` under key `userProfile`
- [ ] Retrieve and pre-populate options when reopening onboarding page

**Tests:**
- [ ] Profile JSON schema valid: `{"highContrast": bool, "dyslexicFont": bool, "fontScale": string, "audioEnabled": bool}`
- [ ] `chrome.storage.local.set` persists options without error
- [ ] `chrome.storage.local.get` accurately restores saved profile state
- [ ] Visual styling responsive across screen viewports

**Quality Gate:**
- [ ] Zero console errors on form submit
- [ ] Profile data verified in Chrome Extension Storage DevTools
- [ ] Pushed to `main` via git merge workflow

---

### A.2 DOM Scraper Engine & Event Wiring
- [ ] Write `scrapePageDOM()` function targeting `<h1>`-`<h3>` and `<p>` elements (`content.js`)
- [ ] Sanitize scraped inner text and enforce 2000 character maximum limit
- [ ] Wire scraper to trigger on `chrome.runtime.onMessage` action `"scrape_page"`
- [ ] Emit structured `process_with_ai` message payload to background worker

**Tests:**
- [ ] Scraper extracts text from dense sample HTML structures
- [ ] Truncation logic caps output at 2000 characters without crashing
- [ ] Empty or image-only DOMs return fallback text gracefully
- [ ] Message payload successfully received by runtime listener

**Quality Gate:**
- [ ] Clean text payload output with zero DOM element references
- [ ] Message passing confirmed in extension background console
- [ ] Pushed to `main` via git merge workflow

---

### A.3 Floating Accessibility Toolbar & Web Speech Engine (TTS)
- [ ] Inject floating accessibility panel `#adaptai-toolbar` into DOM (`content.js`, `styles.css`)
- [ ] Add 🔊 (Read Aloud) and 🎤 (Voice Command) interactive buttons
- [ ] Implement SpeechSynthesis engine (`window.speechSynthesis`) for Read Aloud button
- [ ] Wire voice command listener placeholder for future intent routing

**Tests:**
- [ ] Toolbar renders fixed in bottom-right corner without disrupting page layout
- [ ] 🔊 click triggers SpeechSynthesisUtterance with clear audio output
- [ ] `speechSynthesis.cancel()` stops previous speech when re-triggered
- [ ] Hover and click visual transitions smooth on all elements

**Quality Gate:**
- [ ] Toolbar `z-index` stays on top of external site elements (`z-index: 999999`)
- [ ] Web Speech API runs cleanly without browser permission blocks
- [ ] Pushed to `main` via git merge workflow

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
