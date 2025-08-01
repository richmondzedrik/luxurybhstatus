import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from './Navigation'
import BossManagement from './admin/BossManagement'
import UserManagement from './admin/UserManagement'
import SystemSettings from './admin/SystemSettings'
import DiscordBotConfig from './admin/DiscordBotConfig'

const AdminPage = () => {
  const { userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('bosses')



  const tabs = [
    { id: 'bosses', name: 'Boss Management', icon: '👹', component: BossManagement },
    { id: 'users', name: 'User Management', icon: '👥', component: UserManagement },
    { id: 'discord', name: 'Discord Bot', icon: '🤖', component: DiscordBotConfig },
    { id: 'settings', name: 'System Settings', icon: '⚙️', component: SystemSettings }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BossManagement

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {userProfile?.username}
                </p>
              </div>
            </div>
            <Navigation onSignOut={signOut} userProfile={userProfile} />
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}

export default AdminPage
