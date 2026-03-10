import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  register, login, refreshToken, logout, logoutAll,
  verifyEmail, resendVerification, forgotPassword,
  resetPassword, changePassword, getProfile,
  getSessions, revokeSession, getDevEmails,
} from '../controllers/auth.js';
import { getGoogleAuthUrl, googleCallback } from '../controllers/oauth.js';
import {
  getAllUsers, updateUserRole, toggleUserStatus,
  getAdminDashboard, getPublicContent, getProtectedContent, getModeratorContent,
} from '../controllers/admin.js';
import { authenticate, requireEmailVerified, requirePermission } from '../middleware/auth.js';
import {
  registerValidation, loginValidation,
  resetPasswordValidation, changePasswordValidation, handleValidation,
} from '../middleware/validation.js';

const router = Router();

const authLimit   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const strictLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// Auth
router.post('/auth/register',            authLimit, registerValidation, register);
router.post('/auth/login',               strictLimit, loginValidation, login);
router.post('/auth/refresh',             refreshToken);
router.post('/auth/logout',              logout);
router.post('/auth/logout-all',          authenticate, logoutAll);
router.get ('/auth/verify-email',        verifyEmail);
router.post('/auth/resend-verification', authLimit, [body('email').isEmail().normalizeEmail(), handleValidation], resendVerification);
router.post('/auth/forgot-password',     authLimit, [body('email').isEmail().normalizeEmail(), handleValidation], forgotPassword);
router.post('/auth/reset-password',      strictLimit, resetPasswordValidation, resetPassword);
router.post('/auth/change-password',     authenticate, changePasswordValidation, changePassword);
router.get ('/auth/me',                  authenticate, getProfile);
router.get ('/auth/sessions',            authenticate, getSessions);
router.delete('/auth/sessions/:tokenId', authenticate, revokeSession);

// OAuth
router.get('/auth/google',          getGoogleAuthUrl);
router.get('/auth/google/callback', googleCallback);

// Dev
router.get('/dev/emails', getDevEmails);

// Content
router.get('/content/public',     getPublicContent);
router.get('/content/protected',  authenticate, requireEmailVerified, getProtectedContent);
router.get('/content/moderator',  authenticate, requirePermission('content:publish'), getModeratorContent);
router.get('/content/admin',      authenticate, requirePermission('admin:access'), getAdminDashboard);

// Admin
router.get   ('/admin/users',                 authenticate, requirePermission('users:read'), getAllUsers);
router.patch ('/admin/users/:id/role',        authenticate, requirePermission('users:write'), updateUserRole);
router.patch ('/admin/users/:id/toggle-status', authenticate, requirePermission('users:write'), toggleUserStatus);

export default router;