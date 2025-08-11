const DocumentRequest = require('../models/DocumentRequest');
const User = require('../models/User');

// User: Create a new document request
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestData = {
      user: userId,
      ...req.body // This will include all the form fields from the frontend
    };
    
    const request = new DocumentRequest(requestData);
    await request.save();
    res.status(201).json({ 
      message: 'Request submitted successfully', 
      request: {
        id: request._id,
        documentType: request.documentType,
        status: request.status,
        createdAt: request.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ 
      message: 'Error creating request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// User: Get my requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Ensure the user can only access their own requests
    const requests = await DocumentRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance
    
    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// User: Get a specific request by ID (only if it belongs to the user)
exports.getRequestById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    
    // Find request that belongs to the authenticated user
    const request = await DocumentRequest.findOne({ 
      _id: requestId, 
      user: userId 
    }).lean();
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Get all requests (excluding archived)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ archived: { $ne: true } })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Error fetching all requests' });
  }
};

// Admin: Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason, reviewNotes } = req.body;
    
    const updateData = { 
      status,
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };
    
    // If status is being set to completed, also set completedAt and auto-archive
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.archived = true;
      updateData.archivedAt = new Date();
      updateData.archivedBy = req.user.email || 'Admin';
    }
    
    // If status is being set to rejected, store rejection reason
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    // Store review notes if provided
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }
    
    const request = await DocumentRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    res.json({
      success: true,
      message: status === 'completed' ? 'Request completed and archived successfully' : 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status' });
  }
};

// Admin: Get archived requests
exports.getArchivedRequests = async (req, res) => {
  try {
    const archivedRequests = await DocumentRequest.find({ archived: true })
      .populate('user', 'firstName lastName email')
      .sort({ archivedAt: -1 });
    res.json({
      success: true,
      data: archivedRequests,
      count: archivedRequests.length
    });
  } catch (error) {
    console.error('Error fetching archived requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching archived requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Archive a request manually
exports.archiveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await DocumentRequest.findByIdAndUpdate(
      requestId,
      {
        archived: true,
        archivedAt: new Date(),
        archivedBy: req.user.email || 'Admin'
      },
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Request archived successfully',
      request
    });
  } catch (error) {
    console.error('Error archiving request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error archiving request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Restore archived request
exports.restoreArchivedRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await DocumentRequest.findByIdAndUpdate(
      requestId,
      {
        archived: false,
        archivedAt: null,
        archivedBy: null
      },
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Request restored successfully',
      request
    });
  } catch (error) {
    console.error('Error restoring request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error restoring request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Bulk archive completed document requests
exports.bulkArchiveCompletedRequests = async (req, res) => {
  try {
    // Find all document requests with status "completed" that are not yet archived
    const completedRequests = await DocumentRequest.find({ 
      status: 'completed', 
      archived: { $ne: true } 
    });
    
    if (completedRequests.length === 0) {
      return res.json({
        success: true,
        message: 'No completed document requests found to archive',
        archivedCount: 0
      });
    }
    
    // Archive all completed document requests
    const result = await DocumentRequest.updateMany(
      { status: 'completed', archived: { $ne: true } },
      {
        $set: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: req.user.email || req.user.name || 'Admin',
          completedAt: { $ifNull: ['$completedAt', new Date()] }
        }
      }
    );
    
    res.json({
      success: true,
      message: `Successfully archived ${result.modifiedCount} completed document requests`,
      archivedCount: result.modifiedCount,
      totalFound: completedRequests.length
    });
  } catch (error) {
    console.error('Error bulk archiving completed document requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error archiving completed document requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
