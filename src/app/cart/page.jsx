'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Heart, Plus, Minus, Check, AlertTriangle, X, AlertCircle, ChevronDownIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import useUserStore from "@/zustand/user"
import axiosInstance from '@/axios/axiosInstance';
import useCartStore from '@/zustand/cartPopup';
import { set } from 'nprogress';
import { Navbar } from '@/components/Navbar';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedPacks, setSelectedPacks] = useState({});
    const [removingOutOfStock, setRemovingOutOfStock] = useState(false);
    const currentUser = useUserStore((state) => state.user);
    const router = useRouter();
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const cartItemsCount = useCartStore((state) => state.currentItems);
    const [isTaxShippingOpen, setIsTaxShippingOpen] = useState(false);
    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
        totalQuantity: 0,
        totalItems: 0
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        totalItems: 0
    });

    // Confirmation popup states
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
    const [showRemoveItemConfirm, setShowRemoveItemConfirm] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    const checkAuth = useUserStore((state) => state.checkAuth);

    useEffect(() => {
        const checkAuthentication = async () => {
            setLoading(true);

            // If we have a user, allow access
            if (currentUser) {
                setLoading(false);
                return;
            }

            // If no user in store, check if user is actually authenticated
            try {
                const isAuthenticated = await checkAuth();
                if (isAuthenticated) {
                    setLoading(false);
                    return;
                } else {
                    // If not authenticated, redirect to login
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // If auth check fails, redirect to login
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [currentUser, checkAuth, router]);

    // Calculate out of stock items
    const outOfStockItems = cartItems.filter(item => item.product.stockLevel <= 0);
    const outOfStockCount = outOfStockItems.length;

    // Get effective quantity = packQuantity * unitsQuantity
    const calculateDisplayTotalQuantity = (item) => {
        const pack = item.product.typesOfPacks?.find(p => p._id === selectedPacks[item._id]);
        const packQuantity = pack ? parseInt(pack.quantity) : item.packQuentity || 1;
        const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
        return packQuantity * unitsQuantity;
    };

    // Check if quantity exceeds stock level
    const exceedsStockLevel = (item) => {
        const totalQuantity = calculateDisplayTotalQuantity(item);
        return totalQuantity > item.product.stockLevel;
    };

    // Get items that exceed stock level
    const itemsExceedingStock = cartItems.filter(item => exceedsStockLevel(item));
    const exceedingStockCount = itemsExceedingStock.length;

    const handleCheckoutclick = () => {
        router.push('/checkout');
    };

    // Fetch customers cart with pagination
    const fetchCustomersCart = async (page = 1, isLoadMore = false) => {
        try {
            if (!currentUser || !currentUser._id) return;

            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await axiosInstance.get(`cart/get-paginated-cart-by-customer-id/${currentUser._id}?page=${page}&limit=2`)

            console.log("customer cart cart ", response.data.data)

            if (response.data.statusCode === 200) {
                const { items, pagination: paginationData } = response.data.data;
                setTotals(response.data.data.totals)

                if (isLoadMore) {
                    // Append new items for infinite scroll
                    setCartItems(prev => [...prev, ...items]);
                } else {
                    // Replace items for initial load
                    setCartItems(items);
                }

                // Update pagination
                setPagination(paginationData);

                // Initialize local quantities and selected packs from cart data
                const quantities = {};
                const packs = {};
                const itemsToProcess = isLoadMore ? items : response.data.data.items || items;

                itemsToProcess.forEach(item => {
                    quantities[item._id] = item.unitsQuantity;
                    // Find the pack that matches the current packQuentity
                    const matchingPack = item.product.typesOfPacks?.find(
                        pack => parseInt(pack.quantity) === item.packQuentity
                    );
                    packs[item._id] = matchingPack?._id || item.product.typesOfPacks?.[0]?._id;
                });

                setLocalQuantities(prev => ({ ...prev, ...quantities }));
                setSelectedPacks(prev => ({ ...prev, ...packs }));
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer cart:', error)
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    // Load more items
    const loadMoreItems = useCallback(() => {
        if (pagination.hasNext && !loadingMore) {
            fetchCustomersCart(pagination.currentPage + 1, true);
        }
    }, [pagination, loadingMore]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!pagination.hasNext) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    loadMoreItems();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.getElementById('load-more-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [pagination.hasNext, loadingMore, loadMoreItems]);

    // Remove out of stock items
    const removeOutOfStockItems = async () => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to remove items");
            return;
        }

        setRemovingOutOfStock(true);

        try {
            const response = await axiosInstance.delete(
                `cart/remove-out-of-stock-items/${currentUser._id}`
            );

            console.log("remove out of stock items", response);

            if (response.data.statusCode === 200) {
                setCartItems(response.data.data.cartItems);
                setCartItemsCount(response.data.data.cartItems.length);
                setError(null);
            } else {
                setError(response.data.message || "Failed to remove out of stock items");
            }
        } catch (error) {
            console.error('Error removing out of stock items:', error);
            setError('An error occurred while removing out of stock items');
        } finally {
            setRemovingOutOfStock(false);
        }
    };

    // Show current displayed quantity
    const getDisplayQuantity = (item) => {
        return localQuantities[item._id] || item.unitsQuantity;
    };

    // Get selected pack from local state
    const getSelectedPack = (item) => {
        return selectedPacks[item._id] || item.product.typesOfPacks?.[0]?._id;
    };

    // Check if local state differs from original (to enable Update button)
    const isItemModified = (item) => {
        const currentQty = localQuantities[item._id] || item.unitsQuantity;
        const currentPack = selectedPacks[item._id] || item.packQuentity;
        return currentQty !== item.unitsQuantity || currentPack !== item.packQuentity;
    };

    // --- Handlers ---

    // Just update local state, don't call API here
    const handleQuantityChange = (itemId, change) => {
        setLocalQuantities(prev => {
            const newQty = Math.max(1, (prev[itemId] || 1) + change);
            return { ...prev, [itemId]: newQty };
        });
    };

    // Handle pack change
    const handlePackChange = (itemId, packId) => {
        setSelectedPacks(prev => ({ ...prev, [itemId]: packId }));
    };

    // Update cart item using add-to-cart API
    const updateCartItem = async (item) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to update cart items");
            return;
        }

        setUpdatingItems(prev => ({ ...prev, [item._id]: true }));

        try {
            const newQty = localQuantities[item._id] || item.unitsQuantity;
            const selectedPackId = selectedPacks[item._id];
            const selectedPack = item.product.typesOfPacks?.find(p => p._id === selectedPackId);
            const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : item.packQuentity;

            const response = await axiosInstance.post('cart/add-to-cart', {
                customerId: currentUser._id,
                productId: item.product._id,
                packQuentity: packQuantity,
                unitsQuantity: newQty,
                totalQuantity: packQuantity * newQty,
                packType: selectedPack ? selectedPack.name : 'Each',
                amount: item.amount
            });

            console.log("update cart item", response)

            if (response.data.statusCode === 200) {
                setCartItems(prevItems => {
                    return prevItems.map(prevItem => {
                        if (prevItem.product._id === item.product._id) {
                            // Find the updated item from response
                            const updatedItem = response.data.data.cartItems.find(
                                cartItem => cartItem.product._id === item.product._id
                            );

                            if (updatedItem) {
                                // Preserve the full product object from previous state
                                return {
                                    ...updatedItem,
                                    product: prevItem.product // Keep the original populated product
                                };
                            }
                        }
                        return prevItem;
                    });
                });
                setError(null);
            } else {
                setError(response.data.message || "Failed to update cart item");
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            setError('An error occurred while updating cart item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [item._id]: false }));
        }
    };

    // Show confirmation for removing single item
    const handleRemoveItemClick = (item) => {
        setItemToRemove(item);
        setShowRemoveItemConfirm(true);
    };

    // Remove item from cart (after confirmation)
    const removeCartItem = async () => {
        if (!currentUser || !currentUser._id || !itemToRemove) {
            setError("Please login to remove cart items");
            return;
        }

        setUpdatingItems(prev => ({ ...prev, [itemToRemove.product._id]: true }));

        try {
            const response = await axiosInstance.put(`cart/remove-from-cart/${currentUser._id}/${itemToRemove.product._id}`);

            console.log("remove cart item", response)
            if (response.data.statusCode === 200) {
                setCartItems(prevItems => prevItems.filter(item => item.product._id !== itemToRemove.product._id));
                setCartItemsCount(response.data.data.cartItems.length);
                setError(null);
            } else {
                setError(response.data.message || "Failed to remove cart item");
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
            setError('An error occurred while removing cart item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemToRemove.product._id]: false }));
            setShowRemoveItemConfirm(false);
            setItemToRemove(null);
        }
    };

    // Close remove item confirmation
    const handleCancelRemoveItem = () => {
        setShowRemoveItemConfirm(false);
        setItemToRemove(null);
    };

    // Move to wishlist
    const moveToWishlist = async (item) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to move items to wishlist");
            return;
        }

        setUpdatingItems(prev => ({ ...prev, [item._id]: true }));

        try {
            // Add to wishlist
            const wishlistResponse = await axiosInstance.post('wishlist/add-to-wishlist', {
                customerId: currentUser._id,
                productId: item.product._id
            });

            console.log("move to wishlist", wishlistResponse)

            if (wishlistResponse.data.statusCode === 200) {
                // Remove from cart after successfully adding to wishlist
                handleRemoveItemClick(item);
                setError(null);
            } else {
                setError(wishlistResponse.data.message || "Failed to move to wishlist");
            }
        } catch (error) {
            console.error('Error moving to wishlist:', error);
            setError('An error occurred while moving to wishlist');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [item._id]: false }));
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to clear cart");
            return;
        }

        try {
            const res = await axiosInstance.delete(`cart/clear-cart/${currentUser._id}`);

            if (res.data.statusCode === 200) {
                setError(null);
                setCartItemsCount(0);
                setCartItems([]);
                setTotals({
                    subtotal: 0,
                    tax: 0,
                    grandTotal: 0,
                    totalQuantity: 0,
                    totalItems: 0
                });
                setShowClearCartConfirm(false); // Close confirmation popup
            } else {
                setError(res.data.message)
            }

        } catch (error) {
            console.error('Error clearing cart:', error);
            setError('An error occurred while clearing cart');
        }
    };

    // Show confirmation popup
    const handleClearCartClick = () => {
        if (cartItems.length === 0) {
            setError("Your cart is already empty");
            return;
        }
        setShowClearCartConfirm(true);
    };

    // Close confirmation popup
    const handleCancelClearCart = () => {
        setShowClearCartConfirm(false);
    };

    useEffect(() => {
        fetchCustomersCart(1, false);
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <>
            {/* <Navbar /> */}
            <div className="bg-white justify-items-center pt-6 font-spartan">
                <div className="max-w-8xl mx-auto px-2  lg:px-6 xl:px-8 ">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
                        <span>Home</span>
                        <span className="mx-1 sm:mx-2">/</span>
                        <span className=" text-black ">Shopping Cart</span>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <div className="px-6 md:px-0  md:max-w-7xl mx-auto text-[24px] py-4  relative top-5  flex items-center justify-between ">
                <h1 className="text-xl font-semibold text-gray-900 ">
                    Shopping Cart
                    <span className="text-[#2D2C70] ml-2">({cartItemsCount} Products, {cartItemsCount} Items)</span>
                </h1>
            </div>

            {/* Out of Stock Warning */}
            {outOfStockCount > 0 && (
                <div className="max-w-7xl mx-auto px-4 pt-2 mb-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-yellow-800">
                                        Out of Stock Items
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} currently out of stock in your cart.
                                    </p>
                                    <div className="mt-2">
                                        <button
                                            onClick={removeOutOfStockItems}
                                            disabled={removingOutOfStock}
                                            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {removingOutOfStock ? 'Removing...' : 'Remove out of stock items'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exceeding Stock Level Warning */}
            {exceedingStockCount > 0 && (
                <div className="max-w-7xl mx-auto px-4 pt-2 mb-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-orange-800">
                                    Stock Level Exceeded
                                </h3>
                                <p className="text-sm text-orange-700 mt-1">
                                    {exceedingStockCount} {exceedingStockCount === 1 ? 'item exceeds' : 'items exceed'} available stock. Please reduce quantities before checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 pt-2">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                </div>
            )}

            <div className="min-h-screen  py-4 px-4 sm:px-6  lg:px-8 font-spartan ">
                <div className="max-w-7xl justify-between mx-auto border-t-2 border-[#2D2C70]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Shopping Cart Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg ">
                                {/* Cart Items */}
                                <div className="space-y-10 lg:space-y-0 max-w-xl mt-5 mx-auto xl:mx-0 xl:mt-0">
                                    {loading && cartItems.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70] mx-auto"></div>
                                        </div>
                                    ) : cartItems.length === 0 && !loading ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Your cart is empty
                                        </div>
                                    ) : (
                                        <>
                                            {cartItems.map((item) => {
                                                const isLoading = updatingItems[item._id];
                                                const isOutOfStock = item.product.stockLevel <= 0;
                                                const displayQuantity = getDisplayQuantity(item);
                                                const selectedPack = getSelectedPack(item);
                                                const totalQuantity = calculateDisplayTotalQuantity(item);
                                                const itemSubtotal = (item.amount * totalQuantity);
                                                const itemTax = totals.tax;
                                                const itemTotal = itemSubtotal + itemTax;
                                                const hasModifications = isItemModified(item);
                                                const exceedsStock = exceedsStockLevel(item);
                                                const stockLevel = item.product.stockLevel;

                                                return (
                                                    <div key={item._id} className="lg:py-6">
                                                        <div className={`flex flex-col md:flex-row items-center space-x-4 border p-3 rounded-lg px-8 lg:pl-0 md:space-x-25 ${isOutOfStock
                                                            ? 'border-red-300 bg-red-50/30'
                                                            : exceedsStock
                                                                ? 'border-orange-300 bg-orange-50/30'
                                                                : 'border-[#00000040]'
                                                            }`}>
                                                            {/* Product Image */}
                                                            <div className="">
                                                                <div className="rounded-lg flex items-center w-full  justify-items-center  ">
                                                                    <img
                                                                        className='object-contain xl:pl-2'
                                                                        src={item.product.images || "/placeholder.svg"}
                                                                        alt={item.product.ProductName}
                                                                        width={116}
                                                                        height={116}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Product Details */}
                                                            <div className="flex-1 ">
                                                                {/* Product Name */}
                                                                <h3 className="text-[15px] font-semibold  mb-1">
                                                                    {item.product.ProductName}
                                                                </h3>

                                                                {/* SKU and Stock */}
                                                                <div className='flex align-center justify-between pr-12 items-center'>
                                                                    <p className="text-[13px] text-[400] ">SKU: {item.product.sku}</p>
                                                                    <div className={`flex items-center w-[100px] text-[10px] font-semibold p-2 text-[14px] rounded ${isOutOfStock
                                                                        ? 'bg-red-100 text-red-600'
                                                                        : 'bg-[#E7FAEF] text-black'
                                                                        }`}>
                                                                        {isOutOfStock ? (
                                                                            <X className="w-3 h-3 mr-1" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                                                                    </div>
                                                                </div>

                                                                {/* Stock Level Warning for Item */}
                                                                {exceedsStock && !isOutOfStock && (
                                                                    <div className="flex items-center space-x-2 mt-2 mb-2 bg-orange-100 border border-orange-300 rounded-md p-2">
                                                                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                                                        <p className="text-xs text-orange-700">
                                                                            Requested quantity ({totalQuantity}) exceeds available stock ({stockLevel}). Please reduce quantity.
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Available Stock Display */}
                                                                {!isOutOfStock && (
                                                                    <p className="text-[12px] text-gray-600 mb-1">
                                                                        Available: {stockLevel} units
                                                                    </p>
                                                                )}

                                                                {/* Price */}
                                                                <div className="text-[24px] font-semibold text-[#2D2C70] mb-1">
                                                                    ${item?.amount?.toFixed(2)}
                                                                </div>

                                                                {/* Quantity and Actions */}
                                                                <div className="space-y-4 ">
                                                                    <div className="flex flex-col xl:flex-row   align-middle sm:space-x-8 space-y-4 sm:space-y-0">
                                                                        <div className="mb-3  space-x-12 align-center items-center font-spartan">
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pack Type</label>
                                                                            <div className="relative w-full">
                                                                                <select
                                                                                    value={selectedPacks[item._id] || ''}
                                                                                    onChange={(e) => handlePackChange(item._id, e.target.value)}
                                                                                    disabled={isOutOfStock}
                                                                                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                >
                                                                                    {item.product.typesOfPacks && item.product.typesOfPacks.length > 0 ? (
                                                                                        item.product.typesOfPacks.map((pack) => (
                                                                                            <option key={pack._id} value={pack._id}>
                                                                                                {pack.name}
                                                                                            </option>
                                                                                        ))
                                                                                    ) : (
                                                                                        <option value="">No packs available</option>
                                                                                    )}
                                                                                </select>
                                                                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="hidden xl:block bg-gray-300 w-[1px] h-15 ml-8"></div>

                                                                        <div className="flex  items-start space-x-2 space-y-2 flex-col">
                                                                            <span className="text-sm font-[400] ">Quantity</span>
                                                                            <div className="flex items-center  rounded-lg">
                                                                                <button
                                                                                    onClick={() => handleQuantityChange(item._id, -1)}
                                                                                    disabled={isLoading || displayQuantity <= 1 || isOutOfStock}
                                                                                    className="p-1 bg-black rounded-md  px-2 py-1 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                                >
                                                                                    <Minus className="w-4 h-4 text-white" />
                                                                                </button>
                                                                                <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                                                                                    {isLoading ? (
                                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto"></div>
                                                                                    ) : (
                                                                                        displayQuantity
                                                                                    )}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleQuantityChange(item._id, 1)}
                                                                                    disabled={isLoading || isOutOfStock || exceedsStock}
                                                                                    className="p-1 bg-black rounded-md py-1  px-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                                    title={exceedsStock ? 'Stock level exceeded' : ''}
                                                                                >
                                                                                    <Plus className="w-4 h-4 text-white " />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Amount with Tax */}
                                                                <div className="space-y-1">
                                                                    <span className="text-[13px] font-semibold ">
                                                                        Amount: <span className="text-[#2D2C70] text-[15px] font-semibold">${itemTotal.toFixed(2)}</span>
                                                                    </span>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex flex-col xl:flex-row space-y-2 xl:space-y-0 xl:flex-row text-[13px] font-medium items-center space-x-3 mt-4">
                                                                    <button
                                                                        onClick={() => updateCartItem(item)}
                                                                        disabled={isLoading || !hasModifications || exceedsStock}
                                                                        className={`w-full xl:w-auto text-white px-8 py-2 rounded-full transition-colors ${hasModifications && !exceedsStock
                                                                            ? 'bg-[#E799A9] hover:bg-[#d68999]'
                                                                            : 'bg-gray-400 cursor-not-allowed'
                                                                            } disabled:opacity-50`}
                                                                        title={exceedsStock ? 'Cannot update: stock level exceeded' : ''}
                                                                    >
                                                                        {isLoading ? 'Updating...' : 'Update'}
                                                                    </button>
                                                                    <div className='flex items-center space-x-3 w-full xl:w-auto'>
                                                                        <button
                                                                            onClick={() => moveToWishlist(item)}
                                                                            disabled={isLoading}
                                                                            className="flex items-center w-full xl:w-auto justify-center space-x-2 bg-[#46BCF9] text-white text-[13px] font-semibold px-4 py-2 rounded-full disabled:opacity-50">
                                                                            <Heart className="h-4 w-4" />
                                                                            <span className='mt-1'>Move to wishlist</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleRemoveItemClick(item)}
                                                                            disabled={isLoading}
                                                                            className='xl:hidden flex h-8 w-9 border border-[#E9098D] rounded-full items-center justify-center disabled:opacity-50'
                                                                        >
                                                                            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="black" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => handleRemoveItemClick(item)}
                                                                        disabled={isLoading}
                                                                        className="hidden xl:flex h-9 w-9 border border-[#E799A9] rounded-full items-center justify-center disabled:opacity-50"
                                                                    >
                                                                        <Image
                                                                            src="/icons/dustbin-1.png"
                                                                            alt="Remove item"
                                                                            width={16}
                                                                            height={16}
                                                                            className="object-contain"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Loading More Indicator */}
                                            {loadingMore && (
                                                <div className="flex justify-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D2C70]"></div>
                                                </div>
                                            )}

                                            {/* Sentinel for infinite scroll */}
                                            {pagination.hasNext && (
                                                <div id="load-more-sentinel" className="h-10" />
                                            )}
                                        </>
                                    )}
                                    {/* Bottom Checkout Button */}
                                    {cartItems.length > 0 && (
                                        <div className="py-6 border-t border-gray-200">
                                            <button
                                                onClick={handleCheckoutclick}
                                                disabled={exceedingStockCount > 0 || outOfStockCount > 0}
                                                className={`w-full text-white py-1 rounded-lg font-medium transition-colors ${exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[#2D2C70] hover:bg-[#46BCF9]'
                                                    }`}
                                                title={
                                                    exceedingStockCount > 0 || outOfStockCount > 0
                                                        ? 'Please fix stock issues before checkout'
                                                        : ''
                                                }
                                            >
                                                {exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'Fix Stock Issues to Proceed'
                                                    : 'Proceed to checkout'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 pt-5 font-spartan">
                            <div className="bg-white rounded-lg shadow-sm sticky top-6 border">
                                <div className="p-6">
                                    <h2 className="text-[20px] font-semibold mb-6">Order Summary</h2>

                                    <div className="space-y-4">
                                        <div className=" text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[1rem] font-[400]"><span className='text-[20px] font-medium'>Subtotal</span> ({totals.totalItems} Items)</span>
                                                <span className="text-[20px] font-medium text-[#2D2C70]">${totals.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="text-[14px] text-[400] text-gray-600">
                                                Subtotal does not include shipping
                                            </div>
                                        </div>

                                        {(() => {
                                            // Group items by brand
                                            const brandTotals = {};
                                            cartItems.forEach(item => {
                                                const brandName = item.product.commerceCategoriesOne?.name || 'No Brand';
                                                const itemTotal = item.product.eachPrice * calculateDisplayTotalQuantity(item);

                                                if (!brandTotals[brandName]) {
                                                    brandTotals[brandName] = 0;
                                                }
                                                brandTotals[brandName] += itemTotal;
                                            });

                                            // Convert to array and render
                                            return Object.entries(brandTotals).map(([brandName, total]) => (
                                                <div key={brandName} className="flex justify-between text-sm">
                                                    <span className="text-[14px] text-[500] text-[#000000]/80">{brandName}</span>
                                                    <span className="text-[14px] font-medium">${total.toFixed(2)}</span>
                                                </div>
                                            ));
                                        })()}

                                        {/* Total */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between text-lg font-semibold mb-2">
                                                <span>Total</span>
                                                <span className="text-[#2D2C70]">${totals.grandTotal.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Stock Issues Warning in Summary */}
                                        {(exceedingStockCount > 0 || outOfStockCount > 0) && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-700 font-medium">
                                                    ⚠ Cannot proceed to checkout
                                                </p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    Please fix stock level issues in your cart
                                                </p>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 pt-4 space-y-2 text-[15px] font-semibold ">
                                            <div className="border-1 border-black rounded-2xl overflow-hidden">
                                                <button
                                                    onClick={() => setIsTaxShippingOpen(!isTaxShippingOpen)}
                                                    className="w-full flex px-3 py-2 justify-between transition-colors items-center"
                                                >
                                                    <div className='flex gap-2 items-center'>
                                                        Gst & shipping
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-question-mark-icon lucide-circle-question-mark">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                                <path d="M12 17h.01" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className='pr-4'>
                                                        <ChevronDownIcon
                                                            strokeWidth={3}
                                                            className={`w-5 h-5 font-bold transition-transform ${isTaxShippingOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>
                                                </button>

                                                {/* Dropdown content */}
                                                {isTaxShippingOpen && (
                                                    <div className="px-3 pb-3 border-t border-gray-200">
                                                        {/* GST in dropdown */}
                                                        {totals.tax > 0 && (
                                                            <div className="flex justify-between text-sm py-2">
                                                                <span className="text-[14px] text-[500] text-[#000000]/80">GST</span>
                                                                <span className="text-[14px] font-medium">${totals.tax.toFixed(2)}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between text-sm py-2">
                                                            <span className="text-[14px] text-[500] text-[#000000]/80">Shipping</span>
                                                            {currentUser?.defaultShippingRate > 0 ? <span className="text-[14px] font-medium">Free</span>
                                                                : <span className="text-[14px] font-medium">$0</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleCheckoutclick}
                                                disabled={exceedingStockCount > 0 || outOfStockCount > 0}
                                                className={`w-full border-1 text-white py-2 rounded-2xl text-[15px] font-medium transition-colors  ${exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'bg-gray-400 border-black cursor-not-allowed'
                                                    : 'bg-[#2D2C70] border-[#2D2C70] ] '
                                                    }`}
                                                title={
                                                    exceedingStockCount > 0 || outOfStockCount > 0
                                                        ? 'Please fix stock issues before checkout'
                                                        : ''
                                                }
                                            >
                                                {exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'Fix Stock Issues'
                                                    : 'Proceed to checkout'}
                                            </button>

                                            <div className="flex items-center space-x-3">
                                                <button
                                                    className={`flex items-center justify-center rounded-2xl border border-black flex-1 gap-2 text-[1rem] font-semibold border  py-2 px-6 transition-colors duration-300 group 'bg-gray-400 text-gray-200 border-gray-400  bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]`}
                                                >
                                                    <svg
                                                        className="w-5 h-5 transition-colors duration-300 "
                                                        viewBox="0 0 21 21"
                                                        fill="currentColor"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                                                    </svg>
                                                    Continue Shopping
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleClearCartClick}
                                                className="w-full border-1 border-black rounded-2xl py-2 transition-colors hover:bg-gray-50">
                                                Clear cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Cart Confirmation Popup */}
            {showClearCartConfirm && (
                <div className="fixed inset-0 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-semibold ml-3">Clear Shopping Cart</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to clear your entire cart? This action will remove all {cartItems.length} items and cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelClearCart}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={clearCart}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Item Confirmation Popup */}
            {showRemoveItemConfirm && itemToRemove && (
                <div className="fixed inset-0 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-semibold ml-3">Remove Item</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove "<span className="font-semibold">{itemToRemove.product.ProductName}</span>" from your cart?
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelRemoveItem}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={removeCartItem}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Remove Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShoppingCart;