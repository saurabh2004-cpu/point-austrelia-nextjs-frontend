'use client'

import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Share2, Minus, Plus, Check, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';
import useWishlistStore from '@/zustand/wishList';
import useCartStore from '@/zustand/cartPopup';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/components/withAuth';

const ProductCard = ({
    item,
    productQuantities,
    selectedUnits,
    loadingProducts,
    currentUser,
    onUpdateQuantity,
    onUpdateUnit,
    onAddToCart,
    onUpdateCart,
    onRemoveFromWishlist,
    customerGroupsDiscounts,
    itemBasedDiscounts,
    cartItems
}) => {
    // Determine if it's a product or product group
    const isProductGroup = !!item.productGroup;
    const productData = isProductGroup ? item.productGroup : item.product;
    const productId = isProductGroup ? item.productGroup._id : item.product._id;

    const isLoading = loadingProducts[productId];



    // ✅ Check if product/group is already in cart
    const isItemInCart = cartItems?.some(cartItem =>

        isProductGroup
            ? cartItem.productGroup?._id === productId
            : cartItem.product?._id === productId
    );
    const cartItem = cartItems.find(cartItem =>
        isProductGroup
            ? cartItem.productGroup?._id === productId
            : cartItem.product?._id === productId
    );

    // ✅ UPDATED: Discount calculation with comparePrice priority
    const calculateDiscountedPrice = (productData) => {
        if (!productData) return 0;

        const originalPrice = isProductGroup ? productData.eachPrice : productData.eachPrice;

        // Priority 1: If product has comparePrice (not null, not undefined, and not 0), use it
        if (productData.comparePrice !== null && productData.comparePrice !== undefined && productData.comparePrice !== 0) {
            return productData.comparePrice;
        }

        // If no comparePrice or comparePrice is 0, check for discounts
        if (!currentUser || !currentUser.customerId) {
            return originalPrice;
        }

        // Priority 2: Check for item-based discount
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === productData.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return Math.max(0, originalPrice - discountAmount);
        }

        // Priority 3: Check for pricing group discount
        if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
            for (const groupDiscountDoc of customerGroupsDiscounts) {
                if (groupDiscountDoc && groupDiscountDoc.customers) {
                    const customerDiscount = groupDiscountDoc.customers.find(
                        customer => customer.user && customer.user.customerId === currentUser.customerId
                    );

                    if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                        const percentage = parseFloat(customerDiscount.percentage);

                        if (percentage > 0) {
                            // Positive percentage means price increase
                            return originalPrice + (originalPrice * percentage / 100);
                        } else if (percentage < 0) {
                            // Negative percentage means price decrease
                            return Math.max(0, originalPrice - (originalPrice * Math.abs(percentage) / 100));
                        }
                    }
                }
            }
        }

        return originalPrice;
    };

    // ✅ UPDATED: Get discount percentage for display with comparePrice priority
    const getDiscountPercentage = (productData) => {
        if (!productData) return null;

        // If product has comparePrice, show comparePrice discount
        if (productData.comparePrice !== null && productData.comparePrice !== undefined && productData.comparePrice !== 0) {
            const originalPrice = productData.eachPrice || 0;
            if (originalPrice > 0 && productData.comparePrice < originalPrice) {
                const discountAmount = originalPrice - productData.comparePrice;
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
            discount => discount.productSku === productData.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            return itemDiscount.percentage;
        }

        // Check pricing group discount
        if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
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

    // ✅ UPDATED: Check if product has any discount or comparePrice
    const hasDiscount = (productData) => {
        if (!productData) return false;

        // Check if product has comparePrice discount
        if (productData.comparePrice !== null && productData.comparePrice !== undefined && productData.comparePrice !== 0) {
            const originalPrice = productData.eachPrice || 0;
            if (productData.comparePrice < originalPrice) {
                return true;
            }
        }

        // Check if product has item-based or pricing group discount
        return getDiscountPercentage(productData) !== null;
    };

    // Get image URL for product or product group
    const getImageUrl = () => {
        if (isProductGroup) {
            // For product groups, use thumbnail or first image
            if (productData.thumbnail) {
                return productData.thumbnail;
            } else if (productData.images && productData.images.length > 0) {
                return productData.images[0];
            }
        } else {
            // For individual products
            if (productData.images) {
                return productData.images;
            }
        }
        return '/product-listing-images/product-1.avif';
    };

    // Get product name
    const getProductName = () => {
        return isProductGroup ? productData.name : productData.ProductName;
    };

    // Get SKU
    const getSku = () => {
        return productData.sku;
    };

    // Get stock level - for product groups, check the minimum stock among all products
    const getStockLevel = () => {
        if (isProductGroup) {
            if (!productData.products || productData.products.length === 0) return 0;
            return Math.min(...productData.products.map(p => p.stockLevel || 0));
        } else {
            return productData.stockLevel || 0;
        }
    };

    // Get pack quantity from selected unit (only for individual products)
    const getPackQuantity = (selectedUnitId) => {
        if (isProductGroup) return 1; // Product groups don't have pack types

        if (!productData.typesOfPacks || productData.typesOfPacks.length === 0) return 1;

        const selectedPack = productData.typesOfPacks.find(pack =>
            (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
        );

        if (!selectedPack) return 1;

        if (typeof selectedPack === 'string') {
            return parseInt(selectedPack) || 1;
        }

        const quantity = selectedPack.quantity;
        if (typeof quantity === 'string') {
            return parseInt(quantity) || 1;
        }
        return quantity || 1;
    };

    // Get pack type name from selected unit (only for individual products)
    const getPackTypeName = (selectedUnitId) => {
        if (isProductGroup) return "Group"; // Product groups don't have pack types

        if (!productData.typesOfPacks || productData.typesOfPacks.length === 0) return "Each";

        const selectedPack = productData.typesOfPacks.find(pack =>
            (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
        );

        if (!selectedPack) return "Each";

        if (typeof selectedPack === 'string') {
            return `Pack of ${selectedPack}`;
        }
        return selectedPack.name || `Pack of ${selectedPack.quantity || 1}`;
    };

    // Calculate total quantity (pack quantity * units quantity)
    const calculateTotalQuantity = (productId) => {
        const unitsQuantity = productQuantities[productId] || 1;
        if (isProductGroup) {
            return unitsQuantity; // Product groups are sold as single units
        } else {
            const selectedUnitId = selectedUnits[productId];
            const packQuantity = getPackQuantity(selectedUnitId);
            return packQuantity * unitsQuantity;
        }
    };

    // Check if product is out of stock or exceeds stock level
    const stockLevel = getStockLevel();
    const totalQuantity = calculateTotalQuantity(productId);
    const isOutOfStock = stockLevel <= 0;
    const exceedsStock = totalQuantity > stockLevel;
    const isAvailable = !isOutOfStock && !exceedsStock;

    // ✅ NEW: Check if cart item has been modified locally
    const isCartItemModified = () => {
        if (!isItemInCart || !cartItem) return false;

        const currentQty = productQuantities[productId] || 1;

        if (isProductGroup) {
            return currentQty !== cartItem.unitsQuantity;
        } else {
            const currentPackId = selectedUnits[productId];
            const cartPackQuantity = cartItem.packQuentity || 1;
            const currentPackQuantity = getPackQuantity(currentPackId);
            return currentQty !== cartItem.unitsQuantity || currentPackQuantity !== cartPackQuantity;
        }
    };

    // Calculate amount based on selected pack and quantity
    const calculateAmount = (productData, productId) => {
        const unitsQuantity = productQuantities[productId] || 1;
        let totalQuantity = unitsQuantity;

        if (!isProductGroup) {
            const selectedUnitId = selectedUnits[productId];
            const packQuantity = getPackQuantity(selectedUnitId);
            totalQuantity = packQuantity * unitsQuantity;
        }

        const discountedPrice = calculateDiscountedPrice(productData);
        return (discountedPrice * totalQuantity).toFixed(2);
    };

    // Get discounted price and discount info
    const discountedPrice = calculateDiscountedPrice(productData);
    const discountPercentage = getDiscountPercentage(productData);
    const hasProductDiscount = hasDiscount(productData);

    const hasModifications = isCartItemModified();

    return (
        <div className="bg-white  border border-gray-200 rounded-lg shadow-sm p-2 font-spartan   mx-auto  xl:h-full xl:w-[552px] mx-auto">
            <div className="flex flex-col xl:flex-row h-full ">
                {/* Product Image */}
                <div className="flex-shrink-0 mr-4 ">
                    <div className=" rounded-lg flex items-center justify-center align-middle relative cursor-pointer">
                        <img
                            src={getImageUrl()}
                            alt={getProductName()}
                            className="object-contain h-[200px] w-[200px]"
                            key={productId}
                            onError={(e) => {
                                e.target.src = '/product-listing-images/product-1.avif';
                            }}
                        />
                        {isProductGroup && (
                            <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Group
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col min-w-0  lg:max-w-[350px] mx-auto xl:mx-0">
                    <h3 className="text-[15px] font-semibold line-clamp-2 ">
                        {getProductName()}
                    </h3>

                    <div className="flex items-center space-x-10  justify-between align-middle">
                        <span className="font-medium text-[13px]">
                            SKU: {getSku()}
                        </span>
                        {isAvailable ? (
                            <div className="flex items-center text-[14px] font-medium text-black p-1 font-semibold text-[11px] bg-[#E7FAEF]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                IN STOCK
                            </div>
                        ) : (
                            <div className="flex items-center text-[14px] font-medium text-black p-1 font-semibold text-[11px] bg-[#FFEAEA]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                {isOutOfStock ? 'OUT OF STOCK' : 'EXCEEDS STOCK'}
                            </div>
                        )}
                    </div>

                    {/* Available Stock Display */}
                    {/* {!isOutOfStock && (
                        <p className="text-[12px] text-gray-600 mb-1">
                            Available: {stockLevel} {isProductGroup ? 'groups' : 'units'}
                        </p>
                    )} */}

                    {/* Out of Stock Warning */}
                    {isOutOfStock && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2">
                            <p className="text-red-600 text-[12px] font-medium">
                                This {isProductGroup ? 'product group' : 'product'} is currently out of stock and cannot be added to cart.
                            </p>
                        </div>
                    )}

                    {/* Exceeds Stock Warning */}
                    {exceedsStock && (
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-2 mb-2">
                            <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-orange-600 text-[12px] font-medium">
                                    Requested quantity ({totalQuantity}) exceeds available stock . Please reduce quantity.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Price with Discount */}
                    <div className="flex items-center space-x-2">
                        <span className="text-[#2D2C70] font-semibold text-[24px]">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {hasProductDiscount && !discountPercentage > productData.eachPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                ${productData.eachPrice ? productData.eachPrice.toFixed(2) : '0.00'}
                            </span>
                        )}
                    </div>

                    <div className='flex items-center justify-between'>
                        {/* Pack Type Selector - Only for individual products */}
                        {!isProductGroup && (
                            <div className="mb-3 space-x-12 align-center items-center font-spartan">
                                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">Units</label>
                                <div className="relative w-full">
                                    <select
                                        value={selectedUnits[productId] || ''}
                                        onChange={(e) => onUpdateUnit(productId, e.target.value)}
                                        className={`w-full border border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm 
                                                   focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                                   appearance-none ${!isAvailable ? 'bg-gray-100 ' : ''} cursor-pointer`}
                                        disabled={isLoading}
                                    >
                                        {productData.typesOfPacks && productData.typesOfPacks.length > 0 ? (
                                            productData.typesOfPacks.map((pack) => (
                                                <option
                                                    key={typeof pack === 'string' ? pack : pack._id}
                                                    value={typeof pack === 'string' ? pack : pack._id}
                                                >
                                                    {typeof pack === 'string' ? `Pack ${pack}` : (pack.name || `Pack of ${pack.quantity || 1}`)}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">Each</option>
                                        )}
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
                        )}

                        <div className="flex items-start space-x-2 space-y-2 flex-col justify-between">
                            <span className="text-[13px] font-medium cursor-pointer">Quantity</span>
                            <div className="flex items-center rounded-lg">
                                <button
                                    onClick={() => onUpdateQuantity(productId, (productQuantities[productId] || 1) - 1)}
                                    className="p-1 bg-black rounded-md px-2 py-[5px] transition-colors disabled:opacity-50 cursor-pointer"
                                    disabled={isLoading || (productQuantities[productId] || 1) <= 1}
                                >
                                    <Minus className="w-3 h-3 text-white" />
                                </button>

                                {/* Input field for direct quantity entry */}
                                <input
                                    type="number"
                                    min="1"
                                    value={productQuantities[productId] || 1}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        const validQuantity = Math.max(1, newQuantity);
                                        onUpdateQuantity(productId, validQuantity);
                                    }}
                                    onBlur={(e) => {
                                        if (!e.target.value || parseInt(e.target.value) < 1) {
                                            onUpdateQuantity(productId, 1);
                                        }
                                    }}
                                    className="w-12 h-[25px] mx-2 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D2C70] cursor-pointer"
                                    disabled={isLoading}
                                />

                                <button
                                    onClick={() => onUpdateQuantity(productId, (productQuantities[productId] || 1) + 1)}
                                    className="p-1 bg-black rounded-md py-[5px] px-2 transition-colors disabled:opacity-50 cursor-pointer"
                                    disabled={isLoading || !isAvailable || exceedsStock}
                                    title={exceedsStock ? 'Stock level exceeded' : !isAvailable ? 'Out of stock' : ''}
                                >
                                    <Plus className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className='text-[16px] font-semibold  gap-2 flex'>
                        <span>Amount:</span>
                        <span className="text-[#2D2C70] text-[18px]">
                            ${calculateAmount(productData, productId)}
                        </span>
                    </div>

                    <div className="flex text-[13px] font-semibold justify-between items-center gap-3 sm:gap-4 md:gap-6 ">
                        {/* ✅ UPDATE BUTTON */}
                        <button
                            onClick={() => onAddToCart(productId, isProductGroup)}
                            className={`text-[13px] font-semibold border border-black text-white rounded-2xl py-1 px-6 disabled:opacity-50 ${hasModifications && isAvailable && isItemInCart
                                ? 'bg-[#E799A9] hover:bg-[#d68999] cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !hasModifications || !isAvailable || !isItemInCart}
                            title={
                                !isItemInCart
                                    ? `${isProductGroup ? 'Product group' : 'Product'} not in cart`
                                    : !isAvailable
                                        ? isOutOfStock
                                            ? `${isProductGroup ? 'Product group' : 'Product'} is out of stock`
                                            : 'Requested quantity exceeds available stock'
                                        : !hasModifications
                                            ? 'No changes to update'
                                            : 'Update cart item'
                            }
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>

                        {/* ✅ ADD TO CART BUTTON */}
                        <button
                            onClick={() => onAddToCart(productId, isProductGroup)}
                            className={`flex items-center py-2 gap-2 text-[13px] text-white font-semibold border border-black rounded-2xl px-6 disabled:opacity-50 ${isAvailable && !isItemInCart
                                ? 'bg-[#46BCF9] hover:bg-[#3aa8e0] cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !isAvailable || isItemInCart}
                            title={
                                isItemInCart
                                    ? `${isProductGroup ? 'Product group' : 'Product'} already in cart`
                                    : !isAvailable
                                        ? isOutOfStock
                                            ? `${isProductGroup ? 'Product group' : 'Product'} is out of stock`
                                            : 'Requested quantity exceeds available stock'
                                        : 'Add to cart'
                            }
                        >
                            <svg
                                className="w-5 h-5 transition-colors duration-300"
                                viewBox="0 0 21 21"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                            </svg>
                            {!isAvailable
                                ? isOutOfStock
                                    ? 'Out of Stock'
                                    : 'Exceeds Stock'
                                : isItemInCart
                                    ? 'In Cart'
                                    : 'Add to Cart'}
                        </button>

                        {/* ✅ REMOVE BUTTON */}
                        <button
                            onClick={() => onRemoveFromWishlist(productId, isProductGroup)}
                            className={`h-9 w-9 border cursor-pointer rounded-full flex items-center justify-center hover:bg-[#E9098D] hover:text-white transition-colors disabled:opacity-50 ${isAvailable ? 'border-[#E799A9]' : 'border-gray-400'
                                }`}
                            disabled={isLoading}
                        >
                            <img src="/icons/dustbin-1.png" className="w-4 h-4" alt="remove" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const WishListComponent = () => {
    const currentUser = useUserStore((state) => state.user);
    const [wishListItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingProducts, setLoadingProducts] = useState({});
    const [cartItems, setCartItems] = useState([]);

    // State to track quantities and selected units for each product
    const [productQuantities, setProductQuantities] = useState({});
    const [selectedUnits, setSelectedUnits] = useState({});
    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);

    // Discount states
    const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([]);
    const [itemBasedDiscounts, setItemBasedDiscounts] = useState([]);

    const router = useRouter();

    // Fetch discount data
    const fetchCustomersGroupsDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return;

            const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser._id}`);

            if (response.data.statusCode === 200) {
                setCustomerGroupsDiscounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching customer groups discounts:', error);
        }
    };

    const fetchItemBasedDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return;

            const response = await axiosInstance.get(`item-based-discount/get-items-based-discount-by-customer-id/${currentUser.customerId}`);

            if (response.data.statusCode === 200) {
                setItemBasedDiscounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching item based discounts:', error);
        }
    };

    // Fetch wishlist items
    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            setLoading(true);
            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`);

            if (response.data.statusCode === 200) {
                const items = response.data.data || [];
                setWishlistItems(items);
                setWishlistItemsCount(items.length);

                // Initialize quantities and selected units from existing wishlist data
                const initialQuantities = {};
                const initialUnits = {};
                items.forEach(item => {
                    const isProductGroup = !!item.productGroup;
                    const itemId = isProductGroup ? item.productGroup._id : item.product._id;

                    initialQuantities[itemId] = item.unitsQuantity || 1;

                    // Only set pack types for individual products
                    if (!isProductGroup && item.product.typesOfPacks && item.product.typesOfPacks.length > 0) {
                        const matchingPack = item.product.typesOfPacks.find(pack => {
                            if (typeof pack === 'string') {
                                return parseInt(pack) === item.packQuentity;
                            }
                            return parseInt(pack.quantity) === item.packQuentity;
                        });

                        if (matchingPack) {
                            initialUnits[itemId] = typeof matchingPack === 'string' ? matchingPack : matchingPack._id;
                        } else {
                            initialUnits[itemId] = typeof item.product.typesOfPacks[0] === 'string'
                                ? item.product.typesOfPacks[0]
                                : item.product.typesOfPacks[0]._id;
                        }
                    }
                });
                setProductQuantities(initialQuantities);
                setSelectedUnits(initialUnits);
                setError(null);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching customer wishlist:', error);
            setError('Failed to fetch wishlist');
        } finally {
            setLoading(false);
        }
    };

    // Get pack quantity from selected unit (only for individual products)
    const getPackQuantity = (productId, selectedUnitId) => {
        const item = wishListItems.find(item =>
            (item.product && item.product._id === productId) ||
            (item.productGroup && item.productGroup._id === productId)
        );

        // If it's a product group or no product found, return 1
        if (!item || item.productGroup) return 1;

        const product = item.product;
        if (!product || !product.typesOfPacks || product.typesOfPacks.length === 0) return 1;

        const selectedPack = product.typesOfPacks.find(pack =>
            (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
        );

        if (typeof selectedPack === 'string') {
            return parseInt(selectedPack) || 1;
        }
        return parseInt(selectedPack?.quantity) || 1;
    };

    // Update quantity for a product
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity >= 1) {
            setProductQuantities(prev => ({
                ...prev,
                [productId]: newQuantity
            }));
        }
    };

    // Update selected pack type (only for individual products)
    const updateSelectedUnit = (productId, packId) => {
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: packId
        }));
    };

    // ✅ UPDATED: Add to cart function that handles both products and product groups
    const handleAddToCart = async (productId, isProductGroup = false) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to add items to cart");
            return;
        }

        setLoadingProducts(prev => ({ ...prev, [productId]: true }));

        try {
            const item = wishListItems.find(item =>
                isProductGroup
                    ? item.productGroup?._id === productId
                    : item.product?._id === productId
            );
            if (!item) return;

            const productData = isProductGroup ? item.productGroup : item.product;
            const unitsQuantity = productQuantities[productId] || 1;
            let packQuantity = 1;
            let packType = "Each";

            if (!isProductGroup) {
                const selectedPackId = selectedUnits[productId];
                packQuantity = getPackQuantity(productId, selectedPackId);

                // Get pack type name for individual products
                if (productData.typesOfPacks && productData.typesOfPacks.length > 0) {
                    const selectedPack = productData.typesOfPacks.find(pack =>
                        (typeof pack === 'string' ? pack : pack._id) === selectedPackId
                    );
                    if (selectedPack) {
                        packType = typeof selectedPack === 'string'
                            ? `Pack of ${selectedPack}`
                            : selectedPack.name || `Pack of ${selectedPack.quantity || 1}`;
                    }
                }
            } else {
                packType = "Group";
            }

            const totalQuantity = isProductGroup ? unitsQuantity : packQuantity * unitsQuantity;

            // Check stock level before adding to cart
            const stockLevel = isProductGroup
                ? Math.min(...productData.products.map(p => p.stockLevel || 0))
                : productData.stockLevel || 0;

            if (totalQuantity > stockLevel) {
                setError(`Requested quantity (${totalQuantity}) exceeds available stock `);
                return;
            }

            // Calculate discounted price with comparePrice priority
            const calculateDiscountedPrice = (productData) => {
                const originalPrice = productData.eachPrice || 0;

                if (productData.comparePrice !== null && productData.comparePrice !== undefined && productData.comparePrice !== 0) {
                    return productData.comparePrice;
                }

                if (!currentUser || !currentUser.customerId) {
                    return originalPrice;
                }

                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === productData.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
                    return Math.max(0, originalPrice - discountAmount);
                }

                if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
                    for (const groupDiscountDoc of customerGroupsDiscounts) {
                        if (groupDiscountDoc && groupDiscountDoc.customers) {
                            const customerDiscount = groupDiscountDoc.customers.find(
                                customer => customer.user && customer.user.customerId === currentUser.customerId
                            );

                            if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                                const percentage = parseFloat(customerDiscount.percentage);
                                if (percentage > 0) {
                                    return originalPrice + (originalPrice * percentage / 100);
                                } else if (percentage < 0) {
                                    return Math.max(0, originalPrice - (originalPrice * Math.abs(percentage) / 100));
                                }
                            }
                        }
                    }
                }

                return originalPrice;
            };

            const discountedPrice = calculateDiscountedPrice(productData);
            const totalAmount = discountedPrice.toFixed(2);

            // Determine discount type and percentage
            let discountType = "";
            let discountPercentages = 0;

            if (productData.comparePrice !== null && productData.comparePrice !== undefined && productData.comparePrice !== 0) {
                const originalPrice = productData.eachPrice || 0;
                if (originalPrice > 0 && productData.comparePrice < originalPrice) {
                    const discountAmount = originalPrice - productData.comparePrice;
                    discountPercentages = Math.round((discountAmount / originalPrice) * 100);
                    discountType = "Compare Price";
                }
            } else if (currentUser && currentUser.customerId) {
                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === productData.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    discountPercentages = itemDiscount.percentage;
                    discountType = "Item Based Discount";
                } else if (customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
                    for (const groupDiscountDoc of customerGroupsDiscounts) {
                        if (groupDiscountDoc && groupDiscountDoc.customers) {
                            const customerDiscount = groupDiscountDoc.customers.find(
                                customer => customer.user && customer.user.customerId === currentUser.customerId
                            );

                            if (customerDiscount && customerDiscount.percentage !== undefined && customerDiscount.percentage !== null) {
                                discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
                                discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";
                                break;
                            }
                        }
                    }
                }
            }

            const cartData = {
                customerId: currentUser._id,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                amount: totalAmount,
                discountType: discountType,
                discountPercentages: discountPercentages
            };

            // Add product or product group reference
            if (isProductGroup) {
                cartData.productGroupId = productId;
                cartData.packType = "Group";
                cartData.packQuentity = 1;
            } else {
                cartData.productId = productId;
                cartData.packType = packType;
                cartData.packQuentity = packQuantity;
            }

            console.log("Sending cart data:", cartData);

            const response = await axiosInstance.post('cart/add-to-cart', cartData);

            if (response.data.statusCode === 200) {
                setError(null);
                console.log("Added to cart successfully");
                await fetchCustomersCart();
            } else {
                setError(response.data.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError('An error occurred while adding to cart');
        } finally {
            setLoadingProducts(prev => ({ ...prev, [productId]: false }));
        }
    };

    // ✅ UPDATED: Remove from wishlist function to match backend
    const removeFromWishlist = async (productId, isProductGroup = false) => {
        try {
            if (!currentUser || !currentUser._id) return;

            setLoadingProducts(prev => ({ ...prev, [productId]: true }));

            const requestBody = {
                customerId: currentUser._id
            };

            // Add the correct field based on whether it's a product or product group
            if (isProductGroup) {
                requestBody.productGroupId = productId;
            } else {
                requestBody.productId = productId;
            }

            console.log("Removing from wishlist:", requestBody);

            const res = await axiosInstance.put(`wishlist/remove-from-wishlist`, requestBody);

            if (res.data.statusCode === 200) {
                setWishlistItems(prev => prev.filter(item =>
                    isProductGroup
                        ? item.productGroup?._id !== productId
                        : item.product?._id !== productId
                ));
                setWishlistItemsCount(res.data.data.wishlistItems?.length || 0);
                setError(null);
            } else {
                setError(res.data.message);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setError('Failed to remove from wishlist');
        } finally {
            setLoadingProducts(prev => ({ ...prev, [productId]: false }));
        }
    };

    window.addEventListener('cartUpdated', () => {
        fetchCustomersCart()
    });

    // Fetch customers cart
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

            if (response.data.statusCode === 200) {
                const items = response.data.data.items || [];
                setCartItems(items);
                setCartItemsCount(items.length);
            } else {
                console.error('Failed to fetch cart:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching customer cart:', error);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchCustomersWishList();
            fetchCustomersCart();
        }
    }, [currentUser?._id]);

    useEffect(() => {
        if (currentUser && currentUser.customerId) {
            fetchItemBasedDiscounts();
            fetchCustomersGroupsDiscounts();
        }
    }, [currentUser?.customerId]);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen  p-4 pb-16 font-spartan flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* <Navbar /> */}
            <div className="bg-gray-50 min-h-screen p-4 pb-16 font-spartan ">
                <div className="lg:max-w-[80%] mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-[24px] font-semibold">
                            Wishlist <span className="text-[20px] font-semibold text-[#2D2C70]">
                                ({wishListItems.length} {wishListItems.length === 1 ? 'Item' : 'Items'})
                            </span>
                        </h1>
                        <div className="w-full h-[2px] bg-[#2D2C70] mt-2"></div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Empty State */}
                    {wishListItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
                            <p className="text-gray-500">Add products to your wishlist to save them for later</p>
                        </div>
                    ) : (
                        <>
                            {/* Product Grid */}
                            <div className="grid gap-6">
                                {/* Large screens: 2 cards per row */}
                                <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:ml-18 xl:ml-0">
                                    {wishListItems.map((item) => (
                                        <ProductCard
                                            key={item._id}
                                            item={item}
                                            productQuantities={productQuantities}
                                            selectedUnits={selectedUnits}
                                            loadingProducts={loadingProducts}
                                            currentUser={currentUser}
                                            onUpdateQuantity={updateQuantity}
                                            onUpdateUnit={updateSelectedUnit}
                                            onAddToCart={handleAddToCart}
                                            onUpdateCart={handleAddToCart} // Using same function for update
                                            onRemoveFromWishlist={removeFromWishlist}
                                            customerGroupsDiscounts={customerGroupsDiscounts}
                                            itemBasedDiscounts={itemBasedDiscounts}
                                            cartItems={cartItems}
                                        />
                                    ))}
                                </div>

                                {/* Medium and smaller screens: 1 card per row */}
                                <div className="md:hidden">
                                    {wishListItems.map((item) => (
                                        <div key={item._id} className="mb-6 overflow-x-auto">
                                            <ProductCard
                                                item={item}
                                                productQuantities={productQuantities}
                                                selectedUnits={selectedUnits}
                                                loadingProducts={loadingProducts}
                                                currentUser={currentUser}
                                                onUpdateQuantity={updateQuantity}
                                                onUpdateUnit={updateSelectedUnit}
                                                onAddToCart={handleAddToCart}
                                                onUpdateCart={handleAddToCart} // Using same function for update
                                                onRemoveFromWishlist={removeFromWishlist}
                                                customerGroupsDiscounts={customerGroupsDiscounts}
                                                itemBasedDiscounts={itemBasedDiscounts}
                                                cartItems={cartItems}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default WishListComponent;