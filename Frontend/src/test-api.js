// Quick API test - run this in browser console
const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test 1: Basic server health
    const healthResponse = await fetch('http://localhost:5001/api/v1/test');
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData);
    
    // Test 2: Alumni endpoint without auth
    const alumniResponse = await fetch('http://localhost:5001/api/v1/alumni');
    const alumniData = await alumniResponse.json();
    console.log('✅ Alumni data:', alumniData);
    
    // Test 3: With auth token (if available)
    const token = localStorage.getItem('token');
    if (token) {
      const authResponse = await fetch('http://localhost:5001/api/v1/alumni', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const authData = await authResponse.json();
      console.log('✅ Alumni data with auth:', authData);
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

// Run the test
testAPI();