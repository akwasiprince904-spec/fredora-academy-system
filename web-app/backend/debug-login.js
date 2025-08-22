// Debug login step by step - 2025-08-21
const axios = require('axios');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login step by step...');
    
    // Step 1: Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('https://fredora-academy-system.onrender.com/health');
    console.log('✅ Health check passed');
    
    // Step 2: Test root endpoint
    console.log('\n2️⃣ Testing root endpoint...');
    const rootResponse = await axios.get('https://fredora-academy-system.onrender.com/');
    console.log('✅ Root endpoint working');
    
    // Step 3: Test auth endpoint structure
    console.log('\n3️⃣ Testing auth endpoint structure...');
    try {
      const authResponse = await axios.get('https://fredora-academy-system.onrender.com/api/auth/login');
      console.log('❌ Auth endpoint should not accept GET requests');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Auth endpoint correctly rejects GET requests');
      } else {
        console.log('⚠️ Unexpected response from auth endpoint');
      }
    }
    
    // Step 4: Test login with minimal data
    console.log('\n4️⃣ Testing login with minimal data...');
    const loginData = {
      username: 'admin@fredora.com',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request...');
    console.log('   Username:', loginData.username);
    console.log('   Password length:', loginData.password.length);
    
    const loginResponse = await axios.post('https://fredora-academy-system.onrender.com/api/auth/login', loginData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User:', loginResponse.data.user?.name);
    console.log('   Role:', loginResponse.data.user?.role);
    
  } catch (error) {
    console.error('\n❌ Debug failed:');
    console.log('   Error type:', error.name);
    console.log('   Error message:', error.message);
    console.log('   Status:', error.response?.status);
    console.log('   Status text:', error.response?.statusText);
    console.log('   Response data:', error.response?.data);
    
    if (error.code === 'ECONNABORTED') {
      console.log('   ⏰ Request timed out');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   🌐 DNS resolution failed');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   🔌 Connection refused');
    }
    
    // Try to get more details about the error
    if (error.response?.data?.message) {
      console.log('   Server message:', error.response.data.message);
    }
  }
}

debugLogin();
