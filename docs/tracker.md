# AdaptAI — Execution Tracker

> **Strategy:** Parallel Mock-Driven Development -> End-to-End Integration -> Demo Polish
> **Team:** 2 Developers (Person A: Frontend/DOM | Person B: API/AI)
> **Goal:** 5-Hour Completion

### Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

---

## Phase 1: Onboarding & Profile (Person A)
| Status | Task | File(s) | Notes |
| :---: | :--- | :--- | :--- |
| `[ ]` | Build Onboarding HTML/CSS UI | `onboarding.html`, `onboarding.css` | 3 sections: Visual, Cognitive, Audio |
| `[ ]` | Capture form data into JSON profile | `onboarding.js` | |
| `[ ]` | Save profile to Chrome Storage | `onboarding.js` | `chrome.storage.local.set` |
| `[ ]` | Auto-open onboarding on install | `background.js` | `chrome.runtime.onInstalled` |

## Phase 2: Page Traversal (Person A)
| Status | Task | File(s) | Notes |
| :---: | :--- | :--- | :--- |
| `[ ]` | Write DOM Scraper function | `content.js` | Grab `innerText` from `h1-h3` and `p` |
| `[ ]` | Inject Audio UI buttons (🔊, 🎤) | `content.js`, `styles.css` | Float in bottom right |
| `[ ]` | Wire Extension Icon to trigger scraper | `background.js`, `content.js` | `chrome.action.onClicked` |

## Phase 3: AI Intelligence Engine (Person B)
| Status | Task | File(s) | Notes |
| :---: | :--- | :--- | :--- |
| `[ ]` | Listen for scraped text message | `background.js` | `chrome.runtime.onMessage` |
| `[ ]` | Retrieve User Profile | `background.js` | `chrome.storage.local.get` |
| `[ ]` | Engineer Gemini System Prompt | `background.js` | Combine text + profile |
| `[ ]` | Implement `fetch()` to Gemini API | `background.js` | Use mock text for testing |
| `[ ]` | Enforce JSON Structured Outputs | `background.js` | Gemini `responseSchema` |

## Phase 4: Transformation & Execution (Person A)
| Status | Task | File(s) | Notes |
| :---: | :--- | :--- | :--- |
| `[ ]` | Inject CSS Variables to `:root` | `content.js`, `styles.css` | Apply `fontScale`, `bg-color` |
| `[ ]` | Swap paragraph `innerText` | `content.js` | Use AI `simplifiedText` array |
| `[ ]` | Wire Web Speech API (Read Aloud) | `content.js` | Read the *simplified* text |
| `[ ]` | (Bonus) Wire Speech Recognition | `content.js` | Map to `voiceIntent` |

## Phase 5: Integration & Demo (Both)
| Status | Task | File(s) | Notes |
| :---: | :--- | :--- | :--- |
| `[ ]` | Delete Mocks & Wire End-to-End | `content.js`, `background.js` | The moment of truth |
| `[ ]` | Build Hostile `demo.html` | `demo.html` | Tiny fonts, low contrast, dense |
| `[ ]` | Fallback Testing | `background.js` | Break Gemini API, ensure CSS fallback works |
| `[ ]` | Rehearse Pitch | `N/A` | Under 3 minutes |
