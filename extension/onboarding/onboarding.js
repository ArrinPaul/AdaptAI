document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const profile = {
        visual: {
            highContrast: document.getElementById('high-contrast').checked,
            fontScale: document.getElementById('large-text').checked ? 1.5 : 1.0
        },
        cognitive: {
            dyslexicFont: document.getElementById('dyslexic-font').checked,
            simplifyText: document.getElementById('simplify-text').checked
        },
        audio: {
            enabled: document.getElementById('enable-audio').checked
        }
    };

    chrome.storage.local.set({ userProfile: profile }, () => {
        document.getElementById('success-message').style.display = 'block';
        console.log("Profile saved:", profile);
    });
});
