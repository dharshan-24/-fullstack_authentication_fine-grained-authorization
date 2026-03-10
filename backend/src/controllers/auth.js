import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById, updateUser, safeUser, db } from '../models/db.js';
import {
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
  revokeRefreshToken, revokeAllUserTokens, getStoredRefreshToken,
  generateVerificationToken, consumeVerificationToken, getUserActiveSessions,
} from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail, getEmailLog } from '../services/email.js';

const COOKIE = {
  httpOnly: true, secure: false, sameSite: 'lax', path: '/api/auth',
};

function setRefresh(res, token) {
  res.cookie('refreshToken', token, { ...COOKIE, maxAge: 7 * 24 * 60 * 60 * 1000 });
}
function clearRefresh(res) { res.clearCookie('refreshToken', COOKIE); }

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (findUserByEmail(email))
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email already in use' });

    const user = createUser({ email, password: await bcrypt.hash(password, 12), name });
    const token = generateVerificationToken(user.id, 'email');
    await sendVerificationEmail(user, token);

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      user: safeUser(user),
      _dev_verificationToken: token,
    });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);
    const dummy = '$2a$12$invalidhashfortimingnormalizatio';

    if (!user || !user.password) {
      await bcrypt.compare(password, dummy);
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    if (!await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ error: 'ACCOUNT_DISABLED', message: 'Account is disabled' });

    updateUser(user.id, { lastLoginAt: new Date().toISOString(), loginCount: user.loginCount + 1 });

    const accessToken = generateAccessToken(user);
    const { token: refreshToken } = generateRefreshToken(user.id, req.headers['user-agent'], req.ip);
    setRefresh(res, refreshToken);

    res.json({ message: 'Login successful', accessToken, user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'NO_REFRESH_TOKEN', message: 'No refresh token' });

    let payload;
    try { payload = verifyRefreshToken(token); }
    catch { clearRefresh(res); return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' }); }

    const stored = getStoredRefreshToken(payload.jti);

    if (stored?.isRevoked) {
      revokeAllUserTokens(payload.sub);
      clearRefresh(res);
      return res.status(401).json({ error: 'TOKEN_REUSE', message: 'Security alert: all sessions terminated' });
    }

    if (!stored) { clearRefresh(res); return res.status(401).json({ error: 'TOKEN_NOT_FOUND', message: 'Token not found' }); }

    const user = findUserById(payload.sub);
    if (!user || !user.isActive) { clearRefresh(res); return res.status(401).json({ error: 'USER_INACTIVE' }); }

    const { token: newRefresh, tokenId: newId } = generateRefreshToken(user.id, req.headers['user-agent'], req.ip);
    revokeRefreshToken(stored.tokenId, newId);
    setRefresh(res, newRefresh);

    res.json({ accessToken: generateAccessToken(user), user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try { const p = verifyRefreshToken(token); revokeRefreshToken(p.jti); } catch {}
    }
    clearRefresh(res);
    res.json({ message: 'Logged out' });
  } catch (e) { next(e); }
}

export async function logoutAll(req, res, next) {
  try {
    revokeAllUserTokens(req.user.id);
    clearRefresh(res);
    res.json({ message: 'All sessions terminated' });
  } catch (e) { next(e); }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'MISSING_TOKEN' });
    const data = consumeVerificationToken(token, 'email');
    if (!data) return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    const user = findUserById(data.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (user.isEmailVerified) return res.json({ message: 'Already verified' });
    updateUser(user.id, { isEmailVerified: true });
    res.json({ message: 'Email verified successfully' });
  } catch (e) { next(e); }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    const user = findUserByEmail(email);
    if (!user || user.isEmailVerified)
      return res.json({ message: 'If an unverified account exists, an email has been sent.' });
    const token = generateVerificationToken(user.id, 'email');
    await sendVerificationEmail(user, token);
    res.json({ message: 'Verification email sent.', _dev_verificationToken: token });
  } catch (e) { next(e); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = findUserByEmail(email);
    let devToken;
    if (user?.password) {
      devToken = generateVerificationToken(user.id, 'password');
      await sendPasswordResetEmail(user, devToken);
    }
    res.json({ message: 'If an account exists, a reset link has been sent.', _dev_resetToken: devToken });
  } catch (e) { next(e); }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const data = consumeVerificationToken(token, 'password');
    if (!data) return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    updateUser(data.userId, { password: await bcrypt.hash(newPassword, 12) });
    revokeAllUserTokens(data.userId);
    res.json({ message: 'Password reset. Please log in again.' });
  } catch (e) { next(e); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = findUserById(req.user.id);
    if (!user.password) return res.status(400).json({ error: 'NO_PASSWORD', message: 'Account uses social login' });
    if (!await bcrypt.compare(currentPassword, user.password))
      return res.status(401).json({ error: 'INVALID_PASSWORD', message: 'Current password incorrect' });
    updateUser(user.id, { password: await bcrypt.hash(newPassword, 12) });
    revokeAllUserTokens(user.id);
    clearRefresh(res);
    res.json({ message: 'Password changed. Please log in again.' });
  } catch (e) { next(e); }
}

export async function getProfile(req, res) { res.json({ user: safeUser(req.user) }); }
export async function getSessions(req, res) { res.json({ sessions: getUserActiveSessions(req.user.id) }); }
export async function revokeSession(req, res) {
  const s = getStoredRefreshToken(req.params.tokenId);
  if (!s || s.userId !== req.user.id)
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Session not found' });
  revokeRefreshToken(req.params.tokenId);
  res.json({ message: 'Session revoked' });
}
export function getDevEmails(req, res) { res.json({ emails: getEmailLog() }); }