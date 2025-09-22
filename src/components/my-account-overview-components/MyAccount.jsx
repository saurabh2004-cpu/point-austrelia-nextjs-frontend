"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpDown } from "lucide-react"
import ProfileInformation from "./ProfileInformation"
import Image from "next/image"
import RecentPurchases from "./RecentPurchases"

export default function MyAccount() {
  const [activeSection, setActiveSection] = useState("settings")
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [sidebarItems, setSidebarItems] = useState([
    { id: "overview", label: "OVERVIEW", isExpandable: false },
    { id: "purchases", label: "PURCHASES", isExpandable: true, isExpanded: false },
    { id: "address", label: "ADDRESS BOOK", isExpandable: true, isExpanded: false },
    { id: "payment", label: "PAYMENT METHOD", isExpandable: true, isExpanded: false },
    { id: "settings", label: "SETTINGS", isExpandable: true, isExpanded: false },
  ])

  const toggleSidebarItem = (id) => {
    setSidebarItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    )
  }

  const handleViewPurchaseHistory = () => {
    setShowPurchaseHistory(!showPurchaseHistory)
  }

  return (
    <div className="h-full  py-6 p-4 md:p-6 lg:p-8 font-spartan">
      <div className="max-w-8xl mx-auto">
        {/* Breadcrumb */}
        <div className="bg-white justify-items-center pt-4">
          <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
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
        <h1 className="text-[24px] font-bold mb-8">MY ACCOUNT</h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar */}
          <div className="lg:w-69 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {sidebarItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => {
                      setActiveSection(item.id)
                      if (item.isExpandable) {
                        toggleSidebarItem(item.id)
                      }
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors`}
                  >
                    <span
                      className={`${item.label === "OVERVIEW"
                        ? "text-[20px] font-[500] text-[#E9098D]"
                        : "text-[1rem] font-[500] text-[#000000]/50"
                        } ${activeSection === item.id ? "text-[#2D2C70]" : ""}`}
                    >
                      {item.label}
                    </span>
                    {item.isExpandable && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${item.isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Show Purchases only if Purchases tab is active */}
            {activeSection === "purchases" && (
              <>
                <div className="border-b-2 border-black pb-13 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[24px] font-medium ">
                      Purchase History
                    </h2>

                  </div>

                  {/* Filter Controls */}
                  <div className=" gap-4 items-start sm:items-center py-4 border-t-2 border-black">
                    {/* Status Filter */}
                    <div className="flex items-center text-[1rem] font-[500] font-spartan">
                      <button className="px-4 py-2 bg-[#2D2C70] text-white rounded-l-lg text-sm font-medium">
                        Open
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-black rounded-r-lg text-sm font-medium hover:bg-gray-300">
                        All
                      </button>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-18 px-8">
                      <div className="flex flex-col mt-10">
                        <label className="text-[1rem] font-medium mb-1">
                          From
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className="border rounded-lg border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col mt-10">
                        <label className="text-[1rem] font-medium mb-1">
                          To
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div className="flex items-center gap-2 ml-auto mt-10 rounded-lg">
                        <div className="p-2 border rounded-lg">
                          <ArrowUpDown className="w-4 h-4 text-[#E9098D]" />
                        </div>
                        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent">
                          <option>Sort by date</option>
                          <option>Sort by amount</option>
                          <option>Sort by status</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase History Content */}
                <div className="text-center py-6">
                 <RecentPurchases />
                </div>
              </>
            )}

            {/* Show Settings (default tab) → Recent Purchases + My Settings */}
            {activeSection === "settings" && (
              <>
                {/* Recent Purchases Section */}
                {showEditForm ?
                  <>
                    <ProfileInformation setShowForm={setShowEditForm} />
                  </>
                  :
                  <div>
                    <div className="bg-white rounded-lg">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b-2 border-black pb-4">
                          <h2 className="text-[24px] font-medium mb-2 sm:mb-0">
                            Recent Purchases
                          </h2>
                          <div className="relative">
                            <button
                              onClick={() => setActiveSection("purchases")}
                              className="appearance-none bg-white px-3 py-2 pr-8 text-[1rem] font-medium text-[#000000]/50 border-none cursor-pointer flex items-center"
                            >
                              View Purchase History
                              <ChevronDown className="ml-2 w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-center py-8">
                          <RecentPurchases />
                        </div>
                      </div>
                    </div>

                    {/* My Settings Section */}
                    <div className="bg-white rounded-lg mt-8">
                      <div>
                        <h2 className="text-[24px] font-medium relative lg:bottom-6">
                          My Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                          {/* Profile */}
                          <div className="flex flex-col">
                            <h3 className="font-[500] text-[20px] text-[#2D2C70]">Profile</h3>
                            <div className="relative flex flex-col border shadow-bottom shadow-sm p-6 rounded-lg h-full">
                              <div className="space-y-2 text-sm text-[400]">
                                <p>Devendra Chandora</p>
                                <p>devendra.chandora@gmail.com</p>
                                <p>(+91) 1234567890</p>
                              </div>
                              <button
                                className="absolute bottom-4 right-4 text-[#2D2C70] text-[14px] font-medium"
                                onClick={() => setShowEditForm(true)}>
                                edit
                              </button>
                            </div>
                          </div>

                          {/* Shipping */}
                          <div className="flex flex-col">
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
                              <button className="absolute bottom-4 right-4 text-[#2D2C70] text-[14px] font-medium">
                                edit
                              </button>
                            </div>
                          </div>

                          {/* Payment */}
                          <div className="flex flex-col">
                            <h3 className="font-[500] text-[20px] text-[#2D2C70]">Payment</h3>
                            <div className="relative flex flex-col border shadow-bottom shadow-sm p-6 rounded-lg h-full">
                              <div className="space-y-2 text-sm text-[14px] text-[500]">
                                <p className="font-[600]">
                                  Ending in <span className="font-[400]">6844</span>
                                </p>
                                <p className="font-[600]">
                                  Expires in <span className="font-[400]">12/22</span>
                                </p>
                                <p>2 Devendra Chandora</p>
                              </div>
                              <button className="absolute bottom-4 right-4 text-[#2D2C70] text-[14px] font-medium">
                                edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </>
            )}


            {/* Show Address Book tab */}
            {activeSection === "address" && (
              <div className="bg-white rounded-lg  font-spartan">
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h2 className="text-[24px] font-medium">Address Book</h2>
                </div>

                <div className="grid    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="text-[14px] text-[#2D2C70] mt-3 space-y-1">
                        <p>Default shipping address</p>
                        <p>Default billing address</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                      <button className="text-[#2D2C70] font-medium">Edit</button>
                      <button className="text-[#46BCF9] font-medium">Remove</button>
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
                      <button className="text-[#2D2C70] font-medium">Edit</button>
                      <button className="text-[#60A5FA] font-medium">Remove</button>
                    </div>
                  </div>

                  {/* Add New Address Card */}
                  <div className="border shadow-md border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center mb-3">
                      <span className="text-gray-400 text-xl font-light mt-1">+</span>
                    </div>
                    <p className="text-[14px] font-medium ">Add New Address</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "payment" && (
              <div className="bg-white rounded-lg  font-spartan ">
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h2 className="text-[24px] font-medium">Payment Methods</h2>
                </div>

                <div className="grid    grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6">
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
                      <button className="text-[#2D2C70] font-medium">Edit</button>
                      <button className="text-[#46BCF9] font-medium">Remove</button>
                    </div>
                  </div>


                  {/* Add New  Card */}
                  <div className="border shadow-md border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center mb-3">
                      <span className="text-[#000000]/50 text-xl font-light mt-1">+</span>
                    </div>
                    <p className="text-[14px] font-medium text-[#000000]/50">Add New Card</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
