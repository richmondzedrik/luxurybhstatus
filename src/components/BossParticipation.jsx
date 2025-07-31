import React, { useState } from 'react'
import { useBossParticipation } from '../hooks/useBossParticipation'
import { useAuth } from '../contexts/AuthContext'

const BossParticipation = ({ boss, compact = false }) => {
  const { userProfile } = useAuth()
  const {
    getParticipationStatus,
    setParticipationStatus,
    getBossParticipants,
    getParticipationSummary,
    loading
  } = useBossParticipation()
  
  const [showParticipants, setShowParticipants] = useState(false)
  
  const bossId = boss.id || boss.monster
  const currentStatus = getParticipationStatus(bossId)
  const participants = getBossParticipants(bossId)
  const summary = getParticipationSummary(bossId)



  const handleStatusChange = (status) => {
    setParticipationStatus(bossId, status)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'participating': return '✅'
      case 'not_participating': return '❌'
      case 'maybe': return '❓'
      default: return '⚪'
    }
  }

  const getStatusColor = (status, isSelected = false) => {
    switch (status) {
      case 'participating':
        return isSelected
          ? 'bg-green-500 text-white border-green-600 shadow-lg'
          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600'
      case 'not_participating':
        return isSelected
          ? 'bg-red-500 text-white border-red-600 shadow-lg'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-600'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    }
  }

  const getClassIcon = (className) => {
    switch (className) {
      case 'Orb': return '🔮'
      case 'Sword': return '⚔️'
      case 'Assassin': return '🗡️'
      case 'Mage': return '🪄'
      case 'Dual Blade': return '🗡️⚔️'
      case 'Archer': return '🏹'
      default: return '👤'
    }
  }

  // Get participation level color based on participant count
  const getParticipationLevelColor = (participantCount) => {
    if (participantCount >= 15) {
      return {
        bg: 'bg-green-500',
        border: 'border-green-600',
        text: 'text-white',
        label: 'Excellent Turnout'
      }
    } else if (participantCount >= 10) {
      return {
        bg: 'bg-orange-500',
        border: 'border-orange-600',
        text: 'text-white',
        label: 'Good Turnout'
      }
    } else if (participantCount >= 1 && participantCount <= 9) {
      return {
        bg: 'bg-red-500',
        border: 'border-red-600',
        text: 'text-white',
        label: 'Need More Players'
      }
    } else {
      // 0 or negative participants - no badge shown
      return null
    }
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {/* Participation Summary */}
        <div className="flex items-center space-x-1 text-xs">
          {summary.participating > 0 && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
              ✅ {summary.participating}
            </span>
          )}
          {summary.notParticipating > 0 && (
            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
              ❌ {summary.notParticipating}
            </span>
          )}
        </div>

        {/* Quick Status Toggle */}
        <button
          onClick={() => handleStatusChange(currentStatus === 'participating' ? null : 'participating')}
          disabled={loading}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            currentStatus === 'participating' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30'
          }`}
        >
          {getStatusIcon(currentStatus === 'participating' ? 'participating' : null)}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Current User Participation */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Your Participation
        </h4>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleStatusChange(currentStatus === 'participating' ? null : 'participating')}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              currentStatus === 'participating'
                ? 'bg-green-500 text-white border-green-600 shadow-lg transform scale-105'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300'
            }`}
          >
            <span>✅</span>
            <span>Participating</span>
          </button>

          <button
            onClick={() => handleStatusChange(currentStatus === 'not_participating' ? null : 'not_participating')}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              currentStatus === 'not_participating'
                ? 'bg-red-500 text-white border-red-600 shadow-lg transform scale-105'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300'
            }`}
          >
            <span>❌</span>
            <span>Can't Join</span>
          </button>
        </div>
      </div>

      {/* Participation Summary */}
      {summary.total > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Team Status ({summary.total} responses)
            </h4>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {showParticipants ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Participation Level Indicator */}
          {summary.participating > 0 && (
            <div className="mb-3">
              {(() => {
                const levelColor = getParticipationLevelColor(summary.participating)
                return levelColor ? (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}>
                    <span>👥</span>
                    <span>{summary.participating} participants - {levelColor.label}</span>
                  </div>
                ) : null
              })()}
            </div>
          )}
          
          <div className="flex items-center space-x-3 text-sm">
            {summary.participating > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-gray-700 dark:text-gray-300">{summary.participating} joining</span>
              </div>
            )}
            {summary.notParticipating > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-red-600 dark:text-red-400">❌</span>
                <span className="text-gray-700 dark:text-gray-300">{summary.notParticipating} can't join</span>
              </div>
            )}
          </div>

          {/* Detailed Participant List */}
          {showParticipants && (
            <div className="mt-3 space-y-2">
              {participants.participating.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Participating:</h5>
                  <div className="flex flex-wrap gap-1">
                    {participants.participating.map((participant) => (
                      <span
                        key={participant.username}
                        className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs"
                      >
                        <span>{getClassIcon(participant.class)}</span>
                        <span>{participant.username}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {participants.notParticipating.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Can't Join:</h5>
                  <div className="flex flex-wrap gap-1">
                    {participants.notParticipating.map((participant) => (
                      <span
                        key={participant.username}
                        className="inline-flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs"
                      >
                        <span>{getClassIcon(participant.class)}</span>
                        <span>{participant.username}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BossParticipation
