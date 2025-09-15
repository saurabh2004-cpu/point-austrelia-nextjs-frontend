'use client'

import React, { useState } from 'react';
import { ChevronDown, Heart, Plus, Minus, Check, BadgeQuestionMark } from 'lucide-react';
import Image from 'next/image';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.png",
            inStock: true
        },
        {
            id: 2,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.png",
            inStock: true
        },
        {
            id: 3,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.png",
            inStock: true
        }
    ]);

    const updateQuantity = (id, change) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div className="bg-white justify-items-center pt-12 font-spartan">
                <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 ">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span>Home</span>
                        <span className="mx-1 sm:mx-2">/</span>
                        <span className=" text-black ">Shopping Cart</span>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <div className="px-6 md:px-0  max-w-7xl mx-auto text-[24px] py-4  relative top-5  flex items-center justify-between ">
                <h1 className="text-xl font-semibold text-gray-900 ">
                    Shopping Cart
                    <span className="text-[#E9098D] ml-2">({cartItems.length} Products, {totalItems} Items)</span>
                </h1>
            </div>

            <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8 font-spartan ">
                <div className="max-w-7xl mx-auto border-t-2 border-[#2D2C70]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Shopping Cart Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg ">

                                {/* Cart Items */}
                                <div className="space-y-10 lg:space-y-0">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="lg:py-6">
                                            <div className="flex flex-col md:flex-row items-center space-x-4 border  rounded-lg px-8 lg:px-0  md:space-x-25">
                                                {/* Product Image */}
                                                <div className="">
                                                    <div className="     rounded-lg flex items-center w-full  justify-items-center ">
                                                        <Image
                                                            className=''
                                                            src={item.image} alt={item.name} width={156} height={156} />
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 ">
                                                    {/* Stock Status */}
                                                    <div className="flex mb-4 items-center w-[90px] text-[10px] font-medium text-black p-2 rounded-full text-[10px] bg-[#E7FAEF]">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        IN STOCK
                                                    </div>

                                                    {/* Product Name */}
                                                    <h3 className="text-[15px] font-semibold  mb-2">
                                                        {item.name}
                                                    </h3>

                                                    {/* SKU */}
                                                    <p className="text-[13px] text-[400] mb-2">{item.sku}</p>

                                                    {/* Price */}
                                                    <div className="text-[24px] font-semibold text-[#E9098D] mb-1">
                                                        ${item.price.toFixed(2)}
                                                    </div>

                                                    {/* Quantity and Actions */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                                        <div className="flex items-center flex-col">
                                                            <span className="text-[13px] text-[500] mr-3"><span className='font-semibold'>Units:</span> Pack of 12</span>

                                                        </div>


                                                    </div>
                                                    <span className="text-[13px] font-medium  ">Quantity</span>
                                                    <div className="flex items-center space-x-3 my-2">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center  rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1 bg-black rounded-md py-1 px-2  transition-colors"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="w-4 h-4 text-white" />
                                                            </button>
                                                            <span className="px-3 py-1 min-w-[2rem] text-center text-sm font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="p-1 bg-black rounded-md py-1 px-2 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4 text-white " />
                                                            </button>
                                                        </div>

                                                    </div>
                                                    <span className="text-[13px] font-semibold">
                                                        Amount: <span className="text-[#E9098D] text-[15px] font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </span>

                                                    {/* Action Buttons */}
                                                    <div className="flex text-[13px] font-medium items-center space-x-3 mt-4">
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="bg-[#E9098D] text-white px-4 py-2 rounded-full  "
                                                        >
                                                            Remove
                                                        </button>
                                                        <button className="flex items-center space-x-2 bg-[#2D2C70] text-white px-4 py-2 rounded-full  ">
                                                            <Heart className="h-4 w-4" />
                                                            <span>Move to wishlist</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Checkout Button */}
                                <div className="p-6 border-t border-gray-200">
                                    <button className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors">
                                        Proceed to checkout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 pt-5 font-spartan">
                            <div className="bg-white rounded-lg shadow-sm sticky top-6 border">
                                <div className="p-6">
                                    <h2 className="text-[20px] font-semibold mb-6">Order Summary</h2>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[1rem] font-[400]"><span className='text-[20px] font-medium'>Subtotal</span> ({totalItems} Items)</span>
                                            <span className="text-[20px] font-medium text-[#E9098D]">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="text-[14px] text-[400]">
                                            Subtotal does not include shipping or taxes
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-[14px] text-[400] text-[#000000]/80">Matador Wholesale</span>
                                            <span className="text-[14px] font-medium">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-[14px] text-[400] text-[#000000]/80">Point Accessories</span>
                                            <span className="text-[14px] font-medium">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex flex-row items-center justify-between mb-4 border border-1 border-black p-2 rounded-2xl">
                                                <div className='flex space-x-2 align-center'>
                                                    <span className="text-[14px] font-[400] text-[#000000]/80">
                                                        Estimated tax & shipping
                                                    </span>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                                                    </span>
                                                </div>

                                                <ChevronDown className="h-4 w-4 " />
                                            </div>

                                            <button className="w-full bg-[#E9098D] text-white py-2 rounded-2xl text-[15px] font-medium hover:bg-pink-600 transition-colors mb-3">
                                                Proceed to checkout
                                            </button>

                                            <button className="w-full border border-[#46BCF9] rounded-2xl text-[15px]  py-2 text-sm font-medium hover:text-pink-600 transition-colors">
                                                Clear cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ShoppingCart;