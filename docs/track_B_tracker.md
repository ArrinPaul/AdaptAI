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
- [x] Implement `chrome.runtime.onInstalled` opening onboarding setup tab (`background.js`)
- [x] Implement `chrome.action.onClicked` extension icon click handler emitting `"scrape_page"` message
- [x] Implement keyboard shortcut command listener (`Ctrl+Shift+A`) triggering adaptation
- [x] Wire incoming message listener for `process_with_ai` payload from `content.js`

**Tests:**
- [x] Service worker registers without syntax or runtime initialization errors
- [x] Extension icon click sends `{ action: "scrape_page" }` to active tab
- [x] Keyboard shortcut `Ctrl+Shift+A` emits trigger message to active tab
- [x] `chrome.runtime.onMessage` correctly catches incoming scraped DOM text

**Quality Gate:**
- [x] Background service worker stays responsive without crashing or memory leaks
- [x] Message passing listener returns true for async responses when necessary
- [x] Sub-task committed to `Track-B`


---

### B.2 Storage Retrieval & Dynamic Gemini Prompt Engineering
- [x] Fetch user profile (`userProfile` / persona context) from `chrome.storage.local`
- [x] Build dynamic Gemini System & User Prompt incorporating profile preferences and scraped DOM text
- [x] Inject strict JSON Output instructions matching Frozen Data Contract
- [x] Build defensive mock prompt generator for standalone background worker testing

**Tests:**
- [x] Storage handler handles missing/default profiles gracefully
- [x] System prompt correctly adapts instructions based on high contrast, dyslexic font, and text simplification flags
- [x] Prompt text length capped safely to avoid API context window overflows
- [x] Context payload formatted into clean Gemini REST API payload

**Quality Gate:**
- [x] System prompt produces exact key names: `cssUpdates`, `simplifiedText`, `voiceIntent`
- [x] Zero unhandled promise rejections on storage read errors
- [x] Sub-task committed to `Track-B`


---

### B.3 Gemini API Integration & Structured Output Enforcement
- [x] Implement native `fetch()` POST call to Gemini API endpoint (`generativelanguage.googleapis.com`)
- [x] Configure `responseSchema` (Gemini Structured Outputs) enforcing strict JSON output
- [x] Parse JSON response payload and route result back to active tab via `chrome.tabs.sendMessage`
- [x] Implement defensive `try/catch` wrapper returning safe fallback JSON on API error or offline state

**Tests:**
- [x] Gemini API call executes successfully with valid API key
- [x] Output JSON schema strictly conforms to contract
- [x] API network failures/timeouts fall back to `mockGeminiResponse` without throwing uncaught exceptions
- [x] Transformation payload emitted back to content script tab ID

**Quality Gate:**
- [x] P95 API response latency < 2.5 seconds
- [x] Structured Output JSON validated 100% of the time
- [x] Sub-task committed to `Track-B`


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
