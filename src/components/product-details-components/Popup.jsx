"use client"

import axiosInstance from "@/axios/axiosInstance"
import { ArrowRight, Check, Heart, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useUserStore from "@/zustand/user"

export default function ProductPopup({ isOpen, onClose, productId }) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedUnit, setSelectedUnit] = useState("Each")
    const [productImages, setProductImages] = useState([])
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [error, setError] = useState(null)
    const [inCartItem, setInCartItem] = useState(null)
    const [wishListItems, setWishlistItems] = useState([])

    const currentUser = useUserStore((state) => state.user)
    const router = useRouter()

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

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
            setLoading(true)
            const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching customer cart:", error)
        } finally {
            setLoading(false)
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
        }
    }, [isOpen])

    // Check if product is already in cart
    useEffect(() => {
        if (product && cartItems.length > 0) {
            const existing = cartItems.find(ci => ci.product._id === product._id)
            setInCartItem(existing || null)
            if (existing) {
                setQuantity(existing.unitsQuantity)
                const pack = product.typesOfPacks?.find(p => p.quantity === existing.packQuentity)
                setSelectedUnit(pack ? pack.name : "Each")
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
        try {
            const selectedPack = product.typesOfPacks?.find(p => p.name === selectedUnit)
            console.log("selected pack", selectedPack)
            const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1
            const totalQuantity = packQuantity * quantity

            const res = await axiosInstance.post("cart/add-to-cart", {
                customerId: currentUser._id,
                productId: product._id,
                packQuentity: packQuantity,
                unitsQuantity: quantity,
                totalQuantity
            })

            if (res.data.statusCode === 200) {
                await fetchCustomersCart()
            }
        } catch (err) {
            console.error(err)
            setError("Error adding to cart")
        }
    }

    const handleUpdateCart = async () => {
        if (!inCartItem) return
        await handleAddToCart() // same API call, overwrites
    }

    const handleAddToWishlist = async () => {
        if (!currentUser?._id) {
            setError("Please login to add to wishlist")
            return
        }
        try {
            const res = await axiosInstance.post("wishlist/add-to-wishlist", {
                customerId: currentUser._id,
                productId: product._id
            })
            console.log("wishlist res", res.data)
        } catch (err) {
            console.error(err)
            setError("Error adding to wishlist")
        }
    }

    const fetchCustomersWishList = async () => {
        try {
            if (!currentUser || !currentUser._id) return
            console.log("fetchj wishl;iast", currentUser._id)
            const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

            console.log("Customer wishlist hqsbqhsbjqs:", response)
            if (response.data.statusCode === 200) {
                setWishlistItems(response.data.data.wishlistItems || [])
            } else {
                setError(response.data.message)
            }
        }
        catch (error) {
            console.error('Error fetching customer wishlist:', error)
        }
    }

    useEffect(() => {
        if (currentUser._id) {
            fetchCustomersWishList()
        }
    }, [currentUser])

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
                                            <span className="absolute top-2 left-2 bg-green-500 text-white text-[11px] px-1 py-[2px] rounded-sm">
                                                {product?.badge?.name ? product?.badge?.name : ""}
                                            </span>
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
                                <h1 className="text-[26px] font-semibold text-black uppercase">{product.ProductName}</h1>
                                <div className="space-y-1 flex justify-between items-center">
                                    <p className="text-xs sm:text-sm text-gray-600 font-spartan">
                                        SKU {product.sku}
                                    </p>

                                    {/* Stock Status */}
                                    <div className={`flex items-center space-x-2 px-2 ${product.stockLevel > 0 ? 'bg-[#E7FAEF]' : 'bg-red-100'}`}>
                                        <svg className={`w-5 h-5 ${product.stockLevel < 0 ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className={` ${product.stockLevel > 0 ? 'text-[14px]' : 'text-[12px]'} font-semibold font-spartan py-1 rounded ${product.stockLevel > 0 ? 'text-black' : 'text-red-600'}`}>
                                            {product.stockLevel > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[24px] font-semibold text-[#2D2C70]">
                                    ${product.eachPrice ? product.eachPrice.toFixed(2) : "0.00"}
                                </div>

                                {/* Quantity & Units */}
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="block mb-2 text-sm">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                className="px-2 py-1 bg-black text-white rounded-md"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="px-2 py-1 bg-black text-white rounded-md"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 w-full">
                                        <span className="text-sm">Units</span>
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="w-full border rounded-md p-2"
                                        >
                                            <option value="Each">Each</option>
                                            {product.typesOfPacks?.map((pack) => (
                                                <option key={pack._id} value={pack._id}>
                                                    {pack.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-3">
                                    {!inCartItem ? (
                                        <>
                                            <button
                                                onClick={handleAddToCart}
                                                className="flex-1 bg-[#46BCF9] text-white py-2 rounded-lg"
                                            >
                                                Add to Cart
                                            </button>
                                            <div
                                                onClick={handleAddToWishlist}
                                                className="h-10 w-10 border border-[#E799A9] flex items-center justify-center rounded-full cursor-pointer"
                                            >
                                                <Heart className="w-5 h-5 text-red-500" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                                            <button className="flex-1 bg-[#2D2C70] text-white py-2 rounded-lg">
                                                Added <Check className="inline-block ml-2 h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={handleUpdateCart}
                                                className="flex-1 bg-[#E799A9] text-white py-2 rounded-lg"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cart Quantity */}
                                <div className="text-sm text-black">
                                    In Cart Quantity: {inCartItem ? inCartItem.totalQuantity : 0}
                                </div>

                                <button className="text-sm underline flex items-center">
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
