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
            image: '/product-listing-images/product-1.png'
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
            image: '/product-listing-images/product-1.png'
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
            image: '/product-listing-images/product-1.png'
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
            image: '/product-listing-images/product-1.png'
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
            image: '/product-listing-images/product-1.png'
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
            image: '/product-listing-images/product-1.png'
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 font-spartan lg:h-[312px] lg:w-[622px] "
            // style={{ height: '312px', width: '622px', minWidth: '622px' }}
            >
            <div className="flex flex-col lg:flex-row h-full gap-7 mt-4">
                {/* Product Image */}
                <div className="flex-shrink-0 mr-4 ">
                    <div className="xl:w-39 h-full rounded-lg flex items-center justify-center align-middle relative">
                        <img src={product.image} alt={product.name} className="object-contain h-[156px] w-[156px]" />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2 max-w-[270px] ">
                    <h3 className="text-[15px] font-semibold line-clamp-2 mb-2">
                        {product.name}
                    </h3>
                    <div className="flex products-center space-x-30 mb-2 justify-between align-middle ">
                        <span className=" font-medium text-[13px]">
                            SKU: {product.sku}
                        </span>
                        {product.inStock && (
                            <div className="flex items-center text-[10px] font-medium text-black p-1 font-semibold  text-[11px] bg-[#E7FAEF]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                IN STOCK
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="text-[#E9098D] font-semibold text-[24px]">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className='flex items-center justify-between'>

                        <div className="flex items-center space-x-2 flex-col items-start space-x-2 space-y-2 ">
                            <span className="text-[13px] font-medium ">Units</span>
                            <select className="border rounded-lg border-gray-300 rounded px-6 py-2 text-sm bg-white">
                                <option value="Each">{product.unit}</option>
                            </select>
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

                    <div className='text-[13px] font-semibold mt-4'>
                        <span>
                            Amount:
                        </span>
                        <span className="text-[#46BCF9] ">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    <div className='flex text-[13px] font-semibold justify-between w-full'>
                        <button className="text-[13px] font-semibold bg-[#2D2C70] text-white rounded-lg py-1 px-6">
                            Update
                        </button>
                        <button className="text-[13px] text-[#2D2C70] font-semibold border border-[#2D2C70]  rounded-lg py-1 px-3">
                            <Image
                                src="/product-details/cart-logo-2.png"
                                alt="Shopping Bag"
                                width={20}
                                height={20}
                                className="inline-block mr-2"
                            />

                            Add to Cart
                        </button>

                        <button className="text-[13px] font-semibold text-white rounded-lg ">
                            <Image
                                src='/cart/delete-icon-1.png'
                                alt="Delete"
                                height={15}
                                width={15}
                                onClick={() => removeItem(item.id)}
                                className=""
                            />
                        </button>

                    </div>



                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen p-4 pb-16 font-spartan">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-[24px] font-semibold ">
                        Wishlist <span className="text-[20px] font-semibold text-[#2D2C70]" style={{ color: '#2D2C70' }}>(32 Products, 43 Items)</span>
                    </h1>
                    <div className="w-full h-[2px] bg-[#2D2C70] mt-2"></div>
                </div>

                {/* Product Grid */}
                <div className="grid gap-6">
                    {/* Large screens: 2 cards per row */}
                    <div className="hidden xl:grid xl:grid-cols-2 xl:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Medium and smaller screens: 1 card per row with horizontal scroll */}
                    <div className="xl:hidden">
                        {products.map((product) => (
                            <div key={product.id} className="mb-6 overflow-x-auto">
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