'use client'

import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Share2, Minus, Plus, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';
import useWishlistStore from '@/zustand/wishList';

// Move ProductCard outside the main component to prevent re-creation on every render
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
    onRemoveFromWishlist
}) => {
    const product = item.product;
    const productId = product._id;
    const isLoading = loadingProducts[productId];

    // Get pack quantity from selected unit
    const getPackQuantity = (selectedUnitId) => {
        if (!product.typesOfPacks || product.typesOfPacks.length === 0) return 1;

        const selectedPack = product.typesOfPacks.find(pack =>
            (typeof pack === 'string' ? pack : pack._id) === selectedUnitId
        );

        if (typeof selectedPack === 'string') {
            return parseInt(selectedPack) || 1;
        }
        return selectedPack?.quantity || 1;
    };

    // Calculate amount based on selected pack and quantity
    const calculateAmount = (product, productId) => {
        const unitsQuantity = productQuantities[productId] || 1;
        const selectedUnitId = selectedUnits[productId];
        const packQuantity = getPackQuantity(selectedUnitId);
        const totalQuantity = packQuantity * unitsQuantity;

        return (product.eachPrice * totalQuantity).toFixed(2);
    };

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
                            key={productId} // Stable key to prevent re-renders
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2 max-w-[270px] mx-auto xl:mx-0">
                    <h3 className="text-[15px] font-semibold line-clamp-2 mb-2">
                        {product.ProductName}
                    </h3>
                    <div className="flex items-center space-x-10 mb-2 justify-between align-middle">
                        <span className="font-medium text-[13px]">
                            SKU: {product.sku}
                        </span>
                        {product.stockLevel > 0 ? (
                            <div className="flex items-center text-[14px] font-medium text-black p-1 font-semibold text-[11px] bg-[#E7FAEF]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                IN STOCK
                            </div>
                        ) : (
                            <div className="flex items-center text-[14px] font-medium text-black p-1 font-semibold text-[11px] bg-[#FFEAEA]">
                                <Check strokeWidth={2} className="w-4 h-4 mr-1" />
                                OUT OF STOCK
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="text-[#2D2C70] font-semibold text-[24px]">
                            ${product.eachPrice.toFixed(2)}
                        </span>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className="mb-3 space-x-12 align-center items-center font-spartan">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                            <div className="relative w-full">
                                <select
                                    value={selectedUnits[productId] || ''}
                                    onChange={(e) => onUpdateUnit(productId, e.target.value)}
                                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm 
                                               focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                               appearance-none"
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
                                    disabled={(productQuantities[productId] || 1) <= 1 || isLoading}
                                >
                                    <Minus className="w-3 h-3 text-white" />
                                </button>
                                <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                                    {productQuantities[productId] || 1}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity(productId, (productQuantities[productId] || 1) + 1)}
                                    className="p-1 bg-black rounded-md py-[5px] px-2 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
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
                            className="text-[13px] font-semibold bg-[#2D2C70] text-white rounded-lg py-1 px-6 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                        <button
                            onClick={() => onAddToCart(productId)}
                            className="flex py-2 gap-2 text-[13px] text-[#2D2C70] font-semibold border border-[#2D2C70] rounded-lg py-1 px-3 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <svg
                                className="w-5 h-5 transition-colors duration-300"
                                viewBox="0 0 21 21"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                            </svg>
                            Add to Cart
                        </button>

                        <button
                            onClick={() => onRemoveFromWishlist(productId)}
                            className='h-9 w-9 border border-[#E9098D] rounded-full flex items-center justify-center hover:bg-[#E9098D] hover:text-white transition-colors disabled:opacity-50'
                            disabled={isLoading}
                        >
                            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="currentColor" />
                            </svg>
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

    console.log("Wishlist Items:", wishListItems);
    console.log("Current User:", currentUser);

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
                            return pack.quantity == item.packQuentity;
                        });

                        if (matchingPack) {
                            initialUnits[item.product._id] = typeof matchingPack === 'string' ? matchingPack : matchingPack._id;
                        } else {
                            initialUnits[item.product._id] = item.product.typesOfPacks[0]._id || item.product.typesOfPacks[0];
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
        return selectedPack?.quantity || 1;
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

    // Add to cart
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

            const cartData = {
                customerId: currentUser._id,
                productId: productId,
                packQuentity: packQuantity,
                unitsQuantity: unitsQuantity,
                totalQuantity: totalQuantity
            };

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

            // setLoadingProducts(prev => ({ ...prev, [productId]: true }));

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
    }, [currentUser]);

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
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Page;