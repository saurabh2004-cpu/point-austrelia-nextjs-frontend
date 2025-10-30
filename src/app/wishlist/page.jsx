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
    const product = item.product;
    const productId = product._id;
    const isLoading = loadingProducts[productId];

    // ✅ Check if product is already in cart
    const isProductInCart = cartItems.some(cartItem => cartItem.product._id === productId);
    const cartItem = cartItems.find(cartItem => cartItem.product._id === productId);

    // ✅ UPDATED: Discount calculation with comparePrice priority
    const calculateDiscountedPrice = (product) => {
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
    const getDiscountPercentage = (product) => {
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
    const hasDiscount = (product) => {
        if (!product) return false;

        // Check if product has comparePrice discount
        if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
            const originalPrice = product.eachPrice || 0;
            if (product.comparePrice < originalPrice) {
                return true;
            }
        }

        // Check if product has item-based or pricing group discount
        return getDiscountPercentage(product) !== null;
    };

    // Get pack quantity from selected unit
    const getPackQuantity = (selectedUnitId) => {
        if (!product.typesOfPacks || product.typesOfPacks.length === 0) return 1;

        const selectedPack = product.typesOfPacks.find(pack =>
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

    // Get pack type name from selected unit
    const getPackTypeName = (selectedUnitId) => {
        if (!product.typesOfPacks || product.typesOfPacks.length === 0) return "Each";

        const selectedPack = product.typesOfPacks.find(pack =>
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
        const selectedUnitId = selectedUnits[productId];
        const packQuantity = getPackQuantity(selectedUnitId);
        return packQuantity * unitsQuantity;
    };

    // Check if product is out of stock or exceeds stock level
    const totalQuantity = calculateTotalQuantity(productId);
    const isOutOfStock = product.stockLevel <= 0;
    const exceedsStock = totalQuantity > product.stockLevel;
    const isAvailable = !isOutOfStock && !exceedsStock;

    // ✅ NEW: Check if cart item has been modified locally
    const isCartItemModified = () => {
        if (!isProductInCart || !cartItem) return false;

        const currentQty = productQuantities[productId] || 1;
        const currentPackId = selectedUnits[productId];

        // Compare with cart item data
        const cartPackQuantity = cartItem.packQuentity || 1;
        const currentPackQuantity = getPackQuantity(currentPackId);

        return currentQty !== cartItem.unitsQuantity || currentPackQuantity !== cartPackQuantity;
    };

    // Calculate amount based on selected pack and quantity
    const calculateAmount = (product, productId) => {
        const unitsQuantity = productQuantities[productId] || 1;
        const selectedUnitId = selectedUnits[productId];
        const packQuantity = getPackQuantity(selectedUnitId);
        const totalQuantity = packQuantity * unitsQuantity;

        const discountedPrice = calculateDiscountedPrice(product);
        return (discountedPrice * totalQuantity).toFixed(2);
    };

    // Get discounted price and discount info
    const discountedPrice = calculateDiscountedPrice(product);
    const discountPercentage = getDiscountPercentage(product);
    const hasProductDiscount = hasDiscount(product);

    const hasModifications = isCartItemModified();

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 font-spartan xl:h-full xl:w-[622px]">
            <div className="flex flex-col xl:flex-row h-full gap-7 mt-4">
                {/* Product Image */}
                <div className="flex-shrink-0 mr-4">
                    <div className="xl:w-39 h-full rounded-lg flex items-center justify-center align-middle relative">
                        <img
                            src={product.images || '/product-listing-images/product-1.avif'}
                            alt={product.ProductName}
                            className="object-contain h-[156px] w-[156px]"
                            key={productId}
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2 max-w-[350px] mx-auto xl:mx-0">
                    <h3 className="text-[15px] font-semibold line-clamp-2 mb-2">
                        {product.ProductName}
                    </h3>
                    <div className="flex items-center space-x-10 mb-2 justify-between align-middle">
                        <span className="font-medium text-[13px]">
                            SKU: {product.sku}
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
                    {!isOutOfStock && (
                        <p className="text-[12px] text-gray-600 mb-1">
                            Available: {product.stockLevel} units
                        </p>
                    )}

                    {/* Out of Stock Warning */}
                    {isOutOfStock && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2">
                            <p className="text-red-600 text-[12px] font-medium">
                                This product is currently out of stock and cannot be added to cart.
                            </p>
                        </div>
                    )}

                    {/* Exceeds Stock Warning */}
                    {exceedsStock && (
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-2 mb-2">
                            <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-orange-600 text-[12px] font-medium">
                                    Requested quantity ({totalQuantity}) exceeds available stock ({product.stockLevel}). Please reduce quantity.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Already in Cart Info */}
                    {/* {isProductInCart && !hasModifications && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
                            <div className="flex items-start">
                                <Check className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-blue-600 text-[12px] font-medium">
                                    This product is already in your cart ({cartItem?.unitsQuantity} units)
                                </p>
                            </div>
                        </div>
                    )} */}

                    {/* Price with Discount */}
                    <div className="flex items-center space-x-2">
                        <span className="text-[#2D2C70] font-semibold text-[24px]">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {hasProductDiscount && !discountPercentage > product.eachPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                ${product.eachPrice ? product.eachPrice.toFixed(2) : '0.00'}
                            </span>
                        )}
                        {/* {discountPercentage && (
                            <span className="text-sm text-green-600 font-semibold">
                                {discountPercentage}% OFF
                            </span>
                        )} */}
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className="mb-3 space-x-12 align-center items-center font-spartan">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                            <div className="relative w-full">
                                <select
                                    value={selectedUnits[productId] || ''}
                                    onChange={(e) => onUpdateUnit(productId, e.target.value)}
                                    className={`w-full border border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm 
                                               focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                               appearance-none ${!isAvailable ? 'bg-gray-100 ' : ''}`}
                                    disabled={isLoading}
                                >
                                    {product.typesOfPacks && product.typesOfPacks.length > 0 ? (
                                        product.typesOfPacks.map((pack) => (
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

                        <div className="flex items-start space-x-2 space-y-2 flex-col justify-between">
                            <span className="text-[13px] font-medium">Quantity</span>
                            <div className="flex items-center rounded-lg">
                                <button
                                    onClick={() => onUpdateQuantity(productId, (productQuantities[productId] || 1) - 1)}
                                    className="p-1 bg-black rounded-md px-2 py-[5px] transition-colors disabled:opacity-50"
                                    disabled={isLoading || (productQuantities[productId] || 1) <= 1}
                                >
                                    <Minus className="w-3 h-3 text-white" />
                                </button>
                                <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                                    {productQuantities[productId] || 1}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity(productId, (productQuantities[productId] || 1) + 1)}
                                    className="p-1 bg-black rounded-md py-[5px] px-2 transition-colors disabled:opacity-50"
                                    disabled={isLoading || !isAvailable || exceedsStock}
                                    title={exceedsStock ? 'Stock level exceeded' : !isAvailable ? 'Out of stock' : ''}
                                >
                                    <Plus className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='text-[16px] font-semibold mt-4 gap-2 flex'>
                        <span>Amount:</span>
                        <span className="text-[#2D2C70] text-[18px]">
                            ${calculateAmount(product, productId)}
                        </span>
                    </div>

                    <div className='flex text-[13px] font-semibold justify-between w-full'>
                        {/* ✅ UPDATE BUTTON: Only enabled when product is in cart AND has modifications */}
                        <button
                            onClick={() => onAddToCart(productId)}
                            className={`text-[13px] font-semibold border border-black text-white rounded-2xl py-1 px-8 disabled:opacity-50 ${hasModifications && isAvailable && isProductInCart
                                ? 'bg-[#E799A9] hover:bg-[#d68999] cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !hasModifications || !isAvailable || !isProductInCart}
                            title={
                                !isProductInCart
                                    ? "Product not in cart"
                                    : !isAvailable
                                        ? (isOutOfStock ? "Product is out of stock" : "Requested quantity exceeds available stock")
                                        : !hasModifications
                                            ? "No changes to update"
                                            : "Update cart item"
                            }
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>

                        {/* ✅ ADD TO CART BUTTON: Disabled when product is already in cart */}
                        <button
                            onClick={() => onAddToCart(productId)}
                            className={`flex py-2 gap-2 text-[13px] text-white font-semibold border border-black rounded-2xl py-1 px-8 disabled:opacity-50 ${isAvailable && !isProductInCart
                                ? 'bg-[#46BCF9] hover:bg-[#3aa8e0] cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !isAvailable || isProductInCart}
                            title={
                                isProductInCart
                                    ? "Product already in cart"
                                    : !isAvailable
                                        ? (isOutOfStock ? "Product is out of stock" : "Requested quantity exceeds available stock")
                                        : "Add to cart"
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
                                ? (isOutOfStock ? 'Out of Stock' : 'Exceeds Stock')
                                : (isProductInCart ? 'In Cart' : 'Add to Cart')
                            }
                        </button>

                        <button
                            onClick={() => onRemoveFromWishlist(productId)}
                            className={`h-9 w-9 border rounded-full flex items-center justify-center hover:bg-[#E9098D] hover:text-white transition-colors disabled:opacity-50 ${isAvailable ? 'border-[#E799A9]' : 'border-gray-400'
                                }`}
                            disabled={isLoading}
                        >
                            <img src="/icons/dustbin-1.png" className='w-4 h-4' alt="" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Page = () => {
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
                    initialQuantities[item.product._id] = item.unitsQuantity || 1;

                    if (item.product.typesOfPacks && item.product.typesOfPacks.length > 0) {
                        const matchingPack = item.product.typesOfPacks.find(pack => {
                            if (typeof pack === 'string') {
                                return parseInt(pack) === item.packQuentity;
                            }
                            return parseInt(pack.quantity) === item.packQuentity;
                        });

                        if (matchingPack) {
                            initialUnits[item.product._id] = typeof matchingPack === 'string' ? matchingPack : matchingPack._id;
                        } else {
                            initialUnits[item.product._id] = typeof item.product.typesOfPacks[0] === 'string'
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

    // Get pack quantity from selected unit
    const getPackQuantity = (productId, selectedUnitId) => {
        const product = wishListItems.find(item => item.product._id === productId)?.product;
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

    // Update selected pack type
    const updateSelectedUnit = (productId, packId) => {
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: packId
        }));
    };

    // ✅ Move this function outside of ProductCard so it can be used in handleAddToCart
    const calculateDiscountedPrice = (product, currentUser, itemBasedDiscounts, customerGroupsDiscounts) => {
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

    // ✅ NEW: Update cart item function
    const handleAddToCart = async (productId) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to add items to cart");
            return;
        }

        setLoadingProducts(prev => ({ ...prev, [productId]: true }));

        try {
            const item = wishListItems.find(item => item.product._id === productId);
            if (!item) return;

            const product = item.product;
            const selectedPackId = selectedUnits[productId];
            const packQuantity = getPackQuantity(productId, selectedPackId);
            const unitsQuantity = productQuantities[productId] || 1;
            const totalQuantity = packQuantity * unitsQuantity;

            // Check stock level before adding to cart
            if (totalQuantity > product.stockLevel) {
                setError(`Requested quantity (${totalQuantity}) exceeds available stock (${product.stockLevel})`);
                return;
            }

            // Get pack type name for cart schema
            const getPackTypeName = (selectedUnitId) => {
                if (!product.typesOfPacks || product.typesOfPacks.length === 0) return "Each";

                const selectedPack = product.typesOfPacks.find(pack =>
                    (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
                );

                if (!selectedPack) return "Each";

                if (typeof selectedPack === 'string') {
                    return `Pack of ${selectedPack}`;
                }
                return selectedPack.name || `Pack of ${selectedPack.quantity || 1}`;
            };

            const packType = getPackTypeName(selectedPackId);

            // Calculate discounted price with comparePrice priority
            const discountedPrice = calculateDiscountedPrice(product);
            // FIXED: Calculate total amount correctly - discounted price is per unit
            const totalAmount = discountedPrice.toFixed(2);

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
                productId: productId,
                packType: packType,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                amount: totalAmount, // This is now correctly calculated
                discountType: discountType,
                discountPercentages: discountPercentages
            };

            console.log("Sending cart data with discounts:", cartData);

            const response = await axiosInstance.post('cart/add-to-cart', cartData);

            if (response.data.statusCode === 200) {
                setError(null);
                console.log("Added to cart successfully");
                // Refresh cart items count
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

    // ✅ UPDATED: Update cart function with discount priority
    const handleUpdateCart = async (productId) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to update cart");
            return;
        }

        setLoadingProducts(prev => ({ ...prev, [productId]: true }));

        try {
            const item = wishListItems.find(item => item.product._id === productId);
            if (!item) return;

            const product = item.product;
            const selectedPackId = selectedUnits[productId];
            const packQuantity = getPackQuantity(productId, selectedPackId);
            const unitsQuantity = productQuantities[productId] || 1;
            const totalQuantity = packQuantity * unitsQuantity;

            // Check stock level
            if (totalQuantity > product.stockLevel) {
                setError(`Requested quantity (${totalQuantity}) exceeds available stock (${product.stockLevel})`);
                return;
            }

            // Get pack type name
            const getPackTypeName = (selectedUnitId) => {
                if (!product.typesOfPacks || product.typesOfPacks.length === 0) return "Each";

                const selectedPack = product.typesOfPacks.find(pack =>
                    (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
                );

                if (!selectedPack) return "Each";

                if (typeof selectedPack === 'string') {
                    return `Pack of ${selectedPack}`;
                }
                return selectedPack.name || `Pack of ${selectedPack.quantity || 1}`;
            };

            const packType = getPackTypeName(selectedPackId);

            // ✅ UPDATED: Calculate discounted price with comparePrice priority
            const calculateDiscountedPrice = (product) => {
                const originalPrice = product.eachPrice || 0;

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

            const discountedPrice = calculateDiscountedPrice(product);
            const totalAmount = discountedPrice.toFixed(2);

            // ✅ UPDATED: Determine discount type and percentage
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

            const updateData = {
                customerId: currentUser._id,
                productId: productId,
                packType: packType,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                amount: totalAmount,
                discountType: discountType,
                discountPercentages: discountPercentages
            };

            console.log("Updating cart with data:", updateData);

            const response = await axiosInstance.put('cart/update-cart-items', updateData);

            if (response.data.statusCode === 200) {
                setError(null);
                console.log("Cart updated successfully");
                // Refresh cart items
                await fetchCustomersCart();
            } else {
                setError(response.data.message || "Failed to update cart");
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            setError('An error occurred while updating cart');
        } finally {
            setLoadingProducts(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            if (!currentUser || !currentUser._id) return;

            setLoadingProducts(prev => ({ ...prev, [productId]: true }));

            const res = await axiosInstance.put(`wishlist/remove-from-wishlist`,
                {
                    customerId: currentUser._id,
                    productId: productId
                }
            );

            if (res.data.statusCode === 200) {
                setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
                setWishlistItemsCount(res.data.data.length);
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

    // Fetch customers cart
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

            console.log("Customer cart:", response.data.data);

            if (response.data.statusCode === 200) {
                const items = response.data.data || [];
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
            <div className="bg-gray-50 min-h-screen p-4 pb-16 font-spartan flex items-center justify-center">
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
            <div className="bg-gray-50 min-h-screen p-4 pb-16 font-spartan">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-[24px] font-semibold">
                            Wishlist <span className="text-[20px] font-semibold text-[#2D2C70]">
                                ({wishListItems.length} {wishListItems.length === 1 ? 'Product' : 'Products'})
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
                                            onUpdateCart={handleUpdateCart}
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
                                                onUpdateCart={handleUpdateCart}
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

export default Page;