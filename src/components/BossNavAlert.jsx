import React, { useState, useEffect } from 'react'
import { useBossMonitor } from '../hooks/useBossMonitor'
import { useBossParticipation } from '../hooks/useBossParticipation'
import LoadingSpinner from './LoadingSpinner'
import BossParticipation from './BossParticipation'

const BossNavAlert = () => {
  const {
    pendingBosses,
    loading,
    error,
    refreshBosses,
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
      return 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
    }
  }

  // Helper function to get boss card styling based on participation
  const getBossCardStyle = (boss) => {
    const bossId = boss.id || boss.monster
    const summary = getParticipationSummary(bossId)
    return getParticipationLevelColor(summary.participating)
  }

  // Helper function to get neutral text styling
  const getTimeTextStyle = (boss) => {
    const respawnDate = calculateRespawnTime(boss)
    if (!respawnDate || isNaN(respawnDate.getTime())) return 'text-gray-500'

    const now = new Date()
    const diffInMs = respawnDate.getTime() - now.getTime()

    // Available Now - just bold, no color
    if (diffInMs <= 0) return 'text-gray-900 dark:text-white font-bold'
    // All other times - normal styling
    return 'text-gray-700 dark:text-gray-300 font-medium'
  }

  if (loading && bossCount === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <LoadingSpinner size="xs" />
        <span className="text-blue-700 dark:text-blue-400 text-sm">Checking bosses...</span>
      </div>
    )
  }

  if (error) {
    return (
      <button
        onClick={refreshBosses}
        className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
      >
        <span className="text-red-500 text-sm">⚠️</span>
        <span className="text-red-700 dark:text-red-400 text-sm">Boss API Error</span>
      </button>
    )
  }

  if (bossCount === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <span className="text-green-500 text-sm">✅</span>
        <span className="text-green-700 dark:text-green-400 text-sm">No bosses</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Compact Boss Counter */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors"
      >
        <span className="text-orange-500 text-sm animate-pulse">🚨</span>
        <span className="text-orange-700 dark:text-orange-400 text-sm font-medium">
          {bossCount} Boss{bossCount > 1 ? 'es' : ''}
        </span>
        <span className="text-orange-600 dark:text-orange-500 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded Boss List */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Incoming Bosses
              </h3>
              <button
                onClick={refreshBosses}
                disabled={loading}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {loading ? <LoadingSpinner size="xs" /> : '🔄'}
              </button>
            </div>
            
            <div className="space-y-2">
              {pendingBosses.map((boss, index) => (
                <div
                  key={boss.id || index}
                  className={`p-3 rounded-lg border ${getBossCardStyle(boss)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Boss Image or Emoji */}
                      {boss.display_image || boss.image_url ? (
                        <img
                          src={boss.display_image || boss.image_url}
                          alt={boss.monster || boss.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'inline'
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-lg"
                        style={{ display: boss.display_image || boss.image_url ? 'none' : 'inline' }}
                      >
                        {getBossEmoji(boss)}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {boss.monster || boss.name || 'Unknown Boss'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          {boss.name && boss.monster !== boss.name && (
                            <span>{boss.name}</span>
                          )}
                          {boss.points && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1 rounded">
                              {boss.points}pts
                            </span>
                          )}
                          {boss.notes && (
                            <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 rounded">
                              {boss.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Respawn Time */}
                    <div className="text-right">
                      <p className={`text-sm ${getTimeTextStyle(boss)}`}>
                        {formatRespawnTime(boss) || 'Unknown'}
                      </p>
                      {calculateRespawnTime(boss) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {calculateRespawnTime(boss).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Compact Participation */}
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <BossParticipation boss={boss} compact={true} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BossNavAlert
