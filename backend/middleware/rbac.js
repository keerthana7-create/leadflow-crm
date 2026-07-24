const { sendError } = require('../utils/apiResponse');

/**
 * Restrict access to Admin role only
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return sendError(res, 'Access denied. Admin privileges required.', 403);
  }
  next();
};

/**
 * Allow both Admin and Member roles
 */
const memberOrAdmin = (req, res, next) => {
  if (!req.user || !['Admin', 'Member'].includes(req.user.role)) {
    return sendError(res, 'Access denied.', 403);
  }
  next();
};

/**
 * Allow access to own resource or Admin
 */
const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated.', 401);
  }
  if (req.user.role === 'Admin' || req.user._id.toString() === req.params.id) {
    return next();
  }
  return sendError(res, 'Access denied. You can only access your own resources.', 403);
};

module.exports = { adminOnly, memberOrAdmin, selfOrAdmin };
