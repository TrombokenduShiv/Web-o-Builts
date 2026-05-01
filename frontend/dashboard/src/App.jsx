import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Shell from './components/Shell/Shell';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import Calls from './pages/Calls/Calls';
import Billing from './pages/Billing/Billing';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'rgba(196,184,224,0.6)', fontFamily:'Inter,sans-serif' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Onboarding — protected but outside shell */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Protected — all inside the Shell layout */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Shell /></ProtectedRoute>}
      >
        <Route index element={<Dashboard />} />
        <Route path="calls"     element={<Calls />} />
        <Route path="billing"   element={<Billing />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings"  element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
