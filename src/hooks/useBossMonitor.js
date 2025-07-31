import { useState, useEffect, useCallback, useMemo } from 'react'

const BOSS_API_URL = 'https://mtnnhtajjcrgcfftukci.supabase.co/rest/v1/monsters'
const BOSS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w'

export const useBossMonitor = () => {
  const [pendingBosses, setPendingBosses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPendingBosses = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch(`${BOSS_API_URL}?select=*&status=eq.PENDING`, {
        method: 'GET',
        headers: {
          'apikey': BOSS_API_KEY,
          'Authorization': `Bearer ${BOSS_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPendingBosses(data || [])
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching pending bosses:', err)
      setError(err.message || 'Failed to fetch boss information')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchPendingBosses()
    
    const interval = setInterval(fetchPendingBosses, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchPendingBosses])

  const refreshBosses = useCallback(() => {
    setLoading(true)
    fetchPendingBosses()
  }, [fetchPendingBosses])

  // Helper function to format time since last update
  const getTimeSinceUpdate = useCallback(() => {
    if (!lastUpdated) return null

    const now = new Date()
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    }
  }, [lastUpdated])

  // Helper function to calculate actual respawn time from boss data
  const calculateRespawnTime = useCallback((boss) => {
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
  }, [])

  // Helper function to format respawn time
  const formatRespawnTime = useCallback((boss) => {
    const respawnDate = calculateRespawnTime(boss)

    if (!respawnDate || isNaN(respawnDate.getTime())) {
      return 'Unknown'
    }

    const now = new Date()
    const diffInMs = respawnDate.getTime() - now.getTime()

    // Debug logging
    console.log('Respawn Time Check:', {
      boss: boss.monster || boss.name,
      timeOfDeath: boss.time_of_death,
      respawnHours: boss.respawn_hours,
      providedRespawnTime: boss.respawn_time,
      calculatedRespawnTime: respawnDate.toISOString(),
      now: now.toISOString(),
      diffInMs,
      diffInMinutes: Math.floor(diffInMs / (1000 * 60))
    })

    // If the time has passed (boss is available now)
    if (diffInMs <= 0) {
      return 'Available Now!'
    }

    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays}d ${diffInHours % 24}h`
    } else if (diffInHours > 0) {
      return `${diffInHours}h ${diffInMinutes % 60}m`
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m`
    } else {
      return `${diffInSeconds}s`
    }
  }, [calculateRespawnTime])

  // Helper function to sort bosses by priority (available first, then by urgency)
  const sortBossesByPriority = useCallback((bosses) => {
    return [...bosses].sort((a, b) => {
      const aRespawnTime = calculateRespawnTime(a)
      const bRespawnTime = calculateRespawnTime(b)

      if (!aRespawnTime && !bRespawnTime) return 0
      if (!aRespawnTime) return 1
      if (!bRespawnTime) return -1

      const now = new Date()
      const aDiffMs = aRespawnTime.getTime() - now.getTime()
      const bDiffMs = bRespawnTime.getTime() - now.getTime()

      // Available bosses (negative diff) come first
      const aAvailable = aDiffMs <= 0
      const bAvailable = bDiffMs <= 0

      if (aAvailable && !bAvailable) return -1
      if (!aAvailable && bAvailable) return 1

      // If both available or both not available, sort by time difference
      // For available bosses, most overdue first (most negative)
      // For pending bosses, soonest first (least positive)
      return aDiffMs - bDiffMs
    })
  }, [calculateRespawnTime])

  // Sort bosses by priority
  const sortedBosses = useMemo(() => {
    return sortBossesByPriority(pendingBosses)
  }, [pendingBosses, sortBossesByPriority])

  return {
    pendingBosses: sortedBosses,
    loading,
    error,
    lastUpdated,
    refreshBosses,
    getTimeSinceUpdate,
    formatRespawnTime,
    calculateRespawnTime,
    bossCount: sortedBosses.length
  }
}
