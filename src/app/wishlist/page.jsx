'use client'

import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Share2, Minus, Plus, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';
import useWishlistStore from '@/zustand/wishList';
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
    onUpdateWishlist,
    onRemoveFromWishlist,
    customerGroupsDiscounts,
    itemBasedDiscounts
}) => {
    const product = item.product;
    const productId = product._id;
    const isLoading = loadingProducts[productId];

    // Discount calculation functions
    const calculateDiscountedPrice = (product) => {
        if (!currentUser || !currentUser.customerId) {
            return product.eachPrice || 0;
        }

        const originalPrice = product.eachPrice || 0;

        // Check for item-based discount first
        const itemDiscount = itemBasedDiscounts.find(
            discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
            const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
            return originalPrice - discountAmount;
        }

        // Check for pricing group discount
        if (product.pricingGroup) {
            const productPricingGroupId = typeof product.pricingGroup === 'object'
                ? product.pricingGroup._id
                : product.pricingGroup;

            const groupDiscount = customerGroupsDiscounts.find(
                discount =>
                    discount.customerId === currentUser.customerId &&
                    discount.pricingGroup &&
                    discount.pricingGroup._id === productPricingGroupId
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

        if (product.pricingGroup) {
            const productPricingGroupId = typeof product.pricingGroup === 'object'
                ? product.pricingGroup._id
                : product.pricingGroup;

            const groupDiscount = customerGroupsDiscounts.find(
                discount =>
                    discount.customerId === currentUser.customerId &&
                    discount.pricingGroup &&
                    discount.pricingGroup._id === productPricingGroupId
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
                    {/* {!isOutOfStock && (
                        <p className="text-[12px] text-gray-600 mb-1">
                            Available: {product.stockLevel} units
                        </p>
                    )} */}

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
                            <p className="text-orange-600 text-[12px] font-medium">
                                Requested quantity ({totalQuantity}) exceeds available stock ({product.stockLevel}). Please reduce quantity.
                            </p>
                        </div>
                    )}

                    {/* Price with Discount */}
                    <div className="flex items-center space-x-2">
                        <span className="text-[#2D2C70] font-semibold text-[24px]">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {hasProductDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                                ${product.eachPrice ? product.eachPrice.toFixed(2) : '0.00'}
                            </span>
                        )}
                        {discountPercentage && (
                            <span className="text-sm text-green-600 font-semibold">
                                {discountPercentage}% OFF
                            </span>
                        )}
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
                                               appearance-none ${!isAvailable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={isLoading || !isAvailable}
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
                        <button
                            onClick={() => onUpdateWishlist(
                                currentUser._id,
                                productId,
                                productQuantities[productId],
                                selectedUnits[productId]
                            )}
                            className={`text-[13px] font-semibold border border-black text-white rounded-2xl py-1 px-15 disabled:opacity-50 ${isAvailable ? 'bg-[#E799A9] hover:bg-[#d68999]' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !isAvailable}
                            title={!isAvailable ? (isOutOfStock ? "Product is out of stock" : "Requested quantity exceeds available stock") : ""}
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                        <button
                            onClick={() => onAddToCart(productId)}
                            className={`flex py-2 gap-2 text-[13px] text-[#2D2C70] font-semibold border border-black text-white rounded-2xl py-1 px-6 disabled:opacity-50 ${isAvailable ? 'bg-[#46BCF9] hover:bg-[#3aa8e0]' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={isLoading || !isAvailable}
                            title={!isAvailable ? (isOutOfStock ? "Product is out of stock" : "Requested quantity exceeds available stock") : ""}
                        >
                            <svg
                                className="w-5 h-5 transition-colors duration-300"
                                viewBox="0 0 21 21"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                            </svg>
                            {!isAvailable ? (isOutOfStock ? 'Out of Stock' : 'Exceeds Stock') : 'Add to Cart'}
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

    // Discount states (same as product listing)
    const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([]);
    const [itemBasedDiscounts, setItemBasedDiscounts] = useState([]);

    console.log("Wishlist Items:", wishListItems);
    console.log("Current User:", currentUser);

    const router = useRouter();

    // Fetch discount data (same as product listing)
    const fetchCustomersGroupsDiscounts = async () => {
        try {
            if (!currentUser || !currentUser.customerId) return;

            const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser.customerId}`);

            console.log("pricing groups discounts", response);

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

            console.log("item based discounts", response);

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

            console.log("Customer wishlist:", response);
            if (response.data.statusCode === 200) {
                const items = response.data.data || [];
                setWishlistItems(items);
                setWishlistItemsCount(items.length);

                // Initialize quantities and selected units from existing wishlist data
                const initialQuantities = {};
                const initialUnits = {};
                items.forEach(item => {
                    // Use existing quantities from wishlist or default to 1
                    initialQuantities[item.product._id] = item.unitsQuantity || 1;

                    // Set pack selection from existing data or default to first pack
                    if (item.product.typesOfPacks && item.product.typesOfPacks.length > 0) {
                        // Try to find the pack that matches the current packQuentity
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

    // Add to cart function with discount calculation
    // Add to cart function with discount calculation
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

            // Check stock level before adding to cart
            if (totalQuantity > product.stockLevel) {
                setError(`Requested quantity (${totalQuantity}) exceeds available stock (${product.stockLevel})`);
                return;
            }

            // Calculate discounted price
            const calculateDiscountedPrice = (product) => {
                if (!currentUser || !currentUser.customerId) {
                    return product.eachPrice || 0;
                }

                const originalPrice = product.eachPrice || 0;

                const itemDiscount = itemBasedDiscounts.find(
                    discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
                );

                if (itemDiscount) {
                    const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
                    return originalPrice - discountAmount;
                }

                if (product.pricingGroup) {
                    const productPricingGroupId = typeof product.pricingGroup === 'object'
                        ? product.pricingGroup._id
                        : product.pricingGroup;

                    const groupDiscount = customerGroupsDiscounts.find(
                        discount =>
                            discount.customerId === currentUser.customerId &&
                            discount.pricingGroup &&
                            discount.pricingGroup._id === productPricingGroupId
                    );

                    if (groupDiscount) {
                        const discountAmount = (originalPrice * groupDiscount.percentage) / 100;
                        return originalPrice - discountAmount;
                    }
                }

                return originalPrice;
            };

            const discountedPrice = calculateDiscountedPrice(product);
            const totalAmount = totalQuantity * discountedPrice;

            const cartData = {
                customerId: currentUser._id,
                productId: productId,
                packType: packType, // Send packType name instead of ID
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity,
                amount: totalAmount
            };

            console.log("Sending cart data:", cartData);

            const response = await axiosInstance.post('cart/add-to-cart', cartData);

            if (response.data.statusCode === 200) {
                setError(null);
                console.log("Added to cart successfully");
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

    // Update wishlist item with quantity and pack information
    const handleUpdateWishlistItem = async (customerId, productId, unitsQuantity, selectedUnitId) => {
        try {
            setLoadingProducts(prev => ({ ...prev, [productId]: true }));

            const packQuantity = getPackQuantity(productId, selectedUnitId);
            const totalQuantity = packQuantity * unitsQuantity;

            const res = await axiosInstance.put('wishlist/update-wishlist-items', {
                customerId,
                productId,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity
            });

            console.log("Update wishlist response:", res);

            if (res.data.statusCode === 200) {
                await fetchCustomersWishList();
                setError(null);
            } else {
                setError(res.data.message);
            }
        } catch (error) {
            console.error('Error updating wishlist item:', error);
            setError('Failed to update wishlist');
        } finally {
            setLoadingProducts(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            if (!currentUser || !currentUser._id) return;

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
    }, []);

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
                                            onUpdateWishlist={handleUpdateWishlistItem}
                                            onRemoveFromWishlist={removeFromWishlist}
                                            customerGroupsDiscounts={customerGroupsDiscounts}
                                            itemBasedDiscounts={itemBasedDiscounts}
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
                                                onUpdateWishlist={handleUpdateWishlistItem}
                                                onRemoveFromWishlist={removeFromWishlist}
                                                customerGroupsDiscounts={customerGroupsDiscounts}
                                                itemBasedDiscounts={itemBasedDiscounts}
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