const axios = require('axios');

async function testBackendDatabase() {
  try {
    console.log('🔗 Testing backend database connection...');
    
    // Test if backend can access database
    const response = await axios.get('https://fredora-academy-system.onrender.com/api/users/teachers');
    console.log('✅ Backend database connection working');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Backend database test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 500 error - backend can\'t connect to database');
    }
  }
}

testBackendDatabase();