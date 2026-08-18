// content.js - Person A's Domain (DOM & UI)

// MOCK DATA FOR PARALLEL DEVELOPMENT
// Person A: Use this to test your CSS injection and Text Swapping without waiting for Gemini
const mockGeminiResponse = {
  cssUpdates: {
    "--adapt-font-scale": "1.5",
    "--adapt-bg-color": "#121212",
    "--adapt-text-color": "#e0e0e0"
  },
  simplifiedText: [
    "This is fake simplified text for paragraph 1.",
    "This is fake simplified text for paragraph 2."
  ]
};

// 1. Listen for instructions from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape_page") {
    // TODO (Person A): Write logic to grab text from h1, h2, p tags.
    // Limit to the first ~1500 chars to save tokens.
    const fakeScrapedText = "Fake text scraped from the DOM.";
    
    // Send it back to background.js
    chrome.runtime.sendMessage({ 
      action: "process_with_ai", 
      pageText: fakeScrapedText 
    });
  }
  
  if (request.action === "apply_transformations") {
    // This is where you receive the REAL data from Gemini (or your mock data for now)
    const data = request.data; // Change to `mockGeminiResponse` to test locally
    
    // TODO (Person A):
    // 1. Loop through data.cssUpdates and apply them to document.documentElement.style
    // 2. Loop through paragraphs and replace innerText with data.simplifiedText array
    console.log("Applying transformations...", data);
  }
});

// TODO (Person A): Inject the floating 🔊 and 🎤 buttons into the bottom corner of the webpage.
// Wire the 🔊 button to use window.speechSynthesis
