'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import axiosInstance from '@/axios/axiosInstance'
import useUserStore from '@/zustand/user'

export default function SignUpComponent() {
  const [formData, setFormData] = useState({
    customerName: '',
    contactName: '',
    contactEmail: '',
    customerEmail: '',
    CustomerPhoneNo: '+61 ',
    contactPhone: '+61 ',
    storeName: '',
    abn: '',
    category: '',
    customCategory: '',
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
  const [successMessage, setSuccessMessage] = useState('')

  // Business type options
  const businessTypes = [
    'Retail Store',
    'Online Store',
    'Wholesaler',
    'Distributor',
    'Other'
  ]

  // Function to format Australian phone numbers
  const formatAustralianPhoneNumber = (phone) => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d\+]/g, '');

    // If it starts with +61, handle international format
    if (cleaned.startsWith('61')) {
      const mobilePart = cleaned.substring(2);
      if (mobilePart.startsWith('4') && mobilePart.length === 9) {
        // Mobile: +61 4XX XXX XXX
        const firstPart = mobilePart.substring(0, 3);
        const secondPart = mobilePart.substring(3, 6);
        const thirdPart = mobilePart.substring(6, 9);
        return `+61 ${firstPart} ${secondPart} ${thirdPart}`;
      } else if (mobilePart.length === 9) {
        // Landline: +61 X XXXX XXXX
        const areaCode = mobilePart.substring(0, 1);
        const firstPart = mobilePart.substring(1, 5);
        const secondPart = mobilePart.substring(5, 9);
        return `+61 ${areaCode} ${firstPart} ${secondPart}`;
      }
    } else if (cleaned.startsWith('4') && cleaned.length === 9) {
      // Mobile without country code: 4XX XXX XXX
      const firstPart = cleaned.substring(0, 3);
      const secondPart = cleaned.substring(3, 6);
      const thirdPart = cleaned.substring(6, 9);
      return `+61 ${firstPart} ${secondPart} ${thirdPart}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Domestic format: 04XX XXX XXX or 0X XXXX XXXX
      const areaCode = cleaned.substring(0, 2);
      const rest = cleaned.substring(2);

      if (areaCode === '04') {
        // Mobile: 04XX XXX XXX -> +61 4XX XXX XXX
        const firstPart = rest.substring(0, 3);
        const secondPart = rest.substring(3, 6);
        const thirdPart = rest.substring(6, 9);
        return `+61 ${firstPart} ${secondPart} ${thirdPart}`;
      } else {
        // Landline: 0X XXXX XXXX -> +61 X XXXX XXXX
        const areaCodeNum = areaCode.substring(1);
        const firstPart = rest.substring(0, 4);
        const secondPart = rest.substring(4, 8);
        return `+61 ${areaCodeNum} ${firstPart} ${secondPart}`;
      }
    }

    // Return original if no specific format matches
    return phone;
  };

  // Function to validate Australian phone number
  const isValidAustralianPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^\d\+]/g, '');

    // Australian phone number patterns:
    // - Domestic mobile: 04XXXXXXXX (10 digits)
    // - Domestic landline: 0XXXXXXXXX (10 digits starting with 02, 03, 07, 08)
    // - International mobile: 614XXXXXXXX (11 digits)
    // - International landline: 61XXXXXXXXX (11 digits)
    // - With +61 prefix: +61 4XXXXXXXX or +61 XXXXXXXXX

    const patterns = [
      /^\+61\s?[4]\d{8}$/,          // +61 4XX XXX XXX
      /^\+61\s?[2378]\d{8}$/,       // +61 X XXXX XXXX (landlines)
      /^04\d{8}$/,                  // 04XX XXX XXX
      /^0[2378]\d{8}$/,             // 0X XXXX XXXX (landlines)
      /^61[4]\d{8}$/,               // 614XX XXX XXX
      /^61[2378]\d{8}$/,            // 61X XXXX XXXX (landlines)
    ];

    return patterns.some(pattern => pattern.test(cleaned));
  };

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

  // Handle phone number input with real-time formatting
  const handlePhoneChange = (e, fieldName) => {
    let input = e.target.value;

    // Ensure +61 prefix is always present and not editable
    if (!input.startsWith('+61')) {
      input = '+61 ' + input.replace(/[^\d]/g, '');
    }

    // Allow only numbers, spaces after +61
    const prefix = '+61 ';
    let numbers = input.substring(prefix.length).replace(/[^\d]/g, '');

    // Limit to 9 digits after +61 (actual digits, not including spaces)
    if (numbers.length > 9) {
      numbers = numbers.substring(0, 9);
    }

    // Auto-format as user types
    let formatted = prefix;
    if (numbers.length > 0) {
      if (numbers.startsWith('4')) {
        // Mobile format: +61 4XX XXX XXX
        if (numbers.length <= 3) {
          formatted += numbers;
        } else if (numbers.length <= 6) {
          formatted += `${numbers.substring(0, 3)} ${numbers.substring(3)}`;
        } else {
          formatted += `${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6)}`;
        }
      } else {
        // Landline format: +61 X XXXX XXXX
        if (numbers.length <= 1) {
          formatted += numbers;
        } else if (numbers.length <= 5) {
          formatted += `${numbers.substring(0, 1)} ${numbers.substring(1)}`;
        } else {
          formatted += `${numbers.substring(0, 1)} ${numbers.substring(1, 5)} ${numbers.substring(5)}`;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: formatted
    }));

    // Clear error when user starts typing again
    if (errors[fieldName] && numbers.length > 0) {
      // Validate in real-time and remove error if valid
      const testPhone = prefix + numbers;
      if (isValidAustralianPhoneNumber(testPhone)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: ''
        }));
      }
    }
  };

  // Format phone number on blur and validate
  const handlePhoneBlur = (e, fieldName) => {
    const input = e.target.value;

    if (input && isValidAustralianPhoneNumber(input)) {
      const formatted = formatAustralianPhoneNumber(input);
      setFormData(prev => ({
        ...prev,
        [fieldName]: formatted
      }));
      // Clear error when valid
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } else if (input === '+61 ') {
      // Keep the default if user clears the input
      setFormData(prev => ({
        ...prev,
        [fieldName]: '+61 '
      }));
      // Clear error for empty field
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } else if (input && !isValidAustralianPhoneNumber(input)) {
      // Set error for invalid number
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Please enter a valid Australian phone number'
      }));
    }
  };

  // Handle phone input focus - select the number part for easy editing
  const handlePhoneFocus = (e, fieldName) => {
    // Select the number part after +61 for easy editing
    setTimeout(() => {
      const input = e.target;
      if (input.value.startsWith('+61 ')) {
        input.setSelectionRange(4, input.value.length);
      }
    }, 0);

    // Clear error when user focuses on the field to make corrections
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

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

    // Validate phone numbers
    if (formData.CustomerPhoneNo && !isValidAustralianPhoneNumber(formData.CustomerPhoneNo)) {
      newErrors.CustomerPhoneNo = 'Please enter a valid Australian phone number'
    }
    if (formData.contactPhone && !isValidAustralianPhoneNumber(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid Australian phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Format phone numbers before submitting and remove +61 prefix
    const formatPhoneForBackend = (phone) => {
      if (!phone || phone === '+61 ') return '';
      // Remove +61 prefix and any spaces, keep only the numbers
      return phone.replace(/^\+61\s?/, '').replace(/\s/g, '');
    };

    const formattedCustomerPhone = formatPhoneForBackend(formData.CustomerPhoneNo);
    const formattedContactPhone = formatPhoneForBackend(formData.contactPhone);

    // Create address objects from form data
    const shippingAddress = {
      shippingAddressOne: formData.address1,
      shippingAddressTwo: formData.address2 || '',
      shippingAddressThree: '',
      shippingCity: formData.suburb,
      shippingState: formData.state,
      shippingZip: formData.postcode,
      CustomerPhoneNo: formattedCustomerPhone
    }

    const billingAddress = {
      billingAddressOne: formData.address1,
      billingAddressTwo: formData.address2 || '',
      billingAddressThree: '',
      billingCity: formData.suburb,
      billingState: formData.state,
      billingZip: formData.postcode,
      CustomerPhoneNo: formattedCustomerPhone
    }

    // Prepare submission data
    const submissionData = {
      customerName: formData.customerName,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      customerEmail: formData.customerEmail,
      CustomerPhoneNo: formattedCustomerPhone,
      contactPhone: formattedContactPhone,
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
      const res = await axiosInstance.post('user/user-signup', submissionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })

      console.log("signup response:", res)
      if (res.data.statusCode === 200) {
        setSuccessMessage('Thank you for signing up! We are reviewing your account for approval.')
        setFormData({
          customerName: '',
          contactName: '',
          contactEmail: '',
          customerEmail: '',
          CustomerPhoneNo: '+61 ',
          contactPhone: '+61 ',
          storeName: '',
          abn: '',
          category: '',
          customCategory: '',
          address1: '',
          address2: '',
          suburb: '',
          country: '',
          state: '',
          postcode: '',
          password: ''
        });
        setErrors({
          success: 'Thank you for signing up! We are reviewing your account for approval.'
        });
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
      <div
        className="max-w-4xl w-full space-y-6 sm:space-y-8 py-12"
      >
        {/* Header */}
        <div className="text-center px-2">
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
        </div>

        {/* Sign Up Form */}
        <form
          className="space-y-4 sm:space-y-6 bg-white px-4 sm:px-6 lg:px-8 rounded-lg"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-[1rem] font-medium">

            {/* Required Label */}
            <div >
              <label className="block text-sm sm:text-base lg:text-[1rem] font-medium mb-2 sm:mb-4">
                Required<span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Customer Name & Contact Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" >
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
            </div>

            {/* Contact Email & Customer Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" >
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
            </div>

            {/* Customer Phone & Contact Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" >
              <div>
                <label htmlFor="CustomerPhoneNo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Customer Phone<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {/* Australian Flag Emoji */}
                    <span className="text-lg">🇦🇺</span>
                  </div>
                  <input
                    id="CustomerPhoneNo"
                    name="CustomerPhoneNo"
                    type="text"
                    value={formData.CustomerPhoneNo}
                    onChange={(e) => handlePhoneChange(e, 'CustomerPhoneNo')}
                    onBlur={(e) => handlePhoneBlur(e, 'CustomerPhoneNo')}
                    onFocus={(e) => handlePhoneFocus(e, 'CustomerPhoneNo')}
                    placeholder="+61 4XX XXX XXX"
                    className={`
                      appearance-none relative block w-full pl-10 pr-3 py-2 sm:py-0
                      border border-gray-300 placeholder-gray-400 text-gray-900 
                      rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 focus:z-10 text-sm sm:text-base
                      transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                      ${errors.CustomerPhoneNo ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                    `}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formData.CustomerPhoneNo.startsWith('+61 4') ?
                    'Mobile format: +61 4XX XXX XXX' :
                    'Landline format: +61 X XXXX XXXX'
                  }
                </div>
                {errors.CustomerPhoneNo && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.CustomerPhoneNo}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Contact Phone<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {/* Australian Flag Emoji */}
                    <span className="text-lg">🇦🇺</span>
                  </div>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => handlePhoneChange(e, 'contactPhone')}
                    onBlur={(e) => handlePhoneBlur(e, 'contactPhone')}
                    onFocus={(e) => handlePhoneFocus(e, 'contactPhone')}
                    placeholder="+61 4XX XXX XXX"
                    className={`
                      appearance-none relative block w-full pl-10 pr-3 py-2 sm:py-0
                      border border-gray-300 placeholder-gray-400 text-gray-900 
                      rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 focus:z-10 text-sm sm:text-base
                      transition-colors duration-200 min-h-[40px] sm:min-h-[44px]
                      ${errors.contactPhone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                    `}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formData.contactPhone.startsWith('+61 4') ?
                    'Mobile format: +61 4XX XXX XXX' :
                    'Landline format: +61 X XXXX XXXX'
                  }
                </div>
                {errors.contactPhone && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Store Name & ABN Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" >
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
            </div>

            {/* Type of Business */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" >
              <div></div> {/* Empty div for spacing */}
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
            </div>

            {/* Custom Business Type (shown only when "Other" is selected) */}
            {formData.category === 'Other' && (
              <div
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
              </div>
            )}

            {/* Address 1 & Address 2 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
            </div>

            {/* Suburb & Country Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
            </div>

            {/* State & Post Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-22" variants={itemVariants}>
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
            </div>
          </div>

          {/* Submit Error */}
          {
            errors.submit && (
              <div variants={itemVariants} className="text-center">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )
          }

          {/* Submit Button */}
          <div variants={itemVariants} className="pt-2 sm:pt-4 justify-center flex">
            <button
              type="submit"
              disabled={isLoading}
              className="
                group relative w-[403px] h-[44px] flex justify-center align-middle items-center   
                border border-black text-sm sm:text-base lg:text-[17px] font-medium rounded-lg 
                text-white bg-[#2D2C70]   
                
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
            </button>
          </div>
          {successMessage && <div className="text-green-500 mb-4 w-full flex mx-auto justify-center">{successMessage}</div>}
        </form >
      </div >
    </div >
  )
}