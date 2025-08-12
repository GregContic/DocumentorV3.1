const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/document-request');
    
    console.log('Connected to MongoDB');
    
    // Find all admin users
    const adminUsers = await User.find({
      role: { $in: ['admin', 'super-admin', 'admin-document', 'admin-enrollment'] }
    }).select('firstName lastName email role');
    
    console.log('\n=== ADMIN USERS FOUND ===');
    if (adminUsers.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin users:', error);
    process.exit(1);
  }
};

checkAdminUsers();
