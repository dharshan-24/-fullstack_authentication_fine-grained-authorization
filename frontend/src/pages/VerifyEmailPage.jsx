import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function VerifyEmailPage({ notice = false }) {
  const [params]  = useSearchParams();
  const token     = params.get('token');
  const [status, setStatus]     = useState(notice ? 'notice' : 'loading');
  const [email, setEmail]       = useState('');
  const [resending, setResend]  = useState(false);
  const [result, setResult]     = useState(null);
  const { user }                = useAuth();

  useEffect(() => {
    if (notice || !token) return;
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token, notice]);

  async function resend() {
    const e = email || user?.email;
    if (!e) return;
    setResend(true);
    try { setResult(await authApi.resendVerification(e)); }
    catch (err) { setResult({ message: err.message }); }
    finally { setResend(false); }
  }

  const map = {
    loading: { icon:'⏳', title:'Verifying...' },
    success: { icon:'✅', title:'Email verified!',        sub:'Your account is fully activated.' },
    error:   { icon:'❌', title:'Link invalid or expired', sub:'This verification link has expired.' },
    notice:  { icon:'📬', title:'Verify your email',      sub:'Click the link in your inbox to activate your account.' },
  };
  const c = map[status];

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:20 }}>{c.icon}</div>
        <h2 className="auth-title">{c.title}</h2>
        {c.sub && <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24 }}>{c.sub}</p>}

        {status === 'success' && (
          <Link to="/dashboard" className="btn btn-primary" style={{ display:'inline-flex', maxWidth:200 }}>
            Go to Dashboard
          </Link>
        )}

        {(status === 'error' || status === 'notice') && (
          <div>
            {!user && (
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 14px', color:'var(--text)', fontSize:14, width:'100%', marginBottom:12, outline:'none' }} />
            )}
            <button className="btn btn-primary" onClick={resend} disabled={resending}>
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
            {result && (
              <div className="alert alert-success" style={{ marginTop:12, textAlign:'left' }}>
                {result.message}
                {result._dev_verificationToken && (
                  <div style={{ marginTop:8 }}>
                    <a href={`/verify-email?token=${result._dev_verificationToken}`} style={{ color:'var(--accent-2)' }}>Dev: Click to verify</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop:20 }}>
          <Link to="/login" style={{ color:'var(--text-2)', fontSize:13, textDecoration:'none' }}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}