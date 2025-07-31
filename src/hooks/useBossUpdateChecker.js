import { useEffect, useCallback } from 'react'

export const useBossUpdateChecker = (bosses, refreshBosses) => {
  // Check for boss time updates and restore hidden bosses
  const checkForBossUpdates = useCallback(() => {
    const notUpdatedBosses = JSON.parse(localStorage.getItem('notUpdatedBosses') || '{}')
    let hasUpdates = false

    // Check each hidden boss to see if its time has been updated
    Object.keys(notUpdatedBosses).forEach(bossId => {
      const hiddenBossInfo = notUpdatedBosses[bossId]
      const currentBoss = bosses.find(boss => (boss.id || boss.monster) === bossId)

      if (currentBoss) {
        const currentTime = currentBoss.respawn_time || currentBoss.time_of_death
        const lastCheckedTime = hiddenBossInfo.lastCheckedTime

        // If the time has changed, remove from hidden list
        if (currentTime !== lastCheckedTime) {
          console.log(`🔄 Admin: Boss "${hiddenBossInfo.bossName}" time updated! Automatically bringing back to list.`)
          console.log(`   Previously marked by: ${hiddenBossInfo.markedByAdmin || 'Unknown Admin'}`)
          delete notUpdatedBosses[bossId]
          hasUpdates = true
        }
      } else {
        // If boss no longer exists in the API, remove from hidden list
        console.log(`🗑️ Admin: Boss "${hiddenBossInfo.bossName}" no longer in API. Removing from hidden list.`)
        console.log(`   Originally marked by: ${hiddenBossInfo.markedByAdmin || 'Unknown Admin'}`)
        delete notUpdatedBosses[bossId]
        hasUpdates = true
      }
    })

    // Save updated list if there were changes
    if (hasUpdates) {
      localStorage.setItem('notUpdatedBosses', JSON.stringify(notUpdatedBosses))
      
      // Show notification about restored bosses
      const restoredCount = Object.keys(notUpdatedBosses).length
      if (restoredCount === 0) {
        console.log('✅ Admin: All hidden bosses have been automatically restored due to time updates!')
      }
      
      // Trigger a refresh to update the UI
      if (refreshBosses) {
        refreshBosses()
      }
    }
  }, [bosses, refreshBosses])

  // Run the check whenever bosses data changes
  useEffect(() => {
    if (bosses && bosses.length > 0) {
      checkForBossUpdates()
    }
  }, [bosses, checkForBossUpdates])

  // Get list of currently hidden bosses for debugging
  const getHiddenBosses = useCallback(() => {
    const notUpdatedBosses = JSON.parse(localStorage.getItem('notUpdatedBosses') || '{}')
    return Object.values(notUpdatedBosses)
  }, [])

  // Manually restore a specific boss (for admin use)
  const restoreBoss = useCallback((bossId) => {
    const notUpdatedBosses = JSON.parse(localStorage.getItem('notUpdatedBosses') || '{}')
    
    if (notUpdatedBosses[bossId]) {
      delete notUpdatedBosses[bossId]
      localStorage.setItem('notUpdatedBosses', JSON.stringify(notUpdatedBosses))
      
      if (refreshBosses) {
        refreshBosses()
      }
      
      return true
    }
    
    return false
  }, [refreshBosses])

  // Clear all hidden bosses (for admin use)
  const clearAllHiddenBosses = useCallback(() => {
    const notUpdatedBosses = JSON.parse(localStorage.getItem('notUpdatedBosses') || '{}')
    const hiddenCount = Object.keys(notUpdatedBosses).length

    localStorage.removeItem('notUpdatedBosses')

    if (refreshBosses) {
      refreshBosses()
    }

    console.log(`🧹 Admin: Manually restored ${hiddenCount} hidden bosses`)
  }, [refreshBosses])

  return {
    checkForBossUpdates,
    getHiddenBosses,
    restoreBoss,
    clearAllHiddenBosses
  }
}
