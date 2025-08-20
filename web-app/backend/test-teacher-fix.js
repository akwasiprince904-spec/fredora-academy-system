const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testTeacherOperations() {
  try {
    console.log('🧪 Testing Teacher Operations...\n');

    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);

    // 2. Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin@fredora.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Get existing teachers
    console.log('\n3. Getting existing teachers...');
    const teachersResponse = await axios.get(`${BASE_URL}/api/users/teachers`, { headers });
    console.log(`✅ Found ${teachersResponse.data.data.length} teachers`);

    // 4. Get classes
    console.log('\n4. Getting classes...');
    const classesResponse = await axios.get(`${BASE_URL}/api/classes`, { headers });
    console.log(`✅ Found ${classesResponse.data.data.length} classes`);

    // 5. Create a new teacher
    console.log('\n5. Creating a new teacher...');
    const newTeacher = {
      username: 'testteacher',
      email: 'testteacher@fredora.com',
      name: 'Test Teacher',
      password: 'test123',
      phone: '1234567890',
      address: 'Test Address'
    };

    const createTeacherResponse = await axios.post(`${BASE_URL}/api/users/teachers`, newTeacher, { headers });
    console.log('✅ Teacher created successfully:', createTeacherResponse.data.data.name);

    const teacherId = createTeacherResponse.data.data.id;

    // 6. Assign classes to the new teacher
    console.log('\n6. Assigning classes to teacher...');
    const classIds = classesResponse.data.data.slice(0, 2).map(c => c.id); // Assign first 2 classes
    console.log(`Assigning classes: ${classIds.join(', ')}`);

    const assignResponse = await axios.post(`${BASE_URL}/api/users/teachers/${teacherId}/classes`, {
      class_ids: classIds
    }, { headers });

    console.log('✅ Classes assigned successfully');
    console.log('Assigned classes:', assignResponse.data.data.assigned_classes.map(c => c.name));

    // 7. Get teacher with assignments
    console.log('\n7. Getting teacher with assignments...');
    const teacherWithAssignmentsResponse = await axios.get(`${BASE_URL}/api/users/teachers/with-assignments`, { headers });
    const teacherWithAssignments = teacherWithAssignmentsResponse.data.data.find(t => t.id === teacherId);
    console.log('✅ Teacher assignments retrieved');
    console.log(`Teacher: ${teacherWithAssignments.name}`);
    console.log(`Assigned classes: ${teacherWithAssignments.assigned_classes.map(c => c.name).join(', ')}`);

    // 8. Test assigning classes to another teacher (if exists)
    if (teachersResponse.data.data.length > 0) {
      console.log('\n8. Testing class assignment to existing teacher...');
      const existingTeacher = teachersResponse.data.data[0];
      console.log(`Testing with teacher: ${existingTeacher.name}`);

      const existingTeacherAssignResponse = await axios.post(`${BASE_URL}/api/users/teachers/${existingTeacher.id}/classes`, {
        class_ids: [classIds[0]] // Assign one class
      }, { headers });

      console.log('✅ Classes assigned to existing teacher successfully');
      console.log('Assigned classes:', existingTeacherAssignResponse.data.data.assigned_classes.map(c => c.name));
    }

    // 9. Test subjects
    console.log('\n9. Testing subjects...');
    const subjectsResponse = await axios.get(`${BASE_URL}/api/subjects`, { headers });
    console.log(`✅ Found ${subjectsResponse.data.data.length} subjects`);

    // 10. Create a new subject
    console.log('\n10. Creating a new subject...');
    const newSubject = {
      name: 'Test Subject',
      description: 'A test subject for verification'
    };

    const createSubjectResponse = await axios.post(`${BASE_URL}/api/subjects`, newSubject, { headers });
    console.log('✅ Subject created successfully:', createSubjectResponse.data.data.name);

    console.log('\n🎉 All tests passed! The teacher and class assignment functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testTeacherOperations();
