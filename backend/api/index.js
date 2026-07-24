/**
 * Self-contained Vercel serverless handler for LeadFlow CRM API.
 *
 * Uses in-memory Maps instead of MongoDB (mongodb-memory-server can't spawn
 * subprocesses inside Vercel's sandbox). The existing backend code under
 * backend/ continues to work locally against a real / in-memory MongoDB.
 *
 * Demo accounts (re-seeded on every cold start):
 *   admin@leadflow.com  / password123
 *   john@leadflow.com   / password123
 */

'use strict';

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'leadflow-serverless-secret-2024';

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------
const db = {
  users: new Map(),
  leads: new Map(),
  notes: new Map(),
  activities: new Map(),
};

const counters = { user: 1, lead: 1, note: 1, activity: 1 };
const uid = (t) => `${t}_${counters[t]++}`;

let seeded = false;

async function seed() {
  if (seeded) return;
  seeded = true;

  const h = (p) => bcrypt.hash(p, 10);
  const adminPw = await h('password123');
  const memberPw = await h('password123');

  const admin = { _id: 'user_1', name: 'Admin User', email: 'admin@leadflow.com', password: adminPw, role: 'admin', isActive: true, createdAt: new Date() };
  const member = { _id: 'user_2', name: 'John Smith', email: 'john@leadflow.com', password: memberPw, role: 'member', isActive: true, createdAt: new Date() };
  db.users.set('user_1', admin);
  db.users.set('user_2', member);
  counters.user = 3;

  const leads = [
    { name: 'Alice Chen', email: 'alice@techcorp.com', phone: '+1-555-0101', company: 'TechCorp', message: 'Interested in the enterprise plan', source: 'website', status: 'qualified', assignedTo: 'user_2' },
    { name: 'Bob Williams', email: 'bob@startup.io', phone: '+1-555-0102', company: 'Startup IO', message: 'Looking for a modern CRM solution', source: 'referral', status: 'contacted', assignedTo: 'user_2' },
    { name: 'Carol Davis', email: 'carol@agency.co', phone: '+1-555-0103', company: 'Agency Co', message: 'Need lead management for our sales team', source: 'email', status: 'proposal', assignedTo: 'user_1' },
    { name: 'David Lee', email: 'david@innovate.com', phone: '+1-555-0104', company: 'Innovate Inc', message: 'Follow-up from the tech conference', source: 'social', status: 'new', assignedTo: 'user_2' },
    { name: 'Emma Johnson', email: 'emma@globalco.org', phone: '+1-555-0105', company: 'Global Co', message: 'Evaluating CRM options for Q3', source: 'website', status: 'closed_won', assignedTo: 'user_1' },
    { name: 'Frank Miller', email: 'frank@venture.vc', phone: '+1-555-0106', company: 'Venture VC', message: 'Portfolio company recommendation', source: 'referral', status: 'negotiation', assignedTo: 'user_2' },
    { name: 'Grace Kim', email: 'grace@designhub.io', phone: '+1-555-0107', company: 'DesignHub', message: 'Saw your ad on LinkedIn', source: 'social', status: 'closed_lost', assignedTo: 'user_1' },
  ];

  leads.forEach((l, i) => {
    const id = `lead_${i + 1}`;
    db.leads.set(id, { ...l, _id: id, createdAt: new Date(Date.now() - i * 86400000 * 2), updatedAt: new Date() });
  });
  counters.lead = leads.length + 1;
}

// Kick off seed immediately (warm start optimization)
seed();

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

