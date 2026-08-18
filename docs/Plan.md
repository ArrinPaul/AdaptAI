# AdaptAI — Project Plan

## 1. Overall Context

**Problem Statement 3 — AI-Powered Accessibility**
*"What if technology adapted to every person, rather than expecting every person to adapt to it?"*

Most websites assume an "average" user: small text, dense information, complex menus, small buttons, mouse-only navigation, no image descriptions. People with visual, dyslexic/cognitive, or motor difficulties are left to adapt themselves. We flip that.

**The idea:** instead of building one more accessible-by-design website, we build a **Chrome extension** that sits on top of *any* existing website and transforms its presentation/interaction layer based on the user's needs — detected either via a preset persona or via an AI-driven preference conversation.

**Tagline:** *"The web adapts to you."*

**Why this beats a standalone accessible web app (for judging):** it solves the problem across the existing web instead of asking every organization to rebuild their site. The before/after live transformation is also a very strong visual demo.

**Accurate scope claim (say this, not more):**
> "AdaptAI dynamically transforms the presentation and interaction layer of existing websites based on the user's accessibility persona."

Not: "We completely reconstruct any website." That's out of scope for this timeframe.

---

## 2. Core User Flow

```
USER
  │
  ▼
"How do you prefer to experience the web?"
  │
  ├── Pick a persona (Visual / Dyslexia / Cognitive / Motor)
  └── OR describe it in plain language ("I have difficulty reading")
  │
  ▼
AdaptAI extension
  │
  ├── DOM Analyzer reads the current page
  ├── Sends page summary + preference to AI layer
  ▼
AI returns an Adaptation Plan (JSON)
  │
  ▼
DOM Modifier applies it to the live page
  │
  ▼
Transformed, personalized interface
```

---

## 3. Tech Stack

Everyone on both modules should be aligned on this exact stack — don't substitute without telling the other team.

| Layer | Tech |
|---|---|
| Extension platform | Chrome Extension, Manifest V3 |
| Extension UI | HTML, CSS, vanilla JS (`popup.html`, `popup.js`) — no framework, keep it fast to build |
| Page manipulation | Content script (`content.js`), vanilla JS DOM APIs |
| Extension messaging | `chrome.runtime` messaging between popup ↔ background ↔ content script |
| Client-side accessibility APIs | `SpeechSynthesis` (read aloud), `SpeechRecognition` (voice capture) — both built into Chrome, no external service |
| AI model | Gemini API (`gemini-1.5-flash` or latest available — confirm key/model before Hour 1) |
| AI vision (image description) | Gemini API multimodal (image input) |
| Backend for AI layer | Node.js + Express (single lightweight endpoint), OR a direct `fetch()` from `background.js` straight to Gemini if we want to skip hosting a server entirely — **decide this in Hour 1, don't leave it open** |
| Data format between modules | JSON over HTTP (see contract in section 5) |
| Version control | Git + GitHub, two folders (`/module1-extension`, `/module2-ai`) in one repo |
| Testing Module 2 standalone | curl / Postman / Thunder Client |
| Testing Module 1 standalone | Hardcoded mock JSON response, loaded unpacked in `chrome://extensions` |

---

## 4. Team Structure

- **Module 1 team (2 people):** Extension Core — everything in the browser (UI, DOM analysis, DOM modification, read aloud, voice capture, keyboard nav, report display).
- **Module 2 team (2 people):** AI Intelligence Layer — everything requiring AI judgment (adaptation planning, AI Adapt classification, text simplification, image description, accessibility scoring, voice command interpretation).

**The modules must not be interlinked during development.** The only thing they share is the JSON contract below, agreed upon before either team writes a line of code. See `rules.md` for the hard rules that keep them independent.

---

## 5. The Contract (frozen before Hour 1 — see rules.md for change process)

**Request → Module 2:**
```json
{
  "mode": "PERSONA | AI_ADAPT | SIMPLIFY | DESCRIBE_IMAGE | VOICE_COMMAND | REPORT",
  "userPreference": "string",
  "page": {
    "title": "string",
    "headings": ["string"],
    "buttons": ["string"],
    "paragraphCount": 0,
    "imageCount": 0,
    "navigationItems": 0,
    "sampleText": "string"
  },
  "imageUrl": "string or null",
  "voiceTranscript": "string or null"
}
```

