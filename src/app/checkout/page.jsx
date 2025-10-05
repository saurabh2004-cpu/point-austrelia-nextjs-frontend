'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import CheckoutFormUI from '@/components/checkout-components/CheckOutInformation';
import Review from '@/components/checkout-components/Review';
import { useRouter } from 'next/navigation';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import { s } from 'framer-motion/client';

const CheckoutComponent = () => {
    const [step, setStep] = useState(1);
    const currentUser = useUserStore((state) => state.user);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedPacks, setSelectedPacks] = useState({});
    const [selectedShippingAddress, setSelectedShippingAddress] = useState(0);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState(0);
    const router = useRouter();

    // Main submit form state
    const [submitForm, setSubmitForm] = useState({
        date: new Date().toISOString().split('T')[0],
        documentNumber: '',
        customerName: '',
        salesChannel: 'credit-card', // Payment method
        trackingNumber: '',
        shippingAddress: '',
        billingAddress: '',
        customerPO: '', // Purchase order number
        comments: '', // Order comments
        items: [] // Cart items will be added here
    });





    // Format addresses from currentUser
    const shippingAddresses = currentUser?.shippingAddresses?.map((addr, index) => ({
        id: index,
        name: currentUser.customerName || currentUser.contactName || '',
        address: `${addr.shippingAddressOne} ${addr.shippingAddressTwo} ${addr.shippingAddressThree} ${addr.shippingCity} ${addr.shippingState} ${addr.shippingZip}`.replace(/\s+/g, ' ').trim(),
        phone: currentUser.CustomerPhoneNo || currentUser.contactPhone || ''
    })) || [];

    const billingAddresses = currentUser?.billingAddresses?.map((addr, index) => ({
        id: index,
        name: currentUser.customerName || currentUser.contactName || '',
        address: `${addr.billingAddressOne} ${addr.billingAddressTwo} ${addr.billingAddressThree} ${addr.billingCity} ${addr.billingState} ${addr.billingZip}`.replace(/\s+/g, ' ').trim(),
        phone: currentUser.CustomerPhoneNo || currentUser.contactPhone || ''
    })) || [];

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
        if (cartItems.length > 0) {
            const formattedItems = cartItems.map(item => ({
                itemSku: item.product.sku,
                productName: item.product.ProductName,
                unitsQuantity: item.unitsQuantity,
                packQuantity: item.packQuentity,
                totalQuantity: item.totalQuantity,
                eachPrice: item.product.eachPrice,
                amount: (item.totalQuantity * item.product.eachPrice) + (item.product.taxable ? (item.totalQuantity * item.product.eachPrice * (item.product.taxPercentages || 0) / 100) : 0),
                taxable: item.product.taxable,
                taxPercentage: item.product.taxPercentages || 0
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
            const itemTotal = item.totalQuantity * item.product.eachPrice;
            subtotalAmount += itemTotal;

            if (item.product.taxable && item.product.taxPercentages) {
                gstAmount += (itemTotal * item.product.taxPercentages) / 100;
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

    const handleCompleteCheckout = async () => {
        try {
            // Generate a unique document number for this order batch
            const batchDocNumber = `ORD-${Date.now()}`;

            // Create an array of promises
            const orderPromises = submitForm.items.map((item, index) => {
                const formdata = {
                    date: submitForm.date,
                    documentNumber: `${batchDocNumber}-${index + 1}`, // Unique doc number for each item
                    customerName: currentUser.customerName || currentUser.contactName || '',
                    salesChannel: submitForm.salesChannel,
                    trackingNumber: submitForm.trackingNumber || '',
                    shippingAddress: submitForm.shippingAddress,
                    billingAddress: submitForm.billingAddress,
                    customerPO: submitForm.customerPO || '',
                    itemSku: item.itemSku,
                    unitsQuantity: item.unitsQuantity,
                    packQuantity: item.packQuantity,
                    amount: item.amount,
                    comments: submitForm.comments || ''
                };

                return axiosInstance.post(`sales-order/create-sales-order`, formdata);
            });

            // Wait for all orders to complete
            const results = await Promise.all(orderPromises);

            // Check if all orders succeeded
            const allSucceeded = results.every(res => {
                console.log("Order response:", res.data);
                return res.data.statusCode === 200;
            });

            if (allSucceeded) {

                console.log()
                console.log("All orders placed successfully");

                // Clear the cart after successful checkout
                // await axiosInstance.delete(`cart/clear-cart/${currentUser._id}`);

                router.push('/thank-you');
            } else {
                const failedOrders = results.filter(res => res.data.statusCode !== 200);
                console.error("Some orders failed:", failedOrders);
            }

        } catch (error) {
            console.error("Error placing orders: ", error);
            alert("An error occurred while placing your order. Please try again.");
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
        <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 lg:pb-32 lg:pt-4 font-spartan">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-2">
                    {/* STEP 1: Select Addresses */}
                    {step === 1 &&
                        <div className="min-w-full col-span-2 mx-auto bg-gray-50 xl:min-h-screen">
                            {/* Shipping Address Section */}
                            <div className="mb-8">
                                <h2 className="text-[24px] font-semibold text-[#2D2C70] py-6">Select Shipping Address</h2>
                                <div className="space-y-3">
                                    <p className="text-[20px] mb-4">Shipping Address ({shippingAddresses.length})</p>
                                    {shippingAddresses.map((address, index) => (
                                        <div key={index}
                                            className={`bg-white rounded-lg border overflow-hidden ${selectedShippingAddress === address.id ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="shipping-address"
                                                            value={address.id}
                                                            checked={selectedShippingAddress === address.id}
                                                            onChange={() => setSelectedShippingAddress(address.id)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className="font-semibold mb-1">{address.name}</h3>
                                                        <p className="font-mnedium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button className="text-[#2D2C70] underline font-medium">Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-[#46BCF9] underline font-medium">Remove</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full bg-white rounded-lg py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors">
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
                                    {billingAddresses.map((address, index) => (
                                        <div key={`billing-${address.id}`}
                                            className={`bg-white rounded-lg border overflow-hidden ${selectedBillingAddress === address.id ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="billing-address"
                                                            value={address.id}
                                                            checked={selectedBillingAddress === address.id}
                                                            onChange={() => setSelectedBillingAddress(address.id)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className="font-semibold mb-1">{address.name}</h3>
                                                        <p className="font-mnedium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button className="text-[#2D2C70] underline font-medium">Edit</button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className="text-[#46BCF9] underline font-medium">Remove</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full bg-white rounded-lg py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors">
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
                                    <div className="flex justify-between px-4">
                                        <span className="text-base sm:text-lg lg:text-[20px] font-medium">
                                            Subtotal <span className='text-xs sm:text-sm lg:text-base font-[400] text-[#000000]/50'>{totalItems} Items</span>
                                        </span>
                                        <span className="text-[#2D2C70] font-semibold text-[20px]">${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-3 px-4'>
                                        <div className="mb-2">Subtotal does not include shipping or taxes</div>
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
                                    <button
                                        className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4"
                                        onClick={() => setStep(step + 1)}
                                    >
                                        Continue
                                    </button>
                                    :
                                    <button
                                        className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4"
                                        onClick={handleCompleteCheckout}
                                    >
                                        Complete Checkout
                                    </button>
                                }

                                {/* Order Items */}
                                <div className="space-y-4 mb-6 border-2 border-gray-300 rounded-lg">
                                    <div className='flex items-center justify-between flex-row border-2 border-gray-400 rounded-lg px-3 py-2'>
                                        <p className='text-xs sm:text-sm lg:text-[14px] font-[500]'>Items To Ship ({totalItems})</p>
                                        <span><ChevronDown className="w-4 h-4 text-black" /></span>
                                    </div>
                                    <div className='space-y-4 mt-4 p-3 sm:p-4'>
                                        {cartItems.map((item) => {
                                            const itemAmount = item.totalQuantity * item.product.eachPrice;
                                            const packName = item.product.typesOfPacks?.find(pack => parseInt(pack.quantity) === item.packQuentity)?.name || 'Each';

                                            return (
                                                <div key={item._id} className="flex items-start space-x-3 p-2 justify-between">
                                                    <div className="w-12 h-12 bg-gray-100 mt-14 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <img
                                                            src={item.product.images}
                                                            alt={item.product.ProductName}
                                                            width={48}
                                                            height={48}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xs sm:text-sm lg:text-[16px] font-medium mb-1 line-clamp-2">
                                                            {item.product.ProductName}
                                                        </h3>
                                                        <p className="text-[18px] text-[#2D2C70] font-semibold mb-1">
                                                            ${item.product.eachPrice.toFixed(2)}
                                                        </p>
                                                        <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-1'>
                                                            <p className="mb-1">{item.product.sku}</p>
                                                            <p className="mb-1">Units: {packName}</p>
                                                            <div className="flex items-center text-[12px] font-[600] text-black py-1 px-2 w-[90px] bg-[#E7FAEF] mb-2">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                IN STOCK
                                                            </div>
                                                            <div className="space-y-1 text-xs">
                                                                <div>Unit price ${item.product.eachPrice.toFixed(2)}</div>
                                                                <div>Quantity {item.totalQuantity}</div>
                                                                <div>Amount ${itemAmount.toFixed(2)}</div>
                                                                {item.product.taxable && (
                                                                    <div>Tax ({item.product.taxPercentages}%): ${((itemAmount * item.product.taxPercentages) / 100).toFixed(2)}</div>
                                                                )}
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
            </div>
        </div>
    );
};

export default CheckoutComponent;