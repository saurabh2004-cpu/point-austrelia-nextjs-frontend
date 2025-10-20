'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, Check, Plus, X } from 'lucide-react';
import Image from 'next/image';
import CheckoutFormUI from '@/components/checkout-components/CheckOutInformation';
import Review from '@/components/checkout-components/Review';
import { useRouter } from 'next/navigation';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import useCartStore from '@/zustand/cartPopup';

// Address Popup Component
const AddressPopup = ({
    isOpen,
    onClose,
    onSubmit,
    type,
    addressData = null,
    mode = 'add'
}) => {
    const [formData, setFormData] = useState({
        addressOne: '',
        addressTwo: '',
        addressThree: '',
        city: '',
        state: '',
        zip: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && addressData) {
                const prefix = type === 'shipping' ? 'shipping' : 'billing';
                setFormData({
                    addressOne: addressData[`${prefix}AddressOne`] || '',
                    addressTwo: addressData[`${prefix}AddressTwo`] || '',
                    addressThree: addressData[`${prefix}AddressThree`] || '',
                    city: addressData[`${prefix}City`] || '',
                    state: addressData[`${prefix}State`] || '',
                    zip: addressData[`${prefix}Zip`] || ''
                });
            } else {
                setFormData({
                    addressOne: '',
                    addressTwo: '',
                    addressThree: '',
                    city: '',
                    state: '',
                    zip: ''
                });
            }
        }
    }, [isOpen, addressData, mode, type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedData = type === 'shipping' ? {
            shippingAddressOne: formData.addressOne,
            shippingAddressTwo: formData.addressTwo,
            shippingAddressThree: formData.addressThree,
            shippingCity: formData.city,
            shippingState: formData.state,
            shippingZip: formData.zip
        } : {
            billingAddressOne: formData.addressOne,
            billingAddressTwo: formData.addressTwo,
            billingAddressThree: formData.addressThree,
            billingCity: formData.city,
            billingState: formData.state,
            billingZip: formData.zip
        };

        onSubmit(formattedData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000]/20  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-400 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {mode === 'add' ? 'Add New' : 'Edit'} {type === 'shipping' ? 'Shipping' : 'Billing'} Address
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 ">
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
    );
};

