const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticate, authorizeAdmin, preventAdminSubmission } = require('../middleware/authMiddleware');

// Student routes (prevent admin access)
router.post('/', authenticate, preventAdminSubmission, inquiryController.createInquiry);
router.get('/my-inquiries', authenticate, preventAdminSubmission, inquiryController.getMyInquiries);

// Admin routes
router.get('/admin/inquiries', authenticate, authorizeAdmin, inquiryController.getAllInquiries);
router.get('/admin/archived-inquiries', authenticate, authorizeAdmin, inquiryController.getArchivedInquiries);
router.post('/admin/bulk-archive-completed', authenticate, authorizeAdmin, inquiryController.bulkArchiveCompletedInquiries);
router.patch('/admin/inquiries/:inquiryId/status', authenticate, authorizeAdmin, inquiryController.updateInquiryStatus);
router.patch('/admin/inquiries/:inquiryId/archive', authenticate, authorizeAdmin, inquiryController.archiveInquiry);
router.patch('/admin/inquiries/:inquiryId/restore', authenticate, authorizeAdmin, inquiryController.restoreInquiry);
router.post('/admin/inquiries/:inquiryId/reply', authenticate, authorizeAdmin, inquiryController.replyToInquiry);

module.exports = router;
