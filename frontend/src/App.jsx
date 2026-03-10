import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute.jsx';
import LoginPage          from './pages/LoginPage.jsx';
import RegisterPage       from './pages/RegisterPage.jsx';
import DashboardPage      from './pages/DashboardPage.jsx';
import AdminPage          from './pages/AdminPage.jsx';
import VerifyEmailPage    from './pages/VerifyEmailPage.jsx';
import OAuthCallbackPage  from './pages/OAuthCallbackPage.jsx';
import ResetPasswordPage  from './pages/ResetPasswordPage.jsx';
import ForbiddenPage      from './pages/ForbiddenPage.jsx';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path="/reset-password"    element={<ResetPasswordPage />} />
          <Route path="/verify-email"      element={<VerifyEmailPage />} />
          <Route path="/verify-email-notice" element={<VerifyEmailPage notice />} />
          <Route path="/oauth-callback"    element={<OAuthCallbackPage />} />
          <Route path="/forbidden"         element={<ForbiddenPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requireVerified>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredPermission="admin:access">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/"  element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="*"  element={<ForbiddenPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
