"use client"

import { useEffect, useState } from "react"
import ProductPopup from "../product-details-components/Popup"
import Image from "next/image"
import { Heart, HeartIcon, Minus, Plus } from "lucide-react"
import { useRouter, useSearchParams, } from "next/navigation"
import axiosInstance from "@/axios/axiosInstance"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import ProductDetail from '@/components/product-details-components/ProductDetails'
import { sub } from "framer-motion/client"
import Notification from "../Notification"

const ProductListing = () => {
    const [sortBy, setSortBy] = useState("Newest")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedProductGroup, setSelectedProductGroup] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showProductPopup, setShowProductPopup] = useState(false)
    const [perpageItems, setPerpageItems] = useState('15')
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [productGroups, setProductGroups] = useState([])
    const [allItems, setAllItems] = useState([]) // Combined products and product groups
    const [error, setError] = useState(null)
    const [productQuantities, setProductQuantities] = useState({})
    const [productGroupQuantities, setProductGroupQuantities] = useState({})
    const [selectedUnits, setSelectedUnits] = useState({})
    const currentUser = useUserStore((state) => state.user);
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [stockErrors, setStockErrors] = useState({})
    const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
    const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])
    const [toggleWishlistIcon, setToggleWishlistIcon] = useState('')
    const [wishListItems, setWishlistItems] = useState([])

    const [loadingProducts, setLoadingProducts] = useState({})
    const [loadingWishlist, setLoadingWishlist] = useState({})
    const [loadingCart, setLoadingCart] = useState({})

    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const currentCartItems = useCartStore((state) => state.currentItems);
    const [selectedPackType, setSelectedPackType] = useState('')
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({})
    const [subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory] = useState({})

    const [hoveredCategory, setHoveredCategory] = useState(null)
    const [expandedCategory, setExpandedCategory] = useState(null)
    const [hoveredSubCategory, setHoveredSubCategory] = useState(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const [customerSpecificAmountGroups, setCustomerSpecificAmountGroups] = useState({})

    const handleClosePopup = () => {
        setShowProductPopup(false);
        setSelectedProduct(null);
        setSelectedProductGroup(null);
    }

    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success' // 'success' or 'error'
    })

    // Function to show notification
    const showNotification = (message, type = 'success') => {
        setNotification({
            isVisible: true,
            message,
            type
        })
    }

    // Function to hide notification
    const hideNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }))
    }

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        if (searchQuery !== '') {
            router.push(`/search?q=${searchQuery}`);
        }
    }, [searchParams])

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
        productID,
        productGroupId
    } = useProductFiltersStore()

    console.log("product group id in product listing ", productGroupId)
    console.log("product id  product listing ", productID)

    // Categories state for sidebar
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)

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

    // Calculate discounted price for both products and product groups
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

            // Find matching pricing group discount for this customer
            const groupDiscountDoc = customerGroupsDiscounts.find(
                discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
            );

            if (groupDiscountDoc) {
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount) {
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

    // Get discount percentage for display
    const getDiscountPercentage = (item, isProductGroup = false) => {
        // If item has comparePrice, show comparePrice discount
        if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
            const originalPrice = isProductGroup ? (item.eachPrice || 0) : (item.eachPrice || 0);
            const discountAmount = originalPrice - item.comparePrice;
            const discountPercentage = (discountAmount / originalPrice) * 100;
            return Math.round(discountPercentage);
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

            if (groupDiscountDoc) {
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount) {
                    return parseFloat(customerDiscount.percentage);
                }
            }
        }

        return null;
    };

    // Check if item has any discount or comparePrice
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
        return cartItems?.find(item => {
            if (isProductGroup) {
                return item.productGroup && item.productGroup._id === itemId;
            } else {
                return item.product && item.product._id === itemId;
            }
        });
    }

    // Calculate total quantity based on pack quantity and units
    const calculateTotalQuantity = (itemId, isProductGroup = false, packId = null, unitsQty = null) => {
        let item;
        let quantities;
        let selectedUnitsState;

        if (isProductGroup) {
            item = productGroups.find(p => p._id === itemId);
            quantities = productGroupQuantities;
            selectedUnitsState = selectedUnits; // Product groups use the same selectedUnits state
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
            (item.typesOfPacks?.find(pack => pack._id === packIdToUse) ? parseInt(item.typesOfPacks.find(pack => pack._id === packIdToUse).quantity) : 1);

        return packQuantity * unitsToUse;
    }

    // Check if requested quantity exceeds stock
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
            message: isValid ? null : `Exceeds available stock (${stockLevel})`,
            requestedQuantity: totalRequestedQuantity,
            currentStock: stockLevel
        };
    }

    const handleProductClick = (itemName, itemId, isProductGroup = false) => {

        console.log("is product group", isProductGroup, itemId)

        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: subCategorySlug || null,
            subCategoryTwoSlug: subCategoryTwoSlug || null,
            brandSlug: brandSlug || null,
            brandId: brandId || null,
            categoryId: categoryId || null,
            subCategoryId: subCategoryId || null,
            subCategoryTwoId: subCategoryTwoId || null,
            productID: isProductGroup ? null : itemId,
            productGroupId: isProductGroup ? itemId : null
        });

        const itemSlug = itemName.replace(/\s+/g, '-').toLowerCase();
        router.push(`/${itemSlug}`);
    }

    const handleProductImageClick = (item, isProductGroup = false) => {
        if (isProductGroup) {
            setSelectedProductGroup(item);
        } else {
            setSelectedProduct(item);
        }
        setShowProductPopup(true);
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
        const selectedPack = product.typesOfPacks.find(pack => pack._id === unitId)
        setSelectedPackType(selectedPack.name)

        console.log("selected pack on unit change", selectedPack)

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
                (item.typesOfPacks?.find(pack => pack._id === selectedUnits[itemId]) ?
                    parseInt(item.typesOfPacks.find(pack => pack._id === selectedUnits[itemId]).quantity) : 1);

            const unitsQuantity = quantitiesState[itemId] || 1;
            const totalQuantity = packQuantity * unitsQuantity;

            // Calculate the discounted price for this item
            const discountedPrice = calculateDiscountedPrice(item, isProductGroup);

            // Calculate total amount using the discounted price
            const totalAmount = discountedPrice;

            // Determine discount type and percentage
            let discountType = "";
            let discountPercentages = 0;

            // Priority 1: Check comparePrice discount
            if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
                const originalPrice = isProductGroup ? item.eachPrice : item.eachPrice;
                const discountAmount = originalPrice - item.comparePrice;
                discountPercentages = Math.round((discountAmount / originalPrice) * 100);
                discountType = "compare_price";
            }
            // Priority 2: Check item-based discount
            else if (currentUser && currentUser.customerId) {
                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    discountPercentages = itemDiscount.percentage;
                    discountType = "item_based";
                }
                // Priority 3: Check pricing group discount
                else if (item.pricingGroup) {
                    const itemPricingGroupId = typeof item.pricingGroup === 'object'
                        ? item.pricingGroup._id
                        : item.pricingGroup;

                    const groupDiscountDoc = customerGroupsDiscounts.find(
                        discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
                    );

                    if (groupDiscountDoc) {
                        const customerDiscount = groupDiscountDoc.customers.find(
                            customer => customer.user.customerId === currentUser.customerId
                        );

                        if (customerDiscount) {
                            discountPercentages = parseFloat(customerDiscount.percentage);
                            discountType = "pricing_group";
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
                packType: isProductGroup ? 'Each' : (item.typesOfPacks?.find(pack => pack._id === selectedUnits[itemId]) ?
                    item.typesOfPacks.find(pack => pack._id === selectedUnits[itemId]).name : 'Each'),
                amount: totalAmount,
                discountType: discountType,
                discountPercentages: discountPercentages
            };

            const response = await axiosInstance.post('cart/add-to-cart', cartData);

            if (response.data.statusCode === 200) {
                await fetchCustomersCart();
                setCartItemsCount(response.data.data.cartItems.length);
                setError(null);

                // Show success notification
                const action = isItemInCart(itemId, isProductGroup) ? "updated in" : "added to";
                const itemName = isProductGroup ? item.name : item.ProductName;
                showNotification(`${itemName} ${action} cart successfully!`);

                // Clear any stock errors after successful add
                setStockErrors(prev => ({
                    ...prev,
                    [itemId]: null
                }));
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification("Failed to add item to cart", "error");
        } finally {
            setLoadingCart(prev => ({ ...prev, [itemId]: false }));
        }
    }

    // Add/Remove item from wishlist (for both products and product groups)
    const handleAddToWishList = async (itemId, isProductGroup = false) => {
        try {
            if (!currentUser || !currentUser._id) {
                setError("Please login to manage wishlist");
                return;
            }

            setLoadingWishlist(prev => ({ ...prev, [itemId]: true }));

            const response = await axiosInstance.post('wishlist/add-to-wishlist', {
                customerId: currentUser._id,
                productId: isProductGroup ? null : itemId,
                productGroupId: isProductGroup ? itemId : null
            });

            console.log("Wishlist response:", response.data);

            if (response.data.statusCode === 200) {
                // Refresh the wishlist to get updated data
                await fetchCustomersWishList();
                setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);

                // Show notification
                const item = isProductGroup ?
                    productGroups.find(p => p._id === itemId) :
                    products.find(p => p._id === itemId);
                const itemName = isProductGroup ? item?.name : item?.ProductName;
                const action = isItemInWishlist(itemId, isProductGroup) ? "removed from" : "added to";
                showNotification(`${itemName} ${action} wishlist!`);
            }
        } catch (error) {
            console.error('Error managing item in wishlist:', error);
            setError('Error managing wishlist');
            showNotification("Failed to update wishlist", "error");
        } finally {
            setLoadingWishlist(prev => {
                const updatedLoadingWishlist = { ...prev };
                updatedLoadingWishlist[itemId] = false;
                return updatedLoadingWishlist;
            });
        }
    }

    // CORRECTED: Map sort options to backend parameters
    const getSortParams = (sortOption) => {
        switch (sortOption) {
            case "Price Low to High":
                return { sortBy: "eachPrice", sortOrder: "asc" };
            case "Price High to Low":
                return { sortBy: "eachPrice", sortOrder: "desc" };
            case "Newest":
                return { sortBy: "createdAt", sortOrder: "desc" };
            case "Best Seller":
            default:
                return { sortBy: "createdAt", sortOrder: "desc" };
        }
    }

    // CORRECTED: Fetch products and product groups with filters
    // CORRECTED: Fetch products and product groups with filters
    const fetchItems = async (page = currentPage, itemsPerPage = perpageItems, sortOption = sortBy) => {
        try {
            setLoading(true);
            const sortParams = getSortParams(sortOption);

            // Build query parameters based on URL params
            const queryParams = {
                page: page,
                limit: itemsPerPage,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder
            };

            // Add filter parameters if they exist
            if (categoryId) queryParams.categoryId = categoryId;
            if (subCategoryId) queryParams.subCategoryId = subCategoryId;
            if (subCategoryTwoId) queryParams.subCategoryTwoId = subCategoryTwoId;
            if (brandId) queryParams.brandId = brandId;

            console.log("Fetching items with params:", queryParams);

            // Fetch both products and product groups in parallel
            const [productsResponse, productGroupsResponse] = await Promise.all([
                axiosInstance.get('products/get-products-by-filters', { params: queryParams }),
                axiosInstance.get('product-group/get-product-groups-by-filters', { params: queryParams })
            ]);

            console.log("Products response:", productsResponse.data);
            console.log("Product groups response:", productGroupsResponse.data);

            let productsData = [];
            let productGroupsData = [];

            if (productsResponse.data.statusCode === 200) {
                productsData = productsResponse.data.data.products || [];
            }

            if (productGroupsResponse.data.statusCode === 200) {
                productGroupsData = productGroupsResponse.data.data.productGroups || [];
            }

            // Combine products and product groups
            const combinedItems = [
                ...productsData.map(item => ({ ...item, type: 'product' })),
                ...productGroupsData.map(item => ({ ...item, type: 'productGroup' }))
            ];

            // Apply client-side sorting
            const sortedItems = applyClientSideSorting(combinedItems, sortOption);

            setProducts(productsData);
            setProductGroups(productGroupsData);
            setAllItems(sortedItems);

            // CORRECTED: Use the correct pagination info from products response
            const productsPagination = productsResponse.data.data?.pagination;
            const productGroupsPagination = productGroupsResponse.data.data?.pagination;

            // Use products pagination as primary (since getAllProducts returns products pagination)
            const paginationInfo = productsPagination || productGroupsPagination || {
                currentPage: 1,
                totalPages: 1,
                totalProducts: 0
            };

            setCurrentPage(paginationInfo.currentPage || 1);
            setTotalPages(paginationInfo.totalPages || 1);
            setTotalItems(paginationInfo.totalProducts || paginationInfo.totalProductGroups || 0);

            // Initialize quantities and selected units for products
            const initialQuantities = {};
            const initialUnits = {};
            productsData.forEach(product => {
                initialQuantities[product._id] = 1;
                if (product.typesOfPacks && product.typesOfPacks.length > 0) {
                    initialUnits[product._id] = product.typesOfPacks[0]._id;
                }
            });
            setProductQuantities(initialQuantities);
            setSelectedUnits(initialUnits);

            // Initialize quantities for product groups (no units for product groups)
            const initialProductGroupQuantities = {};
            productGroupsData.forEach(productGroup => {
                initialProductGroupQuantities[productGroup._id] = 1;
            });
            setProductGroupQuantities(initialProductGroupQuantities);

            // Clear all stock errors when fetching new items
            setStockErrors({});

        } catch (error) {
            console.error('Error fetching items:', error);
            setError('An error occurred while fetching items');
            setProducts([]);
            setProductGroups([]);
            setAllItems([]);
            setTotalItems(0);
            setCurrentPage(1);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }

    // NEW: Client-side sorting function for combined items
    const applyClientSideSorting = (items, sortOption) => {
        const sortedItems = [...items];

        switch (sortOption) {
            case "Price Low to High":
                return sortedItems.sort((a, b) => {
                    const priceA = calculateDiscountedPrice(a, a.type === 'productGroup');
                    const priceB = calculateDiscountedPrice(b, b.type === 'productGroup');
                    return priceA - priceB;
                });

            case "Price High to Low":
                return sortedItems.sort((a, b) => {
                    const priceA = calculateDiscountedPrice(a, a.type === 'productGroup');
                    const priceB = calculateDiscountedPrice(b, b.type === 'productGroup');
                    return priceB - priceA;
                });

            case "Newest":
                return sortedItems.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });

            default:
                return sortedItems;
        }
    }

    // Fetch categories for sidebar
    const fetchCategoriesForBrand = async () => {
        if (!brandId) return;

        try {
            setLoadingCategories(true);
            const res = await axiosInstance.get(`category/get-categories-by-brand-id/${brandId}`);

            console.log("categories by brand = ", res.data.data);

            if (res.data.statusCode === 200) {
                setCategories(res.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }

    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

            console.log("Cart items:", response.data);
            if (response.data.statusCode === 200) {
                const cartData = response.data.data.cartItems || response.data.data || [];
                setCartItems(cartData);
                setCartItemsCount(cartData.length);

                // Force a re-render to update the UI
                setProducts(prev => [...prev]);
                setProductGroups(prev => [...prev]);
            }
        } catch (error) {
            console.error('Error fetching customer cart:', error);
        }
    }

    // Fetch groups discount
    const fetchCustomersGroupsDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return;

            const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser._id}`);

            console.log("pricing groups discounts by userid ", response);

            if (response.data.statusCode === 200) {
                setCustomerGroupsDiscounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching customer groups discounts:', error);
        }
    }

    // Fetch item based discounts 
    const fetchItemBasedDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return;

            const response = await axiosInstance.get(`item-based-discount/get-items-based-discount-by-customer-id/${currentUser.customerId}`);

            console.log("item based discounts", response);

            if (response.data.statusCode === 200) {
                setItemBasedDiscounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching item based discounts:', error);
        }
    }

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`);

            console.log("customers wishlist response:", response.data);

            if (response.data.statusCode === 200) {
                // Set the wishlist items from response.data.data
                setWishlistItems(response.data.data || []);
                setWishlistItemsCount(response.data.data?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching customer wishlist:', error);
        }
    }

    // CORRECTED: Handle sort change
    const handleSortChange = (e) => {
        const newSortBy = e.target.value;
        setSortBy(newSortBy);
        setCurrentPage(1); // Reset to first page when sorting changes
        fetchItems(1, perpageItems, newSortBy);
    }

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerpageItems(newPerPage);
        setCurrentPage(1); // Reset to first page when items per page changes
        fetchItems(1, newPerPage, sortBy);
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchItems(page, perpageItems, sortBy);
    }

    // Handle category click in sidebar
    const handleCategoryClick = (categorySlug, categoryId, brandId) => {
        // If clicking the same category, toggle expansion
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categoryId);
            fetchSubCategoriesForCategory(categoryId);
        }

        // Navigate to category
        const parts = categorySlug?.split("/").filter(Boolean);
        router.replace(`${parts[1]}`);
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: null,
            subCategoryTwoSlug: null,
            categoryId: categoryId,
            subCategoryId: null,
            subCategoryTwoId: null,
            brandId: brandId
        });
    }

    // Get page title based on current filter
    const getPageTitle = () => {
        if (subCategoryTwoSlug) return `${brandSlug}/${subCategoryTwoSlug?.split('/')[2]}`;
        if (subCategorySlug) return `${subCategorySlug}`;
        if (categorySlug) return categorySlug?.split('-').join(' ').toUpperCase();
        return "ALL PRODUCTS";
    };

    // Get page description based on current filter
    const getPageDescription = () => {
        if (subCategoryTwoSlug) return `Browse our collection of ${subCategoryTwoSlug.replace(/-/g, ' ')} products`
        if (subCategorySlug) return `Explore our range of ${subCategorySlug.replace(/-/g, ' ')} products`
        if (categorySlug) return `Discover our ${categorySlug.replace(/-/g, ' ')} collection`
        return "Browse our complete product catalog"
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

    // CORRECTED: Apply both sequence sorting and current sort
    const getSortedItems = () => {
        let sorted = sortItemsBySequenceAndDate(allItems);
        // Apply current sort option on top of sequence sorting
        return applyClientSideSorting(sorted, sortBy);
    };

    const sortedItems = getSortedItems();

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
                className="rounded-lg p-3 sm:p-4 mx-auto relative cursor-pointer transition-all max-w-sm sm:max-w-none"
            >
                {/* Wishlist Icon */}
                <div className="absolute top-2 right-4 sm:right-6 z-10">
                    <button
                        className="rounded-full transition-colors"
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

                {/* Product Badge */}
                {!isProductGroup && item.badge && (
                    <div className="absolute top-2 left-4 sm:left-6 z-10">
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

                {/* Item Image */}
                <div className="flex justify-center mb-3 sm:mb-4 rounded-lg">
                    <img
                        src={isProductGroup ? (item.thumbnail || "/placeholder.svg") : (item.images || "/placeholder.svg")}
                        alt={isProductGroup ? item.name : item.ProductName}
                        className="w-24 h-32 sm:w-28 sm:h-36 lg:w-32 lg:h-40 object-contain"
                        onClick={() => handleProductImageClick(item, isProductGroup)}
                    />
                </div>

                {/* Item Info */}
                <div className="text-start space-y-2 lg:max-w-[229px]">
                    {/* Item Name */}
                    <h3
                        onClick={() => handleProductClick(isProductGroup ? item.name : item.ProductName, itemId, isProductGroup)}
                        className="text-sm sm:text-base hover:text-[#E9098D] xl:h-[50px] lg:text-[16px] font-[500] text-black font-spartan leading-tight uppercase"
                    >
                        {isProductGroup ? item.name : item.ProductName}
                    </h3>

                    {/* SKU */}
                    <div className="space-y-1 flex justify-between items-center">
                        <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                            SKU {isProductGroup ? item.sku : item.sku}
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
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl md:text-[24px] font-semibold text-[#2D2C70]">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {discountedPrice < item.eachPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                ${isProductGroup ? (item.eachPrice ? item.eachPrice.toFixed(2) : '0.00') : (item.eachPrice ? item.eachPrice.toFixed(2) : '0.00')}
                            </span>
                        )}
                    </div>

                    {/* Product Group Info */}
                    {isProductGroup && item.products && item.products.length > 0 && (
                        <div className="mt-4 mb-6 text-xs text-gray-600">
                            Includes {item.products.length} product(s)
                        </div>
                    )}

                    {/* Discount Badge */}
                    {/* {hasItemDiscount && discountPercentage !== null && discountPercentage !== 0 && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold w-fit">
                            {discountPercentage}% OFF
                        </div>
                    )} */}

                    {/* Stock Error Message */}
                    {stockError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {stockError}
                        </div>
                    )}

                    {/* Units Dropdown (only for products, not product groups) */}
                    {!isProductGroup && item.typesOfPacks && item.typesOfPacks.length > 0 && (
                        <div className="mb-3 flex space-x-12 align-center items-center font-spartan">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                            <div className="relative w-full">
                                <select
                                    value={selectedUnits[itemId] || ''}
                                    onChange={(e) => handleUnitChange(itemId, e.target.value, item)}
                                    disabled={isOutOfStock}
                                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                    focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                    appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    {item.typesOfPacks && item.typesOfPacks.length > 0 ? (
                                        item.typesOfPacks.map((pack) => (
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
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <div className="flex items-center space-x-4">
                            <button
                                className="w-[32px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(itemId, -1, isProductGroup);
                                }}
                                disabled={currentQuantity <= 1}
                            >
                                <span className="text-xl font-bold flex items-center">
                                    <Image src="/icons/minus-icon.png"
                                        alt="Minus"
                                        width={12}
                                        height={12}
                                    />
                                </span>
                            </button>
                            <span className="text-[1rem] font-spartan font-medium min-w-[2rem] text-center">
                                {currentQuantity}
                            </span>
                            <button
                                className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(itemId, 1, isProductGroup);
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
                            className={`flex items-center justify-center border border-black flex-1 gap-2 text-[1rem] font-semibold border rounded-lg py-2 px-6 transition-colors duration-300 group ${isOutOfStock || isCartLoading || stockError
                                ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]'
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
                                    className="w-5 h-5 transition-colors duration-300"
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
                                    : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999]'
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
        if (categoryId || subCategoryId || subCategoryTwoId || brandId) {
            fetchItems()
            fetchCategoriesForBrand()
        }
    }, [categoryId, subCategoryId, subCategoryTwoId, brandId])

    // Generate pagination buttons
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
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
            >
                &larr; Previous
            </button>
        )

        // First page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                    1
                </button>
            )
            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis1" className="px-3 py-2 text-gray-500 font-medium">
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
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${currentPage === i
                        ? 'bg-[#2D2C70] text-white border-[#2D2C70]'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400'
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
                    <span key="ellipsis2" className="px-3 py-2 text-gray-500 font-medium">
                        ...
                    </span>
                )
            }
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
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
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
            >
                Next &rarr;
            </button>
        )

        return buttons
    }

    // Update the fetchSubCategoriesForCategory function
    const fetchSubCategoriesForCategory = async (categoryId) => {
        if (subCategoriesByCategory[categoryId]) return // Already fetched

        try {
            const res = await axiosInstance.get(`subcategory/get-sub-categories-by-category-id/${categoryId}`)

            console.log("subCategories by categoryId:", res.data.data)
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

            console.log("subCategoriesTwo by subCategoryId:", res.data.data)

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

        router.replace(`/${subCategorySlug}`)
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: subCategorySlug,
            subCategoryTwoSlug: null,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            subCategoryTwoId: null,
            brandSlug: brandSlug,
            brandId: brandId
        })
        // Keep subcategory expanded when clicked
        setExpandedCategory(categoryId);
    }

    const handleMinCategoryClick = (categorySlug, categoryId) => {
        console.log("main categoryyyyyyyyyyyyyyyyyyy", categorySlug)

        router.replace(`/${categorySlug}`)
        setFilters({
            categorySlug: categorySlug,
            subCategorySlug: null,
            subCategoryTwoSlug: null,
            categoryId: categoryId,
            subCategoryId: null,
            subCategoryTwoId: null,
            brandId: brandId,
            brandSlug: brandSlug
        })
        // Keep subcategory expanded when clicked
        setExpandedCategory(categoryId);
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
            brandId: brandId,
            brandSlug: brandSlug
        })
        // Keep category and subcategory expanded when clicked
        setExpandedCategory(categoryId);
    }

    if (!productID && !productGroupId) {
        return (
            <div className="min-h-screen">

                <Notification
                    message={notification.message}
                    type={notification.type}
                    isVisible={notification.isVisible}
                    onHide={hideNotification}
                />

                {/* Breadcrumb */}
                <div className="bg-white justify-items-center pt-4">
                    <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                        <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                            <span className="hidden sm:inline"> {getPageTitle()}</span>
                        </nav>

                    </div>
                    <h1 className="text-lg sm:text-xl lg:text-[2rem] text-[#2D2C70] mt-6 font-bold font-spartan pb-3 sm:pb-5 tracking-widest">
                        {
                            subCategoryTwoSlug?.split('/').pop().split('-').join(' ').toUpperCase() ||
                            subCategorySlug?.split('/').pop().split('-').join(' ').toUpperCase() ||
                            categorySlug?.split('/').pop().split('-').join(' ').toUpperCase() ||
                            brandSlug?.split('-').join(' ').toUpperCase()
                        }
                    </h1>
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

                        {/* // Sidebar Filter */}
                        {brandId && (
                            <div className="space-y-2 max-h-64 lg:max-h-none overflow-y-auto hide-scrollbar px-2">
                                <h1 className="px-2 text-lg font-bold ">{categorySlug?.split('/').pop().split('-').join(' ').toUpperCase()}</h1>
                                {loadingCategories ? (
                                    <div className="py-2 text-sm text-gray-500">Loading categories...</div>
                                ) : categories.length > 0 ? (
                                    categories.map((category) => {
                                        // Check if category has subcategories (either already fetched or we need to fetch them)
                                        const hasSubcategories = subCategoriesByCategory[category._id]?.length > 0;

                                        return (
                                            <div
                                                key={category._id}
                                                className="border-b border-dashed border-b-1 border-black"
                                            >
                                                {/* Main Category */}
                                                <div
                                                    onMouseEnter={() => {
                                                        // Only fetch subcategories if they haven't been fetched yet
                                                        if (!subCategoriesByCategory[category._id]) {
                                                            fetchSubCategoriesForCategory(category._id);
                                                        }
                                                        setHoveredCategory(category._id);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMinCategoryClick(category.slug, category._id);
                                                    }}
                                                    className={`flex justify-between items-center py-1 px-2 hover:text-[#e9098d]/70 cursor-pointer transition-colors text-sm lg:text-[16px] font-[400] font-spartan ${categoryId === category._id ? "text-[#e9098d]" : "text-black hover:bg-gray-50"}`}
                                                >
                                                    <span className={`text-xs sm:text-sm lg:text-[16px] font-medium font-spartan hover:text-[#e9098d]/50 ${categoryId === category._id ? "text-[#e9098d]" : "text-black"}`}>
                                                        {category.name}
                                                    </span>
                                                    {/* Show arrow only if category has subcategories */}
                                                    {hasSubcategories && (
                                                        <svg
                                                            className={`w-4 h-4 transition-transform ${hoveredCategory === category._id ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Subcategories - Displayed as nested list */}
                                                {hoveredCategory === category._id && hasSubcategories && (
                                                    <div className="ml-4 mt-1 space-y-1 pb-2">
                                                        {subCategoriesByCategory[category._id].map((subCategory) => {
                                                            // Check if subcategory has subcategories two
                                                            const hasSubcategoriesTwo = subCategoriesTwoBySubCategory[subCategory._id]?.length > 0;

                                                            return (
                                                                <div
                                                                    key={subCategory._id}
                                                                    className="relative"
                                                                >
                                                                    <div
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSubCategoryClick(subCategory.slug, subCategory._id);
                                                                        }}
                                                                        onMouseEnter={() => {
                                                                            // Only fetch subcategories two if they haven't been fetched yet
                                                                            if (!subCategoriesTwoBySubCategory[subCategory._id]) {
                                                                                fetchSubCategoriesTwoForSubCategory(subCategory._id);
                                                                            }
                                                                            setHoveredSubCategory(subCategory._id);
                                                                        }}
                                                                        className={`flex justify-between items-center py-1 px-2 rounded cursor-pointer transition-colors text-sm ${subCategoryId === subCategory._id ? "bg-[#e9098d] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                                                    >
                                                                        <span className="text-base">{subCategory.name}</span>
                                                                        {/* Show arrow only if subcategory has subcategories two */}
                                                                        {hasSubcategoriesTwo && (
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    {/* Subcategories Two - Displayed as nested list */}
                                                                    {hoveredSubCategory === subCategory._id && hasSubcategoriesTwo && (
                                                                        <div className="ml-4 mt-1 space-y-1">
                                                                            {subCategoriesTwoBySubCategory[subCategory._id].map((subCategoryTwo) => (
                                                                                <div
                                                                                    key={subCategoryTwo._id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleSubCategoryTwoClick(subCategoryTwo.slug, subCategoryTwo._id);
                                                                                    }}
                                                                                    className={`py-1 px-2 rounded cursor-pointer transition-colors text-base ${subCategoryTwoId === subCategoryTwo._id ? "bg-[#e9098d] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                                                                >
                                                                                    {subCategoryTwo.name}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-2 text-sm text-gray-500">No categories available</div>
                                )}
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Products Header */}
                            <div className="bg-white rounded-lg pb-3 lg:pb-4 mb-4 lg:mb-0 ">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                                    <h2 className="text-lg lg:text-[1.2rem] font-[400] text-black">
                                        Items <span className="text-[#000000]/60">({totalItems})</span>
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
                                                    <option value="10" className="text-[15px] font-medium">10 Per Page</option>
                                                    <option value="15" className="text-[15px] font-medium">15 Per Page</option>
                                                    <option value="20" className="text-[15px] font-medium">20 Per Page</option>
                                                    <option value="25" className="text-[15px] font-medium">25 Per Page</option>
                                                    <option value="30" className="text-[15px] font-medium">30 Per Page</option>
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

                            {/* Items Grid */}
                            {!loading && (
                                <>
                                    {sortedItems.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-12 max-h-full border-t-2 border-[#2D2C70] pt-1">
                                                {sortedItems.map((item) => renderItemCard(item))}
                                            </div>

                                            {/* Pagination */}
                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-4">
                                                    {/* Items count and page info */}
                                                    <div className="text-sm text-gray-600 font-spartan">
                                                        Showing {((currentPage - 1) * parseInt(perpageItems)) + 1} to {Math.min(currentPage * parseInt(perpageItems), totalItems)} of {totalItems} items
                                                    </div>

                                                    {/* Pagination buttons */}
                                                    <div className="flex items-center space-x-2 flex-wrap justify-center">
                                                        {renderPaginationButtons()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-lg text-gray-500">No items found for the selected category.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <ProductPopup
                    isOpen={showProductPopup}
                    onClose={handleClosePopup}
                    productId={selectedProduct?._id}
                    productGroupId={selectedProductGroup?._id}
                    categoryId={categoryId}
                    subCategoryId={subCategoryId}
                    subCategoryTwoId={subCategoryTwoId}
                    brandId={brandId}
                    categorySlug={categorySlug}
                    subCategorySlug={subCategorySlug}
                    subCategoryTwoSlug={subCategoryTwoSlug}
                    brandSlug={brandSlug}
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

    return (
        <ProductDetail />
    )
}

export default ProductListing