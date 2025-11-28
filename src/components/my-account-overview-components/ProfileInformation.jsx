import axiosInstance from "@/axios/axiosInstance";
import useUserStore from "@/zustand/user";
import { useEffect, useState } from "react"

export default function ProfileInformation({ setActiveSection }) {
    const currentUser = useUserStore((state) => state.user);
    const [formData, setFormData] = useState({
        companyName: "",
        phoneNumber: "+61 ",
    })
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const setUser = useUserStore((state) => state.setUser);

    // Email change modal states
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailFormData, setEmailFormData] = useState({
        contactEmail: "",
        customerEmail: "",
    });
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

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

    // Function to format phone for backend (remove +61 prefix)
    const formatPhoneForBackend = (phone) => {
        if (!phone || phone === '+61 ') return '';
        // Remove +61 prefix and any spaces, keep only the numbers
        return phone.replace(/^\+61\s?/, '').replace(/\s/g, '');
    };

    useEffect(() => {
        if (currentUser) {
            // Format the phone number for display
            const displayPhone = currentUser.CustomerPhoneNo ? 
                formatAustralianPhoneNumber(currentUser.CustomerPhoneNo) : 
                '+61 ';
                
            setFormData({
                companyName: currentUser.storeName || "",
                phoneNumber: displayPhone,
            })
        }
    }, [currentUser])

    const handleInputChange = (field, value) => {
        if (field === 'phoneNumber') {
            // Handle phone number input with real-time formatting
            let input = value;

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
                [field]: formatted
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }))
        }
        
        // Clear messages when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    }

    const handleUpdate = async () => {
        // Validation
        if (!formData.companyName.trim()) {
            setMessage({
                type: 'error',
                text: 'Please fill in all required fields'
            });
            return;
        }

        // Validate phone number
        if (formData.phoneNumber && !isValidAustralianPhoneNumber(formData.phoneNumber)) {
            setMessage({
                type: 'error',
                text: 'Please enter a valid Australian phone number'
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axiosInstance.put(`user/update-contact-phone-and-store-name`, {
                storeName: formData.companyName,
                contactPhone: formatPhoneForBackend(formData.phoneNumber), // Format for backend
            });

            if (response.data.statusCode === 200) {
                setMessage({
                    type: 'success',
                    text: response.data.message || 'Profile updated successfully!'
                });
                setUser(response.data.data);
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setMessage({
                    type: 'error',
                    text: response.data.message || 'Failed to update profile information'
                });
            }
        } catch (error) {
            console.error("Error updating profile information:", error);
            
            let errorMessage = 'An error occurred while updating profile';
            
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
            }

            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    }

    const handleChangeAddress = () => {
        setEmailFormData({
            contactEmail: currentUser?.contactEmail || "",
            customerEmail: currentUser?.customerEmail || "",
        });
        setEmailMessage({ type: '', text: '' });
        setShowEmailModal(true);
    }

    const handleEmailInputChange = (field, value) => {
        setEmailFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user starts typing
        if (emailMessage.text) {
            setEmailMessage({ type: '', text: '' });
        }
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handleEmailSubmit = async () => {
        // Validation
        if (!emailFormData.contactEmail.trim() || !emailFormData.customerEmail.trim()) {
            setEmailMessage({
                type: 'error',
                text: 'Both email fields are required'
            });
            return;
        }

        if (!validateEmail(emailFormData.contactEmail)) {
            setEmailMessage({
                type: 'error',
                text: 'Please enter a valid contact email address'
            });
            return;
        }

        if (!validateEmail(emailFormData.customerEmail)) {
            setEmailMessage({
                type: 'error',
                text: 'Please enter a valid customer email address'
            });
            return;
        }

        setEmailLoading(true);
        setEmailMessage({ type: '', text: '' });

        try {
            const response = await axiosInstance.put('user/change-email-addresses', {
                contactEmail: emailFormData.contactEmail.trim(),
                customerEmail: emailFormData.customerEmail.trim(),
            });

            if (response.data.statusCode === 200) {
                setEmailMessage({
                    type: 'success',
                    text: response.data.message || 'Email addresses updated successfully!'
                });
                setUser(response.data.data);
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    setShowEmailModal(false);
                    setEmailMessage({ type: '', text: '' });
                }, 2000);
            } else {
                setEmailMessage({
                    type: 'error',
                    text: response.data.message || 'Failed to update email addresses'
                });
            }
        } catch (error) {
            console.error("Error updating email addresses:", error);
            
            let errorMessage = 'An error occurred while updating email addresses';
            
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
            }

            setEmailMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setEmailLoading(false);
        }
    }

    const handleCloseModal = () => {
        if (!emailLoading) {
            setShowEmailModal(false);
            setEmailMessage({ type: '', text: '' });
        }
    }

    return (
        <div className="xl:h-screen font-body px-4">
            <div className="max-w-8xl ">
                {/* Header */}
                <div className="bg-white rounded-lg ">
                    <div className="pb-16">

                        <div className="border-b-2 border-black pb-4 mb-8 lg:mt-4">
                            <h1 className="text-[24px] font-heading  font-medium text-black">
                                Profile Information
                            </h1>
                        </div>

                        {/* Message Display */}
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg border ${
                                message.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex items-center">
                                    {message.type === 'success' ? (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="font-medium">
                                        {message.type === 'success' ? 'Success!' : 'Error!'}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">{message.text}</p>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="max-w-md  sm:max-w-lg">
                            {/* Required Field Notice */}
                            <div className="mb-4">
                                <span className="text-[14px] font-[400]">Required </span>
                                <span className="text-[#E9098D] text-[16px] font-bold">*</span>
                            </div>

                            <div className="max-w-[470px]">
                                {/* Company Name Field */}
                                <div className="mb-6 text-[1rem] font-medium ">
                                    <label className="block text-black mb-2 font-heading">
                                        Company name <span className="text-[#E9098D]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                        placeholder="Enter company name"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Phone Number Field */}
                                <div className="mb-8 text-[1rem] font-medium">
                                    <label className="block text-black mb-2 font-heading">
                                        Phone number <span className="text-[#E9098D]">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            {/* Australian Flag Emoji */}
                                            <span className="text-lg">🇦🇺</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            onBlur={(e) => {
                                                // Format on blur
                                                const input = e.target.value;
                                                if (input && isValidAustralianPhoneNumber(input)) {
                                                    const formatted = formatAustralianPhoneNumber(input);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        phoneNumber: formatted
                                                    }));
                                                } else if (input === '+61 ') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        phoneNumber: '+61 '
                                                    }));
                                                }
                                            }}
                                            onFocus={(e) => {
                                                // Select the number part for easy editing
                                                setTimeout(() => {
                                                    const input = e.target;
                                                    if (input.value.startsWith('+61 ')) {
                                                        input.setSelectionRange(4, input.value.length);
                                                    }
                                                }, 0);
                                            }}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                            placeholder="+61 4XX XXX XXX"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.phoneNumber.startsWith('+61 4') ?
                                            'Mobile format: +61 4XX XXX XXX' :
                                            'Landline format: +61 X XXXX XXXX'
                                        }
                                    </div>
                                </div>

                                {/* Email Section */}
                                <div className="mb-8">
                                    <div className="flex flex-col sm:flex-row ">
                                        {/* Email */}
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-black mb-1Email:">Email:</div>
                                            <div className="text-sm break-all sm:break-normal">
                                                {currentUser?.customerEmail}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-[1.5px] bg-black h-6 relative lg:top-3 right-22 self-stretch hidden sm:block"></div>

                                        {/* Button */}
                                        <button
                                            onClick={handleChangeAddress}
                                            disabled={loading}
                                            className="text-[#2D2C70] cursor-pointer text-[16px] underline font-[400] hover:underline transition-colors self-start sm:self-center whitespace-nowrap disabled:opacity-50"
                                        >
                                            Change address
                                        </button>
                                    </div>
                                </div>
                                {/* Update Button */}
                                <div className="">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="font-heading w-[200px] cursor-pointer border border-black bg-[#2D2C70] text-white hover:bg-[#2D2C70]/90 py-1 rounded-2xl text-[20px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update'
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Email Change Modal */}
            {showEmailModal && (
                <div className="absolute inset-0 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            disabled={emailLoading}
                            className="absolute top-4 cursor-pointer right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal Header */}
                        <h2 className="text-[24px] font-medium text-black mb-6">
                            Change Email Addresses
                        </h2>

                        {/* Modal Message Display */}
                        {emailMessage.text && (
                            <div className={`mb-4 p-4 rounded-lg border ${
                                emailMessage.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex items-center">
                                    {emailMessage.type === 'success' ? (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="text-sm">{emailMessage.text}</span>
                                </div>
                            </div>
                        )}

                        {/* Contact Email Field */}
                        <div className="mb-4">
                            <label className="block text-[1rem] font-medium text-black mb-2">
                                Contact Email <span className="text-[#E9098D]">*</span>
                            </label>
                            <input
                                type="email"
                                value={emailFormData.contactEmail}
                                onChange={(e) => handleEmailInputChange('contactEmail', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                placeholder="Enter contact email"
                                disabled={emailLoading}
                            />
                        </div>

                        {/* Customer Email Field */}
                        <div className="mb-6">
                            <label className="block text-[1rem] font-medium text-black mb-2">
                                Customer Email <span className="text-[#E9098D]">*</span>
                            </label>
                            <input
                                type="email"
                                value={emailFormData.customerEmail}
                                onChange={(e) => handleEmailInputChange('customerEmail', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                placeholder="Enter customer email"
                                disabled={emailLoading}
                            />
                        </div>

                        {/* Modal Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCloseModal}
                                disabled={emailLoading}
                                className="px-6 py-2 border cursor-pointer border-gray-300 rounded-2xl text-[16px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEmailSubmit}
                                disabled={emailLoading}
                                className="px-6 py-2 border cursor-pointer border-black bg-[#2D2C70] text-white hover:bg-[#2D2C70]/90 rounded-2xl text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {emailLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </div>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}