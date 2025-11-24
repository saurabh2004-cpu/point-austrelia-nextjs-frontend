'use client';
import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import useCartStore from '@/zustand/cartPopup';
import Link from 'next/link';
import { useProductFiltersStore } from '@/zustand/productsFiltrs';
import { i } from 'framer-motion/m';

const ShoppingCartPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const currentUser = useUserStore((state) => state.user);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localQuantities, setLocalQuantities] = useState({});
  const [selectedPacks, setSelectedPacks] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [packDetails, setPackDetails] = useState({});
  const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
  const [navigatingToCart, setNavigatingToCart] = useState(false);
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);

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


  const fetchCustomersCart = async () => {
    try {
      if (!currentUser || !currentUser._id) return;
      setLoading(true);
      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

      console.log("get cart by customer id ", response)

      if (response.data.statusCode === 200) {
        const items = response.data.data.items || [];
        setCartItems(items);
        const quantities = {};
        const packs = {};
        const packsInfo = {};

        items.forEach(item => {
          quantities[item._id] = item.unitsQuantity;

          // Store pack details for each item (only for products, not product groups)
          if (item.product && item.product.typesOfPacks && Array.isArray(item.product.typesOfPacks)) {
            packsInfo[item._id] = item.product.typesOfPacks;

            // Find matching pack based on current packQuentity
            const matchingPack = item.product.typesOfPacks.find(
              pack => {
                const packQty = typeof pack === 'object' ? parseInt(pack.quantity) : null;
                return packQty === item.packQuentity;
              }
            );

            packs[item._id] = matchingPack?._id || item.product.typesOfPacks[0]?._id;
          } else if (item.productGroup) {
            // For product groups, set default pack
            packs[item._id] = 'default';
          }
        });

        setLocalQuantities(quantities);
        setSelectedPacks(packs);
        setPackDetails(packsInfo);
      } else {
        setError('Your Cart Is Empty');
      }
    } catch (error) {
      console.error('Error fetching customer cart:', error)
    } finally {
      setLoading(false);
    }
  }

  const removeCartItem = async (customerId, productId, productGroupId) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to remove cart items");
      return;
    }

    const itemId = productId || productGroupId;
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await axiosInstance.put(`cart/remove-from-cart/${customerId}`, {
        productId: productId || null,
        productGroupId: productGroupId || null
      });

      console.log("popup remove from cart ", response)
      if (response.data.statusCode === 200) {
        // Update local state without refetching
        setCartItems(prevItems => prevItems.filter(item => {
          if (productId) {
            return item.product?._id !== productId;
          } else {
            return item.productGroup?._id !== productGroupId;
          }
        }));

        // Update cart count from response
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);

        // Remove from local quantities and selected packs
        setLocalQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[itemId];
          return newQuantities;
        });

        setSelectedPacks(prev => {
          const newPacks = { ...prev };
          delete newPacks[itemId];
          return newPacks;
        });

        setPackDetails(prev => {
          const newPackDetails = { ...prev };
          delete newPackDetails[itemId];
          return newPackDetails;
        });

        // Dispatch cart updated event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        setError(response.data.message || "Failed to remove cart item");
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      setError('An error occurred while removing cart item');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setLocalQuantities(prev => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handlePackChange = (itemId, packId) => {
    setSelectedPacks(prev => ({ ...prev, [itemId]: packId }));
  };

  // Check if requested quantity exceeds stock level
  const exceedsStockLevel = (item) => {
    const totalQuantity = calculateDisplayTotalQuantity(item);
    const stockLevel = getStockLevel(item);
    return totalQuantity > stockLevel;
  };

  const getStockLevel = (item) => {
    if (item.product) {
      return item.product.stockLevel || 0;
    } else if (item.productGroup) {
      // For product groups, return the minimum stock level among products
      if (item.productGroup.products && Array.isArray(item.productGroup.products)) {
        const stockLevels = item.productGroup.products.map(productItem => {
          // Now productItem.product contains the full product object with stockLevel
          const product = productItem.product;
          return product?.stockLevel || 0;
        });
        return Math.min(...stockLevels);
      }
      return 0;
    }
    return 0;
  };

  const isOutOfStock = (item) => {
    if (item.product) {
      // For individual products
      return (item.product.stockLevel || 0) <= 0;
    } else if (item.productGroup) {
      // For product groups, check if ALL products in the group are out of stock
      if (!item.productGroup.products || !Array.isArray(item.productGroup.products)) {
        return true;
      }

      // Check if all products in the group are out of stock
      return item.productGroup.products.every(productItem => {
        // Now productItem.product contains the full product object with stockLevel
        const product = productItem.product;
        return (product?.stockLevel || 0) <= 0;
      });
    }
    return true;
  };

  const updateCartItem = async (item) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to update cart items");
      return;
    }

    // Check stock level before updating
    if (exceedsStockLevel(item)) {
      const stockLevel = getStockLevel(item);
      setError(`Requested quantity exceeds available stock `);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [item._id]: true }));
    try {
      const selectedPackId = selectedPacks[item._id];
      let packQuantity = 1;
      let packType = 'Each';
      let itemId = null;
      let isProductGroup = false;

      if (item.product) {
        // For individual products
        const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
        const selectedPack = availablePacks.find(pack => pack._id === selectedPackId);
        packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
        packType = selectedPack ? selectedPack.name : 'Each';
        itemId = item.product._id;
        isProductGroup = false;
      } else if (item.productGroup) {
        // For product groups
        itemId = item.productGroup._id;
        isProductGroup = true;
        // Product groups use default pack values
      }

      const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
      const totalQuantity = packQuantity * unitsQuantity;

      const cartData = {
        customerId: currentUser._id,
        productId: isProductGroup ? null : itemId,
        productGroupId: isProductGroup ? itemId : null,
        quantity: unitsQuantity,
        packQuentity: packQuantity,
        unitsQuantity: unitsQuantity,
        totalQuantity: totalQuantity,
        packType: packType,
        amount: item.amount,
        discountType: item.discountType || "",
        discountPercentages: item.discountPercentages || 0
      };

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        // Update only the specific cart item, preserving product details
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

  // Add this function with your other functions
  const handleDirectQuantityChange = (itemId, newQuantity) => {
    // If input is empty (backspace cleared it), set to empty string
    if (newQuantity === '') {
      setLocalQuantities(prev => ({
        ...prev,
        [itemId]: ''
      }));
      return;
    }

    // If it's a valid number, set the numeric value
    const validQuantity = Math.max(1, parseInt(newQuantity) || 1);
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: validQuantity
    }));
  };

  const getDisplayQuantity = (item) => {
    return localQuantities[item._id] || item.unitsQuantity;
  };

  const getSelectedPack = (item) => {
    if (item.product) {
      const selectedPackId = selectedPacks[item._id];
      const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
      return availablePacks.find(pack => pack._id === selectedPackId) || availablePacks[0];
    }
    return null; // Product groups don't have packs
  };

  const calculateDisplayTotalQuantity = (item) => {
    if (item.product) {
      const selectedPack = getSelectedPack(item);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const unitsQuantity = getDisplayQuantity(item);
      return packQuantity * unitsQuantity;
    } else if (item.productGroup) {
      // Product groups use simple quantity (no packs)
      const unitsQuantity = getDisplayQuantity(item);
      return unitsQuantity;
    }
    return 0;
  };

  const calculateItemTax = (item) => {
    // For products
    if (item.product && item.product.taxable && item.product.taxPercentages) {
      const itemPrice = item.amount || 0;
      const totalQuantity = calculateDisplayTotalQuantity(item);
      const subtotal = itemPrice * totalQuantity;
      return (subtotal * item.product.taxPercentages) / 100;
    }
    // For product groups - use product group tax settings if available
    if (item.productGroup && item.productGroup.taxable && item.productGroup.taxPercentages) {
      const itemPrice = item.amount || 0;
      const totalQuantity = calculateDisplayTotalQuantity(item);
      const subtotal = itemPrice * totalQuantity;
      return (subtotal * item.productGroup.taxPercentages) / 100;
    }
    return 0;
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
  };

  const getItemSku = (item) => {
    if (item.product) {
      return item.product.sku;
    } else if (item.productGroup) {
      return item.productGroup.sku;
    }
    return 'N/A';
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.amount || 0;
    const totalQuantity = calculateDisplayTotalQuantity(item);
    return sum + (itemPrice * totalQuantity);
  }, 0);

  const totalTax = cartItems.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const total = subtotal + totalTax;
  const totalItems = cartItems.reduce((sum, item) => sum + calculateDisplayTotalQuantity(item), 0);

  const isItemModified = (item) => {
    const currentUnits = localQuantities[item._id];

    if (item.product) {
      const selectedPackId = selectedPacks[item._id];
      const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
      const selectedPack = availablePacks.find(pack => pack._id === selectedPackId);
      const currentPackQuantity = selectedPack ? parseInt(selectedPack.quantity) : item.packQuentity;
      return currentUnits !== item.unitsQuantity || currentPackQuantity !== item.packQuentity;
    } else if (item.productGroup) {
      // For product groups, only check quantity changes
      return currentUnits !== item.unitsQuantity;
    }

    return false;
  };

  // Calculate items that exceed stock level
  const itemsExceedingStock = cartItems.filter(item => exceedsStockLevel(item));
  const exceedingStockCount = itemsExceedingStock.length;

  // Check if any item has stock issues
  const hasStockIssues = cartItems.some(item => isOutOfStock(item) || exceedsStockLevel(item));

  useEffect(() => {
    fetchCustomersCart();
  }, [currentUser]);

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

    console.log("itemName in handleProductClick", itemName)

    const itemSlug = itemName.replace(/\s+/g, '-').toLowerCase();
    router.push(`/${itemSlug}`);
    setIsOpen(false);
  }

  const getOriginalPriceForDisplay = (item, isProductGroup = false) => {
    if (!item) return 0;

    // Determine if it's a product group
    const isProductGroupItem = isProductGroup || !!item.productGroup;

    // For product groups, use productGroup data
    if (isProductGroupItem) {
      // Check if there's a compare price discount
      if (item.discountType === "Compare Price" && item.discountPercentages) {
        const comparePrice = parseFloat(item.discountPercentages);
        const currentPrice = item.amount || 0;
        if (comparePrice > currentPrice) {
          return comparePrice;
        }
      }

      // Check for item discount
      if (item.discountType === "Item Discount" && item.discountPercentages) {
        return item.product?.eachPrice || item.amount || 0;
      }

      // Check for pricing group discount
      if (item.discountType === "Pricing Group Discount" && item.discountPercentages) {

        console.log("isprodyuct group", isProductGroup)
        console.log("product gropup in docc", item.productGroup)

        const discountPercentages = parseFloat(item.discountPercentages);
        if (discountPercentages < 0) {
          // Negative discount means price decrease, show original price
          return item.product?.eachPrice || item.productGroup.eachPrice || 0;

        } else if (discountPercentages > 0) {
          // Positive discount means price increase, no original price to show
          return null;
        }
      }

    }

    // For individual products
    if (item.product) {
      // Check if there's a compare price discount
      // if (item.discountType === "Compare Price" && item.discountPercentages) {
      //   const comparePrice = parseFloat(item.discountPercentages);
      //   const currentPrice = item.amount || 0;
      //   if (comparePrice > currentPrice) {
      //     return comparePrice;
      //   }
      // }
      // Check for item discount
      if (item.discountType === "Item Discount" && item.discountPercentages) {
        return item.product.eachPrice || item.amount || 0;
      }

      // Check for pricing group discount
      if (item.discountType === "Pricing Group Discount" && item.discountPercentages) {
        const discountPercentages = parseFloat(item.discountPercentages);
        if (discountPercentages < 0) {
          // Negative discount means price decrease, show original price
          return item.product.eachPrice || item.amount || 0;

        } else if (discountPercentages > 0) {
          // Positive discount means price increase, no original price to show
          return null;
        }
      }
    }

    // Default fallback
    // return item.amount || 0;
  };

  if (!isOpen) return null;



  return (
    <div className="absolute inset-0 top-20 flex xl:items-start lg:justify-end p-4 z-50 pointer-events-none font-spartan">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[30.1875rem] md:max-w-[36rem] lg:max-w-[30.1875rem] max-h-[90vh] overflow-hidden border border-gray-300 pointer-events-auto flex flex-col">
        <div className="flex flex-col items-center justify-between px-4 pt-4">
          <div className="w-full flex justify-between border-b pb-3">
            <h1 className='text-lg font-semibold uppercase'>Shopping Cart</h1>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stock Level Exceeds Warning */}
          {exceedingStockCount > 0 && (
            <div className="w-full mb-4">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-lg">
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
            <div className="w-full mb-4">
              <div className="border border-red-400 bg-red-50 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Cart Items Section */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] px-4">
          {/* Custom scrollbar styling */}
          <style jsx>{`
            .scroll-container {
              scrollbar-width: thin;
              scrollbar-color: #cbd5e0 #f7fafc;
            }
            .scroll-container::-webkit-scrollbar {
              width: 6px;
            }
            .scroll-container::-webkit-scrollbar-track {
              background: #f7fafc;
              border-radius: 3px;
            }
            .scroll-container::-webkit-scrollbar-thumb {
              background: #cbd5e0;
              border-radius: 3px;
            }
            .scroll-container::-webkit-scrollbar-thumb:hover {
              background: #a0aec0;
            }
          `}</style>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70] mx-auto"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Your cart is empty</div>
          ) : (
            <div className="scroll-container space-y-4 py-2">
              {cartItems.map((item) => {
                const isLoading = updatingItems[item._id];
                const outOfStock = isOutOfStock(item);
                const displayQuantity = getDisplayQuantity(item);
                const hasModifications = isItemModified(item);
                const availablePacks = item.product ? (packDetails[item._id] || item.product.typesOfPacks || []) : [];
                const exceedsStock = exceedsStockLevel(item);
                const totalQuantity = calculateDisplayTotalQuantity(item);
                const stockLevel = getStockLevel(item);
                const isProductGroup = !!item.productGroup;

                return (
                  <div key={item._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                      <div className="flex-shrink-0 flex justify-center sm:justify-start mb-3 sm:mb-0">
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          width={80}
                          height={80}
                          className="object-contain h-[120px] w-[120px] rounded-lg"
                          onError={(e) => {
                            e.target.src = '/product-listing-images/product-1.avif';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                onClick={() => handleProductClick(getItemName(item), isProductGroup ? item.productGroup?._id : item.product?._id, isProductGroup)}
                                className="text-[14px] cursor-pointer font-medium line-clamp-2 hover:text-[#E9098D]"
                              >
                                {getItemName(item)}
                              </h3>
                              {isProductGroup && (
                                <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                                  BUNDLE
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(currentUser._id, item.product?._id, item.productGroup?._id)}
                            disabled={isLoading}
                            className="flex items-center cursor-pointer ml-4 justify-center h-7 w-7 p-1 border border-[#E799A9] rounded-full disabled:opacity-50 flex-shrink-0"
                          >
                            <Image
                              src="/icons/dustbin-1.png"
                              alt="Remove item"
                              width={14}
                              height={14}
                              className="object-contain"
                            />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-2">

                          <div className='flex items-center space-x-2'>
                            <span className="text-[#2D2C70] font-semibold text-[18px]">${item?.amount?.toFixed(2)}</span>
                            {getOriginalPriceForDisplay(item, isProductGroup) &&
                              <span className="text-sm text-gray-500 line-through">
                                ${parseFloat(getOriginalPriceForDisplay(item, isProductGroup)).toFixed(2)}
                              </span>}
                          </div>

                          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded ${outOfStock ? 'bg-red-100 text-red-600' : 'bg-[#E7FAEF] text-black'}`}>
                            <Check className="w-3 h-3 mr-1" />
                            {outOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                          </div>
                        </div>

                        {/* Available Stock Display
                        {!outOfStock && (
                          <p className="text-[12px] text-gray-600 mb-1">
                            Available: {stockLevel} units
                          </p>
                        )} */}

                        {/* Exceeds Stock Warning for Item */}
                        {exceedsStock && !outOfStock && (
                          <div className="bg-orange-50 border border-orange-200 rounded-md p-2 mb-2">
                            <div className="flex items-start">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                              <p className="text-xs text-orange-700">
                                Requested quantity ({totalQuantity}) exceeds available stock. Please reduce quantity.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div>
                            <span className="block text-xs font-medium mb-1 cursor-pointer">Quantity</span>
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item._id, -1)}
                                className="w-[32px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                disabled={displayQuantity <= 1 || outOfStock}
                              >
                                <Image
                                  src="/icons/minus-icon.png"
                                  alt="Minus"
                                  width={12}
                                  height={12}
                                />
                              </button>

                              {/* Input field for direct quantity entry */}
                              <input
                                type="number"
                                min="1"
                                value={localQuantities[item._id] ?? item.unitsQuantity} // Use nullish coalescing
                                onChange={(e) => handleDirectQuantityChange(item._id, e.target.value)}
                                onBlur={(e) => {
                                  // When input loses focus, if empty, set back to the original quantity
                                  if (e.target.value === '' || e.target.value === '0') {
                                    setLocalQuantities(prev => ({
                                      ...prev,
                                      [item._id]: item.unitsQuantity
                                    }));
                                  }
                                }}
                                className="text-[1rem] font-spartan font-medium w-[2rem] text-center border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                disabled={outOfStock}
                              />

                              <button
                                onClick={() => handleQuantityChange(item._id, 1)}
                                className="w-[30px] h-[25px] bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                disabled={outOfStock || exceedsStock}
                                title={exceedsStock ? 'Stock level exceeded' : ''}
                              >
                                <Image
                                  src="/icons/plus-icon.png"
                                  alt="Plus"
                                  width={12}
                                  height={12}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Units Dropdown (only for products, not product groups) */}
                          {item.product && availablePacks.length > 0 && (
                            <div className="w-full sm:w-auto">
                              <label className="block text-xs font-medium text-gray-700 mb-1 cursor-pointer">Units</label>
                              <div className="relative">
                                <select
                                  value={selectedPacks[item._id] || ''}
                                  onChange={(e) => handlePackChange(item._id, e.target.value)}
                                  disabled={outOfStock}
                                  className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm focus:outline-none focus:ring focus:ring-[#2d2c70] focus:border-[#2d2c70] appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  {availablePacks.map((pack) => (
                                    <option key={pack._id} value={pack._id} className="cursor-pointer">
                                      {pack.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center cursor-pointer">
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
                        </div>

                        {hasModifications && (
                          <button
                            onClick={() => updateCartItem(item)}
                            disabled={isLoading || exceedsStock}
                            className={`w-full text-white text-xs cursor-pointer font-medium py-2 rounded-full mt-2 disabled:opacity-50 ${exceedsStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E799A9] hover:bg-[#d68999]'}`}
                            title={exceedsStock ? 'Cannot update: stock level exceeded' : ''}
                          >
                            {isLoading ? 'Updating...' : 'Update'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50">
          <div className="flex items-center text-[15px] font-medium justify-between mb-4 px-4 pt-4">
            <span>({cartItems.length} Items)</span>
            <span>Subtotal: ${subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-gray-200 h-[0.7px] w-full"></div>

          <div className="flex flex-col sm:flex-row gap-2 text-[15px] font-medium p-4">
            <button
              onClick={() => {
                setNavigatingToCart(true);
                router.push('/cart');
                // Note: We can't reliably detect when page loads, so we'll use a timeout as fallback
                setTimeout(() => setNavigatingToCart(false), 1000);
                setIsOpen(false);
              }}
              disabled={navigatingToCart || cartItems.length === 0}
              className="flex-1 bg-[#2D2C70] border border-black hover:bg-[#46BCF9] text-white py-2 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {navigatingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                'View Cart'
              )}
            </button>

            <button
              onClick={() => {
                setNavigatingToCheckout(true);
                router.push('/checkout');
                // Note: We can't reliably detect when page loads, so we'll use a timeout as fallback
                setTimeout(() => setNavigatingToCheckout(false), 1000);
                setIsOpen(false);
              }}
              disabled={hasStockIssues || cartItems.length === 0 || navigatingToCheckout}
              className={`flex-1 border border-black text-white py-2 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${hasStockIssues || cartItems.length === 0 ? 'bg-gray-400' : 'bg-[#46BCF9] hover:bg-[#2D2C70]'
                }`}
              title={hasStockIssues ? 'Please fix stock issues before checkout' : ''}
            >
              {navigatingToCheckout ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : hasStockIssues ? (
                'Fix Stock Issues'
              ) : (
                'Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPopup;