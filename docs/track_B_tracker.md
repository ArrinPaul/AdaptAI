# Track B Master Execution Tracker (PrepMaster Structured Format)

> **Strategy:** Build → Test → Validate → Ship. No rushing. Quality over speed.
> **Role:** Person B (AI Intelligence Engine / Service Worker / Gemini API)
> **Active Branch:** `Track-B`
> **Philosophy:** Every sub-task ships with concrete unit/integration test verification, quality gates, and error defensive fallbacks before marking done.

---

## How to Use This Tracker

- **Status:** `[ ]` Not started | `[~]` In progress | `[x]` Done | `[!]` Blocked
- **Quality Gate:** Must pass all test checks before sub-task completion
- **Testing:** Required test coverage specified per sub-task
- **Git Commit Rule:** Every completed sub-task is committed to `Track-B` with clean messages

---

## TRACK B EXECUTION MODULES

### B.1 Service Worker Lifecycle & Extension Trigger Wiring
- [ ] Implement `chrome.runtime.onInstalled` opening onboarding setup tab (`background.js`)
- [ ] Implement `chrome.action.onClicked` extension icon click handler emitting `"scrape_page"` message
- [ ] Implement keyboard shortcut command listener (`Ctrl+Shift+A`) triggering adaptation
- [ ] Wire incoming message listener for `process_with_ai` payload from `content.js`

**Tests:**
- [ ] Service worker registers without syntax or runtime initialization errors
- [ ] Extension icon click sends `{ action: "scrape_page" }` to active tab
- [ ] Keyboard shortcut `Ctrl+Shift+A` emits trigger message to active tab
- [ ] `chrome.runtime.onMessage` correctly catches incoming scraped DOM text

**Quality Gate:**
- [ ] Background service worker stays responsive without crashing or memory leaks
- [ ] Message passing listener returns true for async responses when necessary
- [ ] Sub-task committed to `Track-B`

---

### B.2 Storage Retrieval & Dynamic Gemini Prompt Engineering
- [ ] Fetch user profile (`userProfile` / persona context) from `chrome.storage.local`
- [ ] Build dynamic Gemini System & User Prompt incorporating profile preferences and scraped DOM text
- [ ] Inject strict JSON Output instructions matching Frozen Data Contract
- [ ] Build defensive mock prompt generator for standalone background worker testing

**Tests:**
- [ ] Storage handler handles missing/default profiles gracefully
- [ ] System prompt correctly adapts instructions based on high contrast, dyslexic font, and text simplification flags
- [ ] Prompt text length capped safely to avoid API context window overflows
- [ ] Context payload formatted into clean Gemini REST API payload

**Quality Gate:**
- [ ] System prompt produces exact key names: `cssUpdates`, `simplifiedText`, `voiceIntent`
- [ ] Zero unhandled promise rejections on storage read errors
- [ ] Sub-task committed to `Track-B`

---

### B.3 Gemini API Integration & Structured Output Enforcement
- [ ] Implement native `fetch()` POST call to Gemini API endpoint (`generativelanguage.googleapis.com`)
- [ ] Configure `responseSchema` (Gemini Structured Outputs) enforcing strict JSON output
- [ ] Parse JSON response payload and route result back to active tab via `chrome.tabs.sendMessage`
- [ ] Implement defensive `try/catch` wrapper returning safe fallback JSON on API error or offline state

**Tests:**
- [ ] Gemini API call executes successfully with valid API key
- [ ] Output JSON schema strictly conforms to contract
- [ ] API network failures/timeouts fall back to `mockGeminiResponse` without throwing uncaught exceptions
- [ ] Transformation payload emitted back to content script tab ID

**Quality Gate:**
- [ ] P95 API response latency < 2.5 seconds
- [ ] Structured Output JSON validated 100% of the time
- [ ] Sub-task committed to `Track-B`

---

### B.4 End-to-End Background Worker Suite & Track B Verification
- [ ] Build automated unit and integration runner `runTrackBTests()` for background worker
- [ ] Verify profile read → prompt build → Gemini API call → tab response pipeline
- [ ] Conduct end-to-end dry run using static scraped DOM input

**Tests:**
- [ ] `runTrackBTests()` passes 100% of background assertions
- [ ] Error fallback mechanisms tested against simulated 500/403 API errors
- [ ] End-to-end data pipeline verified

**Quality Gate:**
- [ ] Zero background service worker console errors
- [ ] All Track B tasks completed and committed on `Track-B` branch
