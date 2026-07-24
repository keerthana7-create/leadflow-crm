const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const { buildLeadCSV } = require('../utils/csvExport');

/**
 * Build query filters for lead listing
 */
const buildLeadQuery = ({ status, assignedTo, company, search }, requestingUser) => {
  const query = {};

  // Members can only see their assigned leads
  if (requestingUser.role === 'Member') {
    query.assignedTo = requestingUser._id;
  } else {
    if (assignedTo) query.assignedTo = assignedTo;
  }

  if (status) query.status = status;
  if (company) query.company = new RegExp(company, 'i');
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') },
    ];
  }

  return query;
};

/**
 * Get paginated leads
 */
const getLeads = async (filters, pagination, requestingUser) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
  const skip = (page - 1) * limit;
  const query = buildLeadQuery(filters, requestingUser);

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single lead by ID
 */
const getLeadById = async (id, requestingUser) => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  if (!lead) {
    const err = new Error('Lead not found.');
    err.statusCode = 404;
    throw err;
  }

  // Members can only access their assigned leads
  if (
    requestingUser.role === 'Member' &&
    lead.assignedTo?._id?.toString() !== requestingUser._id.toString()
  ) {
    const err = new Error('Access denied to this lead.');
    err.statusCode = 403;
    throw err;
  }

  return lead;
};

/**
 * Create a new lead (public or authenticated)
 */
const createLead = async (data, createdBy = null) => {
  const lead = await Lead.create({ ...data, createdBy, source: createdBy ? 'Manual' : 'Website' });

  await logActivity(
    lead._id,
    'Lead created',
    createdBy,
    { status: lead.status }
  );

  return lead;
};

/**
 * Update lead fields
 */
const updateLead = async (id, updates, requestingUser) => {
  const lead = await Lead.findById(id);
  if (!lead) {
    const err = new Error('Lead not found.');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['name', 'email', 'phone', 'company', 'message', 'status'];
  const changes = [];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined && updates[field] !== lead[field]) {
      changes.push(`${field} changed from "${lead[field]}" to "${updates[field]}"`);
      lead[field] = updates[field];
    }
  });

  await lead.save();
  await lead.populate('assignedTo', 'name email');

  if (changes.length > 0) {
    await logActivity(lead._id, `Lead updated: ${changes.join('; ')}`, requestingUser._id);
  }

  if (updates.status && updates.status !== lead.status) {
    await logActivity(
      lead._id,
      `Status changed to "${updates.status}"`,
      requestingUser._id,
      { newStatus: updates.status }
    );
  }

  return lead;
};

/**
 * Delete a lead and all associated data
 */
const deleteLead = async (id) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) {
    const err = new Error('Lead not found.');
    err.statusCode = 404;
    throw err;
  }

  // Cascade delete notes and activities
  await Promise.all([
    Note.deleteMany({ leadId: id }),
    Activity.deleteMany({ leadId: id }),
  ]);

  return lead;
};

/**
 * Assign a lead to a user
 */
const assignLead = async (leadId, userId, requestingUser) => {
  const [lead, assignee] = await Promise.all([
    Lead.findById(leadId),
    User.findById(userId).select('name email role'),
  ]);

  if (!lead) {
    const err = new Error('Lead not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!assignee) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  lead.assignedTo = userId;
  await lead.save();

  await logActivity(
    lead._id,
    `Lead assigned to ${assignee.name}`,
    requestingUser._id,
    { assignedTo: userId }
  );

  await lead.populate('assignedTo', 'name email');
  return lead;
};

/**
 * Add a note to a lead
 */
const addNote = async (leadId, text, requestingUser) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const err = new Error('Lead not found.');
    err.statusCode = 404;
    throw err;
  }

  const note = await Note.create({
    leadId,
    userId: requestingUser._id,
    text,
  });

  await note.populate('userId', 'name email');
  await logActivity(leadId, `Note added by ${requestingUser.name}`, requestingUser._id);

  return note;
};

/**
 * Get notes for a lead
 */
const getNotes = async (leadId) => {
  return Note.find({ leadId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get activity timeline for a lead
 */
const getActivities = async (leadId) => {
  return Activity.find({ leadId })
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get admin dashboard analytics
 */
const getDashboardStats = async () => {
  const [statusCounts, totalLeads, recentActivities] = await Promise.all([
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.countDocuments(),
    Activity.find()
      .populate('performedBy', 'name')
      .populate('leadId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const stats = {
    total: totalLeads,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposalSent: 0,
    won: 0,
    lost: 0,
    conversionRate: 0,
  };

  const keyMap = {
    New: 'new',
    Contacted: 'contacted',
    Qualified: 'qualified',
    'Proposal Sent': 'proposalSent',
    Won: 'won',
    Lost: 'lost',
  };

  statusCounts.forEach(({ _id, count }) => {
    if (keyMap[_id]) stats[keyMap[_id]] = count;
  });

  if (totalLeads > 0) {
    stats.conversionRate = Math.round((stats.won / totalLeads) * 100);
  }

  return { stats, recentActivities };
};

/**
 * Export leads to CSV
 */
const exportLeadsCSV = async (filters, requestingUser) => {
  const query = buildLeadQuery(filters, requestingUser);
  const leads = await Lead.find(query).lean();
  return buildLeadCSV(leads);
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
  getNotes,
  getActivities,
  getDashboardStats,
  exportLeadsCSV,
};
