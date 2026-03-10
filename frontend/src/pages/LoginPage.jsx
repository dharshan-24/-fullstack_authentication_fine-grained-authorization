import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authApi, ApiError } from '../services/api.js';

export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [fieldErrors, setFE]      = useState({});
  const { login }                 = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const from                      = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setFE({}); setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        const fe = {}; err.fields.forEach(f => { fe[f.field] = f.message; }); setFE(fe);
      } else { setError(err.message || 'Login failed'); }
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    try { const { url } = await authApi.getGoogleUrl(); window.location.href = url; }
    catch { setError('Failed to start Google login.'); }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon">🔐</div>
          <span className="name">AuthSystem</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <button className="btn btn-google" onClick={handleGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={fieldErrors.email ? 'error' : ''} placeholder="you@example.com"
              autoComplete="email" required />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>

          <div className="field">
            <label style={{ display:'flex', justifyContent:'space-between' }}>
              Password
              <Link to="/reset-password" style={{ color:'var(--accent-2)', fontSize:12, textDecoration:'none' }}>
                Forgot password?
              </Link>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className={fieldErrors.password ? 'error' : ''} placeholder="••••••••"
              autoComplete="current-password" required />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:8 }}>
            {loading ? <span className="spinner" style={{ width:18, height:18 }} /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div className="dev-panel" style={{ marginTop:20, marginBottom:0 }}>
          <div className="dev-panel-title">🧪 Demo Credentials</div>
          <div className="dev-token">admin@example.com &nbsp;/&nbsp; Admin@123456</div>
        </div>
      </div>
    </div>
  );
}