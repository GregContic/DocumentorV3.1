// Get enrollments by section name (admin)
exports.getEnrollmentsBySection = async (req, res) => {
  try {
    const sectionName = req.query.section;
    const gradeLevel = req.query.gradeLevel; // Add grade level filtering
    if (!sectionName) {
      return res.status(400).json({ message: 'Section name is required' });
    }
    
    // Log incoming query (for debug) and build a precise, case-insensitive regex
    console.log('[ENROLLMENTS BY SECTION] query section:', sectionName, 'gradeLevel:', gradeLevel);
    
    // Properly escape any regex metacharacters in the section name
    const raw = sectionName.trim();
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match only the exact section name (case-insensitive, trimmed)
    const exactRegex = new RegExp(`^\\s*${escaped}\\s*$`, 'i');
    
    // Build query with section matching
    const query = {
      section: { $regex: exactRegex }
    };
    
    // Add grade level filtering if provided
    if (gradeLevel) {
      // Handle both "Grade 7" and "7" formats for gradeToEnroll
      const gradeVariants = [];
      const cleanGrade = gradeLevel.replace(/^grade\s*/i, '').trim();
      gradeVariants.push(cleanGrade); // "7", "8", etc.
      gradeVariants.push(`Grade ${cleanGrade}`); // "Grade 7", "Grade 8", etc.
      gradeVariants.push(gradeLevel); // Original format
      
      query.gradeToEnroll = {
        $in: gradeVariants.map(variant => new RegExp(`^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'))
      };
      
      console.log('[ENROLLMENTS BY SECTION] filtering by grade variants:', gradeVariants);
    }
    
    console.log('[ENROLLMENTS BY SECTION] final query:', JSON.stringify(query, null, 2));
    
    const enrollments = await Enrollment.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('[ENROLLMENTS BY SECTION] found:', Array.isArray(enrollments) ? enrollments.length : 0);
    // Log brief summary for each matched enrollment to aid debugging
    if (Array.isArray(enrollments)) {
      enrollments.forEach(e => console.log('[ENROLLMENTS BY SECTION] match:', { 
        id: e._id, 
        name: `${e.firstName} ${e.surname}`,
        section: e.section, 
        grade: e.gradeToEnroll,
        status: e.status 
      }));
    }
    res.json(enrollments);
  } catch (error) {
    console.error('[ENROLLMENTS BY SECTION] error:', error);
    res.status(500).json({ message: 'Failed to fetch enrollments for section', error: error.message });
  }
};
// Delete enrollment by ID (admin only)
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete enrollment', error: error.message });
  }
};
const Enrollment = require('../models/Enrollment');
const { sendEnrollmentStatusEmail } = require('../utils/emailService');

// Create new enrollment with file uploads
exports.createEnrollment = async (req, res) => {
  try {
    const enrollmentData = { ...req.body };
    
    // Link the enrollment to the authenticated user
    if (req.user && req.user.userId) {
      enrollmentData.user = req.user.userId;
    } else {
      return res.status(401).json({ message: 'Authentication required to submit enrollment' });
    }
    
    // Remove any fields that don't exist in the model schema
    delete enrollmentData.birthCertificate; // We removed this field from the model
    
    // Handle empty strings for age field
    if (enrollmentData.age === '') {
      enrollmentData.age = null;
    }
    
    // Handle uploaded files
    if (req.files) {
      if (req.files.form137File) {
        enrollmentData.form137File = req.files.form137File[0].path;
      }
      if (req.files.form138File) {
        enrollmentData.form138File = req.files.form138File[0].path;
      }
      if (req.files.goodMoralFile) {
        enrollmentData.goodMoralFile = req.files.goodMoralFile[0].path;
      }
      if (req.files.medicalCertificateFile) {
        enrollmentData.medicalCertificateFile = req.files.medicalCertificateFile[0].path;
      }
      if (req.files.parentIdFile) {
        enrollmentData.parentIdFile = req.files.parentIdFile[0].path;
      }
      if (req.files.idPicturesFile) {
        enrollmentData.idPicturesFile = req.files.idPicturesFile[0].path;
      }
    }
    
    console.log('Creating enrollment with data:', enrollmentData);
    
    // Log the keys being sent to identify any extra fields
    console.log('Fields being sent:', Object.keys(enrollmentData));
    
    const enrollment = new Enrollment(enrollmentData);
    console.log('Enrollment created, attempting to save...');
    await enrollment.save();
    console.log('Enrollment saved successfully');
    
    res.status(201).json({ 
      message: 'Enrollment submitted successfully', 
      enrollment,
      enrollmentNumber: enrollment.enrollmentNumber
    });
  } catch (error) {
    console.error('Enrollment submission error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.message 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate enrollment number. Please try again.',
        error: 'Duplicate key error'
      });
    }
    
    // Generic error handling
    res.status(500).json({ 
      message: 'Failed to submit enrollment', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's enrollment status
exports.getMyEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user.userId })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    if (!enrollment) {
      return res.json({ 
        hasEnrollment: false,
        message: 'No enrollment found. You can submit an enrollment application.'
      });
    }
    
    res.json({
      hasEnrollment: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollment status', error: error.message });
  }
};

// Get all enrollments (admin)
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollments', error: error.message });
  }
};

// Update enrollment status (admin)
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason, section } = req.body;
  console.log('[ENROLLMENT UPDATE] id:', id, 'payload:', req.body, 'by user:', req.user ? req.user.userId : 'no-user');

    const updateData = {
      status,
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    };

    // Add/Update section if provided
    if (section) {
      updateData.section = section;
    }

    // Add rejection reason if status is rejected
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // Add review notes if provided
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    const enrollment = await Enrollment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName');
  console.log('[ENROLLMENT UPDATE] updated enrollment:', enrollment ? { _id: enrollment._id, status: enrollment.status, section: enrollment.section } : 'NOT_FOUND');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Send email notification for approved or rejected status
    if (status === 'approved' || status === 'rejected') {
      try {
        await sendEnrollmentStatusEmail(enrollment, status, reviewNotes || rejectionReason);
        console.log(`Email sent for enrollment ${enrollment._id} with status ${status}`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
      }
    }
    
    res.json({ 
      message: 'Enrollment status updated successfully', 
      enrollment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update enrollment status', error: error.message });
  }
};
