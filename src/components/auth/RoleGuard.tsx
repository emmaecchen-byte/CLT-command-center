import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { canAccessPath } from '../../auth/permissions'

export function RoleGuard() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (user && !canAccessPath(user.role, pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
