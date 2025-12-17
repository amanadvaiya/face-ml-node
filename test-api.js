const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

async function testFaceComparisonAPI() {
  console.log('Testing Face Comparison API...\n');

  // Test health endpoint
  console.log('1. Testing health endpoint...');
  const http = require('http');

  const healthReq = http.get('http://localhost:3000/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Health Check Response:', JSON.parse(data));
      console.log('\n✓ Health endpoint working!\n');
    });
  });

  healthReq.on('error', (err) => {
    console.error('Error:', err.message);
  });
}

testFaceComparisonAPI().catch(console.error);
