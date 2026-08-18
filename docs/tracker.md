# AdaptAI — Task Tracker

Status legend: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE` · `CUT`

Update this file directly as you go — it's the single source of truth for where the build stands.

---

## Phase 0 — Shared Kickoff (both teams together, 15 min)

| # | Task | Owner | Est. | Status |
|---|---|---|---|---|
| 0.1 | Lock the JSON contract (Plan.md §5) | Both teams | 10 min | TODO |
| 0.2 | Confirm tech stack decision: hosted backend vs direct `fetch()` from `background.js` | Both teams | 5 min | TODO |
| 0.3 | Create repo with `/module1-extension` and `/module2-ai` folders | 1 person | 5 min | TODO |
| 0.4 | Confirm/obtain Gemini API key | Module 2 | 5 min | TODO |
| 0.5 | Pick/build the controlled demo page (small text, dense paragraphs, tiny buttons, at least one image) | 1 person from either team | 15 min | TODO |

---

## Module 1 — Extension Core

**Team:** Person A (popup/UI/report), Person B (content script/DOM/speech)

### Person A — Popup, Personas, Report UI

| # | Task | Est. | Status | Notes |
|---|---|---|---|---|
| 1.A.1 | `manifest.json` — permissions, content script registration, popup registration | 20 min | TODO | Manifest V3 |
| 1.A.2 | `popup.html` — persona buttons (Visual / Dyslexia / Cognitive / Motor) | 20 min | TODO | |
| 1.A.3 | `popup.html` — free-text preference input ("How do you prefer to experience the web?") | 15 min | TODO | Feeds AI_ADAPT mode |
| 1.A.4 | `popup.js` — wire buttons/input to send message to `background.js` | 20 min | TODO | |
| 1.A.5 | Hardcoded CSS persona presets (Visual, Dyslexia) — pure fallback, zero AI | 40 min | TODO | Must work standalone |
| 1.A.6 | "Analyzing page... N elements found" progress UI | 15 min | TODO | Demo polish |
| 1.A.7 | Accessibility report panel — renders `accessibilityReport` from Response JSON | 30 min | TODO | Depends on 2.B.3 output shape only, not live call |
| 1.A.8 | Visual polish pass on popup | 20 min | TODO | |

### Person B — Content Script (DOM, Speech, Nav)

| # | Task | Est. | Status | Notes |
|---|---|---|---|---|
| 1.B.1 | `content.js` skeleton — receives messages from `background.js` | 15 min | TODO | |
| 1.B.2 | DOM Analyzer — extract `page` object (title, headings, buttons, counts, sample text) | 40 min | TODO | Matches contract exactly |
| 1.B.3 | DOM Modifier — apply `fontScale`, `lineHeight`, `highContrast`, `hideAnimations`, `enlargeButtons` via injected CSS | 45 min | TODO | Test against mock Response JSON |
| 1.B.4 | DOM Modifier — apply `simplifiedText` (swap paragraph content when present) | 20 min | TODO | |
| 1.B.5 | DOM Modifier — apply `reduceNavigation` (hide/collapse nav elements) | 20 min | TODO | |
| 1.B.6 | Read aloud — `SpeechSynthesis`, "🔊 Read this page" trigger | 25 min | TODO | No AI needed |
| 1.B.7 | Keyboard navigation — focus outlines, skip links, tab order fixes | 25 min | TODO | |
| 1.B.8 | Voice capture — `SpeechRecognition`, mic → transcript → send to background for interpretation | 30 min | TODO | Interpretation is Module 2's job |
| 1.B.9 | Voice action execution — once `voiceAction` comes back (e.g. `navigate:profile`), actually perform it | 20 min | TODO | |

### Module 1 Integration Checkpoint (must pass before integration phase)

| # | Task | Status |
|---|---|---|
| 1.C.1 | Extension loads unpacked in `chrome://extensions` with no errors | TODO |
| 1.C.2 | Every persona visibly transforms the demo page using the **mock** Response JSON | TODO |
| 1.C.3 | Read aloud works on demo page | TODO |
| 1.C.4 | Voice capture produces a visible transcript | TODO |

---

