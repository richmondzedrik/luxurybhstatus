import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import VerificationRequired from './VerificationRequired'

const VerifiedRoute = ({ children }) => {
  const { user, userProfile, loading, verificationLoading } = useAuth()

  // Show loading while authentication or verification is being checked
  if (loading || verificationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
        <div className="text-center">
          <div className="mb-6 flex flex-col items-center">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <LoadingSpinner size="xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Checking Account Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your access permissions...
          </p>
        </div>
      </div>
    )
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />
  }

  // Show loading if user exists but profile is still being loaded
  if (user && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
        <div className="text-center">
          <div className="mb-6 flex flex-col items-center">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">👤</span>
            </div>
            <LoadingSpinner size="xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading User Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Getting your verification status...
          </p>
        </div>
      </div>
    )
  }

  // Show loading if verification status is undefined (still being determined)
  if (userProfile && userProfile.is_verified === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
        <div className="text-center">
          <div className="mb-6 flex flex-col items-center">
            <div className="h-16 w-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⏳</span>
            </div>
            <LoadingSpinner size="xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Checking Verification Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Determining your access level...
          </p>
        </div>
      </div>
    )
  }

  // If user is not verified, show verification required page
  if (userProfile && userProfile.is_verified === false) {
    return <VerificationRequired />
  }

  // If user is verified, render the protected content
  return children
}

export default VerifiedRoute