app.use(cors({ origin: () => true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Middleware helpers
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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', mode: 'serverless-memory', timestamp: new Date().toISOString() })
);

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    await seed();
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    for (const u of db.users.values())
      if (u.email === email)
        return res.status(400).json({ success: false, message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uid('user');
    const user = { _id: id, name, email, password: hashed, role, isActive: true, createdAt: new Date() };
    db.users.set(id, user);
    const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { user: safeUser(user), token } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await seed();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    let user = null;
    for (const u of db.users.values()) if (u.email === email) { user = u; break; }
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user: safeUser(user), token } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.users.get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.patch('/api/auth/me', auth, async (req, res) => {
  const user = db.users.get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
  db.users.set(user._id, user);
  res.json({ success: true, data: { user: safeUser(user) } });
});

// ---------------------------------------------------------------------------
// User management routes (admin only)
// ---------------------------------------------------------------------------
app.get('/api/users', auth, adminOnly, (_, res) => {
  const users = [...db.users.values()].map(safeUser);
  res.json({ success: true, data: { users, total: users.length } });
});

app.get('/api/users/:id', auth, adminOnly, (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.post('/api/users', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    for (const u of db.users.values())
      if (u.email === email)
        return res.status(400).json({ success: false, message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const id = uid('user');
    const user = { _id: id, name, email, password: hashed, role, isActive: true, createdAt: new Date() };
    db.users.set(id, user);
    res.status(201).json({ success: true, data: { user: safeUser(user) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.patch('/api/users/:id', auth, adminOnly, async (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.body.name) user.name = req.body.name;
  if (req.body.role) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
  db.users.set(user._id, user);
  res.json({ success: true, data: { user: safeUser(user) } });
});

app.delete('/api/users/:id', auth, adminOnly, (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
  if (!db.users.has(req.params.id))
    return res.status(404).json({ success: false, message: 'User not found' });
  db.users.delete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

// ---------------------------------------------------------------------------
// Lead routes
// ---------------------------------------------------------------------------
function queryLeads(query) {
  let list = [...db.leads.values()];
  if (query.status) list = list.filter((l) => l.status === query.status);
  if (query.source) list = list.filter((l) => l.source === query.source);
  if (query.assignedTo) list = list.filter((l) => l.assignedTo === query.assignedTo);
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.company || '').toLowerCase().includes(s)
    );
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const total = list.length;
  return { leads: list.slice((page - 1) * limit, page * limit), total, page, pages: Math.ceil(total / limit) };
}

// Public lead capture (no auth required)
app.post('/api/leads', async (req, res) => {
  const { name, email, phone, company, message, source = 'website' } = req.body;
  if (!name || !email || !phone || !company || !message)
    return res.status(400).json({ success: false, message: 'All fields are required', errors: [] });
  const id = uid('lead');
  const lead = { _id: id, name, email, phone, company, message, source, status: 'new', assignedTo: null, createdAt: new Date(), updatedAt: new Date() };
  db.leads.set(id, lead);
  res.status(201).json({ success: true, message: 'Thank you! We will be in touch soon.', data: { lead } });
});

app.get('/api/leads/stats', auth, (_, res) => {
  const all = [...db.leads.values()];
  const byStatus = {};
  const bySource = {};
  all.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    bySource[l.source] = (bySource[l.source] || 0) + 1;
  });
  res.json({ success: true, data: { total: all.length, byStatus, bySource } });
});

app.get('/api/leads', auth, (req, res) => {
  const data = queryLeads(req.query);
  res.json({ success: true, data });
});

app.get('/api/leads/:id', auth, (req, res) => {
  const lead = db.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, data: { lead } });
});

app.patch('/api/leads/:id', auth, (req, res) => {
  const lead = db.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  ['name', 'email', 'phone', 'company', 'message', 'status', 'source', 'assignedTo'].forEach(
    (k) => { if (req.body[k] !== undefined) lead[k] = req.body[k]; }
  );
  lead.updatedAt = new Date();
  db.leads.set(lead._id, lead);
  res.json({ success: true, data: { lead } });
});

app.delete('/api/leads/:id', auth, adminOnly, (req, res) => {
  if (!db.leads.has(req.params.id)) return res.status(404).json({ success: false, message: 'Lead not found' });
  db.leads.delete(req.params.id);
  res.json({ success: true, message: 'Lead deleted' });
});

// ---------------------------------------------------------------------------
// Notes routes
// ---------------------------------------------------------------------------
app.get('/api/leads/:id/notes', auth, (req, res) => {
  const notes = [...db.notes.values()]
    .filter((n) => n.leadId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: { notes } });
});

app.post('/api/leads/:id/notes', auth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim())
    return res.status(400).json({ success: false, message: 'Note content is required' });
  if (!db.leads.has(req.params.id))
    return res.status(404).json({ success: false, message: 'Lead not found' });
  const id = uid('note');
  const note = { _id: id, leadId: req.params.id, content: content.trim(), createdBy: req.user.id, createdAt: new Date() };
  db.notes.set(id, note);
  res.status(201).json({ success: true, data: { note } });
});

app.delete('/api/leads/:leadId/notes/:noteId', auth, (req, res) => {
  const note = db.notes.get(req.params.noteId);
  if (!note || note.leadId !== req.params.leadId)
    return res.status(404).json({ success: false, message: 'Note not found' });
  if (note.createdBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  db.notes.delete(req.params.noteId);
  res.json({ success: true, message: 'Note deleted' });
});

// ---------------------------------------------------------------------------
// Activity routes
// ---------------------------------------------------------------------------
app.get('/api/leads/:id/activities', auth, (req, res) => {
  const acts = [...db.activities.values()]
    .filter((a) => a.leadId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: { activities: acts } });
});

// 404 fallback
app.use((_, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;
