const Inquiry = require('../models/Inquiry');

// Student: Create an inquiry
exports.createInquiry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { message } = req.body;

    // Additional safety check - should be caught by middleware but extra protection
    if (userRole === 'admin') {
      return res.status(403).json({ 
        message: 'Admins are not allowed to submit inquiries. Please use the admin dashboard to manage inquiries instead.',
        error: 'ADMIN_SUBMISSION_FORBIDDEN'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        message: 'Inquiry message is required',
        error: 'MISSING_MESSAGE'
      });
    }

    const inquiry = new Inquiry({ 
      user: userId, 
      message: message.trim(),
      userRole: userRole // Store user role for audit purposes
    });
    
    await inquiry.save();
    res.status(201).json({ 
      message: 'Inquiry submitted successfully', 
      inquiry: {
        _id: inquiry._id,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: inquiry.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Error creating inquiry' });
  }
};

// Student: Get my inquiries
exports.getMyInquiries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Additional safety check - should be caught by middleware but extra protection
    if (userRole === 'admin') {
      return res.status(403).json({ 
        message: 'Admins cannot access user inquiry dashboard. Please use the admin dashboard instead.',
        error: 'ADMIN_ACCESS_FORBIDDEN'
      });
    }

    const inquiries = await Inquiry.find({ user: userId, status: { $ne: 'archived' } })
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
};

// Admin: Get all inquiries (excluding archived)
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ status: { $ne: 'archived' } })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching all inquiries:', error);
    res.status(500).json({ message: 'Error fetching all inquiries' });
  }
};

// Admin: Get archived inquiries
exports.getArchivedInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ status: 'archived' })
      .populate('user', 'firstName lastName email')
      .sort({ archivedAt: -1 });
    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  } catch (error) {
    console.error('Error fetching archived inquiries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching archived inquiries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Archive an inquiry
exports.archiveInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const inquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      { 
        status: 'archived',
        archivedAt: new Date()
      },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json(inquiry);
  } catch (error) {
    console.error('Error archiving inquiry:', error);
    res.status(500).json({ message: 'Error archiving inquiry' });
  }
};

// Admin: Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, rejectionReason, reviewNotes } = req.body;
    const currentDate = new Date();
    
    let update = {
      status,
      reviewedBy: req.user.userId,
      reviewedAt: currentDate
    };

    // Add rejection reason if status is rejected
    if (status === 'rejected' && rejectionReason) {
      update.rejectionReason = rejectionReason;
    }

    // Add review notes if provided
    if (reviewNotes) {
      update.reviewNotes = reviewNotes;
    }
    
    // Handle different status updates
    if (status === 'resolved') {
      update.resolvedAt = currentDate;
      update.resolvedBy = req.user.name || req.user.email;
    } else if (status === 'completed') {
      // When status is set to "completed", automatically archive the inquiry
      update.status = 'archived';
      update.archivedAt = currentDate;
      update.resolvedAt = currentDate;
      update.resolvedBy = req.user.name || req.user.email;
    } else if (status === 'archived') {
      update.archivedAt = currentDate;
      if (!update.resolvedAt) {
        update.resolvedAt = currentDate;
        update.resolvedBy = req.user.name || req.user.email;
      }
    }
    
    const inquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      update,
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('reviewedBy', 'firstName lastName');
    
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    res.json({
      success: true,
      message: status === 'completed' ? 'Inquiry completed and archived successfully' : 'Inquiry status updated successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: 'Error updating inquiry status' });
  }
};

// Admin: Reply to inquiry
exports.replyToInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { message, repliedBy } = req.body;
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    inquiry.replies.push({ message, repliedBy });
    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    res.status(500).json({ message: 'Error replying to inquiry' });
  }
};

// Admin: Restore archived inquiry
exports.restoreInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    if (inquiry.status !== 'archived') {
      return res.status(400).json({ message: 'Inquiry is not archived' });
    }
    
    inquiry.status = 'pending'; // or whatever the default status should be
    inquiry.archivedAt = undefined;
    await inquiry.save();
    
    res.json({
      message: 'Inquiry restored successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error restoring inquiry:', error);
    res.status(500).json({ message: 'Error restoring inquiry' });
  }
};

// Admin: Bulk archive completed inquiries
exports.bulkArchiveCompletedInquiries = async (req, res) => {
  try {
    // Find all inquiries with status "completed"
    const completedInquiries = await Inquiry.find({ status: 'completed' });
    
    if (completedInquiries.length === 0) {
      return res.json({
        success: true,
        message: 'No completed inquiries found to archive',
        archivedCount: 0
      });
    }
    
    // Archive all completed inquiries
    const result = await Inquiry.updateMany(
      { status: 'completed' },
      {
        $set: {
          status: 'archived',
          archivedAt: new Date(),
          resolvedAt: { $ifNull: ['$resolvedAt', new Date()] },
          resolvedBy: { $ifNull: ['$resolvedBy', req.user.name || req.user.email || 'Admin'] }
        }
      }
    );
    
    res.json({
      success: true,
      message: `Successfully archived ${result.modifiedCount} completed inquiries`,
      archivedCount: result.modifiedCount,
      totalFound: completedInquiries.length
    });
  } catch (error) {
    console.error('Error bulk archiving completed inquiries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error archiving completed inquiries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
