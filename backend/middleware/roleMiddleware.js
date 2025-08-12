const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user has required role
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          userRole: user.role,
          requiredRoles: allowedRoles
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(401).json({ message: 'Invalid token.' });
    }
  };
};

// Helper functions for specific roles
const requireSuperAdmin = requireRole(['super-admin']);
const requireEnrollmentAdmin = requireRole(['admin-enrollment', 'super-admin']);
const requireDocumentAdmin = requireRole(['admin-document', 'super-admin']);
const requireAnyAdmin = requireRole(['admin', 'admin-enrollment', 'admin-document', 'super-admin']);

// Function to check if user can access specific features
const canAccessFeature = (userRole, feature) => {
  const permissions = {
    'enrollment-management': ['admin-enrollment', 'super-admin'],
    'document-management': ['admin-document', 'super-admin'],
    'user-management': ['super-admin'],
    'system-settings': ['super-admin'],
    'inquiry-management': ['admin-document', 'super-admin'],
    'archive-access': ['admin-enrollment', 'admin-document', 'super-admin'],
    'qr-verification': ['admin-enrollment', 'admin-document', 'super-admin']
  };

  return permissions[feature]?.includes(userRole) || false;
};

module.exports = {
  requireRole,
  requireSuperAdmin,
  requireEnrollmentAdmin,
  requireDocumentAdmin,
  requireAnyAdmin,
  canAccessFeature
};
