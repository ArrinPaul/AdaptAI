# AdaptAI-V1.0 — Master Execution Tracker

> **Strategy:** CSS-First Fallback → AI Intelligence → End-to-End Integration → Live Demo. No rushing. Quality over speed.
> **Team Assumption:** 4 developers (2 Module 1 Extension Core, 2 Module 2 AI Layer)
> **Total Duration:** 5 Hours (Hackathon Execution Window)
> **Philosophy:** Every module ships with tests, validation, and a quality gate before integration.

---

## How to Use This Tracker

- **Status:** `[ ]` Not started | `[~]` In progress | `[x]` Done | `[!]` Blocked
- **Quality Gate:** Must pass before next phase/checkpoint starts
- **Testing:** Every task/phase has required manual or automated test coverage before marking done
- **Review:** Every task gets review between module pairs before integration

---

## PHASE 0: SHARED KICKOFF & CONTRACT LOCKING (Hour 0:00 - 0:15)

> **Goal:** Freeze JSON Contract, align tech stack, set up monorepo folders, obtain API keys, prepare demo page.

### 0.1 Contract & Architecture Setup

- [ ] Lock JSON Request/Response contract between Module 1 and Module 2
- [ ] Confirm tech stack (Manifest V3, Vanilla JS, Node/Express backend, Gemini 1.5 Flash API)
- [ ] Create repository structure (`/module1-extension` and `/module2-ai`)
- [ ] Obtain and verify Gemini API key
- [ ] Build/pick controlled demo HTML page (dense text, small fonts, tiny buttons, image)

**Tests:**

- [ ] Contract JSON schema verified on both sides
- [ ] Gemini API key test call succeeds via simple script
- [ ] Demo page renders expected inaccessible elements

**Quality Gate:**

- [ ] Both teams signed off on the frozen JSON contract
- [ ] Zero tech stack ambiguity

---

### **PHASE 0 EXIT GATE**

- [ ] Repository initialized with proper workspace folders
- [ ] Contract frozen in Section 5 of `Plan.md`
- [ ] Gemini API key active and validated

---

## PHASE 1: MODULE 1 — EXTENSION SCAFFOLD & POPUP UI (Hour 0:15 - 1:15)

> **Goal:** Functioning Chrome Extension onboarding UI, persona selection, free-text input, and CSS fallbacks.

### Person A — Onboarding, Keybinds, & UI

| # | Task | Est. | Status | Notes |
|---|---|---|---|---|
| 1.A.1 | `manifest.json` — background script (`onInstalled` redirect), commands (keybind), action | 20 min | TODO | Manifest V3 |
| 1.A.2 | Onboarding Page UI — HTML/CSS for language selection & testing interface | 30 min | TODO | Full-page landing |
| 1.A.3 | Curated Tests logic — implement Dyslexia, Visual Impairment, and Auditory tests | 45 min | TODO | Generates user preset |
| 1.A.4 | Storage — save generated preset to `chrome.storage.local` | 15 min | TODO | |
| 1.A.5 | Background Script — handle extension icon click to trigger adaptation via content script | 20 min | TODO | No popup, direct toggle |
| 1.A.6 | Keybind implementation — handle `Ctrl+Shift+A` command to activate AI Assistant | 20 min | TODO | |
| 1.A.7 | Accessibility report UI (overlay/modal injected on page) | 30 min | TODO | |
| 1.A.8 | Visual polish pass on onboarding page | 20 min | TODO | |

**Tests:**

- [ ] Extension loads unpacked in `chrome://extensions` with zero errors
- [ ] Popup opens correctly on clicking extension icon
- [ ] Completing onboarding tests sends valid message payload to background script
- [ ] CSS fallback presets work offline without network call

**Quality Gate:**

- [ ] Popup UI responsive and accessible
- [ ] Zero dependencies breaking extension loading

---

### **PHASE 1 EXIT GATE**

- [ ] Extension manifest loads cleanly without warnings
- [ ] Onboarding UI passes visual check
- [ ] Offline CSS presets verified standalone

---

## PHASE 2: MODULE 1 — DOM ANALYZER & MODIFIER (Hour 1:15 - 2:15)

