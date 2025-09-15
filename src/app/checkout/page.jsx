'use client'
import React, { useState } from 'react';
import { ChevronDown, Check, CreditCard, User, Phone, Shield, MenuIcon, Circle, LockIcon, ArrowDown, ArrowDown01 } from 'lucide-react';
import Image from 'next/image';

const CheckoutComponent = () => {
    const [deliveryMethod, setDeliveryMethod] = useState('free');
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');

    const orderItems = [
        {
            id: 1,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 7,
            unitPrice: 0.64,
            image: "/product-listing-images/product-1.png"
        },
        {
            id: 2,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 7,
            unitPrice: 0.64,
            image: "/product-listing-images/product-1.png"
        }
    ];

    const subtotal = 4.48;
    const matadorWholesale = 4.48;
    const pointAccessories = 4.48;
    const shipping = 4.48;
    const gst = 4.48;
    const total = 4.48;

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16 font-spartan">
            <div className="max-w-8xl px-4 sm:px-6 lg:px-8 mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-[24px] font-medium mb-4">Checkout</h1>

                    {/* Progress Steps */}
                    <div className="flex items-center text-sm sm:text-base lg:text-[1rem] font-medium mb-6">
                        <span className="font-medium">1. Checkout Information</span>
                        <span className="mx-2">/</span>
                        <span className='text-[#2D2C70]'>2. Review</span>
                    </div>

                    <hr className="border-2 sm:border-3 border-[#2D2C70]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Checkout Form */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Selected Address & Billing Address */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                                Selected Address & Billing Address
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Shipping Address */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-sm font-medium text-blue-800 mb-3">Shipping Address</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900">Devendra Chandora</p>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            2 Angoon Rd Spencer Park Western Australia 6330 Australia
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600">7073737773</p>
                                    </div>
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                                        Edit
                                    </button>
                                </div>

                                {/* Billing Address */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-sm font-medium text-blue-800 mb-3">Billing Address</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900">Devendra Chandora</p>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            2 Angoon Rd Spencer Park Western Australia 6330 Australia
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600">7073737773</p>
                                    </div>
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Method */}
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-[24px] font-medium mb-4">
                                Delivery method
                            </h2>

                            <div className="space-y-3 border border-2 p-1 rounded-2xl">
                                <label className="flex items-center space-x-2 cursor-pointer px-2 py-1 sm:py-0">
                                    <Circle className="w-3 h-3 text-pink-500" />
                                    <span className="text-sm sm:text-base lg:text-[1rem] font-[400]">Free</span>
                                </label>
                            </div>
                        </div>

                        {/* Order Comments */}
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-[24px] font-medium mb-2">
                                Order Comments
                            </h2>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                rows="4"
                                placeholder=""
                            ></textarea>
                        </div>

                        {/* Payment */}
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-[24px] font-medium text-[#2D2C70] mb-2">
                                Payment
                            </h2>

                            <div className="mb-4">
                                <h3 className="text-base sm:text-lg lg:text-[20px] font-medium mb-3">Payment Method</h3>

                                <div className="space-y-3">
                                    {/* Credit Card */}
                                    <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <Circle className="w-3 h-3 text-[#E9098D]" />
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm sm:text-base lg:text-[16px] font-[400]">Credit card</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                                        </label>
                                    </div>

                                    {/* Account Customer */}
                                    <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <Circle className="w-3 h-3 text-[#E9098D]" />
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm sm:text-base lg:text-[16px] font-[400]">Account customer</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                                        </label>
                                    </div>

                                    {/* Contact for Payment */}
                                    <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <Circle className="w-3 h-3 text-[#E9098D]" />
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm sm:text-base lg:text-[16px] font-[400]">Contact me for payment</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="flex items-start space-x-2 text-xs sm:text-sm lg:text-[14px] font-[400] mb-6 align-center">
                                <LockIcon className="w-4 h-4 mt-0.5 text-black flex-shrink-0" />
                                <span>Learn more about safe and secure shopping</span>
                            </div>
                        </div>

                        {/* Purchase Order Number */}
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-[24px] font-medium mb-4">
                                Purchase order number
                            </h2>
                            <p className="text-sm sm:text-base lg:text-[1rem] font-medium mb-3">Enter purchase order number (Optional)</p>
                            <input
                                type="text"
                                value={purchaseOrderNumber}
                                onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                                className="w-full lg:w-2/3 border border-gray-300 rounded-full p-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder=""
                            />
                        </div>

                        {/* Review Notice */}
                        <div className="mb-4">
                            <p className="text-xs sm:text-sm lg:text-[14px] font-[400]">
                                You will have an opportunity to review your order on the next step.
                            </p>
                        </div>

                        {/* Continue Button */}
                        <button className="w-full sm:w-3/5 lg:w-2/5 bg-[#E9098D] text-white py-3 rounded-2xl text-sm sm:text-base font-medium">
                            Continue
                        </button>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg sticky top-6">
                            <div className="md:p-4 ">
                                <div className="flex items-center justify-center mb-4">
                                    <h2 className="text-lg sm:text-xl lg:text-[20px] font-medium">Order Summary</h2>
                                </div>

                                {/* Price Summary */}
                                <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3 font-spartan">
                                    <div className="flex justify-between">
                                        <span className="text-base sm:text-lg lg:text-[20px] font-medium">
                                            Subtotal <span className='text-xs sm:text-sm lg:text-base font-[400] text-[#000000]/50'>43 Items</span>
                                        </span>
                                        <span className="text-pink-500 font-semibold text-base sm:text-lg">${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-3'>
                                        <div className="mb-2">
                                            Subtotal does not include shipping or taxes
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Matador Wholesale</span>
                                            <span>${matadorWholesale.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Point Accessories</span>
                                            <span>${pointAccessories.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Shipping</span>
                                            <span>${shipping.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">GST</span>
                                            <span>${gst.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-base sm:text-lg font-semibold pt-2 border-t border-gray-200 mt-2">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <button className="w-full bg-[#E9098D] text-white py-3 rounded-2xl text-sm sm:text-base font-medium my-4">
                                    Continue
                                </button>

                                {/* Order Items */}
                                <div className="space-y-4 mb-6 border-2 border-gray-300 rounded-lg p-3 sm:p-4">
                                    <div className='flex items-center justify-between flex-row border-2 border-gray-400 rounded-lg px-3 py-2'>
                                        <p className='text-xs sm:text-sm lg:text-[14px] font-[500]'>Items To Ship (43)</p>
                                        <span><ChevronDown className="w-4 h-4 text-black" /></span>
                                    </div>
                                    <div className='space-y-4 mt-4'>
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="flex items-start space-x-3 p-2 justify-between">
                                                <div className="w-12 h-12 bg-gray-100 mt-14  rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs sm:text-sm lg:text-[12px] font-medium mb-1 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm lg:text-[14px] text-[#E9098D] font-semibold mb-1">
                                                        ${item.price.toFixed(2)}
                                                    </p>
                                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-1'>
                                                        <p className="mb-1">{item.sku}</p>
                                                        <p className="mb-1">Units: Pack of 12</p>

                                                        <div className="flex items-center text-[10px] font-[600] text-black py-1 px-2 w-[90px] rounded-2xl bg-[#E7FAEF] mb-2">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            IN STOCK
                                                        </div>

                                                        <div className="space-y-1 text-xs">
                                                            <div>Unit price ${item.unitPrice.toFixed(2)}</div>
                                                            <div>Quantity {item.quantity}</div>
                                                            <div>Amount ${(item.price * item.quantity).toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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