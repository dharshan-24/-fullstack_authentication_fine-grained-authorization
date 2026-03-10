import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';

const ACCESS_SECRET  = process.env.ACCESS_SECRET  || 'change-me-access-secret-32chars!!';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'change-me-refresh-secret-32chars!';
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: '15m', issuer: 'authsys', audience: 'client' }
  );
}

export function generateRefreshToken(userId, userAgent, ip) {
  const tokenId = uuidv4();
  const token = jwt.sign(
    { sub: userId, jti: tokenId, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d', issuer: 'authsys', audience: 'client' }
  );
  db.refreshTokens.set(tokenId, {
    tokenId, userId, token,
    userAgent: userAgent || 'unknown', ip: ip || 'unknown',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + REFRESH_MS).toISOString(),
    isRevoked: false, replacedByTokenId: null,
  });
  return { token, tokenId };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { issuer: 'authsys', audience: 'client' });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, { issuer: 'authsys', audience: 'client' });
}

export function revokeRefreshToken(tokenId, replacedBy = null) {
  const s = db.refreshTokens.get(tokenId);
  if (s) db.refreshTokens.set(tokenId, { ...s, isRevoked: true, replacedByTokenId: replacedBy, revokedAt: new Date().toISOString() });
}

export function revokeAllUserTokens(userId) {
  for (const [id, t] of db.refreshTokens.entries())
    if (t.userId === userId && !t.isRevoked)
      db.refreshTokens.set(id, { ...t, isRevoked: true, revokedAt: new Date().toISOString() });
}

export function getStoredRefreshToken(tokenId) { return db.refreshTokens.get(tokenId) || null; }

export function getUserActiveSessions(userId) {
  const now = new Date();
  return [...db.refreshTokens.values()]
    .filter(t => t.userId === userId && !t.isRevoked && new Date(t.expiresAt) > now)
    .map(({ tokenId, userAgent, ip, createdAt, expiresAt }) => ({ tokenId, userAgent, ip, createdAt, expiresAt }));
}

export function generateVerificationToken(userId, type) {
  const token = uuidv4() + '-' + uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  (type === 'email' ? db.emailVerifications : db.passwordResets).set(token, { userId, expiresAt });
  return token;
}

export function consumeVerificationToken(token, type) {
  const store = type === 'email' ? db.emailVerifications : db.passwordResets;
  const data = store.get(token);
  if (!data || new Date(data.expiresAt) < new Date()) { store.delete(token); return null; }
  store.delete(token);
  return data;
}