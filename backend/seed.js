require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Note = require('./models/Note');
const Activity = require('./models/Activity');

/**
 * Exported for programmatic use (e.g., auto-seed from server.js)
 * Assumes DB is already connected when called as a module.
 * When called directly as a script, connects & disconnects itself.
 */
const seedDatabase = async () => {
  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Note.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  // Create Admin and Member users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@leadflow.com',
    password: 'password123',
    role: 'Admin',
  });

  const member1 = await User.create({
    name: 'John SalesRep',
    email: 'john@leadflow.com',
    password: 'password123',
    role: 'Member',
  });

  const member2 = await User.create({
    name: 'Sarah Closers',
    email: 'sarah@leadflow.com',
    password: 'password123',
    role: 'Member',
  });

  console.log('✅ Created users: admin@leadflow.com, john@leadflow.com, sarah@leadflow.com');

  // Create sample leads
  const leads = await Lead.create([
    {
      name: 'Acme Enterprise Deal',
      email: 'procurement@acmecorp.com',
      phone: '+1 (555) 234-5678',
      company: 'Acme Corp',
      message: 'Looking for enterprise CRM solution for 50 sales reps.',
      status: 'Proposal Sent',
      assignedTo: member1._id,
      createdBy: admin._id,
      source: 'Website',
    },
    {
      name: 'Starlight Tech Inc',
      email: 'cto@starlight.io',
      phone: '+1 (555) 987-6543',
      company: 'Starlight Tech',
      message: 'Interested in API integrations and custom RBAC features.',
      status: 'Qualified',
      assignedTo: member2._id,
      createdBy: admin._id,
      source: 'Website',
    },
    {
      name: 'Globex Corp Inbound',
      email: 'info@globex.com',
      phone: '+1 (555) 345-6789',
      company: 'Globex Corp',
      message: 'Requesting demo of lead distribution features.',
      status: 'New',
      assignedTo: null,
      createdBy: null,
      source: 'Website',
    },
    {
      name: 'Apex Digital Agency',
      email: 'alex@apexdigital.com',
      phone: '+1 (555) 876-5432',
      company: 'Apex Digital',
      message: 'Signed contract for annual plan!',
      status: 'Won',
      assignedTo: member1._id,
      createdBy: admin._id,
      source: 'Manual',
    },
  ]);

  console.log(`✅ Created ${leads.length} sample leads.`);

  // Add initial activity logs & notes
  await Activity.create({
    leadId: leads[0]._id,
    action: 'Lead status changed to "Proposal Sent"',
    performedBy: member1._id,
  });

  await Note.create({
    leadId: leads[0]._id,
    userId: member1._id,
    text: 'Sent customized proposal PDF via email. Awaiting feedback from CFO.',
  });

  console.log('🚀 Seeding completed successfully!');
};

module.exports = { seedDatabase };

// Allow running directly as a script: node seed.js
if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err.message);
      process.exit(1);
    });
}
