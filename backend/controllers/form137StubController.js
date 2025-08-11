const Form137Stub = require('../models/Form137Stub');
const QRCode = require('qrcode');

const form137StubController = {
  // Create a new Form 137 stub
  createStub: async (req, res) => {
    try {
      console.log('Create stub request received');
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
        stubCode: Form137Stub.generateStubCode()
      };

      // Generate QR code containing stub verification info
      const qrData = JSON.stringify({
        stubCode: stubData.stubCode,
        studentName: `${stubData.firstName} ${stubData.surname}`,
        lrn: stubData.learnerReferenceNumber,
        purpose: stubData.purpose,
        generatedAt: new Date().toISOString()
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      stubData.qrCode = qrCodeDataURL;

      const stub = new Form137Stub(stubData);
      await stub.save();

      res.status(201).json({
        success: true,
        message: 'Form 137 stub generated successfully',
        data: stub
      });
    } catch (error) {
      console.error('Error creating Form 137 stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Form 137 stub',
        error: error.message
      });
    }
  },

  // Get user's stubs
  getUserStubs: async (req, res) => {
    try {
      const stubs = await Form137Stub.find({ user: req.user.userId })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: stubs
      });
    } catch (error) {
      console.error('Error fetching user stubs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stubs',
        error: error.message
      });
    }
  },

  // Get stub by ID
  getStubById: async (req, res) => {
    try {
      const stub = await Form137Stub.findById(req.params.id);
      
      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Stub not found'
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
      console.error('Error fetching stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stub',
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
          { learnerReferenceNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const stubs = await Form137Stub.find(query)
        .populate('user', 'username email')
        .populate('verifiedBy', 'username')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: stubs
      });
    } catch (error) {
      console.error('Error fetching all stubs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stubs',
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

      const stub = await Form137Stub.findByIdAndUpdate(id, updateData, { new: true })
        .populate('user', 'username email')
        .populate('verifiedBy', 'username');

      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Stub not found'
        });
      }

      res.json({
        success: true,
        message: 'Stub status updated successfully',
        data: stub
      });
    } catch (error) {
      console.error('Error updating stub status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stub status',
        error: error.message
      });
    }
  },

  // Verify stub by code (for registrar)
  verifyStubByCode: async (req, res) => {
    try {
      const { stubCode } = req.params;
      
      const stub = await Form137Stub.findOne({ stubCode })
        .populate('user', 'username email');

      if (!stub) {
        return res.status(404).json({
          success: false,
          message: 'Invalid stub code'
        });
      }

      res.json({
        success: true,
        data: stub
      });
    } catch (error) {
      console.error('Error verifying stub:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify stub',
        error: error.message
      });
    }
  }
};

module.exports = form137StubController;
