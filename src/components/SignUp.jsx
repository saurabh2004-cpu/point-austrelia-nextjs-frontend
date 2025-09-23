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
    <div className="   bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 font-spartan ">
      <motion.div
        className="max-w-4xl w-full space-y-6 sm:space-y-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center px-2" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] font-bold text-gray-900 mb-2">
            SIGN <span className="text-[#E9098D]">UP</span>
          </h2>
          <h3 className="text-base sm:text-lg md:text-[20px] font-semibold my-2 sm:my-4 mb-2 text-[#E9098D]">
            Register for Wholesale Access
          </h3>
          <h4 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-semibold mb-2">
            NEW CUSTOMER
          </h4>
          <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#000000]/50 font-[400] px-2 sm:px-4">
            Please complete the form for request access to become a wholesale customer
          </p>
        </motion.div>

        {/* Sign Up Form */}
        <motion.form 
          className=" space-y-4 sm:space-y-6 bg-white px-4 sm:px-6 lg:px-8 rounded-lg"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-[1rem] font-medium">
            
            {/* Required Label */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm sm:text-base lg:text-[1rem] font-medium mb-2 sm:mb-4">
                Required<span className="text-red-500 ml-1">*</span>
              </label>
            </motion.div>

            {/* First Name & Last Name Row */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  First Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Last Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </motion.div>

            {/* Account Email & Order Email Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="accountEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Account Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="accountEmail"
                  name="accountEmail"
                  type="email"
                  value={formData.accountEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.accountEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.accountEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.accountEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="orderEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email for Order Tracking<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="orderEmail"
                  name="orderEmail"
                  type="email"
                  value={formData.orderEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.orderEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.orderEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.orderEmail}</p>
                )}
              </div>
            </motion.div>

            {/* Phone & Store Name Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Phone<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="storeName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Store Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.storeName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.storeName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.storeName}</p>
                )}
              </div>
            </motion.div>

            {/* ABN & Address 1 Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="abn" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  ABN<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="abn"
                  name="abn"
                  type="text"
                  value={formData.abn}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.abn ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.abn && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.abn}</p>
                )}
              </div>
              <div>
                <label htmlFor="address1" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Address 1<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="address1"
                  name="address1"
                  type="text"
                  value={formData.address1}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.address1 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.address1 && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.address1}</p>
                )}
              </div>
            </motion.div>

            {/* Address 2 & Suburb Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="address2" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Address 2
                </label>
                <input
                  id="address2"
                  name="address2"
                  type="text"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="
                    appearance-none relative block w-full px-2 sm:px-2 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                  "
                />
              </div>
              <div>
                <label htmlFor="suburb" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Suburb<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="suburb"
                  name="suburb"
                  type="text"
                  value={formData.suburb}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.suburb ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.suburb && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.suburb}</p>
                )}
              </div>
            </motion.div>

            {/* Country & State Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Country<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-[#000000]/50
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
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
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.country}</p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  State<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-[#000000]/50
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
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
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </motion.div>

            {/* Post Code */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="postcode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Post code<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="postcode"
                  name="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.postcode ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.postcode && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.postcode}</p>
                )}
              </div>
              <div></div>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-2 sm:pt-4 justify-center flex">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="
                group relative w-[403px] h-[44px] flex justify-center align-middle items-center   
                border border-transparent text-sm sm:text-base lg:text-[1rem] font-medium rounded-lg 
                text-white bg-[#2D2C70]   
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 font-[600] 
              "
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Submitting Request...</span>
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