import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../LoadingSpinner'

const UserManagement = () => {
  const { user: currentUser, signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching users from database...')
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Fetch users result:', { data, error, count: data?.length })

      if (error) {
        console.error('Fetch users error:', error)
        setError('Failed to fetch users: ' + error.message)
      } else {
        console.log(`✅ Fetched ${data?.length || 0} users`)
        setUsers(data || [])
        setError(null)
      }
    } catch (err) {
      console.error('Fetch users exception:', err)
      setError('Error fetching users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('app_users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) {
        setError('Failed to update admin status: ' + error.message)
      } else {
        await fetchUsers()
      }
    } catch (err) {
      setError('Error updating admin status: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    // Check if admin is trying to delete themselves
    const isDeletingSelf = currentUser?.id === userId

    let confirmMessage = `Are you sure you want to delete user "${username}"? This action cannot be undone.`
    if (isDeletingSelf) {
      confirmMessage = `⚠️ WARNING: You are about to delete your own account "${username}"! You will be logged out immediately and lose admin access. This action cannot be undone. Are you absolutely sure?`
    }

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)

      // Delete user from database
      console.log(`🗑️ Attempting to delete user: ${username} (ID: ${userId})`)
      const { error, data } = await supabase
        .from('app_users')
        .delete()
        .eq('id', userId)
        .select() // This will return the deleted rows

      console.log('Delete result:', { error, data })

      if (error) {
        console.error('Delete error:', error)
        let errorMessage = error.message

        // Check for RLS policy error
        if (error.message.includes('policy') || error.message.includes('permission') || error.code === '42501') {
          errorMessage = `❌ Database Permission Error: Missing DELETE policy for app_users table.

Please run the following SQL in your Supabase SQL Editor:

CREATE POLICY "Allow user deletion" ON app_users FOR DELETE USING (true);

Then try deleting the user again.`
        }

        setError('Failed to delete user: ' + errorMessage)
        alert('❌ Delete Failed!\n\n' + errorMessage)
      } else if (!data || data.length === 0) {
        console.warn('No user was deleted - user may not exist')
        setError('User not found or already deleted')
        alert('⚠️ User not found or already deleted')
      } else {
        console.log(`✅ Successfully deleted user: ${username}`)
        console.log('Deleted user data:', data[0])
        // Clear any localStorage data related to the deleted user
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            if (userData.id === userId) {
              // Current user was deleted, clear session and redirect to login
              localStorage.removeItem('currentUser')
              alert('Your account has been deleted. You will be logged out.')
              await signOut()
              window.location.href = '/'
              return
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }

        // Clear any participation data for the deleted user
        try {
          const participationData = JSON.parse(localStorage.getItem('boss_participation') || '{}')
          let hasChanges = false

          // Remove the deleted user from all boss participation data
          Object.keys(participationData).forEach(bossId => {
            if (participationData[bossId] && participationData[bossId][username]) {
              delete participationData[bossId][username]
              hasChanges = true
            }
          })

          if (hasChanges) {
            localStorage.setItem('boss_participation', JSON.stringify(participationData))
          }
        } catch (e) {
          // Ignore errors in cleaning participation data
        }

        // Clear any temporary admin status for the deleted user
        try {
          const tempAdminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
          const updatedTempAdmins = tempAdminUsers.filter(adminUsername => adminUsername !== username)
          if (updatedTempAdmins.length !== tempAdminUsers.length) {
            localStorage.setItem('tempAdminUsers', JSON.stringify(updatedTempAdmins))
          }
        } catch (e) {
          // Ignore errors in cleaning temp admin data
        }

        // Force refresh the user list
        console.log('🔄 Refreshing user list after deletion...')
        await fetchUsers()

        // Double-check that user is actually gone
        setTimeout(async () => {
          console.log('🔍 Double-checking user deletion...')
          await fetchUsers()
        }, 1000)

        alert(`User "${username}" has been successfully deleted.`)
      }
    } catch (err) {
      setError('Error deleting user: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getClassIcon = (className) => {
    switch (className) {
      case 'Orb': return '🔮'
      case 'Sword': return '⚔️'
      case 'Assassin': return '🗡️'
      case 'Mage': return '🪄'
      case 'Dual Blade': return '🗡️⚔️'
      case 'Archer': return '🏹'
      default: return '👤'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? <LoadingSpinner size="xs" /> : '🔄 Refresh'}
          </button>
          <button
            onClick={() => {
              console.log('🔄 Force refresh triggered by user')
              setUsers([]) // Clear current list
              fetchUsers()
            }}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 Force Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-600">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Total Users</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{users.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-600">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Admins</h3>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                {users.filter(user => user.is_admin).length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-600">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Active Users</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {users.filter(user => !user.is_admin).length}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-600">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Classes</h3>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {new Set(users.map(user => user.class)).size}
              </p>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">User</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Class</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Skills</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Role</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Created</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getClassIcon(user.class)}</span>
                        <span>{user.class}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      <div className="flex space-x-1">
                        {user.has_arcane_shield && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs">
                            🛡️ Shield
                          </span>
                        )}
                        {user.has_group_heal && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">
                            ❤️ Heal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_admin 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {user.is_admin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            user.is_admin
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.username)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserManagement
