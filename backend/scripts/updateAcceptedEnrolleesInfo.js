const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');

mongoose.connect('mongodb://localhost:27017/documentor');

// La Trinidad barangays around Central Beckel
const barangays = [
  'Central Beckel',
  'Pico',
  'Betag',
  'Balili',
  'Lubas',
  'Km 3',
  'Km 4',
  'Km 5',
  'Poblacion',
  'Cruz'
];

// School IDs for La Trinidad schools
const schools = [
  { name: 'Benguet State University Laboratory Elementary School', id: '102001' },
  { name: 'Pico Elementary School', id: '102002' },
  { name: 'Betag Elementary School', id: '102003' },
  { name: 'La Trinidad Elementary School', id: '102004' },
  { name: 'Balili Elementary School', id: '102005' },
  { name: 'La Trinidad National High School', id: '102006' },
  { name: 'Benguet State University Laboratory High School', id: '102007' },
  { name: 'Cordillera Regional Science High School', id: '102008' }
];

// Parent names pool
const parentNames = [
  'Maria Santos', 'Jose Garcia', 'Elena Cruz', 'Ricardo Reyes',
  'Carmen Flores', 'Antonio Torres', 'Rosa Navarro', 'Manuel Castro',
  'Lucia Ramos', 'Pedro Martinez', 'Ana Rivera', 'Juan Mendoza',
  'Teresa Lopez', 'Francisco Gomez', 'Sofia Rodriguez', 'Miguel Angeles'
];

// Relationships
const relationships = ['Mother', 'Father', 'Guardian', 'Aunt', 'Uncle', 'Grandmother', 'Grandfather'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateHouseNumber() {
  const numbers = Math.floor(Math.random() * 300) + 1;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  return `${numbers}${Math.random() > 0.7 ? getRandomItem(letters) : ''}`;
}

function generatePhoneNumber() {
  const prefixes = ['0915', '0917', '0918', '0919', '0920', '0921', '0945', '0955'];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return getRandomItem(prefixes) + suffix;
}

function generateEmail(firstName, surname) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const normalizedName = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const normalizedSurname = surname.toLowerCase().replace(/[^a-z]/g, '');
  return `${normalizedName}.${normalizedSurname}@${getRandomItem(domains)}`;
}

function calculateBirthdate(gradeLevel) {
  const currentYear = 2025;
  let age;
  
  // Calculate approximate age based on grade level
  switch(gradeLevel) {
    case 'Grade 7': age = 12; break;
    case 'Grade 8': age = 13; break;
    case 'Grade 9': age = 14; break;
    case 'Grade 10': age = 15; break;
    case 'Grade 11': age = 16; break;
    case 'Grade 12': age = 17; break;
    default: age = 15;
  }

  // Add some variation (-1 to +1 year)
  age += Math.floor(Math.random() * 3) - 1;

  const birthYear = currentYear - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid invalid dates

  return new Date(birthYear, birthMonth - 1, birthDay);
}

async function updateAcceptedEnrollees() {
  try {
    const acceptedEnrollees = await Enrollment.find({ status: 'approved' });
    console.log(`Found ${acceptedEnrollees.length} accepted enrollees to update`);

    for (const enrollee of acceptedEnrollees) {
      // Pick a random school based on grade level
      const previousSchool = getRandomItem(schools);
      
      // Generate parent/guardian info
      const parentName = getRandomItem(parentNames);
      const relationship = getRandomItem(relationships);
      
      // Update the enrollee
      const updates = {
        sex: Math.random() > 0.5 ? 'Male' : 'Female',
        dateOfBirth: calculateBirthdate(enrollee.gradeToEnroll),
        schoolYear: '2025-2026',
        houseNumber: generateHouseNumber(),
        barangay: getRandomItem(barangays),
        city: 'La Trinidad',
        province: 'Benguet',
        zipCode: '2601',
        contactNumber: generatePhoneNumber(),
        emailAddress: generateEmail(enrollee.firstName, enrollee.surname),
        guardianName: parentName,
        guardianRelationship: relationship,
        guardianContactNumber: generatePhoneNumber(),
        lastSchoolAttended: previousSchool.name,
        schoolId: previousSchool.id,
        schoolAddress: `${getRandomItem(barangays)}, La Trinidad, Benguet`
      };

      await Enrollment.findByIdAndUpdate(enrollee._id, updates);
      console.log(`Updated enrollee: ${enrollee.firstName} ${enrollee.surname}`);
    }

    console.log('Successfully updated all accepted enrollees');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating enrollees:', error);
    mongoose.disconnect();
  }
}

// Run the update
updateAcceptedEnrollees();
