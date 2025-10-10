"use client"

import axiosInstance from "@/axios/axiosInstance"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import { div } from "framer-motion/client"
import { sub } from "framer-motion/m"
import { Heart, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [zoomStyle, setZoomStyle] = useState({})
  const [isZooming, setIsZooming] = useState(false)
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
    clearFilters,
    productID
  } = useProductFiltersStore();


  const [error, setError] = useState(null);
  const [stockError, setStockError] = useState(null);
  const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
  const currentCartItems = useCartStore((state) => state.currentItems);
  const [cartItems, setCartItems] = useState([])
  const currentUser = useUserStore((state) => state.user);
  const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
  const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])
  const [loading, setLoading] = useState(false)
  const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
  const [wishListItems, setWishlistItems] = useState([])


  const relatedProducts = [
    { id: 1, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 2, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 3, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 4, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
  ]
  const [product, setProduct] = useState(null)

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!product || !product.eachPrice) return 0;

    const originalPrice = product.eachPrice;

    // Check for item-based discount first (higher priority)
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === product.sku && discount.customerId === currentUser?.customerId
    );

    if (itemDiscount) {
      const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
      return originalPrice - discountAmount;
    }

    // Check for pricing group discount
    if (product.pricingGroup && product.pricingGroup._id) {
      const groupDiscount = customerGroupsDiscounts.find(
        discount =>
          discount.pricingGroup &&
          discount.pricingGroup._id === product.pricingGroup._id &&
          discount.customerId === currentUser?.customerId
      );

      if (groupDiscount) {
        const discountAmount = (originalPrice * groupDiscount.percentage) / 100;
        return originalPrice - discountAmount;
      }
    }

    return originalPrice;
  };

  // Get discount percentage for display
  const getDiscountPercentage = () => {
    if (!currentUser || !currentUser.customerId) {
      return null;
    }

    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === product?.sku && discount.customerId === currentUser.customerId
    );

    if (itemDiscount) {
      return itemDiscount.percentage;
    }

    if (product?.pricingGroup && product.pricingGroup._id) {
      const groupDiscount = customerGroupsDiscounts.find(
        discount =>
          discount.pricingGroup &&
          discount.pricingGroup._id === product.pricingGroup._id &&
          discount.customerId === currentUser.customerId
      );

      if (groupDiscount) {
        return groupDiscount.percentage;
      }
    }

    return null;
  };

  // Check if product has any discount
  const hasDiscount = () => {
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

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)',
    })
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
    })
    setIsZooming(false)
  }

  const getPageTitle = () => {
    if (subCategoryTwoSlug) return subCategoryTwoSlug?.split('-').join(' ').toUpperCase();
    if (subCategorySlug) return subCategorySlug?.split('-').join(' ').toUpperCase();
    if (categorySlug) return categorySlug?.split('-').join(' ').toUpperCase();
    if (brandSlug) return brandSlug?.split('-').join(' ').toUpperCase();
    return "ALL PRODUCTS";
  };

  // Calculate total quantity based on pack quantity and units
  const calculateTotalQuantity = () => {
    if (!product) return 0;

    const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
    return packQuantity * quantity;
  };

  // Check stock level
  const checkStock = (qty = quantity, unitId = selectedUnitId) => {
    if (!product) return { isValid: true };

    const selectedPack = product.typesOfPacks?.find(pack => pack._id === unitId);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
    const totalRequestedQuantity = packQuantity * qty;

    const cartItem = getCartItem();
    const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

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

  const getCartItem = () => {
    return cartItems.find(item => item.product?._id === product?._id);
  };

  const isProductInCart = () => {
    return cartItems.some(item => item.product?._id === product?._id);
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to add items to cart");
      return;
    }

    if (!product) return;

    setLoading(true);

    try {
      const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const totalQuantity = packQuantity * quantity;

      const stockCheck = checkStock();
      if (!stockCheck.isValid) {
        setError(stockCheck.message);
        setLoading(false);
        return;
      }

      const cartData = {
        customerId: currentUser._id,
        productId: product._id,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each'
      };

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Error adding product to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update cart function
  const handleUpdateCart = async () => {
    if (!currentUser || !currentUser._id || !product) return;

    setLoading(true);

    try {
      const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const totalQuantity = packQuantity * quantity;

      const stockCheck = checkStock();
      if (!stockCheck.isValid) {
        setError(stockCheck.message);
        setLoading(false);
        return;
      }

      const cartData = {
        customerId: currentUser._id,
        productId: product._id,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each'
      };

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Error updating cart');
    } finally {
      setLoading(false);
    }
  };

  // Fetch product by ID
  const fetchProductById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance(`products/get-product/${productID}`);

      console.log("response product details", response);

      if (response.data.statusCode === 200) {
        const productData = response.data.data;
        setProduct(productData);

        // Set default selected unit to the first available pack type
        if (productData.typesOfPacks && productData.typesOfPacks.length > 0) {
          setSelectedUnitId(productData.typesOfPacks[0]._id);
        }
      } else {
        setError(response.data.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("An error occurred while fetching product");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer's cart
  const fetchCustomersCart = async () => {
    try {
      if (!currentUser || !currentUser._id) return;

      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

      console.log("Cart items:", response.data.data);
      if (response.data.statusCode === 200) {
        setCartItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer cart:', error);
    }
  };

  // Fetch groups discount
  const fetchCustomersGroupsDiscounts = async () => {
    try {
      if (!currentUser || !currentUser.customerId) return;

      const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser.customerId}`);

      console.log("Customer groups discounts:", response.data.data);

      if (response.data.statusCode === 200) {
        setCustomerGroupsDiscounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer groups discounts:', error);
    }
  };

  // Fetch item based discounts 
  const fetchItemBasedDiscounts = async () => {
    try {
      if (!currentUser || !currentUser.customerId) return;

      const response = await axiosInstance.get(`item-based-discount/get-items-based-discount-by-customer-id/${currentUser.customerId}`);

      console.log("customers item based discounts:", response.data.data);

      if (response.data.statusCode === 200) {
        setItemBasedDiscounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching item based discounts:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.customerId) {
      fetchItemBasedDiscounts();
      fetchCustomersGroupsDiscounts();
    }
  }, [currentUser?.customerId]);

  useEffect(() => {
    if (currentUser) {
      fetchCustomersCart();
    }
  }, [currentUser]);

  useEffect(() => {
    if (productID) {
      fetchProductById();
    }
  }, [productID]);

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Product not found</p>
      </div>
    );
  }

  const isInCart = isProductInCart();
  const cartItem = getCartItem();
  const isOutOfStock = product.stockLevel <= 0;
  const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
  const totalRequestedQuantity = calculateTotalQuantity();



  const handleAddToWishList = async (productId) => {
    try {
      if (!currentUser || !currentUser._id) {
        setError("Please login to manage wishlist")
        return
      }


      const response = await axiosInstance.post('wishlist/add-to-wishlist', {
        customerId: currentUser._id,
        productId: productId
      })

      console.log("Wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        // Refresh the wishlist to get updated data
        await fetchCustomersWishList()
        setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error managing product in wishlist:', error)
      setError('Error managing wishlist')
    }
  }

  const fetchCustomersWishList = async () => {
    try {
      if (!currentUser || !currentUser._id) return

      const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

      console.log("customers wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        // Set the wishlist items from response.data.data
        setWishlistItems(response.data.data || [])
        setWishlistItemsCount(response.data.data?.length || 0)
      }
    }
    catch (error) {
      console.error('Error fetching customer wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishListItems.some(item => item.productId === productId);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white justify-items-center pt-4 overflow-x-hidden">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
            <span className="uppercase">Home</span>
            <span className="">/</span>
            <span className="hidden sm:inline">{getPageTitle()}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white justify-items-center">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 justify-items-center">
          <h1 className="text-lg sm:text-xl lg:text-[1.2rem] text-black font-[400] font-spartan pb-3 sm:pb-5">
            {categorySlug.split("/")[1].toUpperCase() ||
              subCategorySlug.split("/")[2].toUpperCase() ||
              subCategoryTwoSlug.split("/")[3].toUpperCase()}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Product Images */}
          <div className="space-y-4 flex flex-col lg:flex-row lg:space-x-16 lg:space-y-0">
            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <div className="order-2 lg:order-1 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="flex-shrink-0 rounded-lg p-2 transition-all duration-300 ease-out hover:scale-[1.02] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-[80px] h-[60px] sm:w-[120px] sm:h-[90px] lg:w-[9.875rem] lg:h-[7.0625rem] object-contain rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative order-1 lg:order-2 w-full">
              <div className="rounded-lg bg-white relative overflow-hidden">
                {/* Badge */}
                {product.badge && (
                  <span
                    className="absolute top-2 left-2 z-10 text-white text-[11px] font-[600] font-spartan tracking-widest px-2 py-1 rounded-lg"
                    style={{ backgroundColor: product.badge.backgroundColor }}
                  >
                    {product.badge.text}
                  </span>
                )}

                {/* Navigation Buttons - Only show if multiple images */}
                {product.images && product.images.length > 0 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-20"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-20"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}

                <div className="relative">
                  <div className="rounded-lg bg-[#FAFAFA]">
                    <img
                      src={product.images?.[selectedImage] || "/placeholder.svg"}
                      alt={product.ProductName}
                      className="w-full h-[200px] sm:h-[300px] lg:h-[24.1875rem] object-contain"
                      style={zoomStyle}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-[17px] font-spartan xl:max-w-[360px] mt-5">
            {/* Header */}
            <div>
              <h1 className="text-lg sm:text-xl lg:text-[1.3rem] font-medium text-black ">
                {product.ProductName}
              </h1>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[13px] font-medium">SKU: {product.sku}</p>
                <span className={`text-[14px] ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-[#E7FAEF] text-black'} p-2 font-semibold font-spartan py-1 rounded`}>
                  {isOutOfStock ? '✗ OUT OF STOCK' : '✓ IN STOCK'}
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
              {discountPercentage && (
                <span className="text-sm text-green-600 font-semibold">
                  ({discountPercentage}% OFF)
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-[48px] space-y-4 sm:space-y-0">
              {/* Quantity */}
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-[400]">Quantity</span>
                <div className="flex items-center">
                  <button
                    className="p-1 px-2 bg-black rounded-md disabled:bg-gray-400"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                    {quantity}
                  </span>
                  <button
                    className="p-1 px-2 bg-black rounded-md disabled:bg-gray-400"
                    onClick={incrementQuantity}
                    disabled={isOutOfStock || totalRequestedQuantity >= product.stockLevel}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block bg-gray-300 w-[1px] h-14"></div>

              {/* Units */}
              <div className="flex flex-col space-y-2 min-w-[167px]">
                <span className="text-sm font-[400]">Units</span>
                <div className="relative w-full">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    disabled={isOutOfStock}
                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                              focus:outline-none appearance-none disabled:bg-gray-100"
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
            </div>

            {/* Action Buttons - Row 1 */}
            <div className="flex items-center space-x-7">
              <div className="flex space-x-5 w-full">
                <button
                  className="flex items-center border border-black text-white bg-[#46BCF9] xl:min-w-[360px] justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#46BCF9] rounded-lg text-white py-2 px-6 transition-colors duration-300 group disabled:bg-gray-400 disabled:border-gray-400"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 transition-colors duration-300"
                        viewBox="0 0 21 21"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button onClick={() => handleAddToWishList(product._id)} className=" flex items-center justify-center rounded-full ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill={isInWishlist ? "red" : "#46BCF9"}>
                    <path d="M10 6.56837L11.6352 4.24626C12.2721 3.34193 13.3179 2.75781 14.5 2.75781C16.433 2.75781 18 4.32481 18 6.25781C18 9.13661 16.0407 11.8793 13.643 14.0936C12.4877 15.1605 11.3237 16.0181 10.4451 16.6099C10.2861 16.717 10.1371 16.8149 9.9999 16.9034C9.8627 16.8149 9.7137 16.717 9.5547 16.6099C8.6761 16.0182 7.51216 15.1606 6.35685 14.0936C3.95926 11.8794 2 9.13661 2 6.25781C2 4.32481 3.567 2.75781 5.5 2.75781C6.68209 2.75781 7.72794 3.34193 8.3648 4.24626L10 6.56837ZM8.5557 1.68407C7.68172 1.09901 6.63071 0.757812 5.5 0.757812C2.46243 0.757812 0 3.22024 0 6.25781C0 13.7578 9.9999 19.243 9.9999 19.243C9.9999 19.243 20 13.7578 20 6.25781C20 3.22024 17.5376 0.757812 14.5 0.757812C13.3693 0.757812 12.3183 1.09901 11.4443 1.68407C10.8805 2.06151 10.3903 2.54044 10 3.09473C9.6097 2.54044 9.1195 2.06151 8.5557 1.68407Z" fill="#E799A9" />
                  </svg>
                </button>
              </div>
            </div>
            {isInCart &&
              <div className="flex space-x-2 w-full">
                <button className="flex-1 text-xs sm:text-sm border border-black font-semibold text-white  bg-[#2D2C70]  rounded-lg text-white py-2 flex justify-center items-center">
                  Added <Check className="ml-2 h-4 w-4" />
                </button>
                <button
                  className="flex-1 border border-black text-xs sm:text-sm bg-[#E799A9] font-semibold  rounded-lg text-white py-2 flex justify-center disabled:bg-gray-400"
                  onClick={handleUpdateCart}
                  disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            }

            {/* Cart Info */}
            {isInCart && cartItem && (
              <div className="text-sm sm:text-base font-medium text-black hover:text-[#E9098D]">
                In Cart Quantity: {cartItem.unitsQuantity} ({cartItem.packType})
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-[15px]">
            <div className="font-spartan space-y-[15px]">
              <h3 className="text-[1rem] font-medium text-black">Details of the product:</h3>
              <div
                className="text-black text-[15px] font-[400]"
                dangerouslySetInnerHTML={{
                  __html: product.storeDescription || "<p>No description available.</p>",
                }}
              />
            </div>

            {/* Barcode */}
            <div className="text-[1rem] font-[400] text-black">
              <h4 className="text-black">Barcode</h4>
              <p className="">{product.eachBarcodes || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 min-w-[90vw] h-[1px] flex my-8 relative lg:right-34"></div>

        {/* People Also Bought Section */}
        <div className="space-y-8 lg:space-y-12 pb-18">
          <h2 className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-center text-[#2E2F7F]">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-4">
                <div className="relative flex justify-center py-6 mb-4 border border-gray-200 rounded-xl">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <button onClick={() => handleAddToCart(product)} className=" flex items-center justify-center rounded-full ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill={isInWishlist(product.id) ? 'red' : 'none'}>
                        <path d="M10 6.56837L11.6352 4.24626C12.2721 3.34193 13.3179 2.75781 14.5 2.75781C16.433 2.75781 18 4.32481 18 6.25781C18 9.13661 16.0407 11.8793 13.643 14.0936C12.4877 15.1605 11.3237 16.0181 10.4451 16.6099C10.2861 16.717 10.1371 16.8149 9.9999 16.9034C9.8627 16.8149 9.7137 16.717 9.5547 16.6099C8.6761 16.0182 7.51216 15.1606 6.35685 14.0936C3.95926 11.8794 2 9.13661 2 6.25781C2 4.32481 3.567 2.75781 5.5 2.75781C6.68209 2.75781 7.72794 3.34193 8.3648 4.24626L10 6.56837ZM8.5557 1.68407C7.68172 1.09901 6.63071 0.757812 5.5 0.757812C2.46243 0.757812 0 3.22024 0 6.25781C0 13.7578 9.9999 19.243 9.9999 19.243C9.9999 19.243 20 13.7578 20 6.25781C20 3.22024 17.5376 0.757812 14.5 0.757812C13.3693 0.757812 12.3183 1.09901 11.4443 1.68407C10.8805 2.06151 10.3903 2.54044 10 3.09473C9.6097 2.54044 9.1195 2.06151 8.5557 1.68407Z" fill="#E799A9" />
                      </svg>
                    </button>
                  </button>
                  <img
                    src="/product-listing-images/product-detail-1.png"
                    alt={product.name}
                    className="h-[10.0625rem] object-contain"
                  />
                </div>

                <div className="font-spartan text-[14px] font-medium">
                  <h3 className="text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[#E9098D]">{product.name}</h3>
                  <p className="mb-2">{product.sku}</p>
                  <p className="text-[#2D2C70] text-[18px] sm:text-[20px] font-semibold text-lg mb-3">
                    {product.price}
                  </p>
                </div>

                <button className="flex w-full border border-black items-center bg-[#46BCF9] justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#46BCF9] rounded-lg text-white py-2 px-6 transition-colors duration-300 group">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}