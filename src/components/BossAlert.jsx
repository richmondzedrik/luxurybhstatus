import React, { useState, useEffect } from 'react'
import { useBossMonitor } from '../hooks/useBossMonitor'
import { useBossParticipation } from '../hooks/useBossParticipation'
import LoadingSpinner from './LoadingSpinner'

const BossAlert = () => {
  const {
    pendingBosses,
    loading,
    error,
    refreshBosses,
    getTimeSinceUpdate,
    formatRespawnTime,
    bossCount
  } = useBossMonitor()

  const { getParticipationSummary } = useBossParticipation()
  const [isExpanded, setIsExpanded] = useState(false)
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
    return '👾' // Default boss emoji
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
      return 'bg-green-500 text-white border-green-600'
    } else if (participantCount >= 10) {
      return 'bg-orange-500 text-white border-orange-600'
    } else if (participantCount >= 1 && participantCount <= 9) {
      return 'bg-red-500 text-white border-red-600'
    } else {
      // 0 or negative participants - default gray
      return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
    }
  }

  // Helper function to get boss card styling based on participation
  const getBossCardStyle = (boss) => {
    const bossId = boss.id || boss.monster
    const summary = getParticipationSummary(bossId)
    return getParticipationLevelColor(summary.participating)
  }

  if (loading && bossCount === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="sm" />
          <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
            Checking for incoming bosses...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                Failed to load boss information
              </p>
              <p className="text-red-600 dark:text-red-500 text-xs">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={refreshBosses}
            className="bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (bossCount === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-green-500 text-lg">✅</span>
            <div>
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                No incoming bosses
              </p>
              <p className="text-green-600 dark:text-green-500 text-xs">
                All clear! {getTimeSinceUpdate() && `Updated ${getTimeSinceUpdate()}`}
              </p>
            </div>
          </div>
          <button
            onClick={refreshBosses}
            disabled={loading}
            className="bg-green-100 dark:bg-green-800/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-700 dark:text-green-400 px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="xs" /> : '🔄'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-orange-500 text-lg animate-pulse">🚨</span>
          <div>
            <p className="text-orange-700 dark:text-orange-400 text-sm font-bold">
              {bossCount} Incoming Boss{bossCount > 1 ? 'es' : ''}!
            </p>
            <p className="text-orange-600 dark:text-orange-500 text-xs">
              {getTimeSinceUpdate() && `Updated ${getTimeSinceUpdate()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-orange-100 dark:bg-orange-800/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={refreshBosses}
            disabled={loading}
            className="bg-orange-100 dark:bg-orange-800/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="xs" /> : '🔄'}
          </button>
        </div>
      </div>

      {/* Boss List */}
      {isExpanded && (
        <div className="space-y-2">
          {pendingBosses.map((boss, index) => (
            <div
              key={boss.id || index}
              className={`p-3 rounded-lg border-2 ${getBossCardStyle(boss)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Boss Image or Emoji */}
                  {boss.display_image || boss.image_url ? (
                    <img
                      src={boss.display_image || boss.image_url}
                      alt={boss.monster || boss.name}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'inline'
                      }}
                    />
                  ) : null}
                  <span
                    className="text-2xl"
                    style={{ display: boss.display_image || boss.image_url ? 'none' : 'inline' }}
                  >
                    {getBossEmoji(boss)}
                  </span>

                  <div>
                    <p className="font-semibold">
                      {boss.monster || boss.name || 'Unknown Boss'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm opacity-90">
                      {boss.name && boss.monster !== boss.name && <span>{boss.name}</span>}
                      {boss.points && <span>• {boss.points} pts</span>}
                      {boss.notes && <span>• {boss.notes}</span>}
                      {boss.respawn_hours && <span>• {boss.respawn_hours}h respawn</span>}
                    </div>
                  </div>
                </div>

                {/* Respawn Time */}
                <div className="text-right text-sm opacity-90">
                  <p className="font-semibold">
                    {formatRespawnTime(boss) || 'Unknown'}
                  </p>
                  {calculateRespawnTime(boss) && (
                    <p className="font-mono text-xs">
                      {calculateRespawnTime(boss).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BossAlert
