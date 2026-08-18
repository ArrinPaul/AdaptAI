document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById('trigger-adapt');
  if (!triggerBtn) return;

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
});
