import { supabase } from './supabase'

/**
 * Check if a username is available
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - True if available, false if taken
 */
export const checkUsernameAvailable = async (username) => {
  try {
    const { data, error } = await supabase.rpc('check_username_available', {
      username_to_check: username
    })

    if (error) {
      console.error('Error checking username:', error)
      return false
    }

    return data
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

/**
 * Sign up a new user with username, class, and skills
 * @param {string} username - The desired username
 * @param {string} password - The user's password
 * @param {string} userClass - The user's class
 * @param {boolean} hasArcaneShield - Whether user has Arcane Shield
 * @param {boolean} hasGroupHeal - Whether user has Group Heal
 * @returns {Promise<{data, error}>} - Custom auth response
 */
export const signUpWithUsername = async (username, password, userClass = null, hasArcaneShield = false, hasGroupHeal = false) => {
  try {
    const { data, error } = await supabase.rpc('create_user_account', {
      username_param: username,
      password_param: password,
      class_param: userClass,
      has_arcane_shield_param: hasArcaneShield,
      has_group_heal_param: hasGroupHeal
    })

    if (error) {
      return { data: null, error: { message: error.message } }
    }

    if (!data.success) {
      return { data: null, error: { message: data.error } }
    }

    return {
      data: {
        user: {
          id: data.user_id,
          username: data.username,
          class: data.class,
          has_arcane_shield: data.has_arcane_shield,
          has_group_heal: data.has_group_heal
        }
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: { message: 'Failed to create account. Please try again.' } }
  }
}

/**
 * Sign in with username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<{data, error}>} - Custom auth response
 */
export const signInWithUsername = async (username, password) => {
  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      username_param: username,
      password_param: password
    })

    if (error) {
      return { data: null, error: { message: error.message } }
    }

    if (!data.success) {
      return { data: null, error: { message: data.error } }
    }

    return {
      data: {
        user: {
          id: data.user_id,
          username: data.username
        }
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: { message: 'Login failed. Please try again.' } }
  }
}

/**
 * Get user profile by user ID
 * @param {string} userId - The user's ID
 * @returns {Promise<{data, error}>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Update user profile
 * @param {string} userId - The user's ID
 * @param {object} updates - The updates to apply
 * @returns {Promise<{data, error}>} - Update response
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}
