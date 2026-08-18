// onboarding.js - AdaptAI Diagnostic Assessment & Persona Engine

let motorClicks = 0;
let motorStartTime = null;
window.generatedProfile = null;

window.showStep = function(stepNum) {
  if (stepNum === 2) {
    if (!document.querySelector('input[name="visual_test"]:checked')) {
      alert("Please select a visual test option.");
      return;
    }
  }
  if (stepNum === 3) {
    if (!document.querySelector('input[name="cognitive_test"]:checked')) {
      alert("Please select a cognitive test option.");
      return;
    }
  }

  if (stepNum === 4) {
    calculatePersona();
    return;
  }

  nextStep(stepNum);
};

function nextStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.test-step').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.step').forEach((el, idx) => {
    if(idx < stepNumber) el.classList.add('active');
    else el.classList.remove('active');
  });

  // Show requested step
  const activeStep = document.getElementById(`step-${stepNumber}`);
  if (activeStep) activeStep.classList.add('active');

  if (stepNumber === 3 && !motorStartTime) {
    initMotorTest();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Step navigation buttons
  document.getElementById('btn-next-2')?.addEventListener('click', () => showStep(2));
  document.getElementById('btn-back-1')?.addEventListener('click', () => showStep(1));
  document.getElementById('btn-next-3')?.addEventListener('click', () => showStep(3));
  document.getElementById('btn-back-2')?.addEventListener('click', () => showStep(2));
  document.getElementById('btn-calc-persona')?.addEventListener('click', () => showStep(4));
  document.getElementById('btn-retake')?.addEventListener('click', () => {
    motorClicks = 0;
    motorStartTime = null;
    const motorDisplay = document.getElementById('motor-score-display');
    if (motorDisplay) motorDisplay.innerText = "Accuracy Score: Click to begin (0/3)...";
    showStep(1);
  });

  // Save & Open Profile direct action
  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    saveProfileAndRedirect('profile/profile.html');
  });

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

  // Universal Navigation Routing Helper
  function navigateTo(relPath) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      window.location.href = chrome.runtime.getURL(relPath);
    } else {
      window.location.href = `../${relPath}`;
    }
  }

  // Bind Quick Navigation Links
  document.getElementById('link-landing')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('index.html');
  });

  document.getElementById('link-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('profile/profile.html');
  });

  document.getElementById('link-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('demo/index.html');
  });

  // Pre-populate if profile already saved (Commented out to enforce fresh test taking)
  /*
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['userProfile'], (res) => {
      if (res && res.userProfile) {
        // prepopulateOptions(res.userProfile);
      }
    });
  }
  */
});

function prepopulateOptions(p) {
  if (p.visual?.highContrast) {
    const radio = document.querySelector('input[name="visual_test"][value="high_contrast"]');
    if (radio) radio.checked = true;
  } else if (p.visual?.fontScale > 1.2) {
    const radio = document.querySelector('input[name="visual_test"][value="scaled_text"]');
    if (radio) radio.checked = true;
  }

  if (p.cognitive?.dyslexicFont) {
    const radio = document.querySelector('input[name="cognitive_test"][value="dyslexic"]');
    if (radio) radio.checked = true;
  } else if (p.cognitive?.simplifyText) {
    const radio = document.querySelector('input[name="cognitive_test"][value="simplified"]');
    if (radio) radio.checked = true;
  }
}

function initMotorTest() {
  const btn = document.getElementById('motor-target-btn');
  const display = document.getElementById('motor-score-display');
  if (!btn) return;

  motorClicks = 0;
  motorStartTime = Date.now();

  btn.onclick = () => {
    motorClicks++;
    const elapsed = Date.now() - motorStartTime;
    btn.style.transform = `translate(${Math.random() * 80 - 40}px, ${Math.random() * 40 - 20}px)`;

    if (motorClicks >= 3) {
      const avgReactionTime = Math.round(elapsed / 3);
      if (display) {
        display.innerText = `Accuracy Score: ${avgReactionTime}ms reaction speed recorded.`;
        display.style.color = '#34d399';
      }
      btn.innerText = "Completed! ✨";
      btn.disabled = true;
    } else {
      if (display) {
        display.innerText = `Click ${motorClicks}/3 registered...`;
      }
    }
  };
}

function calculatePersona() {
  const visualVal = document.querySelector('input[name="visual_test"]:checked')?.value || 'standard';
  const cognitiveVal = document.querySelector('input[name="cognitive_test"]:checked')?.value || 'dense';

  let personaName = "Standard Explorer Persona";
  let summary = "Balanced visual and text settings. Standard web layout supported.";
  let visualScore = "85/100";
  let cognitiveScore = "90/100";
  let motorScore = "95/100";

  let visualProfile = { highContrast: false, fontScale: 1.0, lineHeight: 1.6 };
  let cognitiveProfile = { dyslexicFont: false, simplifyText: false };
  let audioProfile = { enabled: true, speechRate: 1.0 };
  let motorProfile = { targetExpansion: false };

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
  const titleEl = document.getElementById('persona-title');
  const summaryEl = document.getElementById('persona-summary');
  const visualScoreEl = document.getElementById('visual-score-val');
  const cognitiveScoreEl = document.getElementById('cognitive-score-val');
  const motorScoreEl = document.getElementById('motor-score-val');

  if (titleEl) titleEl.innerText = personaName;
  if (summaryEl) summaryEl.innerText = summary;
  if (visualScoreEl) visualScoreEl.innerText = visualScore;
  if (cognitiveScoreEl) cognitiveScoreEl.innerText = cognitiveScore;
  if (motorScoreEl) motorScoreEl.innerText = motorScore;

  // Save generated profile globally
  window.generatedProfile = {
    personaName,
    summary,
    diagnosticScores: { visualScore, cognitiveScore, motorScore },
    visual: visualProfile,
    cognitive: cognitiveProfile,
    audio: audioProfile,
    motor: motorProfile
  };

  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: "generate_ui_preset",
      testResults: { visual: visualVal, cognitive: cognitiveVal }
    });
  }

  nextStep(4);
}

function saveProfileAndRedirect(destinationRelPath = 'demo/index.html') {
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

  function executeRedirect() {
    const msgEl = document.getElementById('success-message');
    const fallbackLink = document.getElementById('fallback-redirect-link');
    
    let targetUrl = `../${destinationRelPath}`;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      targetUrl = chrome.runtime.getURL(destinationRelPath);
    }

    if (fallbackLink) {
      fallbackLink.href = targetUrl;
    }

    if (msgEl) {
      msgEl.style.display = 'block';
    }

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1200);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(statePayload, () => {
      console.log("[AdaptAI Onboarding] Persona and onboarding state saved to chrome.storage.local:", statePayload);
      executeRedirect();
    });
  } else {
    localStorage.setItem('userProfile', JSON.stringify(profilePayload));
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('extensionEnabled', 'true');
    console.log("[AdaptAI Onboarding] Persona and onboarding state saved to localStorage:", statePayload);
    executeRedirect();
  }
}

// Form submit -> launches Demo Workbench
document.getElementById('profile-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  saveProfileAndRedirect('demo/index.html');
});
