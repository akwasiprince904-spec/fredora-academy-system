const axios = require('axios');

async function testBackendLogin() {
  try {
    console.log('🔗 Testing backend login...');
    
    // Test health endpoint
    const healthResponse = await axios.get('https://fredora-academy-system.onrender.com/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login endpoint
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post('https://fredora-academy-system.onrender.com/api/auth/login', {
      username: 'admin@fredora.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.user);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 500 error - check backend logs');
    }
  }
}

testBackendLogin();