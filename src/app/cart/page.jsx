'use client'

import React, { useState } from 'react';
import { ChevronDown, Heart, Plus, Minus, Check, BadgeQuestionMark } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.avif",
            inStock: true
        },
        {
            id: 2,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.avif",
            inStock: true
        },
        {
            id: 3,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 1,
            image: "/product-listing-images/product-1.avif",
            inStock: true
        }
    ]);

    const router = useRouter();



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

    const handleCheckoutclick = () => {
        router.push('/checkout');
    };

    return (
        <>
            <div className="bg-white justify-items-center pt-6 font-spartan">
                <div className="max-w-8xl mx-auto px-2  lg:px-6 xl:px-8 ">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span>Home</span>
                        <span className="mx-1 sm:mx-2">/</span>
                        <span className=" text-black ">Shopping Cart</span>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <div className="px-6 md:px-0  md:max-w-7xl mx-auto text-[24px] py-4  relative top-5  flex items-center justify-between ">
                <h1 className="text-xl font-semibold text-gray-900 ">
                    Shopping Cart
                    <span className="text-[#2D2C70] ml-2">({cartItems.length} Products, {totalItems} Items)</span>
                </h1>
            </div>

            <div className="min-h-screen  py-4 px-4 sm:px-6  lg:px-8 font-spartan ">
                <div className="max-w-7xl justify-between mx-auto border-t-2 border-[#2D2C70]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Shopping Cart Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg ">

                                {/* Cart Items */}
                                <div className="space-y-10 lg:space-y-0 max-w-xl mt-5 mx-auto xl:mx-0 xl:mt-0">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="lg:py-6">
                                            <div className="flex flex-col md:flex-row items-center space-x-4 border border-[#00000040] p-3  rounded-lg px-8 lg:px-0  md:space-x-25">
                                                {/* Product Image */}
                                                <div className="">
                                                    <div className="     rounded-lg flex items-center w-full  justify-items-center ">
                                                        <Image
                                                            className=''
                                                            src={item.image} alt={item.name} width={116} height={116} />
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 ">
                                                    {/* Stock Status */}


                                                    {/* Product Name */}
                                                    <h3 className="text-[15px] font-semibold  mb-1">
                                                        {item.name}
                                                    </h3>

                                                    {/* SKU */}
                                                    <div className='flex align-center justify-between pr-12 items-center'>
                                                        <p className="text-[13px] text-[400] ">{item.sku}</p>
                                                        <div className="flex  items-center w-[100px] text-[10px] font-semibold text-black p-2  text-[14px] bg-[#E7FAEF]">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            IN STOCK
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-[24px] font-semibold text-[#2D2C70] mb-1">
                                                        ${item.price.toFixed(2)}
                                                    </div>

                                                    {/* Quantity and Actions */}
                                                    <div className="space-y-4 ">
                                                        <div className="flex flex-col xl:flex-row   align-middle sm:space-x-8 space-y-4 sm:space-y-0">

                                                            <div className="mb-3  space-x-12 align-center items-center font-spartan">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                                                                <div className="relative w-full">
                                                                    <select
                                                                        className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm 
                                                                                    focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                                                                    appearance-none"
                                                                    >
                                                                        <option value="each">Pack Of 6</option>
                                                                        <option value="pack">Pack Of 12</option>
                                                                        <option value="box">Carton of 60</option>
                                                                    </select>

                                                                    {/* Custom Arrow */}
                                                                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                                        <svg
                                                                            className="w-4 h-4 text-gray-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2.5"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>

                                                            </div>

                                                            <div className="hidden xl::block bg-gray-300 w-[1px] h-15 ml-8"></div>

                                                            <div className="flex  items-start space-x-2 space-y-2 flex-col">
                                                                <span className="text-sm font-[400] ">Quantity</span>
                                                                <div className="flex items-center  rounded-lg">
                                                                    <button
                                                                        className="p-1 bg-black rounded-md  px-2 py-1 transition-colors"
                                                                    >
                                                                        <Minus className="w-4 h-4 text-white" />
                                                                    </button>
                                                                    <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                                                                        2
                                                                    </span>
                                                                    <button
                                                                        className="p-1 bg-black rounded-md py-1  px-2 transition-colors"
                                                                    >
                                                                        <Plus className="w-4 h-4 text-white " />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <span className="text-[13px] font-semibold ">
                                                        Amount: <span className="text-[#2D2C70] text-[15px] font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </span>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col xl:flex-row space-y-2 xl:space-y-0 xl:flex-row text-[13px] font-medium items-center space-x-3 mt-4">
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="bg-[#E799A9] w-full xl:w-auto text-white px-8 py-2 rounded-full  "
                                                        >
                                                            Update
                                                        </button>
                                                        <div className='flex items-center space-x-3 w-full xl:w-auto'>
                                                            <button className="flex items-center w-full xl:w-auto justify-center space-x-2 bg-[#46BCF9] text-white text-[13px] font-semibold px-4 py-2 rounded-full">
                                                                <Heart className="h-4 w-4" />
                                                                <span className='mt-1'>Move to wishlist</span>
                                                            </button>

                                                            <div className='xl:hidden block h-8 w-9 border border-[#E9098D] rounded-full flex items-center justify-center '>
                                                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="black" />
                                                                </svg>
                                                            </div>

                                                        </div>


                                                        <div className="hidden xl:flex h-9 w-9 border border-[#E799A9] rounded-full items-center justify-center">
                                                            <svg
                                                                width="15"
                                                                height="16"
                                                                viewBox="0 0 15 16"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z"
                                                                    fill="black"
                                                                />
                                                            </svg>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Bottom Checkout Button */}
                                    <div className="py-6 border-t border-gray-200">
                                        <button
                                            onClick={handleCheckoutclick}
                                            className="w-full bg-[#2D2C70] text-white py-1 hover:bg-[#46BCF9] rounded-lg font-medium  ">
                                            Proceed to checkout
                                        </button>
                                    </div>
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
                                            <span className="text-[20px] font-medium text-[#2D2C70]">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="text-[14px] text-[400]">
                                            Subtotal does not include shipping or taxes
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-[14px] text-[500] text-[#000000]/80">Matador Wholesale</span>
                                            <span className="text-[14px] font-medium">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-[14px] text-[500] text-[#000000]/80">Point Accessories</span>
                                            <span className="text-[14px] font-medium">${subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex flex-row items-center justify-between mb-4 border border-1 border-black p-2 rounded-2xl">
                                                <div className='flex space-x-2 align-center'>
                                                    <span className="text-[14px] font-[500] text-[#000000]/80">
                                                        Estimated tax & shipping
                                                    </span>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                                                    </span>
                                                </div>

                                                <ChevronDown className="h-4 w-4 " />
                                            </div>

                                            <button
                                                onClick={handleCheckoutclick}
                                                className="w-full bg-[#2D2C70] border-1 border-[#2D2C70] hover:border-[#46BCF9] hover:bg-[#46BCF9] text-white py-2 rounded-2xl text-[15px] font-medium  transition-colors mb-3">
                                                Proceed to checkout
                                            </button>

                                            <button className="w-full border-1 border-[#2D2C70] rounded-2xl text-[15px]  py-2 text-sm font-medium hover:text-pink-600 transition-colors">
                                                Clear cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div >
        </>
    );
};

export default ShoppingCart;