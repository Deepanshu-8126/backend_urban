/**
 * QUICK TEST SCRIPT FOR CITY INTELLIGENCE LAYER
 * Run this to verify all modules are working
 */

const baseUrl = 'http://localhost:3000/api/v1/intelligence';

console.log('🧪 Testing City Intelligence Layer...\n');

// Test 1: Consciousness (simplest endpoint)
console.log('1️⃣ Testing Urban Consciousness...');
fetch(`${baseUrl}/advanced/consciousness?days=7`)
    .then(res => res.json())
    .then(data => {
        console.log('✅ Consciousness:', data.data?.summary || data);
    })
    .catch(err => console.error('❌ Consciousness failed:', err.message));

// Test 2: Master Dashboard
console.log('\n2️⃣ Testing Master Dashboard...');
fetch(`${baseUrl}/advanced/dashboard`)
    .then(res => res.json())
    .then(data => {
        console.log('✅ Dashboard loaded successfully');
        console.log('   - Consciousness:', data.dashboard?.consciousness?.health || 'N/A');
        console.log('   - Trust:', data.dashboard?.trust?.avgTrust || 'N/A');
        console.log('   - Fatigue:', data.dashboard?.fatigue?.avgFatigue || 'N/A');
    })
    .catch(err => console.error('❌ Dashboard failed:', err.message));

// Test 3: Time Intelligence
console.log('\n3️⃣ Testing Time Intelligence...');
fetch(`${baseUrl}/advanced/time/peaks?days=30`)
    .then(res => res.json())
    .then(data => {
        console.log('✅ Peak hours:', data.data?.peakHours || data);
    })
    .catch(err => console.error('❌ Time Intelligence failed:', err.message));

// Test 4: Anomaly Detection
console.log('\n4️⃣ Testing Anomaly Detection...');
fetch(`${baseUrl}/advanced/anomaly/active`)
    .then(res => res.json())
    .then(data => {
        console.log('✅ Active anomalies:', data.data?.count || 0);
    })
    .catch(err => console.error('❌ Anomaly detection failed:', err.message));

console.log('\n⏳ Tests running... (check results above)\n');

setTimeout(() => {
    console.log('✅ All tests completed!');
    console.log('\n📚 Full API documentation: INTELLIGENCE_API.md');
    console.log('🎯 Next steps:');
    console.log('   1. Run: curl http://localhost:3000/api/v1/intelligence/advanced/consciousness');
    console.log('   2. Run: curl http://localhost:3000/api/v1/intelligence/advanced/dashboard');
    console.log('   3. Sync data: curl -X POST http://localhost:3000/api/v1/intelligence/memory/sync');
}, 3000);
