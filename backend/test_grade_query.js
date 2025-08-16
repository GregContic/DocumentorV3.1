const mongoose = require('mongoose');
const Section = require('./models/Section');

async function testGradeQuery() {
  try {
    await mongoose.connect('mongodb://localhost:27017/document-system');
    console.log('Connected to MongoDB');
    
    const gradeParam = '7';
    const gradeNum = gradeParam.replace(/grade\s*/i, '').trim();
    const gradeVariants = [gradeParam, gradeNum, `Grade ${gradeNum}`];
    
    console.log('Testing variants for gradeParam "7":', gradeVariants);
    
    // Test each variant individually
    for (const variant of gradeVariants) {
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^\\s*${escaped}\\s*$`, 'i');
      console.log(`\nSearching for variant "${variant}" with regex: ${regex}`);
      
      const sections = await Section.find({ gradeLevel: { $regex: regex } });
      console.log(`  Found ${sections.length} sections`);
      sections.forEach(s => console.log(`    - ${s.name} (${s.gradeLevel})`));
    }
    
    // Test the full OR query (as used in the API)
    console.log('\n=== Testing full OR query ===');
    const sections = await Section.find({
      $or: gradeVariants.map(variant => ({
        gradeLevel: { $regex: `^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, $options: 'i' }
      }))
    });
    
    console.log(`Full OR query found ${sections.length} sections`);
    sections.forEach(s => console.log(`  - ${s.name} (${s.gradeLevel})`));
    
    // Show all sections in database for comparison
    console.log('\n=== All sections in database ===');
    const allSections = await Section.find();
    allSections.forEach(s => console.log(`  - ${s.name} (${s.gradeLevel})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testGradeQuery();
