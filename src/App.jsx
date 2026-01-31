import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitTicket from './pages/SubmitTicket';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import Analytics from './pages/Analytics';
import ManageUsers from './pages/ManageUsers';
import { ROLES } from './utils/constants';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/submit"
          element={
            <ProtectedRoute roles={[ROLES.TEACHER]}>
              <SubmitTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.TEACHER]}>
              <TicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.TEACHER]}>
              <TicketDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
