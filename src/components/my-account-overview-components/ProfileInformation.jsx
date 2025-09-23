import { useState } from "react"

export default function ProfileInformation({ setShowForm }) {
    const [formData, setFormData] = useState({
        companyName: "Devendra Chandora",
        phoneNumber: "+617073737773",
        email: "devendra.chandora@gmail.com"
    })
    const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    })

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleUpdate = () => {
        // Handle form submission logic here
        setShowForm(false)
        console.log("Profile updated:", formData)
    }

    const handlePasswordUpdate = () => {
        // Handle form submission logic here
        setShowUpdatePasswordForm(false)
        console.log("Password updated:", passwordForm)
    }

    const handleChangeAddress = () => {
        setShowUpdatePasswordForm(true)
    }

    return (
        <div className="h-full font-spartan px-4">
            <div className="max-w-8xl ">
                {/* Header */}
                <div className="bg-white rounded-lg ">
                    <div className="pb-16">

                        <div className="border-b-2 border-black pb-4 mb-8">
                            <h1 className="text-[24px]  font-medium text-black">
                                {showUpdatePasswordForm ? 'Update Your Password' : 'Profile Information'}
                            </h1>
                        </div>

                        {/* Form Content */}
                        <div className="max-w-md  sm:max-w-lg">
                            {/* Required Field Notice */}
                            <div className="mb-4">
                                <span className="text-[14px] font-[400]">Required </span>
                                <span className="text-[#E9098D] text-[16px] font-bold">*</span>
                            </div>

                            {showUpdatePasswordForm ?
                                <>
                                    <div className="mb-6 text-[1rem] font-medium ">
                                        <label className="block text-black mb-2">
                                            Current password <span className="text-[#E9098D]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                            placeholder="Enter Current Password"
                                        />
                                    </div>

                                    {/* Phone Number Field */}
                                    <div className="mb-8 text-[1rem] font-medium">
                                        <label className="block  text-black mb-2">
                                            New password <span className="text-[#E9098D]">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent transition-colors"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    {/* Update Button */}
                                    <div className="">
                                        <button
                                            onClick={handleUpdate}
                                            className="w-[200px] h-[42px] bg-[#2D2C70] text-white hover:bg-[#1a1945] py-1 rounded-2xl text-[20px] font-medium  "
                                        >
                                            Update
                                        </button>
                                    </div>

                                </>
                                :
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
                                        />
                                    </div>

                                    {/* Email Section */}
                                    <div className="mb-8">
                                        <div className="flex flex-col sm:flex-row ">
                                            {/* Email */}
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-black mb-1">Email:</div>
                                                <div className="text-sm break-all sm:break-normal">
                                                    {formData.email}
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-[1.5px] bg-black h-6 relative lg:top-3 right-22 self-stretch hidden sm:block"></div>

                                            {/* Button */}
                                            <button
                                                onClick={handleChangeAddress}
                                                className="text-[#2D2C70] text-[16px] underline font-[400] hover:underline transition-colors self-start sm:self-center whitespace-nowrap"
                                            >
                                                Change address
                                            </button>
                                        </div>
                                    </div>
                                    {/* Update Button */}
                                    <div className="">
                                        <button
                                            onClick={handleUpdate}
                                            className="w-[200px] h-[42px] bg-[#2D2C70] text-white hover:bg-[#1a1945] py-1 rounded-2xl text-[20px] font-medium  "
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            }



                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}