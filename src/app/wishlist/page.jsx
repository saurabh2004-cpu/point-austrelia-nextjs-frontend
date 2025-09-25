'use client'


import React, { useState } from 'react';
import { Heart, ShoppingCart, Share2, Minus, Plus, Check } from 'lucide-react';
import Image from 'next/image';

const page = () => {
    const [products] = useState([
        {
            id: 1,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        },
        {
            id: 2,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        },
        {
            id: 3,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        },
        {
            id: 4,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        },
        {
            id: 5,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        },
        {
            id: 6,
            name: 'BARS BUGS WINDSCREEN CLEAN 375ML',
            sku: 'BB375',
            price: 4.48,
            unit: 'Units',
            packSize: 12,
            amount: 4.48,
            inStock: true,
            image: '/product-listing-images/product-1.avif'
        }
    ]);

    const [quantities, setQuantities] = useState(
        products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
    );

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 1) {
            setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
        }
    };

    const ProductCard = ({ product }) => (
        <div className="bg-white border  border-gray-200 rounded-lg shadow-sm p-4 font-spartan  xl:h-[312px] xl:w-[622px] "
        // style={{ height: '312px', width: '622px', minWidth: '622px' }}
        >
            <div className="flex flex-col xl:flex-row h-full gap-7 mt-4 ">
                {/* Product Image */}
                <div className="flex-shrink-0 mr-4 ">
                    <div className="xl:w-39 h-full rounded-lg flex items-center justify-center align-middle relative">
                        <img src={product.image} alt={product.name} className="object-contain h-[156px] w-[156px]" />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2 max-w-[270px] mx-auto xl:mx-0">
                    <h3 className="text-[15px] font-semibold line-clamp-2 mb-2">
                        {product.name}
                    </h3>
                    <div className="flex products-center space-x-30 mb-2 justify-between align-middle ">
                        <span className=" font-medium text-[13px]">
                            SKU: {product.sku}
                        </span>
                        {product.inStock && (
                            <div className="flex items-center text-[14px] font-medium text-black p-1 font-semibold  text-[11px] bg-[#E7FAEF]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                IN STOCK
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="text-[#46BCF9] font-semibold text-[24px]">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className='flex items-center justify-between'>

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

                        <div className="flex items-start space-x-2 space-y-2 flex-col justify-between">
                            <span className="text-[13px] font-medium  ">Quantity</span>
                            <div className="flex items-center  rounded-lg">
                                <button
                                    onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                    className="p-1 bg-black rounded-md  px-2 py-[5px] transition-colors"
                                    disabled={product.quantity <= 1}
                                >
                                    <Minus className="w-3 h-3 text-white" />
                                </button>
                                <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                                    {/* {product.quantity} */}
                                    2
                                </span>
                                <button
                                    onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                    className="p-1 bg-black rounded-md py-[5px] px-2 transition-colors"
                                >
                                    <Plus className="w-3 h-3 text-white " />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='text-[16px] font-semibold mt-4 gap-2 flex'>
                        <span>
                            Amount:
                        </span>
                        <span className="text-[#46BCF9] text-[18px]">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className='flex text-[13px] font-semibold justify-between w-full'>
                        <button className="text-[13px] font-semibold bg-[#2D2C70] text-white rounded-lg py-1 px-6">
                            Update
                        </button>
                        <button className=" flex py-2 gap-2 text-[13px] text-[#2D2C70] font-semibold border border-[#2D2C70]  rounded-lg py-1 px-3">
                            <svg
                                className="w-5 h-5 transition-colors duration-300 group-hover:fill-[#E9098D]"
                                viewBox="0 0 21 21"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                            </svg>

                            Add to Cart
                        </button>

                        <div className='h-9 w-9 border border-[#E9098D] rounded-full flex items-center justify-center '>
                            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen p-4 pb-16 font-spartan ">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-[24px] font-semibold ">
                        Wishlist <span className="text-[20px] font-semibold text-[#2D2C70]" style={{ color: '#2D2C70' }}>(32 Products, 43 Items)</span>
                    </h1>
                    <div className="w-full h-[2px] bg-[#2D2C70] mt-2"></div>
                </div>

                {/* Product Grid */}
                <div className="grid gap-6 ">
                    {/* Large screens: 2 cards per row */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:ml-18 xl:ml-0  ">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Medium and smaller screens: 1 card per row with horizontal scroll */}
                    <div className="md:hidden  ">
                        {products.map((product) => (
                            <div key={product.id} className="mb-6 overflow-x-auto ">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;