import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <LoadingSpinner size="xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Boss Hunting Status</h2>
          <p className="text-gray-600">Preparing your hunting dashboard...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoute
