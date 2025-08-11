const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
require('dotenv').config();

const checkInquiryStatus = async () => {
  try {
    console.log('🔍 Checking inquiry status in database...\n');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get count of inquiries by status
    const statusCounts = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    console.log('📊 Inquiry Status Summary:');
    console.log('===========================');
    
    let totalInquiries = 0;
    statusCounts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
      totalInquiries += item.count;
    });
    
    console.log(`\nTotal inquiries: ${totalInquiries}\n`);
    
    // Show detailed info for completed inquiries
    const completedInquiries = await Inquiry.find({ status: 'completed' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    if (completedInquiries.length > 0) {
      console.log('🚨 Found inquiries with status "completed":');
      console.log('==========================================');
      completedInquiries.forEach((inquiry, index) => {
        const userName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : 'Unknown User';
        const userEmail = inquiry.user ? inquiry.user.email : 'No email';
        console.log(`${index + 1}. ID: ${inquiry._id}`);
        console.log(`   User: ${userName} (${userEmail})`);
        console.log(`   Message: "${inquiry.message.substring(0, 80)}..."`);
        console.log(`   Created: ${inquiry.createdAt}`);
        console.log(`   Status: ${inquiry.status}\n`);
      });
      console.log(`👆 These ${completedInquiries.length} inquiries should be archived.`);
    } else {
      console.log('✅ No inquiries with status "completed" found.');
    }
    
    // Show recent archived inquiries
    const archivedInquiries = await Inquiry.find({ status: 'archived' })
      .populate('user', 'firstName lastName email')
      .sort({ archivedAt: -1 })
      .limit(5);
    
    if (archivedInquiries.length > 0) {
      console.log('\n📋 Recent archived inquiries (last 5):');
      console.log('=====================================');
      archivedInquiries.forEach((inquiry, index) => {
        const userName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : 'Unknown User';
        console.log(`${index + 1}. ${userName} - "${inquiry.message.substring(0, 50)}..."`);
        console.log(`   Archived: ${inquiry.archivedAt}`);
        console.log(`   Resolved by: ${inquiry.resolvedBy || 'Unknown'}\n`);
      });
    }
    
    return { success: true, completedCount: completedInquiries.length };
    
  } catch (error) {
    console.error('❌ Error checking inquiry status:', error.message);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  checkInquiryStatus()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Status check completed!');
        if (result.completedCount > 0) {
          console.log(`\n💡 Run the migration script to archive ${result.completedCount} completed inquiries.`);
        }
        process.exit(0);
      } else {
        console.log('\n💥 Status check failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = checkInquiryStatus;
