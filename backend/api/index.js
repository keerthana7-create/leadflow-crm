/**
 * LeadFlow CRM — Vercel Serverless API Handler
 *
 * Self-contained Express app with in-memory data.
 * Pre-seeded synchronously at module load.
 *
 * Demo accounts:
 *   admin@leadflow.com / password123
 *   john@leadflow.com  / password123
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const JWT_SECRET  = process.env.JWT_SECRET || 'leadflow-serverless-secret-2024';
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
const db = {
  users:      new Map(),
  leads:      new Map(),
  notes:      new Map(),
  activities: new Map(),
};

const DEMO_HASH = bcrypt.hashSync('password123', SALT_ROUNDS);

db.users.set('user_1', { _id: 'user_1', name: 'Admin User',  email: 'admin@leadflow.com', password: DEMO_HASH, role: 'admin',  isActive: true, createdAt: new Date() });
db.users.set('user_2', { _id: 'user_2', name: 'John Smith',  email: 'john@leadflow.com',  password: DEMO_HASH, role: 'member', isActive: true, createdAt: new Date() });

const seedLeads = [
  { name: 'Alice Chen',    email: 'alice@techcorp.com',  phone: '+1-555-0101', company: 'TechCorp',   message: 'Interested in the enterprise plan',          source: 'website',  status: 'qualified',    assignedTo: 'user_2' },
  { name: 'Bob Williams',  email: 'bob@startup.io',      phone: '+1-555-0102', company: 'Startup IO', message: 'Looking for a modern CRM solution',           source: 'referral', status: 'contacted',    assignedTo: 'user_2' },
  { name: 'Carol Davis',   email: 'carol@agency.co',     phone: '+1-555-0103', company: 'Agency Co',  message: 'Need lead management for our sales team',     source: 'email',    status: 'proposal',     assignedTo: 'user_1' },
  { name: 'David Lee',     email: 'david@innovate.com',  phone: '+1-555-0104', company: 'Innovate',   message: 'Follow-up from the tech conference',           source: 'social',   status: 'new',          assignedTo: 'user_2' },
  { name: 'Emma Johnson',  email: 'emma@globalco.org',   phone: '+1-555-0105', company: 'Global Co',  message: 'Evaluating CRM options for Q3 budget',        source: 'website',  status: 'closed_won',   assignedTo: 'user_1' },
  { name: 'Frank Miller',  email: 'frank@venture.vc',    phone: '+1-555-0106', company: 'Venture VC', message: 'Portfolio company recommendation',             source: 'referral', status: 'negotiation',  assignedTo: 'user_2' },
  { name: 'Grace Kim',     email: 'grace@designhub.io',  phone: '+1-555-0107', company: 'DesignHub',  message: 'Saw your ad on LinkedIn',                     source: 'social',   status: 'closed_lost',  assignedTo: 'user_1' },
];

seedLeads.forEach((l, i) => {
  const id = `lead_${i + 1}`;
  db.leads.set(id, { ...l, _id: id, createdAt: new Date(Date.now() - i * 2 * 86_400_000), updatedAt: new Date() });
});

// Seed sample activity
db.activities.set('act_1', { _id: 'act_1', leadId: 'lead_1', type: 'status_change', description: 'Status changed to Qualified', createdBy: 'user_2', createdAt: new Date() });
db.activities.set('act_2', { _id: 'act_2', leadId: 'lead_5', type: 'status_change', description: 'Status changed to Won', createdBy: 'user_1', createdAt: new Date() });

const counters = { user: 3, lead: seedLeads.length + 1, note: 1, activity: 3 };
const uid = (t) => `${t}_${counters[t]++}`;

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Middleware to normalize URL paths regardless of how Vercel routes them
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  next();
});

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
}

const safeUser = ({ password, ...rest }) => rest;

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get(['/api/health', '/health'], (_, res) =>
  res.json({ status: 'ok', mode: 'serverless-memory', users: db.users.size, leads: db.leads.size })
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post(['/api/auth/register', '/auth/register'], async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    for (const u of db.users.values())
      if (u.email === email)
        return res.status(400).json({ success: false, message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uid('user');
    const user = { _id: id, name, email, password: hashed, role, isActive: true, createdAt: new Date() };
    db.users.set(id, user);
    const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { user: safeUser(user), token } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    let found = null;
    for (const u of db.users.values()) if (u.email === email) { found = u; break; }
    if (!found) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, found.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ id: found._id, email: found.email, role: found.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user: safeUser(found), token } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get(['/api/auth/me', '/auth/me'], auth, (req, res) => {
  const user = db.users.get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.patch(['/api/auth/me', '/auth/me'], auth, async (req, res) => {
  const user = db.users.get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  db.users.set(user._id, user);
  res.json({ success: true, data: { user: safeUser(user) } });
});

// ---------------------------------------------------------------------------
// Users (admin only)
// ---------------------------------------------------------------------------
app.get(['/api/users', '/users'], auth, adminOnly, (_, res) => {
  const users = [...db.users.values()].map(safeUser);
  res.json({ success: true, data: { users, total: users.length } });
});

app.get(['/api/users/:id', '/users/:id'], auth, adminOnly, (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.post(['/api/users', '/users'], auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    for (const u of db.users.values())
      if (u.email === email)
        return res.status(400).json({ success: false, message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uid('user');
    const user = { _id: id, name, email, password: hashed, role, isActive: true, createdAt: new Date() };
    db.users.set(id, user);
    res.status(201).json({ success: true, data: { user: safeUser(user) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch(['/api/users/:id', '/users/:id'], auth, adminOnly, async (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.body.name) user.name = req.body.name;
  if (req.body.role) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.password) user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  db.users.set(user._id, user);
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.delete(['/api/users/:id', '/users/:id'], auth, adminOnly, (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
  if (!db.users.has(req.params.id))
    return res.status(404).json({ success: false, message: 'User not found' });
  db.users.delete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

// ---------------------------------------------------------------------------
// Dashboard Stats (DEFINED BEFORE /api/leads/:id to avoid ID conflict)
// ---------------------------------------------------------------------------
const handleDashboard = (req, res) => {
  const all = [...db.leads.values()];
  const byStatus = {}, bySource = {};
  let newCount = 0, qualifiedCount = 0, wonCount = 0, lostCount = 0;
  
  all.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    bySource[l.source] = (bySource[l.source] || 0) + 1;
    if (l.status === 'new') newCount++;
    if (l.status === 'qualified') qualifiedCount++;
    if (l.status === 'closed_won' || l.status === 'won') wonCount++;
    if (l.status === 'closed_lost' || l.status === 'lost') lostCount++;
  });

  const total = all.length;
  const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
  const recentActivities = [...db.activities.values()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      stats: {
        total,
        new: newCount,
        qualified: qualifiedCount,
        won: wonCount,
        lost: lostCount,
        conversionRate,
        byStatus,
        bySource
      },
      recentActivities
    }
  });
};

app.get(['/api/leads/stats', '/leads/stats'], auth, handleDashboard);
app.get(['/api/leads/dashboard', '/leads/dashboard'], auth, handleDashboard);

// ---------------------------------------------------------------------------
// Leads — public capture (no auth)
// ---------------------------------------------------------------------------
app.post(['/api/leads', '/leads'], (req, res) => {
  const { name, email, phone, company, message, source = 'website' } = req.body;
  if (!name || !email || !phone || !company || !message)
    return res.status(400).json({ success: false, message: 'All fields are required', errors: [] });
  const id = uid('lead');
  const lead = { _id: id, name, email, phone, company, message, source, status: 'new', assignedTo: null, createdAt: new Date(), updatedAt: new Date() };
  db.leads.set(id, lead);
  res.status(201).json({ success: true, message: 'Thank you! We will be in touch soon.', data: { lead } });
});

app.get(['/api/leads', '/leads'], auth, (req, res) => {
  let list = [...db.leads.values()];
  const { status, source, assignedTo, search } = req.query;
  if (status) list = list.filter((l) => l.status === status);
  if (source) list = list.filter((l) => l.source === source);
  if (assignedTo) list = list.filter((l) => l.assignedTo === assignedTo);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((l) => l.name.toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || (l.company || '').toLowerCase().includes(s));
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const total = list.length;
  res.json({ success: true, data: { leads: list.slice((page - 1) * limit, page * limit), total, page, pages: Math.ceil(total / limit) } });
});

app.get(['/api/leads/:id', '/leads/:id'], auth, (req, res) => {
  const lead = db.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, data: { lead } });
});

app.patch(['/api/leads/:id', '/leads/:id'], auth, (req, res) => {
  const lead = db.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  ['name','email','phone','company','message','status','source','assignedTo'].forEach(
    (k) => { if (req.body[k] !== undefined) lead[k] = req.body[k]; }
  );
  lead.updatedAt = new Date();
  db.leads.set(lead._id, lead);
  res.json({ success: true, data: { lead } });
});

app.put(['/api/leads/:id', '/leads/:id'], auth, (req, res) => {
  const lead = db.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  ['name','email','phone','company','message','status','source','assignedTo'].forEach(
    (k) => { if (req.body[k] !== undefined) lead[k] = req.body[k]; }
  );
  lead.updatedAt = new Date();
  db.leads.set(lead._id, lead);
  res.json({ success: true, data: { lead } });
});

app.delete(['/api/leads/:id', '/leads/:id'], auth, adminOnly, (req, res) => {
  if (!db.leads.has(req.params.id))
    return res.status(404).json({ success: false, message: 'Lead not found' });
  db.leads.delete(req.params.id);
  res.json({ success: true, message: 'Lead deleted' });
});

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
app.get(['/api/leads/:id/notes', '/leads/:id/notes'], auth, (req, res) => {
  const notes = [...db.notes.values()].filter((n) => n.leadId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: { notes } });
});

app.post(['/api/leads/:id/notes', '/leads/:id/notes', '/api/leads/:id/note', '/leads/:id/note'], auth, (req, res) => {
  const content = req.body.content || req.body.text || req.body.body;
  if (!content || !content.trim())
    return res.status(400).json({ success: false, message: 'Note content is required' });
  if (!db.leads.has(req.params.id))
    return res.status(404).json({ success: false, message: 'Lead not found' });
  const id = uid('note');
  const note = { _id: id, leadId: req.params.id, content: content.trim(), createdBy: req.user.id, createdAt: new Date() };
  db.notes.set(id, note);
  res.status(201).json({ success: true, data: { note } });
});

app.delete(['/api/leads/:leadId/notes/:noteId', '/leads/:leadId/notes/:noteId'], auth, (req, res) => {
  const note = db.notes.get(req.params.noteId);
  if (!note || note.leadId !== req.params.leadId)
    return res.status(404).json({ success: false, message: 'Note not found' });
  if (note.createdBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  db.notes.delete(req.params.noteId);
  res.json({ success: true, message: 'Note deleted' });
});

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
app.get(['/api/leads/:id/activities', '/leads/:id/activities', '/api/leads/:id/activity', '/leads/:id/activity'], auth, (req, res) => {
  const acts = [...db.activities.values()].filter((a) => a.leadId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: { activities: acts } });
});

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------
app.use((_, res) => res.status(404).json({ success: false, message: 'API route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;
