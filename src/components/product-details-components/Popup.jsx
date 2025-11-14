"use client"

import axiosInstance from "@/axios/axiosInstance"
import { ArrowRight, Check, Heart, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"

export default function ProductPopup({
    isOpen,
    onClose,
    productId,
    productGroupId,
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
    wishListItems,
    setWishlistItems,
    customerGroupsDiscounts,
    itemBasedDiscounts
}) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedUnitId, setSelectedUnitId] = useState("")
    const [itemImages, setItemImages] = useState([])
    const [product, setProduct] = useState(null)
    const [productGroup, setProductGroup] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [error, setError] = useState(null)
    const [stockError, setStockError] = useState(null)
    const [loadingCart, setLoadingCart] = useState(false)
    const [loadingWishlist, setLoadingWishlist] = useState(false)
   

    // State to track if we're showing a product or product group
    const [itemType, setItemType] = useState(null) // 'product' or 'productGroup'

    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const currentCartItems = useCartStore((state) => state.currentItems);
    const currentUser = useUserStore((state) => state.user)
    const router = useRouter()

    // Determine item type based on provided IDs
    useEffect(() => {
        setProduct(null);
        setProductGroup(null);
        setItemType(null);
        setItemImages([]);
        setSelectedImage(0);
        setQuantity(1);
        setSelectedUnitId("");

        if (productId) {
            setItemType('product');
            fetchProductDetail(productId);
        } else if (productGroupId) {
            setItemType('productGroup');
            fetchProductGroupDetail(productGroupId);
        }
    }, [productId, productGroupId]); // Add dependencies here
    // Get current item (product or product group)
    const getCurrentItem = () => {
        return itemType === 'product' ? product : productGroup;
    };

    // Get item name
    const getItemName = () => {
        const item = getCurrentItem();
        if (!item) return '';
        return itemType === 'product' ? item.ProductName : item.name;
    };

    // Get item SKU
    const getItemSku = () => {
        const item = getCurrentItem();
        if (!item) return '';
        return item.sku;
    };

    // Get item images for both products and product groups
    const getItemImages = (item) => {
        if (!item) return [];

        console.log("item type in getItemImages:", itemType);
        console.log("item data:", item);

        try {
            // If we can determine the type from the item structure itself, use that
            const determinedType = item.products !== undefined ? 'productGroup' : 'product';
            console.log("Determined type from item structure:", determinedType);

            if (determinedType === 'product') {
                // Handle product images
                if (Array.isArray(item.images) && item.images.length > 0) {
                    return item.images.filter(img => img && img.trim() !== '');
                } else if (typeof item.images === 'string' && item.images.trim() !== '') {
                    return [item.images];
                } else if (Array.isArray(item.allImages) && item.allImages.length > 0) {
                    return item.allImages.filter(img => img && img.trim() !== '');
                }
                return []; // No images for product

            } else if (determinedType === 'productGroup') {
                // Use the separate function for product groups
                return getItemImagesForProductGroup(item);
            }
        } catch (error) {
            console.error("Error getting item images:", error);
        }

        return [];
    };

    // Separate function for product group images
    const getItemImagesForProductGroup = (item) => {
        if (!item) return [];

        console.log("Getting images for product group:", item.name);

        const allImages = [];
        const addedUrls = new Set(); // Track added URLs to avoid duplicates

        // Check thumbnailUrl first (full URL)
        if (item.thumbnailUrl && item.thumbnailUrl.trim() !== '' && !addedUrls.has(item.thumbnailUrl)) {
            console.log("Adding thumbnailUrl:", item.thumbnailUrl);
            allImages.push(item.thumbnailUrl);
            addedUrls.add(item.thumbnailUrl);
        }

        // Then check thumbnail (filename) - only add if not already added via thumbnailUrl
        if (item.thumbnail && item.thumbnail.trim() !== '') {
            const thumbnailFullUrl = `https://point-australia.s3.ap-southeast-2.amazonaws.com/product-group-images/${item.thumbnail}`;
            if (!addedUrls.has(thumbnailFullUrl) && !addedUrls.has(item.thumbnailUrl)) {
                console.log("Adding thumbnail as full URL:", thumbnailFullUrl);
                allImages.push(thumbnailFullUrl);
                addedUrls.add(thumbnailFullUrl);
            }
        }

        // Add additional images from images array
        if (item.images && Array.isArray(item.images)) {
            item.images.forEach(image => {
                if (image && image.trim() !== '' && !addedUrls.has(image)) {
                    console.log("Adding additional image:", image);
                    allImages.push(image);
                    addedUrls.add(image);
                }
            });
        }

        // Also check imageUrls if it exists
        if (item.imageUrls && Array.isArray(item.imageUrls)) {
            item.imageUrls.forEach(image => {
                if (image && image.trim() !== '' && !addedUrls.has(image)) {
                    console.log("Adding imageUrl:", image);
                    allImages.push(image);
                    addedUrls.add(image);
                }
            });
        }

        console.log("Final images for product group:", allImages);
        return allImages;
    };

    // Check if item is out of stock
    const isItemOutOfStock = () => {
        const item = getCurrentItem();
        if (!item) return true;

        if (itemType === 'product') {
            return item.stockLevel <= 0;
        } else if (itemType === 'productGroup') {
            // For product groups, check if any product in the group is out of stock
            return item.products && item.products.some(product => product.stockLevel <= 0);
        }
        return true;
    };

    useEffect(() => {
        const item = getCurrentItem();
        if (item && itemType) {
            console.log("Updating images for:", itemType, item.name);
            const images = getItemImages(item);
            setItemImages(images);
            setSelectedImage(0); // Reset to first image
        }
    }, [itemType, product, productGroup]);

    // Get stock level for display
    const getStockLevel = () => {
        const item = getCurrentItem();
        if (!item) return 0;

        if (itemType === 'product') {
            return item.stockLevel;
        } else if (itemType === 'productGroup') {
            // For product groups, return the minimum stock level among products
            if (item.products && item.products.length > 0) {
                return Math.min(...item.products.map(p => p.stockLevel || 0));
            }
            return 0;
        }
        return 0;
    };

    // ✅ UPDATED: Calculate discounted price with new compare price logic
    const calculateDiscountedPrice = (targetItem = null) => {
        const itemToUse = targetItem || getCurrentItem();
        if (!itemToUse) return 0;

        const originalPrice = itemToUse.eachPrice || 0;

        // NEW LOGIC: If item has comparePrice, use original price as selling price
        // and comparePrice becomes the "original" price to show discount
        if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
            // Now we return the original price as selling price
            // comparePrice will be used to calculate discount percentage for display
            return originalPrice;
        }

        // If no comparePrice or comparePrice is 0, check for discounts (existing logic)
        if (!currentUser || !currentUser.customerId) {
            return originalPrice;
        }

        // Priority 2: Check for item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === itemToUse.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return Math.max(0, originalPrice - discountAmount);
        }

        // Priority 3: Check for pricing group discount
        if (itemToUse.pricingGroup) {
            const itemPricingGroupId = typeof itemToUse.pricingGroup === 'object'
                ? itemToUse.pricingGroup._id
                : itemToUse.pricingGroup;

            // Find matching pricing group discount for this customer
            const groupDiscountDoc = customerGroupsDiscounts.find(
                discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
            );

            if (groupDiscountDoc) {
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user && customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount) {
                    const percentage = parseFloat(customerDiscount.percentage);
                    // Handle both positive and negative percentages
                    if (percentage > 0) {
                        // Positive percentage means price increase
                        return originalPrice + (originalPrice * percentage / 100);
                    } else {
                        // Negative percentage means price decrease
                        return Math.max(0, originalPrice - (originalPrice * Math.abs(percentage) / 100));
                    }
                }
            }
        }

        // If no discounts apply, return original price
        return originalPrice;
    };

    // ✅ UPDATED: Get discount percentage for display with new compare price logic
    const getDiscountPercentage = (targetItem = null) => {
        const itemToUse = targetItem || getCurrentItem();
        if (!itemToUse) return null;

        const originalPrice = itemToUse.eachPrice || 0;

        // NEW LOGIC: If product has comparePrice, calculate discount percentage
        if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
            if (itemToUse.comparePrice > originalPrice && originalPrice > 0) {
                const discountAmount = itemToUse.comparePrice - originalPrice;
                const discountPercentage = (discountAmount / itemToUse.comparePrice) * 100;
                return Math.round(discountPercentage);
            }
            return null;
        }

        if (!currentUser || !currentUser.customerId) {
            return null;
        }

        // Check item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === itemToUse.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            return itemDiscount.percentage;
        }

        // Check pricing group discount
        if (itemToUse.pricingGroup) {
            const itemPricingGroupId = typeof itemToUse.pricingGroup === 'object'
                ? itemToUse.pricingGroup._id
                : itemToUse.pricingGroup;

            const groupDiscountDoc = customerGroupsDiscounts.find(
                discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
            );

            if (groupDiscountDoc) {
                const customerDiscount = groupDiscountDoc.customers.find(
                    customer => customer.user && customer.user.customerId === currentUser.customerId
                );

                if (customerDiscount) {
                    return parseFloat(customerDiscount.percentage);
                }
            }
        }

        return null;
    };

    // ✅ UPDATED: Check if item has any discount or comparePrice
    const hasDiscount = (targetItem = null) => {
        const itemToUse = targetItem || getCurrentItem();
        if (!itemToUse) return false;

        // Check if product has comparePrice discount
        if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
            const originalPrice = itemToUse.eachPrice || 0;
            if (itemToUse.comparePrice > originalPrice) {
                return true;
            }
        }

        // Check if product has item-based or pricing group discount
        return getDiscountPercentage(itemToUse) !== null;
    };

    // ✅ UPDATED: Get the price to show as "original" price (for strikethrough)
    const getOriginalPriceForDisplay = (targetItem = null) => {
        const itemToUse = targetItem || getCurrentItem();
        if (!itemToUse) return 0;

        // If compare price exists and is higher than current price, show compare price as original
        if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
            const currentPrice = itemToUse.eachPrice || 0;
            if (itemToUse.comparePrice > currentPrice) {
                return itemToUse.comparePrice;
            }
        }

        // Otherwise, show the actual original price
        return itemToUse.eachPrice || 0;
    };

    const discountedPrice = calculateDiscountedPrice();
    const discountPercentage = getDiscountPercentage();
    const hasItemDiscount = hasDiscount();
    const originalPriceForDisplay = getOriginalPriceForDisplay();

    const incrementQuantity = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        checkStock(newQuantity, selectedUnitId);
    }

    const decrementQuantity = () => {
        const newQuantity = Math.max(1, quantity - 1);
        setQuantity(newQuantity);
        checkStock(newQuantity, selectedUnitId);
    }

    // Calculate total quantity based on pack quantity and units
    const calculateTotalQuantity = (qty = quantity, unitId = selectedUnitId) => {
        const item = getCurrentItem();
        if (!item) return 0;

        // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
        const packQuantity = itemType === 'productGroup' ? 1 :
            (item.typesOfPacks?.find(pack => pack._id === unitId) ?
                parseInt(item.typesOfPacks.find(pack => pack._id === unitId).quantity) : 1);

        return packQuantity * qty;
    };

    // Check if item is in cart
    const isItemInCart = () => {
        const item = getCurrentItem();
        if (!item) return false;

        if (!cartItems || !Array.isArray(cartItems)) {
            return false;
        }

        if (itemType === 'product') {
            return cartItems.some(cartItem => cartItem.product?._id === item._id);
        } else {
            return cartItems.some(cartItem => cartItem.productGroup?._id === item._id);
        }
    };

    // Get cart item for product or product group
    const getCartItem = () => {
        const item = getCurrentItem();
        if (!item) return null;

        if (!cartItems || !Array.isArray(cartItems)) {
            return false;
        }

        if (itemType === 'product') {
            return cartItems.find(cartItem => cartItem.product?._id === item._id);
        } else {
            return cartItems.find(cartItem => cartItem.productGroup?._id === item._id);
        }
    };

    // Check stock level
    const checkStock = (qty = quantity, unitId = selectedUnitId) => {
        const item = getCurrentItem();
        if (!item) return { isValid: true };

        // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
        const packQuantity = itemType === 'productGroup' ? 1 :
            (item.typesOfPacks?.find(pack => pack._id === unitId) ?
                parseInt(item.typesOfPacks.find(pack => pack._id === unitId).quantity) : 1);

        const totalRequestedQuantity = packQuantity * qty;

        const cartItem = getCartItem();
        const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

        const newTotalQuantity = isItemInCart()
            ? totalRequestedQuantity
            : totalRequestedQuantity + currentCartQuantity;

        const stockLevel = getStockLevel();
        const isValid = newTotalQuantity <= stockLevel;

        if (!isValid) {
            setStockError(`Exceeds available stock `);
        } else {
            setStockError(null);
        }

        return {
            isValid,
            message: isValid ? null : `Exceeds available stock `,
            requestedQuantity: totalRequestedQuantity,
            currentStock: stockLevel
        };
    };

    const handleUnitChange = (unitId) => {
        setSelectedUnitId(unitId);
        checkStock(quantity, unitId);
    };

    // Fetch product details
    const fetchProductDetail = async (productId) => {
        try {
            setLoading(true)
            const response = await axiosInstance(`products/get-product/${productId}`)

            if (response.data.statusCode === 200) {
                const productData = response.data.data
                setProduct(productData)
                const images = getItemImages(productData);
                setItemImages(images);

                // Set default selected unit to the first available pack type
                if (productData.typesOfPacks && productData.typesOfPacks.length > 0) {
                    setSelectedUnitId(productData.typesOfPacks[0]._id);
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch product group details
    const fetchProductGroupDetail = async (productGroupId) => {
        try {
            setLoading(true)
            const response = await axiosInstance(`product-group/get-product-group/${productGroupId}`)

            console.log("response of product group", response.data.data.thumbnailUrl)

            if (response.data.statusCode === 200) {
                const productGroupData = response.data.data
                setProductGroup(productGroupData)

                // Set itemType first, then get images
                setItemType('productGroup');

                const images = getItemImagesForProductGroup(productGroupData);
                setItemImages(images);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch cart items
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser?._id) return
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data.items || [])
            }
        } catch (error) {
            console.error("Error fetching customer cart:", error)
        }
    }

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return
            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

            if (response.data.statusCode === 200) {
                setWishlistItems(response.data.data || [])
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer wishlist:', error)
        }
    }

    useEffect(() => {
        if (isOpen && currentUser?._id) {
            fetchCustomersCart()
            fetchCustomersWishList()
        }
    }, [isOpen, currentUser, currentCartItems])

    // Reset quantity when item changes or when cart items update
    useEffect(() => {
        const item = getCurrentItem();
        if (item && cartItems.length >= 0) {
            const cartItem = getCartItem();
            if (cartItem) {
                // Item is in cart - set quantity from cart
                setQuantity(cartItem.unitsQuantity);
                if (itemType === 'product') {
                    const pack = item.typesOfPacks?.find(p => p.name === cartItem.packType);
                    if (pack) {
                        setSelectedUnitId(pack._id);
                    }
                }
            } else {
                // Item not in cart - reset to default
                setQuantity(1);
                if (itemType === 'product' && item.typesOfPacks && item.typesOfPacks.length > 0) {
                    setSelectedUnitId(item.typesOfPacks[0]._id);
                }
            }
            // Clear stock error when item/cart changes
            setStockError(null);
        }
    }, [product, productGroup, cartItems, itemType])

    // ✅ UPDATED: Add to cart function with new compare price logic
    const handleAddToCart = async () => {
        if (!currentUser?._id) {
            setError("Please login to add to cart")
            return
        }

        const item = getCurrentItem();
        if (!item) return;

        // Final stock check before adding to cart
        const stockCheck = checkStock();
        if (!stockCheck.isValid) {
            setError(stockCheck.message);
            return;
        }

        setLoadingCart(true);
        try {
            // For product groups, we don't have typesOfPacks, so use default values
            const packQuantity = itemType === 'productGroup' ? 1 :
                (item.typesOfPacks?.find(p => p._id === selectedUnitId) ?
                    parseInt(item.typesOfPacks.find(p => p._id === selectedUnitId).quantity) : 1);

            const totalQuantity = packQuantity * quantity

            // ✅ UPDATED: Calculate the discounted price using new logic
            const currentDiscountedPrice = calculateDiscountedPrice();

            // Calculate total amount using the discounted price
            const totalAmount = currentDiscountedPrice;

            // ✅ UPDATED: Determine discount type and percentage with new compare price logic
            let discountType = "";
            let discountPercentages = 0;
            let originalPricingGroupPercentage = 0; // Store original percentage for pricing groups

            // NEW LOGIC: Priority 1 - Check comparePrice discount
            if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
                const currentPrice = item.eachPrice || 0;
                // Only apply compare price discount if comparePrice is higher than current price
                if (item.comparePrice > currentPrice) {
                    // const discountAmount = item.comparePrice - currentPrice;
                    discountPercentages = item.comparePrice;
                    discountType = "Compare Price";
                }
            }
            // Priority 2: Check item-based discount (only if no compare price discount applied)
            else if (currentUser && currentUser.customerId) {
                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    discountPercentages = itemDiscount.percentage;
                    discountType = "Item Discount";
                }
                // Priority 3: Check pricing group discount (only if no item-based discount)
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

                        if (customerDiscount) {
                            originalPricingGroupPercentage = parseFloat(customerDiscount.percentage);
                            discountPercentages = Math.abs(originalPricingGroupPercentage);
                            discountType = "Pricing Group";

                            // ✅ ADDED: For pricing group discounts, add + or - prefix to discountPercentages
                            if (originalPricingGroupPercentage > 0) {
                                discountPercentages = `+${discountPercentages}`;
                            } else if (originalPricingGroupPercentage < 0) {
                                discountPercentages = `-${discountPercentages}`;
                            }
                        }
                    }
                }
            }

            const cartData = {
                customerId: currentUser._id,
                productId: itemType === 'product' ? item._id : null,
                productGroupId: itemType === 'productGroup' ? item._id : null,
                packQuentity: packQuantity,
                unitsQuantity: quantity,
                totalQuantity: totalQuantity,
                packType: itemType === 'productGroup' ? 'Each' : (item.typesOfPacks?.find(p => p._id === selectedUnitId) ?
                    item.typesOfPacks.find(p => p._id === selectedUnitId).name : 'Each'),
                amount: totalAmount, // Store the discounted total amount
                discountType: discountType,
                discountPercentages: discountPercentages
            }

            console.log("Sending cart data with discounts:", cartData);

            const res = await axiosInstance.post("cart/add-to-cart", cartData)

            if (res.data.statusCode === 200) {
                await fetchCustomersCart()
                setCartItemsCount(res.data.data.cartItems?.length || 0);
                setError(null)
                setStockError(null)
            }
        } catch (err) {
            console.error(err)
            setError("Error adding to cart")
        } finally {
            setLoadingCart(false)
        }
    }

    const handleAddToWishlist = async () => {
        if (!currentUser?._id) {
            setError("Please login to add to wishlist");
            return;
        }

        const item = getCurrentItem();
        if (!item) return;

        setLoadingWishlist(true);
        try {
            const res = await axiosInstance.post("wishlist/add-to-wishlist", {
                customerId: currentUser._id,
                productId: itemType === 'product' ? item._id : null,
                productGroupId: itemType === 'productGroup' ? item._id : null,
            });

            if (res.data.statusCode === 200) {
                await fetchCustomersWishList();
                setWishlistItemsCount(res.data.data?.wishlistItems?.length || res.data.data?.length || 0);
            }
        } catch (err) {
            console.error(err);
            setError("Error updating wishlist");
        } finally {
            setLoadingWishlist(false);
        }
    };

    const isInWishlist = () => {
        const item = getCurrentItem();
        if (!item) return false;

        if (!wishListItems || !Array.isArray(wishListItems)) {
            return false;
        }

        return wishListItems.some(wishlistItem => {
            if (itemType === 'product') {
                return wishlistItem.product?._id === item._id;
            } else {
                return wishlistItem.productGroup?._id === item._id;
            }
        });
    };

    const isOutOfStock = isItemOutOfStock();
    const totalRequestedQuantity = calculateTotalQuantity();
    const isInCart = isItemInCart();
    const cartItem = getCartItem();

    const handleViewItemDetails = () => {
        const item = getCurrentItem();
        if (!item) return;

        setFilters({
            categorySlug: categorySlug || null,
            subCategorySlug: subCategorySlug || null,
            subCategoryTwoSlug: subCategoryTwoSlug || null,
            brandSlug: brandSlug || null,
            productID: itemType === 'product' ? item._id : null,
            productGroupId: itemType === 'productGroup' ? item._id : null
        })

        const itemSlug = getItemName().replace(/\s+/g, '-').toLowerCase();
        router.push(`/${itemSlug}`);
        onClose();
    }

    // Navigation functions for image carousel
    const nextImage = () => {
        if (itemImages.length > 0) {
            setSelectedImage((prev) => (prev + 1) % itemImages.length);
        }
    };

    const prevImage = () => {
        if (itemImages.length > 0) {
            setSelectedImage((prev) => (prev - 1 + itemImages.length) % itemImages.length);
        }
    };

    // Render product group badge
    const renderProductGroupBadge = () => {
        if (itemType !== 'productGroup') return null;

        return (
            <div className="absolute top-2 left-4 sm:left-6 z-10">
                <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                    BUNDLE
                </div>
            </div>
        );
    };

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#000000]/10 bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-gray-300">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium font-spartan">{getItemName()}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
                        </div>
                    ) : getCurrentItem() ? (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side images */}
                            <div className="flex-1 y-6">
                                <div className="flex flex-col-reverse xl:flex-row space-x-8">
                                    {itemImages.length > 0 && (
                                        <div className="flex xl:flex-col space-x-2 xl:space-x-0 xl:space-y-2 justify-center max-h-[300px] lg:pt-18 overflow-y-auto ">
                                            {itemImages.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`flex-shrink-0 p-2 bg-white shadow-xl cursor-pointer ${selectedImage === index ? "border-2 border-blue-500" : "border border-gray-200"
                                                        }`}
                                                >
                                                    <img
                                                        src={image || "/placeholder.svg"}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="h-[50px] w-[50px] object-contain rounded-md"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative">
                                        <div className="rounded-lg p-4 bg-[#FAFAFA] relative">
                                            {/* Product Badge */}
                                            {itemType === 'product' && getCurrentItem().badge && (
                                                <div className="absolute top-2 left-4 sm:left-6 z-10">
                                                    <div
                                                        className="px-2 py-1 rounded text-xs font-bold"
                                                        style={{
                                                            backgroundColor: getCurrentItem().badge.backgroundColor,
                                                            color: getCurrentItem().badge.textColor || '#fff',
                                                        }}
                                                    >
                                                        {getCurrentItem().badge.text}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Product Group Badge */}
                                            {renderProductGroupBadge()}

                                            {/* Navigation Arrows */}
                                            {itemImages.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={prevImage}
                                                        className="absolute cursor-pointer left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                                                        aria-label="Previous image"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={nextImage}
                                                        className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                                                        aria-label="Next image"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}

                                            <img
                                                src={itemImages[selectedImage] || "/placeholder.svg"}
                                                alt={getItemName()}
                                                className="w-[200px] h-[200px] object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side details */}
                            <div className="flex-1 space-y-3 font-spartan">
                                <h1 className="text-[18px] font-semibold text-black uppercase">{getItemName()}</h1>
                                <div className="space-y-1 flex justify-between items-center">
                                    <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                        SKU: {getItemSku()}
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

                                {/* Product Group Info */}
                                {itemType === 'productGroup' && getCurrentItem().products && getCurrentItem().products.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800 font-medium">
                                            This bundle includes {getCurrentItem().products.length} product(s)
                                        </p>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-[24px] font-semibold text-[#2D2C70]">
                                        ${discountedPrice.toFixed(2)}
                                    </span>
                                    {/* ✅ UPDATED: Show strikethrough price if there's a discount */}
                                    {hasItemDiscount && discountedPrice < originalPriceForDisplay && (
                                        <span className="text-sm text-gray-500 line-through">
                                            ${originalPriceForDisplay.toFixed(2)}
                                        </span>
                                    )}
                                    {/* {discountPercentage && discountPercentage > 0 && (
                                        <span className="text-sm text-green-600 font-semibold">
                                            ({discountPercentage}% OFF)
                                        </span>
                                    )} */}
                                </div>

                                {/* Stock Error Message */}
                                {stockError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                        {stockError}
                                    </div>
                                )}

                                {/* Quantity & Units - Only show units for products */}
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="block mb-2 text-sm">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1 || isOutOfStock}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-800 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value;

                                                    // If input is empty (backspace cleared it), set to empty string
                                                    if (inputValue === '') {
                                                        setQuantity('');
                                                        return;
                                                    }

                                                    const newQuantity = parseInt(inputValue);

                                                    // If valid number entered, handle the change
                                                    if (!isNaN(newQuantity) && newQuantity >= 1 && !isOutOfStock) {
                                                        setQuantity(newQuantity);
                                                        checkStock(newQuantity, selectedUnitId);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    // When input loses focus, if empty, set back to 1
                                                    if (e.target.value === '' || e.target.value === '0') {
                                                        setQuantity(1);
                                                        checkStock(1, selectedUnitId);
                                                    }
                                                }}
                                                className="w-16 text-center border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-medium focus:bg-gray-50 transition-colors"
                                                disabled={isOutOfStock}
                                            />

                                            <button
                                                onClick={incrementQuantity}
                                                disabled={isOutOfStock || totalRequestedQuantity >= getStockLevel()}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-800 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Units - Only for products */}
                                    {itemType === 'product' && (
                                        <div className="flex flex-col space-y-2 w-full">
                                            <span className="text-sm">Units</span>
                                            <select
                                                value={selectedUnitId}
                                                onChange={(e) => handleUnitChange(e.target.value)}
                                                disabled={isOutOfStock}
                                                className="w-full border rounded-md p-2 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
                                            >
                                                {getCurrentItem().typesOfPacks && getCurrentItem().typesOfPacks.length > 0 ? (
                                                    getCurrentItem().typesOfPacks.map((pack) => (
                                                        <option key={pack._id} value={pack._id}>
                                                            {pack.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No packs available</option>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {/* Add to Cart and Wishlist Row */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isOutOfStock || loadingCart || !!stockError}
                                            className={`flex-1 flex items-center justify-center gap-2 text-[1rem] font-semibold border rounded-lg py-2 px-6 transition-colors duration-300 cursor-pointer ${isOutOfStock || loadingCart || stockError
                                                ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                                : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]'
                                                }`}
                                        >
                                            {loadingCart ? (
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
                                            {loadingCart ? 'Adding...' : 'Add to Cart'}
                                        </button>

                                        <button
                                            onClick={handleAddToWishlist}
                                            disabled={loadingWishlist}
                                            className="h-10 w-10 border border-[#E799A9] flex items-center justify-center rounded-full cursor-pointer hover:bg-[#E799A9]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingWishlist ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E799A9]"></div>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill={isInWishlist() ? "#E799A9" : "none"}
                                                    stroke="#E799A9"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                                                        2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
                                                        4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                                                        19.58 3 22 5.42 22 8.5c0 
                                                        3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Added and Update Row - Only show when item is in cart */}
                                    {isInCart && (
                                        <div className="flex space-x-2">
                                            <button
                                                className="flex-1 space-x-[6px] border-1 border-[#2D2C70] text-white bg-[#2D2C70] rounded-lg py-2 px-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                disabled
                                            >
                                                <span>Added</span>
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <div className="w-px bg-black h-[20px] mt-2"></div>
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock || loadingCart || !!stockError}
                                                className={`flex-1 border-1 border border-black rounded-lg py-2 px-3 text-sm font-medium transition-colors cursor-pointer ${isOutOfStock || loadingCart || stockError
                                                    ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                                    : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999]'
                                                    }`}
                                            >
                                                {loadingCart ? 'Updating...' : 'Update'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Cart Quantity Info */}
                                    {isInCart && cartItem && (
                                        <div className="text-sm font-semibold text-[#000000]/80 font-spartan hover:text-[#E9098D]">
                                            In Cart Quantity: <span className="font-medium">{cartItem.unitsQuantity} ({cartItem.packType})</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleViewItemDetails}
                                    className="text-sm underline flex items-center hover:text-[#E9098D] transition-colors cursor-pointer"
                                >
                                    View {itemType === 'product' ? 'product' : 'bundle'} details <ArrowRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Item not found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}