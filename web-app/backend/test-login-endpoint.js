// Test login endpoint - 2025-08-21
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing login endpoint...');
    
    // Test health check first
    const healthResponse = await axios.get('https://fredora-academy-system.onrender.com/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test login with admin credentials
    const loginData = {
      username: 'admin@fredora.com',
      password: 'admin123'
    };
    
    console.log('🔐 Testing login with admin credentials...');
    const loginResponse = await axios.post('https://fredora-academy-system.onrender.com/api/auth/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Role:', loginResponse.data.user.role);
    console.log('   Token received:', !!loginResponse.data.token);
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Status Text:', error.response?.statusText);
    console.log('   Data:', error.response?.data);
    console.log('   Message:', error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 500 error - check backend logs');
    } else if (error.response?.status === 502) {
      console.log('🔍 502 error - backend service not starting');
    }
  }
}

testLogin();
