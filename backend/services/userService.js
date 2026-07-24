const User = require('../models/User');

/**
 * Get all users (admin view)
 */
const getAllUsers = async () => {
  return User.find({}).select('-password').sort({ createdAt: -1 });
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Create a new user (admin only)
 */
const createUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('A user with this email already exists.');
    err.statusCode = 409;
    throw err;
  }
  return User.create({ name, email, password, role: role || 'Member' });
};

/**
 * Update a user
 */
const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'email', 'role', 'isActive'];
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  const user = await User.findByIdAndUpdate(id, filteredUpdates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Soft-delete (deactivate) a user
 */
const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId.toString()) {
    const err = new Error('You cannot delete your own account.');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
