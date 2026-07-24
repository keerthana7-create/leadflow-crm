const leadService = require('../services/leadService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const getLeads = async (req, res, next) => {
  try {
    const { page, limit, sort, status, assignedTo, company, search } = req.query;
    const { leads, pagination } = await leadService.getLeads(
      { status, assignedTo, company, search },
      { page, limit, sort },
      req.user
    );
    return sendPaginated(res, leads, pagination);
  } catch (err) {
    next(err);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);
    return sendSuccess(res, { lead });
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    // Public submission: req.user may be undefined
    const createdBy = req.user ? req.user._id : null;
    const lead = await leadService.createLead(req.body, createdBy);
    return sendSuccess(res, { lead }, 'Lead created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body, req.user);
    return sendSuccess(res, { lead }, 'Lead updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id);
    return sendSuccess(res, {}, 'Lead deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const assignLead = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const lead = await leadService.assignLead(req.params.id, userId, req.user);
    return sendSuccess(res, { lead }, 'Lead assigned successfully.');
  } catch (err) {
    next(err);
  }
};

const addNote = async (req, res, next) => {
  try {
    const note = await leadService.addNote(req.params.id, req.body.text, req.user);
    return sendSuccess(res, { note }, 'Note added successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await leadService.getNotes(req.params.id);
    return sendSuccess(res, { notes });
  } catch (err) {
    next(err);
  }
};

const getActivities = async (req, res, next) => {
  try {
    const activities = await leadService.getActivities(req.params.id);
    return sendSuccess(res, { activities });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { stats, recentActivities } = await leadService.getDashboardStats();
    return sendSuccess(res, { stats, recentActivities });
  } catch (err) {
    next(err);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const { status, assignedTo, company, search } = req.query;
    const csv = await leadService.exportLeadsCSV(
      { status, assignedTo, company, search },
      req.user
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
