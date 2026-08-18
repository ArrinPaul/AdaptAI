# AdaptAI — Firm Rules (2-Person Serverless Execution)

These rules exist to ensure the 2-person team survives a 5-hour hackathon without stepping on each other's toes or breaking the core demo.

---

## 1. The "Parallel Mocking" Rule
**Never sit idle waiting for the other person's code.**
- **Person A (Frontend)** must develop all DOM transformations and UI using a hardcoded `mockGeminiResponse`.
- **Person B (AI/Backend)** must develop the Gemini API logic using a hardcoded `mockScrapedText`.
- You only wire them together in Phase 6.

## 2. The Contract is Frozen
The JSON shape that Gemini returns is the lifeblood of this project. It cannot be casually changed because it will silently break Person A's code.

**The Agreed Gemini Output Schema:**
```json
{
  "cssUpdates": {
    "--adapt-font-scale": 1.5,
    "--adapt-bg-color": "#000000",
    "--adapt-text-color": "#FFFF00"
  },
  "simplifiedText": [
    "Array of strings replacing paragraphs."
  ],
  "voiceIntent": "scroll_down | null"
}
```
If Person B needs to change this schema, they must verbally agree with Person A before editing.

## 3. The "No Backend" Rule
This is a serverless application. We do not use Node.js or Express. All API calls to Gemini are made via standard `fetch()` inside `background.js`. Do not waste time trying to spin up a local server.

## 4. The Defensive AI Rule
Person B must use Gemini's **Structured Outputs (responseSchema)** to force the model to return perfect JSON. Do not rely solely on "prompt engineering" (e.g., "Please return JSON") because an AI hallucination will crash the extension during the live demo. Wrap the `fetch` in a `try/catch` and return a safe fallback JSON if Gemini fails.

## 5. Scope Cut Priority (Agreed in Advance)
If the team runs low on time, drop features in this exact order to protect the core demo:
1. Voice Commands (Microphone to Action)
2. Text-to-Speech (Read Aloud)
3. Custom text-input box in Onboarding

**Never cut:** The CSS color/font transformation and the AI Text Simplification. Those are the core value proposition.

## 6. The 4th-Hour Integration
Integration begins at exactly Hour 4. Feature development stops. 
1. Remove mocks.
2. Wire `content.js` `sendMessage` to `background.js`.
3. Test entirely on the controlled `demo.html` page. Do not test on random websites until the core demo works flawlessly.
