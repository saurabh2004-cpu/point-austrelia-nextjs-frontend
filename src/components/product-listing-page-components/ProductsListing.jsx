"use client"

import { useState } from "react"
import ProductPopup from "../product-details-components/Popup"
import Image from "next/image"
import { Minus, Plus } from "lucide-react"

// Mock ProductPopup component since it's imported but not provided


const ProductListing = () => {
    const [sortBy, setSortBy] = useState("Best Seller")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [perpageItrems, setPerpageItrems] = useState('12 Per Page')
    const [producTQuantity, setProductQuantity] = useState(0)

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
                                            <span className={`text-xs sm:text-sm lg:text-[16px] font-medium font-spartan ${category.active ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}>{category.name}</span>
                                            <span className="">({category.count})</span>
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

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-[27px] w-full sm:w-auto">

                                    <div className="flex items-center gap-2 w-full ">
                                        {/* <span className="text-xs sm:text-sm text-black font-[400] font-spartan whitespace-nowrap">Sort by</span> */}
                                        <div className="relative inline-block   ">
                                            <select
                                                value={perpageItrems}
                                                onChange={(e) => setPerpageItrems(e.target.value)}
                                                className="border border-gray-300 rounded pl-3 py-1 lg:py-1 rounded-[10px] 
                                                            text-xs sm:text-sm text-black font-[400] font-spartan 
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                            appearance-none  w-[135px]"
                                            >
                                                <option className="text-[15px] font-medium">12 Per Page</option>
                                                <option className="text-[15px] font-medium">16 Per Page</option>
                                                <option className="text-[15px] font-medium">20 Per Page</option>
                                                <option className="text-[15px] font-medium">24 Per Page</option>
                                            </select>

                                            {/* Custom Arrow (Lucide React or SVG) */}
                                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                {/* Lucide Icon Example */}
                                                {/* import { ChevronDown } from "lucide-react"; */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4 "
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {/* <span className="text-xs sm:text-sm text-black font-[400] font-spartan whitespace-nowrap">Sort by</span> */}
                                        <div className="relative inline-block  ">
                                            <select
                                                value={perpageItrems}
                                                onChange={(e) => setPerpageItrems(e.target.value)}
                                                className="border border-gray-300 rounded pl-3  py-1 lg:py-1 rounded-[10px] 
                                                            text-xs sm:text-sm text-black font-[400] font-spartan 
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                            appearance-none w-[132px]"
                                            >
                                                <option className="text-[15px] font-medium">Best Seller</option>
                                                <option className="text-[15px] font-medium">16 Per Page</option>
                                                <option className="text-[15px] font-medium">20 Per Page</option>
                                                <option className="text-[15px] font-medium">24 Per Page</option>
                                            </select>

                                            {/* Custom Arrow (Lucide React or SVG) */}
                                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                {/* Lucide Icon Example */}
                                                {/* import { ChevronDown } from "lucide-react"; */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4 "
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex border border-gray-300  px-3 rounded-md justify-between ">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-1 lg:px-2 border-r border-r-[2px] flex items-center justify-start w-full align-middle ${viewMode === "grid" ? "text-[#2e2f7f]/30" : "text-gray-600"}`}
                                        >
                                            <svg className=" relative right-3 w-[20px] h-[18px] " fill="#2E2F7F" viewBox="0 0 20 20">
                                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-1 lg:p-2 ${viewMode === "list" ? "text-[#2e2f7f]/30" : "text-gray-600"}`}
                                        >
                                            <svg className=" w-[20px] h-[13px] relative left-3" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="#2E2F7F80">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-12 max-h-full  border-t-2 border-[#2D2C70] pt-16">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm sm:max-w-none "

                                >


                                    {/* New Badge with Background */}
                                    {product.badgeBackGround && product.badge && (
                                        <>
                                            <img
                                                src={product.badgeBackGround || "/placeholder.svg"}
                                                height={60}
                                                width={60}
                                                className="absolute top-0 left-4 sm:left-0 sm:w-20 sm:h-20"
                                                alt="Badge background"
                                                

                                            />
                                            <p className="absolute top-6 sm:top-[24px] z-20 left-[25px] sm:left-[17px]  text-white text-[10px] sm:text-sm font-semibold px-2 py-1 rounded-full">
                                                {product.badge}
                                            </p>
                                        </>
                                    )}



                                    {/* Wishlist Icon */}
                                    <div className="absolute top-2 right-4 sm:right-6 z-10">
                                        <button
                                            className=" rounded-full   transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering product popup
                                                // Handle wishlist logic here
                                            }}
                                        >
                                            <div className="h-8 w-8 bg-[#D9D9D940] hover:bg-gray-200 flex mt-3 items-center justify-center rounded-full  transition-colors cursor-pointer">
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
                                    <div className="flex justify-center mb-3 sm:mb-4 bg-[#FAFAFA] ">
                                        <img
                                            src={product.image || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-24 h-32 sm:w-28 sm:h-36 lg:w-32 lg:h-40 object-contain"
                                            onClick={() => handleProductClick(product)}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="text-start space-y-2 lg:max-w-[229px]">
                                        {/* Product Name */}
                                        <h3 className="text-sm sm:text-base lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase">
                                            {product.name}
                                        </h3>

                                        {/* SKU */}
                                        <div className="space-y-1 flex justify-between items-center">
                                            <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                                {product.sku}
                                            </p>

                                            {/* Stock Status */}
                                            <div className="flex items-center space-x-2 bg-[#E7FAEF]  px-2">
                                                <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-[14px] font-semibold font-spartan text-black   py-1 rounded">
                                                    IN STOCK
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="">
                                            <span className="text-2xl md:text-[24px] font-semibold text-[#e9098d]">
                                                ${product.price}
                                            </span>
                                        </div>

                                        {/* Units Dropdown */}
                                        <div className="mb-3 flex space-x-12 align-center items-center font-spartan">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                                            <div className="relative w-full">
                                                <select
                                                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                                    focus:outline-none focus:ring-2 focus:ring-[#2d2c70] focus:border-[#2d2c70] 
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

                                        {/* Quantity Controls */}
                                        <div className="mb-2 space-x-[26.5px] flex align-center items-center font-spartan">
                                            <label className="block text-sm font-medium text-gray-700 ">Quantity</label>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    className="w-[32px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering product popup
                                                        setProductQuantity(product.quantity - 1);
                                                    }}
                                                >
                                                    <span className="text-xl font-bold flex items-center ">
                                                        <Image src="/icons/minus-icon.png"
                                                            alt="Minus"
                                                            width={12}
                                                            height={12}
                                                        />
                                                    </span>
                                                </button>
                                                <span className="text-[1rem] font-spartan font-medium min-w-[2rem] text-center">
                                                    {product.quantity}
                                                </span>
                                                <button
                                                    className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProductQuantity(product.quantity + 1);
                                                    }}
                                                >
                                                    <Image src="/icons/plus-icon.png"
                                                        alt="Plus"
                                                        width={12}
                                                        height={12}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <div className="flex items-center space-x-3">
                                            <button className="flex-1 text-[15px] font-semibold border border-[#2D2C70] rounded-lg text-[#2D2C70] py-2 px-6 rounded transition-colors">
                                                <Image
                                                    src="/icons/cart-image.png"
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
                                                className="flex-1 space-x-[6px] border-1 border-[#46bcf9] text-[#68b73b] rounded-lg py-1 px-3 text-sm font-medium  transition-colors flex items-center justify-center space-x-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span>Added</span>
                                                <svg className="w-5 h-5 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <div className="w-px bg-black h-[20px] mt-2"></div>
                                            <button
                                                className="flex-1  border-1 border-[#2D2C70]  text-pink-700 rounded-lg py-1 px-3 text-sm font-medium transition-colors"
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