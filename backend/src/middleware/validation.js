import { body, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid input',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  next();
}

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail().isLength({ max: 255 }),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('8–128 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  handleValidation,
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidation,
];

export const resetPasswordValidation = [
  body('token').notEmpty(),
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('8–128 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
  handleValidation,
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[^A-Za-z0-9]/),
  handleValidation,
];