## Module 2 — AI Intelligence Layer

**Team:** Person A (content-generation prompts), Person B (voice interpretation + validation)

### Person A — Content Generation Prompts

| # | Task | Est. | Status | Notes |
|---|---|---|---|---|
| 2.A.1 | Backend/function scaffold — single endpoint accepting the Request JSON | 25 min | TODO | Node/Express or direct call, per 0.2 |
| 2.A.2 | Prompt: Adaptation Plan (`mode: PERSONA`) — page + persona → CSS-relevant JSON fields | 30 min | TODO | Test via curl |
| 2.A.3 | Prompt: AI Adapt (`mode: AI_ADAPT`) — free text preference → full profile | 30 min | TODO | Test via curl with 3+ different phrasings |
| 2.A.4 | Prompt: Text Simplification (`mode: SIMPLIFY`) — `sampleText` → `simplifiedText` | 30 min | TODO | Test via curl |
| 2.A.5 | Prompt: Image Description (`mode: DESCRIBE_IMAGE`) — `imageUrl` → `imageDescription` | 30 min | TODO | Gemini multimodal input |
| 2.A.6 | Prompt: Accessibility Report (`mode: REPORT`) — page → score breakdown + recommendations | 25 min | TODO | |

### Person B — Voice Interpretation + Validation Layer

| # | Task | Est. | Status | Notes |
|---|---|---|---|---|
| 2.B.1 | Prompt: Voice Command Interpretation (`mode: VOICE_COMMAND`) — transcript → `voiceAction` string | 30 min | TODO | Keep action vocabulary small and fixed (e.g. `navigate:X`, `scroll:X`) |
| 2.B.2 | Response schema validator — checks every field against the contract before returning | 35 min | TODO | Reject/retry on malformed JSON |
| 2.B.3 | Default-value fallback — fill safe defaults for any missing/invalid field rather than erroring | 25 min | TODO | |
| 2.B.4 | Error handling — malformed Gemini output, timeout, rate limit, all return a valid (if minimal) Response JSON, never a raw error | 30 min | TODO | This is the #1 live-demo risk point |
| 2.B.5 | Logging for debugging (server-side only, not exposed to Module 1) | 15 min | TODO | |

### Module 2 Integration Checkpoint (must pass before integration phase)

| # | Task | Status |
|---|---|---|
| 2.C.1 | Every `mode` returns a valid, schema-matching JSON via curl | TODO |
| 2.C.2 | Malformed/edge-case input doesn't crash the endpoint | TODO |
| 2.C.3 | Response times are demo-acceptable (roughly under a few seconds) | TODO |

---

## Phase 3 — Integration (30–45 min, both teams together)

| # | Task | Status |
|---|---|---|
| 3.1 | Module 1 swaps mock Response JSON for real `fetch()` to Module 2's endpoint | TODO |
| 3.2 | Test `mode: PERSONA` end-to-end on demo page | TODO |
| 3.3 | Test `mode: AI_ADAPT` end-to-end on demo page | TODO |
| 3.4 | Test `mode: SIMPLIFY` end-to-end on demo page | TODO |
| 3.5 | Test `mode: DESCRIBE_IMAGE` end-to-end on demo page | TODO |
| 3.6 | Test `mode: VOICE_COMMAND` end-to-end on demo page | TODO |
| 3.7 | Test `mode: REPORT` end-to-end on demo page | TODO |
| 3.8 | Kill the AI endpoint deliberately — confirm Module 1 falls back to CSS presets cleanly | TODO |
| 3.9 | Full demo run-through, timed | TODO |
| 3.10 | Fix anything broken from 3.9 | TODO |

---

## Cut List (apply only if time is short, in this order)

1. `mode: DESCRIBE_IMAGE` — CUT if behind schedule at Hour 3
2. `mode: VOICE_COMMAND` — CUT if behind schedule at Hour 3.5
3. `mode: REPORT` — CUT if behind schedule at Hour 4
4. Extra personas beyond Visual + Dyslexia — CUT anytime

**Never cut:** `mode: PERSONA`, `mode: AI_ADAPT`, the demo page, the CSS fallback.
