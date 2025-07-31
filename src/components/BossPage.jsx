import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBossMonitor } from '../hooks/useBossMonitor'
import { useBossParticipation } from '../hooks/useBossParticipation'
import LoadingSpinner from './LoadingSpinner'
import Navigation from './Navigation'
import BossParticipation from './BossParticipation'

const BossPage = () => {
  const { signOut, userProfile } = useAuth()
  const {
    pendingBosses,
    loading,
    error,
    refreshBosses,
    formatRespawnTime,
    getTimeSinceUpdate,
    bossCount
  } = useBossMonitor()

  const { getParticipationSummary } = useBossParticipation()
  const [forceUpdate, setForceUpdate] = useState(0)

  // Listen for participation changes to trigger re-renders
  useEffect(() => {
    const handleParticipationChange = () => {
      setForceUpdate(prev => prev + 1)
    }

    window.addEventListener('participationChanged', handleParticipationChange)
    return () => {
      window.removeEventListener('participationChanged', handleParticipationChange)
    }
  }, [])

  // Helper function to get boss emoji based on name
  const getBossEmoji = (boss) => {
    const name = boss.monster?.toLowerCase() || boss.name?.toLowerCase() || ''
    
    if (name.includes('dragon')) return '🐉'
    if (name.includes('demon')) return '👹'
    if (name.includes('giant')) return '🗿'
    if (name.includes('beast')) return '🦁'
    if (name.includes('undead')) return '💀'
    if (name.includes('elemental')) return '⚡'
    if (name.includes('timitris')) return '🌸'
    return '👾'
  }

  // Helper function to calculate actual respawn time from boss data
  const calculateRespawnTime = (boss) => {
    // If respawn_time is provided and it's in the future, use it
    if (boss.respawn_time) {
      const respawnDate = new Date(boss.respawn_time)
      const now = new Date()
      if (respawnDate.getTime() > now.getTime()) {
        return respawnDate
      }
    }

    // Otherwise calculate from time_of_death + respawn_hours
    if (boss.time_of_death && boss.respawn_hours) {
      const deathTime = new Date(boss.time_of_death)
      if (!isNaN(deathTime.getTime())) {
        const respawnTime = new Date(deathTime.getTime() + (boss.respawn_hours * 60 * 60 * 1000))
        return respawnTime
      }
    }

    // Fallback to respawn_time even if it's in the past
    if (boss.respawn_time) {
      return new Date(boss.respawn_time)
    }

    return null
  }

  // Get participation level color based on participant count
  const getParticipationLevelColor = (participantCount) => {
    if (participantCount >= 15) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    } else if (participantCount >= 10) {
      return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
    } else if (participantCount >= 1 && participantCount <= 9) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    } else {
      // 0 or negative participants - default gray
      return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
    }
  }

  // Helper function to get boss card styling based on participation
  const getBossCardStyle = (boss) => {
    const bossId = boss.id || boss.monster
    const summary = getParticipationSummary(bossId)
    return getParticipationLevelColor(summary.participating)
  }

  const getTimeStyle = (boss) => {
    const respawnDate = calculateRespawnTime(boss)
    if (!respawnDate || isNaN(respawnDate.getTime())) return 'text-gray-500'

    const now = new Date()
    const diffInMs = respawnDate.getTime() - now.getTime()

    // Available Now - just bold, no color
    if (diffInMs <= 0) return 'text-gray-900 dark:text-white font-bold'
    // All other times - normal styling
    return 'text-gray-700 dark:text-gray-300 font-medium'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-lg">👾</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Boss Monitor
                </h1>
                {userProfile && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, <span className="font-semibold text-orange-600 dark:text-orange-400">{userProfile.username}</span>! 👋
                  </p>
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
          {/* Boss Status Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Incoming Bosses
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {loading ? 'Checking for bosses...' : 
                     error ? 'Failed to load boss data' :
                     bossCount === 0 ? 'No bosses pending spawn' :
                     `${bossCount} boss${bossCount > 1 ? 'es' : ''} pending spawn`}
                  </p>
                  {getTimeSinceUpdate() && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated {getTimeSinceUpdate()}
                    </p>
                  )}
                </div>
                <button
                  onClick={refreshBosses}
                  disabled={loading}
                  className="bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <span>🔄</span>}
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-red-500 text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                      Failed to Load Boss Data
                    </h3>
                    <p className="text-red-600 dark:text-red-500 text-sm">
                      {error}
                    </p>
                  </div>
                </div>
                <button
                  onClick={refreshBosses}
                  className="bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && bossCount === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <LoadingSpinner size="xl" />
                <p className="text-blue-700 dark:text-blue-400 text-lg font-medium">
                  Loading boss information...
                </p>
              </div>
            </div>
          )}

          {/* No Bosses State */}
          {!loading && !error && bossCount === 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
                  All Clear!
                </h3>
                <p className="text-green-600 dark:text-green-500">
                  No bosses are currently pending spawn. Check back later!
                </p>
              </div>
            </div>
          )}

          {/* Boss List */}
          {bossCount > 0 && (
            <div className="grid gap-4">
              {pendingBosses.map((boss, index) => (
                <div
                  key={boss.id || index}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getBossCardStyle(boss)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Boss Image or Emoji */}
                      {boss.display_image || boss.image_url ? (
                        <img
                          src={boss.display_image || boss.image_url}
                          alt={boss.monster || boss.name}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl"
                        style={{ display: boss.display_image || boss.image_url ? 'none' : 'flex' }}
                      >
                        {getBossEmoji(boss)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {boss.monster || boss.name || 'Unknown Boss'}
                        </h3>
                        {boss.name && boss.monster !== boss.name && (
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {boss.name}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          {boss.points && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                              {boss.points} points
                            </span>
                          )}
                          {boss.notes && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                              {boss.notes}
                            </span>
                          )}
                          {boss.respawn_hours && (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {boss.respawn_hours}h respawn cycle
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Respawn Time */}
                    <div className="text-right">
                      <p className={`text-2xl ${getTimeStyle(boss)}`}>
                        {formatRespawnTime(boss) || 'Unknown'}
                      </p>
                      {calculateRespawnTime(boss) && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                          {calculateRespawnTime(boss).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Boss Participation Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <BossParticipation boss={boss} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default BossPage
