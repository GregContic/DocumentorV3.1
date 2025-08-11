const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');

mongoose.connect('mongodb://localhost:27017/documentor');

const surnames = ['Binay-an', 'Banaryu', 'Contic', 'Evasco', 'Bantasan', 'Karpyo', 'Baligket', 'Tebia', 'Lacson', 'Gapoyan', 'Dagdagan', 'Bannawag', 'Tayaban', 'Dulnuan', 'Pangket', 'Gayudan', 'Olsim', 'Baculi', 'Calicdan', 'Palangdan'];
const firstNames = ['Jeffrey', 'James', 'Andrei', 'Gregson', 'Marcus', 'Ibrahim', 'Lamaica', 'Mae Ruth', 'Deborah', 'Yvonne', 'Zyra', 'Liam', 'Kurt', 'Harold', 'Althea', 'Zyrel', 'Brent', 'Ravien', 'Charlene', 'Daryll'];
const middleInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const totalStudents = 50;
const grades = ['7', '8', '9', '10', '11', '12'];
const strands = ['STEM', 'ABM', 'HUMSS', 'TVL'];

function randomLRN() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Distribute students equally to grades
const studentsPerGrade = Math.floor(totalStudents / grades.length); // 8 each
const gradeCounts = Object.fromEntries(grades.map(g => [g, 0]));
const strandCounts = Object.fromEntries(strands.map(s => [s, 0]));
const studentsPerStrand = Math.floor((totalStudents / 6) / strands.length); // 2 per strand per grade (11/12)

async function addEnrollments() {
  for (let i = 0; i < totalStudents; i++) {
    // Assign grade with equal distribution
    let grade;
    for (let g of grades) {
      if (gradeCounts[g] < studentsPerGrade) {
        grade = g;
        gradeCounts[g]++;
        break;
      }
    }

    // Assign strand only if grade is 11 or 12
    let track = '';
    if (grade === '11' || grade === '12') {
      for (let s of strands) {
        if (strandCounts[s] < studentsPerStrand * 2) { // x2 because both 11 and 12
          track = s;
          strandCounts[s]++;
          break;
        }
      }
    }

    const enrollment = new Enrollment({
      status: 'pending',
      enrollmentType: 'new',
      learnerReferenceNumber: randomLRN(),
      surname: getRandomItem(surnames),
      firstName: getRandomItem(firstNames),
      middleName: getRandomItem(middleInitials),
      gradeToEnroll: grade,
      track: track
    });

    await enrollment.save();
    console.log(`Added: ${enrollment.surname}, ${enrollment.firstName} ${enrollment.middleName}. - Grade ${grade} ${track}`);
  }

  mongoose.disconnect();
}

addEnrollments();
