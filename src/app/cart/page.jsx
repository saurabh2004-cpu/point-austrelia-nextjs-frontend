'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart, Plus, Minus, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import useUserStore from "@/zustand/user"
import axiosInstance from '@/axios/axiosInstance';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedPacks, setSelectedPacks] = useState({});
    const currentUser = useUserStore((state) => state.user);
    const router = useRouter();


    // Get effective quantity = packQuantity * unitsQuantity
    const calculateDisplayTotalQuantity = (item) => {
        const pack = item.product.typesOfPacks?.find(p => p._id === selectedPacks[item._id]);
        const packQuantity = pack ? parseInt(pack.quantity) : item.packQuentity || 1;
        const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
        return packQuantity * unitsQuantity;
    };

    // Calculate total quantity for display
    const calculateTotalQuantity = (item) => {
        return item.packQuentity * item.unitsQuantity;
    };

    // Calculate tax for an item using display quantities
    const calculateItemTax = (item) => {
        if (!item.product.taxable || !item.product.taxPercentages) {
            return 0;
        }
        const itemPrice = item.product.eachPrice || 0;
        const totalQuantity = calculateDisplayTotalQuantity(item);
        const subtotal = itemPrice * totalQuantity;
        return (subtotal * item.product.taxPercentages) / 100;
    };

    // Calculate subtotal (without tax) using display quantities
    const subtotal = cartItems.reduce((sum, item) => {
        const itemPrice = item.product.eachPrice || 0;
        const totalQuantity = calculateDisplayTotalQuantity(item);
        return sum + (itemPrice * totalQuantity);
    }, 0);

    // Calculate total tax using display quantities
    const totalTax = cartItems.reduce((sum, item) => {
        if (!item.product.taxable || !item.product.taxPercentages) {
            return sum;
        }
        const itemPrice = item.product.eachPrice || 0;
        const totalQuantity = calculateDisplayTotalQuantity(item);
        const subtotal = itemPrice * totalQuantity;
        return sum + ((subtotal * item.product.taxPercentages) / 100);
    }, 0);

    // Calculate total (subtotal + tax)
    const total = subtotal + totalTax;

    // Calculate total items count using display quantities
    const totalItems = cartItems.reduce((sum, item) => sum + calculateDisplayTotalQuantity(item), 0);

    const handleCheckoutclick = () => {
        router.push('/checkout');
    };

    // Fetch customers cart
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            setLoading(true);
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

            console.log("cust cart ", response.data.data)

            if (response.data.statusCode === 200) {
                const items = response.data.data || [];
                setCartItems(items);

                // Initialize local quantities and selected packs from cart data
                const quantities = {};
                const packs = {};
                items.forEach(item => {
                    quantities[item._id] = item.unitsQuantity;
                    // Find the pack that matches the current packQuentity
                    const matchingPack = item.product.typesOfPacks?.find(
                        pack => parseInt(pack.quantity) === item.packQuentity
                    );
                    packs[item._id] = matchingPack?._id || item.product.typesOfPacks?.[0]?._id;
                });
                setLocalQuantities(quantities);
                setSelectedPacks(packs);
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer cart:', error)
        } finally {
            setLoading(false);
        }
    }



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
                totalQuantity: packQuantity * newQty
            });

            console.log("update cart item", response)

            if (response.data.statusCode === 200) {
                await fetchCustomersCart();
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

    // Remove item from cart
    const removeCartItem = async (customerId, productId) => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to remove cart items");
            return;
        }

        setUpdatingItems(prev => ({ ...prev, [productId]: true }));

        try {
            const response = await axiosInstance.put(`cart/remove-from-cart/${customerId}/${productId}`);

            console.log("remove cart item", response)
            if (response.data.statusCode === 200) {
                await fetchCustomersCart();
                setError(null);
            } else {
                setError(response.data.message || "Failed to remove cart item");
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
            setError('An error occurred while removing cart item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [productId]: false }));
        }
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
                const cartResponse = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);
                if (cartResponse.data.statusCode === 200 && cartResponse.data.data._id) {
                    await removeCartItem(cartResponse.data.data._id, item.product._id);
                }
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

    // Handle quantity change
    // const handleQuantityChange = async (item, change) => {
    //     const newQuantity = Math.max(1, item.unitsQuantity + change);

    //     const updatedItem = {
    //         ...item,
    //         unitsQuantity: newQuantity
    //     };

    //     await updateCartItem(updatedItem);
    // };

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
                // await fetchCustomersCart();
                setCartItems([]);
            } else {
                setError(res.data.message)
            }

        } catch (error) {
            console.error('Error clearing cart:', error);
            setError('An error occurred while clearing cart');
        }
    };

    useEffect(() => {
        fetchCustomersCart();
    }, [currentUser]);

    return (
        <>
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
                    <span className="text-[#2D2C70] ml-2">({cartItems.length} Products, {totalItems} Items)</span>
                </h1>
            </div>

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
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70] mx-auto"></div>
                                        </div>
                                    ) : cartItems.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Your cart is empty
                                        </div>
                                    ) : (
                                        cartItems.map((item) => {
                                            const isLoading = updatingItems[item._id];
                                            const isOutOfStock = item.product.stockLevel <= 0;
                                            const displayQuantity = getDisplayQuantity(item);
                                            const selectedPack = getSelectedPack(item);
                                            const totalQuantity = calculateDisplayTotalQuantity(item);
                                            const itemSubtotal = (item.product.eachPrice * totalQuantity);
                                            const itemTax = calculateItemTax(item);
                                            const itemTotal = itemSubtotal + itemTax;
                                            const hasModifications = isItemModified(item);

                                            return (
                                                <div key={item._id} className="lg:py-6">
                                                    <div className="flex flex-col md:flex-row items-center space-x-4 border border-[#00000040] p-3  rounded-lg px-8 lg:px-0  md:space-x-25">
                                                        {/* Product Image */}
                                                        <div className="">
                                                            <div className="rounded-lg flex items-center w-full  justify-items-center ">
                                                                <img
                                                                    className='object-contain'
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
                                                                    <Check className="w-3 h-3 mr-1" />
                                                                    {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                                                                </div>
                                                            </div>

                                                            {/* Price */}
                                                            <div className="text-[24px] font-semibold text-[#2D2C70] mb-1">
                                                                ${item.product.eachPrice.toFixed(2)}
                                                            </div>

                                                            {/* Quantity and Actions */}
                                                            <div className="space-y-4 ">
                                                                <div className="flex flex-col xl:flex-row   align-middle sm:space-x-8 space-y-4 sm:space-y-0">
                                                                    <div className="mb-3  space-x-12 align-center items-center font-spartan">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size</label>
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
                                                                                            {pack.name} ({pack.quantity})
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
                                                                                disabled={isLoading || isOutOfStock}
                                                                                className="p-1 bg-black rounded-md py-1  px-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                                                                {item.product.taxable && item.product.taxPercentages > 0 && (
                                                                    <p className="text-[11px] text-gray-600">
                                                                        (Includes ${itemTax.toFixed(2)} tax at {item.product.taxPercentages}%)
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col xl:flex-row space-y-2 xl:space-y-0 xl:flex-row text-[13px] font-medium items-center space-x-3 mt-4">
                                                                <button
                                                                    onClick={() => updateCartItem(item)}
                                                                    disabled={isLoading || !hasModifications}
                                                                    className={`w-full xl:w-auto text-white px-8 py-2 rounded-full transition-colors ${hasModifications
                                                                        ? 'bg-[#E799A9] hover:bg-[#d68999]'
                                                                        : 'bg-gray-400 cursor-not-allowed'
                                                                        } disabled:opacity-50`}
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
                                                                        onClick={async () => {
                                                                            const cartResponse = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);
                                                                            if (cartResponse.data.statusCode === 200 && cartResponse.data.data._id) {
                                                                                removeCartItem(cartResponse.data.data._id, item.product._id);
                                                                            }
                                                                        }}
                                                                        disabled={isLoading}
                                                                        className='xl:hidden flex h-8 w-9 border border-[#E9098D] rounded-full items-center justify-center disabled:opacity-50'
                                                                    >
                                                                        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="black" />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() => removeCartItem(currentUser._id, item.product._id)}
                                                                    disabled={isLoading}
                                                                    className="hidden xl:flex h-9 w-9 border border-[#E799A9] rounded-full items-center justify-center disabled:opacity-50"
                                                                >
                                                                    <svg
                                                                        width="15"
                                                                        height="16"
                                                                        viewBox="0 0 15 16"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z"
                                                                            fill="black"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {/* Bottom Checkout Button */}
                                    {cartItems.length > 0 && (
                                        <div className="py-6 border-t border-gray-200">
                                            <button
                                                onClick={handleCheckoutclick}
                                                className="w-full bg-[#2D2C70] text-white py-1 hover:bg-[#46BCF9] rounded-lg font-medium  ">
                                                Proceed to checkout
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
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[1rem] font-[400]"><span className='text-[20px] font-medium'>Subtotal</span> ({totalItems} Items)</span>
                                            <span className="text-[20px] font-medium text-[#2D2C70]">${subtotal.toFixed(2)}</span>
                                        </div>

                                        {cartItems.map((item) => (
                                            <div key={item._id} className="flex justify-between text-sm">
                                                <span className="text-[14px] text-[500] text-[#000000]/80">{item.product.commerceCategoriesOne?.name || 'N/A'}</span>
                                                <span className="text-[14px] font-medium">${(item.product.eachPrice * calculateDisplayTotalQuantity(item)).toFixed(2)}</span>
                                            </div>
                                        ))}

                                        {/* Tax Information */}
                                        {totalTax > 0 && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-[14px] text-[500] text-[#000000]/80">Estimated Tax</span>
                                                    <span className="text-[14px] font-medium">${totalTax.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between text-lg font-semibold mb-2">
                                                <span>Total</span>
                                                <span className="text-[#2D2C70]">${total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="text-[14px] text-[400] text-gray-600">
                                            Subtotal does not include shipping
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <button
                                                onClick={handleCheckoutclick}
                                                className="w-full bg-[#2D2C70] border-1 border-[#2D2C70] hover:border-[#46BCF9] hover:bg-[#46BCF9] text-white py-2 rounded-2xl text-[15px] font-medium  transition-colors mb-3">
                                                Proceed to checkout
                                            </button>

                                            <button
                                                onClick={clearCart}
                                                className="w-full border-1 border-[#2D2C70] rounded-2xl text-[15px]  py-2 text-sm font-medium hover:text-pink-600 transition-colors">
                                                Clear cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default ShoppingCart;