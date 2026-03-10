import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { contentApi, authApi } from '../services/api.js';
import { Can } from '../components/auth/ProtectedRoute.jsx';

const PERMS = [
  { key:'users:read',      label:'Read Users' },
  { key:'users:write',     label:'Manage Users' },
  { key:'content:read',    label:'Read Content' },
  { key:'content:write',   label:'Write Content' },
  { key:'content:publish', label:'Publish Content' },
  { key:'admin:access',    label:'Admin Access' },
];

export default function DashboardPage() {
  const { user, logout, logoutAll, hasPermission } = useAuth();
  const [tab, setTab]         = useState('overview');
  const [content, setContent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);
  const navigate              = useNavigate();

  async function fetchContent(type) {
    setLoading(true); setContent(null); setMsg(null);
    try {
      const fns = { public: contentApi.public, protected: contentApi.protected, moderator: contentApi.moderator, admin: contentApi.admin };
      setContent({ type, data: await fns[type]() });
    } catch (err) { setMsg({ t:'error', m: err.message }); }
    finally { setLoading(false); }
  }

  async function loadSessions() {
    try { const d = await authApi.sessions(); setSessions(d.sessions); } catch {}
  }

  async function revokeSession(id) {
    try { await authApi.revokeSession(id); setMsg({ t:'success', m:'Session revoked' }); loadSessions(); }
    catch (err) { setMsg({ t:'error', m: err.message }); }
  }

  useEffect(() => { if (tab === 'sessions') loadSessions(); }, [tab]);

  async function handleLogout()    { await logout();    navigate('/login'); }
  async function handleLogoutAll() { await logoutAll(); navigate('/login'); }

  return (
    <div className="app-layout">
      <header className="topbar">
        <Link to="/dashboard" className="topbar-logo">
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', borderRadius:6, display:'grid', placeItems:'center', fontSize:14, marginRight:2 }}>🔐</div>
          AuthSystem
        </Link>
        <nav className="topbar-nav">
          {['overview','content','sessions'].map(t => (
            <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
          <Can permission="admin:access">
            <Link to="/admin" className="nav-link">Admin</Link>
          </Can>
        </nav>
        <div className="topbar-user">
          <div className="avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <main className="page-content">
        {msg && (
          <div className={`alert alert-${msg.t}`} style={{ marginBottom:20 }}>
            {msg.t==='error'?'⚠️':'✅'} {msg.m}
            <button onClick={() => setMsg(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'inherit' }}>✕</button>
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="section">
              <h2 className="section-title">Welcome, {user?.name}</h2>
              <p className="section-subtitle">Your account overview</p>
              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Account Details</div>
                  <div className="card-subtitle">Profile info</div>
                  <table><tbody>
                    {[
                      ['Email',   user?.email],
                      ['Role',    <span className={`badge badge-${user?.role}`}>{user?.role}</span>],
                      ['Verified',user?.isEmailVerified ? <span className="badge badge-verified">✓ Yes</span> : <span className="badge badge-unverified">✗ No</span>],
                      ['Joined',  new Date(user?.createdAt).toLocaleDateString()],
                      ['Logins',  user?.loginCount],
                      ['Auth',    user?.googleId ? '🔵 Google' : '🔑 Password'],
                    ].map(([k,v]) => (
                      <tr key={k}><td style={{ color:'var(--text-2)', width:100, paddingLeft:0 }}>{k}</td><td>{v}</td></tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card">
                  <div className="card-title">Your Permissions</div>
                  <div className="card-subtitle">Role: <span className={`badge badge-${user?.role}`}>{user?.role}</span></div>
                  {PERMS.map(({ key, label }) => (
                    <div className="perm-item" key={key}>
                      <span className="perm-name">{key}</span>
                      <span style={{ color: hasPermission(key) ? 'var(--green)' : 'var(--text-3)', fontSize:16 }}>
                        {hasPermission(key) ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section">
              <div className="card">
                <div className="card-title">Security</div>
                <div className="card-subtitle">Manage your sessions</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setTab('sessions')}>📱 View Sessions</button>
                  <button className="btn btn-danger btn-sm" onClick={handleLogoutAll}>🚪 Terminate All Sessions</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CONTENT */}
        {tab === 'content' && (
          <div className="section">
            <h2 className="section-title">Resource Access</h2>
            <p className="section-subtitle">Test role-based access control</p>
            <div className="grid-2" style={{ marginBottom:20 }}>
              {[
                { type:'public',    label:'🌍 Public',    desc:'No auth required',       color:'var(--green)' },
                { type:'protected', label:'🔒 Protected', desc:'Verified users only',     color:'var(--accent-2)' },
                { type:'moderator', label:'⚡ Moderator', desc:'Moderators + Admins',     color:'var(--yellow)' },
                { type:'admin',     label:'👑 Admin',     desc:'Admins only',             color:'var(--red)' },
              ].map(({ type, label, desc, color }) => (
                <button key={type} onClick={() => fetchContent(type)} style={{
                  textAlign:'left', cursor:'pointer', padding:20,
                  background:'var(--bg-1)', border:`1px solid ${content?.type===type ? color : 'var(--border)'}`,
                  borderRadius:'var(--rl)', transition:'all .15s',
                }}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{label.split(' ')[0]}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize:12, color:'var(--text-2)' }}>{desc}</div>
                </button>
              ))}
            </div>
            {loading && <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>}
            {content && !loading && (
              <div className="card">
                <div className="card-title">Response — {content.type}</div>
                <pre style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-2)', background:'var(--bg-2)', padding:16, borderRadius:'var(--r)', overflow:'auto', maxHeight:300 }}>
                  {JSON.stringify(content.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* SESSIONS */}
        {tab === 'sessions' && (
          <div className="section">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <h2 className="section-title">Active Sessions</h2>
                <p className="section-subtitle">Manage where you're logged in</p>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleLogoutAll}>Terminate All</button>
            </div>
            {sessions.length === 0
              ? <div className="card" style={{ textAlign:'center', color:'var(--text-2)', padding:40 }}>No active sessions</div>
              : sessions.map(s => (
                <div className="session-item" key={s.tokenId}>
                  <div>
                    <div className="session-info">
                      <strong>
                        {s.userAgent?.includes('Chrome') ? '🌐 Chrome' : s.userAgent?.includes('Firefox') ? '🦊 Firefox' : '💻 Browser'}
                        {' · '}{s.ip}
                      </strong>
                      Created {new Date(s.createdAt).toLocaleString()} · Expires {new Date(s.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => revokeSession(s.tokenId)}>Revoke</button>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  );
}