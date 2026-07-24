const Activity = require('../models/Activity');

/**
 * Log an activity event for a lead
 * @param {string} leadId - The lead's ObjectId
 * @param {string} action - Human-readable action description
 * @param {string|null} performedBy - User ObjectId who performed the action
 * @param {object} metadata - Optional extra context
 */
const logActivity = async (leadId, action, performedBy = null, metadata = {}) => {
  try {
    await Activity.create({ leadId, action, performedBy, metadata });
  } catch (err) {
    // Non-fatal: log to console but don't throw
    console.error(`[ActivityLogger] Failed to log activity: ${err.message}`);
  }
};

module.exports = { logActivity };
