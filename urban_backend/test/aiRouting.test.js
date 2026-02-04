const path = require('path');
const ComplaintAnalyzer = require('../src/ai/complaintAnalyzer');

// Test cases for AI routing
const testCases = [
  {
    title: 'Water pipe burst near my house',
    description: 'Since morning no water supply and leakage on road',
    expected: 'water'
  },
  {
    title: 'Electricity cut off',
    description: 'Power has been cut for 3 hours today',
    expected: 'electricity'
  },
  {
    title: 'Pothole on main road',
    description: 'There is a big pothole causing accidents',
    expected: 'roads'
  },
  {
    title: 'Garbage collection',
    description: 'Waste is piling up in our area',
    expected: 'sanitation'
  },
  {
    title: 'Health facility',
    description: 'Doctor not available at health center',
    expected: 'health'
  },
  {
    title: 'General issue',
    description: 'Need help with something',
    expected: 'other'
  }
];

console.log('🧪 AI Routing Test Results:');
console.log('==========================');

let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  const result = ComplaintAnalyzer.analyze(testCase.title, testCase.description);
  const passed = result.department === testCase.expected;
  
  console.log(`${passed ? '✅' : '❌'} "${testCase.title}" → ${result.department} (expected: ${testCase.expected}) [${(result.confidence * 100).toFixed(1)}%]`);
  
  if (passed) passedTests++;
}

console.log('\n📊 Test Summary:');
console.log(`Passed: ${passedTests}/${totalTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! AI routing is working perfectly!');
} else {
  console.log('⚠️ Some tests failed. Check AI logic.');
}