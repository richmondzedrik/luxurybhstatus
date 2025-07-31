import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

// For now, we'll use localStorage to store participation data
// In a real app, this would be stored in a database
const PARTICIPATION_STORAGE_KEY = 'boss_participation'

export const useBossParticipation = () => {
  const { userProfile, loading: authLoading } = useAuth()
  const [participationData, setParticipationData] = useState({})
  const [loading, setLoading] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Load participation data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PARTICIPATION_STORAGE_KEY)
      if (stored) {
        setParticipationData(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading participation data:', error)
    }
  }, [])

  // Force re-render when auth loading completes to ensure userProfile is available
  useEffect(() => {
    if (!authLoading && userProfile) {
      // Trigger a re-render to ensure all components get the updated userProfile
      setUpdateTrigger(prev => prev + 1)
    }
  }, [authLoading, userProfile])

  // Listen for participation changes from other components
  useEffect(() => {
    const handleParticipationChange = (event) => {
      setParticipationData(event.detail.data)
      setUpdateTrigger(prev => prev + 1)
    }

    window.addEventListener('participationChanged', handleParticipationChange)
    return () => {
      window.removeEventListener('participationChanged', handleParticipationChange)
    }
  }, [])

  // Save participation data to localStorage and trigger re-render
  const saveParticipationData = useCallback((data) => {
    try {
      localStorage.setItem(PARTICIPATION_STORAGE_KEY, JSON.stringify(data))
      setParticipationData(data)

      // Force a re-render by updating the timestamp
      window.dispatchEvent(new CustomEvent('participationChanged', {
        detail: { data, timestamp: Date.now() }
      }))
    } catch (error) {
      console.error('Error saving participation data:', error)
    }
  }, [])

  // Get participation status for a specific boss and user
  const getParticipationStatus = useCallback((bossId, username = null) => {
    const user = username || userProfile?.username
    if (!user || !bossId) return null

    return participationData[bossId]?.[user]?.status || null
  }, [participationData, userProfile])

  // Set participation status for current user and specific boss
  const setParticipationStatus = useCallback((bossId, status) => {
    if (!userProfile?.username || !bossId) return

    setLoading(true)

    const newData = {
      ...participationData,
      [bossId]: {
        ...participationData[bossId],
        [userProfile.username]: {
          status, // 'participating', 'not_participating'
          timestamp: new Date().toISOString(),
          class: userProfile.class
        }
      }
    }

    saveParticipationData(newData)
    setLoading(false)
  }, [userProfile, participationData, saveParticipationData])

  // Get all participants for a specific boss
  const getBossParticipants = useCallback((bossId) => {
    if (!bossId) return { participating: [], notParticipating: [] }

    const bossData = participationData[bossId] || {}
    const participants = {
      participating: [],
      notParticipating: []
    }

    Object.entries(bossData).forEach(([username, data]) => {
      const participant = {
        username,
        class: data.class,
        timestamp: data.timestamp
      }

      switch (data.status) {
        case 'participating':
          participants.participating.push(participant)
          break
        case 'not_participating':
          participants.notParticipating.push(participant)
          break
      }
    })

    return participants
  }, [participationData])

  // Get participation summary for a boss (counts)
  const getParticipationSummary = useCallback((bossId) => {
    const participants = getBossParticipants(bossId)
    return {
      participating: participants.participating.length,
      notParticipating: participants.notParticipating.length,
      total: participants.participating.length + participants.notParticipating.length
    }
  }, [getBossParticipants])

  // Clear old participation data (for bosses that are no longer pending)
  const cleanupOldParticipation = useCallback((currentBossIds) => {
    const newData = { ...participationData }
    let hasChanges = false

    Object.keys(newData).forEach(bossId => {
      if (!currentBossIds.includes(bossId)) {
        delete newData[bossId]
        hasChanges = true
      }
    })

    if (hasChanges) {
      saveParticipationData(newData)
    }
  }, [participationData, saveParticipationData])

  return {
    loading,
    getParticipationStatus,
    setParticipationStatus,
    getBossParticipants,
    getParticipationSummary,
    cleanupOldParticipation
  }
}
