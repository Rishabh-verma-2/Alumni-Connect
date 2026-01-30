import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api/v1';

async function testServer() {
  console.log('🧪 Testing Alumni Connect Backend...\n');
  
  try {
    // Test basic server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/test`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData.message);
    
    // Test alumni endpoint
    console.log('\n2. Testing alumni endpoint...');
    const alumniResponse = await fetch(`${BASE_URL}/alumni`);
    const alumniData = await alumniResponse.json();
    console.log('✅ Alumni endpoint:', alumniData.status, `(${alumniData.results || 0} alumni found)`);
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5001');
  }
}

testServer();