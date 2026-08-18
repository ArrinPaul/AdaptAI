document.addEventListener('DOMContentLoaded', () => {
  // Bind control buttons
  document.getElementById('btn-high-contrast')?.addEventListener('click', toggleHighContrast);
  document.getElementById('btn-dyslexic-font')?.addEventListener('click', toggleDyslexicFont);
  document.getElementById('btn-font-scale')?.addEventListener('click', toggleFontScaling);
  document.getElementById('btn-simplify-text')?.addEventListener('click', toggleTextSimplification);
  document.getElementById('btn-motor-targets')?.addEventListener('click', toggleMotorTargets);
  document.getElementById('btn-trigger-adaptation')?.addEventListener('click', triggerFullAdaptation);

  // Auto load stored profile preferences on demo page
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['userProfile'], (res) => {
      if (res && res.userProfile) {
        const p = res.userProfile;
        if (p.visual?.highContrast) toggleHighContrast();
        if (p.visual?.fontScale) document.documentElement.style.setProperty('--adapt-font-scale', p.visual.fontScale);
        if (p.cognitive?.dyslexicFont && typeof ensureDyslexicFont === 'function') ensureDyslexicFont(true);
        if (p.cognitive?.simplifyText) toggleTextSimplification();
        if (p.motor?.targetExpansion && typeof applyMotorAssist === 'function') applyMotorAssist(true);
      }
    });
  }

  // Bind navigation buttons for extension environment
  function navigateRel(targetRelPath) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      window.location.href = chrome.runtime.getURL(targetRelPath);
    } else {
      window.location.href = `../${targetRelPath}`;
    }
  }

  document.getElementById('link-landing')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateRel('index.html');
  });

  document.getElementById('link-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateRel('profile/profile.html');
  });

  document.getElementById('link-onboarding')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateRel('onboarding/onboarding.html');
  });
});

function toggleHighContrast() {
  const currentBg = document.documentElement.style.getPropertyValue('--adapt-bg-color');
  if (currentBg === '#121212') {
    document.documentElement.style.removeProperty('--adapt-bg-color');
    document.documentElement.style.removeProperty('--adapt-text-color');
  } else {
    document.documentElement.style.setProperty('--adapt-bg-color', '#121212');
    document.documentElement.style.setProperty('--adapt-text-color', '#ffff00');
  }
}

function toggleDyslexicFont() {
  if (typeof ensureDyslexicFont === 'function') {
    const isSet = document.documentElement.style.getPropertyValue('--adapt-font-family');
    ensureDyslexicFont(!isSet);
  }
}

function toggleFontScaling() {
  const currentScale = document.documentElement.style.getPropertyValue('--adapt-font-scale');
  if (currentScale === '1.4' || currentScale === '1.5') {
    document.documentElement.style.setProperty('--adapt-font-scale', '1.0');
  } else {
    document.documentElement.style.setProperty('--adapt-font-scale', '1.4');
  }
}

function toggleTextSimplification() {
  if (typeof applyTextSimplification === 'function') {
    applyTextSimplification([
      "✨ AI Summary 1: Enterprise performance boosted by 14% this quarter due to cloud infrastructure optimizations.",
      "✨ AI Summary 2: Autonomous software models automatically simplify complex webpage text for easy reading."
    ]);
  }
}

function toggleMotorTargets() {
  if (typeof applyMotorAssist === 'function') {
    const isAssist = document.body.classList.contains('adapt-motor-assist');
    applyMotorAssist(!isAssist);
  }
}

function triggerFullAdaptation() {
  if (typeof window.__runTrackATests === 'function') {
    window.__runTrackATests();
  } else if (typeof runFullTransformation === 'function') {
    runFullTransformation(typeof mockGeminiResponse !== 'undefined' ? mockGeminiResponse : null);
  }
}
