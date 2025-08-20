const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🧪 Testing Login Functionality...\n');

    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);

    // 2. Test login with admin credentials
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin@fredora.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('User data:', {
      id: loginResponse.data.user.id,
      username: loginResponse.data.user.username,
      name: loginResponse.data.user.name,
      role: loginResponse.data.user.role
    });

    // 3. Test login with username instead of email
    console.log('\n3. Testing admin login with username...');
    const loginResponse2 = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login with username successful!');
    console.log('User data:', {
      id: loginResponse2.data.user.id,
      username: loginResponse2.data.user.username,
      name: loginResponse2.data.user.name,
      role: loginResponse2.data.user.role
    });

    // 4. Test invalid credentials
    console.log('\n4. Testing invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin@fredora.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      console.log('✅ Correctly rejected invalid password');
      console.log('Error message:', error.response.data.message);
    }

    // 5. Test invalid username
    console.log('\n5. Testing invalid username...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'nonexistent@fredora.com',
        password: 'admin123'
      });
      console.log('❌ Should have failed with wrong username');
    } catch (error) {
      console.log('✅ Correctly rejected invalid username');
      console.log('Error message:', error.response.data.message);
    }

    console.log('\n🎉 All login tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first:');
      console.error('   node simple-test.js');
    }
  }
}

testLogin();
