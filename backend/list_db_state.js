const mongoose = require('mongoose');
const Section = require('./models/Section');
const Enrollment = require('./models/Enrollment');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const sections = await Section.find({}).lean();
    console.log(`Sections (${sections.length}):`);
    sections.forEach(s => console.log(` - ${s._id} | name:"${s.name}" | gradeLevel:"${s.gradeLevel}" | adviser:"${s.adviser}" | capacity:${s.capacity}`));

    const enrollments = await Enrollment.find({}).populate('user', 'firstName lastName email').lean();
    console.log(`\nEnrollments (${enrollments.length}):`);
    enrollments.slice(0, 20).forEach(e => {
      console.log(` - ${e._id} | status:"${e.status}" | section:"${e.section || 'NO_SECTION'}" | gradeToEnroll:"${e.gradeToEnroll || 'MISSING'}" | gradeLevel:"${e.gradeLevel || 'MISSING'}" | user:${e.user ? e.user.firstName+' '+e.user.lastName+'('+e.user.email+')' : 'MISSING'}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error listing DB state:', err);
    process.exit(1);
  }
})();
