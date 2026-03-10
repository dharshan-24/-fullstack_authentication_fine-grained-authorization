import { verifyAccessToken } from '../utils/tokens.js';
import { findUserById, hasPermission } from '../models/db.js';

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });

    const payload = verifyAccessToken(header.slice(7));
    if (payload.type !== 'access')
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid token type' });

    const user = findUserById(payload.sub);
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Access token expired' });
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid token' });
  }
}

export function requireEmailVerified(req, res, next) {
  if (!req.user.isEmailVerified)
    return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email first' });
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: 'FORBIDDEN', message: `Required role: ${roles.join(' or ')}` });
    next();
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user?.role, permission))
      return res.status(403).json({ error: 'FORBIDDEN', message: `Missing permission: ${permission}` });
    next();
  };
}