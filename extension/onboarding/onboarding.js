let motorClicks = [];
let motorStartTime = null;

function nextStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.test-step').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

  // Show requested step
  const activeStep = document.getElementById(`step-${stepNumber}`);
  if (activeStep) activeStep.style.display = 'block';

  const dot = document.getElementById(`step-dot-${stepNumber}`);
  if (dot) dot.classList.add('active');

  if (stepNumber === 3 && !motorStartTime) {
    initMotorTest();
  }
}

function initMotorTest() {
  const btn = document.getElementById('motor-target-btn');
  const display = document.getElementById('motor-score-display');
  if (!btn) return;

  motorStartTime = Date.now();
  let clicks = 0;

  btn.onclick = () => {
    clicks++;
    const elapsed = Date.now() - motorStartTime;
    btn.style.transform = `translate(${Math.random() * 80 - 40}px, ${Math.random() * 40 - 20}px)`;

    if (clicks >= 3) {
      const avgReactionTime = Math.round(elapsed / 3);
      display.innerText = `Accuracy Score: ${avgReactionTime}ms avg reaction time.`;
      display.style.color = '#34d399';
    } else {
      display.innerText = `Click ${clicks}/3 registered...`;
    }
  };
}

function calculatePersona() {
  const visualVal = document.querySelector('input[name="visual_test"]:checked')?.value || 'standard';
  const cognitiveVal = document.querySelector('input[name="cognitive_test"]:checked')?.value || 'dense';

  let personaName = "Standard Explorer";
  let summary = "Balanced visual and text settings. Standard web layout supported.";
  let visualScore = "85/100";
  let cognitiveScore = "90/100";
  let motorScore = "95/100";

  let visualProfile = { highContrast: false, fontScale: 1.0 };
  let cognitiveProfile = { dyslexicFont: false, simplifyText: false };
  let audioProfile = { enabled: true };

  // Personalization Matrix based on diagnostic responses
  if (visualVal === 'high_contrast') {
    personaName = "High-Contrast Visual Assist Persona";
    summary = "Optimized for low-vision & light sensitivity. Forces high-contrast themes and dark backgrounds.";
    visualScore = "45/100 (Assisted)";
    visualProfile.highContrast = true;
  } else if (visualVal === 'scaled_text') {
    personaName = "Large Typography Assist Persona";
    summary = "Optimized for legibility. Applies 1.5x font scaling automatically.";
    visualScore = "60/100 (Assisted)";
    visualProfile.fontScale = 1.5;
  }

  if (cognitiveVal === 'dyslexic') {
    personaName = "Dyslexia Cognitive Assist Persona";
    summary = "Injects OpenDyslexic font family to eliminate character rotation.";
    cognitiveScore = "50/100 (Assisted)";
    cognitiveProfile.dyslexicFont = true;
  } else if (cognitiveVal === 'simplified') {
    personaName = "AI Simplification Cognitive Persona";
    summary = "Summarizes complex academic jargon into clear bullet points using Gemini AI.";
    cognitiveScore = "55/100 (Assisted)";
    cognitiveProfile.simplifyText = true;
  }

  // Update UI Persona Card
  document.getElementById('persona-title').innerText = personaName;
  document.getElementById('persona-summary').innerText = summary;
  document.getElementById('visual-score-val').innerText = visualScore;
  document.getElementById('cognitive-score-val').innerText = cognitiveScore;
  document.getElementById('motor-score-val').innerText = motorScore;

  // Save generated profile globally
  window.generatedProfile = {
    personaName,
    summary,
    diagnosticScores: { visualScore, cognitiveScore, motorScore },
    visual: visualProfile,
    cognitive: cognitiveProfile,
    audio: audioProfile
  };

  nextStep(4);
}

document.getElementById('profile-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const profilePayload = window.generatedProfile || {
    personaName: "Standard Persona",
    visual: { highContrast: false, fontScale: 1.0 },
    cognitive: { dyslexicFont: false, simplifyText: true },
    audio: { enabled: true }
  };

  function handleSuccessRedirect() {
    const msgEl = document.getElementById('success-message');
    if (msgEl) msgEl.style.display = 'block';
    
    setTimeout(() => {
      window.location.href = '/demo/index.html';
    }, 1500);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ userProfile: profilePayload }, () => {
      console.log("Personalized Persona saved to chrome.storage.local:", profilePayload);
      handleSuccessRedirect();
    });
  } else {
    localStorage.setItem('userProfile', JSON.stringify(profilePayload));
    console.log("Personalized Persona saved to localStorage:", profilePayload);
    handleSuccessRedirect();
  }
});