> **Goal:** Extract page context, apply transformation styles, and verify against mock JSON responses.

### 2.1 DOM Analysis & Page Modification (Person B)

- [ ] Create `content.js` skeleton and setup message listener from `background.js`
- [ ] Implement DOM Analyzer: extract `page` object (title, headings, buttons, paragraph count, image count, navigation count, sample text)
- [ ] Implement DOM Modifier: apply `fontScale`, `lineHeight`, `highContrast`, `hideAnimations`, `enlargeButtons` via injected CSS rules
- [ ] Implement DOM Modifier: apply `simplifiedText` (swap paragraph content when present)
- [ ] Implement DOM Modifier: apply `reduceNavigation` (collapse/hide top navigation bars)

**Tests:**

- [ ] DOM Analyzer extracts exact `page` JSON object matching Section 5 contract
- [ ] DOM Modifier transforms page elements visibly using a mock Response JSON
- [ ] Simplified text replaces original paragraph cleanly without breaking page layout
- [ ] Contrast & font scaling styles apply cleanly without breaking DOM structure

**Quality Gate:**

- [ ] All DOM modifications pass visual inspection on controlled demo page
- [ ] No Javascript errors in developer console during DOM mutation

---

### **PHASE 2 EXIT GATE**

- [ ] Content script successfully communicates with background script
- [ ] DOM Analyzer output matches exact contract schema
- [ ] Page visually transforms against mock response data

---

## PHASE 3: MODULE 2 — AI INTELLIGENCE LAYER BACKEND & PROMPTS (Hour 0:15 - 2:15)

> **Goal:** Backend server scaffold and Gemini API prompt engineering for all operational modes.

### 3.1 Backend Scaffold & Core Prompts (Person A)

- [ ] Create Node.js + Express backend scaffold with `/adapt` POST endpoint accepting Request JSON
- [ ] Prompt 1 (`mode: PERSONA`): Page summary + persona → structured Adaptation Plan JSON
- [ ] Prompt 2 (`mode: AI_ADAPT`): Natural language user preference → profile Adaptation Plan JSON
- [ ] Prompt 3 (`mode: SIMPLIFY`): `sampleText` → clear, accessible `simplifiedText`
- [ ] Prompt 4 (`mode: DESCRIBE_IMAGE`): `imageUrl` → multimodal Gemini prompt for `imageDescription`
- [ ] Prompt 5 (`mode: REPORT`): Page context → score breakdown (0-100 across 4 categories) + actionable recommendations

**Tests:**

- [ ] `POST /adapt` endpoint accepts valid Request JSON via curl
- [ ] `mode: PERSONA` returns valid JSON matching section 5 response contract
- [ ] `mode: AI_ADAPT` maps 3+ natural language test inputs to valid CSS adaptation parameters
- [ ] `mode: SIMPLIFY` produces clear, concise summary without loss of key meaning
- [ ] `mode: DESCRIBE_IMAGE` returns descriptive alt-text for sample images

**Quality Gate:**

- [ ] 100% of curl test responses return valid JSON adhering strictly to contract
- [ ] AI prompt execution latency under 3 seconds

---

### **PHASE 3 EXIT GATE**

- [ ] All 5 generation prompts return valid JSON via curl/Postman
- [ ] Express endpoint properly routes requests by `mode`
- [ ] Zero unhandled API rejections

---

## PHASE 4: MODULE 2 — VOICE INTERPRETATION & DEFENSIVE VALIDATION (Hour 2:15 - 3:15)

> **Goal:** Intent parsing for voice actions, strict response validation, default fallbacks, and error resilience.

### 4.1 Voice Parsing & Defensive Engineering (Person B)

- [ ] Prompt 6 (`mode: VOICE_COMMAND`): Voice transcript → structured `voiceAction` string (e.g., `navigate:profile`, `scroll:down`)
- [ ] Implement Response Schema Validator: check every returned JSON field against contract schema
- [ ] Implement Default-Value Fallback: populate safe defaults for missing/invalid fields instead of crashing
- [ ] Implement Error Handling Middleware: gracefully wrap model errors, timeouts, or rate limits into safe Response JSON
- [ ] Add server-side logging for debugging request/response cycles

