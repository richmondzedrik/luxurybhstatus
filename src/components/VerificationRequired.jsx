import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const VerificationRequired = () => {
  const { userProfile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)

    // Show refreshing state for a moment, then reload
    setTimeout(() => {
      console.log('🔄 Verification: User requested status refresh')
      window.location.reload()
    }, 1500)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AFK Arena Boss Hunting
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {userProfile?.username}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="h-24 w-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">⏳</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Account Verification Required
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your account needs to be verified before you can access the boss hunting system.
          </p>
        </div>

        {/* Verification Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                How to Get Verified
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-lg">
                  To get your account verified, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-lg">
                  <li>
                    <strong>Join the LuxuryPH Discord server</strong> if you haven't already
                  </li>
                  <li>
                    <strong>Go to the #general chat channel</strong>
                  </li>
                  <li>
                    <strong>Send a message</strong> mentioning your username: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">{userProfile?.username}</code>
                  </li>
                  <li>
                    <strong>Wait for an admin</strong> to verify your account
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-600">
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    💡 <strong>Tip:</strong> Make sure to mention that you're requesting verification for the AFK Arena Boss Hunting system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Check */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Already verified?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              If an admin has already verified your account, click the button below to refresh your status.
            </p>
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Check Verification Status</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Having trouble? Contact an admin in the LuxuryPH Discord server for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerificationRequired
