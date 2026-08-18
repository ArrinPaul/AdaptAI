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

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ userProfile: profile }, () => {
            document.getElementById('success-message').style.display = 'block';
            console.log("Profile saved to chrome.storage.local:", profile);
        });
    } else {
        // Fallback for non-extension environment testing
        localStorage.setItem('userProfile', JSON.stringify(profile));
        document.getElementById('success-message').style.display = 'block';
        console.log("Profile saved to localStorage fallback:", profile);
    }
});

