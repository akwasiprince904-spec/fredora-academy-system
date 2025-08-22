const axios = require('axios');

async function testLoginDetailed() {
  try {
    console.log('   Testing login with detailed error...');
    
    const response = await axios.post('https://fredora-academy-system.onrender.com/api/auth/login', {
      username: 'admin@fredora.com',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testLoginDetailed();