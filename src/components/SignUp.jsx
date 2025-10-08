'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import axiosInstance from '@/axios/axiosInstance' // Make sure to import axiosInstance
import useUserStore from '@/zustand/user'

export default function SignUpComponent() {
  const [formData, setFormData] = useState({
    customerName: '',
    contactName: '',
    contactEmail: '',
    customerEmail: '',
    CustomerPhoneNo: '',
    contactPhone: '',
    storeName: '',
    abn: '',
    category: '', // This will store the business type
    customCategory: '', // For "Other" option
    address1: '',
    address2: '',
    suburb: '',
    country: '',
    state: '',
    postcode: '',
    password: '' // Default password
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useUserStore((state) => state.setUser);

  // Business type options
  const businessTypes = [
    'Retail Store',
    'Online Store',
    'Wholesaler',
    'Distributor',
    'Other'
  ]

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

  const handleBusinessTypeChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      category: value,
      // Clear custom category if not "Other"
      customCategory: value !== 'Other' ? '' : prev.customCategory
    }))

    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = [
      'customerName',
      'contactName',
      'contactEmail',
      'customerEmail',
      'CustomerPhoneNo',
      'storeName',
      'abn',
      'category',
      'address1',
      'suburb',
      'country',
      'state',
      'postcode',
    ]

    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        newErrors[field] = `${fieldName} is required`
      }
    })

    // If category is "Other", custom category is required
    if (formData.category === 'Other' && !formData.customCategory?.trim()) {
      newErrors.customCategory = 'Please specify your business type'
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }
    if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Create address objects from form data
    const shippingAddress = {
      shippingAddressOne: formData.address1,
      shippingAddressTwo: formData.address2 || '',
      shippingAddressThree: '',
      shippingCity: formData.suburb,
      shippingState: formData.state,
      shippingZip: formData.postcode
    }

    const billingAddress = {
      billingAddressOne: formData.address1,
      billingAddressTwo: formData.address2 || '',
      billingAddressThree: '',
      billingCity: formData.suburb,
      billingState: formData.state,
      billingZip: formData.postcode
    }

    // Prepare submission data
    const submissionData = {
      customerName: formData.customerName,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      customerEmail: formData.customerEmail,
      CustomerPhoneNo: formData.CustomerPhoneNo,
      contactPhone: formData.CustomerPhoneNo, // Using same as customer phone
      storeName: formData.storeName,
      abn: formData.abn,
      category: formData.category === 'Other' ? formData.customCategory : formData.category,
      suburb: formData.suburb,
      country: formData.country,
      state: formData.state,
      postcode: formData.postcode,
      password: formData.password,
      shippingAddresses: [shippingAddress],
      billingAddresses: [billingAddress],
      // Add default values for required backend fields
      defaultShippingRate: "40",
      orderApproval: "ADMIN",
      comments: "New customer signup"
    }

    console.log("Form submitted:", submissionData)
    try {
      const res = await axiosInstance.post('/user/user-signup', submissionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })

      console.log("signup response:", res)
      if (res.data.statusCode === 200) {
        setUser(res.data.data);
        window.location.href = '/my-account-review'
        setErrors({})
        console.log('Signup successful:', res.data)
      } else {
        setErrors({ submit: res.data.message })
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: error.response?.data?.message || 'An error occurred during signup' })
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
    <div className="bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 font-spartan">
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
          className="space-y-4 sm:space-y-6 bg-white px-4 sm:px-6 lg:px-8 rounded-lg"
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

            {/* Customer Name & Contact Name Row */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="customerName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Customer Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.customerName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Contact Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.contactName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contactName}</p>
                )}
              </div>
            </motion.div>

            {/* Contact Email & Customer Email Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="contactEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Contact Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.contactEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contactEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Customer Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.customerEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>
            </motion.div>

            {/* Customer Phone & Store Name Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="CustomerPhoneNo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Customer Phone<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="CustomerPhoneNo"
                  name="CustomerPhoneNo"
                  type="tel"
                  value={formData.CustomerPhoneNo}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.CustomerPhoneNo ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.CustomerPhoneNo && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.CustomerPhoneNo}</p>
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

            {/* ABN & Type of Business Row */}
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
                <label
                  htmlFor="category"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  Type of Business<span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleBusinessTypeChange}
                  className={`
      appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
      border border-gray-700  text-black
      rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
      focus:border-blue-500 focus:z-10 text-sm sm:text-base
      transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
      ${errors.category ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    `}
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-500 text-white">
                      {type}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category}</p>
                )}
              </div>

            </motion.div>

            {/* Custom Business Type (shown only when "Other" is selected) */}
            {formData.category === 'Other' && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22"
                variants={itemVariants}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div></div> {/* Empty div for spacing */}
                <div>
                  <label htmlFor="customCategory" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Specify Business Type<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="customCategory"
                    name="customCategory"
                    type="text"
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    placeholder="Enter your business type"
                    className={`
                      appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                      border border-gray-300 placeholder-gray-400 text-gray-900 
                      rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 focus:z-10 text-sm sm:text-base
                      transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                      ${errors.customCategory ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                    `}
                  />
                  {errors.customCategory && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.customCategory}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Address 1 & Address 2 Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
            </motion.div>

            {/* Suburb & Country Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
                  <option value="" className="bg-gray-500 text-white">Select Country</option>
                  <option value="australia" className="bg-gray-500 text-white">Australia</option>
                </select>

                {errors.country && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.country}</p>
                )}
              </div>
            </motion.div>

            {/* State & Post Code Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
                  <option value="" className="bg-gray-500 text-white">Select State</option>
                  <option value="nsw" className="bg-gray-500 text-white">New South Wales</option>
                  <option value="vic" className="bg-gray-500 text-white">Victoria</option>
                  <option value="qld" className="bg-gray-500 text-white">Queensland</option>
                  <option value="wa" className="bg-gray-500 text-white">Western Australia</option>
                  <option value="sa" className="bg-gray-500 text-white">South Australia</option>
                  <option value="tas" className="bg-gray-500 text-white">Tasmania</option>
                  <option value="nt" className="bg-gray-500 text-white">Northern Territory</option>
                  <option value="act" className="bg-gray-500 text-white">Australian Capital Territory</option>
                </select>

                {errors.state && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.state}</p>
                )}
              </div>
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

            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Password<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="text"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    appearance-none relative block w-full px-2 sm:px-3 py-2 sm:py-0
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 focus:z-10 text-sm sm:text-base
                    transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                    ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                />
                {errors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Submit Error */}
          {
            errors.submit && (
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </motion.div>
            )
          }

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
        </motion.form >
      </motion.div >
    </div >
  )
}