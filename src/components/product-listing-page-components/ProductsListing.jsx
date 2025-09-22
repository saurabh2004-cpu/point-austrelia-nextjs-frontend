"use client"

import { useState } from "react"
import ProductPopup from "../product-details-components/Popup"
import Image from "next/image"

// Mock ProductPopup component since it's imported but not provided


const ProductListing = () => {
    const [sortBy, setSortBy] = useState("Low to High")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [perpageItrems, setPerpageItrems] = useState('12 Per Page')

    const categories = [
        { name: "New Arrivals", count: 200 },
        { name: "On Sale", count: 90 },
        { name: "Adblue", count: 50 },
        { name: "Armor All", count: 50 },
        { name: "Bars Bugs", count: 20, active: true },
        { name: "Bars Looks", count: 20 },
        { name: "Chemtech", count: 20 },
        { name: "New Arrivals", count: 200 },
        { name: "On Sale", count: 90 },
        { name: "Adblue", count: 50 },
        { name: "Armor All", count: 50 },
        { name: "Bars Bugs", count: 20 },
        { name: "Bars Looks", count: 20 },
        { name: "Chemtech", count: 20 },
    ]

    const products = [
        {
            id: 1,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: "New",
            badgeColor: "bg-[#fc5732]",
            badgeBackGround: '/product-listing-images/badge-bg-1.png',
            price: "4.48",
            quantity: 2,
            cartQuantity: 2
        },
        {
            id: 2,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: null,
            price: "4.48",
            quantity: 1,
            cartQuantity: 1
        },
        {
            id: 3,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: null,
            price: "4.48",
            quantity: 3,
            cartQuantity: 2
        },
        {
            id: 4,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: null,
            price: "4.48",
            quantity: 1,
            cartQuantity: 1
        },
        {
            id: 5,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: "Sale",
            badgeColor: "bg-[#fc5732]",
            price: "4.48",
            quantity: 2,
            cartQuantity: 2
        },
        {
            id: 6,
            name: "BARS BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU JB375",
            image: "/product-listing-images/product-1.png",
            badge: "Sale",
            badgeColor: "bg-[#fc5732]",
            price: "4.48",
            quantity: 1,
            cartQuantity: 3
        },
    ]

    const handleProductClick = (product) => {
        setSelectedProduct(product)
        setShowProductPopup(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            {/* Breadcrumb */}
            <div className="bg-white justify-items-center pt-4">
                <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span>Home</span>
                        <span className="mx-1 sm:mx-2">/</span>
                        <span className="hidden sm:inline">Matador Wholesale</span>
                        <span className="mx-1 sm:mx-2 hidden sm:inline">/</span>
                        <span className="text-xs sm:text-sm lg:text-[1.2rem] text-black font-[400] font-spartan">Bars Bugs</span>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white justify-items-center">
                <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 justify-items-center">
                    <h1 className="text-lg sm:text-xl lg:text-[1.2rem] text-black font-[400] font-spartan pb-3 sm:pb-5">Bars Bugs</h1>
                    <p className="text-sm sm:text-base lg:text-[1rem] text-black font-[400] font-spartan max-w-8xl px-2 sm:px-0">
                        Bars Bugs is a range of insect repellent products including sprays, coils, and diffusers that are designed to keep bugs away both indoors and outdoors.
                    </p>
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-y-8">
                    {/* Mobile Filter Toggle Button */}
                    <div className="lg:hidden ">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full bg-white p-3 rounded-lg border flex items-center justify-between text-black font-spartan"
                        >
                            <span className="text-sm font-[400]">Categories</span>
                            <svg
                                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Sidebar Filter */}
                    <div className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white  min-h-screen border-r-0 lg:border-r-1 border-black rounded-lg lg:rounded-none">
                            <div>
                                <h4 className="text-lg sm:text-xl lg:text-[1.3rem] text-black font-[400] px-2 pb-2 lg:pb-4 lg:pt-2 font-spartan">Product Categories</h4>
                                <div className="space-y-2 max-h-64 lg:max-h-none  overflow-y-auto hide-scrollbar">
                                    {categories.map((category, index) => (
                                        <div
                                            key={index}
                                            className={`flex space-x-2 items-center py-1 px-2 rounded cursor-pointer transition-colors text-sm lg:text-[16px] font-[400] font-spartan ${category.active ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}
                                        >
                                            <span className={`text-xs sm:text-sm lg:text-[16px] font-[400] font-spartan ${category.active ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}>{category.name}</span>
                                            <span className="text-xs sm:text-sm">({category.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Products Header */}
                        <div className="bg-white rounded-lg pb-3 lg:pb-4 mb-4 lg:mb-0 ">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                                <h2 className="text-lg lg:text-[1.2rem] font-[400] text-black">
                                    Products <span className="text-[#000000]/60">(6)</span>
                                </h2>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 w-full sm:w-auto">

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {/* <span className="text-xs sm:text-sm text-black font-[400] font-spartan whitespace-nowrap">Sort by</span> */}
                                        <select
                                            value={perpageItrems}
                                            onChange={(e) => setPerpageItrems(e.target.value)}
                                            className="border border-gray-300 rounded px-2 lg:px-6 py-1 lg:py-2 rounded-md text-xs sm:text-sm text-black font-[400] font-spartan focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-initial"
                                        >
                                            <option>12 Per Page</option>
                                            <option>16 Per Page</option>
                                            <option>20 Per Page</option>
                                            <option>24 Per Page</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {/* <span className="text-xs sm:text-sm text-black font-[400] font-spartan whitespace-nowrap">Sort by</span> */}
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border border-gray-300 rounded px-2 lg:px-6 py-1 lg:py-2 rounded-md text-xs sm:text-sm text-black font-[400] font-spartan focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-initial"
                                        >
                                            <option>Low to High</option>
                                            <option>High to Low</option>
                                            <option>Name A-Z</option>
                                            <option>Name Z-A</option>
                                        </select>
                                    </div>


                                    <div className="flex border border-gray-300 rounded-md ">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-1 lg:p-2 border-r border-r-[2px] ${viewMode === "grid" ? "text-[#2e2f7f]/30" : "text-gray-600"}`}
                                        >
                                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-1 lg:p-2 ${viewMode === "list" ? "text-[#2e2f7f]/30" : "text-gray-600"}`}
                                        >
                                            <svg className="w-4 h-4 lg:w-5 lg:h-5" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                                                <rect x="10" y="10" width="20" height="20" rx="3" />
                                                <rect x="40" y="10" width="20" height="20" rx="3" />
                                                <rect x="70" y="10" width="20" height="20" rx="3" />
                                                <rect x="10" y="40" width="20" height="20" rx="3" />
                                                <rect x="40" y="40" width="20" height="20" rx="3" />
                                                <rect x="70" y="40" width="20" height="20" rx="3" />
                                                <rect x="10" y="70" width="20" height="20" rx="3" />
                                                <rect x="40" y="70" width="20" height="20" rx="3" />
                                                <rect x="70" y="70" width="20" height="20" rx="3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-h-screen overflow-y-auto hide-scrollbar border-t-2 border-[#2D2C70]">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm sm:max-w-none "
                                    onClick={() => handleProductClick(product)}
                                >
                                    {/* Sale Badge */}
                                    {product.badge === 'Sale' && (
                                        <div className={`absolute top-2 left-4 sm:left-6 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-full z-10`}>
                                            {product.badge}
                                        </div>
                                    )}

                                    {/* New Badge with Background */}
                                    {product.badgeBackGround && product.badge === 'New' && (
                                        <>
                                            <img
                                                src={product.badgeBackGround || "/placeholder.svg"}
                                                height={60}
                                                width={60}
                                                className="absolute top-2 left-4 sm:left-6 sm:w-20 sm:h-20"
                                                alt="Badge background"
                                            />
                                            <p className="absolute top-6 sm:top-8 z-20 left-7 sm:left-10 text-white text-[10px] sm:text-sm font-[400] px-2 py-1 rounded-full">
                                                {product.badge}
                                            </p>
                                        </>
                                    )}

                                    {/* Simple New Badge (Red Star-burst style) */}
                                    {product.badge === 'New' && !product.badgeBackGround && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className="relative">
                                                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                                                    New
                                                </div>
                                                {/* Star-burst effect */}
                                                <div className="absolute inset-0 bg-red-500 rounded-full transform scale-110 -z-10 opacity-30"></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Wishlist Icon */}
                                    <div className="absolute top-2 right-4 sm:right-6 z-10">
                                        <button
                                            className=" rounded-full  hover:bg-gray-200 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering product popup
                                                // Handle wishlist logic here
                                            }}
                                        >
                                            <div className="h-8 w-8 bg-[#D9D9D940] flex items-center justify-center rounded-full  transition-colors cursor-pointer">
                                                <Image
                                                    src="/product-details/heart-1.png"
                                                    alt="Heart"
                                                    width={12}
                                                    height={12}
                                                    className=""
                                                />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Product Image */}
                                    <div className="flex justify-center mb-3 sm:mb-4 ">
                                        <img
                                            src={product.image || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-24 h-32 sm:w-28 sm:h-36 lg:w-32 lg:h-40 object-contain"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="text-start space-y-2">
                                        {/* Product Name */}
                                        <h3 className="text-sm sm:text-base lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase">
                                            {product.name}
                                        </h3>

                                        {/* SKU */}
                                        <div className="space-y-1 flex space-x-9 items-center">
                                            <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                                {product.sku}
                                            </p>

                                            {/* Stock Status */}
                                            <div className="flex items-center space-x-2 bg-green-100 px-2">
                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-[11px] font-semibold font-spartan text-black   py-1 rounded">
                                                    IN STOCK
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="">
                                            <span className="text-2xl md:text-[20px] font-semibold text-[#e9098d]">
                                                ${product.price}
                                            </span>
                                        </div>

                                        {/* Units Dropdown */}
                                        <div className="mb-3 flex space-x-8 align-center items-center font-spartan">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                                            <select
                                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                onClick={(e) => e.stopPropagation()} // Prevent triggering product popup
                                            >
                                                <option value="each">Each</option>
                                                <option value="pack">Pack</option>
                                                <option value="box">Box</option>
                                            </select>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="mb-2 space-x-8 flex align-center items-center font-spartan">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering product popup
                                                        // Handle quantity decrease
                                                    }}
                                                >
                                                    <span className="text-xl font-bold flex items-center mt-1">−</span>
                                                </button>
                                                <span className="text-[1rem] font-spartan font-medium min-w-[2rem] text-center">
                                                    {product.quantity}
                                                </span>
                                                <button
                                                    className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering product popup
                                                        // Handle quantity increase
                                                    }}
                                                >
                                                    <span className="text-lg font-bold  mt-1">+</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <div className="flex items-center space-x-3">
                                            <button className="flex-1 text-[15px] font-semibold border border-[#E9098D] rounded-lg text-black py-2 px-6 rounded transition-colors">
                                                <Image
                                                    src="/product-details/cart-logo-2.png"
                                                    alt="Shopping Bag"
                                                    width={20}
                                                    height={20}
                                                    className="inline-block mr-2"
                                                />

                                                Add to Cart
                                            </button>
                                            {/* <div className="h-12 w-12 bg-[#D9D9D940] flex items-center justify-center rounded-full  transition-colors cursor-pointer">
                                                <Image
                                                    src="/product-details/heart-1.png"
                                                    alt="Heart"
                                                    width={20}
                                                    height={20}
                                                    className="w-5 h-5"
                                                />
                                            </div> */}
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="flex space-x-2 mt-1">
                                            <button
                                                className="flex-1 border-2 border-[#46bcf9] text-[#68b73b] rounded-lg py-1 px-3 text-sm font-medium  transition-colors flex items-center justify-center space-x-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>Added</span>
                                            </button>
                                            <div className="w-px bg-black"></div>
                                            <button
                                                className="flex-1  border-2 border-[#2d2c70]  text-pink-700 rounded-lg py-1 px-3 text-sm font-medium transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Update
                                            </button>
                                        </div>

                                        {/* Cart Quantity Info */}
                                        <div className="mt-2 text-sm font-semibold text-[#000000]/80 font-spartan">
                                            In Cart Quantity: <span className="font-medium">{product.cartQuantity} (Each)</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ProductPopup
                isOpen={showProductPopup}
                onClose={() => setShowProductPopup(false)}
                product={selectedProduct}
            />
        </div>
    )
}

export default ProductListing