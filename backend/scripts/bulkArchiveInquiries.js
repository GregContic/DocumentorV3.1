const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
require('dotenv').config();

const bulkArchiveCompletedInquiries = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
    
    // Find all inquiries with status "completed"
    const completedInquiries = await Inquiry.find({ status: 'completed' });
    console.log(`Found ${completedInquiries.length} inquiries with status "completed"`);
    
    if (completedInquiries.length === 0) {
      console.log('No inquiries with status "completed" found. Nothing to archive.');
      return { success: true, message: 'No inquiries to archive' };
    }
    
    // Log the completed inquiries for verification
    console.log('Completed inquiries to be archived:');
    completedInquiries.forEach((inquiry, index) => {
      console.log(`${index + 1}. ID: ${inquiry._id}, Message: "${inquiry.message.substring(0, 50)}...", Created: ${inquiry.createdAt}`);
    });
    
    // Archive all completed inquiries
    const result = await Inquiry.updateMany(
      { status: 'completed' },
      {
        $set: {
          status: 'archived',
          archivedAt: new Date(),
          resolvedAt: { $ifNull: ['$resolvedAt', new Date()] },
          resolvedBy: { $ifNull: ['$resolvedBy', 'Bulk Archive Migration'] }
        }
      }
    );
    
    console.log(`\n✅ Successfully archived ${result.modifiedCount} inquiries!`);
    console.log('All completed inquiries have been moved to archived status.');
    
    // Verify the results
    const archivedCount = await Inquiry.countDocuments({ status: 'archived' });
    const completedCountAfter = await Inquiry.countDocuments({ status: 'completed' });
    
    console.log(`\nVerification:`);
    console.log(`- Total archived inquiries: ${archivedCount}`);
    console.log(`- Remaining completed inquiries: ${completedCountAfter}`);
    
    return { 
      success: true, 
      message: `Archived ${result.modifiedCount} inquiries successfully`,
      archivedCount: result.modifiedCount
    };
    
  } catch (error) {
    console.error('❌ Error archiving inquiries:', error.message);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  bulkArchiveCompletedInquiries()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
      } else {
        console.log('\n💥 Migration failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = bulkArchiveCompletedInquiries;
