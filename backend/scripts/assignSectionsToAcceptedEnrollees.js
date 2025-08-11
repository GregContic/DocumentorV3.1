// Assign all accepted enrollees to a section
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');

const SECTIONS_BY_GRADE = {
  '7': ['Section A', 'Section B'],
  '8': ['Section A', 'Section B'],
  '9': ['Section A', 'Section B'],
  '10': ['Section A', 'Section B'],
  '11': ['STEM', 'ABM', 'HUMSS', 'GAS'],
  '12': ['STEM', 'ABM', 'HUMSS', 'GAS'],
};

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';
  await mongoose.connect(MONGODB_URI);
  const accepted = await Enrollment.find({ status: 'approved' });
  let updated = 0;
  for (const enrollee of accepted) {
    const grade = String(enrollee.gradeToEnroll);
    const sections = SECTIONS_BY_GRADE[grade] || ['Section A'];
    // Assign section in round-robin fashion
    const section = sections[updated % sections.length];
    enrollee.section = section;
    await enrollee.save();
    console.log(`Assigned ${enrollee.firstName} ${enrollee.surname} (Grade ${enrollee.gradeToEnroll}) to ${section}`);
    updated++;
  }
  console.log(`\nAssigned sections to ${updated} accepted enrollees.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
