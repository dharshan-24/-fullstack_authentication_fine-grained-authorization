import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, contentApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLES = ['admin','moderator','user','guest'];

export default function AdminPage() {
  const { user }          = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]     = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([adminApi.getUsers(), contentApi.admin()]);
      setUsers(u.users); setStats(d.dashboard);
    } catch (err) { setMsg({ t:'error', m: err.message }); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(id, role) {
    try { await adminApi.updateRole(id, role); setMsg({ t:'success', m:'Role updated' }); load(); }
    catch (err) { setMsg({ t:'error', m: err.message }); }
  }

  async function toggleStatus(id) {
    try { const d = await adminApi.toggleStatus(id); setMsg({ t:'success', m: d.message }); load(); }
    catch (err) { setMsg({ t:'error', m: err.message }); }
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <Link to="/dashboard" className="topbar-logo">
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', borderRadius:6, display:'grid', placeItems:'center', fontSize:14, marginRight:2 }}>🔐</div>
          AuthSystem
        </Link>
        <nav className="topbar-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <span className="nav-link active">Admin</span>
        </nav>
        <div className="topbar-user">
          <div className="avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
      </header>

      <main className="page-content">
        {msg && (
          <div className={`alert alert-${msg.t}`} style={{ marginBottom:20 }}>
            {msg.t==='error'?'⚠️':'✅'} {msg.m}
            <button onClick={() => setMsg(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'inherit' }}>✕</button>
          </div>
        )}

        <div className="section">
          <h2 className="section-title">Admin Panel</h2>
          <p className="section-subtitle">System overview and user management</p>

          {stats && (
            <div className="grid-4" style={{ marginBottom:24 }}>
              {[
                { label:'Total Users',     value: stats.totalUsers,    color:'var(--accent-2)' },
                { label:'Active',          value: stats.activeUsers,   color:'var(--green)' },
                { label:'Verified',        value: stats.verifiedUsers, color:'var(--blue)' },
                { label:'Sessions',        value: stats.activeSessions,color:'var(--yellow)' },
              ].map(({ label, value, color }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">User Management</div>
          <div className="card-subtitle">Change roles and account status</div>
          {loading
            ? <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>User</th><th>Status</th><th>Role</th><th>Verified</th><th>Last Login</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div className="avatar" style={{ width:28, height:28, fontSize:11 }}>
                              {u.avatar ? <img src={u.avatar} alt={u.name} /> : u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13 }}>{u.name}</div>
                              <div style={{ fontSize:11, color:'var(--text-2)', fontFamily:'DM Mono,monospace' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ width:8, height:8, borderRadius:'50%', display:'inline-block', background: u.isActive ? 'var(--green)' : 'var(--red)', marginRight:6 }} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </td>
                        <td>
                          {u.id === user?.id
                            ? <span className={`badge badge-${u.role}`}>{u.role}</span>
                            : (
                              <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                                style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'4px 8px', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            )
                          }
                        </td>
                        <td>
                          {u.isEmailVerified ? <span className="badge badge-verified">✓</span> : <span className="badge badge-unverified">✗</span>}
                        </td>
                        <td style={{ color:'var(--text-2)', fontSize:12 }}>
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        <td>
                          {u.id !== user?.id && (
                            <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleStatus(u.id)}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}