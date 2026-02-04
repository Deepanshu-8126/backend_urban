// Quick Backend Health Test
const http = require('http');

console.log('Testing backend health...');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log(`✅ Backend responded with status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('❌ Backend connection failed:', error.message);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('❌ Backend timeout - server not responding');
    req.destroy();
    process.exit(1);
});

req.end();
