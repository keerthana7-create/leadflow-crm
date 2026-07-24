const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return sendSuccess(res, { user, token }, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return sendSuccess(res, { user, token }, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Profile retrieved.');
};

module.exports = { register, login, getMe };
