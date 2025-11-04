'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/axios/axiosInstance'
import useUserStore from '@/zustand/user'
import { withAuth } from '@/components/withAuth'

function LoginComponent() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false)
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
    const [forgotPasswordError, setForgotPasswordError] = useState('')
    const [customers, setCustomers] = useState([])
    const [allCustomers, setAllCustomers] = useState([]) // For master sales rep
    const [selectedCustomer, setSelectedCustomer] = useState('')
    const [showCustomerSelection, setShowCustomerSelection] = useState(false)
    const [salesRepData, setSalesRepData] = useState(null)
    const [isContinueLoading, setIsContinueLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const setUser = useUserStore((state) => state.setUser)
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

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
        // Clear general login error when user starts typing
        if (errors.loginError) {
            setErrors(prev => ({
                ...prev,
                loginError: ''
            }))
        }
    }

    const handleForgotPasswordEmailChange = (e) => {
        setForgotPasswordEmail(e.target.value)
        // Clear any existing messages when user starts typing
        if (forgotPasswordMessage || forgotPasswordError) {
            setForgotPasswordMessage('')
            setForgotPasswordError('')
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
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateForgotPasswordEmail = () => {
        const newErrors = {}

        if (!forgotPasswordEmail.trim()) {
            newErrors.email = 'Email Address is required'
        } else if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (Object.keys(newErrors).length > 0) {
            setForgotPasswordError(newErrors.email)
            return false
        }
        return true
    }

    // Fetch assigned customers for regular sales rep
    const fetchCustomers = async (salesRepId) => {
        try {
            const response = await axiosInstance.get(`sales-rep/get-sales-rep-customers/${salesRepId}`)

            console.log("sales rep customers", response)

            if (response.data.statusCode === 200) {
                const customersData = response.data.data.customers
                setCustomers(customersData)
                return customersData
            } else {
                console.error('Error fetching customers:', response.data.message)
                return []
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
            return []
        }
    }

    // Fetch all customers for master sales rep
    const fetchAllCustomers = async () => {
        try {
            const response = await axiosInstance.get('/admin/get-all-users')
            console.log("all customers response", response.data)

            if (response.data.statusCode === 200) {
                const customersData = response.data.data?.docs || response.data.data || response.data

                // Filter out duplicates based on _id
                const getUniqueCustomers = (customers) => {
                    if (!Array.isArray(customers)) return []

                    const uniqueCustomers = []
                    const seenIds = new Set()

                    customers.forEach(customer => {
                        if (customer._id && !seenIds.has(customer._id)) {
                            seenIds.add(customer._id)
                            uniqueCustomers.push(customer)
                        }
                    })

                    return uniqueCustomers
                }

                const uniqueCustomers = getUniqueCustomers(customersData)
                setAllCustomers(uniqueCustomers)
                setCustomers(uniqueCustomers) // Set both for consistency
                return uniqueCustomers
            }
            return []
        } catch (error) {
            console.error('Error fetching all customers:', error)
            return []
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors(prev => ({ ...prev, loginError: '' }))

        try {
            const res = await axiosInstance.post('sales-rep/login-sales-rep', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            console.log("Login response:", res)

            if (res.data.statusCode === 200) {
                setSalesRepData(res.data.data)

                // Check if sales rep is master sales rep
                const isMasterSalesRep = res.data.data.role === "Master-Sales-Rep"

                if (isMasterSalesRep) {
                    // Fetch all customers for master sales rep
                    const customersData = await fetchAllCustomers()

                    if (customersData && customersData.length > 0) {
                        setShowCustomerSelection(true)
                        setIsLoading(false)
                    } else {
                        setIsLoading(false)
                        setErrors(prev => ({
                            ...prev,
                            loginError: 'No customers found in the system.'
                        }))
                    }
                } else {
                    // Fetch assigned customers for regular sales rep
                    const customersData = await fetchCustomers(res.data.data._id)

                    if (customersData && customersData.length > 0) {
                        setShowCustomerSelection(true)
                        setIsLoading(false)
                    } else {
                        setIsLoading(false)
                        setErrors(prev => ({
                            ...prev,
                            loginError: 'No customers assigned to this sales representative.'
                        }))
                    }
                }

            } else if (res.data.statusCode === 200 && res.data.data.inactive == true) {
                setIsLoading(false)
                setErrors(prev => ({
                    ...prev,
                    loginError: 'Your account is inactive. Please contact support for assistance.'
                }))
            } else {
                setIsLoading(false)
                setErrors(prev => ({
                    ...prev,
                    loginError: res.data.message || 'Login failed. Please try again.'
                }))
            }
        } catch (error) {
            console.error('Login error:', error)
            let errorMessage = 'An error occurred during login'

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setErrors(prev => ({
                ...prev,
                loginError: errorMessage
            }))
            setIsLoading(false)
        }
    }

    // Filter customers based on search query
    const filteredCustomers = customers.filter(customer => {
        if (!searchQuery.trim()) return true

        const query = searchQuery.toLowerCase()
        const customerName = (customer.customerName || customer.name || '').toLowerCase()
        const email = (customer.email || '').toLowerCase()

        return customerName.includes(query) || email.includes(query)
    })

    const handleCustomerSelection = (customerId) => {
        setSelectedCustomer(customerId)
        // Clear customer error when selection changes
        if (errors.customerError) {
            setErrors(prev => ({
                ...prev,
                customerError: ''
            }))
        }
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleContinue = async () => {
        if (!selectedCustomer) {
            setErrors(prev => ({
                ...prev,
                customerError: 'Please select a customer to continue'
            }))
            return
        }

        try {
            setIsContinueLoading(true)
            setErrors(prev => ({ ...prev, customerError: '' }))

            // Find the selected customer data
            const customer = customers.find(c => c._id === selectedCustomer)

            if (!customer) {
                setErrors(prev => ({
                    ...prev,
                    customerError: 'Selected customer not found'
                }))
                setIsContinueLoading(false)
                return
            }

            const response = await axiosInstance.get(`sales-rep/get-current-user/${customer._id}`)

            if (response.data.statusCode === 200) {
                setUser(response.data.data)

                startTransition(() => {
                    router.push('/')
                })
            }

        } catch (error) {
            console.error('Error setting customer session:', error)
            let errorMessage = 'Failed to continue. Please try again.'

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setErrors(prev => ({
                ...prev,
                customerError: errorMessage
            }))
            setIsContinueLoading(false)
        }
    }

    const handleBack = () => {
        setShowCustomerSelection(false)
        setSelectedCustomer('')
        setCustomers([])
        setAllCustomers([])
        setSalesRepData(null)
        setSearchQuery('')
        setErrors({})
    }

    const handleForgotPassword = async () => {
        if (!validateForgotPasswordEmail()) return

        setForgotPasswordLoading(true)
        setForgotPasswordMessage('')
        setForgotPasswordError('')

        try {
            const res = await axiosInstance.post('user/send-password-reset-email',
                { email: forgotPasswordEmail },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log("Forgot password response:", res)

            if (res.data.statusCode === 200) {
                setForgotPasswordMessage('Password reset email sent successfully! Please check your inbox.')
                setForgotPasswordEmail('')
                // Auto close popup after 3 seconds
                setTimeout(() => {
                    setShowForgotPasswordPopup(false)
                    setForgotPasswordMessage('')
                }, 3000)
            } else {
                setForgotPasswordError(res.data.message || 'Failed to send reset email. Please try again.')
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            let errorMessage = 'An error occurred while sending reset email. Please try again.'

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            setForgotPasswordError(errorMessage)
        } finally {
            setForgotPasswordLoading(false)
        }
    }

    const handleWholesaleRegister = () => {
        startTransition(() => {
            router.push('/sign-up')
        })
    }

    const openForgotPasswordPopup = () => {
        setShowForgotPasswordPopup(true)
        setForgotPasswordEmail('')
        setForgotPasswordMessage('')
        setForgotPasswordError('')
    }

    const closeForgotPasswordPopup = () => {
        setShowForgotPasswordPopup(false)
        setForgotPasswordEmail('')
        setForgotPasswordMessage('')
        setForgotPasswordError('')
    }

    // Customer Selection Screen
    if (showCustomerSelection) {
        const isMasterSalesRep = salesRepData?.role === "Master-Sales-Rep"

        return (
            <div className="py-12 bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan min-h-screen">
                <div className="max-w-2xl w-full animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            SALES REP <span className="text-[#E9098D]">LOGIN</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-2">
                            Log in below to checkout with a customer's account
                        </p>
                        {isMasterSalesRep && (
                            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 inline-block">
                                <p className="text-blue-800 font-medium text-sm">
                                    👑 Master Sales Rep - Access to all customers
                                </p>
                            </div>
                        )}
                        {!isMasterSalesRep && (
                            <p className="text-sm text-gray-500">
                                Showing your assigned customers ({filteredCustomers.length} of {customers.length})
                            </p>
                        )}
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Customers
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by customer name or email..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            {searchQuery && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Found {filteredCustomers.length} customer(s) matching "{searchQuery}"
                                </p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-base font-semibold text-gray-900 mb-1">
                                Required <span className="text-red-500">*</span>
                            </label>
                            <label className="block text-base font-medium text-gray-900 mb-4">
                                Select Customer <span className="text-red-500">*</span>
                            </label>

                            {/* Customer List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <label
                                            key={customer._id}
                                            className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <input
                                                type="radio"
                                                name="customer"
                                                value={customer._id}
                                                checked={selectedCustomer === customer._id}
                                                onChange={() => handleCustomerSelection(customer._id)}
                                                className="h-4 w-4 text-[#74C7F0] focus:ring-[#74C7F0] border-gray-300"
                                            />
                                            <div className="ml-3 flex-1">
                                                <span className="text-sm font-medium text-gray-900 block">
                                                    {customer.customerName || customer.name || 'Unnamed Customer'}
                                                </span>
                                                <span className="text-xs text-gray-500 block mt-1">
                                                    {customer.email}
                                                </span>
                                                {customer.phone && (
                                                    <span className="text-xs text-gray-500 block">
                                                        📞 {customer.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? (
                                            <div>
                                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-sm">No customers found matching "{searchQuery}"</p>
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Clear search
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <p className="text-sm">
                                                    {isMasterSalesRep
                                                        ? 'No customers found in the system'
                                                        : 'No customers assigned to your account'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {errors.customerError && (
                                <p className="mt-2 text-sm text-red-600 animate-slide-down">
                                    {errors.customerError}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={isContinueLoading}
                                className="flex-1 py-3 px-4 border border-gray-300 text-base font-semibold rounded-md text-white bg-[#2D2B70] hover:bg-[#2D2B70]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D2B70] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={!selectedCustomer || isContinueLoading}
                                className="flex-1 py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-[#74C7F0] hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#74C7F0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isContinueLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </div>
                                ) : (
                                    'CONTINUE'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Rest of the login form remains the same...
    return (
        <>
            <div className="py-12 bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-spartan">
                <div className="max-w-md w-full animate-fade-in">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-[2rem] font-bold sm:text-4xl font-bold text-gray-900 mb-2">
                            LOG <span className="text-[#E9098D]">IN</span>
                        </h2>
                        <h3 className="text-[24px] font-semibold mb-2">
                            Log In AS Sales Rep
                        </h3>
                        <p className="text-[18px] text-[#000000]/50 font-[400]">
                            Log in below to checkout with an existing account
                        </p>
                    </div>

                    {/* Login Form - Same as before */}
                    <form
                        className="space-y-6 bg-white p-6 sm:p-8 rounded-lg"
                        onSubmit={handleLogin}
                    >
                        {/* General Login Error */}
                        {errors.loginError && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200 animate-slide-down">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">
                                            {errors.loginError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5 text-[1rem] font-medium">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-[1rem] font-medium mb-2">
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
                                    placeholder="Enter your email address"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 animate-slide-down">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
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
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 animate-slide-down">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Login Button */}
                        <div className='space-y-3'>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || isPending}
                                    className="
                    group relative w-full flex justify-center py-2 px-4 border border-black 
                    text-sm sm:text-base font-medium rounded-md 
                    text-white bg-[#74C7F0] hover:bg-sky-500 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 text-[1rem] font-[600]
                    hover:scale-[1.02] active:scale-[0.98]
                  "
                                >
                                    {isLoading || isPending ? (
                                        <div className="flex items-center text-[17px] font-semibold">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </div>
                                    ) : (
                                        'Log In'
                                    )}
                                </button>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={openForgotPasswordPopup}
                                    className="
                    w-full flex justify-center py-2 px-4 border border-black 
                    text-sm sm:text-base font-medium rounded-md 
                    text-white bg-[#E799A9] hover:bg-[#E799A9]/80
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    transition-all duration-200 text-[1rem] font-[500]
                    hover:scale-[1.02] active:scale-[0.98]
                  "
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Forgot Password Popup - Same as before */}
            {showForgotPasswordPopup && (
                <div
                    className="fixed inset-0 bg-[#000000]/50 flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={closeForgotPasswordPopup}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reset Your Password</h3>
                            <button
                                onClick={closeForgotPasswordPopup}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address<span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="forgot-password-email"
                                    type="email"
                                    value={forgotPasswordEmail}
                                    onChange={handleForgotPasswordEmailChange}
                                    className={`
                    appearance-none relative block w-full px-3 py-3 
                    border border-gray-300 placeholder-gray-400 text-gray-900 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 text-sm sm:text-base
                    transition-colors duration-200
                    ${forgotPasswordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                  `}
                                    placeholder="Enter your email address"
                                />
                                {forgotPasswordError && (
                                    <p className="mt-1 text-sm text-red-600 animate-slide-down">
                                        {forgotPasswordError}
                                    </p>
                                )}
                            </div>

                            {/* Success Message */}
                            {forgotPasswordMessage && (
                                <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-slide-down">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                {forgotPasswordMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeForgotPasswordPopup}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={forgotPasswordLoading}
                                    className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#74C7F0] hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {forgotPasswordLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default withAuth(LoginComponent);