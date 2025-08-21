const DocumentRequest = require('../models/DocumentRequest');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');
const pickupStubService = require('../utils/pickupStubService');
const path = require('path');
const fs = require('fs');

// Helper function to extract text using OCR API
const extractDocumentData = async (file) => {
  try {
    const FormData = require('form-data');
    const axios = require('axios');
    
    const formData = new FormData();
    formData.append('document', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });
    
    const response = await axios.post('http://localhost:5001/api/extract-pdf', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('OCR extraction failed:', error.message);
    return null;
  }
};

// User: Create a new document request with OCR processing
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestData = {
      user: userId,
      status: 'submitted',
      ...req.body
    };
    
    // If files were uploaded, process them
    if (req.files && req.files.length > 0) {
      requestData.uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      
      // Extract data from the first document
      try {
        const extractedData = await extractDocumentData(req.files[0]);
        if (extractedData && extractedData.success) {
          requestData.extractedData = extractedData.data;
          
          // Auto-fill fields from extracted data if not provided
          if (extractedData.data.form137Data) {
            const extracted = extractedData.data.form137Data;
            if (!requestData.surname && extracted.surname) requestData.surname = extracted.surname;
            if (!requestData.givenName && extracted.givenName) requestData.givenName = extracted.givenName;
            if (!requestData.dateOfBirth && extracted.dateOfBirth) requestData.dateOfBirth = extracted.dateOfBirth;
            if (!requestData.studentNumber && extracted.studentNumber) requestData.studentNumber = extracted.studentNumber;
          }
        }
      } catch (extractError) {
        console.error('Error during OCR extraction:', extractError);
        // Continue without extraction data
      }
    }
    
    const request = new DocumentRequest(requestData);
    await request.save();
    
    // Update first processing step
    if (request.processingSteps.length > 0) {
      request.processingSteps[0].status = 'completed';
      request.processingSteps[0].completedAt = new Date();
      await request.save();
    }
    
    // Populate user data for notifications
    await request.populate('user');
    
    // Send notification to admins about new request
    try {
      await notificationService.notifyAdminNewRequest(request, request.user);
    } catch (notificationError) {
      console.error('Error sending admin notification:', notificationError);
    }
    
    res.status(201).json({ 
      message: 'Request submitted successfully', 
      request: {
        id: request._id,
        documentType: request.documentType,
        status: request.status,
        estimatedCompletionDate: request.estimatedCompletionDate,
        extractedData: request.extractedData,
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
    const { status, rejectionReason, reviewNotes, pickupDateTime, pickupTimeSlot } = req.body;
    
    // Get the current request to track status changes
    const currentRequest = await DocumentRequest.findById(requestId).populate('user');
    if (!currentRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const oldStatus = currentRequest.status;
    
    const updateData = { 
      status,
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };
    
    // If status is being set to approved, store pickup scheduling data
    if (status === 'approved') {
      if (pickupDateTime || pickupTimeSlot) {
        updateData.pickupSchedule = {
          scheduledDateTime: pickupDateTime ? new Date(pickupDateTime) : null,
          timeSlot: pickupTimeSlot || null,
          scheduledBy: req.user.userId,
          scheduledAt: new Date()
        };
      }
    }
    
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
    ).populate('user');
    
    // Generate pickup stub if status is approved and has pickup schedule
    if (status === 'approved' && (pickupDateTime || pickupTimeSlot)) {
      try {
        console.log('Generating pickup stub for approved request:', requestId);
        const stubResult = await pickupStubService.generatePickupStub(request);
        
        if (stubResult.success) {
          // Update the request with pickup stub information
          await DocumentRequest.findByIdAndUpdate(requestId, {
            'pickupSchedule.qrCode': stubResult.qrCode,
            'pickupSchedule.verificationCode': stubResult.verificationCode,
            'pickupSchedule.stubPath': stubResult.filename
          });
          
          console.log('Pickup stub generated successfully:', stubResult.filename);
        } else {
          console.error('Failed to generate pickup stub:', stubResult.error);
        }
      } catch (stubError) {
        console.error('Error generating pickup stub:', stubError);
        // Don't fail the approval process if stub generation fails
      }
    }
    
    // Send notification to user about status change
    if (oldStatus !== status) {
      try {
        await notificationService.notifyStatusChange(request.user, request, oldStatus, status);
      } catch (notificationError) {
        console.error('Error sending status change notification:', notificationError);
      }
    }
    
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

// Admin: Bulk update request statuses
exports.bulkUpdateRequests = async (req, res) => {
  try {
    const { requestIds, status, rejectionReason, reviewNotes } = req.body;
    
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ message: 'Request IDs are required' });
    }
    
    const updateData = { 
      status,
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.archived = true;
      updateData.archivedAt = new Date();
      updateData.archivedBy = req.user.email || 'Admin';
    }
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }
    
    const result = await DocumentRequest.updateMany(
      { _id: { $in: requestIds } },
      updateData
    );
    
    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} requests`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating requests:', error);
    res.status(500).json({ message: 'Error updating requests' });
  }
};

// Admin: Get requests with advanced filtering
exports.getFilteredRequests = async (req, res) => {
  try {
    const { 
      status, 
      documentType, 
      priority, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = { archived: { $ne: true } };
    
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;
    if (priority) filter.priority = priority;
    
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const requests = await DocumentRequest.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await DocumentRequest.countDocuments(filter);
    
    res.json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching filtered requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// Admin: Update processing step
exports.updateProcessingStep = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { stepIndex, status, notes } = req.body;
    
    const request = await DocumentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (stepIndex >= 0 && stepIndex < request.processingSteps.length) {
      request.processingSteps[stepIndex].status = status;
      request.processingSteps[stepIndex].notes = notes;
      
      if (status === 'completed') {
        request.processingSteps[stepIndex].completedAt = new Date();
      }
      
      await request.save();
    }
    
    res.json({
      success: true,
      message: 'Processing step updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating processing step:', error);
    res.status(500).json({ message: 'Error updating processing step' });
  }
};

// Admin: Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysAgo);
    
    // Get counts by status
    const statusCounts = await DocumentRequest.aggregate([
      { $match: { archived: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get counts by document type
    const typeCounts = await DocumentRequest.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);
    
    // Get processing time averages
    const avgProcessingTime = await DocumentRequest.aggregate([
      { 
        $match: { 
          status: 'completed',
          completedAt: { $exists: true },
          createdAt: { $gte: fromDate }
        }
      },
      {
        $addFields: {
          processingTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$documentType',
          avgDays: { $avg: '$processingTime' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get overdue requests
    const overdueRequests = await DocumentRequest.find({
      estimatedCompletionDate: { $lt: new Date() },
      status: { $nin: ['completed', 'rejected'] },
      archived: { $ne: true }
    }).countDocuments();
    
    res.json({
      success: true,
      data: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgProcessingTime,
        overdueRequests,
        period: daysAgo
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
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

// User: Download pickup stub (for approved requests)
exports.downloadPickupStub = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;
    
    // Find request that belongs to the authenticated user and is approved
    const request = await DocumentRequest.findOne({ 
      _id: requestId, 
      user: userId,
      status: 'approved'
    }).lean();
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Approved request not found or access denied' 
      });
    }
    
    if (!request.pickupSchedule?.stubPath) {
      return res.status(404).json({ 
        success: false,
        message: 'Pickup stub not available for this request' 
      });
    }
    
    const stubPath = path.join(__dirname, '../uploads/pickup-stubs', request.pickupSchedule.stubPath);
    
    if (!fs.existsSync(stubPath)) {
      return res.status(404).json({ 
        success: false,
        message: 'Pickup stub file not found' 
      });
    }
    
    // Determine content type based on file extension
    const isHTML = request.pickupSchedule.stubPath.endsWith('.html');
    const isPDF = request.pickupSchedule.stubPath.endsWith('.pdf');
    
    // Set headers for file download
    if (isPDF) {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'text/html');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${request.pickupSchedule.stubPath}"`);
    
    // Send the file
    res.sendFile(stubPath);
    
  } catch (error) {
    console.error('Error downloading pickup stub:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error downloading pickup stub',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Verify QR code for pickup
exports.verifyPickupQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }
    
    // Verify QR code format
    const verificationResult = pickupStubService.verifyPickupQR(qrData);
    
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }
    
    // Find the corresponding request
    const request = await DocumentRequest.findOne({
      _id: verificationResult.data.requestId,
      status: 'approved'
    }).populate('user', 'firstName lastName email');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not approved'
      });
    }
    
    res.json({
      success: true,
      message: 'QR code verified successfully',
      requestData: {
        id: request._id,
        studentName: `${request.firstName || request.givenName} ${request.surname}`,
        documentType: request.documentType,
        pickupSchedule: request.pickupSchedule,
        user: request.user
      },
      qrData: verificationResult.data
    });
    
  } catch (error) {
    console.error('Error verifying pickup QR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Mark document as picked up
exports.markAsPickedUp = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { pickedUpBy, verificationCode } = req.body;
    
    const request = await DocumentRequest.findOne({
      _id: requestId,
      status: 'approved'
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Approved request not found'
      });
    }
    
    // Update pickup information
    const updatedRequest = await DocumentRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'completed',
        'pickupSchedule.pickedUpAt': new Date(),
        'pickupSchedule.pickedUpBy': pickedUpBy || 'Unknown',
        completedAt: new Date(),
        archived: true,
        archivedAt: new Date(),
        archivedBy: req.user.email || 'Admin'
      },
      { new: true }
    ).populate('user');
    
    res.json({
      success: true,
      message: 'Document marked as picked up and request completed',
      request: updatedRequest
    });
    
  } catch (error) {
    console.error('Error marking as picked up:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking document as picked up',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Verify QR code for pickup
exports.verifyPickupQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR data provided'
      });
    }
    
    console.log('Verifying QR code data:', qrData);
    
    // Use pickup stub service to verify QR code
    const pickupStubService = require('../utils/pickupStubService');
    const verificationResult = await pickupStubService.verifyQRCode(qrData);
    
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Invalid QR code'
      });
    }
    
    // Get the document request details
    const request = await DocumentRequest.findById(verificationResult.requestId)
      .populate('user');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found'
      });
    }
    
    // Check if already picked up
    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Document has already been picked up'
      });
    }
    
    // Check if request is approved and ready for pickup
    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Document is not ready for pickup'
      });
    }
    
    res.json({
      success: true,
      message: 'QR code verified successfully',
      qrData: verificationResult,
      requestData: {
        id: request._id,
        studentName: request.studentName,
        documentType: request.documentType,
        purpose: request.purpose,
        status: request.status,
        submittedAt: request.submittedAt,
        pickupSchedule: request.pickupSchedule,
        user: {
          email: request.user.email,
          studentId: request.user.studentId
        }
      }
    });
    
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
