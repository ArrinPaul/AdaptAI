const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log(' Running Phase 0 Verification Test Suite');
console.log('==================================================\n');

let errors = 0;

// Test 1: Contract JSON Schema Validation
try {
  const contractPath = path.join(__dirname, '..', 'contract', 'contract.json');
  if (!fs.existsSync(contractPath)) {
    throw new Error('contract/contract.json does not exist');
  }
  const contractRaw = fs.readFileSync(contractPath, 'utf8');
  const contract = JSON.parse(contractRaw);
  
  if (!contract.requestSchema || !contract.responseSchema) {
    throw new Error('Contract JSON missing requestSchema or responseSchema');
  }

  const reqProperties = Object.keys(contract.requestSchema.properties);
  const respProperties = Object.keys(contract.responseSchema.properties);

  console.log('✅ Test 1 Passed: Contract JSON Schema is valid.');
  console.log(`   - Request fields: ${reqProperties.join(', ')}`);
  console.log(`   - Response fields: ${respProperties.join(', ')}`);
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  errors++;
}

// Test 2: Gemini API Key Verification
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    console.log('✅ Test 2 Passed: GEMINI_API_KEY environment variable detected.');
  } else {
    console.log('⚠️ Test 2 Warning: GEMINI_API_KEY environment variable is not set yet.');
    console.log('   (Set process.env.GEMINI_API_KEY or provide in .env before running Module 2 AI backend)');
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  errors++;
}

// Test 3: Demo Page Inspection
try {
  const demoPath = path.join(__dirname, '..', 'demo', 'index.html');
  if (!fs.existsSync(demoPath)) {
    throw new Error('demo/index.html does not exist');
  }
  const demoHtml = fs.readFileSync(demoPath, 'utf8');
  
  const requiredSelectors = ['animated-banner', 'top-nav', 'headline', 'dense-paragraph', 'tiny-btn', 'demo-img'];
  const missingSelectors = requiredSelectors.filter(sel => !demoHtml.includes(sel));

  if (missingSelectors.length > 0) {
    throw new Error(`Demo page missing expected element classes/ids: ${missingSelectors.join(', ')}`);
  }

  console.log('✅ Test 3 Passed: Demo page contains all expected inaccessible elements.');
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  errors++;
}

console.log('\n==================================================');
if (errors === 0) {
  console.log(' 🎉 PHASE 0 QUALITY GATE PASSED! Ready for Phase 1 & 3.');
  console.log('==================================================');
  process.exit(0);
} else {
  console.error(` 💥 PHASE 0 FAILED with ${errors} error(s).`);
  console.log('==================================================');
  process.exit(1);
}
