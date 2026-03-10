import { db, safeUser, updateUser, ROLES, PERMISSIONS } from '../models/db.js';

export function getAllUsers(req, res) {
  res.json({ users: [...db.users.values()].map(safeUser) });
}

export function updateUserRole(req, res) {
  const { role } = req.body;
  if (!Object.values(ROLES).includes(role))
    return res.status(400).json({ error: 'INVALID_ROLE' });
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
  if (user.id === req.user.id)
    return res.status(400).json({ error: 'SELF_CHANGE', message: 'Cannot change your own role' });
  res.json({ user: safeUser(updateUser(user.id, { role })) });
}

export function toggleUserStatus(req, res) {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
  if (user.id === req.user.id)
    return res.status(400).json({ error: 'SELF_DISABLE', message: 'Cannot disable yourself' });
  const updated = updateUser(user.id, { isActive: !user.isActive });
  res.json({ message: `Account ${updated.isActive ? 'enabled' : 'disabled'}`, user: safeUser(updated) });
}

export function getAdminDashboard(req, res) {
  const users = [...db.users.values()].map(safeUser);
  const activeSessions = [...db.refreshTokens.values()].filter(t => !t.isRevoked).length;
  res.json({
    dashboard: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      verifiedUsers: users.filter(u => u.isEmailVerified).length,
      activeSessions,
      byRole: Object.values(ROLES).reduce((a, r) => ({ ...a, [r]: users.filter(u => u.role === r).length }), {}),
    }
  });
}

export function getPublicContent(req, res) {
  res.json({ content: [{ id: 1, title: 'Public Post', body: 'Anyone can see this.' }] });
}

export function getProtectedContent(req, res) {
  res.json({ content: [{ id: 2, title: 'Member Content', body: 'Verified users only.' }] });
}

export function getModeratorContent(req, res) {
  res.json({ stats: { pendingReview: 7, flagged: 3 } });
}