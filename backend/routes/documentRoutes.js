const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorizeAdmin, preventAdminSubmission } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  }
});

// User routes (prevent admin access)
router.post('/request', authenticate, preventAdminSubmission, upload.array('documents', 5), documentController.createRequest);
router.get('/my-requests', authenticate, preventAdminSubmission, documentController.getMyRequests);
router.get('/request/:requestId', authenticate, documentController.getRequestById);
router.get('/request/:requestId/pickup-stub', authenticate, preventAdminSubmission, documentController.downloadPickupStub);

// Admin routes
router.get('/admin/documents/requests', authenticate, authorizeAdmin, documentController.getAllRequests);
router.get('/admin/documents/filtered-requests', authenticate, authorizeAdmin, documentController.getFilteredRequests);
router.get('/admin/documents/analytics', authenticate, authorizeAdmin, documentController.getDashboardAnalytics);
router.patch('/admin/documents/request/:requestId/status', authenticate, authorizeAdmin, documentController.updateRequestStatus);
router.patch('/admin/documents/bulk-update', authenticate, authorizeAdmin, documentController.bulkUpdateRequests);
router.patch('/admin/documents/request/:requestId/processing-step', authenticate, authorizeAdmin, documentController.updateProcessingStep);
router.get('/admin/documents/archived-requests', authenticate, authorizeAdmin, documentController.getArchivedRequests);
router.post('/admin/documents/bulk-archive-completed', authenticate, authorizeAdmin, documentController.bulkArchiveCompletedRequests);
router.patch('/admin/documents/request/:requestId/archive', authenticate, authorizeAdmin, documentController.archiveRequest);
router.patch('/admin/documents/request/:requestId/restore', authenticate, authorizeAdmin, documentController.restoreArchivedRequest);
router.post('/admin/documents/verify-qr', authenticate, authorizeAdmin, documentController.verifyPickupQR);
router.patch('/admin/documents/request/:requestId/mark-picked-up', authenticate, authorizeAdmin, documentController.markAsPickedUp);

module.exports = router;
