"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactUs() {
    const [formData, setFormData] = useState({
        fullName: "",
        company: "",
        email: "",
        phoneNumber: "",
        address: "",
        message: "",
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // Handle form submission here
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 font-spartan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Left Column - Contact Information */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-[2rem] font-semibold  mb-4">Contact Us</h1>
                        <p className="text-[#000000]/50 text-sm font-[400] md:text-base leading-tight">
                            We love connecting with our customers! Whether you have a question about our products, need some support,
                            or just want to share your feedback, drop us a line. We'll do our best to get back to you quickly.
                        </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4 text-base font-[400]">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 text-sm md:text-base">sales@pointaustralia.com.au</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 text-sm md:text-base">25 Jade Drive, Molendinar QLD 4214</span>
                        </div>

                        {/* <div className="space-y-2"> */}
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 " />
                            <span className="text-gray-900 text-sm md:text-base">Matador Wholesale - (07) 5564 9929</span>
                        </div>

                        <div className="flex items-center gap-3 text-[#46BCF9]">
                            <Phone className="w-4 h-4 " />
                            <span className=" text-sm md:text-base">Axra Aromas - (07) 5678 2010</span>
                        </div>

                        <div className="flex items-center gap-3 text-[#E9098D] ">
                            <Phone className="w-4 h-4" />
                            <span className="  text-sm md:text-base">Point Accessories - (07) 5527 8716</span>
                        </div>
                        {/* </div> */}
                    </div>

                    {/* Map */}
                    <div className="w-full h-48 md:w-[465px] md:h-[281px] bg-gray-200 rounded-lg overflow-hidden">
                        <img
                            src="/map-showing-location-in-molendinar-qld-australia.jpg"
                            alt="Map showing location at 25 Jade Drive, Molendinar QLD 4214"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-[1.8rem]  font-medium ">We'd love to hear from you!</h2>
                        <p className="text-[#E9098D] text-[1.8rem]  font-medium ">Let's get in touch</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="block text-base font-[400]  mb-1">
                                    Full Name<span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="company" className="blocktext-base font-[400] mb-1">
                                    Company<span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="company"
                                    name="company"
                                    type="text"
                                    required
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-base font-[400] mb-1">
                                    Email<span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-base font-[400] mb-1">
                                    Phone Number<span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-base font-[400] mb-1">
                                Address<span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                required
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-base font-[400] mb-1">
                                Your Message<span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="message"
                                name="message"
                                required
                                rows={4}
                                placeholder="Type your message here"
                                value={formData.message}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-200 placeholder:text-[15px] focus:border-blue-500 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#74C7F0] text-white text-[1rem] font-[500] py-3 px-6 rounded-lg transition-colors"
                        >
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
