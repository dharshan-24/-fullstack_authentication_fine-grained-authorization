import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { setUserFromOAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userParam = params.get('user');
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setUserFromOAuth(token, user);
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login?error=callback_failed', { replace: true });
      }
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, []);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 16px' }} />
        <p style={{ color:'var(--text-2)', fontSize:14 }}>Completing sign in...</p>
      </div>
    </div>
  );
}