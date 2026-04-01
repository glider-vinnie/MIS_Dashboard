import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * ProtectedRoute — wraps child routes.
 * Redirects to "/" (login) if there is no auth token in the store.
 * Optionally accepts `allowedRoles` to restrict by role.
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>             // any authenticated user
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>  // admin only
 */
function ProtectedRoute({ allowedRoles }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)
  const location = useLocation()

  // 1. Not authenticated → redirect to login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // 2. Authenticated but role not permitted → redirect to dashboard with warning
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  // 3. Authorised → render nested routes
  return <Outlet />
}

export default ProtectedRoute
