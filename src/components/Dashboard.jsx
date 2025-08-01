import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserStatus } from '../hooks/useUserStatus'
import UserList from './UserList'
import LoadingSpinner from './LoadingSpinner'
import Navigation from './Navigation'

const Dashboard = () => {
  const { signOut, userProfile } = useAuth()
  const { status: userStatus, loading, updating, updateStatus } = useUserStatus()



  if (loading) {
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
            Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your hunter status...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Boss Hunting Status
                </h1>
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{userProfile.username}</span>
                      {userProfile.class === 'Orb' && (
                        <>
                          {userProfile.has_arcane_shield && ' 🛡️'}
                          {userProfile.has_group_heal && ' 💚'}
                        </>
                      )}
                      ! 👋
                    </p>
                    {userProfile.class && (
                      <span className="text-lg" title={`${userProfile.class} Class`}>
                        {userProfile.class === 'Orb' && '🔮'}
                        {userProfile.class === 'Sword' && '⚔️'}
                        {userProfile.class === 'Assassin' && '🗡️'}
                        {userProfile.class === 'Mage' && '🪄'}
                        {userProfile.class === 'Dual Blade' && '🗡️⚔️'}
                        {userProfile.class === 'Archer' && '🏹'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Navigation onSignOut={signOut} userProfile={userProfile} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-8 sm:p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Current Status
                </h2>

                {/* Status Display */}
                <div className="mb-8">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                    userStatus === 'available'
                      ? 'bg-green-100 dark:bg-green-900/30 border-4 border-green-200 dark:border-green-700'
                      : 'bg-red-100 dark:bg-red-900/30 border-4 border-red-200 dark:border-red-700'
                  }`}>
                    <span className="text-4xl">
                      {userStatus === 'available' ? '🟢' : '🔴'}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold capitalize ${
                    userStatus === 'available' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {userStatus === 'available' ? 'Available for Hunt!' : 'Away from Keyboard'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {userStatus === 'available'
                      ? 'Ready to take on any boss!'
                      : 'Currently not available for hunting'
                    }
                  </p>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <button
                    onClick={() => updateStatus('available')}
                    disabled={updating || userStatus === 'available'}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      userStatus === 'available'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 cursor-not-allowed border-2 border-green-200 dark:border-green-700'
                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updating && userStatus !== 'available' ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>🟢 Available</>
                    )}
                  </button>
                  <button
                    onClick={() => updateStatus('afk')}
                    disabled={updating || userStatus === 'afk'}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      userStatus === 'afk'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 cursor-not-allowed border-2 border-red-200 dark:border-red-700'
                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updating && userStatus !== 'afk' ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>🔴 AFK</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User List */}
          <UserList />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
