"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpDown, CalendarDaysIcon, CalendarDays, Plus } from "lucide-react"
import ProfileInformation from "./ProfileInformation"
import Image from "next/image"
import RecentPurchases from "./RecentPurchases"

export default function MyAccount() {
  const [activeSection, setActiveSection] = useState("overview")
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [sidebarItems, setSidebarItems] = useState([
    { id: "overview", label: "OVERVIEW", isExpandable: false, image: '/icons/search-icon-1.png' },
    { id: "purchases", label: "PURCHASES", isExpandable: false, isExpanded: false, image: '/icons/cart-icon-2.png' },
    { id: "address", label: "ADDRESS BOOK", isExpandable: false, isExpanded: false, image: '/icons/home-icon-2.png' },
    { id: "payment", label: "PAYMENT METHOD", isExpandable: false, isExpanded: false, image: '/icons/wallet-icon-1.png' },
    {
      id: "settings",
      label: "SETTINGS",
      isExpandable: true,
      isExpanded: false,
      image: '/icons/setting-icon-1.png',
      childrens: [
        { id: "profile", label: "PROFILE INFORMATION", isExpandable: false },
        { id: "security", label: "CHANGE PASSWORD", isExpandable: false },
      ],
    },
  ])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  const handleUpdate = () => {
    console.log("Profile updated:", formData)
  }



  const toggleSidebarItem = (id) => {
    setSidebarItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    )
  }

  return (
    <div className="h-full  py-6 p-4 md:p-6 lg:px-8 font-spartan">
      <div className="max-w-8xl mx-auto">
        {/* Breadcrumb */}
        <div className="bg-white justify-items-center ">
          <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 ">
            <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
              <span>Home</span>
              <span className="mx-1 sm:mx-2">/</span>
              <span className="text-xs sm:text-sm lg:text-[1.2rem] text-black font-[400] font-spartan">
                My Account
              </span>
            </nav>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar */}
          <div className="lg:w-69 flex-shrink-0">
            <h1 className="text-[24px] font-bold mb-8">MY ACCOUNT</h1>
            <div className="bg-white rounded-lg ">
              {sidebarItems.map((item) => (
                <div key={item.id}>
                  <div className="border-b-2 b border-gray-200 ">
                    <button
                      onClick={() => {
                        if (item.id !== 'settings') {
                          setActiveSection(item.id)
                        }
                        if (item.isExpandable) {
                          toggleSidebarItem(item.id)
                        }
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center space-x-4  hover:bg-gray-50 transition-colors`}
                    >
                      <Image
                        src={item.image}
                        alt={item.label}
                        width={20.9}
                        height={21.24}
                        className="mr-2"
                      />
                      <div className="flex justify-between w-full ml-2">
                        <span
                          className={`${item.label === "OVERVIEW"
                            ? "text-[20px] font-[500] text-[#E9098D]"
                            : "text-[1rem] font-[500] text-[#000000]/50"
                            } ${activeSection === item.id ? "text-[#2D2C70]" : ""} ${item.id === 'payment' ? 'text-[#2D2C70]' : ''}`}
                        >
                          {item.label}
                        </span>
                        {item.isExpandable && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${item.isExpanded ? "rotate-180" : ""
                              }`}
                          />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Children items */}
                  {item.isExpanded && item.childrens && (
                    <div className="bg-gray-50 ">
                      {item.childrens.map((child) => (
                        <div key={child.id} className="border-b-2 border-gray-200  px-8">
                          <button
                            onClick={() => setActiveSection(child.id)}
                            className={`w-full px-8 py-2 text-left hover:bg-gray-100 transition-colors`}
                          >
                            <span
                              className={`text-[14px] font-[400] ${activeSection === child.id ? "text-[#2D2C70] font-[500]" : "text-[#000000]/70"
                                }`}
                            >
                              {child.label}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Show Purchases only if Purchases tab is active */}
            {activeSection === "purchases" && (
              <div className="xl:h-screen h-full">
                <div className="border-b-2 ml-8 border-black pb-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[24px] font-medium ">
                      Purchase History
                    </h2>

                  </div>

                  {/* Filter Controls */}
                  <div className=" gap-4 items-start sm:items-center pt-4 border-t-2 border-black ">
                    {/* Status Filter */}
                    <div className="flex items-center text-[1rem] font-[500] font-spartan inline-block border-2 rounded-lg  ">
                      <button className="px-4 py-1  w-1/2   rounded-l-lg text-sm font-medium`  ">
                        Open
                      </button>
                      <button className="px-4 w-1/2 py-1 bg-[#46BCF9] text-white rounded-r-lg  text-sm font-medium hover:bg-gray-300">
                        All
                      </button>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-end gap-10  justify-between mt-8">
                      {/* From */}
                      <div className="flex gap-10">
                        <div className="flex flex-col">
                          <label className="text-[1rem] font-medium mb-2 text-gray-900">From</label>
                          <div className="relative">
                            <input
                              type="date"
                              className="appearance-none border rounded-lg border-gray-300 px-3 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent bg-white w-48 text-gray-900 
                                        [&::-webkit-datetime-edit]:invisible
                                        [&::-webkit-calendar-picker-indicator]:opacity-0 
                                        [&::-webkit-calendar-picker-indicator]:absolute 
                                        [&::-webkit-calendar-picker-indicator]:w-full 
                                        [&::-webkit-calendar-picker-indicator]:h-full"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* To */}
                        <div className="flex flex-col">
                          <label className="text-[1rem] font-medium mb-2 text-gray-900">To</label>
                          <div className="relative">
                            <input
                              type="date"
                              className="appearance-none border rounded-lg border-gray-300 px-3 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent bg-white w-48 text-gray-900 
                                      [&::-webkit-datetime-edit]:invisible
                                      [&::-webkit-calendar-picker-indicator]:opacity-0 
                                      [&::-webkit-calendar-picker-indicator]:absolute 
                                      [&::-webkit-calendar-picker-indicator]:w-full 
                                      [&::-webkit-calendar-picker-indicator]:h-full"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="p-2 border rounded-lg">
                            <ArrowUpDown className="w-5 h-5 text-[#E9098D]" />
                          </div>
                          <div className="relative w-[156px]">
                            <select
                              className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-[14px] font-medium bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent"
                            >
                              <option>Sort by date</option>
                              <option>Sort by name</option>
                              <option>Sort by price</option>
                            </select>

                            {/* Custom arrow */}
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Purchase History Content */}
                <div className="text-center ">
                  <RecentPurchases />
                </div>
              </div>
            )}

            {/* Show Settings (default tab) → Recent Purchases + My Settings */}
            {activeSection === "overview" && (
              <>
                {/* Recent Purchases Section */}
                <div className="pb-12">
                  <div className="bg-white rounded-lg">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b-2 border-black pb-4">
                        <h2 className="text-[24px] font-medium mb-2 sm:mb-0">
                          Recent Purchases
                        </h2>
                        <div className="relative">
                          <button
                            onClick={() => setActiveSection("purchases")}
                            className="appearance-none bg-white px-3 hover:text-[#2D2C70] py-2 pr-8 text-[1rem] font-medium text-[#000000]/50 border-none cursor-pointer flex items-center"
                          >
                            View Purchase History
                            <ChevronDown className="ml-2 w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center py-4">
                        <RecentPurchases />
                      </div>
                    </div>
                  </div>

                  {/* My Settings Section */}
                  <div className="bg-white rounded-lg mt-12 pl-4 pb-16 ">
                    <div>
                      <h2 className="text-[24px] font-medium relative lg:bottom-3">
                        My Settings
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {/* Profile */}
                        <div className="flex flex-col space-y-[25px]">
                          <h3 className="font-[500] text-[20px] text-[#2D2C70]">Profile</h3>
                          <div className="relative flex flex-col border shadow-bottom shadow-sm p-6 rounded-lg h-full">
                            <div className="space-y-2 text-sm text-[400]">
                              <p>Devendra Chandora</p>
                              <p>devendra.chandora@gmail.com</p>
                              <p>(+91) 1234567890</p>
                            </div>
                            <button
                              className="absolute bottom-4 right-4 text-[#2D2C70] hover:text-[#E9098D] text-[14px] font-medium"
                              onClick={() => setActiveSection("address")}
                            >
                              edit
                            </button>
                          </div>
                        </div>

                        {/* Shipping */}
                        <div className="flex flex-col space-y-[25px]">
                          <h3 className="font-[500] text-[20px] text-[#2D2C70]">Shipping</h3>
                          <div className="relative flex flex-col border shadow-bottom shadow-sm p-6 rounded-lg h-full">
                            <div className="space-y-2 text-sm text-[14px] text-[500]">
                              <p className="font-[600]">LW Traders & Exim</p>
                              <p>Devendra Chandora</p>
                              <p>
                                2 Angove Rd Spencer Park, Western Australia 6330
                                Australia
                              </p>
                              <p>7073737773</p>
                            </div>
                            <button
                              onClick={() => setActiveSection("address")}
                              className="absolute bottom-4 right-4 text-[#2D2C70] hover:text-[#E9098D] text-[14px] font-medium">
                              edit
                            </button>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex flex-col space-y-[25px]">
                          <h3 className="font-[500] text-[20px] text-[#2D2C70]">Payment</h3>
                          <div className="relative flex  justify-between items-start border shadow-bottom shadow-sm p-6 rounded-lg h-full">
                            <div className="space-y-2 text-sm flex-col flex text-[14px] text-[500]">
                              <p className="font-[600]">
                                Ending in <span className="font-[400]">6844</span>
                              </p>
                              <p className="font-[600]">
                                Expires in <span className="font-[400]">12/22</span>
                              </p>
                              <p>2 Devendra Chandora</p>
                            </div>

                            <div className="mt-6">
                              <Image
                                src="/account-details/payment-images.png"
                                alt="Matador Wholesale Logo "
                                width={50}
                                height={50}
                                className="object-contain"
                              />
                            </div>
                            <button
                              onClick={() => setActiveSection("address")}
                              className="absolute bottom-4 right-4 text-[#2D2C70] hover:text-[#E9098D] text-[14px] font-medium">
                              edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}


            {/* Show Address Book tab */}
            {activeSection === "address" && (
              <div className="bg-white h-full xl:pb-30 rounded-lg  font-spartan px-8">
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h2 className="text-[24px] font-medium">Address Book</h2>
                </div>

                <div className="grid    grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Address Card 1 */}
                  <div className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                    <div className="space-y-2 text-sm">
                      <p className="font-[500] text-[14px]">LW Traders & Exim</p>
                      <p className="font-[500] text-[14px]">Devendra Chandora</p>
                      <p className="text-[14px] text-[500]">
                        2 Angove Rd<br />
                        Spencer Park Western Australia 6330<br />
                        Australia
                      </p>
                      <p className="text-[14px] text-[500]">7073737773</p>
                      <div className="text-[14px] text-[#2D2C70] font- mt-3 space-y-1 flex flex-col jsutify-between">
                        <p className="flex align-center items-center gap-2">
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D2C70" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          </span>
                          Default shipping address</p>

                        <p className="flex align-center items-center gap-2">
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D2C70" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          </span>
                          Default billing address
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                      <button className="text-[#2D2C70] font-medium hover:text-[#E9098D]">Edit</button>
                      <button className="text-[#46BCF9] font-medium hover:text-[#2D2C70]">Remove</button>
                    </div>
                  </div>

                  {/* Address Card 2 */}
                  <div className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                    <div className="space-y-2 text-sm">
                      <p className="font-[600] text-[14px]">LW Traders & Exim</p>
                      <p className="font-[500] text-[14px]">Devendra Chandora</p>
                      <p className="text-[14px] text-[500]">
                        2 Angove Rd<br />
                        Spencer Park Western Australia 6330<br />
                        Australia
                      </p>
                      <p className="text-[14px] text-[500]">7073737773</p>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2  text-[14px]">
                      <button className="text-[#2D2C70] font-medium hover:text-[#E9098D]">Edit</button>
                      <button className="text-[#60A5FA] font-medium hover:text-[#2D2C70]">Remove</button>
                    </div>
                  </div>

                  {/* Add New Address Card */}
                  <div className="border shadow-md border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="w-8 h-8   flex items-center justify-center ">
                      <span className="text-[#000000]/50 text-xl font-light ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                      </span>
                    </div>
                    <p className="text-[14px] font-medium ">Add New Address</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "payment" && (
              <div className="bg-white rounded-lg xl:pb-30 font-spartan xl:px-8">
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h2 className="text-[24px] font-medium">Payment Methods</h2>
                </div>

                <div className="grid  grid-cols-1 md:grid-cols-2  xl:grid-cols-4  gap-6">
                  {/*  Card 1 */}
                  <div className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                    <div className="space-y-2 text-sm">
                      <p className="font-[600]">
                        Ending in <span className="font-[400]">6844</span>
                      </p>
                      <div className="flex justify-between align-center">
                        <p className="font-[600]">
                          Expires in <span className="font-[400]">12/22</span>
                        </p>
                        <Image src="/account-details/payment-images.png" alt="mastercard" width={50} height={50} />
                      </div>
                      <p>2 Devendra Chandora</p>
                      <p className="text-[14px] font-[400] text-[#2D2C70]"> Default credit card</p>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                      <button className="text-[#2D2C70] font-medium hover:text-[#E9098D]">Edit</button>
                      <button className="text-[#46BCF9] font-medium hover:text-[#2D2C70]">Remove</button>
                    </div>
                  </div>


                  {/* Add New  Card */}
                  <div className="border shadow-md border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="w-8 h-8   flex items-center justify-center ">
                      <span className="text-[#000000]/50 text-xl font-light ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                      </span>
                    </div>
                    <p className="text-[14px] font-medium ">Add New Card</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <>
                <ProfileInformation setActiveSection={setActiveSection} />
              </>
            )}


            {activeSection === 'security' && (
              <div className="px-8 h-screen">
                <div className="border-b-2 border-black pb-4 mb-8 ">
                  <h1 className="text-[24px]  font-medium text-black">
                    Update Your Password
                  </h1>
                </div>
                <div className="mb-4">
                  <span className="text-[14px] font-[400]">Required </span>
                  <span className="text-[#E9098D] text-[16px] font-bold">*</span>
                </div>
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
                    className="w-[200px] h-[42px] bg-[#2D2C70] text-white hover:bg-[#46BCF9] py-1 rounded-2xl text-[20px] font-medium  "
                  >
                    Update
                  </button>
                </div>

              </div>
            )
            }

          </div>
        </div>
      </div>
    </div>
  )
}
