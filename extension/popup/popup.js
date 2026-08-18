document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('master-toggle');
  const triggerBtn = document.getElementById('trigger-adapt');
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  const toggleDesc = document.getElementById('toggle-desc');
  const personaNameEl = document.getElementById('persona-name');

  // Load initial extension state & profile
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['extensionEnabled', 'onboardingCompleted', 'userProfile'], (res) => {
      const isEnabled = res.extensionEnabled !== false;
      const isCompleted = res.onboardingCompleted === true;
      const profile = res.userProfile;

      // Update UI toggle state
      if (masterToggle) masterToggle.checked = isEnabled;
      updateUIState(isEnabled);

      // Display active persona
      if (profile && profile.personaName) {
        if (personaNameEl) personaNameEl.innerText = profile.personaName;
      } else {
        if (personaNameEl) personaNameEl.innerText = "Default Assist Persona";
      }

      // If onboarding is incomplete, show CTA notice
      if (!isCompleted) {
        if (toggleDesc) toggleDesc.innerText = "Onboarding incomplete. Click to setup.";
      }
    });
  }

  // Handle Master ON/OFF Switch
  if (masterToggle) {
    masterToggle.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      updateUIState(isEnabled);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
          console.log("[AdaptAI Popup] Extension enabled status updated:", isEnabled);
        });
      }
    });
  }

  function updateUIState(isEnabled) {
    if (isEnabled) {
      if (statusBadge) statusBadge.className = 'status-badge';
      if (statusText) statusText.innerText = 'ON';
      if (toggleDesc) toggleDesc.innerText = 'DOM transformations active';
      if (triggerBtn) triggerBtn.disabled = false;
    } else {
      if (statusBadge) statusBadge.className = 'status-badge disabled';
      if (statusText) statusText.innerText = 'OFF';
      if (toggleDesc) toggleDesc.innerText = 'Extension paused';
      if (triggerBtn) triggerBtn.disabled = true;
    }
  }

  // Handle Adapt Page Trigger
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape_page" });
            window.close();
          }
        });
      }
    });
  }

  // Bind Chrome Extension Navigation Routing for all Popup Links
  const linkMappings = [
    { id: 'link-landing', path: 'index.html', fullUrl: '../index.html' },
    { id: 'link-onboarding', path: 'onboarding/onboarding.html', fullUrl: '../onboarding/onboarding.html' },
    { id: 'link-profile', path: 'profile/profile.html', fullUrl: '../profile/profile.html' },
    { id: 'link-demo', path: 'demo/index.html', fullUrl: '../demo/index.html' }
  ];

  linkMappings.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          const targetUrl = chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL(item.path) : item.fullUrl;
          chrome.tabs.create({ url: targetUrl });
        } else {
          window.open(item.fullUrl, '_blank');
        }
      });
    }
  });

  // Handle Long Click / Double Click interaction menu gesture
  let clickTimer = null;
  let clickCount = 0;
  const headerEl = document.querySelector('.header');

  if (headerEl) {
    headerEl.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 400);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        console.log("[AdaptAI Gesture] Double click detected. Launching profile center...");
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: chrome.runtime.getURL('profile/profile.html') });
        } else {
          window.open('../profile/profile.html', '_blank');
        }
      }
    });
  }
});


