"use client"

import { useEffect, useState } from "react"
import ProductPopup from "../product-details-components/Popup"
import Image from "next/image"
import { Heart, HeartIcon, Minus, Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import axiosInstance from "@/axios/axiosInstance"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"

const ProductListing = () => {
    const [sortBy, setSortBy] = useState("Best Seller")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [perpageItems, setPerpageItems] = useState('12')
    const router = useRouter()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState([])
    const [error, setError] = useState(null)
    const [productQuantities, setProductQuantities] = useState({})
    const [selectedUnits, setSelectedUnits] = useState({})
    const currentUser = useUserStore((state) => state.user);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [stockErrors, setStockErrors] = useState({})
    const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
    const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])
    const [toggleWishlistIcon, setToggleWishlistIcon] = useState('')
    const [wishListItems, setWishlistItems] = useState([])
    const [loadingProducts, setLoadingProducts] = useState({})
    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const currentCartItems = useCartStore((state) => state.currentItems);
    const [selectedPackType, setSelectedPackType] = useState('')
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({})
    const [subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory] = useState({})

    const [hoveredCategory, setHoveredCategory] = useState(null)
    const [hoveredSubCategory, setHoveredSubCategory] = useState(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

    const {
        categoryId,
        subCategoryId,
        subCategoryTwoId,
        brandId,
        categorySlug,
        subCategorySlug,
        subCategoryTwoSlug,
        brandSlug,
        setFilters,
        clearFilters,
    } = useProductFiltersStore();

    // Categories state for sidebar
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    // Check if product is in wishlist
    const isProductInWishlist = (productId) => {


        return wishListItems.some(item => item.product?._id === productId)
    }

    // Calculate discounted price for a product
    const calculateDiscountedPrice = (product) => {
        if (!currentUser || !currentUser.customerId) {
            return product.eachPrice;
        }

        const originalPrice = product.eachPrice || 0;

        // Check for item-based discount first (higher priority)
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return originalPrice - discountAmount;
        }

        // Check for pricing group discount
        if (product.pricingGroup && product.pricingGroup._id) {
            const groupDiscount = customerGroupsDiscounts.find(
                discount =>
                    discount.pricingGroup &&
                    discount.pricingGroup._id === product.pricingGroup._id &&
                    discount.customerId === currentUser.customerId
            );

            if (groupDiscount) {
                const discountAmount = (originalPrice * groupDiscount.percentage) / 100;
                return originalPrice - discountAmount;
            }
        }

        return originalPrice;
    };

    // Get discount percentage for display
    const getDiscountPercentage = (product) => {
        if (!currentUser || !currentUser.customerId) {
            return null;
        }

        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            return itemDiscount.percentage;
        }

        if (product.pricingGroup && product.pricingGroup._id) {
            const groupDiscount = customerGroupsDiscounts.find(
                discount =>
                    discount.pricingGroup &&
                    discount.pricingGroup._id === product.pricingGroup._id &&
                    discount.customerId === currentUser.customerId
            );

            if (groupDiscount) {
                return groupDiscount.percentage;
            }
        }

        return null;
    };

    // Check if product has any discount
    const hasDiscount = (product) => {
        return getDiscountPercentage(product) !== null;
    };

    // Check if product is in cart
    const isProductInCart = (productId) => {
        return cartItems.some(item => item.product._id === productId)
    }

    // Get cart item for product
    const getCartItem = (productId) => {
        return cartItems.find(item => item.product._id === productId)
    }

    // Calculate total quantity based on pack quantity and units
    const calculateTotalQuantity = (productId) => {
        const product = products.find(p => p._id === productId)
        if (!product) return 0

        const selectedPack = product.typesOfPacks?.find(pack =>
            pack._id === selectedUnits[productId]
        )
        const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1
        const unitsQuantity = productQuantities[productId] || 1
        return packQuantity * unitsQuantity
    }

    // Check if requested quantity exceeds stock
    const checkStockLevel = (productId) => {
        const product = products.find(p => p._id === productId)
        if (!product) return { isValid: true }

        const totalRequestedQuantity = calculateTotalQuantity(productId)
        const cartItem = getCartItem(productId)
        const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0

        const newTotalQuantity = isProductInCart(productId)
            ? totalRequestedQuantity
            : totalRequestedQuantity + currentCartQuantity

        const isValid = newTotalQuantity <= product.stockLevel
        return {
            isValid,
            message: isValid ? null : `Exceeds available stock (${product.stockLevel})`,
            requestedQuantity: totalRequestedQuantity,
            currentStock: product.stockLevel
        }
    }

    const handleProductClick = (product) => {
        router.push(`/product-details`);
    }

    const handleProductImageClick = (product) => {
        setSelectedProduct(product)
        setShowProductPopup(true)
    }

    const handleQuantityChange = (productId, change) => {
        const currentQuantity = productQuantities[productId] || 1;
        const newQuantity = Math.max(1, currentQuantity + change);

        // Always allow decreasing quantity
        if (change < 0) {
            setProductQuantities(prev => ({
                ...prev,
                [productId]: newQuantity
            }));

            // Check if the new quantity is within stock limits
            const stockCheck = checkStockLevel(productId);
            if (stockCheck.isValid) {
                // Clear the warning if quantity is now within stock
                setStockErrors(prev => ({
                    ...prev,
                    [productId]: null
                }));
            } else {
                // Keep the warning but allow the decrease
                setStockErrors(prev => ({
                    ...prev,
                    [productId]: stockCheck.message
                }));
            }
            return;
        }

        // For increasing quantity, check stock
        const stockCheck = checkStockLevel(productId);
        if (!stockCheck.isValid) {
            setStockErrors(prev => ({
                ...prev,
                [productId]: stockCheck.message
            }));
            return;
        } else {
            // Clear the warning if increasing and it's within stock
            setStockErrors(prev => ({
                ...prev,
                [productId]: null
            }));
        }

        setProductQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }));
    }

    // Also update the handleUnitChange function to clear warnings when units change:
    const handleUnitChange = (productId, unitId, product) => {
        const selectedPack = product.typesOfPacks.find(pack => pack._id === unitId)
        setSelectedPackType(selectedPack.name)

        console.log("selected pack on unit change", selectedPack)
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: unitId
        }))

        const stockCheck = checkStockLevel(productId)
        if (!stockCheck.isValid) {
            setStockErrors(prev => ({
                ...prev,
                [productId]: stockCheck.message
            }))
        } else {
            // Clear warning if changing units brings quantity within stock
            setStockErrors(prev => ({
                ...prev,
                [productId]: null
            }))
        }
    }

    // Add to cart function
    const handleAddToCart = async (productId) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to add items to cart")
            return
        }

        setLoadingProducts(prev => ({ ...prev, [productId]: true }))

        try {
            const product = products.find(p => p._id === productId)
            if (!product) return

            const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnits[productId])
            const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1
            const unitsQuantity = productQuantities[productId] || 1
            const totalQuantity = packQuantity * unitsQuantity

            const stockCheck = checkStockLevel(productId)
            if (!stockCheck.isValid) {
                setError(stockCheck.message)
                return
            }

            const cartData = {
                customerId: currentUser._id,
                productId: productId,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                packType: selectedPack ? selectedPack.name : 'Each'
            }

            const response = await axiosInstance.post('cart/add-to-cart', cartData)

            if (response.data.statusCode === 200) {
                await fetchCustomersCart()
                setCartItemsCount(response.data.data.cartItems.length);
                setError(null)
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
        } finally {
            setLoadingProducts(prev => ({ ...prev, [productId]: false }))
        }
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

    // Fetch products with filters
    const fetchProducts = async (page = currentPage, itemsPerPage = perpageItems, sortOption = sortBy) => {
        try {
            setLoading(true)
            const sortParams = getSortParams(sortOption)

            // Build query parameters based on URL params
            const queryParams = {
                page: page,
                limit: itemsPerPage,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder
            }

            // Add filter parameters if they exist
            if (categoryId) queryParams.categoryId = categoryId
            if (subCategoryId) queryParams.subCategoryId = subCategoryId
            if (subCategoryTwoId) queryParams.subCategoryTwoId = subCategoryTwoId
            if (brandId) queryParams.brandId = brandId

            const response = await axiosInstance.get('products/get-products-by-filters', {
                params: queryParams
            })

            console.log("Filtered products:", response)

            if (response.data.statusCode === 200) {
                const productsData = response.data.data.products || []
                const paginationInfo = response.data.data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalProducts: 0
                }

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
                setProducts([])
                setTotalProducts(0)
            }

        } catch (error) {
            console.error('Error fetching products:', error)
            setError('An error occurred while fetching products')
            setProducts([])
            setTotalProducts(0)
        } finally {
            setLoading(false)
        }
    }

    // Fetch categories for sidebar
    const fetchCategoriesForBrand = async () => {
        if (!brandId) return

        try {
            setLoadingCategories(true)
            const res = await axiosInstance.get(`category/get-categories-by-brand-id/${brandId}`)

            console.log("categories by brand = ", res.data.data)

            if (res.data.statusCode === 200) {
                setCategories(res.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        } finally {
            setLoadingCategories(false)
        }
    }

    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return

            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

            console.log("Cart items:", response.data.data)
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching customer cart:', error)
        }
    }

    //fetch groups discount
    const fetchCustomersGroupsDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return

            const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser.customerId}`)

            if (response.data.statusCode === 200) {
                setCustomerGroupsDiscounts(response.data.data || [])
            }
        }
        catch (error) {
            console.error('Error fetching customer groups discounts:', error)
        }
    }

    // fetch item based discounts 
    const fetchItemBasedDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return

            const response = await axiosInstance.get(`item-based-discount/get-items-based-discount-by-customer-id/${currentUser.customerId}`)
            if (response.data.statusCode === 200) {
                setItemBasedDiscounts(response.data.data || [])
            }
        }
        catch (error) {
            console.error('Error fetching item based discounts:', error)
        }
    }

    // Add/Remove product from wishlist
    const handleAddToWishList = async (productId) => {
        try {
            if (!currentUser || !currentUser._id) {
                setError("Please login to manage wishlist")
                return
            }

            setLoadingProducts(prev => ({ ...prev, [productId]: true }))

            const response = await axiosInstance.post('wishlist/add-to-wishlist', {
                customerId: currentUser._id,
                productId: productId
            })

            console.log("Wishlist response:", response.data)

            if (response.data.statusCode === 200) {
                // Refresh the wishlist to get updated data
                await fetchCustomersWishList()
                setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);
            }
        } catch (error) {
            console.error('Error managing product in wishlist:', error)
            setError('Error managing wishlist')
        } finally {
            setLoadingProducts(prev => {
                const updatedLoadingProducts = { ...prev }
                updatedLoadingProducts[productId] = false
                return updatedLoadingProducts
            })
        }
    }

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return

            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

            console.log("customers wishlist response:", response.data)

            if (response.data.statusCode === 200) {
                // Set the wishlist items from response.data.data
                setWishlistItems(response.data.data || [])
                setWishlistItemsCount(response.data.data?.length || 0)
            }
        }
        catch (error) {
            console.error('Error fetching customer wishlist:', error)
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

    // Handle category click in sidebar
    const handleCategoryClick = (categorySlug, categoryId, brandId) => {

        const parts = categorySlug?.split("/").filter(Boolean);
        console.log('slug parts', parts);

        router.replace(`${parts[1]}`)
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: null,
            subCategoryTwoSlug: null,
            categoryId: categoryId,
            subCategoryId: null,
            subCategoryTwoId: null,
            brandId: brandId
        })
    }

    // Get page title based on current filter
    const getPageTitle = () => {
        if (subCategoryTwoSlug) return subCategoryTwoSlug?.split('-').join(' ').toUpperCase();
        if (subCategorySlug) return subCategorySlug?.split('-').join(' ').toUpperCase();
        if (categorySlug) return categorySlug?.split('-').join(' ').toUpperCase();
        if (brandSlug) return brandSlug?.split('-').join(' ').toUpperCase();
        return "ALL PRODUCTS";
    };

    // Get page description based on current filter
    const getPageDescription = () => {
        if (subCategoryTwoSlug) return `Browse our collection of ${subCategoryTwoSlug.replace(/-/g, ' ')} products`
        if (subCategorySlug) return `Explore our range of ${subCategorySlug.replace(/-/g, ' ')} products`
        if (categorySlug) return `Discover our ${categorySlug.replace(/-/g, ' ')} collection`
        return "Browse our complete product catalog"
    }

    useEffect(() => {
        fetchCustomersWishList()
    }, [currentUser?._id])

    useEffect(() => {
        if (currentUser && currentUser.customerId) {
            fetchItemBasedDiscounts()
            fetchCustomersGroupsDiscounts()
        }
    }, [currentUser?.customerId])

    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchCustomersCart()
        }
    }, [currentUser, currentCartItems])

    useEffect(() => {
        fetchProducts()
        fetchCategoriesForBrand()
    }, [categoryId, subCategoryId, subCategoryTwoId, brandId])

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

    // Update the fetchSubCategoriesForCategory function
    const fetchSubCategoriesForCategory = async (categoryId) => {
        if (subCategoriesByCategory[categoryId]) return // Already fetched

        try {
            const res = await axiosInstance.get(`subcategory/get-sub-categories-by-category-id/${categoryId}`)
            if (res.data.statusCode === 200) {
                setSubCategoriesByCategory(prev => ({
                    ...prev,
                    [categoryId]: res.data.data
                }))
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error)
        }
    }

    // Update the fetchSubCategoriesTwoForSubCategory function
    const fetchSubCategoriesTwoForSubCategory = async (subCategoryId) => {
        if (subCategoriesTwoBySubCategory[subCategoryId]) return // Already fetched

        try {
            const res = await axiosInstance.get(`subcategoryTwo/get-sub-categories-two-by-subcategory-id/${subCategoryId}`)
            if (res.data.statusCode === 200) {
                setSubCategoriesTwoBySubCategory(prev => ({
                    ...prev,
                    [subCategoryId]: res.data.data
                }))
            }
        } catch (error) {
            console.error('Error fetching subcategories two:', error)
        }
    }

    // Handle category hover with position calculation
    const handleCategoryHover = (categoryId, event) => {
        setHoveredCategory(categoryId)
        setHoveredSubCategory(null)

        // Calculate position for dropdown
        const rect = event.currentTarget.getBoundingClientRect()
        setDropdownPosition({
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX + 10 // 10px gap from the category
        })

        fetchSubCategoriesForCategory(categoryId)
    }

    // Handle subcategory hover
    const handleSubCategoryHover = (subCategoryId, event) => {
        setHoveredSubCategory(subCategoryId)
        fetchSubCategoriesTwoForSubCategory(subCategoryId)
    }

    // Handle mouse leave from category container
    const handleCategoryLeave = () => {
        setHoveredCategory(null)
        setHoveredSubCategory(null)
    }

    // Handle subcategory click
    const handleSubCategoryClick = (subCategorySlug, subCategoryId) => {
        router.replace(`${subCategorySlug}`)
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: subCategorySlug,
            subCategoryTwoSlug: null,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            subCategoryTwoId: null,
            brandId: brandId
        })
        setHoveredCategory(null)
        setHoveredSubCategory(null)
    }

    // Handle subcategory two click
    const handleSubCategoryTwoClick = (subCategoryTwoSlug, subCategoryTwoId) => {
        router.replace(`${subCategoryTwoSlug}`)
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: subCategorySlug,
            subCategoryTwoSlug: subCategoryTwoSlug,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            subCategoryTwoId: subCategoryTwoId,
            brandId: brandId
        })
        setHoveredCategory(null)
        setHoveredSubCategory(null)
    }

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white justify-items-center pt-4">
                <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span className="hidden sm:inline"> {getPageTitle()}</span>
                    </nav>

                </div>
                <h1 className="text-lg sm:text-xl lg:text-[2rem] text-[#2D2C70] mt-6 font-bold font-spartan pb-3 sm:pb-5 tracking-widest">{brandSlug?.split('-').join(' ').toUpperCase()}</h1>
            </div>

            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-12 2xl:px-18 py-3 sm:py-6">
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
                    {brandId && (
                        <div
                            className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
                            onMouseLeave={handleCategoryLeave}
                        >
                            <div className="bg-white xl:min-h-screen border-r-0 lg:border-r-1 border-black rounded-lg lg:rounded-none relative">
                                <div>
                                    <h4 className="text-lg sm:text-xl lg:text-[1.3rem] text-black font-[400] px-2 pb-2 lg:pb-4 lg:pt-2 font-spartan">
                                        {brandSlug?.split('-').join(' ').toUpperCase()}
                                    </h4>
                                    <div className="space-y-2 max-h-64 lg:max-h-none overflow-y-auto hide-scrollbar">
                                        {loadingCategories ? (
                                            <div className="py-2 text-sm text-gray-500">Loading categories...</div>
                                        ) : categories.length > 0 ? (
                                            categories.map((category) => (
                                                <div
                                                    key={category._id}
                                                    onClick={() => handleCategoryClick(category.slug, category._id, brandId)}
                                                    onMouseEnter={(e) => handleCategoryHover(category._id, e)}
                                                    className={`flex space-x-2 items-center py-1 px-2 hover:text-[#e9098d]/70 rounded cursor-pointer transition-colors text-sm lg:text-[16px] font-[400] font-spartan ${categoryId === category._id ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}
                                                >
                                                    <span className={`text-xs sm:text-sm lg:text-[16px] font-medium font-spartan hover:text-[#e9098d]/50 ${categoryId === category._id ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}>
                                                        {category.name}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-2 text-sm text-gray-500">No categories available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Dropdown for Subcategories */}
                                {hoveredCategory && subCategoriesByCategory[hoveredCategory] && (
                                    <div
                                        className="fixed lg:absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 max-h-96 overflow-y-auto"
                                        style={{
                                            top: `${dropdownPosition.top}px`,
                                            left: `${dropdownPosition.left}px`
                                        }}
                                        onMouseLeave={() => setHoveredSubCategory(null)}
                                    >
                                        <div className="p-2">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-2 px-2">
                                                {categories.find(c => c._id === hoveredCategory)?.name}
                                            </h5>
                                            <div className="space-y-1">
                                                {subCategoriesByCategory[hoveredCategory].map((subCategory) => (
                                                    <div
                                                        key={subCategory._id}
                                                        className="relative"
                                                    >
                                                        <div
                                                            onClick={() => handleSubCategoryClick(subCategory.slug, subCategory._id)}
                                                            onMouseEnter={(e) => handleSubCategoryHover(subCategory._id, e)}
                                                            className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer transition-colors ${subCategoryId === subCategory._id ? "bg-[#e9098d] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                                        >
                                                            <span>{subCategory.name}</span>
                                                            {subCategoriesTwoBySubCategory[subCategory._id] && (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Nested Dropdown for SubcategoriesTwo */}
                                                        {hoveredSubCategory === subCategory._id && subCategoriesTwoBySubCategory[subCategory._id] && (
                                                            <div
                                                                className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 max-h-96 overflow-y-auto"
                                                            >
                                                                <div className="p-2">
                                                                    <h6 className="text-sm font-semibold text-gray-700 mb-2 px-2">
                                                                        {subCategory.name}
                                                                    </h6>
                                                                    <div className="space-y-1">
                                                                        {subCategoriesTwoBySubCategory[subCategory._id].map((subCategoryTwo) => (
                                                                            <div
                                                                                key={subCategoryTwo._id}
                                                                                onClick={() => handleSubCategoryTwoClick(subCategoryTwo.slug, subCategoryTwo._id)}
                                                                                className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${subCategoryTwoId === subCategoryTwo._id ? "bg-[#e9098d] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                                                            >
                                                                                {subCategoryTwo.name}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && (
                            <>
                                {products.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-12 max-h-full border-t-2 border-[#2D2C70] pt-4">
                                            {products.map((product, index) => {
                                                const isInCart = isProductInCart(product._id)
                                                const cartItem = getCartItem(product._id)
                                                const isInWishlist = isProductInWishlist(product._id)
                                                const isOutOfStock = product.stockLevel <= 0
                                                const stockError = stockErrors[product._id]
                                                const isLoading = loadingProducts[product._id]

                                                const discountedPrice = calculateDiscountedPrice(product)
                                                const discountPercentage = getDiscountPercentage(product)
                                                const hasProductDiscount = hasDiscount(product)

                                                return (
                                                    <div
                                                        key={product._id}
                                                        className="rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm sm:max-w-none"
                                                    >

                                                        {/* Wishlist Icon */}
                                                        <div className="absolute top-2 right-4 sm:right-6 z-10">
                                                            <button
                                                                className="rounded-full transition-colors"
                                                                onClick={() => handleAddToWishList(product._id)}
                                                                disabled={isLoading}
                                                            >
                                                                <div className="h-8 w-8 bg-[#D9D9D940] p-2 flex mt-3 items-center justify-center rounded-full transition-colors cursor-pointer">
                                                                    {isLoading ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E9098D]"></div>

                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist ? "#E9098D" : "#D9D9D9"}  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        </div>

                                                        {/* product Badge */}
                                                        {product.badge && (
                                                            <div className="absolute top-2 left-4 sm:left-6 z-10">
                                                                <div
                                                                    className="px-2 py-1 rounded text-xs font-bold"
                                                                    style={{
                                                                        backgroundColor: product.badge.backgroundColor,
                                                                        color: product.badge.textColor || '#fff',
                                                                    }}
                                                                >
                                                                    {product.badge.text}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Product Image */}
                                                        <div className="flex justify-center mb-3 sm:mb-4 rounded-lg">
                                                            <img
                                                                src={product.images || "/placeholder.svg"}
                                                                alt={product.ProductName}
                                                                className="w-24 h-32 sm:w-28 sm:h-36 lg:w-32 lg:h-40 object-contain"
                                                                onClick={() => handleProductImageClick(product)}
                                                            />
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="text-start space-y-2 lg:max-w-[229px]">
                                                            {/* Product Name */}
                                                            <h3
                                                                onClick={() => handleProductClick(product)}
                                                                className="text-sm sm:text-base hover:text-[#E9098D] xl:h-[50px] lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase">
                                                                {product.ProductName}
                                                            </h3>

                                                            {/* SKU */}
                                                            <div className="space-y-1 flex justify-between items-center ">
                                                                <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                                                    SKU {product.sku}
                                                                </p>

                                                                {/* Stock Status */}
                                                                <div className={`flex items-center space-x-2 px-2 ${isOutOfStock ? 'bg-red-100' : 'bg-[#E7FAEF]'}`}>
                                                                    <svg className={`w-5 h-5 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className={`${isOutOfStock ? 'text-[12px]' : 'text-[14px]'} font-semibold font-spartan py-1 rounded ${isOutOfStock ? 'text-red-600' : 'text-black'}`}>
                                                                        {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Price */}
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl md:text-[24px] font-semibold text-[#2D2C70]">
                                                                    ${discountedPrice.toFixed(2)}
                                                                </span>
                                                                {hasProductDiscount && (
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        ${product.eachPrice ? product.eachPrice.toFixed(2) : '0.00'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Stock Error Message */}
                                                            {stockError && (
                                                                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                                                    {stockError}
                                                                </div>
                                                            )}

                                                            {/* Units Dropdown */}
                                                            <div className="mb-3 flex space-x-12 align-center items-center font-spartan">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                                                                <div className="relative w-full">
                                                                    <select
                                                                        value={selectedUnits[product._id] || ''}
                                                                        onChange={(e) => handleUnitChange(product._id, e.target.value, product)}
                                                                        disabled={isOutOfStock}
                                                                        className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                                                        focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                                                        appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                                                        className="w-[32px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(product._id, -1);
                                                                        }}
                                                                        disabled={(productQuantities[product._id] || 1) <= 1}
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
                                                                        className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(product._id, 1);
                                                                        }}
                                                                        disabled={isOutOfStock}
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
                                                                <button
                                                                    className={`flex items-center justify-center flex-1 gap-2 text-[15px] font-semibold border rounded-lg py-2 px-6 transition-colors duration-300 group ${isOutOfStock || isLoading
                                                                        ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                                                        : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]'
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!isOutOfStock && !isLoading) {
                                                                            handleAddToCart(product._id);
                                                                        }
                                                                    }}
                                                                    disabled={isOutOfStock || isLoading}
                                                                >
                                                                    {isLoading ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    ) : (
                                                                        <svg
                                                                            className="w-5 h-5 transition-colors duration-300 "
                                                                            viewBox="0 0 21 21"
                                                                            fill="currentColor"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                                                                        </svg>
                                                                    )}
                                                                    {isLoading ? 'Adding...' : 'Add to Cart'}
                                                                </button>
                                                            </div>

                                                            {/* Action Buttons Row - Only show when product is in cart */}
                                                            {isInCart && (
                                                                <div className="flex space-x-2 mt-1">
                                                                    <button
                                                                        className="flex-1 space-x-[6px] border-1 border-[#2D2C70] text-white bg-[#2D2C70] rounded-lg py-1 px-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        disabled
                                                                    >
                                                                        <span>Added</span>
                                                                        <svg className="w-5 h-5 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                    <div className="w-px bg-black h-[20px] mt-2"></div>
                                                                    <button
                                                                        className={`flex-1 border-1 rounded-lg py-1 px-3 text-sm font-medium transition-colors ${isOutOfStock || isLoading || stockError
                                                                            ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                                                            : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999]'
                                                                            }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!isOutOfStock && !isLoading && !stockError) {
                                                                                handleAddToCart(product._id);
                                                                            }
                                                                        }}
                                                                        disabled={isOutOfStock || isLoading || !!stockError}
                                                                    >
                                                                        {isLoading ? 'Updating...' : 'Update'}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Cart Quantity Info */}
                                                            {isInCart && cartItem && (
                                                                <div className="mt-2 text-sm font-semibold text-[#000000]/80 font-spartan hover:text-[#E9098D]">
                                                                    In Cart Quantity: <span className="font-medium">{cartItem.unitsQuantity} ({cartItem.packType})</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
                                                {renderPaginationButtons()}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-lg text-gray-500">No products found for the selected category.</p>
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
                productId={selectedProduct?._id}
            />
        </div>
    )
}

export default ProductListing