**Tests:**

- [ ] `mode: VOICE_COMMAND` parses 5 different spoken phrases into expected `voiceAction` tokens
- [ ] Schema validator catches malformed/incomplete JSON and applies fallbacks
- [ ] Simulated Gemini API failure returns valid fallback JSON (200 status, safe defaults)
- [ ] Rate-limited calls do not throw unhandled promise rejections

**Quality Gate:**

- [ ] Endpoint NEVER returns 500 error or raw stack trace to Module 1
- [ ] Voice action vocabulary clean and deterministic

---

### **PHASE 4 EXIT GATE**

- [ ] Schema validator rejects malformed AI responses and applies defaults
- [ ] Backend error handling returns clean 200 response envelope under failure
- [ ] Voice action parsing passes integration tests

---

## PHASE 5: CLIENT-SIDE SPEECH & ACCESSIBILITY NAVIGATION (Hour 2:15 - 3:15)

> **Goal:** Native Chrome SpeechSynthesis, SpeechRecognition, and keyboard navigation.

### 5.1 Speech & Navigation Scripting (Module 1 - Person B)

- [ ] Read Aloud functionality using Web Speech API `SpeechSynthesis` ("🔊 Read this page" trigger)
- [ ] Voice capture implementation using `SpeechRecognition` (microphone capture → transcript string)
- [ ] Wire voice transcript to background script to request `mode: VOICE_COMMAND` from Module 2
- [ ] Implement Voice Action Executor: parse returned `voiceAction` and perform page navigation/scroll
- [ ] Implement enhanced Keyboard Navigation: visible focus outlines, skip links, tab order fixes

**Tests:**

- [ ] Clicking Read Aloud speaks page sample text clearly
- [ ] Speaking into mic populates text transcript in extension UI
- [ ] Voice command (e.g., "scroll down") triggers actual DOM scroll action
- [ ] Tab key navigation covers all interactive elements with visible focus ring

**Quality Gate:**

- [ ] SpeechSynthesis handles stop/pause events smoothly
- [ ] Voice capture handles permission grant/deny without breaking UI

---

### **PHASE 5 EXIT GATE**

- [ ] Read Aloud plays clear speech audio on demo page
- [ ] SpeechRecognition converts speech input to text string reliably
- [ ] Keyboard focus ring clearly visible across DOM elements

---

## PHASE 6: SYSTEM INTEGRATION & END-TO-END TESTING (Hour 4:00 - 4:30)

> **Goal:** Connect Module 1 to Module 2 live endpoint, test all modes, and verify fallback behavior.

### 6.1 Integration & Mode Verification (Both Teams)

- [ ] Swap Module 1 mock JSON fetch with live `fetch()` to Module 2 endpoint in `background.js`
- [ ] End-to-End Test `mode: PERSONA` on controlled demo page
- [ ] End-to-End Test `mode: AI_ADAPT` with custom user preferences on controlled demo page
- [ ] End-to-End Test `mode: SIMPLIFY` on dense demo page paragraphs
- [ ] End-to-End Test `mode: DESCRIBE_IMAGE` on demo page images
- [ ] End-to-End Test `mode: VOICE_COMMAND` end-to-end (mic → transcript → AI → DOM action)
- [ ] End-to-End Test `mode: REPORT` and display score card as an injected overlay
- [ ] Fallback Test: Intentionally sever AI backend and verify instant CSS preset fallback in extension

**Tests:**

- [ ] All 6 operational modes complete successfully end-to-end
- [ ] Page transformation completes in < 3 seconds after extension icon click
- [ ] Disabling network connectivity triggers pure CSS preset fallback gracefully

**Quality Gate:**

- [ ] Zero unhandled errors in browser console or backend logs during full flow
- [ ] Live visual transformation clearly demonstrable on demo page

---

### **PHASE 6 EXIT GATE**

- [ ] Module 1 and Module 2 successfully integrated over HTTP
- [ ] All 6 operational modes pass end-to-end testing
- [ ] Zero-AI offline CSS fallback verified working when backend is severed

