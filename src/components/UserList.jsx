import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper function to get class emoji
  const getClassEmoji = (className) => {
    const classEmojis = {
      'Orb': '🔮',
      'Sword': '⚔️',
      'Assassin': '🗡️',
      'Mage': '🪄',
      'Dual Blade': '🗡️⚔️'
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
      <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100">
        <div className="px-6 py-8 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Hunters</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-4">Loading hunters...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100">
      <div className="px-6 py-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              All Hunters
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} {users.length === 1 ? 'hunter' : 'hunters'} online
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
              <button
                onClick={fetchUsers}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {users.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏹</div>
            <p className="text-gray-500 text-lg mb-2">No hunters online yet</p>
            <p className="text-gray-400 text-sm">Be the first to join the hunt!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {users.map((user) => (
              <div
                key={user.user_id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  user.status === 'available'
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.status === 'available' ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <span className="text-2xl">
                        {user.status === 'available' ? '🟢' : '🔴'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 truncate text-lg">
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
                          user.status === 'available' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {user.status === 'available' ? '🎯 Ready to Hunt' : '💤 Away'}
                        </p>
                        {user.app_users?.class && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {user.app_users.class}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'available'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
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
