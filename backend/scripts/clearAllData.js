const mongoose = require('mongoose');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const DocumentRequest = require('../models/DocumentRequest');
const Form137Stub = require('../models/Form137Stub');
const Inquiry = require('../models/Inquiry');
const Conversation = require('../models/Conversation');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/documentorv3';

async function clearAllData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('Clearing users...');
    const usersDeleted = await User.deleteMany({});
    console.log(`Deleted ${usersDeleted.deletedCount} users`);

    console.log('Clearing enrollments...');
    const enrollmentsDeleted = await Enrollment.deleteMany({});
    console.log(`Deleted ${enrollmentsDeleted.deletedCount} enrollments`);

    console.log('Clearing document requests...');
    const documentsDeleted = await DocumentRequest.deleteMany({});
    console.log(`Deleted ${documentsDeleted.deletedCount} document requests`);

    console.log('Clearing form 137 stubs...');
    const stubsDeleted = await Form137Stub.deleteMany({});
    console.log(`Deleted ${stubsDeleted.deletedCount} form 137 stubs`);

    console.log('Clearing inquiries...');
    const inquiriesDeleted = await Inquiry.deleteMany({});
    console.log(`Deleted ${inquiriesDeleted.deletedCount} inquiries`);

    console.log('Clearing conversations...');
    const conversationsDeleted = await Conversation.deleteMany({});
    console.log(`Deleted ${conversationsDeleted.deletedCount} conversations`);

    // Clear uploaded files
    console.log('Clearing uploaded files...');
    const uploadsDir = path.join(__dirname, '../uploads');
    
    const clearDirectory = (dirPath) => {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            clearDirectory(filePath);
            // Only remove directory if it's not a main upload folder
            if (!['documents', 'enrollments'].includes(file)) {
              fs.rmdirSync(filePath);
            }
          } else {
            fs.unlinkSync(filePath);
          }
        });
      }
    };

    // Clear documents folder
    const documentsDir = path.join(uploadsDir, 'documents');
    if (fs.existsSync(documentsDir)) {
      clearDirectory(documentsDir);
      console.log('Cleared documents folder');
    }

    // Clear enrollments folder
    const enrollmentsDir = path.join(uploadsDir, 'enrollments');
    if (fs.existsSync(enrollmentsDir)) {
      clearDirectory(enrollmentsDir);
      console.log('Cleared enrollments folder');
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total records deleted:`);
    console.log(`- Users: ${usersDeleted.deletedCount}`);
    console.log(`- Enrollments: ${enrollmentsDeleted.deletedCount}`);
    console.log(`- Document Requests: ${documentsDeleted.deletedCount}`);
    console.log(`- Form 137 Stubs: ${stubsDeleted.deletedCount}`);
    console.log(`- Inquiries: ${inquiriesDeleted.deletedCount}`);
    console.log(`- Conversations: ${conversationsDeleted.deletedCount}`);
    console.log('- All uploaded files cleared');
    console.log('\nAll data has been successfully cleared!');

  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Confirm before running
console.log('⚠️  WARNING: This will permanently delete ALL data in the system!');
console.log('⚠️  This includes all users, enrollments, document requests, inquiries, and uploaded files.');
console.log('');

// Check for confirmation argument
if (process.argv.includes('--confirm')) {
  clearAllData();
} else {
  console.log('To confirm and proceed, run this script with --confirm flag:');
  console.log('node scripts/clearAllData.js --confirm');
  process.exit(0);
}
