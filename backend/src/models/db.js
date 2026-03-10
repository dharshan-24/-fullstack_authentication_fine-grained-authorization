import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const db = {
  users: new Map(),
  refreshTokens: new Map(),
  emailVerifications: new Map(),
  passwordResets: new Map(),
};

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  'users:read':     ['admin', 'moderator'],
  'users:write':    ['admin'],
  'users:delete':   ['admin'],
  'content:read':   ['admin', 'moderator', 'user'],
  'content:write':  ['admin', 'moderator', 'user'],
  'content:publish':['admin', 'moderator'],
  'admin:access':   ['admin'],
  'admin:settings': ['admin'],
};

export function createUser({ email, password, name, googleId, avatar, role = ROLES.USER }) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const user = {
    id, email: email.toLowerCase().trim(), password: password || null,
    name, googleId: googleId || null, avatar: avatar || null, role,
    isEmailVerified: !!googleId, isActive: true,
    createdAt: now, updatedAt: now, lastLoginAt: null, loginCount: 0,
  };
  db.users.set(id, user);
  return user;
}

export function findUserByEmail(email) {
  const n = email.toLowerCase().trim();
  for (const u of db.users.values()) if (u.email === n) return u;
  return null;
}

export function findUserById(id) { return db.users.get(id) || null; }

export function findUserByGoogleId(gid) {
  for (const u of db.users.values()) if (u.googleId === gid) return u;
  return null;
}

export function updateUser(id, updates) {
  const user = db.users.get(id);
  if (!user) return null;
  const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
  db.users.set(id, updated);
  return updated;
}

export function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export function hasPermission(role, permission) {
  return (PERMISSIONS[permission] || []).includes(role);
}

// Seed admin user
const adminId = uuidv4();
db.users.set(adminId, {
  id: adminId, email: 'admin@example.com',
  password: bcrypt.hashSync('Admin@123456', 12),
  name: 'Admin User', googleId: null, avatar: null,
  role: 'admin', isEmailVerified: true, isActive: true,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  lastLoginAt: null, loginCount: 0,
});