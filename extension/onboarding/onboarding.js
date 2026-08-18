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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-next-2')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="visual_test"]:checked');
    if (!selected) {
      alert("Please select one of the visual legibility options to continue.");
      return;
    }
    nextStep(2);
  });

  document.getElementById('btn-back-1')?.addEventListener('click', () => nextStep(1));

  document.getElementById('btn-next-3')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="cognitive_test"]:checked');
    if (!selected) {
      alert("Please select one of the cognitive readability options to continue.");
      return;
    }
    nextStep(3);
  });

  document.getElementById('btn-back-2')?.addEventListener('click', () => nextStep(2));
  document.getElementById('btn-calc-persona')?.addEventListener('click', () => calculatePersona());


  // Proceed Browsing action - saves state & closes onboarding tab
  document.getElementById('btn-proceed-browsing')?.addEventListener('click', () => {
    if (!window.generatedProfile) {
      calculatePersona();
    }

    const profilePayload = window.generatedProfile || {
      personaName: "Standard Accessibility Persona",
      summary: "Balanced visual and text settings.",
      diagnosticScores: { visualScore: "85/100", cognitiveScore: "90/100", motorScore: "95/100" },
      visual: { highContrast: false, fontScale: 1.0, lineHeight: 1.6 },
      cognitive: { dyslexicFont: false, simplifyText: true },
      audio: { enabled: true, speechRate: 1.0 },
      motor: { targetExpansion: false }
    };

    const statePayload = {
      userProfile: profilePayload,
      onboardingCompleted: true,
      extensionEnabled: true,
      testCompleted: true
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(statePayload, () => {
        console.log("[AdaptAI Onboarding] State saved. Closing onboarding window...");
        window.close();
      });
    } else {
      localStorage.setItem('userProfile', JSON.stringify(profilePayload));
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('extensionEnabled', 'true');
      console.log("[AdaptAI Onboarding] State saved. Closing onboarding window...");
      window.close();
    }
  });
});


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

  let personaParts = [];
  let summaryParts = [];
  let visualScore = "85/100";
  let cognitiveScore = "90/100";
  let motorScore = "95/100";

  let visualProfile = { highContrast: false, fontScale: 1.0 };
  let cognitiveProfile = { dyslexicFont: false, simplifyText: false };
  let audioProfile = { enabled: true };

  // 1. Visual Diagnostics Evaluation
  if (visualVal === 'high_contrast') {
    personaParts.push("High Contrast");
    summaryParts.push("Low-vision & high contrast dark theme active.");
    visualScore = "45/100 (Assisted)";
    visualProfile.highContrast = true;
  } else if (visualVal === 'scaled_text') {
    personaParts.push("Large Typography");
    summaryParts.push("1.5x font scaling & enhanced spacing active.");
    visualScore = "60/100 (Assisted)";
    visualProfile.fontScale = 1.5;
  } else {
    personaParts.push("Standard Visual");
  }

  // 2. Cognitive Diagnostics Evaluation
  if (cognitiveVal === 'dyslexic') {
    personaParts.push("Dyslexia Assist");
    summaryParts.push("OpenDyslexic font family active.");
    cognitiveScore = "50/100 (Assisted)";
    cognitiveProfile.dyslexicFont = true;
  } else if (cognitiveVal === 'simplified') {
    personaParts.push("AI Simplification");
    summaryParts.push("Gemini AI paragraph summarization active.");
    cognitiveScore = "55/100 (Assisted)";
    cognitiveProfile.simplifyText = true;
  } else {
    personaParts.push("Original Text");
  }

  const personaName = `${personaParts.join(" + ")} Persona`;
  const summary = summaryParts.length > 0 
    ? summaryParts.join(" ") 
    : "Balanced visual and text settings. Standard web layout supported.";

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
    audio: audioProfile,
    updatedAt: new Date().toISOString()
  };

  nextStep(4);
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const profilePayload = window.generatedProfile || {
    personaName: "Standard Persona",
    diagnosticScores: { visualScore: "85/100", cognitiveScore: "90/100", motorScore: "95/100" },
    visual: { highContrast: false, fontScale: 1.0 },
    cognitive: { dyslexicFont: false, simplifyText: true },
    audio: { enabled: true },
    updatedAt: new Date().toISOString()
  };

  // Dispatch background message to generate structured Gemini AI recommendations
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      action: "generate_personalization_recommendations",
      profile: profilePayload
    }, (res) => {
      console.log("[AdaptAI Onboarding] AI Personalization recommendations generated:", res);
    });
  }

  function handleSuccessRedirect() {
    const msgEl = document.getElementById('success-message');
    if (msgEl) msgEl.style.display = 'block';
    
    setTimeout(() => {
      window.location.href = '/demo/index.html';
    }, 1500);
  }

  const statePayload = {
    userProfile: profilePayload,
    onboardingCompleted: true,
    extensionEnabled: true,
    testCompleted: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(statePayload, () => {
      console.log("Personalized Persona and onboarding state saved to chrome.storage.local:", statePayload);
      handleSuccessRedirect();
    });
  } else {
    Object.entries(statePayload).forEach(([key, val]) => {
      localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
    });
    console.log("Personalized Persona and onboarding state saved to localStorage:", statePayload);
    handleSuccessRedirect();
  }
});





