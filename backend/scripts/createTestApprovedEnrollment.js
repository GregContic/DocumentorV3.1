const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/document-request-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestApprovedEnrollment = async () => {
  try {
    // Find a student user to test with
    const studentUser = await User.findOne({ role: 'student' });
    
    if (!studentUser) {
      console.log('No student user found. Please register as a student first.');
      return;
    }

    // Check if user already has an enrollment
    const existingEnrollment = await Enrollment.findOne({ user: studentUser._id });
    
    if (existingEnrollment) {
      // Update existing enrollment to approved status
      existingEnrollment.status = 'approved';
      existingEnrollment.reviewedAt = new Date();
      existingEnrollment.reviewNotes = 'Test approval for notification system';
      await existingEnrollment.save();
      
      console.log('✅ Updated existing enrollment to approved status');
      console.log(`Student: ${studentUser.firstName} ${studentUser.lastName}`);
      console.log(`Email: ${studentUser.email}`);
      console.log(`Enrollment Status: ${existingEnrollment.status}`);
    } else {
      // Create a new approved enrollment
      const newEnrollment = new Enrollment({
        user: studentUser._id,
        status: 'approved',
        enrollmentType: 'new',
        learnerReferenceNumber: 'LRN-TEST-123456789',
        surname: studentUser.lastName || 'Test',
        firstName: studentUser.firstName || 'Student',
        middleName: 'Middle',
        dateOfBirth: new Date('2000-01-01'),
        placeOfBirth: 'Test City',
        sex: 'Male',
        age: '24',
        religion: 'Catholic',
        citizenship: 'Filipino',
        houseNumber: '123',
        street: 'Test Street',
        barangay: 'Test Barangay',
        city: 'Test City',
        province: 'Test Province',
        zipCode: '1234',
        contactNumber: '09123456789',
        emailAddress: studentUser.email,
        lastSchoolAttended: 'Test High School',
        schoolAddress: 'Test School Address',
        gradeLevel: 'Grade 11',
        schoolYear: '2024-2025',
        fatherName: 'Test Father',
        fatherOccupation: 'Engineer',
        fatherContactNumber: '09111111111',
        motherName: 'Test Mother',
        motherOccupation: 'Teacher',
        motherContactNumber: '09222222222',
        guardianName: 'Test Guardian',
        guardianRelationship: 'Father',
        guardianOccupation: 'Engineer',
        guardianContactNumber: '09111111111',
        emergencyContactName: 'Test Emergency',
        emergencyContactRelationship: 'Uncle',
        emergencyContactNumber: '09333333333',
        reviewedAt: new Date(),
        reviewNotes: 'Test approval for notification system'
      });

      await newEnrollment.save();
      
      console.log('✅ Created new approved enrollment for testing');
      console.log(`Student: ${studentUser.firstName} ${studentUser.lastName}`);
      console.log(`Email: ${studentUser.email}`);
      console.log(`Enrollment ID: ${newEnrollment._id}`);
      console.log(`Enrollment Status: ${newEnrollment.status}`);
    }
    
    console.log('\n🔔 Now login with this student account to test the notification system!');
    
  } catch (error) {
    console.error('Error creating test enrollment:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestApprovedEnrollment();
