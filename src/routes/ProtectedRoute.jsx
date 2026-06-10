import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'

export default function ProtectedRoute({ children, allowedRole }) {
  const location = useLocation()
  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'technician' ? '/tech/dashboard' : '/'} replace />
  }

  return children
}
