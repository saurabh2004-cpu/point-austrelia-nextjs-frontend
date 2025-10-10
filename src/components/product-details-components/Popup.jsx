"use client"

import axiosInstance from "@/axios/axiosInstance"
import { ArrowRight, Check, Heart, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"

export default function ProductPopup({ isOpen, onClose, productId,
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
    wishListItems,
    setWishlistItems,
    customerGroupsDiscounts,
    itemBasedDiscounts

}) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedUnitId, setSelectedUnitId] = useState("")
    const [productImages, setProductImages] = useState([])
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [error, setError] = useState(null)
    const [stockError, setStockError] = useState(null)
    const [inCartItem, setInCartItem] = useState(null)
    // const [wishListItems, setWishlistItems] = useState([])
    // const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
    // const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])

    const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
    const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
    const currentUser = useUserStore((state) => state.user)
    const router = useRouter()


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

    // Fetch product details
    const fetchProductDetail = async (productId) => {
        try {
            setLoading(true)
            const response = await axiosInstance(`products/get-product/${productId}`)

            console.log("product details", response)
            if (response.data.statusCode === 200) {
                const productData = response.data.data
                setProduct(productData)
                if (productData.images?.length > 0) {
                    setProductImages(productData.images)
                }
                // Set default selected unit to the first available pack type
                if (productData.typesOfPacks && productData.typesOfPacks.length > 0) {
                    setSelectedUnitId(productData.typesOfPacks[0]._id);
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch cart items
    const fetchCustomersCart = async () => {
        try {
            if (!currentUser?._id) return
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching customer cart:", error)
        }
    }

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

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return
            console.log("fetchj wishl;iast", currentUser._id)
            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

            console.log("Customer wishlist hqsbqhsbjqs:", response)
            if (response.data.statusCode === 200) {
                setWishlistItems(response.data.data || [])
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer wishlist:', error)
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProductDetail(productId)
        }
    }, [productId])

    useEffect(() => {
        if (isOpen && currentUser?._id) {
            fetchCustomersCart()
            fetchCustomersWishList()
            if (currentUser.customerId) {
                fetchItemBasedDiscounts()
                fetchCustomersGroupsDiscounts()
            }
        }
    }, [isOpen, currentUser])

    // Check if product is already in cart
    useEffect(() => {
        if (product && cartItems.length > 0) {
            const existing = cartItems.find(ci => ci.product._id === product._id)
            setInCartItem(existing || null)
            if (existing) {
                setQuantity(existing.unitsQuantity)
                const pack = product.typesOfPacks?.find(p => p._id === existing.packType)
                if (pack) {
                    setSelectedUnitId(pack._id)
                }
            }
        } else {
            setInCartItem(null)
        }
    }, [product, cartItems])

    // --- Handlers ---

    const handleAddToCart = async () => {
        if (!currentUser?._id) {
            setError("Please login to add to cart")
            return
        }
        if (!product) return;

        setLoading(true);
        try {
            const selectedPack = product.typesOfPacks?.find(p => p._id === selectedUnitId)
            console.log("selected pack", selectedPack)
            const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1
            const totalQuantity = packQuantity * quantity

            const stockCheck = checkStock();
            if (!stockCheck.isValid) {
                setError(stockCheck.message);
                setLoading(false);
                return;
            }

            const res = await axiosInstance.post("cart/add-to-cart", {
                customerId: currentUser._id,
                productId: product._id,
                packQuentity: packQuantity,
                unitsQuantity: quantity,
                totalQuantity: totalQuantity,
                packType: selectedPack ? selectedPack.name : 'Each'
            })

            if (res.data.statusCode === 200) {
                await fetchCustomersCart()
                setCartItemsCount(res.data.data.cartItems?.length || 0);
                setError(null)
                setStockError(null)
            }
        } catch (err) {
            console.error(err)
            setError("Error adding to cart")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateCart = async () => {
        if (!inCartItem || !product) return
        await handleAddToCart() // same API call, overwrites
    }

    const handleAddToWishlist = async () => {
        if (!currentUser?._id) {
            setError("Please login to add to wishlist");
            return;
        }
        if (!product) return;

        try {
            const alreadyInWishlist = isInWishlist();

            let res;
            if (alreadyInWishlist) {
                // Remove from wishlist
                res = await axiosInstance.delete(
                    `wishlist/remove-from-wishlist/${currentUser._id}/${product._id}`
                );
            } else {
                // Add to wishlist
                res = await axiosInstance.post("wishlist/add-to-wishlist", {
                    customerId: currentUser._id,
                    productId: product._id,
                });
            }

            if (res.data.statusCode === 200) {
                await fetchCustomersWishList();
                setWishlistItemsCount(res.data.data?.length || 0);
            }
        } catch (err) {
            console.error(err);
            setError("Error updating wishlist");
        }
    };


    const isInWishlist = () => {
        return wishListItems.some(
            (item) => item.productId === product?._id || item.product?._id === product?._id
        );
    };

    useEffect(() => {
        isInWishlist();
    }, [wishListItems]);

    const isOutOfStock = product?.stockLevel <= 0;
    const totalRequestedQuantity = calculateTotalQuantity();

    const handleViewProductDetails = () => {
        setFilters({
            categorySlug: categorySlug || null,
            subCategorySlug: subCategorySlug || null,
            subCategoryTwoSlug: subCategoryTwoSlug || null,
            brandSlug: brandSlug || null,
            productID: product._id
        })
        const productSlug = product.ProductName.replace(/\s+/g, '-').toLowerCase();
        router.push(`/product-details/${productSlug}`);
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-gray-300">
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-medium font-spartan">{product?.ProductName}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
                        </div>
                    ) : product ? (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side images */}
                            <div className="flex-1">
                                <div className="flex flex-col-reverse xl:flex-row space-x-8">
                                    <div className="flex xl:flex-col space-x-2 xl:space-x-0 space-y-2 justify-center">
                                        {productImages.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 p-2 bg-white shadow-xl ${selectedImage === index ? "border-2 border-blue-500" : "border border-gray-200"
                                                    }`}
                                            >
                                                <img
                                                    src={image || "/placeholder.svg"}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="h-[50px] w-[50px] object-contain rounded-md"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <div className="rounded-lg p-4 bg-[#FAFAFA]">
                                            {product.badge && (
                                                <div className="absolute top-2 left-4 sm:left-6 z-10">
                                                    <div
                                                        className="px-2 py-1 rounded text-xs font-bold"
                                                        style={{
                                                            backgroundColor: product.badge.backgroundColor,
                                                            color: product.badge.textColor || '#fff',
                                                        }}
                                                    >
                                                        {product.badge.text}
                                                    </div>
                                                </div>
                                            )}
                                            <img
                                                src={productImages[selectedImage] || "/placeholder.svg"}
                                                alt={product.ProductName}
                                                className="w-full h-[260px] object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side details */}
                            <div className="flex-1 space-y-3 font-spartan">
                                <h1 className="text-[18px] font-semibold text-black uppercase">{product.ProductName}</h1>
                                <div className="space-y-1 flex justify-between items-center">
                                    <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                        SKU {product.sku}
                                    </p>

                                    {/* Stock Status */}
                                    <div className={`flex items-center space-x-2 px-2 ${!isOutOfStock ? 'bg-[#E7FAEF]' : 'bg-red-100'}`}>
                                        <svg className={`w-5 h-5 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className={` ${!isOutOfStock ? 'text-[14px]' : 'text-[12px]'} font-semibold font-spartan py-1 rounded ${!isOutOfStock ? 'text-black' : 'text-red-600'}`}>
                                            {!isOutOfStock ? 'IN STOCK' : 'OUT OF STOCK'}
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

                                </div>

                                {/* Stock Error Message */}
                                {stockError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                        {stockError}
                                    </div>
                                )}

                                {/* Quantity & Units */}
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="block mb-2 text-sm">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1 || isOutOfStock}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                disabled={isOutOfStock || totalRequestedQuantity >= product.stockLevel}
                                                className="px-2 py-1 bg-black text-white rounded-md disabled:bg-gray-400"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 w-full">
                                        <span className="text-sm">Units</span>
                                        <select
                                            value={selectedUnitId}
                                            onChange={(e) => handleUnitChange(e.target.value)}
                                            disabled={isOutOfStock}
                                            className="w-full border rounded-md p-2 disabled:bg-gray-100"
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
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-3">

                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading}
                                            className="flex-1 bg-[#46BCF9] border border-black text-white py-2 rounded-lg disabled:bg-gray-400"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                                            ) : (
                                                "Add to Cart"
                                            )}
                                        </button>
                                        <div
                                            onClick={handleAddToWishlist}
                                            className="h-10 w-10 border border-[#E799A9] flex items-center justify-center rounded-full cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill={isInWishlist() ? "#E799A9" : "none"}
                                                stroke="#E799A9"
                                                strokeWidth="2"
                                            >
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                                                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
                                                    4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                                                    19.58 3 22 5.42 22 8.5c0 
                                                    3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>


                                        </div>
                                    </>


                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full">
                                    <button className="flex-1 bg-[#2D2C70] border border-black text-white py-2 rounded-lg">
                                        Added <Check className="inline-block ml-2 h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleUpdateCart}
                                        disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading}
                                        className="flex-1 bg-[#E799A9] border border-black text-white py-2 rounded-lg disabled:bg-gray-400"
                                    >
                                        {loading ? 'Updating...' : 'Update'}
                                    </button>

                                </div>

                                {/* Cart Quantity */}
                                {inCartItem && (
                                    <div className="text-sm text-black">
                                        In Cart Quantity: {inCartItem.unitsQuantity} ({inCartItem.packType})
                                    </div>
                                )}

                                <button onClick={handleViewProductDetails} className="text-sm underline flex items-center">
                                    View product details <ArrowRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Product not found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}