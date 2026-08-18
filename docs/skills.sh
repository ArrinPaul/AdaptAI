#!/bin/bash
# AdaptAI — Required Skills & Environment Checklist
# Run this at the start of the hackathon: bash skills.sh
# It checks your tooling and prints the skills each module needs.
# It does NOT install anything by itself — it tells you what's missing.

echo "=================================================="
echo " AdaptAI — Environment & Skills Checklist"
echo "=================================================="
echo ""

check_tool() {
  if command -v "$1" &> /dev/null; then
    echo "  [OK]   $1 found: $($1 --version 2>&1 | head -n 1)"
  else
    echo "  [MISS] $1 not found — install before you start"
  fi
}

echo "-- Shared tooling (both modules need this) --"
check_tool git
check_tool node
check_tool npm
check_tool curl
echo ""

echo "-- Module 1 (Extension Core) environment --"
echo "  Chrome/Chromium browser with chrome://extensions developer mode enabled"
echo "  (no CLI check possible — verify manually: chrome://extensions -> toggle 'Developer mode')"
echo ""

echo "-- Module 2 (AI Intelligence Layer) environment --"
echo "  Gemini API key set as an environment variable, e.g.:"
echo "    export GEMINI_API_KEY=your_key_here"
if [ -z "$GEMINI_API_KEY" ]; then
  echo "  [MISS] GEMINI_API_KEY is not currently set in this shell"
else
  echo "  [OK]   GEMINI_API_KEY is set"
fi
echo ""

echo "=================================================="
echo " Required Skills by Module"
echo "=================================================="
echo ""

echo "-- MODULE 1: Extension Core --"
cat << 'EOF'
  1. Chrome Extension architecture (Manifest V3)
     - manifest.json structure, permissions, content_scripts, action/popup
  2. Content scripts and the extension messaging model
     - chrome.runtime.sendMessage / onMessage between popup, background, content script
  3. Vanilla JS DOM manipulation
     - querySelectorAll, style/className injection, basic MutationObserver awareness
  4. CSS for accessibility
     - font-size/line-height/letter-spacing scaling, contrast, hiding/enlarging elements,
       disabling animations via CSS
  5. Web Speech API
     - SpeechSynthesis (read aloud), SpeechRecognition (voice capture)
  6. Basic popup UI/UX
     - simple HTML/CSS forms, button states, no framework needed
EOF
echo ""

echo "-- MODULE 2: AI Intelligence Layer --"
cat << 'EOF'
  1. Gemini API usage
     - request/response format, text prompts, multimodal (image) input
  2. Prompt engineering for structured output
     - forcing strict JSON-only responses, few-shot examples, handling model drift
  3. Node.js + Express basics (or equivalent serverless function)
     - single POST endpoint, JSON body parsing, environment variables for API keys
  4. Defensive coding / schema validation
     - validating AI output against a fixed JSON contract, safe defaults, retry logic
  5. Basic accessibility heuristics
     - what actually makes text/pages easier to read/navigate, needed to write good
       prompts and a meaningful scoring rubric
EOF
echo ""

echo "=================================================="
echo " Reminder: see Plan.md for the full contract,"
echo " rules.md for team rules, tracker.md for tasks."
echo "=================================================="
