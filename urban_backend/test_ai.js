const ComplaintAnalyzer = require('./src/utils/complaintAnalyzer');

const testCases = [
    { title: "Power Cut", desc: "Mera electricity supply nhi aa raha hey", expected: "electricity" },
    { title: "Bijli Cut", desc: "Pichle 2 ghante se bijli nahi hai", expected: "electricity" },
    { title: "No Water", desc: "Paani ki supply band hai", expected: "water" },
    { title: "Road Issue", desc: "Sadak par gadda hai", expected: "roads" }
];

console.log("🚀 Starting AI Categorization Verification...\n");

testCases.forEach((tc, index) => {
    const result = ComplaintAnalyzer.analyze(tc.title, tc.desc);
    const passed = result.category === tc.expected;
    console.log(`[Test ${index + 1}] Input: "${tc.title}" - ${tc.desc}`);
    console.log(`Expected: ${tc.expected} | Got: ${result.category}`);
    console.log(passed ? "✅ PASSED" : "❌ FAILED");
    console.log("-----------------------------------\n");
});
