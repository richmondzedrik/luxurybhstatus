// Utility functions for admin setup
// This is a temporary solution for development. In production, admin status should be managed through a proper admin interface.

import { supabase } from '../lib/supabase'

/**
 * Make a user an admin (for development/testing purposes)
 * @param {string} username - The username to make admin
 * @returns {Promise<boolean>} - Success status
 */
export const makeUserAdmin = async (username) => {
  try {
    // First check if is_admin column exists
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'app_users' })
      .catch(() => null)

    // If column doesn't exist, show instructions
    if (columnError || !columns?.some(col => col.column_name === 'is_admin')) {
      console.error('❌ The is_admin column does not exist in the app_users table.')
      console.log('📋 To fix this, run the following SQL in your Supabase SQL Editor:')
      console.log(`
🔧 SQL TO RUN:
--------------
ALTER TABLE app_users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN app_users.is_admin IS 'Indicates if the user has admin privileges';

CREATE INDEX idx_app_users_is_admin ON app_users(is_admin) WHERE is_admin = TRUE;
--------------

After running this SQL, refresh the page and try again.
      `)

      alert(`❌ Database setup required!\n\nThe admin column doesn't exist yet. Check the browser console for SQL instructions to run in your Supabase dashboard.`)
      return false
    }

    const { data, error } = await supabase
      .from('app_users')
      .update({ is_admin: true })
      .eq('username', username)
      .select()

    if (error) {
      console.error('Error making user admin:', error)
      return false
    }

    if (data && data.length > 0) {
      console.log(`Successfully made ${username} an admin`)
      return true
    } else {
      console.error(`User ${username} not found`)
      return false
    }
  } catch (error) {
    console.error('Error making user admin:', error)
    return false
  }
}

/**
 * Remove admin status from a user
 * @param {string} username - The username to remove admin from
 * @returns {Promise<boolean>} - Success status
 */
export const removeUserAdmin = async (username) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ is_admin: false })
      .eq('username', username)
      .select()

    if (error) {
      console.error('Error removing admin from user:', error)
      return false
    }

    if (data && data.length > 0) {
      console.log(`Successfully removed admin status from ${username}`)
      return true
    } else {
      console.error(`User ${username} not found`)
      return false
    }
  } catch (error) {
    console.error('Error removing admin from user:', error)
    return false
  }
}

/**
 * Check if a user is an admin
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - Admin status
 */
export const checkUserAdmin = async (username) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('is_admin')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error checking user admin status:', error)
      return false
    }

    return data?.is_admin || false
  } catch (error) {
    console.error('Error checking user admin status:', error)
    return false
  }
}

// Temporary localStorage-based admin system (for development)
window.makeCurrentUserAdminTemp = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.username) {
    // Temporarily store admin status in localStorage
    currentUser.is_admin = true
    localStorage.setItem('currentUser', JSON.stringify(currentUser))

    // Also store in a separate admin list for persistence
    const adminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
    if (!adminUsers.includes(currentUser.username)) {
      adminUsers.push(currentUser.username)
      localStorage.setItem('tempAdminUsers', JSON.stringify(adminUsers))
    }

    alert(`✅ Made ${currentUser.username} a temporary admin! Refreshing page...`)
    window.location.reload()
  } else {
    alert('❌ No user logged in')
  }
}

// Development helper - call this in browser console to make current user admin
window.makeCurrentUserAdmin = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.username) {
    const success = await makeUserAdmin(currentUser.username)
    if (success) {
      alert(`Made ${currentUser.username} an admin! Please refresh the page.`)
      // Update localStorage to reflect admin status
      currentUser.is_admin = true
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      window.location.reload()
    } else {
      alert('Failed to make user admin. Database setup required. Use window.makeCurrentUserAdminTemp() for temporary admin access.')
    }
  } else {
    alert('No user logged in')
  }
}

// Check if user should be admin based on temporary admin list
window.checkTempAdminStatus = (username) => {
  const adminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
  return adminUsers.includes(username)
}

console.log(`
🔧 Admin Utilities Loaded
========================
• window.makeCurrentUserAdmin() - Make user admin (requires database setup)
• window.makeCurrentUserAdminTemp() - Make user admin temporarily (no database required)

💡 If you get database errors, use the temporary version first!
`)

// Auto-check and restore temporary admin status on page load
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
if (currentUser.username && window.checkTempAdminStatus && window.checkTempAdminStatus(currentUser.username)) {
  console.log(`🔄 Restored temporary admin status for ${currentUser.username}`)
}
