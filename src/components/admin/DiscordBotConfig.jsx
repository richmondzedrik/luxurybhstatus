import React, { useState } from 'react'
import { useDiscordBot } from '../../hooks/useDiscordBot'
import LoadingSpinner from '../LoadingSpinner'

const DiscordBotConfig = () => {
  const {
    isConnected,
    isConnecting,
    error,
    config,
    connectBot,
    disconnectBot,
    sendBossToDiscord,
    updateConfig,
    clearError,
    isBotReady
  } = useDiscordBot()

  const [formData, setFormData] = useState({
    token: config.token || '',
    channelId: config.channelId || ''
  })
  const [showToken, setShowToken] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    clearError()
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    
    if (!formData.token.trim() || !formData.channelId.trim()) {
      return
    }

    const success = await connectBot(formData.token.trim(), formData.channelId.trim())
    if (success) {
      // Update the config state
      updateConfig(formData)
    }
  }

  const handleDisconnect = async () => {
    await disconnectBot()
    setFormData({ token: '', channelId: '' })
  }

  const handleTestConnection = async () => {
    if (!isBotReady()) {
      alert('Discord bot is not connected or ready')
      return
    }

    try {
      // Send a test boss notification
      const testBoss = {
        monster: 'Test Boss',
        name: 'Test Boss',
        points: 500,
        notes: 'This is a test notification from the boss monitoring system.',
        respawn_time: new Date().toISOString(),
        respawn_hours: 8
      }

      const result = await sendBossToDiscord(testBoss)

      if (result.success) {
        alert('✅ Test notification sent successfully!')
      } else {
        alert(`❌ Test failed: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Discord Bot Configuration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure Discord bot for boss notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discord Bot Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="Enter your Discord bot token"
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isConnected}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isConnected}
            >
              {showToken ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get your bot token from the Discord Developer Portal
          </p>
        </div>

        <div>
          <label htmlFor="channelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discord Channel ID
          </label>
          <input
            type="text"
            id="channelId"
            name="channelId"
            value={formData.channelId}
            onChange={handleInputChange}
            placeholder="Enter the Discord channel ID"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isConnected}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Right-click on your Discord channel and select "Copy ID"
          </p>
        </div>

        <div className="flex space-x-3">
          {!isConnected ? (
            <button
              type="submit"
              disabled={isConnecting || !formData.token.trim() || !formData.channelId.trim()}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Bot
                </>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Disconnect
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Connection
              </button>
            </>
          )}
        </div>
      </form>

      {isConnected && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Discord bot is connected and ready to send boss notifications!
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Setup Instructions:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Create a Discord application and bot at <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="underline">Discord Developer Portal</a></li>
          <li>Copy the bot token and paste it above</li>
          <li>Invite the bot to your Discord server with appropriate permissions</li>
          <li>Enable Developer Mode in Discord settings</li>
          <li>Right-click on your target channel and copy the Channel ID</li>
          <li>Paste the Channel ID above and connect the bot</li>
        </ol>
      </div>
    </div>
  )
}

export default DiscordBotConfig
