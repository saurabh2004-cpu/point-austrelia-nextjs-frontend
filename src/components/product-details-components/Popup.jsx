"use client"

import { ArrowRight, Heart, X } from "lucide-react"
import { useState } from "react"


export default function ProductPopup({ isOpen, onClose }) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(2)
    const [selectedUnit, setSelectedUnit] = useState("Each")

    const productImages = [
        "/product-listing-images/product-1.png",
        "/product-listing-images/product-1.png",
        "/product-listing-images/product-1.png",
    ]

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium font-spartan">Product Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex flex-col space-y-4">
                                {/* Main Image */}
                                <div className="relative">
                                    <div className="rounded-lg p-4 bg-white border">
                                        <span className="absolute top-2 left-2 bg-[#E35457] text-white text-[11px] font-[600] font-spartan tracking-widest px-2 py-1 rounded-lg z-10">
                                            ON SALE
                                        </span>
                                        <img
                                            src={productImages[selectedImage] || "/placeholder.svg"}
                                            alt="Product"
                                            className="w-full h-[140px] md:h-[200px] object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Thumbnail Images */}
                                <div className="flex space-x-2 justify-center">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 rounded-lg p-2 bg-white border transition-all duration-300 ${selectedImage === index ? "border-[#E9098D]" : "border-gray-200"
                                                }`}
                                        >
                                            <img
                                                src={image || "/placeholder.svg"}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-[50px] w-[50px] md:w-[60px] md:h-[45px] object-contain rounded-md"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 font-spartan">
                            {/* Stock Status */}
                            <div className="flex items-center space-x-2">
                                <span className="text-black bg-[#E7FAEF] text-sm px-2 py-1 rounded-lg text-[11px] font-semibold">
                                    ✓ IN STOCK
                                </span>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-lg font-medium text-black">BARS BUGS WINDSCREEN CLEAN 375ML</h1>

                            {/* SKU and Barcode */}
                            <div className="space-y-1 text-[13px] font-medium text-gray-600">
                                <p>SKU BB375</p>
                                <p>Barcode: 9344479972387</p>
                            </div>

                            {/* Category */}
                            <div className="inline-block border rounded-full px-3 py-1 text-[14px] font-[400]">Category</div>

                            {/* Price */}
                            <div className="text-[24px] font-semibold text-[#E9098D]">$4.48</div>

                            {/* Quantity and Units */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="text-[14px] font-[400] block mb-2">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                className="px-3  rounded-lg text-xl text-white bg-black hover:bg-gray-800 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 text-[14px] font-medium text-black min-w-[3rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="px-3  rounded-lg text-xl text-white bg-black hover:bg-gray-800 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-300 w-[1px] h-12"></div>

                                    <div>
                                        <span className="text-[14px] font-[400] block mb-2">Units</span>
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-[14px]"
                                        >
                                            <option value="Each">Each</option>
                                            <option value="Box">Box</option>
                                            <option value="Case">Case</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                                <button className="flex-1 text-[14px] font-semibold border border-[#E9098D] rounded-lg text-black py-3 px-6 hover:bg-[#E9098D] hover:text-white transition-colors">
                                    🛒 Add to cart
                                </button>
                                <div className="h-12 w-12 bg-[#D9D9D940] flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                                    <Heart className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex space-x-3 max-w-[235px]">
                                <button className="flex-1 text-[12px] font-semibold border border-[#46BCF9] rounded-lg text-[#68B73B] py-2 transition-colors">
                                    Added
                                </button>
                                <div className="bg-black w-[1px] h-9"></div>
                                <button className="flex-1 text-[12px] font-semibold border border-[#2D2C70] rounded-lg text-[#E9098D] py-2 transition-colors">
                                    Update
                                </button>
                            </div>

                            {/* Cart Quantity */}
                            <div className="text-[14px] font-medium text-black">In Cart Quantity: 2 (Each)</div>

                            {/* View Product Details Link */}
                            <button className=" flex justify-center items-center  text-[14px] text-black underline hover:no-underline transition-all">
                                View product details <span className="text--[5px] -rotate-45 h-1 w-1"><ArrowRight /></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
