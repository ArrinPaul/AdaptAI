// Load saved profile if available
document.addEventListener('DOMContentLoaded', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['userProfile'], (result) => {
            if (result.userProfile) {
                const p = result.userProfile;
                if (p.visual) {
                    document.getElementById('high-contrast').checked = !!p.visual.highContrast;
                    document.getElementById('large-text').checked = p.visual.fontScale > 1.1;
                }
                if (p.cognitive) {
                    document.getElementById('dyslexic-font').checked = !!p.cognitive.dyslexicFont;
                    document.getElementById('simplify-text').checked = !!p.cognitive.simplifyText;
                }
                if (p.audio) {
                    document.getElementById('enable-audio').checked = !!p.audio.enabled;
                }
                console.log("Restored saved profile:", p);
            }
        });
    }
});

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

    function handleSuccessRedirect() {
        const msgEl = document.getElementById('success-message');
        if (msgEl) msgEl.style.display = 'block';
        
        // Redirect to demo page after 1.5 seconds
        setTimeout(() => {
            if (window.location.protocol.startsWith('http')) {
                window.location.href = '/demo/index.html';
            } else if (typeof chrome !== 'undefined' && chrome.tabs) {
                window.location.href = '../../demo/index.html';
            } else {
                window.location.href = '../../demo/index.html';
            }
        }, 1500);
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ userProfile: profile }, () => {
            console.log("Profile saved to chrome.storage.local:", profile);
            handleSuccessRedirect();
        });
    } else {
        // Fallback for non-extension environment testing
        localStorage.setItem('userProfile', JSON.stringify(profile));
        console.log("Profile saved to localStorage fallback:", profile);
        handleSuccessRedirect();
    }
});