const CheckoutComponent = () => {
    const [step, setStep] = useState(1);
    const currentUser = useUserStore((state) => state.user);
    const [popupState, setPopupState] = useState({
        isOpen: false,
        type: 'shipping',
        mode: 'add',
        addressData: null,
        addressId: null
    });


    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedPacks, setSelectedPacks] = useState({});
    const [selectedShippingAddress, setSelectedShippingAddress] = useState(0);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState(0);
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const [latestSalesOrderDocumentNumber, setLatestSalesOrderDocumentNumber] = React.useState('');
    const [documentNumber, setDocumentNumber] = React.useState('');
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const [loadingCheckOut, setLoadingCheckOut] = useState(false);

    const [submitForm, setSubmitForm] = useState({
        date: new Date().toISOString().split('T')[0],
        documentNumber: '',
        customerName: '',
        salesChannel: 'credit-card',
        trackingNumber: '',
        shippingAddress: '',
        billingAddress: '',
        customerPO: '',
        comments: '',
        items: []
    });

    // Popup handlers
    const openAddPopup = (type) => {
        setPopupState({
            isOpen: true,
            type: type,
            mode: 'add',
            addressData: null,
            addressId: null
        });
    };

    const openEditPopup = (type, address, addressId) => {
        setPopupState({
            isOpen: true,
            type: type,
            mode: 'edit',
            addressData: address,
            addressId: addressId
        });
    };

    const closePopup = () => {
        setPopupState(prev => ({ ...prev, isOpen: false }));
    };

    // Address management functions
    const handleAddNewAddress = async (addressData) => {

        console.log("currentUser in add address:", currentUser._id);
        try {
            const endpoint = popupState.type === 'shipping'
                ? `admin/add-shipping-address/${currentUser._id}`
                : `admin/add-billing-address/${currentUser._id}`;

            const response = await axiosInstance.post(endpoint, addressData);

            if (response.data.statusCode === 200) {
                console.log(`New ${popupState.type} address added successfully`);
                fetchCustomersCart();
                closePopup();
                setUser(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error(`Error adding new ${popupState.type} address:`, error);
            setError(`Failed to add new ${popupState.type} address. Please try again.`);
        }
    };

    const handleEditAddress = async (addressData) => {
        try {
            const endpoint = popupState.type === 'shipping'
                ? `admin/update-shipping-address/${currentUser._id}/${popupState.addressId}`
                : `admin/update-billing-address/${currentUser._id}/${popupState.addressId}`;

            const response = await axiosInstance.put(endpoint, addressData);

            console.log("address updation resposnse :", response);

            if (response.data.statusCode === 200) {
                setUser(response.data.data);
                console.log(`${popupState.type} address updated successfully`);
                fetchCustomersCart();
                closePopup();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error(`Error updating ${popupState.type} address:`, error);
            setError(`Failed to update ${popupState.type} address. Please try again.`);
        }
    };

    const handleRemoveAddress = async (type, addressId) => {
        if (!confirm('Are you sure you want to remove this address?')) {
            return;
        }

        try {
            const endpoint = type === 'shipping'
                ? `admin/remove-shipping-address/${currentUser._id}/${addressId}`
                : `admin/remove-billing-address/${currentUser._id}/${addressId}`;

            const response = await axiosInstance.delete(endpoint);

            if (response.data.statusCode === 200) {
                console.log(`${type} address removed successfully`);
                fetchCustomersCart();
                setUser(response.data.data);

                // Reset selection if the removed address was selected
                if (type === 'shipping') {
                    const shippingAddresses = currentUser?.shippingAddresses || [];
                    const addressIndex = shippingAddresses.findIndex(addr => addr._id === addressId);
                    if (selectedShippingAddress === addressIndex) {
                        setSelectedShippingAddress(0);
                    }
                } else {
                    const billingAddresses = currentUser?.billingAddresses || [];
                    const addressIndex = billingAddresses.findIndex(addr => addr._id === addressId);
                    if (selectedBillingAddress === addressIndex) {
                        setSelectedBillingAddress(0);
                    }
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error(`Error removing ${type} address:`, error);
            setError(`Failed to remove ${type} address. Please try again.`);
        }
    };

    const handlePopupSubmit = (addressData) => {
        if (popupState.mode === 'add') {
            handleAddNewAddress(addressData);
        } else {
            handleEditAddress(addressData);
        }
    };

    // Format addresses from currentUser
    const shippingAddresses = currentUser?.shippingAddresses?.map((addr, index) => ({
        id: addr._id,
        index: index,
        name: currentUser.customerName || currentUser.contactName || '',
        address: `${addr.shippingAddressOne} ${addr.shippingAddressTwo} ${addr.shippingAddressThree} ${addr.shippingCity} ${addr.shippingState} ${addr.shippingZip}`.replace(/\s+/g, ' ').trim(),
        phone: currentUser.CustomerPhoneNo || currentUser.contactPhone || '',
        ...addr
    })) || [];

    const billingAddresses = currentUser?.billingAddresses?.map((addr, index) => ({
        id: addr._id,
        index: index,
        name: currentUser.customerName || currentUser.contactName || '',
        address: `${addr.billingAddressOne} ${addr.billingAddressTwo} ${addr.billingAddressThree} ${addr.billingCity} ${addr.billingState} ${addr.billingZip}`.replace(/\s+/g, ' ').trim(),
        phone: currentUser.CustomerPhoneNo || currentUser.contactPhone || '',
        ...addr
    })) || [];

    const fetchLatestDocumentNumber = async () => {
        try {
            const res = await axiosInstance.get('sales-order/get-latest-document-number')

            console.log("latest document number", res);
            if (res.data.statusCode === 200 && res.data.data && res.data.data.documentNumber) {
                setLatestSalesOrderDocumentNumber(res.data.data.documentNumber);
            } else {
                // If no document number exists, set to null to trigger default
                setLatestSalesOrderDocumentNumber(null);
                console.log('No existing document number found, will use default SO00001');
            }
        } catch (error) {
            console.error('Error fetching latest document number:', error);
            // On error, set to null to trigger default
            setLatestSalesOrderDocumentNumber(null);
        }
    }

    React.useEffect(() => {
        fetchLatestDocumentNumber();
    }, [])

    // Update submitForm when addresses are selected (Step 1)
    useEffect(() => {
        if (currentUser) {
            const shippingAddr = currentUser.shippingAddresses?.[selectedShippingAddress];
            const billingAddr = currentUser.billingAddresses?.[selectedBillingAddress];

            setSubmitForm(prev => ({
                ...prev,
                customerName: currentUser.customerName || currentUser.contactName || '',
                shippingAddress: shippingAddr ?
                    `${shippingAddr.shippingAddressOne} ${shippingAddr.shippingAddressTwo} ${shippingAddr.shippingAddressThree} ${shippingAddr.shippingCity} ${shippingAddr.shippingState} ${shippingAddr.shippingZip}`.replace(/\s+/g, ' ').trim()
                    : '',
                billingAddress: billingAddr ?
                    `${billingAddr.billingAddressOne} ${billingAddr.billingAddressTwo} ${billingAddr.billingAddressThree} ${billingAddr.billingCity} ${billingAddr.billingState} ${billingAddr.billingZip}`.replace(/\s+/g, ' ').trim()
                    : ''
            }));
        }
    }, [selectedShippingAddress, selectedBillingAddress, currentUser]);

    // Update submitForm with cart items
    useEffect(() => {
        console.log("checkout cart items:", cartItems);
        if (cartItems.length > 0) {
            const formattedItems = cartItems.map(item => ({
                itemSku: item.product.sku,
                productName: item.product.ProductName,
                unitsQuantity: item.unitsQuantity,
                packQuantity: item.packQuentity,
                totalQuantity: item.totalQuantity,
                eachPrice: item.amount / item.totalQuantity, // Calculate unit price
                amount: item.amount, // Use stored amount directly
                taxable: item.product.taxable,
                taxPercentage: item.product.taxPercentages || 0,
                packType: item.packType,
                discountType: item.discountType,
                discountPercentages: item.discountPercentages
            }));

            setSubmitForm(prev => ({
                ...prev,
                items: formattedItems
            }));
        }
    }, [cartItems]);

    // Calculate totals from cart items
    const calculateTotals = () => {
        let subtotalAmount = 0;
        let gstAmount = 0;

        cartItems.forEach(item => {
            // Use the stored amount directly (it's already the total for this item)
            subtotalAmount += item.amount;

            // Calculate tax based on the stored amount
            if (item.product.taxable && item.product.taxPercentages) {
                gstAmount += (item.amount * item.product.taxPercentages) / 100;
            }
        });

        const shippingAmount = parseFloat(currentUser?.defaultShippingRate || 0);
        const totalAmount = subtotalAmount + gstAmount + shippingAmount;

        return {
            subtotal: subtotalAmount,
            gst: gstAmount,
            shipping: shippingAmount,
            total: totalAmount
        };
    };

    const totals = calculateTotals();
    const totalItems = cartItems.reduce((sum, item) => sum + item.totalQuantity, 0);

    useEffect(() => {
        if (latestSalesOrderDocumentNumber) {
            // If we have an existing document number, increment it
            const prefix = latestSalesOrderDocumentNumber.match(/[A-Za-z]+/)[0]; // "SO"
            const number = parseInt(latestSalesOrderDocumentNumber.match(/\d+/)[0], 10); // 19082
            const nextDocumentNumber = `${prefix}${String(number + 1).padStart(5, '0')}`;
            setDocumentNumber(nextDocumentNumber);
        } else if (latestSalesOrderDocumentNumber === null) {
            // If no existing document number, start with SO00001
            setDocumentNumber('SO00001');
        }
    }, [latestSalesOrderDocumentNumber]);

    const handleCompleteCheckout = async () => {
        setLoadingCheckOut(true);
        try {
            const orderData = {
                date: submitForm.date,
                documentNumber: documentNumber,
                customerName: currentUser.customerName || currentUser.contactName || '',
                salesChannel: submitForm.salesChannel,
                trackingNumber: submitForm.trackingNumber || '',
                shippingAddress: submitForm.shippingAddress,
                billingAddress: submitForm.billingAddress,
                customerPO: submitForm.customerPO || '',
                comments: submitForm.comments || '',
                items: submitForm.items
            };

            const response = await axiosInstance.post('sales-order/create-bulk-sales-order', orderData);

            if (response.data.statusCode === 200) {
                console.log("All orders placed successfully via bulk API");
                setCartItemsCount(0);

                // Navigate immediately to thank you page
                router.push(`/thank-you/${documentNumber}`);
            } else {
                setError(response.data.message || 'Failed to process order. Please try again.');
            }

        } catch (error) {
            console.error("Error placing bulk orders: ", error);
            setError("An error occurred while placing your order. Please try again.");
        } finally {
            setLoadingCheckOut(false);
        }
    };

    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            setLoading(true);
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

            if (response.data.statusCode === 200) {
                const items = response.data.data || [];
                setCartItems(items);

                const quantities = {};
                const packs = {};
                items.forEach(item => {
                    quantities[item._id] = item.unitsQuantity;
                    const matchingPack = item.product.typesOfPacks?.find(
                        pack => parseInt(pack.quantity) === item.packQuentity
                    );
                    packs[item._id] = matchingPack?._id || item.product.typesOfPacks?.[0]?._id;
                });
                setLocalQuantities(quantities);
                setSelectedPacks(packs);
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer cart:', error)
            setError('Failed to load cart items. Please try again.')
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchCustomersCart();
        }
    }, [currentUser])

    return (
        <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8 lg:pb-32 lg:pt-4 font-spartan">
            <div className="max-w-8xl px-4 sm:px-6 lg:px-8 mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-4 relative top-6">
                    <h1 className="text-lg sm:text-xl lg:text-[24px] font-semibold mb-4 text-center sm:text-left">
                        Checkout Process
                    </h1>

                    {/* Progress Steps */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start text-sm sm:text-base font-semibold mb-2 text-[#00000080]/50 gap-x-1 sm:gap-x-2">
                        <span className={`font-medium ${step === 1 ? 'text-[#2D2C70]' : ''}`}>
                            1. Select Addresses
                        </span>
                        <span className="mx-1">/</span>
                        <span className={`font-medium ${step === 2 ? 'text-[#2D2C70]' : ''}`}>
                            2. Checkout Information
                        </span>
                        <span className="mx-1">/</span>
                        <span className={`font-medium ${step === 3 ? 'text-[#2D2C70]' : ''}`}>
                            3. Review
                        </span>
                    </div>

                    <hr className="border-[1.5px] sm:border-[1px] border-[#2D2C70]" />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-2">
                    {/* STEP 1: Select Addresses */}
                    {step === 1 &&
                        <div className="min-w-full col-span-2 mx-auto bg-gray-50 xl:min-h-screen">
                            {/* Shipping Address Section */}
                            <div className="mb-8">
                                <h2 className="text-[24px] font-semibold text-[#2D2C70] py-6">Select Shipping Address</h2>
                                <div className="space-y-3">
                                    <p className="text-[20px] mb-4">Shipping Address ({shippingAddresses.length})</p>
                                    {shippingAddresses.map((address) => (
                                        <div key={address.id}
                                            className={`bg-white rounded-lg border overflow-hidden ${selectedShippingAddress === address.index ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="shipping-address"
                                                            value={address.index}
                                                            checked={selectedShippingAddress === address.index}
                                                            onChange={() => setSelectedShippingAddress(address.index)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className="font-semibold mb-1">{address.name}</h3>
                                                        <p className="font-medium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => openEditPopup('shipping', address, address.id)}
                                                                className="text-[#2D2C70] underline font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <span className="text-gray-300">|</span>
                                                            <button
                                                                onClick={() => handleRemoveAddress('shipping', address.id)}
                                                                className="text-[#46BCF9] underline font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => openAddPopup('shipping')}
                                        className="w-full bg-white rounded-lg py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className='border-2 border-[#2D2C70] rounded-full h-7 w-7 justify-center flex items-center'>
                                            <Plus className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-sm text-[#2D2C70] text-[14px] font-semibold">Add a new shipping address</span>
                                    </button>
                                </div>
                            </div>

                            {/* Billing Address Section */}
                            <div className="mb-8">
                                <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-2">Select Billing Address</h2>
                                <p className="text-[20px] mb-4">Billing Address ({billingAddresses.length})</p>
                                <div className="space-y-3">
                                    {billingAddresses.map((address) => (
                                        <div key={`billing-${address.id}`}
                                            className={`bg-white rounded-lg border overflow-hidden ${selectedBillingAddress === address.index ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="billing-address"
                                                            value={address.index}
                                                            checked={selectedBillingAddress === address.index}
                                                            onChange={() => setSelectedBillingAddress(address.index)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className="font-semibold mb-1">{address.name}</h3>
                                                        <p className="font-medium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => openEditPopup('billing', address, address.id)}
                                                                className="text-[#2D2C70] underline font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <span className="text-gray-300">|</span>
                                                            <button
                                                                onClick={() => handleRemoveAddress('billing', address.id)}
                                                                className="text-[#46BCF9] underline font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => openAddPopup('billing')}
                                        className="w-full bg-white rounded-lg py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className='border-2 border-[#2D2C70] rounded-full h-7 w-7 justify-center flex items-center'>
                                            <Plus className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-sm text-[#2D2C70] text-[14px] font-semibold">Add a new billing address</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    }

                    {/* STEP 2: Checkout Information */}
                    {step === 2 &&
                        <CheckoutFormUI
                            selectedBillingAddress={selectedBillingAddress}
                            selectedShippingAddress={selectedShippingAddress}
                            submitForm={submitForm}
                            setSubmitForm={setSubmitForm}
                        />
                    }

                    {/* STEP 3: Review */}
                    {step === 3 &&
                        <Review
                            selectedBillingAddress={selectedBillingAddress}
                            selectedShippingAddress={selectedShippingAddress}
                            submitForm={submitForm}
                        />
                    }

                    {/* Order Summary Sidebar */}
                    <div className={`lg:col-span-1 ${step === 1 ? 'xl:mt-27' : 'xl:mt-18'}`}>
                        <div className="bg-white rounded-lg sticky top-6">
                            <div className="md:p-4">
                                <div className="border-2 border-gray-300 rounded-lg space-y-3 font-spartan">
                                    <div className="flex items-center justify-center mb-4 py-4 border-b">
                                        <h2 className="text-lg sm:text-xl lg:text-[20px] font-semibold">Order Summary</h2>
                                    </div>
                                    <div className="px-4">
                                        <div className="flex justify-between ">
                                            <span className="text-base sm:text-lg lg:text-[20px] font-medium">
                                                Subtotal <span className='text-xs sm:text-sm lg:text-base font-[400] text-[#000000]/50'>{totalItems} Items</span>
                                            </span>
                                            <span className="text-[#2D2C70] font-semibold text-[20px]">${totals.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="mb-2 text-xs sm:text-sm lg:text-[14px] font-[400]">Subtotal does not include shipping or taxes</div>
                                    </div>
                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-3 px-4'>
                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Shipping</span>
                                            <span>${totals.shipping.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">GST</span>
                                            <span>${totals.gst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between text-base sm:text-lg font-semibold pt-2 border-t border-gray-200 mt-2">
                                        <span>Total</span>
                                        <span>${totals.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {step < 3 ?
                                    <>
                                        <button
                                            className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4 border-1 border-black"
                                            onClick={() => setStep(step + 1)}
                                        >
                                            Continue
                                        </button>

                                        <div className="flex items-center space-x-3 mb-8">
                                            <button
                                                className={`flex items-center justify-center rounded-2xl border border-black flex-1 gap-2 text-[1rem] font-semibold border  py-2 px-6 transition-colors duration-300 group 'bg-gray-400 text-gray-200 border-gray-400  bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]`}
                                            >
                                                <svg
                                                    className="w-5 h-5 transition-colors duration-300 "
                                                    viewBox="0 0 21 21"
                                                    fill="currentColor"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                                                </svg>
                                                Continue Shopping
                                            </button>
                                        </div>
                                    </>
                                    :
                                    <button
                                        className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4 border-1 border-black"
                                        onClick={handleCompleteCheckout}
                                    >
                                        {loadingCheckOut ? 'Completing Checkout...' : "Complete Checkout"}
                                    </button>
                                }



                                <div className='flex items-center bg-[#2D2C70] text-white justify-between mb-2 flex-row border-1 border-black rounded-2xl px-3 py-3'>
                                    <p className='text-xs sm:text-sm lg:text-[14px] font-[500]'>Items To Ship ({totalItems})</p>
                                    <span><ChevronDown className="w-4 h-4 text-white" /></span>
                                </div>
                                {/* Order Items */}
                                <div className="space-y-4 mb-6 border-2 border-gray-300 rounded-lg">
                                    <div className='space-y-4 mt-4 p-3 sm:p-4'>
                                        {cartItems.map((item) => {
                                            // The amount is already the total, no need to multiply again
                                            const itemAmount = item.amount; // Use the stored amount directly
                                            const packName = item.product.typesOfPacks?.find(pack => parseInt(pack.quantity) === item.packQuentity)?.name || 'Each';

                                            return (
                                                <div key={item._id} className="flex items-center space-x-3 p-2 justify-between">
                                                    <div className="w-28 h-28   rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <img
                                                            src={item.product.images}
                                                            alt={item.product.ProductName}
                                                            width={98}
                                                            height={98}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xs sm:text-sm lg:text-[16px] font-medium mb-1 line-clamp-2">
                                                            {item.product.ProductName}
                                                        </h3>
                                                        {/* Calculate unit price for display */}
                                                        <div className='flex w-full justify-between'>
                                                            <p className="text-[18px] text-[#2D2C70] font-semibold mb-1">
                                                                ${(item.amount / item.totalQuantity).toFixed(2)}
                                                            </p>
                                                            <div className="flex items-center text-[12px] font-[600] text-black py-1 px-2 w-[90px] bg-[#E7FAEF] mb-2">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                IN STOCK
                                                            </div>
                                                        </div>
                                                        <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-1'>
                                                            <p className="mb-1">{item.product.sku}</p>
                                                            <div className='flex w-full justify-between'>
                                                                <p className="mb-1">Units: {packName}</p>
                                                                <div>Quantity {item.totalQuantity}</div>
                                                            </div>

                                                            <div className="space-y-1 text-xs">
                                                                <div className='flex w-full justify-between'>
                                                                    <div>Unit price ${(item.amount / item.totalQuantity).toFixed(2)}</div>
                                                                    <div>Amount ${item.amount.toFixed(2)}</div> {/* Use stored amount directly */}
                                                                    {item.product.taxable && (
                                                                        <div>Tax ({item.product.taxPercentages}%): ${((item.amount * item.product.taxPercentages) / 100).toFixed(2)}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className='px-4'>
                                        <button
                                            onClick={() => router.push('/cart')}
                                            className="w-full bg-[#2D2C70] text-white p-2 rounded-2xl text-sm sm:text-base font-medium mt-4 mb-4"
                                        >
                                            Edit Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Popup */}
                <AddressPopup
                    isOpen={popupState.isOpen}
                    onClose={closePopup}
                    onSubmit={handlePopupSubmit}
                    type={popupState.type}
                    addressData={popupState.addressData}
                    mode={popupState.mode}
                />
            </div>
        </div >
    );
};

export default CheckoutComponent;