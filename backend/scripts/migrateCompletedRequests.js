const mongoose = require('mongoose');
const DocumentRequest = require('../models/DocumentRequest');
require('dotenv').config();

const migrateCompletedRequests = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully');

    // Find all completed requests that are not archived
    const completedRequests = await DocumentRequest.find({
      status: 'completed',
      archived: { $ne: true }
    }).populate('user', 'firstName lastName email');

    console.log(`📋 Found ${completedRequests.length} completed document requests to archive`);

    if (completedRequests.length === 0) {
      console.log('✅ No completed requests found to migrate');
      return { success: true, message: 'No requests to archive' };
    }

    // Log the completed requests for verification
    console.log('\n📄 Completed document requests to be archived:');
    console.log('=============================================');
    completedRequests.forEach((request, index) => {
      const studentName = request.user ? `${request.user.firstName} ${request.user.lastName}` : 'Unknown Student';
      const email = request.user ? request.user.email : 'No email';
      console.log(`${index + 1}. ID: ${request._id.toString().slice(-8)}`);
      console.log(`   Student: ${studentName} (${email})`);
      console.log(`   Document: ${request.documentType}`);
      console.log(`   Purpose: ${request.purpose}`);
      console.log(`   Created: ${request.createdAt}`);
      console.log(`   Status: ${request.status}`);
      console.log('   ---');
    });

    // Archive all completed requests
    const result = await DocumentRequest.updateMany(
      {
        status: 'completed',
        archived: { $ne: true }
      },
      {
        $set: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: 'Migration Script',
          completedAt: { $ifNull: ['$completedAt', new Date()] }
        }
      }
    );

    console.log(`\n✅ Successfully archived ${result.modifiedCount} completed document requests!`);
    console.log('All completed document requests have been moved to archived status.');
    
    // Verify the results
    const archivedCount = await DocumentRequest.countDocuments({ archived: true });
    const completedCountAfter = await DocumentRequest.countDocuments({ 
      status: 'completed', 
      archived: { $ne: true } 
    });
    
    console.log(`\n📊 Verification:`);
    console.log(`- Total archived document requests: ${archivedCount}`);
    console.log(`- Remaining non-archived completed requests: ${completedCountAfter}`);
    
    return { 
      success: true, 
      message: `Archived ${result.modifiedCount} document requests successfully`,
      archivedCount: result.modifiedCount
    };
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  migrateCompletedRequests()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('✨ All completed document requests are now in the archive!');
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

module.exports = migrateCompletedRequests;
