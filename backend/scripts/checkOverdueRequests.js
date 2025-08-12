const mongoose = require('mongoose');
const DocumentRequest = require('../models/DocumentRequest');
const notificationService = require('../utils/notificationService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/documentorv3');

async function checkOverdueRequests() {
  try {
    console.log('Checking for overdue requests...');
    
    const now = new Date();
    const overdueRequests = await DocumentRequest.find({
      estimatedCompletionDate: { $lt: now },
      status: { $nin: ['completed', 'rejected'] },
      archived: { $ne: true }
    }).populate('user', 'firstName lastName email');
    
    if (overdueRequests.length > 0) {
      console.log(`Found ${overdueRequests.length} overdue requests`);
      
      // Send notification to admins
      await notificationService.notifyOverdueRequests(overdueRequests);
      
      // Update priority to high for overdue requests
      await DocumentRequest.updateMany(
        {
          estimatedCompletionDate: { $lt: now },
          status: { $nin: ['completed', 'rejected'] },
          archived: { $ne: true },
          priority: { $ne: 'urgent' }
        },
        { priority: 'high' }
      );
      
      console.log('Overdue notifications sent and priorities updated');
    } else {
      console.log('No overdue requests found');
    }
  } catch (error) {
    console.error('Error checking overdue requests:', error);
  }
}

// Run the check
checkOverdueRequests().then(() => {
  mongoose.disconnect();
  process.exit(0);
});

module.exports = checkOverdueRequests;
