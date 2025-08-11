const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test enrollment submission
async function testEnrollment() {
  try {
    const testData = {
      enrollmentType: "new",
      learnerReferenceNumber: "224457872",
      surname: "Denesia",
      firstName: "Harry",
      middleName: "Contic",
      extension: "",
      dateOfBirth: "2004-11-25T00:00:00.000Z",
      placeOfBirth: "La Trinidad",
      sex: "Male",
      age: "",
      religion: "Roman Catholic",
      citizenship: "Filipino",
      houseNumber: "BC08",
      street: "",
      barangay: "Central Beckel",
      city: "La Trinidad",
      province: "Benguet",
      zipCode: "2601",
      contactNumber: "0938948904",
      emailAddress: "",
      lastSchoolAttended: "University of the Cordilleras",
      schoolAddress: "Baguio",
      gradeLevel: "Grade 12",
      schoolYear: "2020-2022",
      fatherName: "Retarded NIgga",
      fatherOccupation: "",
      fatherContactNumber: "",
      motherName: "Merlyn G. Contic",
      motherOccupation: "",
      motherContactNumber: "",
      guardianName: "",
      guardianRelationship: "",
      guardianContactNumber: "",
      emergencyContactName: "Merlyn G. Contic",
      emergencyContactRelationship: "",
      emergencyContactNumber: "09389498904",
      emergencyContactAddress: "",
      gradeToEnroll: "Grade 12",
      track: "Technical-Vocational-Livelihood",
      form137: true,
      form138: true,
      goodMoral: false,
      medicalCertificate: false,
      parentId: false,
      idPictures: false,
      specialNeeds: "",
      allergies: "",
      medications: "",
      agreementAccepted: true
    };

    console.log('Testing enrollment with data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/enrollments', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-test'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testEnrollment();
