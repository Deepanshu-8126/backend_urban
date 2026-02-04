#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE INTELLIGENCE SYSTEM TEST
 * Tests all 15 modules + network + database
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

console.log('\n' + '='.repeat(80));
console.log('🔍 COMPREHENSIVE SYSTEM VERIFICATION');
console.log('='.repeat(80) + '\n');

// All 15 Intelligence Module Endpoints
const tests = [
    // Core Modules (1-6)
    { id: 1, name: 'Urban Memory - Insights', path: '/api/v1/intelligence/memory/insights', critical: true },
    { id: 2, name: 'Silent Problems - Active', path: '/api/v1/intelligence/silent/active', critical: true },
    { id: 3, name: 'Urban DNA - Risk Map', path: '/api/v1/intelligence/dna/risk-map', critical: true },
    { id: 4, name: 'Admin Load - Alerts', path: '/api/v1/intelligence/load/alerts', critical: true },
    { id: 5, name: 'Resilience - City', path: '/api/v1/intelligence/resilience/city', critical: true },
    { id: 6, name: 'Feedback - Improvements', path: '/api/v1/intelligence/feedback/improvements', critical: true },

    // Advanced Modules (7-15)
    { id: 7, name: 'Decision Score - Metrics', path: '/api/v1/intelligence/advanced/decision/metrics', critical: true },
    { id: 8, name: 'Time Intelligence - Peaks', path: '/api/v1/intelligence/advanced/time/peaks?days=30', critical: true },
    { id: 9, name: 'Trust - City', path: '/api/v1/intelligence/advanced/trust/city', critical: true },
    { id: 10, name: 'Ethics - Audit', path: '/api/v1/intelligence/advanced/ethics/audit', critical: false },
    { id: 11, name: 'Anomaly - Active', path: '/api/v1/intelligence/advanced/anomaly/active', critical: true },
    { id: 12, name: 'Nervous System - Graph', path: '/api/v1/intelligence/advanced/nervous/graph?days=30', critical: true },
    { id: 13, name: 'Fatigue - City', path: '/api/v1/intelligence/advanced/fatigue/city', critical: true },
    { id: 14, name: 'Future Shadow - Trends', path: '/api/v1/intelligence/advanced/future/trends?days=30', critical: true },
    { id: 15, name: 'Consciousness - Health', path: '/api/v1/intelligence/advanced/consciousness?days=7', critical: true },

    // Master Dashboard
    { id: 16, name: '🎯 MASTER DASHBOARD', path: '/api/v1/intelligence/advanced/dashboard', critical: true },
];

let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

function testEndpoint(test) {
    return new Promise((resolve) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: test.path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);

                    if (res.statusCode === 200 && json.success !== false) {
                        console.log(`✅ Module ${test.id}: ${test.name}`);
                        console.log(`   Status: ${res.statusCode} OK`);

                        // Show key data
                        if (json.data) {
                            const keys = Object.keys(json.data).slice(0, 3);
                            console.log(`   Data: ${keys.join(', ')}`);
                        } else if (json.dashboard) {
                            console.log(`   Dashboard: Loaded successfully`);
                        }

                        passed++;
                        results.push({ ...test, status: 'PASS', code: res.statusCode });
                    } else {
                        if (test.critical) {
                            console.log(`❌ Module ${test.id}: ${test.name}`);
                            console.log(`   Status: ${res.statusCode}`);
                            console.log(`   Issue: ${json.message || json.error || 'No data'}`);
                            failed++;
                            results.push({ ...test, status: 'FAIL', code: res.statusCode });
                        } else {
                            console.log(`⚠️  Module ${test.id}: ${test.name}`);
                            console.log(`   Status: ${res.statusCode} (Non-critical)`);
                            warnings++;
                            results.push({ ...test, status: 'WARN', code: res.statusCode });
                        }
                    }
                } catch (e) {
                    console.log(`❌ Module ${test.id}: ${test.name}`);
                    console.log(`   Error: Invalid JSON response`);
                    failed++;
                    results.push({ ...test, status: 'FAIL', error: 'Invalid JSON' });
                }
                console.log('');
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`❌ Module ${test.id}: ${test.name}`);
            console.log(`   Error: ${e.message}`);
            failed++;
            results.push({ ...test, status: 'FAIL', error: e.message });
            console.log('');
            resolve();
        });

        req.on('timeout', () => {
            console.log(`⏱️  Module ${test.id}: ${test.name}`);
            console.log(`   Error: Request timeout`);
            failed++;
            results.push({ ...test, status: 'FAIL', error: 'Timeout' });
            req.destroy();
            console.log('');
            resolve();
        });

        req.end();
    });
}

async function runAllTests() {
    console.log('📡 Testing Network Connection...\n');

    for (const test of tests) {
        await testEndpoint(test);
    }

    console.log('='.repeat(80));
    console.log(`\n📊 FINAL RESULTS:\n`);
    console.log(`   ✅ Passed:   ${passed}`);
    console.log(`   ❌ Failed:   ${failed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   📦 Total:    ${tests.length}\n`);

    if (failed === 0) {
        console.log('🎉 ALL CRITICAL MODULES WORKING!');
        console.log('✅ Backend is ready for Flutter integration');
        console.log('\n📱 Next Steps:');
        console.log('   1. Update Flutter API service with correct IP');
        console.log('   2. Hot reload Flutter app');
        console.log('   3. Test Intelligence Dashboard\n');
    } else {
        console.log('⚠️  SOME MODULES NEED ATTENTION');
        console.log('\n🔧 Failed Modules:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`   - Module ${r.id}: ${r.name}`);
        });
        console.log('');
    }

    console.log('='.repeat(80) + '\n');

    // Return exit code
    process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(console.error);
