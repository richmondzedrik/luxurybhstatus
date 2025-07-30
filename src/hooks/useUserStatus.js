import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useUserStatus = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState('afk')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserStatus()
    }
  }, [user])

  const fetchUserStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user status:', error)
        return
      }

      if (data) {
        setStatus(data.status)
      } else {
        // Create initial status if it doesn't exist
        await createUserStatus()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUserStatus = async () => {
    try {
      const { error } = await supabase
        .from('user_status')
        .insert([
          { user_id: user.id, status: 'afk' }
        ])

      if (error) {
        console.error('Error creating user status:', error)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const updateStatus = async (newStatus) => {
    if (!user || updating) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('user_status')
        .update({ status: newStatus })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating status:', error)
        return false
      }

      setStatus(newStatus)
      return true
    } catch (error) {
      console.error('Error:', error)
      return false
    } finally {
      setUpdating(false)
    }
  }

  return {
    status,
    loading,
    updating,
    updateStatus
  }
}
