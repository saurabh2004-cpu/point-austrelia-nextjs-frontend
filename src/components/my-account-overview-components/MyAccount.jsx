"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ArrowUpDown, CalendarDaysIcon, CalendarDays, Plus, X, Key, KeyIcon, MapIcon, LockIcon, Info, InfoIcon } from "lucide-react"
import ProfileInformation from "./ProfileInformation"
import Image from "next/image"
import RecentPurchases from "./RecentPurchases"
import useUserStore from "@/zustand/user"
import axiosInstance from "@/axios/axiosInstance"
import { set } from "nprogress"

// Address Popup Component
const AddressPopup = ({
  isOpen,
  onClose,
  onSubmit,
  addressData = null,
  mode = 'add',
  addressType = null
}) => {
  // Initialize form data based on address type and mode
  const [formData, setFormData] = useState({
    addressOne: '',
    addressTwo: '',
    addressThree: '',
    city: '',
    state: '',
    zip: ''
  })

  const [addToBoth, setAddToBoth] = useState(true)

  // Use useEffect to update form data when addressData or mode changes
  useEffect(() => {
    if (mode === 'edit' && addressData && addressType) {
      // For edit mode, use the specific address type fields
      if (addressType === 'shipping') {
        setFormData({
          addressOne: addressData.shippingAddressOne || '',
          addressTwo: addressData.shippingAddressTwo || '',
          addressThree: addressData.shippingAddressThree || '',
          city: addressData.shippingCity || '',
          state: addressData.shippingState || '',
          zip: addressData.shippingZip || ''
        })
      } else if (addressType === 'billing') {
        setFormData({
          addressOne: addressData.billingAddressOne || '',
          addressTwo: addressData.billingAddressTwo || '',
          addressThree: addressData.billingAddressThree || '',
          city: addressData.billingCity || '',
          state: addressData.billingState || '',
          zip: addressData.billingZip || ''
        })
      }
    } else {
      // For add mode, reset the form
      setFormData({
        addressOne: '',
        addressTwo: '',
        addressThree: '',
        city: '',
        state: '',
        zip: ''
      })
    }
  }, [isOpen, addressData, mode, addressType]) // Re-run when these props change

  const handleSubmit = (e) => {
    e.preventDefault()

    const shippingAddress = {
      shippingAddressOne: formData.addressOne,
      shippingAddressTwo: formData.addressTwo,
      shippingAddressThree: formData.addressThree,
      shippingCity: formData.city,
      shippingState: formData.state,
      shippingZip: formData.zip
    }

    const billingAddress = {
      billingAddressOne: formData.addressOne,
      billingAddressTwo: formData.addressTwo,
      billingAddressThree: formData.addressThree,
      billingCity: formData.city,
      billingState: formData.state,
      billingZip: formData.zip
    }

    // For edit mode, only update the specific address type
    if (mode === 'edit') {
      if (addressType === 'shipping') {
        onSubmit({ shippingAddress })
      } else if (addressType === 'billing') {
        onSubmit({ billingAddress })
      }
    } else {
      // For add mode, use the addToBoth logic
      onSubmit({
        shippingAddress: addToBoth ? shippingAddress : shippingAddress,
        billingAddress: addToBoth ? billingAddress : undefined
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'Add New' : 'Edit'} Address
            {mode === 'edit' && addressType && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({addressType === 'shipping' ? 'Shipping' : 'Billing'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="addressOne"
              value={formData.addressOne}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressTwo"
              value={formData.addressTwo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 3
            </label>
            <input
              type="text"
              name="addressThree"
              value={formData.addressThree}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2C70]"
            />
          </div>

          {mode === 'add' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addToBoth"
                checked={addToBoth}
                onChange={(e) => setAddToBoth(e.target.checked)}
                className="w-4 h-4 text-[#2D2C70] border-gray-300 rounded focus:ring-[#2D2C70]"
              />
              <label htmlFor="addToBoth" className="text-sm text-gray-700">
                Add to both shipping and billing addresses
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#2D2C70] text-white rounded-md hover:bg-[#25245a]"
            >
              {mode === 'add' ? 'Add Address' : 'Update Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Confirm Delete Popup Component
const ConfirmDeletePopup = ({
  isOpen,
  onClose,
  onConfirm,
  addressType
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove this {addressType} address? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyAccount() {
  const currentUser = useUserStore((state) => state.user);
  const [error, setError] = useState('');
  const [sucessMessage, setSuccessMessage] = useState('');
  const setUser = useUserStore((state) => state.setUser);


  const fetchCurentUser = async () => {
    try {
      const response = await axiosInstance.get('user/get-current-user');

      if (response.data.statusCode === 200) {
        setUser(response.data.data);
      }

    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchCurentUser();
  }, []);

  console.log("currentUser:", currentUser);
  const [activeSection, setActiveSection] = useState("overview")
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [sortBy, setSortBy] = useState('date-desc') // Default sort by date descending

  // Address management states
  const [popupState, setPopupState] = useState({
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    addressData: null,
    addressId: null,
    addressType: null // 'shipping' or 'billing'
  })

  const [deletePopupState, setDeletePopupState] = useState({
    isOpen: false,
    addressId: null,
    addressType: null
  })

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
        { id: "profile", label: "PROFILE INFORMATION", isExpandable: false, icon: <InfoIcon className="h-5 w-5" /> },
        { id: "security", label: "CHANGE PASSWORD", isExpandable: false, icon: <LockIcon className="h-5 w-5" /> },
      ],
    },
  ])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  const [timeLapse, setTimeLapse] = useState({
    from: '',
    to: '',
  })

  const changePassword = async () => {
    try {
      const response = await axiosInstance.post('user/change-password', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.statusCode === 200) {
        console.log("Password changed successfully")
        setError('')
        setSuccessMessage(response.data.message)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
        })
      }
      else {
        console.error("Failed to change password:", response.data.message)
        setError(response.data.message)
      }
    } catch (error) {
      console.error("Error changing password:", error)

    }
  }

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

  // Address management functions
  const openAddAddressPopup = () => {
    setPopupState({
      isOpen: true,
      mode: 'add',
      addressData: null,
      addressId: null,
      addressType: null
    })
  }

  const openEditAddressPopup = (address, addressId, addressType) => {
    setPopupState({
      isOpen: true,
      mode: 'edit',
      addressData: address,
      addressId: addressId,
      addressType: addressType
    })
  }

  const openDeleteConfirmPopup = (addressId, addressType) => {
    setDeletePopupState({
      isOpen: true,
      addressId: addressId,
      addressType: addressType
    })
  }

  const closePopup = () => {
    setPopupState(prev => ({ ...prev, isOpen: false }))
  }

  const closeDeletePopup = () => {
    setDeletePopupState(prev => ({ ...prev, isOpen: false }))
  }

  const handleAddNewAddress = async (addressData) => {
    try {
      const requests = []

      // Add to shipping addresses
      if (addressData.shippingAddress) {
        requests.push(
          axiosInstance.post(`admin/add-shipping-address/${currentUser._id}`, addressData.shippingAddress)
        )
      }

      // Add to billing addresses
      if (addressData.billingAddress) {
        requests.push(
          axiosInstance.post(`admin/add-billing-address/${currentUser._id}`, addressData.billingAddress)
        )
      }

      const responses = await Promise.all(requests)
      const allSuccess = responses.every(res => res.data.statusCode === 200)

      if (allSuccess) {
        console.log('Address(es) added successfully')
        // Update user data in store
        const userResponse = await axiosInstance.get(`user/get-current-user`)
        if (userResponse.data.statusCode === 200) {
          setUser(userResponse.data.data)
        }
        closePopup()
      } else {
        console.error('Failed to add address(es)')
      }
    } catch (error) {
      console.error('Error adding new address:', error)
    }
  }

  const handleEditAddress = async (addressData) => {
    try {
      let response

      if (popupState.addressType === 'shipping') {
        response = await axiosInstance.put(
          `admin/update-shipping-address/${currentUser._id}/${popupState.addressId}`,
          addressData.shippingAddress
        )
      } else {
        response = await axiosInstance.put(
          `admin/update-billing-address/${currentUser._id}/${popupState.addressId}`,
          addressData.billingAddress
        )
      }

      if (response.data.statusCode === 200) {
        console.log('Address updated successfully')
        // Update user data in store
        const userResponse = await axiosInstance.get(`user/get-current-user`)
        if (userResponse.data.statusCode === 200) {
          setUser(userResponse.data.data)
        }
        closePopup()
      } else {
        console.error('Failed to update address')
      }
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  const handleRemoveAddress = async () => {
    try {
      let response

      if (deletePopupState.addressType === 'shipping') {
        response = await axiosInstance.delete(
          `admin/remove-shipping-address/${currentUser._id}/${deletePopupState.addressId}`
        )
      } else {
        response = await axiosInstance.delete(
          `admin/remove-billing-address/${currentUser._id}/${deletePopupState.addressId}`
        )
      }

      if (response.data.statusCode === 200) {
        console.log('Address removed successfully')
        // Update user data in store
        const userResponse = await axiosInstance.get(`user/get-current-user`)
        if (userResponse.data.statusCode === 200) {
          setUser(userResponse.data.data)
        }
        closeDeletePopup()
      } else {
        console.error('Failed to remove address')
      }
    } catch (error) {
      console.error('Error removing address:', error)
    }
  }

  const handlePopupSubmit = (addressData) => {
    if (popupState.mode === 'add') {
      handleAddNewAddress(addressData)
    } else {
      handleEditAddress(addressData)
    }
  }



  return (
    <div className="h-full py-6 p-4 md:p-6 lg:px-8 font-spartan">
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
                            className={`w-full flex items-center px-2 space-x-4 py-2 text-left hover:bg-gray-100 transition-colors`}
                          >
                            <span>
                              {child.icon}
                            </span>
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
            {/* Show Address Book tab */}
            {activeSection === "address" && (
              <div className="bg-white h-full xl:pb-30 rounded-lg font-spartan px-8">
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h2 className="text-[24px] font-medium">Address Book</h2>
                </div>

                {/* Shipping Addresses Section */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[20px] font-semibold text-[#2D2C70]">Shipping Addresses</h3>
                    <span className="text-[14px] text-gray-500">
                      {currentUser?.shippingAddresses?.length || 0} address(es)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Shipping Address Cards */}
                    {currentUser?.shippingAddresses?.map((address, index) => (
                      <div key={`shipping-${address._id || index}`} className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 mb-2">


                          </div>
                          <p className="font-[500] text-[14px]">{currentUser.storeName}</p>
                          <p className="font-[500] text-[14px]">{currentUser.contactName}</p>
                          <p className="text-[14px] text-[500]">
                            {address.shippingAddressOne}<br />
                            {address.shippingAddressTwo && <>{address.shippingAddressTwo}<br /></>}
                            {address.shippingAddressThree && <>{address.shippingAddressThree}<br /></>}
                            {address.shippingCity} {address.shippingState} {address.shippingZip}<br />
                            {currentUser.country}
                          </p>
                          <p className="text-[14px] text-[500]">{currentUser.CustomerPhoneNo}</p>
                          {index === 0 && (
                            <span className="flex items-center   ">
                              <p className="flex align-center items-center gap-2">
                                <span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D2C70" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </span>
                                Default Shipping address
                              </p>
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                          <button
                            onClick={() => openEditAddressPopup(address, address._id, 'shipping')}
                            className="text-[#2D2C70] font-medium hover:text-[#E9098D]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => openDeleteConfirmPopup(address._id, 'shipping')}
                            className="text-[#46BCF9] font-medium hover:text-[#2D2C70]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add New Shipping Address Card */}
                    <div
                      onClick={() => openAddAddressPopup('shipping')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                        <Plus className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-[16px] font-medium text-gray-700">Add Shipping Address</p>
                      <p className="text-[12px] text-gray-500 mt-1 text-center">Add a new shipping destination</p>
                    </div>
                  </div>
                </div>

                {/* Billing Addresses Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[20px] font-semibold text-[#2D2C70]">Billing Addresses</h3>
                    <span className="text-[14px] text-gray-500">
                      {currentUser?.billingAddresses?.length || 0} address(es)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Billing Address Cards */}
                    {currentUser?.billingAddresses?.map((address, index) => (
                      <div key={`billing-${address._id || index}`} className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 mb-2">


                          </div>
                          <p className="font-[600] text-[14px]">{currentUser.storeName}</p>
                          <p className="font-[500] text-[14px]">{currentUser.contactName}</p>
                          <p className="text-[14px] text-[500]">
                            {address.billingAddressOne}<br />
                            {address.billingAddressTwo && <>{address.billingAddressTwo}<br /></>}
                            {address.billingAddressThree && <>{address.billingAddressThree}<br /></>}
                            {address.billingCity} {address.billingState} {address.billingZip}<br />
                            {currentUser.country}
                          </p>
                          <p className="text-[14px] text-[500]">{currentUser.CustomerPhoneNo}</p>
                          {index === 0 && (
                            <span className="flex items-center   ">
                              <p className="flex align-center items-center gap-2">
                                <span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D2C70" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </span>
                                Default Billing address
                              </p>
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                          <button
                            onClick={() => openEditAddressPopup(address, address._id, 'billing')}
                            className="text-[#2D2C70] font-medium hover:text-[#E9098D]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteConfirmPopup(address._id, 'billing')}
                            className="text-[#60A5FA] font-medium hover:text-[#2D2C70]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add New Billing Address Card */}
                    <div
                      onClick={() => openAddAddressPopup('billing')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                        <Plus className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-[16px] font-medium text-gray-700">Add Billing Address</p>
                      <p className="text-[12px] text-gray-500 mt-1 text-center">Add a new billing address</p>
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* Show Purchases only if Purchases tab is active */}
            {activeSection === "purchases" && (
              <div className="xl:h-full h-full">
                <div className="border-b-2 ml-8 border-black pb-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[24px] font-medium ">
                      All Purchase History
                    </h2>

                    <button className="p-2 text-[17px] font-medium bg-[#2D2C70] text-white rounded-xl">
                      Reorder Items
                    </button>

                  </div>

                  {/* Filter Controls */}
                  <div className=" gap-4 items-start sm:items-center pt-4 border-t-2 border-black ">
                    {/* Status Filter */}
                    {/* <div className="flex items-center text-[1rem] font-[500] font-spartan inline-block border-2 rounded-lg  ">
                      <button className="px-4 py-1  w-1/2   rounded-l-lg text-sm font-medium`  ">
                        Open
                      </button>
                      <button className="px-4 w-1/2 py-1 bg-[#46BCF9] text-white rounded-r-lg  text-sm font-medium hover:bg-gray-300">
                        All
                      </button>
                    </div> */}

                    {/* Date Range */}
                    <div className="flex items-end gap-10  justify-between mt-2">
                      {/* From */}
                      <div className="flex gap-10">
                        <div className="flex flex-col">
                          <label className="text-[1rem] font-medium mb-2 text-gray-900">From</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={timeLapse.from}
                              onChange={(e) => setTimeLapse({ ...timeLapse, from: e.target.value })}
                              className="appearance-none border rounded-lg border-gray-300 px-3 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent bg-white w-48 text-gray-900 
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
                              value={timeLapse.to}
                              onChange={(e) => setTimeLapse({ ...timeLapse, to: e.target.value })}
                              className="appearance-none border rounded-lg border-gray-300 px-3 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2C70] focus:border-transparent bg-white w-48 text-gray-900 
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
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                            >
                              <option value="date-desc">Newest First</option>
                              <option value="date-asc">Oldest First</option>
                              <option value="name-asc">Name A-Z</option>
                              <option value="name-desc">Name Z-A</option>
                              <option value="price-asc">Price Low-High</option>
                              <option value="price-desc">Price High-Low</option>
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
                  <RecentPurchases timeLapse={timeLapse} sortBy={sortBy} />
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
                        <RecentPurchases sortBy={sortBy} />
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
                              <p>{currentUser?.customerName}</p>
                              <p>{currentUser?.contactEmail}</p>
                              <p>{currentUser?.CustomerPhoneNo}</p>
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
                              <p className="font-[600]">{currentUser?.storeName}</p>
                              <p>{currentUser?.customerName}</p>
                              <p>
                                {currentUser?.shippingAddresses[0]?.shippingAddressOne},{" "} {currentUser?.shippingAddresses[0]?.shippingAddressTwo},{" "}
                                {currentUser?.shippingAddresses[0]?.shippingAddressThree} , {currentUser?.shippingAddresses[0]?.shippingCity} , {currentUser?.shippingAddresses[0]?.shippingState} - {currentUser?.shippingAddresses[0]?.shippingZip}
                              </p>
                              <p>{currentUser?.country}
                              </p>
                              <p>{currentUser?.contactPhone}</p>
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

                  {error && <p className="text-red-500">{error}</p>}
                  {sucessMessage && <p className="text-green-500">{sucessMessage}</p>}
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
                    onClick={changePassword}
                    className="w-[200px] border border-black bg-[#2D2C70] text-white hover:bg-[#2D2C70]/95 py-1 rounded-2xl text-[20px] font-medium  "
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

      {/* Address Popup */}
      <AddressPopup
        isOpen={popupState.isOpen}
        onClose={closePopup}
        onSubmit={handlePopupSubmit}
        addressData={popupState.addressData}
        mode={popupState.mode}
        addressType={popupState.addressType}
      />

      {/* Confirm Delete Popup */}
      <ConfirmDeletePopup
        isOpen={deletePopupState.isOpen}
        onClose={closeDeletePopup}
        onConfirm={handleRemoveAddress}
        addressType={deletePopupState.addressType}
      />
    </div>
  )
}