import { useState, useEffect, useCallback } from 'react'

const DISCORD_BOT_API_URL = 'http://localhost:3001/api'

export const useDiscordBot = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState({
    token: '',
    channelId: ''
  })

  // Check Discord bot server status on mount
  useEffect(() => {
    checkBotStatus()

    // Check status periodically
    const interval = setInterval(checkBotStatus, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Check if Discord bot server is running and connected
  const checkBotStatus = useCallback(async () => {
    try {
      const response = await fetch(`${DISCORD_BOT_API_URL}/status`)
      if (response.ok) {
        const status = await response.json()
        setIsConnected(status.discordConnected)
        setError(status.discordConnected ? null : 'Discord bot server is running but not connected to Discord')
      } else {
        setIsConnected(false)
        setError('Discord bot server is not running')
      }
    } catch (error) {
      setIsConnected(false)
      setError('Cannot connect to Discord bot server. Make sure it\'s running on port 3001.')
    }
  }, [])

  // Connect to Discord bot (placeholder - actual connection is handled by server)
  const connectBot = useCallback(async (token, channelId) => {
    if (!token || !channelId) {
      setError('Bot token and channel ID are required')
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Save configuration to localStorage for reference
      const configData = { token, channelId }
      localStorage.setItem('discordBotConfig', JSON.stringify(configData))
      setConfig(configData)

      // Check if bot server is running
      await checkBotStatus()

      if (isConnected) {
        console.log('Discord bot configuration saved!')
        return true
      } else {
        setError('Discord bot server is not running or not connected. Please start the bot server with your token and channel ID.')
        return false
      }
    } catch (error) {
      console.error('Discord bot connection error:', error)
      setError(error.message || 'Failed to connect to Discord bot')
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [isConnected, checkBotStatus])

  // Disconnect from Discord bot (clear local config)
  const disconnectBot = useCallback(async () => {
    try {
      setIsConnected(false)
      setError(null)

      // Clear saved configuration
      localStorage.removeItem('discordBotConfig')
      setConfig({ token: '', channelId: '' })

      console.log('Discord bot configuration cleared')
    } catch (error) {
      console.error('Error clearing Discord bot config:', error)
      setError(error.message || 'Error clearing Discord bot configuration')
    }
  }, [])

  // Send boss notification to Discord via API
  const sendBossToDiscord = useCallback(async (bossData) => {
    if (!isConnected) {
      setError('Discord bot is not connected')
      return { success: false, error: 'Discord bot is not connected' }
    }

    try {
      // Send the raw boss data - let the Discord bot server handle formatting
      const cleanBossData = {
        ...bossData,
        name: bossData.name || bossData.monster
      }

      console.log('📤 Sending boss data to Discord server:', cleanBossData)

      const response = await fetch(`${DISCORD_BOT_API_URL}/send-boss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanBossData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('Boss notification sent to Discord:', result)
      } else {
        setError(result.error || 'Failed to send boss notification')
      }

      return result
    } catch (error) {
      console.error('Error sending boss to Discord:', error)
      const errorMessage = error.message || 'Failed to send boss notification'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [isConnected])

  // Format boss time for Discord display
  const formatBossTime = (boss) => {
    if (!boss.respawn_time && !boss.time_of_death) {
      return 'Unknown'
    }

    try {
      const respawnTime = new Date(boss.respawn_time || boss.time_of_death)
      const now = new Date()
      const diffMs = respawnTime.getTime() - now.getTime()
      
      if (diffMs <= 0) {
        const overdue = Math.abs(diffMs)
        const hours = Math.floor(overdue / (1000 * 60 * 60))
        const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60))
        return `Available (${hours}h ${minutes}m overdue)`
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m remaining`
      }
    } catch (error) {
      console.error('Error formatting boss time:', error)
      return 'Unknown'
    }
  }

  // Update Discord configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check if bot is ready to send messages
  const isBotReady = useCallback(() => {
    return isConnected
  }, [isConnected])

  return {
    // State
    isConnected,
    isConnecting,
    error,
    config,
    
    // Actions
    connectBot,
    disconnectBot,
    sendBossToDiscord,
    updateConfig,
    clearError,
    isBotReady,
    
    // Utilities
    formatBossTime
  }
}
