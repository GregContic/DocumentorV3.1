const mongoose = require('mongoose');
const Section = require('./models/Section');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

async function testSectionFunctionality() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/document-system');
    console.log('Connected to MongoDB');

    // Test 1: Create a section
    console.log('\n=== Test 1: Creating a section ===');
    const testSection = new Section({
      name: 'A',
      gradeLevel: 'Grade 7',
      adviser: 'John Doe',
      capacity: 40
    });
    
    try {
      await testSection.save();
      console.log('✅ Section created successfully:', testSection.name, testSection.gradeLevel);
    } catch (err) {
      if (err.code === 11000) {
        console.log('✅ Section already exists (expected if running multiple times)');
      } else {
        console.error('❌ Error creating section:', err.message);
      }
    }

    // Test 2: Fetch sections by grade level
    console.log('\n=== Test 2: Fetching sections by grade level ===');
    const gradeVariants = ['Grade 7', '7', 'grade 7'];
    
    for (const grade of gradeVariants) {
      const gradeNum = grade.replace(/grade\s*/i, '').trim();
      const gradeSearchVariants = [
        grade, // Original (e.g., "Grade 7")
        gradeNum,   // Just number (e.g., "7")
        `Grade ${gradeNum}`, // Standardized format
      ];
      
      const sections = await Section.find({
        $or: gradeSearchVariants.map(variant => ({
          gradeLevel: { $regex: `^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, $options: 'i' }
        }))
      });
      
      console.log(`🔍 Searching for '${grade}' -> Found ${sections.length} sections`);
    }

    // Test 3: Create a test user and enrollment
    console.log('\n=== Test 3: Creating test enrollment ===');
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student@example.com',
      password: 'password123',
      role: 'user' // Changed from 'student' to 'user'
    });
    
    let savedUser;
    try {
      savedUser = await testUser.save();
      console.log('✅ Test user created');
    } catch (err) {
      if (err.code === 11000) {
        savedUser = await User.findOne({ email: 'test.student@example.com' });
        console.log('✅ Test user already exists');
      } else {
        console.error('❌ Error creating user:', err.message);
        return;
      }
    }

    const testEnrollment = new Enrollment({
      user: savedUser._id,
      enrollmentType: 'new',
      learnerReferenceNumber: 'LRN123456789',
      surname: 'Student',
      firstName: 'Test',
      gradeToEnroll: 'Grade 7',
      status: 'approved',
      section: 'A',
      agreementAccepted: true
    });
    
    try {
      await testEnrollment.save();
      console.log('✅ Test enrollment created');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✅ Test enrollment already exists');
      } else {
        console.error('❌ Error creating enrollment:', err.message);
      }
    }

    // Test 4: Fetch enrollments by section
    console.log('\n=== Test 4: Fetching enrollments by section ===');
    const sectionName = 'A';
    const gradeLevel = 'Grade 7';
    
    const raw = sectionName.trim();
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactRegex = new RegExp(`^\\s*${escaped}\\s*$`, 'i');
    
    const query = {
      section: { $regex: exactRegex }
    };
    
    if (gradeLevel) {
      const gradeVariants = [];
      const cleanGrade = gradeLevel.replace(/^grade\s*/i, '').trim();
      gradeVariants.push(cleanGrade);
      gradeVariants.push(`Grade ${cleanGrade}`);
      gradeVariants.push(gradeLevel);
      
      query.gradeToEnroll = {
        $in: gradeVariants.map(variant => new RegExp(`^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'))
      };
    }
    
    console.log('Query used:', JSON.stringify(query, null, 2));
    
    const enrollments = await Enrollment.find(query)
      .populate('user', 'firstName lastName email');
    
    console.log(`🔍 Found ${enrollments.length} enrollments for section '${sectionName}' grade '${gradeLevel}'`);
    enrollments.forEach(e => {
      console.log(`  - ${e.firstName} ${e.surname} (${e.status}) - Grade: ${e.gradeToEnroll}, Section: ${e.section}`);
    });

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSectionFunctionality();
