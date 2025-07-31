import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBossMonitor } from '../hooks/useBossMonitor'
import ThemeToggle from './ThemeToggle'

const Navigation = ({ onSignOut, userProfile }) => {
  const location = useLocation()
  const { bossCount, loading } = useBossMonitor()

  const isActive = (path) => location.pathname === path

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '🎯',
      description: 'Hunter Status'
    },
    {
      path: '/bosses',
      label: 'Bosses',
      icon: '👾',
      description: 'Boss Monitor',
      badge: bossCount > 0 ? bossCount : null,
      badgeColor: bossCount > 0 ? 'bg-red-500 text-white' : null,
      pulse: bossCount > 0
    }
  ]

  return (
    <div className="flex items-center space-x-3">
      {/* Navigation Links */}
      <div className="hidden sm:flex items-center space-x-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            
            {/* Badge for boss count */}
            {item.badge && (
              <span className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs font-bold rounded-full ${item.badgeColor} ${item.pulse ? 'animate-pulse' : ''}`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className="sm:hidden relative">
        <select
          value={location.pathname}
          onChange={(e) => window.location.href = e.target.value}
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {navItems.map((item) => (
            <option key={item.path} value={item.path}>
              {item.icon} {item.label} {item.badge ? `(${item.badge})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* User Info & Controls */}
      <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-3">
        {/* User Profile */}
        {userProfile && (
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userProfile.username}
            </p>
            <div className="flex items-center justify-end space-x-1">
              {userProfile.class && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile.class}
                </span>
              )}
              {userProfile.class && (
                <span className="text-sm" title={`${userProfile.class} Class`}>
                  {userProfile.class === 'Orb' && '🔮'}
                  {userProfile.class === 'Sword' && '⚔️'}
                  {userProfile.class === 'Assassin' && '🗡️'}
                  {userProfile.class === 'Mage' && '🪄'}
                  {userProfile.class === 'Dual Blade' && '🗡️⚔️'}
                  {userProfile.class === 'Archer' && '🏹'}
                </span>
              )}
              {userProfile.class === 'Orb' && (
                <div className="flex space-x-1">
                  {userProfile.has_arcane_shield && <span title="Arcane Shield">🛡️</span>}
                  {userProfile.has_group_heal && <span title="Group Heal">💚</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">🚪</span>
        </button>
      </div>
    </div>
  )
}

export default Navigation
