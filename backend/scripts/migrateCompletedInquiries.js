const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
require('dotenv').config();

// Migration script to move all completed inquiries to archived status
const migrateCompletedInquiries = async () => {
  try {
    console.log('Starting migration of completed inquiries to archived status...');
    
    // Find all inquiries with status "completed"
    const completedInquiries = await Inquiry.find({ status: 'completed' });
    
    console.log(`Found ${completedInquiries.length} completed inquiries to migrate`);
    
    if (completedInquiries.length === 0) {
      console.log('No completed inquiries found. Migration not needed.');
      return;
    }
    
    // Update all completed inquiries to archived status
    const result = await Inquiry.updateMany(
      { status: 'completed' },
      {
        $set: {
          status: 'archived',
          archivedAt: new Date(),
          resolvedAt: { $ifNull: ['$resolvedAt', new Date()] },
          resolvedBy: { $ifNull: ['$resolvedBy', 'System Migration'] }
        }
      }
    );
    
    console.log(`Successfully migrated ${result.modifiedCount} inquiries to archived status`);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Only run if this script is executed directly
if (require.main === module) {
  // Connect to MongoDB
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';
  console.log('Connecting to MongoDB at:', mongoURI);
  
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateCompletedInquiries();
    })
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCompletedInquiries;
