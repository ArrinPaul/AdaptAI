# AdaptAI — Team Rules

These rules exist for one reason: **Module 1 and Module 2 must be developable, testable, and demoable independently, right up until the final integration step.** Every rule below serves that goal.

---

## 1. The Golden Rule

**Never edit a file that belongs to the other module.** Not "just to fix one thing," not "it'll only take a second." If Module 1 needs something different from Module 2, it's a contract conversation, not a code edit.

Repo layout enforces this physically:
```
/adaptai
  /module1-extension   ← Module 1 team only
  /module2-ai          ← Module 2 team only
  /contract            ← shared, read by both, edited by neither without agreement
  Plan.md
  rules.md
  tracker.md
```

---

## 2. The Contract Is Frozen

- The JSON request/response shape in `Plan.md` §5 is agreed before Hour 1 and does not change casually.
- If a change is genuinely needed (a field is missing, a type is wrong), **both teams must agree in the same conversation before either team implements it.** One team does not unilaterally add/rename/remove a field.
- Prefer *adding* an optional field over renaming an existing one — renames break the other team silently.

---

## 3. Mock-First Development

- **Module 1 never waits for Module 2's real endpoint.** Build a hardcoded mock object matching the contract's Response shape and develop the entire DOM pipeline against it from minute one.
- **Module 2 never waits for a real browser.** Test every prompt/endpoint with curl/Postman using hand-written Request JSON. No browser required until integration.
- If either team finds themselves blocked "waiting for the other module," that's a process failure — stop and mock instead.

---

## 4. Git Workflow

- Branch naming: `m1/<feature>` for Module 1, `m2/<feature>` for Module 2 (e.g. `m1/popup-ui`, `m2/simplify-prompt`).
- Commit small, commit often — don't sit on an hour of uncommitted work in a 5-hour build.
- No direct pushes to `main` after the initial scaffold — quick PR + self-merge is fine, but keep `main` always in a working state so either team can pull at any time.
- Integration happens on a dedicated `integration` branch, not directly on `main`.

---

## 5. Coding Standards

- No leftover `console.log` debugging spam in code that reaches the integration branch.
- Every function that calls the AI endpoint (Module 1) or calls Gemini (Module 2) must have a `try/catch` — a failed call must never throw an unhandled error that breaks the demo.
- Module 2: **always validate the AI's JSON response before returning it.** If Gemini returns malformed JSON or extra prose, catch it, retry once or fall back to safe defaults — never pass raw unvalidated model output back to Module 1.
- Module 1: **always have a non-AI fallback.** If the fetch to Module 2 fails or times out, fall back to the hardcoded CSS persona presets silently rather than showing a broken/error state.
- Comment the "why" on anything non-obvious, not the "what."

---

## 6. Communication Rules

- Quick sync at the top of each hour (2 minutes, not a meeting): what's done, what's blocked, any contract concerns.
- Blockers get flagged immediately in the shared chat, not sat on silently.
- If a team member finishes their part of a module early, they help the other person on their **own module** first before touching the other module.

---

## 7. Testing Before Integration

Each module must independently prove itself working **before** the integration slot begins:

- **Module 1 checkpoint:** load unpacked extension in `chrome://extensions`, run every persona against the demo page using the mock response, confirm DOM changes visibly apply and read-aloud/voice capture work.
- **Module 2 checkpoint:** every `mode` in the contract returns a valid, schema-matching response via curl for at least one realistic input.

If a module can't pass its own checkpoint, it is not ready for integration — fix it in isolation first, don't debug it live during the integration slot.

---

## 8. Scope Cut Order (agreed in advance, no debate mid-hackathon)

If time runs short, cut in this exact order — decided now so nobody argues about it at hour 4:

1. Image description
2. Voice command mode
3. Accessibility report scoring
4. Extra personas beyond Visual + Dyslexia

**Never cut:** persona-based CSS transformation, the core AI Adapt flow, or the demo page. These three are the entire demo.

---

## 9. Integration Phase Rules

- Integration only starts once both checkpoints in §7 pass.
- Integrate one `mode` at a time, testing after each swap — don't wire all six modes into the real endpoint simultaneously and debug everything at once.
- Once integration works, **freeze feature work.** The last 30 minutes are for demo rehearsal and fallback testing (deliberately kill the AI call and confirm the CSS fallback still looks good), not new features.

---

## 10. Conflict Resolution

If the two teams disagree on a contract change or scope call, the decision defaults to **whichever option keeps both modules independent and doesn't block the other team.** When in doubt, protect the demo, not the feature.
