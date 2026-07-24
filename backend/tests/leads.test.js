const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Lead = require('../models/Lead');

let mongoServer;
let adminToken;
let memberToken;
let adminUser;
let memberUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.JWT_SECRET = 'test_secret_key_for_jest_tests_32chars';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Lead.deleteMany({});

  // Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'Admin',
  });
  adminToken = adminRes.body.data.token;
  adminUser = adminRes.body.data.user;

  // Create member
  const memberRes = await request(app).post('/api/auth/register').send({
    name: 'Member User',
    email: 'member@test.com',
    password: 'password123',
    role: 'Member',
  });
  memberToken = memberRes.body.data.token;
  memberUser = memberRes.body.data.user;
});

describe('POST /api/leads (Public Lead Capture)', () => {
  it('should create a lead from public form without auth', async () => {
    const res = await request(app).post('/api/leads').send({
      name: 'John Prospect',
      email: 'john@company.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      message: 'Interested in your services.',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lead.name).toBe('John Prospect');
    expect(res.body.data.lead.status).toBe('New');
    expect(res.body.data.lead.source).toBe('Website');
  });

  it('should reject lead without required email', async () => {
    const res = await request(app).post('/api/leads').send({
      name: 'No Email Lead',
      email: 'invalid-email',
    });

    expect(res.status).toBe(422);
  });

  it('should reject lead without name', async () => {
    const res = await request(app).post('/api/leads').send({
      email: 'valid@email.com',
    });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/leads (Protected)', () => {
  it('should allow admin to get all leads', async () => {
    await request(app).post('/api/leads').send({
      name: 'Test Lead',
      email: 'lead@test.com',
      phone: '+1 555-9999',
      company: 'Test Company',
      message: 'Test message for lead',
    });

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
  });

  it('should support pagination', async () => {
    const res = await request(app)
      .get('/api/leads?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.page).toBe(1);
  });
});

describe('PUT /api/leads/:id (Update Status)', () => {
  let leadId;

  beforeEach(async () => {
    const res = await request(app).post('/api/leads').send({
      name: 'Status Test Lead',
      email: 'status@test.com',
      phone: '+1 555-9999',
      company: 'Test Company',
      message: 'Test message for status update',
    });
    leadId = res.body.data.lead._id;
  });

  it('should allow admin to update lead status', async () => {
    const res = await request(app)
      .put(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Contacted' });

    expect(res.status).toBe(200);
    expect(res.body.data.lead.status).toBe('Contacted');
  });

  it('should reject invalid status value', async () => {
    const res = await request(app)
      .put(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'InvalidStatus' });

    expect(res.status).toBe(422);
  });
});

describe('POST /api/leads/:id/assign (Admin Only)', () => {
  let leadId;

  beforeEach(async () => {
    const res = await request(app).post('/api/leads').send({
      name: 'Assign Test Lead',
      email: 'assign@test.com',
      phone: '+1 555-9999',
      company: 'Test Company',
      message: 'Test message for assignment',
    });
    leadId = res.body.data.lead._id;
  });

  it('should allow admin to assign a lead', async () => {
    const res = await request(app)
      .post(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: memberUser._id });

    expect(res.status).toBe(200);
    expect(res.body.data.lead.assignedTo).toBeDefined();
  });

  it('should deny member from assigning leads', async () => {
    const res = await request(app)
      .post(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ userId: memberUser._id });

    expect(res.status).toBe(403);
  });
});

describe('POST /api/leads/:id/note', () => {
  let leadId;

  beforeEach(async () => {
    const createRes = await request(app).post('/api/leads').send({
      name: 'Note Test Lead',
      email: 'note@test.com',
      phone: '+1 555-9999',
      company: 'Test Company',
      message: 'Test message for note creation',
    });
    leadId = createRes.body.data.lead._id;

    // Assign to member so they can access it
    await request(app)
      .post(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: memberUser._id });
  });

  it('should allow authenticated user to add a note', async () => {
    const res = await request(app)
      .post(`/api/leads/${leadId}/note`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: 'This is a test note.' });

    expect(res.status).toBe(201);
    expect(res.body.data.note.text).toBe('This is a test note.');
  });

  it('should reject empty note text', async () => {
    const res = await request(app)
      .post(`/api/leads/${leadId}/note`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: '' });

    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/leads/:id (Admin Only)', () => {
  let leadId;

  beforeEach(async () => {
    const res = await request(app).post('/api/leads').send({
      name: 'Delete Test Lead',
      email: 'delete@test.com',
      phone: '+1 555-9999',
      company: 'Test Company',
      message: 'Test message for deletion',
    });
    leadId = res.body.data.lead._id;
  });

  it('should allow admin to delete a lead', async () => {
    const res = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('should deny member from deleting a lead', async () => {
    const res = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});
