import { findUserByGoogleId, findUserByEmail, createUser, updateUser, safeUser } from '../models/db.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI         = 'http://localhost:3001/api/auth/google/callback';

export function getGoogleAuthUrl(req, res) {
  const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600000, path: '/api/auth' });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID, redirect_uri: REDIRECT_URI,
    response_type: 'code', scope: 'openid email profile', state,
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
}

export async function googleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`http://localhost:5173/login?error=${error}`);
    if (!state || state !== req.cookies.oauth_state)
      return res.redirect('http://localhost:5173/login?error=state_mismatch');

    res.clearCookie('oauth_state', { path: '/api/auth' });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }),
    });
    if (!tokenRes.ok) return res.redirect('http://localhost:5173/login?error=token_failed');

    const { access_token } = await tokenRes.json();
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
    if (!infoRes.ok) return res.redirect('http://localhost:5173/login?error=userinfo_failed');

    const gUser = await infoRes.json();
    let user = findUserByGoogleId(gUser.sub) || findUserByEmail(gUser.email);

    if (user) {
      user = updateUser(user.id, { googleId: gUser.sub, avatar: gUser.picture, lastLoginAt: new Date().toISOString() });
    } else {
      user = createUser({ email: gUser.email, name: gUser.name, googleId: gUser.sub, avatar: gUser.picture });
    }

    const accessToken = generateAccessToken(user);
    const { token: refreshToken } = generateRefreshToken(user.id, req.headers['user-agent'], req.ip);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`http://localhost:5173/oauth-callback?token=${encodeURIComponent(accessToken)}&user=${encodeURIComponent(JSON.stringify(safeUser(user)))}`);
  } catch (e) { next(e); }
}