"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import axiosInstance from "@/axios/axiosInstance"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import useCartStore from "@/zustand/cartPopup"
import Notification from "@/components/Notification"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import ProductPopup from "@/components/product-details-components/Popup"

const SearchPage = () => {
    const [sortBy, setSortBy] = useState("Newest")
    const [viewMode, setViewMode] = useState("grid")
    const [products, setProducts] = useState([])
    const [productGroups, setProductGroups] = useState([])
    const [allItems, setAllItems] = useState([]) // Combined products and product groups
    const [error, setError] = useState(null)
    const [productQuantities, setProductQuantities] = useState({})
    const [productGroupQuantities, setProductGroupQuantities] = useState({})
    const [selectedUnits, setSelectedUnits] = useState({})
    const currentUser = useUserStore((state) => state.user)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)
    const [perpageItems, setPerpageItems] = useState('10')
    const [cartItems, setCartItems] = useState([])
    const [stockErrors, setStockErrors] = useState({})
    const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
    const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])
    const [wishListItems, setWishlistItems] = useState([])

    const [loadingProducts, setLoadingProducts] = useState({})
    const [loadingWishlist, setLoadingWishlist] = useState({})
    const [loadingCart, setLoadingCart] = useState({})

    // Add popup states
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedProductGroup, setSelectedProductGroup] = useState(null)

    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems)
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems)
    const currentCartItems = useCartStore((state) => state.currentItems)

    const {
        setFilters,
        clearFilters
    } = useProductFiltersStore();

    // Add this with your other state declarations
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success' // 'success' or 'error'
    });

    // Function to show notification
    const showNotification = (message, type = 'success') => {
        setNotification({
            isVisible: true,
            message,
            type
        });
    };

    // Function to hide notification
    const hideNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    // Add popup handler functions
    const handleProductImageClick = (item, isProductGroup = false) => {
        if (isProductGroup) {
            setSelectedProductGroup(item);
        } else {
            setSelectedProduct(item);
        }
        setShowProductPopup(true);
    }

    const handleClosePopup = () => {
        setShowProductPopup(false);
        setSelectedProduct(null);
        setSelectedProductGroup(null);
    }

    // Check if item is in wishlist (for both products and product groups)
    const isItemInWishlist = (itemId, isProductGroup = false) => {

        if (!wishListItems || !Array.isArray(wishListItems)) {
            return false;
        }


        return wishListItems.some(item => {
            if (isProductGroup) {
                return item.productGroup?._id === itemId;
            } else {
                return item.product?._id === itemId;
            }
        });
    }

    // UPDATED: Calculate discounted price for both products and product groups
    const calculateDiscountedPrice = (item, isProductGroup = false) => {
        const originalPrice = isProductGroup ? (item.eachPrice || 0) : (item.eachPrice || 0);

        // Priority 1: If item has comparePrice (not null, not undefined, and not 0), use it
        if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
            return item.comparePrice;
        }

        // If no comparePrice or comparePrice is 0, check for discounts
        if (!currentUser || !currentUser.customerId) {
            return originalPrice;
        }

        // Priority 2: Check for item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
        );

        // If item-based discount exists, apply it
        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return originalPrice - discountAmount;
        }

        // Priority 3: Check for pricing group discount
        if (item.pricingGroup) {
            const itemPricingGroupId = typeof item.pricingGroup === 'object'
                ? item.pricingGroup._id
                : item.pricingGroup;

            // Find matching pricing group discount document
            const groupDiscountDoc = customerGroupsDiscounts.find(
                discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
            );

            if (groupDiscountDoc && groupDiscountDoc.customers) {
                // Find the specific customer discount within the pricing group
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user && customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount && customerDiscount.percentage) {
                    const percentage = parseFloat(customerDiscount.percentage);
                    // Handle both positive and negative percentages
                    if (percentage > 0) {
                        // Positive percentage means price increase
                        return originalPrice + (originalPrice * percentage / 100);
                    } else {
                        // Negative percentage means price decrease
                        return originalPrice - (originalPrice * Math.abs(percentage) / 100);
                    }
                }
            }
        }

        // If no discounts apply, return original price
        return originalPrice;
    };

    // UPDATED: Get discount percentage for display for both products and product groups
    const getDiscountPercentage = (item, isProductGroup = false) => {
        // If item has comparePrice, show comparePrice discount
        if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
            const originalPrice = isProductGroup ? (item.eachPrice || 0) : (item.eachPrice || 0);
            if (originalPrice > 0) {
                const discountAmount = originalPrice - item.comparePrice;
                const discountPercentage = (discountAmount / originalPrice) * 100;
                return Math.round(discountPercentage);
            }
            return 0;
        }

        if (!currentUser || !currentUser.customerId) {
            return null;
        }

        // Check item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            return itemDiscount.percentage;
        }

        // Check pricing group discount
        if (item.pricingGroup) {
            const itemPricingGroupId = typeof item.pricingGroup === 'object'
                ? item.pricingGroup._id
                : item.pricingGroup;

            const groupDiscountDoc = customerGroupsDiscounts.find(
                discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
            );

            if (groupDiscountDoc && groupDiscountDoc.customers) {
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user && customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount && customerDiscount.percentage) {
                    return parseFloat(customerDiscount.percentage);
                }
            }
        }

        return null;
    };

    // UPDATED: Check if item has any discount or comparePrice
    const hasDiscount = (item, isProductGroup = false) => {
        return (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) ||
            getDiscountPercentage(item, isProductGroup) !== null;
    };

    // Check if item is in cart (for both products and product groups)
    const isItemInCart = (itemId, isProductGroup = false) => {

        if (!cartItems || !Array.isArray(cartItems)) {
            return false;
        }

        return cartItems?.some(item => {
            if (isProductGroup) {
                return item.productGroup && item.productGroup._id === itemId;
            } else {
                return item.product && item.product._id === itemId;
            }
        });
    }

    // Get cart item for product or product group
    const getCartItem = (itemId, isProductGroup = false) => {

        if (!cartItems || !Array.isArray(cartItems)) {
            return false;
        }

        return cartItems.find(item => {
            if (isProductGroup) {
                return item.productGroup && item.productGroup._id === itemId;
            } else {
                return item.product && item.product._id === itemId;
            }
        });
    }

    // Get pack types for product - Handle both packTypes and typesOfPacks
    const getPackTypes = (product) => {
        return product.packTypes || product.typesOfPacks || [];
    }

    // Calculate total quantity for both products and product groups
    const calculateTotalQuantity = (itemId, isProductGroup = false, packId = null, unitsQty = null) => {
        let item;
        let quantities;
        let selectedUnitsState;

        if (isProductGroup) {
            item = productGroups.find(p => p._id === itemId);
            quantities = productGroupQuantities;
            selectedUnitsState = selectedUnits;
        } else {
            item = products.find(p => p._id === itemId);
            quantities = productQuantities;
            selectedUnitsState = selectedUnits;
        }

        if (!item) return 0;

        // Use provided values or fall back to state
        const packIdToUse = packId !== null ? packId : selectedUnitsState[itemId];
        const unitsToUse = unitsQty !== null ? unitsQty : (quantities[itemId] || 1);

        // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
        const packQuantity = isProductGroup ? 1 :
            (getPackTypes(item).find(pack => pack._id === packIdToUse) ?
                parseInt(getPackTypes(item).find(pack => pack._id === packIdToUse).quantity) : 1);

        return packQuantity * unitsToUse;
    }

    // Check stock level for both products and product groups
    const checkStockLevel = (itemId, isProductGroup = false, packId = null, unitsQty = null) => {
        let item;
        if (isProductGroup) {
            item = productGroups.find(p => p._id === itemId);
        } else {
            item = products.find(p => p._id === itemId);
        }

        if (!item) return { isValid: true };

        // For product groups, calculate stock level based on products in the group
        let stockLevel;
        if (isProductGroup) {
            // Use the minimum stock level among products in the group, or a default value
            stockLevel = item.products && item.products.length > 0
                ? Math.min(...item.products.map(p => p.stockLevel || 0))
                : 0;
        } else {
            stockLevel = item.stockLevel;
        }

        const totalRequestedQuantity = calculateTotalQuantity(itemId, isProductGroup, packId, unitsQty);
        const cartItem = getCartItem(itemId, isProductGroup);
        const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

        // If item is already in cart, we're updating it, not adding new quantity
        const newTotalQuantity = isItemInCart(itemId, isProductGroup)
            ? totalRequestedQuantity
            : totalRequestedQuantity + currentCartQuantity;

        const isValid = newTotalQuantity <= stockLevel;

        return {
            isValid,
            message: isValid ? null : `Exceeds available stock `,
            requestedQuantity: totalRequestedQuantity,
            currentStock: stockLevel,
            newTotalQuantity
        };
    }

    const handleProductClick = (itemName, itemId, isProductGroup = false, item) => {
        // Set the filters with item ID before navigation
        setFilters({
            categorySlug: isProductGroup ? (item.commerceCategoriesTwo?.slug || null) : (item.category?.slug || null),
            subCategorySlug: isProductGroup ? (item.commerceCategoriesThree?.slug || null) : (item.subCategory?.slug || null),
            subCategoryTwoSlug: isProductGroup ? (item.commerceCategoriesFour?.slug || null) : (item.subCategoryTwo?.slug || null),
            brandSlug: isProductGroup ? (item.commerceCategoriesOne?.slug || null) : (item.brand?.slug || null),
            brandId: isProductGroup ? (item.commerceCategoriesOne?._id || null) : (item.brand?._id || null),
            categoryId: isProductGroup ? (item.commerceCategoriesTwo?._id || null) : (item.category?._id || null),
            subCategoryId: isProductGroup ? (item.commerceCategoriesThree?._id || null) : (item.subCategory?._id || null),
            subCategoryTwoId: isProductGroup ? (item.commerceCategoriesFour?._id || null) : (item.subCategoryTwo?._id || null),
            productID: isProductGroup ? null : itemId,
            productGroupId: isProductGroup ? itemId : null
        });

        const itemSlug = itemName.replace(/\s+/g, '-').toLowerCase();
        router.push(`/${itemSlug}`);
    }

    // Handle quantity change for both products and product groups
    const handleQuantityChange = (itemId, change, isProductGroup = false) => {
        const quantitiesState = isProductGroup ? productGroupQuantities : productQuantities;
        const setQuantitiesState = isProductGroup ? setProductGroupQuantities : setProductQuantities;

        const currentQuantity = quantitiesState[itemId] || 1;
        const newQuantity = Math.max(1, currentQuantity + change);

        // Update quantity first
        setQuantitiesState(prev => ({
            ...prev,
            [itemId]: newQuantity
        }));

        // Check stock with the NEW quantity
        const stockCheck = checkStockLevel(itemId, isProductGroup, null, newQuantity);

        if (!stockCheck.isValid) {
            // Set error if exceeds stock
            setStockErrors(prev => ({
                ...prev,
                [itemId]: stockCheck.message
            }));
        } else {
            // Clear error if within stock
            setStockErrors(prev => ({
                ...prev,
                [itemId]: null
            }));
        }
    }

    // Handle unit change for products (product groups don't have units)
    const handleUnitChange = (productId, unitId, product) => {
        // Update selected unit
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: unitId
        }))

        // Check stock with the NEW pack but current quantity
        const currentQuantity = productQuantities[productId] || 1
        const stockCheck = checkStockLevel(productId, false, unitId, currentQuantity)

        if (!stockCheck.isValid) {
            // Set error if exceeds stock
            setStockErrors(prev => ({
                ...prev,
                [productId]: stockCheck.message
            }))
        } else {
            // Clear error if within stock
            setStockErrors(prev => ({
                ...prev,
                [productId]: null
            }))
        }
    }

    // Add to cart function for both products and product groups
    const handleAddToCart = async (itemId, isProductGroup = false) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to add items to cart")
            showNotification("Please login to add items to cart", "error")
            return
        }

        // Final stock check before adding to cart
        const stockCheck = checkStockLevel(itemId, isProductGroup)
        if (!stockCheck.isValid) {
            setError(stockCheck.message)
            setStockErrors(prev => ({
                ...prev,
                [itemId]: stockCheck.message
            }))
            showNotification(stockCheck.message, "error")
            return
        }

        setLoadingCart(prev => ({ ...prev, [itemId]: true }))

        try {
            let item;
            let quantitiesState;

            if (isProductGroup) {
                item = productGroups.find(p => p._id === itemId);
                quantitiesState = productGroupQuantities;
            } else {
                item = products.find(p => p._id === itemId);
                quantitiesState = productQuantities;
            }

            if (!item) return;

            // For product groups, we don't have typesOfPacks, so use default values
            const packQuantity = isProductGroup ? 1 :
                (getPackTypes(item).find(pack => pack._id === selectedUnits[itemId]) ?
                    parseInt(getPackTypes(item).find(pack => pack._id === selectedUnits[itemId]).quantity) : 1);

            const unitsQuantity = quantitiesState[itemId] || 1;
            const totalQuantity = packQuantity * unitsQuantity;

            // Calculate the discounted price for this item
            const discountedPrice = calculateDiscountedPrice(item, isProductGroup);

            // Calculate total amount using the discounted price
            const totalAmount = discountedPrice;

            // Determine discount type and percentage
            let discountType = "";
            let discountPercentages = 0;

            // Priority 1: Check if item has comparePrice
            if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
                const originalPrice = isProductGroup ? item.eachPrice : item.eachPrice;
                if (originalPrice > 0) {
                    const discountAmount = originalPrice - item.comparePrice;
                    discountPercentages = Math.round((discountAmount / originalPrice) * 100);
                    discountType = "Compare Price";
                }
            }
            // Priority 2: Check for item-based discount
            else if (currentUser && currentUser.customerId) {
                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    discountPercentages = itemDiscount.percentage;
                    discountType = "Item Based Discount";
                }
                // Priority 3: Check for pricing group discount
                else if (item.pricingGroup) {
                    const itemPricingGroupId = typeof item.pricingGroup === 'object'
                        ? item.pricingGroup._id
                        : item.pricingGroup;

                    const groupDiscountDoc = customerGroupsDiscounts.find(
                        discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
                    );

                    if (groupDiscountDoc) {
                        const customerDiscount = groupDiscountDoc.customers.find(
                            customer => customer.user && customer.user.customerId === currentUser.customerId
                        );

                        if (customerDiscount && customerDiscount.percentage) {
                            discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
                            discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";
                        }
                    }
                }
            }

            const cartData = {
                customerId: currentUser._id,
                productId: isProductGroup ? null : itemId,
                productGroupId: isProductGroup ? itemId : null,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                packType: isProductGroup ? 'Each' : (getPackTypes(item).find(pack => pack._id === selectedUnits[itemId]) ?
                    getPackTypes(item).find(pack => pack._id === selectedUnits[itemId]).name : 'Each'),
                amount: totalAmount,
                discountType: discountType,
                discountPercentages: discountPercentages
            }

            console.log("Sending cart data with discounts:", cartData);

            const response = await axiosInstance.post('cart/add-to-cart', cartData)

            if (response.data.statusCode === 200) {
                await fetchCustomersCart()
                setCartItemsCount(response.data.data.cartItems.length);
                setError(null)

                // Show success notification
                const action = isItemInCart(itemId, isProductGroup) ? "updated in" : "added to"
                const itemName = isProductGroup ? item.name : item.ProductName;
                showNotification(`${itemName} ${action} cart successfully!`)

                // Clear any stock errors after successful add
                setStockErrors(prev => ({
                    ...prev,
                    [itemId]: null
                }))
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            showNotification("Failed to add item to cart", "error")
        } finally {
            setLoadingCart(prev => ({ ...prev, [itemId]: false }))
        }
    }

    // Add/Remove item from wishlist (for both products and product groups)
    const handleAddToWishList = async (itemId, isProductGroup = false) => {
        try {
            if (!currentUser || !currentUser._id) {
                setError("Please login to manage wishlist")
                showNotification("Please login to manage wishlist", "error")
                return
            }

            setLoadingWishlist(prev => ({ ...prev, [itemId]: true }))

            const response = await axiosInstance.post('wishlist/add-to-wishlist', {
                customerId: currentUser._id,
                productId: isProductGroup ? null : itemId,
                productGroupId: isProductGroup ? itemId : null
            })

            console.log("Wishlist response:", response.data)

            if (response.data.statusCode === 200) {
                await fetchCustomersWishList()
                setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);

                // Show wishlist notification
                const item = isProductGroup ?
                    productGroups.find(p => p._id === itemId) :
                    products.find(p => p._id === itemId);
                const itemName = isProductGroup ? item?.name : item?.ProductName;
                const action = isItemInWishlist(itemId, isProductGroup) ? "removed from" : "added to";
                showNotification(`${itemName} ${action} wishlist!`);
            }
        } catch (error) {
            console.error('Error managing item in wishlist:', error)
            setError('Error managing wishlist')
            showNotification("Error managing wishlist", "error")
        } finally {
            setLoadingWishlist(prev => {
                const updatedLoadingWishlist = { ...prev }
                updatedLoadingWishlist[itemId] = false
                return updatedLoadingWishlist
            })
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

    // Fetch search results for both products and product groups
    const fetchSearchResults = async (page = currentPage, itemsPerPage = perpageItems, sortOption = sortBy) => {
        try {
            setLoading(true)
            const sortParams = getSortParams(sortOption)

            const queryParams = {
                q: searchQuery,
                page: page,
                limit: itemsPerPage,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder
            }

            // Fetch both products and product groups in parallel
            const [productsResponse, productGroupsResponse] = await Promise.all([
                axiosInstance.get('products/search-products', { params: queryParams }),
                axiosInstance.get('product-group/search-product-groups', { params: queryParams })
            ])

            console.log("Search products results:", productsResponse)
            console.log("Search product groups results:", productGroupsResponse)

            let productsData = []
            let productGroupsData = []
            let totalProductsCount = 0
            let totalProductGroupsCount = 0

            if (productsResponse.data.statusCode === 200) {
                productsData = productsResponse.data.data || []
                totalProductsCount = productsResponse.data.pagination?.totalProducts || 0
            }

            if (productGroupsResponse.data.statusCode === 200) {
                productGroupsData = productGroupsResponse.data.data || []
                totalProductGroupsCount = productGroupsResponse.data.pagination?.totalProductGroups || 0
            }

            // Combine products and product groups
            const combinedItems = [
                ...productsData.map(item => ({ ...item, type: 'product' })),
                ...productGroupsData.map(item => ({ ...item, type: 'productGroup' }))
            ]

            setProducts(productsData)
            setProductGroups(productGroupsData)
            setAllItems(combinedItems)

            // Calculate total items count
            const totalItemsCount = totalProductsCount + totalProductGroupsCount
            setTotalItems(totalItemsCount)

            // Use the larger pagination info or calculate combined pagination
            const productsPagination = productsResponse.data.pagination
            const productGroupsPagination = productGroupsResponse.data.pagination

            // For simplicity, use products pagination if available, otherwise use product groups
            const paginationInfo = productsPagination || productGroupsPagination || {
                currentPage: 1,
                totalPages: 1,
                totalProducts: 0
            }

            setCurrentPage(paginationInfo.currentPage)
            setTotalPages(paginationInfo.totalPages)

            // Initialize quantities and selected units for products
            const initialQuantities = {}
            const initialUnits = {}
            productsData.forEach(product => {
                initialQuantities[product._id] = 1
                const packTypes = getPackTypes(product);
                if (packTypes.length > 0) {
                    initialUnits[product._id] = packTypes[0]._id
                }
            })
            setProductQuantities(initialQuantities)
            setSelectedUnits(initialUnits)

            // Initialize quantities for product groups (no units for product groups)
            const initialProductGroupQuantities = {}
            productGroupsData.forEach(productGroup => {
                initialProductGroupQuantities[productGroup._id] = 1
            })
            setProductGroupQuantities(initialProductGroupQuantities)

            // Clear all stock errors when fetching new items
            setStockErrors({})

        } catch (error) {
            console.error('Error fetching search results:', error)
            setError('An error occurred while fetching search results')
            setProducts([])
            setProductGroups([])
            setAllItems([])
            setTotalItems(0)
        } finally {
            setLoading(false)
        }
    }

    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return

            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

            console.log("Cart items:", response)
            if (response.data.statusCode === 200) {
                const cartData = response.data.data.items || [];
                setCartItems(cartData);
                setCartItemsCount(cartData.length);

                // Force a re-render to update the UI
                setProducts(prev => [...prev]);
                setProductGroups(prev => [...prev]);
            }
        } catch (error) {
            console.error('Error fetching customer cart:', error)
        }
    }

    //fetch groups discount
    const fetchCustomersGroupsDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return

            const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser._id}`)

            console.log("pricing groups discounts by customer id =", response)

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

            console.log("item based discounsts", response)

            if (response.data.statusCode === 200) {
                setItemBasedDiscounts(response.data.data || [])
            }
        }
        catch (error) {
            console.error('Error fetching item based discounts:', error)
        }
    }

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return

            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

            console.log("customers wishlist response:", response.data)

            if (response.data.statusCode === 200) {
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
        fetchSearchResults(1, perpageItems, newSortBy)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newPerPage = e.target.value
        setPerpageItems(newPerPage)
        fetchSearchResults(1, newPerPage, sortBy)
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchSearchResults(page, perpageItems, sortBy)
    }

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
                    : 'bg-white text-black hover:bg-gray-50 cursor-pointer'
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
                    className="px-3 py-2 rounded-lg border bg-white text-black hover:bg-gray-50 cursor-pointer"
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
                        : 'bg-white text-black hover:bg-gray-50 cursor-pointer'
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
                    : 'bg-white text-black hover:bg-gray-50 cursor-pointer'
                    }`}
            >
                Next
            </button>
        )

        return buttons
    }

    // Sort items by sequence and date
    const sortItemsBySequenceAndDate = (items) => {
        // Separate items into two groups
        const itemsWithSequence = items.filter(item =>
            item.sequence !== undefined && item.sequence !== null
        );

        const itemsWithoutSequence = items.filter(item =>
            item.sequence === undefined || item.sequence === null
        );

        // Sort items with sequence by sequence number (ascending)
        itemsWithSequence.sort((a, b) => a.sequence - b.sequence);

        // Sort items without sequence by createdAt date (newest first)
        itemsWithoutSequence.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Combine both arrays: sequenced items first, then dated items
        return [...itemsWithSequence, ...itemsWithoutSequence];
    };

    const sortedItems = sortItemsBySequenceAndDate(allItems)

    // Render product group badge
    const renderProductGroupBadge = () => {
        return (
            <div className="absolute top-2 left-4 sm:left-6 z-10">
                <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                    BUNDLE
                </div>
            </div>
        );
    };

    // Render item card (for both products and product groups)
    const renderItemCard = (item) => {
        const isProductGroup = item.type === 'productGroup';
        const itemId = item._id;
        const isInCart = isItemInCart(itemId, isProductGroup);
        const cartItem = getCartItem(itemId, isProductGroup);
        const isInWishlist = isItemInWishlist(itemId, isProductGroup);

        // Calculate stock level for product groups
        let isOutOfStock;
        if (isProductGroup) {
            isOutOfStock = item.products && item.products.length > 0
                ? Math.min(...item.products.map(p => p.stockLevel || 0)) <= 0
                : true;
        } else {
            isOutOfStock = item.stockLevel <= 0;
        }

        const stockError = stockErrors[itemId];
        const isWishlistLoading = loadingWishlist[itemId];
        const isCartLoading = loadingCart[itemId];

        const discountedPrice = calculateDiscountedPrice(item, isProductGroup);
        const discountPercentage = getDiscountPercentage(item, isProductGroup);
        const hasItemDiscount = hasDiscount(item, isProductGroup);

        const quantitiesState = isProductGroup ? productGroupQuantities : productQuantities;
        const currentQuantity = quantitiesState[itemId] || 1;

        return (
            <div
                key={itemId}
                className="rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm md:min-w-[230px]"
            >

                {/* Wishlist Icon */}
                <div className="absolute top-2 right-4 sm:right-6 z-10">
                    <button
                        className="rounded-full transition-colors cursor-pointer"
                        onClick={() => handleAddToWishList(itemId, isProductGroup)}
                        disabled={isWishlistLoading}
                    >
                        <div className="h-8 w-8 bg-[#D9D9D940] p-2 flex mt-3 items-center justify-center rounded-full transition-colors cursor-pointer">
                            {isWishlistLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E9098D]"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist ? "#E9098D" : "#D9D9D9"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>
                            )}
                        </div>
                    </button>
                </div>

                {/* Product Group Badge */}
                {isProductGroup && renderProductGroupBadge()}



                {/* Item Image */}
                <div className="flex justify-center mb-3 sm:mb-4 rounded-lg">
                    {!isProductGroup && item.badge && (
                        <div className="absolute top-6 left-4 sm:left-6 z-10">
                            <div
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                    backgroundColor: item.badge.backgroundColor,
                                    color: item.badge.textColor || '#fff',
                                }}
                            >
                                {item.badge.text}
                            </div>
                        </div>
                    )}
                    <img
                        src={isProductGroup ? (item.thumbnail || "/placeholder.svg") : (item.images || "/placeholder.svg")}
                        alt={isProductGroup ? item.name : item.ProductName}
                        className="h-[170px] w-[170px] object-contain cursor-pointer"
                        onClick={() => handleProductImageClick(item, isProductGroup)} // Add click handler here
                    />
                </div>

                {/* Item Info */}
                <div className="text-start space-y-2 min-w-[300px] lg:min-w-0 lg:max-w-[229px]">
                    {/* Item Name */}
                    <h3
                        onClick={() => handleProductClick(isProductGroup ? item.name : item.ProductName, itemId, isProductGroup, item)}
                        className="text-sm sm:text-base hover:text-[#E9098D] h-[40px] xl:h-[60px] lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase cursor-pointer">
                        {isProductGroup ? item.name : item.ProductName}
                    </h3>

                    {/* SKU */}
                    <div className="space-y-1 flex justify-between items-center ">
                        <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                            SKU : {(() => {
                                const sku = isProductGroup ? item.sku : item.sku;
                                return sku?.length > 8 ? sku.slice(0, 8) + '...' : sku;
                            })()}
                        </p>


                        {/* Stock Status */}
                        <div className={`flex items-center space-x-2 px-2 ${isOutOfStock ? 'bg-red-100' : 'bg-[#E7FAEF]'}`}>
                            {/* {!isOutOfStock && <svg className={`w-5 h-5 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>} */}
                            <span className={`${isOutOfStock ? 'text-[12px]' : 'text-[14px]'} font-semibold font-spartan py-1 rounded ${isOutOfStock ? 'text-red-600' : 'text-black'}`}>
                                {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl md:text-[24px] font-semibold text-[#2D2C70]">
                                ${discountedPrice.toFixed(2)}
                            </span>
                            {/* Show original price with line-through ONLY if discounted price is less than original price */}
                            {discountedPrice < (isProductGroup ? item.eachPrice : item.eachPrice) && (
                                <span className="text-sm text-gray-500 line-through">
                                    ${isProductGroup ? (item.eachPrice ? item.eachPrice.toFixed(2) : '0.00') : (item.eachPrice ? item.eachPrice.toFixed(2) : '0.00')}
                                </span>
                            )}
                            {/* Show discount percentage ONLY if discounted price is less than original price */}
                            {discountedPrice < (isProductGroup ? item.eachPrice : item.eachPrice) && discountPercentage && discountPercentage > 0 && (
                                <span className="text-sm text-green-600 font-semibold">
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>


                    </div>

                    {/* Product Group Info */}
                    {isProductGroup && item.products && item.products.length > 0 && (
                        <div className="mt-4 mb-6 text-xs text-gray-600">
                            Includes {item.products.length} product(s)
                        </div>
                    )}

                    {/* Stock Error Message */}
                    {stockError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {stockError}
                        </div>
                    )}

                    {/* Units Dropdown (only for products, not product groups) */}
                    {/* Units Dropdown (only for products, not product groups) */}
                    {!isProductGroup && getPackTypes(item).length > 0 && (
                        <div className="mb-3 flex space-x-12 align-center items-center font-spartan">
                            <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">Units</label>
                            <div className="relative w-full">
                                <select
                                    value={selectedUnits[itemId] || ''}
                                    onChange={(e) => handleUnitChange(itemId, e.target.value, item)}
                                    disabled={isOutOfStock}
                                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                        focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                        appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {getPackTypes(item).length > 0 ? (
                                        getPackTypes(item).map((pack) => (
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
                    )}

                    {/* Quantity Controls */}
                    <div className="mb-2 space-x-[26.5px] flex align-center items-center font-spartan">
                        <label className="block text-sm font-medium text-gray-700 cursor-pointer">Quantity</label>
                        <div className="flex items-center">
                            <button
                                className="w-[32px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(itemId, -1, isProductGroup);
                                }}
                                disabled={currentQuantity <= 1}
                            >
                                <span className="text-xl font-bold flex items-center">
                                    <Image
                                        src="/icons/minus-icon.png"
                                        alt="Minus"
                                        width={12}
                                        height={12}
                                        className="cursor-pointer"
                                    />
                                </span>
                            </button>

                            {/* Input field for direct quantity entry */}
                            <input
                                type="number"
                                min="1"
                                value={currentQuantity}
                                onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 1;
                                    const validQuantity = Math.max(1, newQuantity);

                                    const quantitiesState = isProductGroup ? productGroupQuantities : productQuantities;
                                    const setQuantitiesState = isProductGroup ? setProductGroupQuantities : setProductQuantities;

                                    setQuantitiesState(prev => ({
                                        ...prev,
                                        [itemId]: validQuantity
                                    }));

                                    // Check stock with the new quantity
                                    const stockCheck = checkStockLevel(itemId, isProductGroup, null, validQuantity);
                                    if (!stockCheck.isValid) {
                                        setStockErrors(prev => ({
                                            ...prev,
                                            [itemId]: stockCheck.message
                                        }));
                                    } else {
                                        setStockErrors(prev => ({
                                            ...prev,
                                            [itemId]: null
                                        }));
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value || parseInt(e.target.value) < 1) {
                                        const quantitiesState = isProductGroup ? productGroupQuantities : productQuantities;
                                        const setQuantitiesState = isProductGroup ? setProductGroupQuantities : setProductQuantities;

                                        setQuantitiesState(prev => ({
                                            ...prev,
                                            [itemId]: 1
                                        }));
                                    }
                                }}
                                className="w-12 h-[25px] mx-2 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D2C70] cursor-pointer"
                            />

                            <button
                                className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(itemId, 1, isProductGroup);
                                }}
                                disabled={isOutOfStock}
                            >
                                <Image
                                    src="/icons/plus-icon.png"
                                    alt="Plus"
                                    width={12}
                                    height={12}
                                    className="cursor-pointer"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex items-center space-x-3">
                        <button
                            className={`flex items-center justify-center border border-black flex-1 gap-2 text-[1rem] font-semibold border rounded-lg py-2 px-6 transition-colors duration-300 group ${isOutOfStock || isCartLoading || stockError
                                ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0] cursor-pointer'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock && !isCartLoading && !stockError) {
                                    handleAddToCart(itemId, isProductGroup);
                                }
                            }}
                            disabled={isOutOfStock || isCartLoading || !!stockError}
                        >
                            {isCartLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <svg
                                    className="w-5 h-5 transition-colors duration-300 cursor-pointer"
                                    viewBox="0 0 21 21"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                                </svg>
                            )}
                            {isCartLoading ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>

                    {/* Action Buttons Row - Only show when item is in cart */}
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
                                className={`flex-1 border-1 border border-black rounded-lg py-1 px-3 text-sm font-medium transition-colors ${isOutOfStock || isCartLoading || stockError
                                    ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                    : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999] cursor-pointer'
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isOutOfStock && !isCartLoading && !stockError) {
                                        handleAddToCart(itemId, isProductGroup);
                                    }
                                }}
                                disabled={isOutOfStock || isCartLoading || !!stockError}
                            >
                                {isCartLoading ? 'Updating...' : 'Update'}
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
        );
    };

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
        if (searchQuery) {
            fetchSearchResults()
        }
    }, [searchQuery])

    return (
        <div className="min-h-screen ">

            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onHide={hideNotification}
            />

            {/* Breadcrumb */}
            <div className="bg-white justify-items-center pt-4">
                <div className="md:max-w-[80%] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span className="hidden sm:inline">Search Results for "{searchQuery}"</span>
                    </nav>
                </div>
                <h1 className="text-lg sm:text-xl lg:text-[2rem] text-[#2D2C70] mt-6 font-bold font-spartan pb-3 sm:pb-5 tracking-widest">
                    SEARCH RESULTS
                </h1>
            </div>

            <div className="md:max-w-[80%] mx-auto px-2 sm:px-4 lg:px-6 xl:px-12 2xl:px-18 py-3 sm:py-6">
                <div className="flex flex-col">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Products Header */}
                        <div className="bg-white rounded-lg pb-3 lg:pb-4 mb-4 lg:mb-0 ">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                                <h2 className="text-lg lg:text-[1.2rem] font-[400] text-black">
                                    Search Results <span className="text-[#000000]/60">({totalItems})</span>
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
                                                        appearance-none  w-[135px] cursor-pointer"
                                            >
                                                <option value="10" className="text-[15px] font-medium">10 Per Page</option>
                                                <option value="15" className="text-[15px] font-medium">15 Per Page</option>
                                                <option value="20" className="text-[15px] font-medium">20 Per Page</option>
                                                <option value="25" className="text-[15px] font-medium">25 Per Page</option>
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
                                                            appearance-none w-full sm:w-[132px] md:w-[140px] lg:w-[132px] cursor-pointer"
                                                >
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
                                        {/* <div className="flex border border-gray-300 px-2 sm:px-3 rounded-md justify-between w-full sm:w-auto sm:min-w-[80px] md:min-w-[90px]">
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
                                        </div> */}
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

                        {/* No Results State */}
                        {!loading && searchQuery && allItems.length === 0 && (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
                                    <p className="text-gray-500 mb-6">
                                        We couldn't find any items matching "<span className="font-semibold">{searchQuery}</span>"
                                    </p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="bg-[#2D2C70] text-white px-6 py-2 rounded-lg hover:bg-[#25255a] transition-colors"
                                    >
                                        Browse All Items
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Items Grid */}
                        {!loading && allItems.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 md:gap-10 lg:gap-0  max-h-full border-t-2 border-[#2D2C70] pt-1">
                                    {sortedItems.map((item) => renderItemCard(item))}
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

            {/* Add Product Popup */}
            <ProductPopup
                isOpen={showProductPopup}
                onClose={handleClosePopup}
                productId={selectedProduct?._id}
                productGroupId={selectedProductGroup?._id}
                categoryId={null} // You can pass these if needed
                subCategoryId={null}
                subCategoryTwoId={null}
                brandId={null}
                categorySlug={null}
                subCategorySlug={null}
                subCategoryTwoSlug={null}
                brandSlug={null}
                setFilters={setFilters}
                clearFilters={clearFilters}
                wishListItems={wishListItems}
                setWishlistItems={setWishlistItems}
                customerGroupsDiscounts={customerGroupsDiscounts}
                itemBasedDiscounts={itemBasedDiscounts}
            />
        </div>
    )
}

export default SearchPage;