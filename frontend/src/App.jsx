import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { getSubdomain } from './utils/subdomain';
import { useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterWithToken from './pages/RegisterWithToken'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NGODashboard from './pages/NGODashboard'
import BloodBankDashboard from './pages/BloodBankDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blood-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  // Redirect logged in users to their dashboard
  const getDashboardRoute = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'ngo': return '/ngo'
      case 'blood_bank': return '/blood-bank'
      default: return '/dashboard'
    }
  }

  const subdomain = getSubdomain();
  const location = useLocation();

  // Subdomain Routing Guard
  // If we are on a specific subdomain (e.g. admin.bharakt.in), we should:
  // 1. Only allow access to that role's routes
  // 2. Redirect '/' to '/login' or dashboard
  if (subdomain !== 'main') {
    // Prevent access to other portals
    if (subdomain === 'admin' && (location.pathname.startsWith('/ngo') || location.pathname.startsWith('/blood-bank') || location.pathname.startsWith('/dashboard'))) {
      return <Navigate to="/admin" replace />;
    }
    if (subdomain === 'ngo' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/blood-bank') || location.pathname.startsWith('/dashboard'))) {
      return <Navigate to="/ngo" replace />;
    }
    if (subdomain === 'blood_bank' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/ngo') || location.pathname.startsWith('/dashboard'))) {
      return <Navigate to="/blood-bank" replace />;
    }

    // Redirect root to login on subdomains
    if (location.pathname === '/') {
      // If logged in, go to dashboard, else login
      // Note: getDashboardRoute() handles based on user role.
      // Only if user matches subdomain?
      return <Navigate to={user ? getDashboardRoute() : '/login'} replace />;
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Register />}
      />
      <Route path="/register/:type/:token" element={<RegisterWithToken />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* NGO Dashboard */}
      <Route
        path="/ngo/*"
        element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NGODashboard />
          </ProtectedRoute>
        }
      />

      {/* Blood Bank Dashboard */}
      <Route
        path="/blood-bank/*"
        element={
          <ProtectedRoute allowedRoles={['blood_bank']}>
            <BloodBankDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

