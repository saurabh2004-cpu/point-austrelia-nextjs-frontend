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
    const [productImages, setProductImages] = useState([])
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [error, setError] = useState(null)
    const [stockError, setStockError] = useState(null)
    const [loadingCart, setLoadingCart] = useState(false)
    const [loadingWishlist, setLoadingWishlist] = useState(false)

    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const currentCartItems = useCartStore((state) => state.currentItems);
    const currentUser = useUserStore((state) => state.user)
    const router = useRouter()

    // UPDATED: Calculate discounted price with comparePrice priority
    const calculateDiscountedPrice = () => {
        if (!product || !product.eachPrice) return 0;

        const originalPrice = product.eachPrice;

        // Priority 1: If product has comparePrice (not null, not undefined, and not 0), use it
        if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
            return product.comparePrice;
        }

        // If no comparePrice or comparePrice is 0, check for discounts
        if (!currentUser || !currentUser.customerId) {
            return originalPrice;
        }

        // Priority 2: Check for item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        // If item-based discount exists, apply it
        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return Math.max(0, originalPrice - discountAmount); // Ensure price doesn't go negative
        }

        // Priority 3: Check for pricing group discount
        // Since products don't have pricingGroup field, we need to check if any pricing group discount exists for this customer
        if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
            console.log("Checking pricing group discounts for customer:", currentUser.customerId);
            console.log("Available pricing group discounts:", customerGroupsDiscounts);

            // Find any pricing group discount that applies to this customer
            for (const groupDiscountDoc of customerGroupsDiscounts) {
                if (groupDiscountDoc && groupDiscountDoc.customers) {
                    // Find the specific customer discount within the pricing group
                    const customerDiscount = groupDiscountDoc.customers.find(
                        customer => customer.user && customer.user.customerId === currentUser.customerId
                    );

                    if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                        const percentage = parseFloat(customerDiscount.percentage);
                        console.log("Applying pricing group discount:", percentage, "% to product:", product.ProductName);
                        
                        // Handle both positive and negative percentages
                        if (percentage > 0) {
                            // Positive percentage means price increase
                            const finalPrice = originalPrice + (originalPrice * percentage / 100);
                            console.log("Final price after increase:", finalPrice);
                            return finalPrice;
                        } else if (percentage < 0) {
                            // Negative percentage means price decrease
                            const finalPrice = originalPrice - (originalPrice * Math.abs(percentage) / 100);
                            console.log("Final price after decrease:", finalPrice);
                            return Math.max(0, finalPrice); // Ensure price doesn't go negative
                        }
                        // If percentage is 0, continue to next discount
                    }
                }
            }
        }

        // If no discounts apply, return original price
        return originalPrice;
    };

    // UPDATED: Get discount percentage for display
    const getDiscountPercentage = () => {
        if (!product) return null;

        // If product has comparePrice, show comparePrice discount
        if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
            const originalPrice = product.eachPrice || 0;
            if (originalPrice > 0 && product.comparePrice < originalPrice) {
                const discountAmount = originalPrice - product.comparePrice;
                const discountPercentage = (discountAmount / originalPrice) * 100;
                return Math.round(discountPercentage);
            }
            return null;
        }

        if (!currentUser || !currentUser.customerId) {
            return null;
        }

        // Check item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            return itemDiscount.percentage;
        }

        // Check pricing group discount
        if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
            // Find any pricing group discount that applies to this customer
            for (const groupDiscountDoc of customerGroupsDiscounts) {
                if (groupDiscountDoc && groupDiscountDoc.customers) {
                    const customerDiscount = groupDiscountDoc.customers.find(
                        customer => customer.user && customer.user.customerId === currentUser.customerId
                    );

                    if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                        return parseFloat(customerDiscount.percentage);
                    }
                }
            }
        }

        return null;
    };

    // UPDATED: Check if product has any discount or comparePrice
    const hasDiscount = () => {
        if (!product) return false;

        // Check if product has comparePrice discount
        if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
            const originalPrice = product.eachPrice || 0;
            if (product.comparePrice < originalPrice) {
                return true;
            }
        }

        // Check if product has item-based or pricing group discount
        return getDiscountPercentage() !== null;
    };

    const discountedPrice = calculateDiscountedPrice();
    const discountPercentage = getDiscountPercentage();
    const hasProductDiscount = hasDiscount();

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
        if (!product) return 0;

        const selectedPack = product.typesOfPacks?.find(pack => pack._id === unitId);
        const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
        return packQuantity * qty;
    };

    // Check if product is in cart
    const isProductInCart = () => {
        return cartItems.some(item => item.product?._id === product?._id);
    };

    // Get cart item for product
    const getCartItem = () => {
        return cartItems.find(item => item.product?._id === product?._id);
    };

    // Check stock level
    const checkStock = (qty = quantity, unitId = selectedUnitId) => {
        if (!product) return { isValid: true };

        const totalRequestedQuantity = calculateTotalQuantity(qty, unitId);
        const cartItem = getCartItem();
        const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

        // If product is already in cart, we're updating it, not adding new quantity
        const newTotalQuantity = isProductInCart()
            ? totalRequestedQuantity
            : totalRequestedQuantity + currentCartQuantity;

        const isValid = newTotalQuantity <= product.stockLevel;

        if (!isValid) {
            setStockError(`Exceeds available stock (${product.stockLevel})`);
        } else {
            setStockError(null);
        }

        return {
            isValid,
            message: isValid ? null : `Exceeds available stock (${product.stockLevel})`,
            requestedQuantity: totalRequestedQuantity,
            currentStock: product.stockLevel
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
                if (productData.images?.length > 0) {
                    setProductImages(productData.images)
                }
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

    // Fetch cart items
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser?._id) return
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data || [])
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
        if (productId) {
            fetchProductDetail(productId)
        }
    }, [productId])

    useEffect(() => {
        if (isOpen && currentUser?._id) {
            fetchCustomersCart()
            fetchCustomersWishList()
        }
    }, [isOpen, currentUser, currentCartItems])

    // Reset quantity when product changes or when cart items update
    useEffect(() => {
        if (product && cartItems.length >= 0) {
            const cartItem = getCartItem();
            if (cartItem) {
                // Product is in cart - set quantity from cart
                setQuantity(cartItem.unitsQuantity);
                const pack = product.typesOfPacks?.find(p => p.name === cartItem.packType);
                if (pack) {
                    setSelectedUnitId(pack._id);
                }
            } else {
                // Product not in cart - reset to default
                setQuantity(1);
                if (product.typesOfPacks && product.typesOfPacks.length > 0) {
                    setSelectedUnitId(product.typesOfPacks[0]._id);
                }
            }
            // Clear stock error when product/cart changes
            setStockError(null);
        }
    }, [product, cartItems])

    // Add to cart function
    // UPDATED: Add to cart function with discount data
