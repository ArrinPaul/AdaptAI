// background.js - Person B's Domain (API & Logic)

// MOCK DATA FOR PARALLEL DEVELOPMENT
// Person B: Use this to test your Gemini API calls without waiting for Person A
const mockScrapedText = "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.";
const mockUserProfile = { 
  visual: { highContrast: true, fontScale: 1.5 },
  cognitive: { simplifyText: true }
};

// 1. Open onboarding page on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'onboarding/onboarding.html' });
  }
});

// 2. Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Tell content script to scrape the page
  chrome.tabs.sendMessage(tab.id, { action: "scrape_page" });
});

// 3. Listen for the scraped text from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "process_with_ai") {
    console.log("Received scraped text from content.js:", request.pageText);
    
    // TODO (Person B): 
    // 1. chrome.storage.local.get() the user profile.
    // 2. Combine profile and request.pageText into a Gemini prompt.
    // 3. Make the fetch() call to Gemini API using Structured Outputs.
    // 4. Send the resulting JSON back to the tab using chrome.tabs.sendMessage(sender.tab.id, { action: "apply_transformations", data: geminiJson });
    
    // For now, let's just log so Person B knows the pipe is connected.
    console.log("Waiting for Gemini Integration...");
  }
});
