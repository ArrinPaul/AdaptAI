// Copy this file to env.js (which is git-ignored) and add your own keys:
//   cp extension/env.example.js extension/env.js
//
// background.js imports ./env.js, so the extension will not load without it.
// Leave the placeholders to run without AI (the extension falls back to built-in styles
// and a rule-based text rewrite).
//
// WARNING: these values are bundled into the extension. Use throwaway or restricted keys.
self.ENV = {
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",
  GROQ_API_KEY: "YOUR_GROQ_API_KEY",
};