const handleAddToCart = async () => {
    if (!currentUser?._id) {
        setError("Please login to add to cart")
        return
    }
    if (!product) return;

    // Final stock check before adding to cart
    const stockCheck = checkStock();
    if (!stockCheck.isValid) {
        setError(stockCheck.message);
        return;
    }

    setLoadingCart(true);
    try {
        const selectedPack = product.typesOfPacks?.find(p => p._id === selectedUnitId)
        const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1
        const totalQuantity = packQuantity * quantity

        // Calculate the discounted price for this product
        const currentDiscountedPrice = calculateDiscountedPrice();

        // Calculate total amount using the discounted price
        const totalAmount = totalQuantity * currentDiscountedPrice

        // Determine discount type and percentage
        let discountType = "";
        let discountPercentages = 0;

        // Priority 1: Check if product has comparePrice
        if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
            const originalPrice = product.eachPrice || 0;
            if (originalPrice > 0 && product.comparePrice < originalPrice) {
                const discountAmount = originalPrice - product.comparePrice;
                discountPercentages = Math.round((discountAmount / originalPrice) * 100);
                discountType = "Compare Price";
            }
        }
        // Priority 2: Check for item-based discount
        else if (currentUser && currentUser.customerId) {
            const itemDiscount = itemBasedDiscounts.find(
                discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
            );

            if (itemDiscount) {
                discountPercentages = itemDiscount.percentage;
                discountType = "Item Based Discount";
            }
            // Priority 3: Check for pricing group discount
            else if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
                // Find any pricing group discount that applies to this customer
                for (const groupDiscountDoc of customerGroupsDiscounts) {
                    if (groupDiscountDoc && groupDiscountDoc.customers) {
                        const customerDiscount = groupDiscountDoc.customers.find(
                            customer => customer.user && customer.user.customerId === currentUser.customerId
                        );

                        if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                            discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
                            discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";
                            break; // Use the first matching discount found
                        }
                    }
                }
            }
        }

        const cartData = {
            customerId: currentUser._id,
            productId: product._id,
            packQuentity: packQuantity,
            unitsQuantity: quantity,
            totalQuantity: totalQuantity,
            packType: selectedPack ? selectedPack.name : 'Each',
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
        if (!product) return;

        setLoadingWishlist(true);
        try {
            const res = await axiosInstance.post("wishlist/add-to-wishlist", {
                customerId: currentUser._id,
                productId: product._id,
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
        return wishListItems.some(
            (item) => item.product?._id === product?._id
        );
    };

    const isOutOfStock = product?.stockLevel <= 0;
    const totalRequestedQuantity = calculateTotalQuantity();
    const isInCart = isProductInCart();
    const cartItem = getCartItem();

    const handleViewProductDetails = () => {
        setFilters({
            categorySlug: categorySlug || null,
            subCategorySlug: subCategorySlug || null,
            subCategoryTwoSlug: subCategoryTwoSlug || null,
            brandSlug: brandSlug || null,
            productID: product._id
        })
        const productSlug = product.ProductName.replace(/\s+/g, '-').toLowerCase();
        router.push(`/${productSlug}`);
        onClose();
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#000000]/10 bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-gray-300">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium font-spartan">{product?.ProductName}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
                        </div>
                    ) : product ? (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side images */}
                            <div className="flex-1">
                                <div className="flex flex-col-reverse xl:flex-row space-x-8">
                                    <div className="flex xl:flex-col space-x-2 xl:space-x-0 space-y-2 justify-center">
                                        {productImages.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 p-2 bg-white shadow-xl ${selectedImage === index ? "border-2 border-blue-500" : "border border-gray-200"
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

                                    <div className="relative">
                                        <div className="rounded-lg p-4 bg-[#FAFAFA]">
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
                                            <img
                                                src={productImages[selectedImage] || "/placeholder.svg"}
                                                alt={product.ProductName}
                                                className="w-full h-[260px] object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side details */}
                            <div className="flex-1 space-y-3 font-spartan">
                                <h1 className="text-[18px] font-semibold text-black uppercase">{product.ProductName}</h1>
                                <div className="space-y-1 flex justify-between items-center">
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
                                    <span className="text-[24px] font-semibold text-[#2D2C70]">
                                        ${discountedPrice.toFixed(2)}
                                    </span>
                                    {hasProductDiscount && product.eachPrice && (
                                        <span className="text-sm text-gray-500 line-through">
                                            ${product.eachPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {/* Stock Error Message */}
                                {stockError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                        {stockError}
                                    </div>
                                )}

                                {/* Quantity & Units */}
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="block mb-2 text-sm">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1 || isOutOfStock}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                disabled={isOutOfStock}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 w-full">
                                        <span className="text-sm">Units</span>
                                        <select
                                            value={selectedUnitId}
                                            onChange={(e) => handleUnitChange(e.target.value)}
                                            disabled={isOutOfStock}
                                            className="w-full border rounded-md p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {/* Add to Cart and Wishlist Row */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isOutOfStock || loadingCart || !!stockError}
                                            className={`flex-1 flex items-center justify-center gap-2 text-[1rem] font-semibold border rounded-lg py-2 px-6 transition-colors duration-300 ${isOutOfStock || loadingCart || stockError
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

                                    {/* Added and Update Row - Only show when product is in cart */}
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
                                                className={`flex-1 border-1 border border-black rounded-lg py-2 px-3 text-sm font-medium transition-colors ${isOutOfStock || loadingCart || stockError
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
                                    onClick={handleViewProductDetails} 
                                    className="text-sm underline flex items-center hover:text-[#E9098D] transition-colors"
                                >
                                    View product details <ArrowRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Product not found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}