const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const enrolled = await Enrollment.find({ status: 'enrolled' }).lean();
    console.log(`Enrollments with status 'enrolled': ${enrolled.length}`);
    enrolled.forEach(e => console.log(` - ${e._id} | section:"${e.section || 'NO_SECTION'}" | gradeToEnroll:"${e.gradeToEnroll || 'MISSING'}" | gradeLevel:"${e.gradeLevel || 'MISSING'}"`));

    const anyWithSection = await Enrollment.find({ section: { $exists: true, $ne: '' } }).lean();
    console.log(`\nEnrollments with any non-empty section (${anyWithSection.length}):`);
    anyWithSection.forEach(e => console.log(` - ${e._id} | status:"${e.status}" | section:"${e.section}"`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error querying enrollments:', err);
    process.exit(1);
  }
})();
