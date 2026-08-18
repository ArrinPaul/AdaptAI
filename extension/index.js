document.addEventListener('DOMContentLoaded', () => {
  const originalText = "In the second quarter of fiscal year 2026, our enterprise recorded exponential algorithmic productivity increases, driven primarily by hyper-scaled cloud architecture deployments and automated cross-domain data synchronization pipelines.";
  const simplifiedText = "✨ AI Simplified: Cloud systems boosted performance by 14% this quarter through automated software optimizations.";

  function toggleContrast(btn) {
    btn.classList.toggle('active');
    document.getElementById('sandbox-box').classList.toggle('high-contrast');
  }

  function toggleDyslexic(btn) {
    btn.classList.toggle('active');
    document.getElementById('sandbox-box').classList.toggle('dyslexic');
  }

  function toggleScale(btn) {
    btn.classList.toggle('active');
    const box = document.getElementById('sandbox-box');
    if (btn.classList.contains('active')) {
      box.style.fontSize = '1.3em';
    } else {
      box.style.fontSize = '1em';
    }
  }

  function toggleSimplify(btn) {
    btn.classList.toggle('active');
    const desc = document.getElementById('sandbox-desc');
    if (btn.classList.contains('active')) {
      desc.innerText = simplifiedText;
    } else {
      desc.innerText = originalText;
    }
  }

  // Bind sandbox controls
  document.getElementById('btn-sandbox-contrast')?.addEventListener('click', function() { toggleContrast(this); });
  document.getElementById('btn-sandbox-dyslexic')?.addEventListener('click', function() { toggleDyslexic(this); });
  document.getElementById('btn-sandbox-scale')?.addEventListener('click', function() { toggleScale(this); });
  document.getElementById('btn-sandbox-simplify')?.addEventListener('click', function() { toggleSimplify(this); });

  // Dynamic Navigation Routing for Extension
  function navigateTo(targetRel) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      window.location.href = chrome.runtime.getURL(targetRel);
    } else {
      window.location.href = targetRel;
    }
  }

  document.getElementById('nav-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('profile/profile.html');
  });

  document.getElementById('nav-onboarding')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('onboarding/onboarding.html');
  });

  document.getElementById('nav-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('demo/index.html');
  });

  document.getElementById('hero-onboarding')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('onboarding/onboarding.html');
  });

  document.getElementById('hero-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('demo/index.html');
  });
});
