'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SignUpComponent() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    accountEmail: '',
    orderEmail: '',
    phone: '',
    storeName: '',
    abn: '',
    address1: '',
    address2: '',
    suburb: '',
    country: '',
    state: '',
    postcode: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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
    
    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'accountEmail', 'orderEmail', 
      'phone', 'storeName', 'abn', 'address1', 'suburb', 
      'country', 'state', 'postcode'
    ]
    
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })
    
    // Email validation
    const emailRegex = /\S+@\S+\.\S+/
    if (formData.accountEmail && !emailRegex.test(formData.accountEmail)) {
      newErrors.accountEmail = 'Please enter a valid email address'
    }
    if (formData.orderEmail && !emailRegex.test(formData.orderEmail)) {
      newErrors.orderEmail = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log('Sign up submitted:', formData)
    }, 2000)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan py-8">
      <motion.div
        className="max-w-4xl w-full  space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <h2 className="text-[2rem] font-bold sm:text-4xl font-bold text-gray-900 mb-2">
            SIGN <span className="text-[#E9098D]">UP</span>
          </h2>
          <h3 className="text-[24px] font-semibold mb-2 text-[#E9098D]">
            Register for Wholesale Access
          </h3>
          <h4 className="text-[24px] font-semibold mb-2">
            NEW CUSTOMER
          </h4>
          <p className="text-[18px] text-[#000000]/50 font-[400]">
            Please complete the form for request access to become a wholesale customer
          </p>
        </motion.div>

        {/* Sign Up Form */}
        <motion.form 
          className="mt-8 space-y-6  bg-white p-6 sm:p-8 rounded-lg"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="space-y-5  text-[1rem] font-medium ">
            
            {/* Required Label */}
            <motion.div  variants={itemVariants}>
              <label className="block text-[1rem] font-medium mb-4">
                Required<span className="text-red-500 ml-1">*</span>
              </label>
            </motion.div>

            {/* First Name & Last Name Row */}
            <motion.div className="grid grid-cols-1  md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </motion.div>

            {/* Account Email & Order Email Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="accountEmail"
                  name="accountEmail"
                  type="email"
                  value={formData.accountEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.accountEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.accountEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="orderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email for Order Tracking<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="orderEmail"
                  name="orderEmail"
                  type="email"
                  value={formData.orderEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.orderEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.orderEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.orderEmail}</p>
                )}
              </div>
            </motion.div>

            {/* Phone & Store Name Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.storeName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.storeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>
                )}
              </div>
            </motion.div>

            {/* ABN & Address 1 Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="abn" className="block text-sm font-medium text-gray-700 mb-2">
                  ABN<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="abn"
                  name="abn"
                  type="text"
                  value={formData.abn}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.abn ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.abn && (
                  <p className="mt-1 text-sm text-red-600">{errors.abn}</p>
                )}
              </div>
              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 1<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="address1"
                  name="address1"
                  type="text"
                  value={formData.address1}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.address1 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.address1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.address1}</p>
                )}
              </div>
            </motion.div>

            {/* Address 2 & Suburb Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 2
                </label>
                <input
                  id="address2"
                  name="address2"
                  type="text"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                  "
                />
              </div>
              <div>
                <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="suburb"
                  name="suburb"
                  type="text"
                  value={formData.suburb}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.suburb ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.suburb && (
                  <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>
                )}
              </div>
            </motion.div>

            {/* Country & State Row */}
            <motion.div className="grid grid-cols-1  md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-[#000000]/50 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.country ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                >
                  <option value="">Select Country</option>
                  <option value="australia">Australia</option>
                  <option value="new-zealand">New Zealand</option>
                  <option value="usa">United States</option>
                  <option value="uk">United Kingdom</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-[#000000]/50
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.state ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                >
                  <option value="">Australian capital territory</option>
                  <option value="nsw">New South Wales</option>
                  <option value="vic">Victoria</option>
                  <option value="qld">Queensland</option>
                  <option value="wa">Western Australia</option>
                  <option value="sa">South Australia</option>
                  <option value="tas">Tasmania</option>
                  <option value="nt">Northern Territory</option>
                  <option value="act">Australian Capital Territory</option>
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </motion.div>

            {/* Post Code */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Post code<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="postcode"
                  name="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-3 py-2 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200
                    ${errors.postcode ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
                )}
              </div>
              <div></div>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-4">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="
                group relative w-full flex justify-center py-2 px-4 
                border border-transparent text-sm sm:text-base font-medium rounded-lg 
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
                  Submitting Request...
                </div>
              ) : (
                'Submit Request'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  )
}