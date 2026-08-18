require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API Connectivity...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY is not set in environment or .env file.');
    console.log('   To test live Gemini API calls, place GEMINI_API_KEY=your_key in module2-ai/.env');
    return false;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Respond with JSON: {"status": "ok"}');
    const text = result.response.text();
    console.log('✅ Gemini API Response received:', text.trim());
    return true;
  } catch (err) {
    console.error('❌ Gemini API Test Call Failed:', err.message);
    return false;
  }
}

if (require.main === module) {
  testGeminiAPI();
}

module.exports = { testGeminiAPI };
