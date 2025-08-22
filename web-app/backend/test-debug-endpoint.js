// Test debug endpoint on Render - 2025-08-21
const axios = require('axios');

async function testDebugEndpoint() {
  try {
    console.log('🔍 Testing debug endpoint on Render...');
    
    const response = await axios.get('https://fredora-academy-system.onrender.com/debug-db');
    
    console.log('✅ Debug endpoint working!');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Message:', response.data.message);
    console.log('   Database Client:', response.data.dbClient);
    console.log('   Timestamp:', response.data.timestamp);
    
  } catch (error) {
    console.error('❌ Debug endpoint failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message);
    console.log('   Error:', error.response?.data?.error);
    
    if (error.response?.status === 404) {
      console.log('   🔍 Endpoint not found - changes may not be deployed yet');
    }
  }
}

testDebugEndpoint();
