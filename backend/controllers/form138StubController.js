const Form138Stub = require('../models/Form138Stub');
const QRCode = require('qrcode');

const form138StubController = {
  // Create a new Form 138 stub
  createStub: async (req, res) => {
    try {
      console.log('Create Form 138 stub request received');
      console.log('req.user:', req.user);
      console.log('req.body:', req.body);
      
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated or user ID missing',
          debug: { user: req.user }
        });
      }

      const stubData = {
        ...req.body,
        user: req.user.userId,
        stubCode: Form138Stub.generateStubCode()
      };

      // Generate QR code containing stub verification info
      const qrData = JSON.stringify({
        stubCode: stubData.stubCode,
        studentName: `${stubData.firstName} ${stubData.surname}`,
        lrn: stubData.lrn,
        gradeLevel: stubData.gradeLevel,
        schoolYear: stubData.schoolYear,
        purpose: stubData.purpose,
        generatedAt: new Date().toISOString()
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      stubData.qrCode = qrCodeDataURL;

      const stub = new Form138Stub(stubData);
      await stub.save();

      res.status(201).json({
        success: true,
        message: 'Form 138 stub generated successfully',
        data: stub
      });
    } catch (error) {
      console.error('Error creating Form 138 stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Form 138 stub',
        error: error.message
      });
    }
  },

  // Get user's stubs
  getUserStubs: async (req, res) => {
    try {
      const stubs = await Form138Stub.find({ user: req.user.userId })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: stubs
      });
    } catch (error) {
      console.error('Error fetching user Form 138 stubs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Form 138 stubs',
        error: error.message
      });
    }
  },

  // Get stub by ID
  getStubById: async (req, res) => {
    try {
      const stub = await Form138Stub.findById(req.params.id);
      
      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Form 138 stub not found'
        });
      }

      // Check if user owns this stub or is an admin
      if (stub.user.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: stub
      });
    } catch (error) {
      console.error('Error fetching Form 138 stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Form 138 stub',
        error: error.message
      });
    }
  },

  // Admin: Get all stubs for registrar dashboard
  getAllStubs: async (req, res) => {
    try {
      const { status, search } = req.query;
      let query = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { stubCode: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } },
          { lrn: { $regex: search, $options: 'i' } },
          { gradeLevel: { $regex: search, $options: 'i' } },
          { schoolYear: { $regex: search, $options: 'i' } }
        ];
      }

      const stubs = await Form138Stub.find(query)
        .populate('user', 'username email')
        .populate('verifiedBy', 'username')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: stubs
      });
    } catch (error) {
      console.error('Error fetching all Form 138 stubs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Form 138 stubs',
        error: error.message
      });
    }
  },

  // Admin: Update stub status
  updateStubStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, registrarNotes } = req.body;

      const updateData = { 
        status,
        registrarNotes: registrarNotes || undefined
      };

      // Set timestamps based on status
      switch (status) {
        case 'submitted-to-registrar':
          updateData.submittedAt = new Date();
          break;
        case 'verified-by-registrar':
          updateData.verifiedAt = new Date();
          updateData.verifiedBy = req.user.userId;
          break;
        case 'ready-for-pickup':
          updateData.readyAt = new Date();
          break;
        case 'completed':
          updateData.completedAt = new Date();
          break;
      }

      const stub = await Form138Stub.findByIdAndUpdate(id, updateData, { new: true })
        .populate('user', 'username email')
        .populate('verifiedBy', 'username');

      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Form 138 stub not found'
        });
      }

      res.json({
        success: true,
        message: 'Form 138 stub status updated successfully',
        data: stub
      });
    } catch (error) {
      console.error('Error updating Form 138 stub status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Form 138 stub status',
        error: error.message
      });
    }
  },

  // Verify stub by code (for registrar)
  verifyStubByCode: async (req, res) => {
    try {
      const { stubCode } = req.params;
      
      const stub = await Form138Stub.findOne({ stubCode })
        .populate('user', 'username email');

      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Invalid Form 138 stub code'
        });
      }

      res.json({
        success: true,
        data: stub
      });
    } catch (error) {
      console.error('Error verifying Form 138 stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify Form 138 stub',
        error: error.message
      });
    }
  }
};

module.exports = form138StubController;
