import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../LoadingSpinner'

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    bossRefreshInterval: 30,
    maxParticipants: 30,
    defaultRespawnHours: 8,
    enableNotifications: true,
    autoCleanupDays: 7
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage (in a real app, this would be from a database)
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('adminSettings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        bossRefreshInterval: 30,
        maxParticipants: 30,
        defaultRespawnHours: 8,
        enableNotifications: true,
        autoCleanupDays: 7
      })
    }
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL participation data? This action cannot be undone!')) {
      if (confirm('This will delete all boss participation records. Are you absolutely sure?')) {
        localStorage.removeItem('boss_participation')
        alert('All participation data has been cleared.')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? <LoadingSpinner size="xs" /> : saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Boss Management Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Boss Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Boss Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.bossRefreshInterval}
                onChange={(e) => setSettings({ ...settings, bossRefreshInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How often to refresh boss data automatically
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Respawn Hours
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.defaultRespawnHours}
                onChange={(e) => setSettings({ ...settings, defaultRespawnHours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Default respawn time for new bosses
              </p>
            </div>
          </div>
        </div>

        {/* Participation Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👥 Participation Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Participants per Boss
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.maxParticipants}
                onChange={(e) => setSettings({ ...settings, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum number of participants allowed per boss
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-cleanup Old Data (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.autoCleanupDays}
                onChange={(e) => setSettings({ ...settings, autoCleanupDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically remove participation data older than this many days
              </p>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚙️ System Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow system to send notifications for boss events
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableNotifications ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-6 border border-red-200 dark:border-red-600">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
            🗑️ Data Management
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Clear All Participation Data</h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                This will permanently delete all boss participation records. This action cannot be undone.
              </p>
              <button
                onClick={clearAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-600">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
            📊 System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400">Version</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400">Last Updated</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400">Environment</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">Development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
