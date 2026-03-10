import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi, ApiError } from '../services/api.js';

export default function ResetPasswordPage() {
  const [params]              = useSearchParams();
  const token                 = params.get('token');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFE]  = useState({});
  const [result, setResult]   = useState(null);

  async function handleForgot(e) {
    e.preventDefault(); setLoading(true); setError('');
    try { setResult(await authApi.forgotPassword(email)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault(); setLoading(true); setError(''); setFE({});
    try { setResult(await authApi.resetPassword({ token, newPassword: password })); }
    catch (err) {
      if (err instanceof ApiError && err.fields) {
        const fe = {}; err.fields.forEach(f => { fe[f.field] = f.message; }); setFE(fe);
      } else { setError(err.message); }
    }
    finally { setLoading(false); }
  }

  if (result) return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <h2 className="auth-title" style={{ marginBottom:12 }}>Done!</h2>
        <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24 }}>{result.message}</p>
        {result._dev_resetToken && (
          <div className="dev-panel" style={{ textAlign:'left', marginBottom:20 }}>
            <div className="dev-panel-title">🧪 Dev: Reset link</div>
            <div className="dev-token">
              <a href={`/reset-password?token=${result._dev_resetToken}`}>Click to reset (dev)</a>
            </div>
          </div>
        )}
        <Link to="/login" className="btn btn-primary" style={{ display:'inline-flex', maxWidth:200 }}>Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon">🔐</div>
          <span className="name">AuthSystem</span>
        </div>
        <h1 className="auth-title">{token ? 'Set new password' : 'Reset password'}</h1>
        <p className="auth-subtitle">{token ? 'Enter your new password' : "We'll email you a reset link"}</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {token ? (
          <form onSubmit={handleReset}>
            <div className="field">
              <label>New password</label>
              <input type="password" value={password} onChange={e => setPass(e.target.value)}
                className={fieldErrors.newPassword ? 'error' : ''}
                placeholder="Min 8 chars, uppercase, number, symbol" />
              {fieldErrors.newPassword && <div className="field-error">{fieldErrors.newPassword}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:8 }}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot}>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:8 }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="auth-link"><Link to="/login">← Back to login</Link></div>
      </div>
    </div>
  );
}