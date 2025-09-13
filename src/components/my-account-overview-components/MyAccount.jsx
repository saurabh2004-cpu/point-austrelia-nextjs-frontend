"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"



export default function MyAccount() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarItems, setSidebarItems] = useState([
    { id: "overview", label: "OVERVIEW", isExpandable: false },
    { id: "purchases", label: "PURCHASES", isExpandable: true, isExpanded: false },
    { id: "address", label: "ADDRESS BOOK", isExpandable: true, isExpanded: false },
    { id: "payment", label: "PAYMENT METHOD", isExpandable: true, isExpanded: false },
    { id: "settings", label: "SETTINGS", isExpandable: true, isExpanded: false },
  ])

  const toggleSidebarItem = (id) => {
    setSidebarItems((items) => items.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item)))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">My Account</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">MY ACCOUNT</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
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
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      activeSection === item.id ? "bg-pink-50 text-[#E9098D] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                    {item.isExpandable && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${item.isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Recent Purchases Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Recent Purchases</h2>
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E9098D] focus:border-transparent">
                      <option>View Purchase History</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="text-center py-8">
                  <p className="text-[#E9098D] font-medium">You don't have any purchase in your account</p>
                </div>
              </div>
            </div>

            {/* My Settings Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Profile */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Profile</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900">Devendra Chandora</p>
                      <p className="text-gray-600">devendra.chandora@gmail.com</p>
                      <p className="text-gray-600">(+91) 1234567890</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">edit</button>
                  </div>

                  {/* Shipping */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Shipping</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900">LW Traders & Exim</p>
                      <p className="text-gray-600">Devendra Chandora</p>
                      <p className="text-gray-600">2 Amicus Rd,</p>
                      <p className="text-gray-600">Spencer Park Western Australia 6330</p>
                      <p className="text-gray-600">Australia</p>
                      <p className="text-gray-600">7073737773</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">edit</button>
                  </div>

                  {/* Payment */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Payment</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">Ending in 6844</span>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-400 rounded flex items-center justify-center">
                          <div className="w-6 h-4 bg-gradient-to-r from-red-600 to-yellow-400 rounded-sm flex items-center justify-center">
                            <div className="w-4 h-3 bg-white rounded-xs flex items-center justify-center">
                              <div className="w-2 h-1 bg-red-500 rounded-full"></div>
                              <div className="w-2 h-1 bg-orange-400 rounded-full ml-0.5"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">Expires in 12/22</p>
                      <p className="text-gray-600">Devendra Chandora</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">edit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
