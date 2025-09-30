"use client"

import { use, useEffect, useState } from "react"
import ProductPopup from "../product-details-components/Popup"
import Image from "next/image"
import { Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/axios/axiosInstance"

const ProductListing = () => {
    const [sortBy, setSortBy] = useState("Best Seller")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [perpageItems, setPerpageItems] = useState('12')
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [error, setError] = useState(null)
    const [productQuantities, setProductQuantities] = useState({})
    const [selectedUnits, setSelectedUnits] = useState({})

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [loading, setLoading] = useState(false)

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

    const handleProductClick = (product) => {
        router.push(`/product-details`);
    }

    const handleProductImageClick = (product) => {
        setSelectedProduct(product)
        setShowProductPopup(true)
    }

    const handleQuantityChange = (productId, change) => {
        setProductQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + change)
        }))
    }

    const handleUnitChange = (productId, unitId) => {
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: unitId
        }))
    }

    // Map sort options to backend parameters
    const getSortParams = (sortOption) => {
        switch (sortOption) {
            case "Price Low to High":
                return { sortBy: "eachPrice", sortOrder: "asc" }
            case "Price High to Low":
                return { sortBy: "eachPrice", sortOrder: "desc" }
            case "Newest":
                return { sortBy: "createdAt", sortOrder: "desc" }
            case "Best Seller":
            default:
                return { sortBy: "bestSeller", sortOrder: "desc" }
        }
    }

    // Fetch products with pagination and sorting
    const fetchProducts = async (page = currentPage, itemsPerPage = perpageItems, sortOption = sortBy) => {
        try {
            setLoading(true)
            const sortParams = getSortParams(sortOption)

            const response = await axiosInstance.get('products/get-all-products', {
                params: {
                    page: page,
                    limit: itemsPerPage,
                    sortBy: sortParams.sortBy,
                    sortOrder: sortParams.sortOrder
                }
            })

            if (response.data.statusCode === 200) {
                const productsData = response.data.data.products
                const paginationInfo = response.data.data.pagination

                setProducts(productsData)
                setCurrentPage(paginationInfo.currentPage)
                setTotalPages(paginationInfo.totalPages)
                setTotalProducts(paginationInfo.totalProducts)

                // Initialize quantities and selected units
                const initialQuantities = {}
                const initialUnits = {}
                productsData.forEach(product => {
                    initialQuantities[product._id] = 1
                    if (product.typesOfPacks && product.typesOfPacks.length > 0) {
                        initialUnits[product._id] = product.typesOfPacks[0]._id
                    }
                })
                setProductQuantities(initialQuantities)
                setSelectedUnits(initialUnits)
            } else {
                setError(response.data.message)
            }

        } catch (error) {
            console.error('Error fetching products:', error)
            setError('An error occurred while fetching products')
        } finally {
            setLoading(false)
        }
    }

    // Handle sort change
    const handleSortChange = (e) => {
        const newSortBy = e.target.value
        setSortBy(newSortBy)
        fetchProducts(1, perpageItems, newSortBy)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newPerPage = e.target.value
        setPerpageItems(newPerPage)
        fetchProducts(1, newPerPage, sortBy)
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchProducts(page, perpageItems, sortBy)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = []
        const maxVisibleButtons = 5

        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1)
        }

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-50'
                    }`}
            >
                Previous
            </button>
        )

        // First page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 rounded-lg border bg-white text-black hover:bg-gray-50"
                >
                    1
                </button>
            )
            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis1" className="px-2 py-2">
                        ...
                    </span>
                )
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-lg border ${currentPage === i
                        ? 'bg-[#2D2C70] text-white'
                        : 'bg-white text-black hover:bg-gray-50'
                        }`}
                >
                    {i}
                </button>
            )
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="ellipsis2" className="px-2 py-2">
                        ...
                    </span>
                )
            }
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 rounded-lg border bg-white text-black hover:bg-gray-50"
                >
                    {totalPages}
                </button>
            )
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-50'
                    }`}
            >
                Next
            </button>
        )

        return buttons
    }

    return (
        <div className="min-h-screen  ">
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
                        <div className="bg-white  xl:min-h-screen border-r-0 lg:border-r-1 border-black rounded-lg lg:rounded-none">
                            <div>
                                <h4 className="text-lg sm:text-xl lg:text-[1.3rem] text-black font-[400] px-2 pb-2 lg:pb-4 lg:pt-2 font-spartan">Product Categories</h4>
                                <div className="space-y-2 max-h-64 lg:max-h-none  overflow-y-auto hide-scrollbar">
                                    {categories.map((category, index) => (
                                        <div
                                            key={index}
                                            className={`flex space-x-2 items-center py-1 px-2 hover:text-[#e9098d]/70 rounded cursor-pointer transition-colors text-sm lg:text-[16px] font-[400] font-spartan ${category.active ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}
                                        >
                                            <span className={`text-xs sm:text-sm lg:text-[16px] font-medium font-spartan hover:text-[#e9098d]/50 ${category.active ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}>{category.name}</span>
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
                                    Products <span className="text-[#000000]/60">({totalProducts})</span>
                                </h2>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-[27px] w-full sm:w-auto">

                                    <div className="flex items-center gap-2 w-full ">
                                        <div className="relative inline-block   ">
                                            <select
                                                value={perpageItems}
                                                onChange={handleItemsPerPageChange}
                                                className="border border-gray-300 rounded pl-3 py-1 lg:py-1 rounded-[10px] 
                                                            text-xs sm:text-sm text-black font-[400] font-spartan 
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                            appearance-none  w-[135px]"
                                            >
                                                <option value="12" className="text-[15px] font-medium">12 Per Page</option>
                                                <option value="16" className="text-[15px] font-medium">16 Per Page</option>
                                                <option value="20" className="text-[15px] font-medium">20 Per Page</option>
                                                <option value="24" className="text-[15px] font-medium">24 Per Page</option>
                                            </select>

                                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
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

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                                        {/* Sort Dropdown */}
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative inline-block w-full sm:w-auto">
                                                <select
                                                    value={sortBy}
                                                    onChange={handleSortChange}
                                                    className="border border-gray-300 rounded pl-3 pr-8 py-2 sm:py-1 lg:py-1 rounded-[10px] 
                                                                text-sm sm:text-xs md:text-sm text-black font-[400] font-spartan 
                                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                                appearance-none w-full sm:w-[132px] md:w-[140px] lg:w-[132px]"
                                                >
                                                    <option value="Best Seller" className="text-sm sm:text-[15px] font-medium">Best Seller</option>
                                                    <option value="Price Low to High" className="text-sm sm:text-[15px] font-medium">Price Low to High</option>
                                                    <option value="Price High to Low" className="text-sm sm:text-[15px] font-medium">Price High to Low</option>
                                                    <option value="Newest" className="text-sm sm:text-[15px] font-medium">Newest</option>
                                                </select>

                                                <div className="pointer-events-none absolute inset-y-0 right-2 sm:right-3 flex items-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 sm:w-4 sm:h-4"
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

                                        {/* View Mode Toggle */}
                                        <div className="flex border border-gray-300 px-2 sm:px-3 rounded-md justify-between w-full sm:w-auto sm:min-w-[80px] md:min-w-[90px]">
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`p-2 sm:p-1 lg:px-2 border-r border-r-[2px] flex items-center justify-center w-full sm:w-auto align-middle transition-colors duration-200 ${viewMode === "grid" ? "text-[#2e2f7f]/30" : "text-gray-600 hover:text-[#2e2f7f]"}`}
                                            >
                                                <svg
                                                    className="w-5 h-5 sm:w-[18px] sm:h-[16px] md:w-[20px] md:h-[18px]"
                                                    fill="#2E2F7F"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`p-2 sm:p-1 lg:p-2 flex items-center justify-center w-full sm:w-auto transition-colors duration-200 ${viewMode === "list" ? "text-[#2e2f7f]/30" : "text-gray-600 hover:text-[#2e2f7f]"}`}
                                            >
                                                <svg
                                                    className="w-5 h-4 sm:w-[18px] sm:h-[12px] md:w-[20px] md:h-[13px]"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="100"
                                                    height="100"
                                                    viewBox="0 0 100 100"
                                                    fill="#2E2F7F80"
                                                >
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
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-12 max-h-full  border-t-2 border-[#2D2C70] pt-16">
                                    {products.map((product, index) => (
                                        <div
                                            key={product._id}
                                            className=" rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm sm:max-w-none "
                                        >
                                            {/* Wishlist Icon */}
                                            <div className="absolute top-2 right-4 sm:right-6 z-10">
                                                <button
                                                    className=" rounded-full   transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <div className="h-8 w-8 bg-[#D9D9D940]  flex mt-3 items-center justify-center rounded-full  transition-colors cursor-pointer">
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
                                            <div className="flex justify-center mb-3 sm:mb-4 rounded-lg ">
                                                <img
                                                    src={product.images || "/placeholder.svg"}
                                                    alt={product.ProductName}
                                                    className="w-24 h-32 sm:w-28 sm:h-36 lg:w-32 lg:h-40 object-contain"
                                                    onClick={() => handleProductImageClick(product._id)}
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="text-start space-y-2 lg:max-w-[229px]">
                                                {/* Product Name */}
                                                <h3
                                                    onClick={() => handleProductClick(product)}
                                                    className="text-sm sm:text-base hover:text-[#E9098D]  lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase">
                                                    {product.ProductName}
                                                </h3>

                                                {/* SKU */}
                                                <div className="space-y-1 flex justify-between items-center">
                                                    <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                                        SKU {product.sku}
                                                    </p>

                                                    {/* Stock Status */}
                                                    <div className="flex items-center space-x-2 bg-[#E7FAEF]  px-2">
                                                        <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-[14px] font-semibold font-spartan text-black   py-1 rounded">
                                                            {product.stockLevel > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="">
                                                    <span className="text-2xl md:text-[24px] font-semibold text-[#e9098d]">
                                                        ${product.eachPrice ? product.eachPrice.toFixed(2) : '0.00'}
                                                    </span>
                                                </div>

                                                {/* Units Dropdown */}
                                                <div className="mb-3 flex space-x-12 align-center items-center font-spartan">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                                                    <div className="relative w-full">
                                                        <select
                                                            value={selectedUnits[product._id] || ''}
                                                            onChange={(e) => handleUnitChange(product._id, e.target.value)}
                                                            className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                                            focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                                            appearance-none"
                                                        >
                                                            {product.typesOfPacks && product.typesOfPacks.length > 0 ? (
                                                                product.typesOfPacks.map((pack) => (
                                                                    <option key={pack._id} value={pack._id}>
                                                                        {pack.name}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="">No packs available</option>
                                                            )}
                                                        </select>

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
                                                                e.stopPropagation();
                                                                handleQuantityChange(product._id, -1);
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
                                                            {productQuantities[product._id] || 1}
                                                        </span>
                                                        <button
                                                            className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuantityChange(product._id, 1);
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
                                                    <button className="flex items-center justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#2D2C70] rounded-lg text-[#2D2C70] py-2 px-6 transition-colors duration-300 group hover:text-[#E9098D] hover:border-[#E9098D]">
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
                                                <div className="mt-2 text-sm font-semibold text-[#000000]/80 font-spartan hover:text-[#E9098D]">
                                                    In Cart Quantity: <span className="font-medium">0 (Each)</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
                                        {renderPaginationButtons()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ProductPopup
                isOpen={showProductPopup}
                onClose={() => setShowProductPopup(false)}
                productId={selectedProduct}
            />
        </div>
    )
}

export default ProductListing