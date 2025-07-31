import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const borderClasses = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  }

  return (
    <div className={`animate-spin rounded-full ${borderClasses[size]} border-blue-500 border-t-transparent ${sizeClasses[size]} ${className}`}></div>
  )
}

export default LoadingSpinner
