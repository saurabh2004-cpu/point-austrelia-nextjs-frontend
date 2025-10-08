'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/axios/axiosInstance'
import Cookies from 'js-cookie'

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isClient, setIsClient] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    
    // Get access token from URL only on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('accessToken')
      
      if (!accessToken) {
        setTokenError('Invalid or missing reset token')
        setIsValidToken(false)
      } else {
        // Set the access token to cookies
        Cookies.set('access-token', accessToken, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        setIsValidToken(true)
        console.log('Access token set to cookies')
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
    } 

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // Get the access token from cookies
      const tokenFromCookies = Cookies.get('access-token')
      
      if (!tokenFromCookies) {
        throw new Error('Authentication token not found')
      }

      const res = await axiosInstance.put('user/change-password', 
        { newPassword: formData.newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenFromCookies}`
          }
        }
      )

      console.log("Reset password response:", res)

      if (res.data.statusCode === 200) {
        setSuccessMessage('Password reset successfully! You can now login with your new password.')
        
        // Clear form
        setFormData({
          newPassword: '',
          confirmPassword: ''
        })

        // Remove the access token from cookies after successful password reset
        Cookies.remove('access-token')
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setErrors({ submit: res.data.message })
      }
    } catch (error) {
      console.error('Reset password error:', error)
      
      // Remove invalid token from cookies on error
      if (error.response?.status === 401) {
        Cookies.remove('access-token')
        setErrors({ submit: 'Reset link has expired. Please request a new password reset.' })
      } else {
        setErrors({ 
          submit: error.response?.data?.message || 
          'An error occurred while resetting your password. Please try again.' 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  // Show loading state until client-side initialization is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74C7F0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan">
        <motion.div
          className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">
              {tokenError || 'This password reset link is invalid or has expired.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#74C7F0] hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan">
      <motion.div
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <h2 className="text-[2rem] font-bold sm:text-4xl font-bold text-gray-900 mb-2">
            RESET <span className="text-[#E9098D]">PASSWORD</span>
          </h2>
          <p className="text-[18px] text-[#000000]/50 font-[400]">
            Enter your new password below
          </p>
        </motion.div>

        {/* Reset Password Form */}
        <motion.form
          className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md"
          onSubmit={handleResetPassword}
          variants={itemVariants}
        >
          <div className="space-y-5 text-[1rem] font-medium">
            {/* New Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`
                  appearance-none relative block w-full px-3 py-3 
                  border border-gray-300 placeholder-gray-400 text-gray-900 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 focus:z-10 text-sm sm:text-base
                  transition-colors duration-200
                  ${errors.newPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                `}
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`
                  appearance-none relative block w-full px-3 py-3 
                  border border-gray-300 placeholder-gray-400 text-gray-900 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 focus:z-10 text-sm sm:text-base
                  transition-colors duration-200
                  ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                `}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-md bg-green-50 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-md bg-red-50 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reset Password Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading || successMessage}
              className="
                group relative w-full flex justify-center py-3 px-4 
                border border-transparent text-sm sm:text-base font-medium rounded-md 
                text-white bg-[#74C7F0] hover:bg-sky-500 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 text-[1rem] font-[600]
              "
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </motion.div>

          {/* Back to Login Link */}
          <motion.div className="text-center" variants={itemVariants}>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[13px] font-medium text-[#74C7F0] hover:text-sky-600 transition-colors duration-200"
            >
              Back to Login
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  )
}