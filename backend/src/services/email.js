const log = [];
export const getEmailLog = () => log;

export async function sendVerificationEmail(user, token) {
  const url = `http://localhost:5173/verify-email?token=${token}`;
  const entry = { to: user.email, subject: 'Verify your email', url, token, sentAt: new Date().toISOString() };
  log.push(entry);
  console.log(`📧 Verification email → ${user.email}`);
  console.log(`   🔗 ${url}`);
  return entry;
}

export async function sendPasswordResetEmail(user, token) {
  const url = `http://localhost:5173/reset-password?token=${token}`;
  const entry = { to: user.email, subject: 'Reset your password', url, token, sentAt: new Date().toISOString() };
  log.push(entry);
  console.log(`📧 Password reset email → ${user.email}`);
  console.log(`   🔗 ${url}`);
  return entry;
}