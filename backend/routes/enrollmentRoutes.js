const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorizeAdmin, preventAdminSubmission } = require('../middleware/authMiddleware');
const { uploadEnrollmentDocs } = require('../middleware/uploadMiddleware');

// Student: Get my enrollment status (put this first to avoid conflicts)
router.get('/my-status', authenticate, enrollmentController.getMyEnrollmentStatus);

// Admin: Get all enrollments
router.get('/admin', authenticate, authorizeAdmin, enrollmentController.getAllEnrollments);

// Admin: Get archived enrollments
router.get('/admin/archived', authenticate, authorizeAdmin, enrollmentController.getArchivedEnrollments);

// Admin: Archive enrollment
router.put('/:id/archive', authenticate, authorizeAdmin, enrollmentController.archiveEnrollment);

// Admin: Restore archived enrollment
router.put('/:id/restore', authenticate, authorizeAdmin, enrollmentController.restoreEnrollment);

// Admin: Bulk archive completed enrollments
router.post('/admin/bulk-archive', authenticate, authorizeAdmin, enrollmentController.bulkArchiveCompletedEnrollments);

// Admin: Archive students by section
router.post('/admin/archive-by-section', authenticate, authorizeAdmin, enrollmentController.archiveStudentsBySection);

// Test endpoint to verify grade filtering is working (no auth for testing)
router.get('/test-grade-filter', async (req, res) => {
  const { section, gradeLevel } = req.query;
  console.log('[TEST] section:', section, 'gradeLevel:', gradeLevel);
  
  // Test the actual filtering logic
  const Enrollment = require('../models/Enrollment');
  const raw = (section || '').trim();
  const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exactRegex = new RegExp(`^\\s*${escaped}\\s*$`, 'i');
  
  const query = {
    section: { $regex: exactRegex }
  };
  
  if (gradeLevel) {
    const gradeVariants = [];
    const cleanGrade = gradeLevel.replace(/^grade\s*/i, '').trim();
    gradeVariants.push(cleanGrade);
    gradeVariants.push(`Grade ${cleanGrade}`);
    gradeVariants.push(gradeLevel);
    
    query.$or = gradeVariants.map(variant => ({ gradeToEnroll: variant }));
    console.log('[TEST] Grade variants:', gradeVariants);
  }
  
  const enrollments = await Enrollment.find(query).lean();
  console.log('[TEST] Found', enrollments.length, 'enrollments');
  
  res.json({ 
    section, 
    gradeLevel, 
    query, 
    found: enrollments.length,
    enrollments: enrollments.map(e => ({
      firstName: e.firstName,
      surname: e.surname,
      section: e.section,
      gradeToEnroll: e.gradeToEnroll,
      status: e.status
    }))
  });
});

// Admin: Get enrollments by section name
router.get('/by-section', authenticate, authorizeAdmin, enrollmentController.getEnrollmentsBySection);

// Student: Submit enrollment with file uploads (requires authentication)
router.post('/', authenticate, uploadEnrollmentDocs, enrollmentController.createEnrollment);

// Admin: Update enrollment status
router.put('/:id/status', authenticate, authorizeAdmin, enrollmentController.updateEnrollmentStatus);

// Admin: Delete enrollment
router.delete('/:id', authenticate, authorizeAdmin, enrollmentController.deleteEnrollment);

module.exports = router;
