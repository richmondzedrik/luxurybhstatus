import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('status') // 'status', 'username', 'class', 'lastUpdated'
  const [filterClass, setFilterClass] = useState('') // Filter by specific class

  // Helper function to get class emoji
  const getClassEmoji = (className) => {
    const classEmojis = {
      'Orb': '🔮',
      'Sword': '⚔️',
      'Assassin': '🗡️',
      'Mage': '🪄',
      'Dual Blade': '🗡️⚔️',
      'Archer': '🏹'
    }
    return classEmojis[className] || '⚡'
  }

  // Helper function to get Orb flair
  const getOrbFlair = (user) => {
    if (user.app_users?.class !== 'Orb') return ''

    const hasShield = user.app_users?.has_arcane_shield
    const hasHeal = user.app_users?.has_group_heal

    if (hasShield && hasHeal) {
      return ' 🛡️💚'
    } else if (hasShield) {
      return ' 🛡️'
    } else if (hasHeal) {
      return ' 💚'
    }
    return ''
  }

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.app_users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.app_users?.class?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply class filter
    if (filterClass) {
      filtered = filtered.filter(user => user.app_users?.class === filterClass)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      // Always prioritize available users first
      if (a.status !== b.status) {
        if (a.status === 'available') return -1
        if (b.status === 'available') return 1
      }

      // Then sort by selected criteria
      switch (sortBy) {
        case 'username':
          return (a.app_users?.username || '').localeCompare(b.app_users?.username || '')

        case 'class':
          const classA = a.app_users?.class || 'zzz' // Put users without class at end
          const classB = b.app_users?.class || 'zzz'
          return classA.localeCompare(classB)

        case 'lastUpdated':
          return new Date(b.last_updated) - new Date(a.last_updated)

        case 'status':
        default:
          // Already sorted by status above, now sort by username within same status
          return (a.app_users?.username || '').localeCompare(b.app_users?.username || '')
      }
    })
  }, [users, searchTerm, sortBy, filterClass])

  // Calculate stats
  const stats = useMemo(() => {
    const available = users.filter(u => u.status === 'available').length
    const afk = users.filter(u => u.status === 'afk').length
    const classCounts = users.reduce((acc, user) => {
      const userClass = user.app_users?.class || 'Unknown'
      acc[userClass] = (acc[userClass] || 0) + 1
      return acc
    }, {})

    return { available, afk, classCounts }
  }, [users])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('hunter-search')?.focus()
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers()

    // Set up real-time subscription
    const subscription = supabase
      .channel('user_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status'
        },
        (payload) => {
          console.log('Realtime update received:', payload)
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Backup: Poll for updates every 10 seconds
    const pollInterval = setInterval(() => {
      fetchUsers()
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearInterval(pollInterval)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('user_status')
        .select(`
          user_id,
          status,
          last_updated,
          app_users:user_id (
            username,
            class,
            has_arcane_shield,
            has_group_heal
          )
        `)
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users. Please try again.')
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRealtimeUpdate = (payload) => {
    console.log('Processing realtime update:', payload)
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        // Add new user status - refetch to get username
        fetchUsers()
        break
      case 'UPDATE':
        // Update existing user status
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.user_id === newRecord.user_id
              ? { ...user, status: newRecord.status, last_updated: newRecord.last_updated }
              : user
          )
        )
        break
      case 'DELETE':
        // Remove user status
        setUsers(prevUsers =>
          prevUsers.filter(user => user.user_id !== oldRecord.user_id)
        )
        break
      default:
        console.log('Unknown event type:', eventType)
        break
    }
  }

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-8 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">All Hunters</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading hunters...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-6 sm:p-8">
        <div className="space-y-4 mb-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                All Hunters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {filteredAndSortedUsers.length} of {users.length} {users.length === 1 ? 'hunter' : 'hunters'}
                {searchTerm && ' (filtered)'}
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 dark:text-gray-500">🔍</span>
              </div>
              <input
                id="hunter-search"
                type="text"
                placeholder="Search hunters by name or class... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Class Filter */}
            <div className="sm:w-40">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Classes</option>
                {Object.keys(stats.classCounts).sort().map(className => (
                  <option key={className} value={className}>
                    {getClassEmoji(className)} {className} ({stats.classCounts[className]})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="status">🎯 Status (Available First)</option>
                <option value="username">👤 Username (A-Z)</option>
                <option value="class">⚔️ Class (A-Z)</option>
                <option value="lastUpdated">🕒 Last Updated</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterClass) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterClass('')
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>✕</span>
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Quick Stats */}
          {users.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-400">{stats.available}</div>
                <div className="text-xs text-green-600 dark:text-green-500">🟢 Available</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-700 dark:text-red-400">{stats.afk}</div>
                <div className="text-xs text-red-600 dark:text-red-500">🔴 AFK</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{Object.keys(stats.classCounts).length}</div>
                <div className="text-xs text-blue-600 dark:text-blue-500">⚔️ Classes</div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{users.length}</div>
                <div className="text-xs text-purple-600 dark:text-purple-500">👥 Total</div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">⚠️</span>
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
              <button
                onClick={fetchUsers}
                className="bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-300 px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {filteredAndSortedUsers.length === 0 && !error ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hunters found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search terms</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🏹</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hunters online yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Be the first to join the hunt!</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAndSortedUsers.map((user) => (
              <div
                key={user.user_id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md relative ${
                  user.status === 'available'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                {/* Priority Badge for Available Users */}
                {user.status === 'available' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 dark:bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                    ⭐ Ready
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.status === 'available' ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
                    }`}>
                      <span className="text-2xl">
                        {user.status === 'available' ? '🟢' : '🔴'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                          {user.app_users?.username || 'Unknown Hunter'}
                          {getOrbFlair(user)}
                        </p>
                        {user.app_users?.class && (
                          <span className="text-lg" title={user.app_users.class}>
                            {getClassEmoji(user.app_users.class)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium capitalize ${
                          user.status === 'available' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {user.status === 'available' ? '🎯 Ready to Hunt' : '💤 Away'}
                        </p>
                        {user.app_users?.class && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {user.app_users.class}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'available'
                        ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                        : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                    }`}>
                      {formatLastUpdated(user.last_updated)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList
