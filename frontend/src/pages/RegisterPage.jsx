import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ApiError } from '../services/api.js';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[a-z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { w:'25%',  c:'var(--red)',    l:'Weak' };
  if (s <= 4) return { w:'60%',  c:'var(--yellow)', l:'Fair' };
  return       { w:'100%', c:'var(--green)',  l:'Strong' };
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErrors, setFE]    = useState({});
  const [success, setSuccess]   = useState(null);
  const { register }            = useAuth();
  const str                     = password ? strength(password) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setFE({}); setLoading(true);
    try {
      const data = await register(email, password, name);
      setSuccess(data);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        const fe = {}; err.fields.forEach(f => { fe[f.field] = f.message; }); setFE(fe);
      } else { setError(err.message || 'Registration failed'); }
    } finally { setLoading(false); }
  }

  if (success) return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
        <h2 className="auth-title">Check your email</h2>
        <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24 }}>
          Verification link sent to <strong style={{ color:'var(--text)' }}>{email}</strong>
        </p>
        {success._dev_verificationToken && (
          <div className="dev-panel" style={{ textAlign:'left', marginBottom:20 }}>
            <div className="dev-panel-title">🧪 Dev: click to verify</div>
            <div className="dev-token">
              <a href={`/verify-email?token=${success._dev_verificationToken}`}>Verify my email</a>
            </div>
          </div>
        )}
        <Link to="/login" className="btn btn-primary" style={{ display:'inline-flex', maxWidth:200 }}>
          Go to Login
        </Link>
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join today</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className={fieldErrors.name ? 'error' : ''} placeholder="Jane Smith" />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>
          <div className="field">
            <label>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={fieldErrors.email ? 'error' : ''} placeholder="you@example.com" />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className={fieldErrors.password ? 'error' : ''}
              placeholder="Min 8 chars, uppercase, number, symbol" />
            {str && (
              <>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width:str.w, background:str.c }} />
                </div>
                <div style={{ fontSize:11, color:str.c, marginTop:4, fontFamily:'DM Mono,monospace' }}>{str.l} password</div>
              </>
            )}
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:8 }}>
            {loading ? <span className="spinner" style={{ width:18, height:18 }} /> : 'Create account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}