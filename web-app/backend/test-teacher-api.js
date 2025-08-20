const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'testteacher@fredora.com';
const TEST_USERNAME = 'testteacher';

async function testTeacherAPI() {
  try {
    console.log('🧪 Testing Teacher API endpoints...\n');

    // Step 1: Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health check passed:', healthResponse.data.message);
    console.log('');

    // Step 2: Test login to get admin token
    console.log('2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Admin login successful');
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('');

    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Test getting existing teachers
    console.log('3. Testing get teachers...');
    const teachersResponse = await authAxios.get('/api/users/teachers');
    console.log('   ✅ Found', teachersResponse.data.data.length, 'teachers');
    console.log('');

    // Step 4: Test getting classes
    console.log('4. Testing get classes...');
    const classesResponse = await authAxios.get('/api/classes');
    console.log('   ✅ Found', classesResponse.data.data.length, 'classes');
    console.log('');

    // Step 5: Test creating a new teacher
    console.log('5. Testing create teacher...');
    const newTeacherData = {
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      name: 'Test Teacher',
      password: 'testpass123',
      phone: '1234567890',
      address: 'Test Address'
    };

    const createTeacherResponse = await authAxios.post('/api/users/teachers', newTeacherData);
    console.log('   ✅ Teacher created successfully');
    console.log('   Teacher ID:', createTeacherResponse.data.data.id);
    console.log('');

    const teacherId = createTeacherResponse.data.data.id;

    // Step 6: Test assigning classes to teacher
    console.log('6. Testing assign classes to teacher...');
    const classIds = classesResponse.data.data.slice(0, 2).map(c => c.id); // Assign first 2 classes
    
    const assignClassesResponse = await authAxios.post(`/api/users/teachers/${teacherId}/classes`, {
      class_ids: classIds
    });
    console.log('   ✅ Classes assigned successfully');
    console.log('   Assigned classes:', assignClassesResponse.data.data.assigned_classes.length);
    console.log('');

    // Step 7: Test getting teacher with classes
    console.log('7. Testing get teacher with classes...');
    const teacherWithClassesResponse = await authAxios.get(`/api/users/teachers/${teacherId}/classes`);
    console.log('   ✅ Teacher classes retrieved');
    console.log('   Classes count:', teacherWithClassesResponse.data.data.assigned_classes.length);
    console.log('');

    // Step 8: Clean up - delete test teacher
    console.log('8. Cleaning up - deleting test teacher...');
    await authAxios.delete(`/api/users/teachers/${teacherId}`);
    console.log('   ✅ Test teacher deleted');
    console.log('');

    console.log('🎉 All tests passed successfully!');
    console.log('The teacher creation and class assignment APIs are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.error('Full error:', error);
  }
}

// Run the test
testTeacherAPI();
