const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { adminOnly, memberOrAdmin } = require('../middleware/rbac');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
  getNotes,
  getActivities,
  getDashboardStats,
  exportCSV,
} = require('../controllers/leadController');
const {
  createLeadRules,
  updateLeadRules,
  addNoteRules,
  validate,
} = require('../validators/leadValidator');

// ── Public routes (no auth required) ─────────────────────────────────────────
// POST /api/leads & POST /api/leads/capture (public lead capture form)
router.post('/', createLeadRules, validate, createLead);
router.post('/capture', createLeadRules, validate, createLead);

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(authenticate);

// GET /api/leads/dashboard  (admin only)
router.get('/dashboard', adminOnly, getDashboardStats);

// GET /api/leads/export  (admin or member — filtered by role in service)
router.get('/export', memberOrAdmin, exportCSV);

// GET /api/leads  (paginated + filtered)
router.get('/', memberOrAdmin, getLeads);

// GET /api/leads/:id
router.get('/:id', memberOrAdmin, getLead);

// PUT /api/leads/:id
router.put('/:id', memberOrAdmin, updateLeadRules, validate, updateLead);

// DELETE /api/leads/:id  (admin only)
router.delete('/:id', adminOnly, deleteLead);

// POST /api/leads/:id/assign  (admin only)
router.post('/:id/assign', adminOnly, assignLead);

// POST /api/leads/:id/note
router.post('/:id/note', memberOrAdmin, addNoteRules, validate, addNote);

// GET /api/leads/:id/notes
router.get('/:id/notes', memberOrAdmin, getNotes);

// GET /api/leads/:id/activity
router.get('/:id/activity', memberOrAdmin, getActivities);

module.exports = router;
