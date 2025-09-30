'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import axiosInstance from '@/axios/axiosInstance'
import useUserStore from '@/zustand/user'

export default function LoginComponent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useUserStore((state) => state.setUser);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const res = await axiosInstance.post('user/login', formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log("Login response:", res)

      if (res.data.statusCode === 200) {
        setIsLoading(false)
        setUser(res.data.data);
        window.location.href = '/'
      } else {
        setErrors({ loginError: res.data.message })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ loginError: 'An error occurred during login' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWholesaleRegister = () => {
    console.log('Navigate to wholesale registration')
  }

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password')
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

  return (
    <div className=" py-12 bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan">
      <motion.div
        className="max-w-md w-full "
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <h2 className="text-[2rem] font-bold sm:text-4xl font-bold text-gray-900 mb-2">
            LOG <span className="text-[#E9098D]">IN</span>
          </h2>
          <h3 className="text-[24px] font-semibold  mb-2">
            RETURNING CUSTOMER
          </h3>
          <p className="text-[18px]  text-[#000000]/50 font-[400]">
            Log in below to checkout with an existing account
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          className=" space-y-6 bg-white p-6 sm:p-8 rounded-lg "
          onSubmit={handleLogin}
          variants={itemVariants}
        >
          <div className="space-y-5 text-[1rem] font-medium">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-[1rem] font-medium  mb-2">
                Required<span className="text-red-500 ml-1">*</span>
              </label>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`
                  appearance-none relative block w-full px-3 py-3 
                  border border-gray-300 placeholder-gray-400 text-gray-900 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 focus:z-10 text-sm sm:text-base
                  transition-colors duration-200
                  ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                `}
                placeholder=""
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`
                  appearance-none relative block w-full px-3 py-3 
                  border border-gray-300 placeholder-gray-400 text-gray-900 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 focus:z-10 text-sm sm:text-base
                  transition-colors duration-200
                  ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                `}
                placeholder=""
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Login Button */}
          <div className=''>
            <motion.div variants={itemVariants} className='mb-1'>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="
                group relative w-full flex justify-center py-1 px-4 
                border border-transparent text-sm sm:text-base font-medium rounded-md 
                text-white bg-[#74C7F0] rounded-lg hover:bg-sky-500 
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
                    Logging in...
                  </div>
                ) : (
                  'Log In'
                )}
              </motion.button>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div className="text-end mb-1" variants={itemVariants}>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[13px] font-medium"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Wholesale Register Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="button"
                onClick={handleWholesaleRegister}
                className="
                w-full flex justify-center py-1 px-4 
                border border-transparent text-sm sm:text-base font-medium rounded-md 
                text-white bg-[#2D2B70] 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-all duration-200 text-[1rem] font-[500]
              "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register for Wholesale Access
              </motion.button>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}