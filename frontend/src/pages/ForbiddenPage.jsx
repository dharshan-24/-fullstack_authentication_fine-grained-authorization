import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ForbiddenPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🚫</div>
        <h1 className="auth-title">Access Denied</h1>
        <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:28 }}>
          You don't have permission to view this page.
        </p>
        <Link to={isAuthenticated ? '/dashboard' : '/login'}
          className="btn btn-primary" style={{ display:'inline-flex', maxWidth:220 }}>
          {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
        </Link>
      </div>
    </div>
  );
}