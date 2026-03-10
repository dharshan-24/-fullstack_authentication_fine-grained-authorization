import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function ProtectedRoute({ children, requireVerified = false, requiredPermission }) {
  const { initialized, loading, isAuthenticated, isEmailVerified, hasPermission } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#080810' }}>
        <div style={{ width:32, height:32, border:'2px solid #1a1a2e', borderTopColor:'#7c6fff', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (requireVerified && !isEmailVerified)
    return <Navigate to="/verify-email-notice" replace />;

  if (requiredPermission && !hasPermission(requiredPermission))
    return <Navigate to="/forbidden" replace />;

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, initialized, loading } = useAuth();
  if (!initialized || loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export function Can({ permission, role, children, fallback = null }) {
  const { hasPermission, hasRole } = useAuth();
  if (permission && !hasPermission(permission)) return fallback;
  if (role && !hasRole(Array.isArray(role) ? role : [role])) return fallback;
  return children;
}