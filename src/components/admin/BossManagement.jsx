import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../LoadingSpinner'

const BossManagement = () => {
  const [bosses, setBosses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBoss, setEditingBoss] = useState(null)

  const [formData, setFormData] = useState({
    monster: '',
    name: '',
    respawn_hours: 8,
    points: 500,
    notes: '',
    image_url: '',
    display_image: ''
  })

  // Fetch all bosses
  const fetchBosses = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://mtnnhtajjcrgcfftukci.supabase.co/rest/v1/monsters', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBosses(data)
        setError(null)
      } else {
        setError('Failed to fetch bosses')
      }
    } catch (err) {
      setError('Error fetching bosses: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBosses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const method = editingBoss ? 'PATCH' : 'POST'
      const url = editingBoss 
        ? `https://mtnnhtajjcrgcfftukci.supabase.co/rest/v1/monsters?id=eq.${editingBoss.id}`
        : 'https://mtnnhtajjcrgcfftukci.supabase.co/rest/v1/monsters'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchBosses()
        setShowAddForm(false)
        setEditingBoss(null)
        setFormData({
          monster: '',
          name: '',
          respawn_hours: 8,
          points: 500,
          notes: '',
          image_url: '',
          display_image: ''
        })
      } else {
        setError('Failed to save boss')
      }
    } catch (err) {
      setError('Error saving boss: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (boss) => {
    setEditingBoss(boss)
    setFormData({
      monster: boss.monster || '',
      name: boss.name || '',
      respawn_hours: boss.respawn_hours || 8,
      points: boss.points || 500,
      notes: boss.notes || '',
      image_url: boss.image_url || '',
      display_image: boss.display_image || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (bossId) => {
    if (!confirm('Are you sure you want to delete this boss?')) return

    try {
      setLoading(true)
      const response = await fetch(`https://mtnnhtajjcrgcfftukci.supabase.co/rest/v1/monsters?id=eq.${bossId}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5odGFqamNyZ2NmZnR1a2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzI3NjQsImV4cCI6MjA2NzI0ODc2NH0._4ZzORL69vligyH142nI20jFJGdOrN7umcCecuF0A-w'
        }
      })

      if (response.ok) {
        await fetchBosses()
      } else {
        setError('Failed to delete boss')
      }
    } catch (err) {
      setError('Error deleting boss: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Boss Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage boss monsters and their properties</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingBoss(null)
            setFormData({
              monster: '',
              name: '',
              respawn_hours: 8,
              points: 500,
              notes: '',
              image_url: '',
              display_image: ''
            })
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add New Boss
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingBoss ? 'Edit Boss' : 'Add New Boss'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monster Name *
              </label>
              <input
                type="text"
                required
                value={formData.monster}
                onChange={(e) => setFormData({ ...formData, monster: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Respawn Hours *
              </label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={formData.respawn_hours}
                onChange={(e) => setFormData({ ...formData, respawn_hours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points
              </label>
              <input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Image URL
              </label>
              <input
                type="url"
                value={formData.display_image}
                onChange={(e) => setFormData({ ...formData, display_image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? <LoadingSpinner size="xs" /> : (editingBoss ? 'Update Boss' : 'Add Boss')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingBoss(null)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Boss List */}
      {loading && !showAddForm ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Monster</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Location</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Respawn</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Points</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Notes</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bosses.map((boss) => (
                <tr key={boss.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      {boss.display_image && (
                        <img src={boss.display_image} alt={boss.monster} className="w-8 h-8 rounded object-cover" />
                      )}
                      <span>{boss.monster}</span>
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">{boss.name || '-'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">{boss.respawn_hours}h</td>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">{boss.points || '-'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">{boss.notes || '-'}</td>
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(boss)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(boss.id)}
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
      )}
    </div>
  )
}

export default BossManagement
