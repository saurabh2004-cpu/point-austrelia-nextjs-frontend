import axiosInstance from "@/axios/axiosInstance";
import useUserStore from "@/zustand/user";
import { useEffect, useState } from "react"

export default function ProfileInformation({ setActiveSection }) {
    const currentUser = useUserStore((state) => state.user);
    const [formData, setFormData] = useState({
        companyName: "",
        phoneNumber: "",
    })
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
    }

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`user/update-contact-phone-and-store-name`, {
                storeName: formData.companyName,
                contactPhone: formData.phoneNumber,
            });


            if (response.data.statusCode === 200) {
                setUser(response.data.data);
            }
            else {
                console.error("Failed to update profile information:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating profile information:", error);

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
                                                {currentUser.customerEmail}
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
                                        className="w-[200px] h-[42px] bg-[#2D2C70] text-white hover:bg-[#46BCF9] py-1 rounded-2xl text-[20px] font-medium  "
                                    >
                                        Update
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