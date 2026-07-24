const { body } = require('express-validator');
const { validate } = require('./authValidator');

const createLeadRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ max: 30 }).withMessage('Phone too long'),
  body('company').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }).withMessage('Company name too long'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message too long'),
];

const updateLeadRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('company').optional().trim().isLength({ max: 100 }),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage('Invalid status value'),
];

const addNoteRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Note text is required')
    .isLength({ max: 5000 })
    .withMessage('Note cannot exceed 5000 characters'),
];

module.exports = { createLeadRules, updateLeadRules, addNoteRules, validate };
