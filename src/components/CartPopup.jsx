import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import useCartStore from '@/zustand/cartPopup';
import Link from 'next/link';

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

  const fetchCustomersCart = async () => {
    try {
      if (!currentUser || !currentUser._id) return;
      setLoading(true);
      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

      console.log("get cart by customer id ", response)

      if (response.data.statusCode === 200) {
        const items = response.data.data || [];
        setCartItems(items);
        const quantities = {};
        const packs = {};
        const packsInfo = {};

        items.forEach(item => {
          quantities[item._id] = item.unitsQuantity;

          // Store pack details for each item
          if (item.product.typesOfPacks && Array.isArray(item.product.typesOfPacks)) {
            packsInfo[item._id] = item.product.typesOfPacks;

            // Find matching pack based on current packQuentity
            const matchingPack = item.product.typesOfPacks.find(
              pack => {
                const packQty = typeof pack === 'object' ? parseInt(pack.quantity) : null;
                return packQty === item.packQuentity;
              }
            );

            packs[item._id] = matchingPack?._id || item.product.typesOfPacks[0]?._id;
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

  const removeCartItem = async (customerId, productId) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to remove cart items");
      return;
    }
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await axiosInstance.put(`cart/remove-from-cart/${customerId}/${productId}`);

      console.log("popup remove from cart ", response)
      if (response.data.statusCode === 200) {
        setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
        setCartItemsCount(response.data.data.length);
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
    return totalQuantity > item.product.stockLevel;
  };

  const updateCartItem = async (item) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to update cart items");
      return;
    }

    // Check stock level before updating
    if (exceedsStockLevel(item)) {
      setError(`Requested quantity exceeds available stock (${item.product.stockLevel})`);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [item._id]: true }));
    try {
      const selectedPackId = selectedPacks[item._id];
      const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
      const selectedPack = availablePacks.find(pack => pack._id === selectedPackId);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const unitsQuantity = localQuantities[item._id] || item.unitsQuantity;
      const totalQuantity = packQuantity * unitsQuantity;

      const response = await axiosInstance.post('cart/add-to-cart', {
        customerId: currentUser._id,
        productId: item.product._id,
        quantity: unitsQuantity,
        packQuentity: packQuantity,
        unitsQuantity: unitsQuantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each',
        amount: item.amount
      });

      if (response.data.statusCode === 200) {
        // Update only the specific cart item, preserving product details
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

  const getDisplayQuantity = (item) => {
    return localQuantities[item._id] || item.unitsQuantity;
  };

  const getSelectedPack = (item) => {
    const selectedPackId = selectedPacks[item._id];
    const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
    return availablePacks.find(pack => pack._id === selectedPackId) || availablePacks[0];
  };

  const calculateDisplayTotalQuantity = (item) => {
    const selectedPack = getSelectedPack(item);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
    const unitsQuantity = getDisplayQuantity(item);
    return packQuantity * unitsQuantity;
  };

  const calculateItemTax = (item) => {
    if (!item.product.taxable || !item.product.taxPercentages) return 0;
    const itemPrice = item.amount || 0;
    const totalQuantity = calculateDisplayTotalQuantity(item);
    const subtotal = itemPrice * totalQuantity;
    return (subtotal * item.product.taxPercentages) / 100;
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
    const selectedPackId = selectedPacks[item._id];
    const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
    const selectedPack = availablePacks.find(pack => pack._id === selectedPackId);
    const currentPackQuantity = selectedPack ? parseInt(selectedPack.quantity) : item.packQuentity;
    return currentUnits !== item.unitsQuantity || currentPackQuantity !== item.packQuentity;
  };


  // Calculate items that exceed stock level
  const itemsExceedingStock = cartItems.filter(item => exceedsStockLevel(item));
  const exceedingStockCount = itemsExceedingStock.length;

  // Check if any item has stock issues
  const hasStockIssues = cartItems.some(item => item.product.stockLevel <= 0 || exceedsStockLevel(item));

  useEffect(() => {
    fetchCustomersCart();
  }, [currentUser]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 top-20 bg-transparent bg-opacity-50 flex xl:items-start lg:justify-end p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[30.1875rem] md:max-w-[36rem] lg:max-w-[30.1875rem] max-h-[90vh] overflow-hidden border border-gray-300">
        <div className="flex flex-col items-center justify-between px-4">
          <div className="w-full flex justify-end">
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stock Level Exceeds Warning */}
          {/* {exceedingStockCount > 0 && (
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
          )} */}

          {/* Error Display */}
          {error && (
            <div className="w-full mb-4">
              <div className=" border border-gray-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto hide-scrollbar max-h-110">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70] mx-auto"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Your cart is empty</div>
            ) : (
              cartItems.map((item) => {
                const isLoading = updatingItems[item._id];
                const isOutOfStock = item.product.stockLevel <= 0;
                const displayQuantity = getDisplayQuantity(item);
                const hasModifications = isItemModified(item);
                const availablePacks = packDetails[item._id] || item.product.typesOfPacks || [];
                const exceedsStock = exceedsStockLevel(item);
                const totalQuantity = calculateDisplayTotalQuantity(item);
                const stockLevel = item.product.stockLevel;

                return (
                  <div key={item._id} className="px-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 mb-3">
                      <div className="flex-shrink-0 flex justify-center sm:justify-start mb-3 sm:mb-0">
                        <img
                          src={item.product.images}
                          alt={item.product.ProductName}
                          width={96}
                          height={96}
                          className="object-contain"
                          onError={(e) => {
                            e.target.src = '/product-listing-images/product-1.avif';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex justify-between items-start">
                            <h3 className="text-[14px] font-medium line-clamp-2 hover:text-[#E9098D]">{item.product.ProductName}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(currentUser._id, item.product._id)}
                            disabled={isLoading}
                            className="flex items-center justify-center h-8 w-8 p-1.5 border border-[#E799A9] rounded-full disabled:opacity-50 flex-shrink-0"
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

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[#2D2C70] font-semibold text-[20px] sm:text-[24px]">${item?.amount?.toFixed(2)}</span>
                          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-[#E7FAEF] text-black'}`}>
                            <Check className="w-3 h-3 mr-1" />
                            {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                          </div>
                        </div>

                        {/* Available Stock Display */}
                        {!isOutOfStock && (
                          <p className="text-[12px] text-gray-600 mb-1">
                            Available: {stockLevel} units
                          </p>
                        )}

                        {/* Exceeds Stock Warning for Item */}
                        {exceedsStock && !isOutOfStock && (
                          <div className="bg-orange-50 border border-orange-200 rounded-md p-2 mb-2">
                            <div className="flex items-start">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                              <p className="text-xs text-orange-700">
                                Requested quantity ({totalQuantity}) exceeds available stock ({stockLevel}). Please reduce quantity.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div>
                            <span className="block text-xs font-medium mb-1">Quantity</span>
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item._id, -1)}
                                className="p-1 bg-black rounded-md px-2"
                                disabled={displayQuantity <= 1 || isOutOfStock}
                              >
                                <Minus className="w-3 h-3 text-white" />
                              </button>
                              <span className="px-3 py-1 min-w-[2rem] text-center text-xs font-medium">{displayQuantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item._id, 1)}
                                className="p-1 bg-black rounded-md px-2"
                                disabled={isOutOfStock || exceedsStock}
                                title={exceedsStock ? 'Stock level exceeded' : ''}
                              >
                                <Plus className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                            <div className="relative">
                              <select
                                value={selectedPacks[item._id] || ''}
                                onChange={(e) => handlePackChange(item._id, e.target.value)}
                                disabled={isOutOfStock}
                                className="w-full border border-gray-200 appearance-none rounded-md pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring focus:ring-[#2d2c70] disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                {availablePacks && availablePacks.length > 0 ? (
                                  availablePacks.map((pack) => (
                                    <option key={pack._id} value={pack._id}>{pack.name}</option>
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
                        </div>

                        {hasModifications && (
                          <button
                            onClick={() => updateCartItem(item)}
                            disabled={isLoading || exceedsStock}
                            className={`w-full text-white text-xs font-medium py-2 rounded-full mt-2 disabled:opacity-50 ${exceedsStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E799A9] hover:bg-[#d68999]'}`}
                            title={exceedsStock ? 'Cannot update: stock level exceeded' : ''}
                          >
                            {isLoading ? 'Updating...' : 'Update'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t bg-gray-50">
          <div className="flex items-center text-[15px] font-medium justify-between mb-4 px-4 pt-4">
            <span>({cartItems.length} Items)</span>
            <span>Subtotal: ${subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-gray-200 h-[0.7px] w-full"></div>
          <div className="flex flex-col sm:flex-row gap-2 text-[15px] font-medium p-4">
            <Link href="/cart"
              onClick={() => { setIsOpen(false) }}
              className="flex-1 bg-[#2D2C70] border text-center border-black hover:bg-[#46BCF9] text-white py-2 rounded-full transition-colors"
            >
              View Cart
            </Link>
            <Link href="/checkout"
              onClick={() => setIsOpen(false)}
              disabled={hasStockIssues || cartItems.length === 0}
              className={`flex-1 border border-black text-white py-2  text-center rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${hasStockIssues ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#46BCF9] hover:bg-[#2D2C70]'}`}
              title={hasStockIssues ? 'Please fix stock issues before checkout' : ''}
            >
              {hasStockIssues ? 'Fix Stock Issues' : 'Checkout'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPopup;