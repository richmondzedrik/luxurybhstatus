import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userClass, setUserClass] = useState('')
  const [hasArcaneShield, setHasArcaneShield] = useState(false)
  const [hasGroupHeal, setHasGroupHeal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const { user, signIn, signUp, checkUsernameAvailable } = useAuth()

  const classes = [
    { value: 'Orb', label: 'Orb', description: 'Support class with healing abilities', icon: '/icons/orb.png' },
    { value: 'Sword', label: 'Sword', description: 'Melee warrior with high defense', icon: '/icons/sword.png' },
    { value: 'Assassin', label: 'Assassin', description: 'Fast attacker with stealth', icon: '/icons/assassin.png' },
    { value: 'Mage', label: 'Mage', description: 'Ranged magic damage dealer', icon: '/icons/mage.png' },
    { value: 'Dual Blade', label: 'Dual Blade', description: 'Dual-wielding fighter', icon: '/icons/dual-blade.png' },
    { value: 'Archer', label: 'Archer', description: 'Ranged physical damage dealer', icon: '/icons/archer.png' }
  ]

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />
  }

  // Check username availability when typing (for sign up)
  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    setUsernameAvailable(null)

    if (isSignUp && newUsername.length >= 3) {
      setCheckingUsername(true)
      try {
        const available = await checkUsernameAvailable(newUsername)
        setUsernameAvailable(available)
      } catch (error) {
        console.error('Error checking username:', error)
      } finally {
        setCheckingUsername(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation for sign up
    if (isSignUp) {
      // Username validation
      if (username.length < 3) {
        setError('Username must be at least 3 characters long')
        setLoading(false)
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('Username can only contain letters, numbers, and underscores')
        setLoading(false)
        return
      }
      if (usernameAvailable === false) {
        setError('Username is already taken. Please choose a different one.')
        setLoading(false)
        return
      }

      // Class validation
      if (!userClass) {
        setError('Please select a class')
        setLoading(false)
        return
      }

      // Password validation
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(username, password, userClass, hasArcaneShield, hasGroupHeal)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created successfully! You can now sign in with your username.')
          setIsSignUp(false)
          setUsername('')
          setPassword('')
          setConfirmPassword('')
          setUserClass('')
          setHasArcaneShield(false)
          setHasGroupHeal(false)
          setUsernameAvailable(null)
        }
      } else {
        const { error } = await signIn(username, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setUserClass('')
    setHasArcaneShield(false)
    setHasGroupHeal(false)
    setUsernameAvailable(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Boss Hunting Status
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {isSignUp ? 'Join the hunt! Create your account' : 'Welcome back, hunter!'}
          </p>
        </div>
        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg">
                <div className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 rounded-r-lg">
                <div className="flex">
                  <span className="text-green-400 mr-2">✅</span>
                  <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {/* Username Field */}
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    value={username}
                    onChange={handleUsernameChange}
                  />
                  {isSignUp && username.length >= 3 && (
                    <div className="absolute right-3 top-3">
                      {checkingUsername ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      ) : usernameAvailable === true ? (
                        <span className="text-green-500 text-lg">✓</span>
                      ) : usernameAvailable === false ? (
                        <span className="text-red-500 text-lg">✗</span>
                      ) : null}
                    </div>
                  )}
                </div>
                {isSignUp && username.length >= 3 && (
                  <p className={`mt-1 text-xs ${usernameAvailable === true ? 'text-green-600 dark:text-green-400' : usernameAvailable === false ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {checkingUsername ? 'Checking availability...' :
                     usernameAvailable === true ? 'Username is available!' :
                     usernameAvailable === false ? 'Username is already taken' : ''}
                  </p>
                )}
              </div>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isSignUp && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Class Selection */}
              {isSignUp && (
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Your Class
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {classes.map((cls) => (
                      <button
                        key={cls.value}
                        type="button"
                        onClick={() => {
                          setUserClass(cls.value)
                          // Reset Orb skills when changing class
                          if (cls.value !== 'Orb') {
                            setHasArcaneShield(false)
                            setHasGroupHeal(false)
                          }
                        }}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-2 ${
                          userClass === cls.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <img
                          src={cls.icon}
                          alt={cls.label}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to text if image fails to load
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                        <span className="hidden text-2xl" style={{ display: 'none' }}>
                          {cls.value === 'Orb' && '⬢'}
                          {cls.value === 'Sword' && '⚔'}
                          {cls.value === 'Assassin' && '⚡'}
                          {cls.value === 'Mage' && '◆'}
                          {cls.value === 'Dual Blade' && '⚔⚔'}
                          {cls.value === 'Archer' && '◇'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{cls.label}</span>
                      </button>
                    ))}
                  </div>
                  {userClass && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 text-center">
                      {classes.find(c => c.value === userClass)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Orb Skills */}
              {isSignUp && userClass === 'Orb' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-3">🔮 Orb Skills</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hasArcaneShield}
                        onChange={(e) => setHasArcaneShield(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        🛡️ Arcane Shield - Provides magical protection
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hasGroupHeal}
                        onChange={(e) => setHasGroupHeal(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        💚 Group Heal - Heals all party members
                      </span>
                    </label>
                  </div>
                  {(hasArcaneShield || hasGroupHeal) && (
                    <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800/30 rounded text-xs text-blue-800 dark:text-blue-300">
                      💫 These skills will be displayed as flair next to your name!
                    </div>
                  )}
                </div>
              )}
          </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                )}
                {loading
                  ? (isSignUp ? 'Creating Account...' : 'Signing in...')
                  : (isSignUp ? '🚀 Create Account' : '🎯 Sign In')
                }
              </button>
            </div>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              {isSignUp
                ? '← Already have an account? Sign in'
                : "Don't have an account? Sign up →"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