**Response ← Module 2:**
```json
{
  "fontScale": 1.3,
  "lineHeight": 1.8,
  "highContrast": true,
  "hideAnimations": true,
  "enlargeButtons": true,
  "simplifyText": true,
  "simplifiedText": "string or null",
  "describeImages": false,
  "imageDescription": "string or null",
  "reduceNavigation": false,
  "voiceAction": "string or null",
  "accessibilityReport": {
    "overallScore": 0,
    "visual": 0,
    "cognitive": 0,
    "navigation": 0,
    "language": 0,
    "recommendations": ["string"]
  }
}
```

One endpoint, routed internally by `mode`. Module 1 always sends this shape; Module 2 always returns this shape (with irrelevant fields null/default depending on mode).

---

## 6. Module Ownership (full detail)

### Module 1 — Extension Core
- `manifest.json`
- `popup.html`, `popup.js` — persona selection + preference input + accessibility report display
- `content.js` — DOM Analyzer (builds the `page` object), DOM Modifier (applies the Response JSON), hardcoded CSS persona presets (zero-AI fallback), read aloud, keyboard navigation, voice capture (mic → transcript)
- `background.js` — message routing, single fetch call to Module 2's endpoint

### Module 2 — AI Intelligence Layer
- Single backend endpoint (Node/Express or direct Gemini call from a serverless-style function)
- Gemini prompts: adaptation plan, AI Adapt classification, text simplification, image description, accessibility scoring, voice command interpretation
- Response validation/sanitization layer — guards against malformed AI output before it's ever sent back

Full feature-to-module mapping lives in `tracker.md`.

---

## 7. Required Skills

See `skills.sh` for the runnable checklist. Summary by module:

**Module 1 needs:**
- Chrome Extension architecture (Manifest V3, content scripts, `chrome.runtime` messaging)
- DOM manipulation in vanilla JS (`querySelectorAll`, style injection, `MutationObserver` basics)
- CSS (font scaling, contrast, spacing, transitions/animations)
- Web Speech API (`SpeechSynthesis`, `SpeechRecognition`)
- Basic UX/UI for a small popup interface

**Module 2 needs:**
- Gemini API usage (prompt construction, multimodal/image input, response parsing)
- Prompt engineering for structured JSON output
- Node.js + Express basics (or serverless function basics) if hosting a backend
- JSON schema validation / defensive coding against malformed model output
- Basic understanding of accessibility heuristics (what actually makes text/pages easier to read/navigate) to write good prompts and scoring logic

---

## 8. Timeline (5 hours, both modules in parallel)

| Hour | Module 1 | Module 2 |
|---|---|---|
| 0:00–0:15 | **Both teams together:** lock the contract, agree on tech stack, split repo folders | same |
| 0:15–1:15 | Extension scaffold: manifest, popup, persona UI, get content script injecting into a test page | Backend scaffold + first Gemini call working (adaptation plan prompt only), tested via curl |
| 1:15–2:15 | DOM Analyzer + DOM Modifier working against a **mocked** Response JSON | Text simplification + AI Adapt classification prompts, tested via curl |
| 2:15–3:15 | Read aloud, keyboard nav, voice capture (mic → transcript, no interpretation yet) | Image description prompt + voice command interpretation prompt, tested via curl |
| 3:15–4:00 | Accessibility report UI, polish CSS presets | Accessibility scoring prompt, response validation layer hardened |
| 4:00–4:30 | **Integration:** swap mock for real fetch, test every `mode` one at a time on the controlled demo page | same |
| 4:30–5:00 | Bug fixes, fallback testing (kill the AI call, confirm CSS presets still work), demo run-through | same |

---

## 9. Demo Plan

1. Open the **controlled demo page** (deliberately small text, dense paragraphs, tiny buttons — built/chosen in advance, never a live third-party site).
2. Show the "before" state.
3. Open AdaptAI, pick "Easier to read."
4. Show the DOM Analyzer progress UI ("342 elements found...") for visual impact.
5. Show the transformed "after" state — large text, high contrast, simplified paragraph, larger buttons.
6. Show one AI Adapt example: type a free-text preference, show it map to a real profile.
7. Show the accessibility report score.
8. If stable: quick voice command demo ("open profile") as a closer.

---

## 10. Success Criteria (from the source analysis)

| Metric | Target |
|---|---|
| 5-hour feasibility | High — achieved via CSS-first, AI-only-where-needed design |
| Innovation | Adapting the *existing web* instead of building one more accessible site |
| Demo impact | Live before/after transformation, judge can see it happen |
| Technical difficulty | Kept manageable by fixed contract + CSS/AI split |
| Social impact | Directly addresses visual, dyslexic/cognitive, and motor accessibility needs |

See `rules.md` for team working rules and `tracker.md` for the live task tracker.
