let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) { accessToken = token; }
export function getAccessToken() { return accessToken; }
export function clearAccessToken() { accessToken = null; }

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  }).then(async (res) => {
    if (!res.ok) { accessToken = null; throw new Error('Refresh failed'); }
    const data = await res.json();
    accessToken = data.accessToken;
    return data;
  }).finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function request(endpoint, options = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`/api${endpoint}`, {
    ...options, headers, credentials: 'include',
  });

  if (res.status === 401 && retry) {
    const err = await res.json().catch(() => ({}));
    if (err.error === 'TOKEN_EXPIRED') {
      try {
        await refreshAccessToken();
        return request(endpoint, options, false);
      } catch {
        accessToken = null;
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired. Please log in again.');
      }
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error, data.message, data.fields);
  return data;
}

export const authApi = {
  register:           (d) => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login:              (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  logout:             ()  => request('/auth/logout', { method: 'POST' }),
  logoutAll:          ()  => request('/auth/logout-all', { method: 'POST' }),
  refresh:            refreshAccessToken,
  verifyEmail:        (token) => request(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword:     (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword:      (d) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(d) }),
  changePassword:     (d) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(d) }),
  me:                 ()  => request('/auth/me'),
  sessions:           ()  => request('/auth/sessions'),
  revokeSession:      (id) => request(`/auth/sessions/${id}`, { method: 'DELETE' }),
  getGoogleUrl:       ()  => request('/auth/google'),
};

export const contentApi = {
  public:    () => request('/content/public'),
  protected: () => request('/content/protected'),
  moderator: () => request('/content/moderator'),
  admin:     () => request('/content/admin'),
};

export const adminApi = {
  getUsers:     ()        => request('/admin/users'),
  updateRole:   (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  toggleStatus: (id)      => request(`/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
};

export const devApi = {
  getEmails: () => request('/dev/emails'),
};