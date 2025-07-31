import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { signUpWithUsername, signInWithUsername, getUserProfile, checkUsernameAvailable } from '../lib/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const checkStoredSession = () => {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setUserProfile({ username: userData.username })
        } catch (error) {
          localStorage.removeItem('currentUser')
        }
      }
      setLoading(false)
    }

    checkStoredSession()
  }, [])

  const signIn = async (username, password) => {
    const { data, error } = await signInWithUsername(username, password)

    if (data?.user && !error) {
      // Get full user profile from database
      try {
        const { data: profileData } = await supabase
          .from('app_users')
          .select('username, class, has_arcane_shield, has_group_heal, is_admin')
          .eq('id', data.user.id)
          .single()

        // Check for temporary admin status (fallback for development)
        const tempAdminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
        const isTempAdmin = tempAdminUsers.includes(profileData?.username || data.user.username)

        const finalProfileData = {
          ...profileData,
          is_admin: profileData?.is_admin || isTempAdmin
        }

        const fullUser = { ...data.user, ...finalProfileData }

        // Store user session
        localStorage.setItem('currentUser', JSON.stringify(fullUser))
        setUser(fullUser)
        setUserProfile(finalProfileData || { username: data.user.username })
      } catch (profileError) {
        // Fallback if profile fetch fails - check for temporary admin status
        const tempAdminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
        const isTempAdmin = tempAdminUsers.includes(data.user.username)

        const fallbackProfile = {
          username: data.user.username,
          is_admin: isTempAdmin
        }

        const fullUser = { ...data.user, ...fallbackProfile }
        localStorage.setItem('currentUser', JSON.stringify(fullUser))
        setUser(fullUser)
        setUserProfile(fallbackProfile)
      }
    }

    return { data, error }
  }

  const signUp = async (username, password, userClass, hasArcaneShield, hasGroupHeal) => {
    const { data, error } = await signUpWithUsername(username, password, userClass, hasArcaneShield, hasGroupHeal)

    if (data?.user && !error) {
      // Store user session
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      setUser(data.user)
      setUserProfile({
        username: data.user.username,
        class: data.user.class,
        has_arcane_shield: data.user.has_arcane_shield,
        has_group_heal: data.user.has_group_heal
      })
    }

    return { data, error }
  }

  const signOut = async () => {
    localStorage.removeItem('currentUser')
    setUser(null)
    setUserProfile(null)
    return { error: null }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    checkUsernameAvailable,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
