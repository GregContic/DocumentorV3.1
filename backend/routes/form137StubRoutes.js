const express = require('express');
const router = express.Router();
const form137StubController = require('../controllers/form137StubController');
const { authenticate } = require('../middleware/authMiddleware');

// User routes (authenticated users)
router.post('/create', authenticate, form137StubController.createStub);
router.get('/my-stubs', authenticate, form137StubController.getUserStubs);
router.get('/:id', authenticate, form137StubController.getStubById);

// Admin/Registrar routes
router.get('/', authenticate, form137StubController.getAllStubs);
router.put('/:id/status', authenticate, form137StubController.updateStubStatus);
router.get('/verify/:stubCode', authenticate, form137StubController.verifyStubByCode);

module.exports = router;
