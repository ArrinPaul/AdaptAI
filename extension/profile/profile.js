// profile.js - AdaptAI Profile & Persona Settings Controller

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements - Persona Info
  const personaDisplayName = document.getElementById('persona-display-name');
  const personaDisplayDesc = document.getElementById('persona-display-desc');
  const scoreVisual = document.getElementById('score-visual');
  const scoreCognitive = document.getElementById('score-cognitive');
  const scoreMotor = document.getElementById('score-motor');

  // UI Elements - Form Inputs
  const toggleHighContrast = document.getElementById('toggle-high-contrast');
  const rangeFontScale = document.getElementById('range-font-scale');
  const fontScaleValue = document.getElementById('font-scale-value');
  const rangeLineHeight = document.getElementById('range-line-height');
  const lineHeightValue = document.getElementById('line-height-value');
  const toggleDyslexicFont = document.getElementById('toggle-dyslexic-font');
  const toggleSimplifyText = document.getElementById('toggle-simplify-text');
  const toggleMotorAssist = document.getElementById('toggle-motor-assist');
  const toggleAudioEnabled = document.getElementById('toggle-audio-enabled');
  const rangeSpeechRate = document.getElementById('range-speech-rate');
  const speechRateValue = document.getElementById('speech-rate-value');

  // Preview Box
  const previewBox = document.getElementById('preview-box');
  const previewTitle = document.getElementById('preview-title');
  const previewText = document.getElementById('preview-text');

  // Form & Actions
  const settingsForm = document.getElementById('settings-form');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  const saveToast = document.getElementById('save-toast');

  let currentProfile = getDefaultProfile();

  // Load Saved Profile from Storage
  loadProfile();

  function getDefaultProfile() {
    return {
      personaName: "Standard Accessibility Persona",
      summary: "Balanced visual and text settings. Standard web layout supported.",
      diagnosticScores: {
        visualScore: "85/100",
        cognitiveScore: "90/100",
        motorScore: "95/100"
      },
      visual: {
        highContrast: false,
        fontScale: 1.0,
        lineHeight: 1.6
      },
      cognitive: {
        dyslexicFont: false,
        simplifyText: false
      },
      audio: {
        enabled: true,
        speechRate: 1.0
      },
      motor: {
        targetExpansion: false
      }
    };
  }

  function loadProfile() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userProfile'], (res) => {
        if (res && res.userProfile) {
          currentProfile = Object.assign(getDefaultProfile(), res.userProfile);
        }
        applyProfileToUI(currentProfile);
      });
    } else {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        try {
          currentProfile = Object.assign(getDefaultProfile(), JSON.parse(stored));
        } catch (e) {
          console.warn("Error parsing stored userProfile", e);
        }
      }
      applyProfileToUI(currentProfile);
    }
  }

  function applyProfileToUI(p) {
    if (!p) return;

    // Persona display
    if (personaDisplayName) personaDisplayName.innerText = p.personaName || "Custom Persona";
    if (personaDisplayDesc) personaDisplayDesc.innerText = p.summary || "Configured profile preferences.";
    if (scoreVisual && p.diagnosticScores?.visualScore) scoreVisual.innerText = p.diagnosticScores.visualScore;
    if (scoreCognitive && p.diagnosticScores?.cognitiveScore) scoreCognitive.innerText = p.diagnosticScores.cognitiveScore;
    if (scoreMotor && p.diagnosticScores?.motorScore) scoreMotor.innerText = p.diagnosticScores.motorScore;

    // Visual
    if (toggleHighContrast) toggleHighContrast.checked = Boolean(p.visual?.highContrast);
    if (rangeFontScale) {
      const scale = p.visual?.fontScale || 1.0;
      rangeFontScale.value = scale;
      if (fontScaleValue) fontScaleValue.innerText = `${scale}x`;
    }
    if (rangeLineHeight) {
      const lh = p.visual?.lineHeight || 1.6;
      rangeLineHeight.value = lh;
      if (lineHeightValue) lineHeightValue.innerText = `${lh}`;
    }

    // Cognitive
    if (toggleDyslexicFont) toggleDyslexicFont.checked = Boolean(p.cognitive?.dyslexicFont);
    if (toggleSimplifyText) toggleSimplifyText.checked = Boolean(p.cognitive?.simplifyText);

    // Motor & Audio
    if (toggleMotorAssist) toggleMotorAssist.checked = Boolean(p.motor?.targetExpansion || p.audio?.enabled);
    if (toggleAudioEnabled) toggleAudioEnabled.checked = Boolean(p.audio?.enabled !== false);
    if (rangeSpeechRate) {
      const rate = p.audio?.speechRate || 1.0;
      rangeSpeechRate.value = rate;
      if (speechRateValue) speechRateValue.innerText = `${rate}x`;
    }

    updateLivePreview();
  }

  function updateLivePreview() {
    if (!previewBox) return;

    const isHighContrast = toggleHighContrast?.checked;
    const fontScale = rangeFontScale?.value || 1.0;
    const lineHeight = rangeLineHeight?.value || 1.6;
    const isDyslexic = toggleDyslexicFont?.checked;
    const isSimplify = toggleSimplifyText?.checked;
    const isMotor = toggleMotorAssist?.checked;

    // High Contrast
    if (isHighContrast) {
      previewBox.classList.add('high-contrast');
    } else {
      previewBox.classList.remove('high-contrast');
    }

    // Dyslexic
    if (isDyslexic) {
      previewBox.classList.add('dyslexic');
    } else {
      previewBox.classList.remove('dyslexic');
    }

    // Motor assist
    if (isMotor) {
      previewBox.classList.add('motor-assist');
    } else {
      previewBox.classList.remove('motor-assist');
    }

    // Font Scale & Line Height
    previewBox.style.fontSize = `calc(13px * ${fontScale})`;
    previewBox.style.lineHeight = `${lineHeight}`;

    // Text Simplification preview
    if (previewText) {
      if (isSimplify) {
        previewText.innerText = "✨ AI Simplified: AdaptAI automatically transforms typography, contrast, and layout complexity for fast, effortless comprehension.";
      } else {
        previewText.innerText = "Real-time DOM transformations dynamically adapt typography, contrast, and cognitive readability according to your profile.";
      }
    }
  }

  // Real-time Event Listeners for Preview
  if (toggleHighContrast) toggleHighContrast.addEventListener('change', updateLivePreview);
  if (toggleDyslexicFont) toggleDyslexicFont.addEventListener('change', updateLivePreview);
  if (toggleSimplifyText) toggleSimplifyText.addEventListener('change', updateLivePreview);
  if (toggleMotorAssist) toggleMotorAssist.addEventListener('change', updateLivePreview);
  
  if (rangeFontScale) {
    rangeFontScale.addEventListener('input', (e) => {
      if (fontScaleValue) fontScaleValue.innerText = `${e.target.value}x`;
      updateLivePreview();
    });
  }

  if (rangeLineHeight) {
    rangeLineHeight.addEventListener('input', (e) => {
      if (lineHeightValue) lineHeightValue.innerText = `${e.target.value}`;
      updateLivePreview();
    });
  }

  if (rangeSpeechRate) {
    rangeSpeechRate.addEventListener('input', (e) => {
      if (speechRateValue) speechRateValue.innerText = `${e.target.value}x`;
    });
  }

  // Save Settings
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedProfile = {
        personaName: currentProfile.personaName || "Custom Persona",
        summary: currentProfile.summary || "Personalized accessibility settings.",
        diagnosticScores: currentProfile.diagnosticScores || {
          visualScore: "85/100",
          cognitiveScore: "90/100",
          motorScore: "95/100"
        },
        visual: {
          highContrast: Boolean(toggleHighContrast?.checked),
          fontScale: parseFloat(rangeFontScale?.value || 1.0),
          lineHeight: parseFloat(rangeLineHeight?.value || 1.6)
        },
        cognitive: {
          dyslexicFont: Boolean(toggleDyslexicFont?.checked),
          simplifyText: Boolean(toggleSimplifyText?.checked)
        },
        motor: {
          targetExpansion: Boolean(toggleMotorAssist?.checked)
        },
        audio: {
          enabled: Boolean(toggleAudioEnabled?.checked),
          speechRate: parseFloat(rangeSpeechRate?.value || 1.0)
        }
      };

      currentProfile = updatedProfile;

      const payload = {
        userProfile: updatedProfile,
        onboardingCompleted: true,
        extensionEnabled: true
      };

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(payload, () => {
          console.log("[AdaptAI Profile] Profile successfully saved to chrome.storage.local:", payload);
          showSaveToast();
        });
      } else {
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        localStorage.setItem('onboardingCompleted', 'true');
        console.log("[AdaptAI Profile] Profile saved to localStorage:", payload);
        showSaveToast();
      }
    });
  }

  function showSaveToast() {
    if (saveToast) {
      saveToast.style.display = 'block';
      setTimeout(() => {
        saveToast.style.display = 'none';
      }, 3000);
    }
  }

  // Reset Defaults
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      const defaults = getDefaultProfile();
      currentProfile = defaults;
      applyProfileToUI(defaults);
      showSaveToast();
    });
  }

  // Universal Navigation Routing Helper
  function navigateTo(targetRelPath) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const extUrl = chrome.runtime.getURL(targetRelPath);
      window.location.href = extUrl;
    } else {
      window.location.href = `../${targetRelPath}`;
    }
  }

  // Bind Navigation Links
  const navLanding = document.getElementById('nav-landing');
  const navOnboarding = document.getElementById('nav-onboarding');
  const navDemo = document.getElementById('nav-demo');
  const btnRetakeTest = document.getElementById('btn-retake-test');
  const btnOpenDemo = document.getElementById('btn-open-demo');

  if (navLanding) {
    navLanding.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('index.html');
    });
  }

  if (navOnboarding) {
    navOnboarding.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('onboarding/onboarding.html');
    });
  }

  if (navDemo) {
    navDemo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('demo/index.html');
    });
  }

  if (btnRetakeTest) {
    btnRetakeTest.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('onboarding/onboarding.html');
    });
  }

  if (btnOpenDemo) {
    btnOpenDemo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('demo/index.html');
    });
  }
});
