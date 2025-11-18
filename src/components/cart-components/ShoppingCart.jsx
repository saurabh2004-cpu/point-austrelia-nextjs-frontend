'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Plus, Minus, Check, AlertTriangle, X, AlertCircle, ChevronDownIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import useUserStore from "@/zustand/user"
import axiosInstance from '@/axios/axiosInstance';
import useCartStore from '@/zustand/cartPopup';
import { set } from 'nprogress';
import { useProductFiltersStore } from '@/zustand/productsFiltrs';
import ProductPopup from '../product-details-components/Popup';
import useWishlistStore from '@/zustand/wishList';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedPacks, setSelectedPacks] = useState({});
    const [removingOutOfStock, setRemovingOutOfStock] = useState(false);
    const [removingExceedsStock, setRemovingExceedsStock] = useState(false);
    const currentUser = useUserStore((state) => state.user);
    const router = useRouter();
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const cartItemsCount = useCartStore((state) => state.currentItems);
    const [isTaxShippingOpen, setIsTaxShippingOpen] = useState(false);
    const [navigationLoading, setNavigationLoading] = useState(false);
    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
        totalQuantity: 0,
        totalItems: 0
    });
    const [brandWiseTotals, setBrandWiseTotals] = useState([]);
    const [hoveredImage, setHoveredImage] = useState(null);
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
    } = useProductFiltersStore()


    const [showProductPopup, setShowProductPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductGroup, setSelectedProductGroup] = useState(null);
    const [wishListItems, setWishlistItems] = useState([])
    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);


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


    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return;

            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`);

            if (response.data.statusCode === 200) {
                // Set the wishlist items from response.data.data
                setWishlistItems(response.data.data || []);
                setWishlistItemsCount(response.data.data?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching customer wishlist:', error);
        }
    }

    useEffect(() => {
        fetchCustomersWishList()
    }, [currentUser?._id])

    // Helper functions for handling both products and product groups
    const isProductGroup = (item) => {
        return !!item.productGroup;
    };

    const getItemName = (item) => {
        if (item.product) {
            return item.product.ProductName;
        } else if (item.productGroup) {
            return item.productGroup.name;
        }
        return 'Unknown Item';
    };

    const getItemImage = (item) => {
        if (item.product && item.product.images) {
            return item.product.images;
        } else if (item.productGroup && item.productGroup.thumbnail) {
            return item.productGroup.thumbnail;
        }
        return '/placeholder.svg';
    };

    const getItemSku = (item) => {
        if (item.product) {
            return item.product.sku;
        } else if (item.productGroup) {
            return item.productGroup.sku;
        }
        return 'N/A';
    };

    const getStockLevel = (item) => {
        if (item.product) {
            return item.product.stockLevel || 0;
        } else if (item.productGroup) {
            // For product groups, sum the stock of all individual products in the group
            const totalStock = (item.productGroup.products || []).reduce((sum, productItem) => {
                return sum + (productItem.product?.stockLevel || 0);
            }, 0);
            return totalStock;
        }
        return 0;
    };

    const isOutOfStock = (item) => {
        return getStockLevel(item) <= 0;
    };

    // Calculate out of stock items
    const outOfStockItems = cartItems.filter(item => isOutOfStock(item));
    const outOfStockCount = outOfStockItems.length;

    const calculateDisplayTotalQuantity = (item) => {
        if (item.product) {
            const pack = item.product.typesOfPacks?.find(p => p._id === selectedPacks[item._id]);
            const packQuantity = pack ? parseInt(pack.quantity) : item.packQuentity || 1;
            const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
            return packQuantity * unitsQuantity;
        } else if (item.productGroup) {
            // For product groups, each unit represents one set of the bundle
            const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
            return unitsQuantity; // This represents number of bundles
        }
        return 0;
    };

    // Check if quantity exceeds stock level
    const exceedsStockLevel = (item) => {
        const totalQuantity = calculateDisplayTotalQuantity(item);
        return totalQuantity > getStockLevel(item);
    };

    // Get items that exceed stock level
    const itemsExceedingStock = cartItems.filter(item => exceedsStockLevel(item));
    const exceedingStockCount = itemsExceedingStock.length;

    const handleCheckoutclick = async () => {
        if (exceedingStockCount > 0 || outOfStockCount > 0) {
            return; // Don't proceed if there are stock issues
        }

        setNavigationLoading(true);
        try {
            // Add a small delay to ensure loader is visible
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push('/checkout');
        } catch (error) {
            console.error('Navigation error:', error);
            setNavigationLoading(false);
        }

    }

    // Fetch customers cart with pagination
    const fetchCustomersCart = async (page = 1, isLoadMore = false) => {
        try {
            if (!currentUser || !currentUser._id) return;

            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await axiosInstance.get(`cart/get-paginated-cart-by-customer-id/${currentUser._id}?page=${page}&limit=10`)

            console.log("customer cart cart ", response.data.data)

            if (response.data.statusCode === 200) {
                const { items, pagination: paginationData, totals: totalsData, brandWiseTotals } = response.data.data;
                setTotals(totalsData || {
                    subtotal: 0,
                    tax: 0,
                    grandTotal: 0,
                    totalQuantity: 0,
                    totalItems: 0
                });

                setBrandWiseTotals(brandWiseTotals || {});

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
                const itemsToProcess = isLoadMore ? items : (response.data.data.items || items);

                itemsToProcess.forEach(item => {
                    quantities[item._id] = item.unitsQuantity;

                    if (item.product) {
                        // Find the pack that matches the current packQuentity for products
                        const matchingPack = item.product.typesOfPacks?.find(
                            pack => parseInt(pack.quantity) === item.packQuentity
                        );
                        packs[item._id] = matchingPack?._id || item.product.typesOfPacks?.[0]?._id;
                    } else if (item.productGroup) {
                        // Product groups don't have packs, set default
                        packs[item._id] = 'default';
                    }
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

    // Remove all out of stock items at once
    const removeOutOfStockItems = async () => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to remove items");
            return;
        }

        if (outOfStockCount === 0) {
            setError("No out of stock items to remove");
            return;
        }

        setRemovingOutOfStock(true);

        try {
            // Prepare items to remove with proper type identification
            const itemsToRemove = outOfStockItems.map(item => {
                if (item.product) {
                    return { productId: item.product._id };
                } else if (item.productGroup) {
                    return { productGroupId: item.productGroup._id };
                }
                return null;
            }).filter(item => item !== null);

            if (itemsToRemove.length === 0) {
                setError('No valid items to remove');
                return;
            }

            const response = await axiosInstance.put(
                `cart/remove-multiple-from-cart/${currentUser._id}`,
                { itemsToRemove }
            );

            console.log("remove multiple out of stock items", response);

            if (response.data.statusCode === 200) {
                // Update local state
                setCartItems(prev => prev.filter(item => !isOutOfStock(item)));
                setCartItemsCount(response.data.data.cartItems?.length || 0);
                setError(null);

                // Refresh totals
                await fetchCustomersCart(1, false);
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

    // NEW FUNCTION: Remove all items that exceed stock levels
    const removeExceedsStockItems = async () => {
        if (!currentUser || !currentUser._id) {
            setError("Please login to remove items");
            return;
        }

        if (exceedingStockCount === 0) {
            setError("No items exceed stock levels");
            return;
        }

        setRemovingExceedsStock(true);

        try {
            // Prepare items to remove with proper type identification
            const itemsToRemove = itemsExceedingStock.map(item => {
                if (item.product) {
                    return { productId: item.product._id };
                } else if (item.productGroup) {
                    return { productGroupId: item.productGroup._id };
                }
                return null;
            }).filter(item => item !== null);

            if (itemsToRemove.length === 0) {
                setError('No valid items to remove');
                return;
            }

            const response = await axiosInstance.put(
                `cart/remove-multiple-from-cart/${currentUser._id}`,
                { itemsToRemove }
            );

            console.log("remove multiple exceeds stock items", response);

            if (response.data.statusCode === 200) {
                // Update local state
                setCartItems(prev => prev.filter(item => !exceedsStockLevel(item)));
                setCartItemsCount(response.data.data.cartItems?.length || 0);
                setError(null);

                // Refresh totals
                await fetchCustomersCart(1, false);
            } else {
                setError(response.data.message || "Failed to remove items that exceed stock levels");
            }
        } catch (error) {
            console.error('Error removing items that exceed stock levels:', error);
            setError('An error occurred while removing items that exceed stock levels');
        } finally {
            setRemovingExceedsStock(false);
        }
    };

    // Show current displayed quantity
    const getDisplayQuantity = (item) => {
        const localQty = localQuantities[item._id];
        return localQty === '' ? '' : (localQty || item.unitsQuantity);
    };

    // Get selected pack from local state
    const getSelectedPack = (item) => {
        return selectedPacks[item._id];
    };

    // Check if local state differs from original (to enable Update button)
    const isItemModified = (item) => {
        const currentQty = localQuantities[item._id] || item.unitsQuantity;

        if (item.product) {
            const currentPack = selectedPacks[item._id];
            const originalPack = item.product.typesOfPacks?.find(p => parseInt(p.quantity) === item.packQuentity)?._id;
            return currentQty !== item.unitsQuantity || currentPack !== originalPack;
        } else if (item.productGroup) {
            // For product groups, only check quantity changes
            return currentQty !== item.unitsQuantity;
        }

        return false;
    };

    const handleQuantityChange = (itemId, change) => {
        setLocalQuantities(prev => {
            const newQty = Math.max(1, (prev[itemId] || 1) + change);
            return { ...prev, [itemId]: newQty };
        });
        // This will trigger the useEffect and update the UI immediately
    };

    // Handle pack change (only for products)
    const handlePackChange = (itemId, packId) => {
        setSelectedPacks(prev => ({ ...prev, [itemId]: packId }));
        // This will trigger the useEffect and update the UI immediately
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
            let packQuantity = 1;
            let packType = 'Each';
            let productId = null;
            let productGroupId = null;

            if (item.product) {
                // For products
                productId = item.product._id;
                const selectedPackId = selectedPacks[item._id];
                const selectedPack = item.product.typesOfPacks?.find(p => p._id === selectedPackId);
                packQuantity = selectedPack ? parseInt(selectedPack.quantity) : item.packQuentity;
                packType = selectedPack ? selectedPack.name : 'Each';
            } else if (item.productGroup) {
                // For product groups
                productGroupId = item.productGroup._id;
                // Product groups use default pack values
            }

            const totalQuantity = packQuantity * newQty;

            const response = await axiosInstance.post('cart/add-to-cart', {
                customerId: currentUser._id,
                productId: productId,
                productGroupId: productGroupId,
                packQuentity: packQuantity,
                unitsQuantity: newQty,
                totalQuantity: totalQuantity,
                packType: packType,
                amount: item.amount,
                discountType: item.discountType || "",
                discountPercentages: item.discountPercentages || 0
            });

            console.log("update cart item", response)

            if (response.data.statusCode === 200) {
                setCartItems(prevItems => {
                    return prevItems.map(prevItem => {
                        if (prevItem._id === item._id) {
                            // Find the updated item from response
                            const updatedItem = response.data.data.cartItems.find(
                                cartItem => cartItem._id === item._id
                            );

                            if (updatedItem) {
                                // Preserve the full product/productGroup object from previous state
                                return {
                                    ...updatedItem,
                                    product: prevItem.product, // Keep the original populated product
                                    productGroup: prevItem.productGroup // Keep the original populated productGroup
                                };
                            }
                        }
                        return prevItem;
                    });
                });

                // Refresh the cart to get updated totals
                await fetchCustomersCart(1, false);
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

    // Calculate real-time subtotal for display (before API refresh)
    const calculateRealtimeSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            const itemPrice = item.amount || 0;
            const totalQuantity = calculateDisplayTotalQuantity(item);
            return sum + (itemPrice * totalQuantity);
        }, 0);
    };

    // Calculate real-time tax for display (before API refresh)
    const calculateRealtimeTax = () => {
        return cartItems.reduce((sum, item) => {
            // For products
            if (item.product && item.product.taxable && item.product.taxPercentages) {
                const itemPrice = item.amount || 0;
                const totalQuantity = calculateDisplayTotalQuantity(item);
                const subtotal = itemPrice * totalQuantity;
                return sum + (subtotal * item.product.taxPercentages) / 100;
            }
            // For product groups
            if (item.productGroup && item.productGroup.taxable && item.productGroup.taxPercentages) {
                const itemPrice = item.amount || 0;
                const totalQuantity = calculateDisplayTotalQuantity(item);
                const subtotal = itemPrice * totalQuantity;
                return sum + (subtotal * item.productGroup.taxPercentages) / 100;
            }
            return sum;
        }, 0);
    };

    // Calculate real-time grand total
    const calculateRealtimeGrandTotal = () => {
        const subtotal = calculateRealtimeSubtotal();
        const tax = calculateRealtimeTax();
        return subtotal + tax;
    };

    // Calculate real-time total quantity
    const calculateRealtimeTotalQuantity = () => {
        return cartItems.reduce((sum, item) => sum + calculateDisplayTotalQuantity(item), 0);
    };

    // Calculate item-specific tax for display in the product card
    const calculateItemTax = (item) => {
        const totalQuantity = calculateDisplayTotalQuantity(item);
        const itemSubtotal = (item.amount || 0) * totalQuantity;

        // For products
        if (item.product && item.product.taxable && item.product.taxPercentages) {
            return (itemSubtotal * item.product.taxPercentages) / 100;
        }
        // For product groups
        if (item.productGroup && item.productGroup.taxable && item.productGroup.taxPercentages) {
            return (itemSubtotal * item.productGroup.taxPercentages) / 100;
        }
        return 0;
    };

    // Calculate item total (subtotal + tax) for display in product card
    const calculateItemTotal = (item) => {
        const totalQuantity = calculateDisplayTotalQuantity(item);
        const itemSubtotal = (item.amount || 0) * totalQuantity;
        // const itemTax = calculateItemTax(item);
        return itemSubtotal
    };

    // Calculate brand-wise pricing in real-time
    const calculateBrandWisePricing = () => {
        const brandTotals = {};

        cartItems.forEach(item => {
            let brandName = 'No Brand';
            if (item.product?.commerceCategoriesOne?.name) {
                brandName = item.product.commerceCategoriesOne.name;
            } else if (item.productGroup?.commerceCategoriesOne?.name) {
                brandName = item.productGroup.commerceCategoriesOne.name;
            }

            const totalQuantity = calculateDisplayTotalQuantity(item);
            const itemTotal = (item.amount || 0) * totalQuantity;

            if (!brandTotals[brandName]) {
                brandTotals[brandName] = 0;
            }
            brandTotals[brandName] += itemTotal;
        });

        return brandTotals;
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

        const itemId = itemToRemove.product?._id || itemToRemove.productGroup?._id;
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

        try {
            const response = await axiosInstance.put(`cart/remove-from-cart/${currentUser._id}`, {
                productId: itemToRemove.product?._id || null,
                productGroupId: itemToRemove.productGroup?._id || null
            });

            console.log("remove cart item", response)
            if (response.data.statusCode === 200) {
                setCartItems(prevItems => prevItems.filter(item => item._id !== itemToRemove._id));
                setCartItemsCount(response.data.data.cartItems?.length || 0);
                setError(null);

                // Refresh totals
                if (response.data.data.cartItems?.length === 0) {
                    setTotals({
                        subtotal: 0,
                        tax: 0,
                        grandTotal: 0,
                        totalQuantity: 0,
                        totalItems: 0
                    });
                }
            } else {
                setError(response.data.message || "Failed to remove cart item");
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
            setError('An error occurred while removing cart item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
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
                productId: item.product?._id || null,
                productGroupId: item.productGroup?._id || null
            });

            console.log("move to wishlist", wishlistResponse)

            if (wishlistResponse.data.statusCode === 200) {
                // Remove from cart after successfully adding to wishlist
                // handleRemoveItemClick(item);
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

    const getOriginalPriceForDisplay = (item, isProductGroup = false) => {
        if (!item) return 0;
        // If compare price exists and is higher than current price, show compare price as original
        if (item.discountType === "Compare Price" && item.discountPercentages !== undefined && item.discountPercentages !== 0) {
            const currentPrice = isProductGroup ? (item.amount || 0) : (item.amount || 0);
            if (item.discountPercentages > currentPrice) {
                return item.discountPercentages;
            }
        } else if (item.discountType === "Item Discount" && item.discountPercentages !== undefined && item.discountPercentages !== 0) {
            return item.product.eachPrice;
        } else if (item.discountType === "Pricing Group Discount" && item.discountPercentages !== undefined && item.discountPercentages !== 0) {
            const currentPrice = item?.product?.eachPrice;
            const discountPercentages = parseFloat(item.discountPercentages);

            if (discountPercentages < 0) {
                return currentPrice;
            } else if (discountPercentages > 0) {
                return null;
            }

            return currentPrice;
        }

        // Otherwise, show the actual original price
        return isProductGroup ? (item.eachPrice || '') : (item.eachPrice || '');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div>Loading...</div>
            </div>
        );
    }

    const handleProductClick = (itemName, itemId, isProductGroup = false) => {
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

    const handleQuickViewClick = (item) => {
        const isProductGroupItem = isProductGroup(item);

        if (isProductGroupItem) {
            setSelectedProductGroup(item.productGroup);
            setSelectedProduct(null);
        } else {
            setSelectedProduct(item.product);
            setSelectedProductGroup(null);
        }

        setShowProductPopup(true);
    };

    return (
        <>
            {/* <Navbar /> */}
            <div className="bg-white  justify-items-center pt-6 font-spartan">
                <div className="md:max-w-[80%] mx-auto px-2  lg:px-6 xl:px-8 ">
                    <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full" >
                        <span>Home</span>
                        <span className="mx-1 sm:mx-2">/</span>
                        <span className=" text-black ">Shopping Cart</span>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <div className="px-6 md:px-0  md:max-w-[80%] md:ml-30  xl:left-14 mackbook-cart-heading mx-auto text-[24px] py-4  relative top-5  flex items-center justify-between ">
                <h1 className="text-xl font-semibold text-gray-900 ">
                    Shopping Cart
                    <span className="text-[#2D2C70] ml-2">({cartItemsCount} Products, {totals.totalQuantity} Items)</span>
                </h1>
            </div>

            {/* Out of Stock Warning */}
            {outOfStockCount > 0 && (
                <div className="md:max-w-[80%] mx-auto px-4 pt-2 mb-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-yellow-800">
                                        Out of Stock Items
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} currently out of stock and cannot be purchased.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={removeOutOfStockItems}
                                disabled={removingOutOfStock}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                            >
                                {removingOutOfStock ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Removing...
                                    </div>
                                ) : (
                                    `Remove ${outOfStockCount} Out of Stock Item${outOfStockCount > 1 ? 's' : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exceeding Stock Level Warning - Show with remove button */}
            {exceedingStockCount > 0 && (
                <div className="md:max-w-[80%] mx-auto px-4 pt-2 mb-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                            <button
                                onClick={removeExceedsStockItems}
                                disabled={removingExceedsStock}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                            >
                                {removingExceedsStock ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Removing...
                                    </div>
                                ) : (
                                    `Remove ${exceedingStockCount} Item${exceedingStockCount > 1 ? 's' : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display - Only show when NO other warnings */}
            {error && outOfStockCount === 0 && exceedingStockCount === 0 && (
                <div className="md:max-w-[80%] mx-auto px-4 pt-2">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                </div>
            )}

            <div className="min-h-screen  py-4 px-4 sm:px-6  lg:px-8 font-spartan ">
                <div className="md:max-w-[80%] justify-between mx-auto border-t-2 border-[#2D2C70]">
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
                                                const outOfStock = isOutOfStock(item);
                                                const displayQuantity = getDisplayQuantity(item);
                                                const selectedPack = getSelectedPack(item);
                                                const totalQuantity = calculateDisplayTotalQuantity(item);
                                                const itemSubtotal = (item.amount * totalQuantity);
                                                const itemTax = totals.tax / (totals.totalItems || 1); // Approximate tax per item
                                                const itemTotal = itemSubtotal + itemTax;
                                                const hasModifications = isItemModified(item);
                                                const exceedsStock = exceedsStockLevel(item);
                                                const stockLevel = getStockLevel(item);
                                                const isProductGroupItem = isProductGroup(item);

                                                return (
                                                    <div key={item._id} className="lg:py-2">
                                                        <div className={`flex flex-col md:flex-row items-center space-x-4 border p-3 rounded-lg px-8 lg:pl-0   ${outOfStock
                                                            ? 'border-red-300 bg-red-50/30'
                                                            : exceedsStock
                                                                ? 'border-orange-300 bg-orange-50/30'
                                                                : 'border-[#00000040]'
                                                            }`}>
                                                            {/* Product Image */}
                                                            <div className="">
                                                                <div
                                                                    className="rounded-lg flex items-center w-full justify-items-center relative group"
                                                                    onMouseEnter={() => setHoveredImage(item._id)}
                                                                    onMouseLeave={() => setHoveredImage(null)}
                                                                >
                                                                    {/* Quick View Overlay */}
                                                                    <div className={`absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-300 z-20 ${hoveredImage === item._id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleQuickViewClick(item);
                                                                            }}
                                                                            className=" text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm bg-[#46BCF9] transition-colors cursor-pointer"
                                                                        >
                                                                            {/* <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="16"
                                                                                height="16"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            >
                                                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                                                <circle cx="12" cy="12" r="3" />
                                                                            </svg> */}
                                                                            Quick View
                                                                        </button>
                                                                    </div>

                                                                    <img
                                                                        className='object-contain h-[200px] w-[200px] xl:pl-2 cursor-pointer transition-transform duration-300 group-hover:scale-105'
                                                                        src={getItemImage(item)}
                                                                        alt={getItemName(item)}
                                                                        onClick={() => handleProductClick(getItemName(item), isProductGroupItem ? item.productGroup?._id : item.product?._id, isProductGroupItem)}
                                                                        onError={(e) => {
                                                                            e.target.src = '/placeholder.svg';
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Product Details */}
                                                            <div className="flex-1 ">
                                                                {/* Product Name */}
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3
                                                                        className="text-[15px] font-semibold cursor-pointer hover:text-[#E9098D]"
                                                                        onClick={() => handleProductClick(getItemName(item), isProductGroupItem ? item.productGroup?._id : item.product?._id, isProductGroupItem)}
                                                                    >
                                                                        {getItemName(item)}
                                                                    </h3>
                                                                    {isProductGroupItem && (
                                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                                            BUNDLE
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* SKU and Stock */}
                                                                <div className='flex align-center justify-between pr-12 items-center '>
                                                                    <p className="text-[13px] text-[400] ">SKU: {getItemSku(item)}</p>
                                                                    <div className={`flex items-center w-[125px] text-[10px] font-semibold p-2 text-[14px] rounded ${outOfStock
                                                                        ? 'bg-red-100 text-red-600'
                                                                        : 'bg-[#E7FAEF] text-black'
                                                                        }`}>
                                                                        {outOfStock ? (
                                                                            <X className="w-3 h-3 mr-1" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        {outOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                                                                    </div>
                                                                </div>

                                                                {/* Stock Level Warning for Item */}
                                                                {exceedsStock && !outOfStock && (
                                                                    <div className="flex items-center space-x-2 mt-2 mb-2 bg-orange-100 border border-orange-300 rounded-md p-2">
                                                                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                                                        <p className="text-xs text-orange-700">
                                                                            Requested quantity ({totalQuantity}) exceeds available stock ({stockLevel}). Please reduce quantity.
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Price */}
                                                                <div className='flex items-center space-x-2'>
                                                                    <div className="text-[24px] font-semibold text-[#2D2C70] mb-1">
                                                                        ${item?.amount?.toFixed(2)}
                                                                    </div>
                                                                    {getOriginalPriceForDisplay(item, isProductGroup) &&
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            ${parseFloat(getOriginalPriceForDisplay(item, isProductGroup)).toFixed(2)}
                                                                        </span>}
                                                                </div>


                                                                {/* Quantity and Actions */}
                                                                <div className="space-y-4 ">
                                                                    <div className="flex flex-col xl:flex-row   align-middle sm:space-x-8 space-y-4 sm:space-y-0">
                                                                        {/* Pack Type Dropdown (only for products) */}
                                                                        {item.product && item.product.typesOfPacks && item.product.typesOfPacks.length > 0 && (
                                                                            <div className="mb-3 space-x-6 align-center items-center font-spartan">
                                                                                <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">Pack Type</label>
                                                                                <div className="relative w-full">
                                                                                    <select
                                                                                        value={selectedPacks[item._id] || ''}
                                                                                        onChange={(e) => handlePackChange(item._id, e.target.value)}
                                                                                        disabled={outOfStock}
                                                                                        className="w-full border cursor-pointer border-gray-200 rounded-md pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        {item.product.typesOfPacks.map((pack) => (
                                                                                            <option key={pack._id} value={pack._id}>
                                                                                                {pack.name}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {item.product && <div className="hidden xl:block bg-gray-300 w-[1px] h-15 ml-8"></div>}

                                                                        <div className="flex items-start space-x-2 space-y-2 flex-col">
                                                                            <span className="text-sm font-[400] cursor-pointer">Quantity</span>
                                                                            <div className="flex items-center rounded-lg">
                                                                                <button
                                                                                    onClick={() => handleQuantityChange(item._id, -1)}
                                                                                    disabled={isLoading || displayQuantity <= 1 || outOfStock}
                                                                                    className="p-1 bg-black rounded-md px-2 py-1 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                                                                >
                                                                                    <Minus className="w-4 h-4 text-white" />
                                                                                </button>

                                                                                {/* Input field for direct quantity entry */}
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={displayQuantity}
                                                                                    onChange={(e) => {
                                                                                        const inputValue = e.target.value;

                                                                                        // If input is empty (backspace cleared it), set to empty string
                                                                                        if (inputValue === '') {
                                                                                            setLocalQuantities(prev => ({
                                                                                                ...prev,
                                                                                                [item._id]: '' // Set to empty string for user input
                                                                                            }));
                                                                                            return;
                                                                                        }

                                                                                        const newQuantity = parseInt(inputValue);

                                                                                        // If valid number entered, handle the change
                                                                                        if (!isNaN(newQuantity) && newQuantity >= 1) {
                                                                                            setLocalQuantities(prev => ({
                                                                                                ...prev,
                                                                                                [item._id]: newQuantity
                                                                                            }));
                                                                                        }
                                                                                    }}
                                                                                    onBlur={(e) => {
                                                                                        // When input loses focus, if empty, set back to 1
                                                                                        if (e.target.value === '' || e.target.value === '0') {
                                                                                            setLocalQuantities(prev => ({
                                                                                                ...prev,
                                                                                                [item._id]: 1
                                                                                            }));
                                                                                        }
                                                                                    }}
                                                                                    className="w-12 h-[25px] mx-2 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D2C70] cursor-pointer"
                                                                                    disabled={outOfStock || isLoading}
                                                                                />

                                                                                <button
                                                                                    onClick={() => handleQuantityChange(item._id, 1)}
                                                                                    disabled={isLoading || outOfStock || exceedsStock}
                                                                                    className="p-1 bg-black rounded-md py-1 px-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                                                                    title={exceedsStock ? 'Stock level exceeded' : ''}
                                                                                >
                                                                                    <Plus className="w-4 h-4 text-white" />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>

                                                                {/* Amount with Tax */}
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center align-middle gap-2 text-[13px] font-semibold pt-1">
                                                                        <span>Subtotal :</span>
                                                                        <span className="text-[#2D2C70] text-[15px] leading-none">
                                                                            ${calculateItemTotal(item).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>


                                                                {/* Action Buttons */}
                                                                <div className="flex flex-col xl:flex-row space-y-2 xl:space-y-0 xl:flex-row text-[13px] font-medium items-center space-x-3 mt-4">
                                                                    <button
                                                                        onClick={() => updateCartItem(item)}
                                                                        disabled={isLoading || !hasModifications || exceedsStock}
                                                                        className={`w-full xl:w-auto text-white px-8 py-2 rounded-full cursor-pointer transition-colors ${hasModifications && !exceedsStock
                                                                            ? 'bg-[#E799A9] hover:bg-[#d68999]'
                                                                            : 'bg-gray-400 cursor-not-allowed'
                                                                            } disabled:opacity-50`}
                                                                        title={exceedsStock ? 'Cannot update: stock level exceeded' : ''}
                                                                    >
                                                                        {isLoading ? 'Updating' : 'Update'}
                                                                    </button>
                                                                    <div className='flex items-center space-x-3 w-full'>
                                                                        <button
                                                                            onClick={() => moveToWishlist(item)}
                                                                            disabled={isLoading}
                                                                            className="flex items-center w-full justify-center space-x-2 bg-[#46BCF9] text-white text-[13px] font-semibold px-4 py-2 rounded-full disabled:opacity-50 cursor-pointer">
                                                                            <Heart className="h-4 w-4" />
                                                                            <span className='mt-1'>Move to wishlist</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleRemoveItemClick(item)}
                                                                            disabled={isLoading}
                                                                            className='xl:hidden flex h-8 w-9 border border-[#E9098D] rounded-full items-center justify-center disabled:opacity-50 cursor-pointer'
                                                                        >
                                                                            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M11.25 3.57129H15V5.07129H13.5V14.8213C13.5 15.2355 13.1642 15.5713 12.75 15.5713H2.25C1.83579 15.5713 1.5 15.2355 1.5 14.8213V5.07129H0V3.57129H3.75V1.32129C3.75 0.907079 4.08579 0.571289 4.5 0.571289H10.5C10.9142 0.571289 11.25 0.907079 11.25 1.32129V3.57129ZM12 5.07129H3V14.0713H12V5.07129ZM5.25 2.07129V3.57129H9.75V2.07129H5.25Z" fill="black" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>

                                                                    <div className='w-6'>
                                                                        <button
                                                                            onClick={() => handleRemoveItemClick(item)}
                                                                            disabled={isLoading}
                                                                            className="hidden xl:flex h-9 w-9 border border-[#E799A9] rounded-full items-center justify-center disabled:opacity-50 cursor-pointer"
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
                                                disabled={exceedingStockCount > 0 || outOfStockCount > 0 || navigationLoading}
                                                className={`w-full text-white py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center ${exceedingStockCount > 0 || outOfStockCount > 0
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
                                                    ? 'Fix Stock Issues'
                                                    : navigationLoading ? (
                                                        <>
                                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                            Processing...
                                                        </>
                                                    ) : 'Proceed to checkout'
                                                }
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
                                        <div className="text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[1rem] font-[400]">
                                                    <span className='text-[20px] font-medium'>Subtotal</span> ({totals.totalQuantity} Items)
                                                </span>
                                                <span className="text-[20px] font-medium text-[#2D2C70]">
                                                    ${totals?.subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-[14px] text-[400] text-gray-600">
                                                Subtotal does not include shipping
                                            </div>
                                        </div>

                                        {/* Brand-wise Pricing - Real-time */}

                                        {brandWiseTotals?.map((brand) =>
                                            <div key={brand.brandName} className="flex justify-between text-sm">
                                                <span className="text-[14px] text-[500] text-[#000000]/80">{brand.brandName}</span>
                                                <span className="text-[14px] font-medium">${brand.totalAmount?.toFixed(2)}</span>
                                            </div>
                                        )}

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
                                                    <div className='flex gap-2 items-center cursor-pointer'>
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
                                                disabled={exceedingStockCount > 0 || outOfStockCount > 0 || navigationLoading}
                                                className={`w-full border-1 text-white py-2 rounded-2xl text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center ${exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'bg-gray-400 border-black cursor-not-allowed'
                                                    : 'bg-[#2D2C70] border-[#2D2C70]'
                                                    }`}
                                                title={
                                                    exceedingStockCount > 0 || outOfStockCount > 0
                                                        ? 'Please fix stock issues before checkout'
                                                        : ''
                                                }
                                            >
                                                {exceedingStockCount > 0 || outOfStockCount > 0
                                                    ? 'Fix Stock Issues'
                                                    : navigationLoading ? (
                                                        <>
                                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                            Processing...
                                                        </>
                                                    ) : 'Proceed to checkout'
                                                }
                                            </button>

                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => router.push('/')}
                                                    className={`flex items-center cursor-pointer justify-center rounded-2xl border border-black flex-1 gap-2 text-[1rem] font-semibold border  py-2 xl:px-6 transition-colors duration-300 group bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]`}
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
                                                className="w-full border-1 cursor-pointer border-black rounded-2xl py-2 transition-colors hover:bg-gray-50">
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
                            Are you sure you want to remove "<span className="font-semibold">{getItemName(itemToRemove)}</span>" from your cart?
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
            {/* Product Popup */}
            <ProductPopup
                isOpen={showProductPopup}
                onClose={() => {
                    setShowProductPopup(false);
                    setSelectedProduct(null);
                    setSelectedProductGroup(null);
                }}
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
                clearFilters={() => { }}
                wishListItems={wishListItems}
                setWishlistItems={setWishlistItems}
                customerGroupsDiscounts={[]} // You'll need to pass customerGroupsDiscounts if available
                itemBasedDiscounts={[]} // You'll need to pass itemBasedDiscounts if available
            />
        </>
    );
};

export default ShoppingCart;