const axios = require('axios');

// Test script to verify API endpoints work correctly
async function testAPIEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing API Endpoints...\n');
  
  try {
    // Test 1: Login with existing admin user
    console.log('=== Test 1: Logging in with existing admin ===');
    const adminCredentials = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    let adminToken;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, adminCredentials);
      adminToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
      console.log('   Admin role:', loginResponse.data.user.role);
    } catch (err) {
      console.log('❌ Admin login failed:', err.response?.data?.message || err.message);
      return;
    }
    
    const authHeaders = { 'Authorization': `Bearer ${adminToken}` };
    
    // Test 2: Create sections for different grades
    console.log('\n=== Test 2: Creating sections ===');
    const sectionsToCreate = [
      { name: 'A', gradeLevel: 'Grade 7', adviser: 'Teacher A', capacity: 30 },
      { name: 'B', gradeLevel: 'Grade 7', adviser: 'Teacher B', capacity: 30 },
      { name: 'A', gradeLevel: 'Grade 8', adviser: 'Teacher C', capacity: 35 },
    ];
    
    for (const section of sectionsToCreate) {
      try {
        const response = await axios.post(`${baseURL}/sections`, section, { headers: authHeaders });
        console.log(`✅ Created section: ${section.name} - ${section.gradeLevel}`);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error?.includes('duplicate')) {
          console.log(`✅ Section ${section.name} - ${section.gradeLevel} already exists`);
        } else {
          console.log(`❌ Error creating section ${section.name} - ${section.gradeLevel}:`, err.response?.data?.error || err.message);
        }
      }
    }
    
    // Test 3: Fetch sections by grade level
    console.log('\n=== Test 3: Fetching sections by grade ===');
    const gradesToTest = ['Grade 7', '7', 'Grade 8'];
    
    for (const grade of gradesToTest) {
      try {
        const response = await axios.get(`${baseURL}/sections/grade/${encodeURIComponent(grade)}`, { headers: authHeaders });
        console.log(`✅ Grade '${grade}': Found ${response.data.length} sections`);
        response.data.forEach(section => {
          console.log(`   - ${section.name} (${section.gradeLevel})`);
        });
      } catch (err) {
        console.log(`❌ Error fetching sections for grade '${grade}':`, err.response?.data?.error || err.message);
      }
    }
    
    // Test 4: Create a test student and enrollment
    console.log('\n=== Test 4: Creating test student and enrollment ===');
    const studentData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@test.com',
      password: 'student123',
      role: 'user'
    };
    
    let studentToken;
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, studentData);
      console.log('✅ Student user created');
      
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: studentData.email,
        password: studentData.password
      });
      studentToken = loginResponse.data.token;
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.log('✅ Student user already exists, logging in...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: studentData.email,
          password: studentData.password
        });
        studentToken = loginResponse.data.token;
      } else {
        throw err;
      }
    }
    
    // Create enrollment as student
    const enrollmentData = {
      enrollmentType: 'new',
      learnerReferenceNumber: 'LRN987654321',
      surname: 'Doe',
      firstName: 'Jane',
      gradeToEnroll: 'Grade 7',
      agreementAccepted: true
    };
    
    let enrollmentId;
    try {
      const response = await axios.post(`${baseURL}/enrollments`, enrollmentData, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      enrollmentId = response.data.enrollment._id;
      console.log('✅ Enrollment created:', response.data.enrollmentNumber);
    } catch (err) {
      console.log('ℹ️ Enrollment might already exist, continuing...');
      // Try to get existing enrollment
      const response = await axios.get(`${baseURL}/enrollments/my-status`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      if (response.data.hasEnrollment) {
        enrollmentId = response.data.enrollment._id;
        console.log('✅ Using existing enrollment:', enrollmentId);
      }
    }
    
    // Test 5: Assign student to section (as admin)
    console.log('\n=== Test 5: Assigning student to section ===');
    if (enrollmentId) {
      try {
        const response = await axios.put(`${baseURL}/enrollments/${enrollmentId}/status`, {
          status: 'enrolled',
          section: 'A',
          reviewNotes: 'Assigned to section A for testing'
        }, { headers: authHeaders });
        
        console.log('✅ Student assigned to section A');
      } catch (err) {
        console.log('❌ Error assigning section:', err.response?.data?.message || err.message);
      }
    }
    
    // Test 6: Fetch students in section
    console.log('\n=== Test 6: Fetching students in section ===');
    try {
      const response = await axios.get(`${baseURL}/enrollments/by-section?section=A&gradeLevel=Grade 7`, { headers: authHeaders });
      console.log(`✅ Found ${response.data.length} students in section A, Grade 7`);
      response.data.forEach(student => {
        console.log(`   - ${student.firstName} ${student.surname} (${student.status})`);
      });
    } catch (err) {
      console.log('❌ Error fetching students in section:', err.response?.data?.message || err.message);
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if axios is available
try {
  testAPIEndpoints();
} catch (err) {
  console.log('❌ axios not available, skipping API tests');
  console.log('To install: npm install axios');
}
