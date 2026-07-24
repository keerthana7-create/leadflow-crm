const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { adminOnly, selfOrAdmin } = require('../middleware/rbac');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { registerRules, validate } = require('../validators/authValidator');

// All user routes require authentication
router.use(authenticate);

// GET /api/users  (admin only)
router.get('/', adminOnly, getUsers);

// GET /api/users/:id  (self or admin)
router.get('/:id', selfOrAdmin, getUser);

// POST /api/users  (admin only)
router.post('/', adminOnly, registerRules, validate, createUser);

// PUT /api/users/:id  (admin only)
router.put('/:id', adminOnly, updateUser);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