---

## PHASE 7: UI POLISH, ACCESSIBILITY REPORT & DEMO REHEARSAL (Hour 4:30 - 5:00)

> **Goal:** Visual polish, accessibility report card, timed demo dry-run, and final verification.

### 7.1 Report Panel & Demo Dry-Run (Both Teams)

- [ ] Build Accessibility Report Panel in `onboarding.html` / `onboarding.js` (renders overall score, category breakdown, recommendations)
- [ ] Visual polish pass on onboarding page (typography, icons, active states)
- [ ] Perform 3 timed demo runs using the controlled demo page
- [ ] Patch any lingering edge cases identified during dry runs

**Tests:**

- [ ] Accessibility score card renders clearly with breakdown bars and text recommendations
- [ ] Full demo presentation sequence completed in under 3 minutes
- [ ] Transformed demo page visually impressive and easy to explain to judges

**Quality Gate:**

- [ ] Demo script practiced and verified end-to-end
- [ ] Clean rollback/fallback guaranteed if live AI latency spikes

---

### **PHASE 7 EXIT GATE**

- [ ] Accessibility report UI displays score breakdown accurately
- [ ] 3 dry-run demo presentations completed without errors
- [ ] Ready for live submission / judging demo

---

## TIMELINE SUMMARY

| Phase | Hours | Duration | Focus |
|---|---|---|---|
| 0. Shared Kickoff & Schema | 0:00–0:15 | 15 min | Contract freezing, tech stack alignment, demo page setup |
| 1. Extension Scaffold & UI | 0:15–1:15 | 60 min | Manifest V3, Popup UI, preset CSS fallbacks |
| 2. DOM Analyzer & Modifier | 1:15–2:15 | 60 min | Page extraction, DOM transformation, mock testing |
| 3. AI Backend & Prompts | 0:15–2:15 | 120 min | Express server, Gemini prompts (Persona, AI Adapt, Simplify, Image, Report) |
| 4. Voice Parsing & Validation | 2:15–3:15 | 60 min | Spoken command parsing, schema validation, fallback middleware |
| 5. Speech & Keyboard Nav | 2:15–3:15 | 60 min | Web Speech API (TTS & STT), keyboard focus outlines |
| 6. System Integration | 4:00–4:30 | 30 min | Live fetch wiring, all modes E2E, fallback kill-switch test |
| 7. UI Polish & Demo Dry-Run | 4:30–5:00 | 30 min | Report panel, visual polish, timed demo rehearsal |
| **TOTAL** | | **5 hours** | **Hackathon Execution Window** |

---

## TEAM ALLOCATION

| Role | Developer | Primary Responsibilities |
|---|---|---|
| **Module 1 — Person A** | Developer 1 (UI/Popup) | `manifest.json`, `onboarding.html`, `onboarding.js`, CSS presets, report panel UI |
| **Module 1 — Person B** | Developer 2 (DOM/Speech) | `content.js` (DOM Analyzer, DOM Modifier), SpeechSynthesis, SpeechRecognition, keyboard nav |
| **Module 2 — Person A** | Developer 3 (AI Prompts) | Express backend, Gemini prompts (Persona, AI Adapt, Simplify, Image, Report) |
| **Module 2 — Person B** | Developer 4 (Validation/Voice)| Voice command prompt, schema validator, fallback middleware, error handling |

---

## QUALITY RULES

1. **Frozen Contract:** No changes to JSON contract without approval from both module leads.
2. **Module Independence:** Modules must develop and test against mock data independently until Phase 6 integration.
3. **CSS-First Fallback:** Extension MUST transform page using local CSS presets even if AI backend is completely offline.
4. **Resilient Backend:** AI backend MUST NEVER return 500 or raw error stack; always return safe JSON fallback with default values.
5. **Controlled Demo:** Always test and present on the controlled demo page to guarantee consistent visual impact.
6. **Zero External Speech Dependencies:** Use built-in Chrome `SpeechSynthesis` and `SpeechRecognition` APIs only.

---

_This tracker is the single source of truth for AdaptAI execution. Update status continuously._
