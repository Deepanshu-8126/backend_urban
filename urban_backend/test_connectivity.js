const http = require('http');

const testEndpoints = async () => {
    console.log('=== BACKEND CONNECTIVITY TEST ===\n');

    // Test 1: Health endpoint
    await testEndpoint('localhost', 3000, '/', 'Health Check');

    // Test 2: Auth endpoint
    await testEndpoint('localhost', 3000, '/api/v1/auth/check-email', 'Auth Endpoint', 'POST', {
        email: 'admin@cityos.gov.in'
    });

    // Test 3: With LAN IP
    await testEndpoint('10.102.250.157', 3000, '/', 'Health (LAN IP)');
};

async function testEndpoint(host, port, path, name, method = 'GET', data = null) {
    return new Promise((resolve) => {
        console.log(`\nTesting: ${name}`);
        console.log(`URL: http://${host}:${port}${path}`);

        const options = {
            hostname: host,
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            console.log(`✅ Status: ${res.statusCode}`);

            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    console.log('Response:', JSON.stringify(json, null, 2));
                } catch (e) {
                    console.log('Response:', body);
                }
                resolve(true);
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ Timeout - No response');
            req.destroy();
            resolve(false);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

testEndpoints().then(() => {
    console.log('\n=== TEST COMPLETE ===');
    process.exit(0);
});
