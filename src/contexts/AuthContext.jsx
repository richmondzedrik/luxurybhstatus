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
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    // Check for stored user session and validate against database
    const checkStoredSession = async () => {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          setVerificationLoading(true)
          const userData = JSON.parse(storedUser)

          // Validate that the user still exists in the database
          const { data: dbUser, error } = await supabase
            .from('app_users')
            .select('id, username, class, has_arcane_shield, has_group_heal, is_admin, is_verified, verified_at')
            .eq('id', userData.id)
            .single()

          if (error || !dbUser) {
            // User no longer exists in database, clear localStorage
            console.log('User no longer exists in database, clearing session')
            localStorage.removeItem('currentUser')
            setUser(null)
            setUserProfile(null)
          } else {
            // User exists, restore session with fresh data from database
            const fullUser = { ...userData, ...dbUser }
            localStorage.setItem('currentUser', JSON.stringify(fullUser))
            setUser(fullUser)
            setUserProfile({
              username: dbUser.username,
              class: dbUser.class,
              has_arcane_shield: dbUser.has_arcane_shield,
              has_group_heal: dbUser.has_group_heal,
              is_admin: dbUser.is_admin,
              is_verified: dbUser.is_verified !== undefined ? dbUser.is_verified : false,
              verified_at: dbUser.verified_at
            })
          }
        } catch (error) {
          console.error('Error validating stored session:', error)
          localStorage.removeItem('currentUser')
          setUser(null)
          setUserProfile(null)
        } finally {
          setVerificationLoading(false)
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
          .select('username, class, has_arcane_shield, has_group_heal, is_admin, is_verified, verified_at')
          .eq('id', data.user.id)
          .single()

        // Check for temporary admin status (fallback for development)
        const tempAdminUsers = JSON.parse(localStorage.getItem('tempAdminUsers') || '[]')
        const isTempAdmin = tempAdminUsers.includes(profileData?.username || data.user.username)

        const finalProfileData = {
          ...profileData,
          is_admin: profileData?.is_admin || isTempAdmin,
          is_verified: profileData?.is_verified !== undefined ? profileData.is_verified : false,
          verified_at: profileData?.verified_at
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
          is_admin: isTempAdmin,
          is_verified: false, // Default to unverified if profile fetch fails
          verified_at: null
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
        has_group_heal: data.user.has_group_heal,
        is_verified: data.user.is_verified || false,
        verified_at: data.user.verified_at || null
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
    verificationLoading,
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
