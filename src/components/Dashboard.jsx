import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserStatus } from '../hooks/useUserStatus'
import UserList from './UserList'
import LoadingSpinner from './LoadingSpinner'

const Dashboard = () => {
  const { signOut, userProfile } = useAuth()
  const { status: userStatus, loading, updating, updateStatus } = useUserStatus()



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Boss Hunting Status
                </h1>
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">
                      Welcome back, <span className="font-semibold text-blue-600">{userProfile.username}</span>
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
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={signOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100">
            <div className="px-6 py-8 sm:p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Your Current Status
                </h2>

                {/* Status Display */}
                <div className="mb-8">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                    userStatus === 'available'
                      ? 'bg-green-100 border-4 border-green-200'
                      : 'bg-red-100 border-4 border-red-200'
                  }`}>
                    <span className="text-4xl">
                      {userStatus === 'available' ? '🟢' : '🔴'}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold capitalize ${
                    userStatus === 'available' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {userStatus === 'available' ? 'Available for Hunt!' : 'Away from Keyboard'}
                  </div>
                  <p className="text-gray-600 mt-2">
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
                        ? 'bg-green-100 text-green-800 cursor-not-allowed border-2 border-green-200'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                        ? 'bg-red-100 text-red-800 cursor-not-allowed border-2 border-red-200'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
