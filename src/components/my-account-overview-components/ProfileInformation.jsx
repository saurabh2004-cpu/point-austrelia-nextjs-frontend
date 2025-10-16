import axiosInstance from "@/axios/axiosInstance";
import useUserStore from "@/zustand/user";
import { useEffect, useState } from "react"

export default function ProfileInformation({ setActiveSection }) {
    const currentUser = useUserStore((state) => state.user);
    const [formData, setFormData] = useState({
        companyName: "",
        phoneNumber: "",
    })
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                companyName: currentUser.storeName || "",
                phoneNumber: currentUser.contactPhone || "",
            })
        }
    }, [currentUser])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        // Clear messages when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    }

    const handleUpdate = async () => {
        // Validation
        if (!formData.companyName.trim() ) {
            setMessage({
                type: 'error',
                text: 'Please fill in all required fields'
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axiosInstance.put(`user/update-contact-phone-and-store-name`, {
                storeName: formData.companyName,
                contactPhone: formData.phoneNumber,
            });

            if (response.data.success && response.data.statusCode === 200) {
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
        setActiveSection('address')
    }

    return (
        <div className="xl:h-screen font-spartan px-4">
            <div className="max-w-8xl ">
                {/* Header */}
                <div className="bg-white rounded-lg ">
                    <div className="pb-16">

                        <div className="border-b-2 border-black pb-4 mb-8">
                            <h1 className="text-[24px]  font-medium text-black">
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
                                    <label className="block text-black mb-2">
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
                                    <label className="block  text-black mb-2">
                                        Phone number <span className="text-[#E9098D]">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                        placeholder="Enter phone number"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Email Section */}
                                <div className="mb-8">
                                    <div className="flex flex-col sm:flex-row ">
                                        {/* Email */}
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-black mb-1">Email:</div>
                                            <div className="text-sm break-all sm:break-normal">
                                                {currentUser.customerEmail}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-[1.5px] bg-black h-6 relative lg:top-3 right-22 self-stretch hidden sm:block"></div>

                                        {/* Button */}
                                        <button
                                            onClick={handleChangeAddress}
                                            disabled={loading}
                                            className="text-[#2D2C70] text-[16px] underline font-[400] hover:underline transition-colors self-start sm:self-center whitespace-nowrap disabled:opacity-50"
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
                                        className="w-[200px] border border-black bg-[#2D2C70] text-white hover:bg-[#2D2C70]/90 py-1 rounded-2xl text-[20px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </div>
    )
}