const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorizeAdmin = (req, res, next) => {
  // Accept all valid admin roles from the User model
  const allowedAdminRoles = ['admin', 'admin-enrollment', 'admin-document', 'super-admin', 'superadmin', 'enrollment-admin'];
  console.log('authorizeAdmin middleware: req.user =', req.user);
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user found' });
  }
  if (!allowedAdminRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Admins only', user: req.user });
  }
  next();
};

exports.preventAdminSubmission = (req, res, next) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ 
      message: 'Admins are not allowed to submit inquiries. Please use the admin dashboard to manage inquiries instead.',
      error: 'ADMIN_SUBMISSION_FORBIDDEN'
    });
  }
  next();
};
