"use client"

import { ArrowRight, Check, Heart, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
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
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4 ">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-gray-300">
                <div className="flex justify-between items-center p-4 ">
                    <h2 className="text-lg font-medium font-spartan"></h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex flex-col-reverse xl:flex-row space-x-8">

                                {/* Thumbnail Images */}
                                <div className="flex xl:flex-col space-x-2 xl:space-x-0 space-y-2 justify-center">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0  p-2 bg-white  transition-all duration-300 shadow-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] ${selectedImage === index ? "" : "border-gray-200"
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

                                {/* Main Image */}
                                <div className="relative">
                                    <div className="rounded-lg p-4 bg-[#FAFAFA] ">
                                        <span className="absolute top-2 left-2 bg-[#E35457] text-white text-[11px] font-[400] font-spartan tracking-widest px-1 py-[2px] rounded-sm z-10">
                                            IN SALE
                                        </span>
                                        <img
                                            src={productImages[selectedImage] || "/placeholder.svg"}
                                            alt="Product"
                                            className="w-full h-[140px] md:h-[260px] object-contain"
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="flex-1 space-y-2 font-spartan">

                            {/* Product Name */}
                            <h1 className="text-[20px] font-semibold text-black">BARS BUGS WINDSCREEN CLEAN 375ML</h1>

                            {/* SKU and Barcode */}
                            <div className="space-y-1 text-[13px] font-medium text-gray-600">
                                <div className="flex items-center justify-between space-x-2">
                                    <p>SKU BB375</p>
                                    <div className="flex items-center space-x-2 bg-[#E7FAEF]  px-2">
                                        <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] font-semibold font-spartan text-black   py-1 rounded">
                                            IN STOCK
                                        </span>
                                    </div>
                                </div>

                                <p>Barcode :</p>
                                <p> 9344479972387</p>
                            </div>

                            {/* Category */}
                            {/* <div className="inline-block border rounded-full px-3 py-1 text-[14px] font-[400]">Category</div> */}

                            {/* Price */}
                            <div className="text-[24px] font-semibold text-[#46BCF9]">$4.48</div>

                            {/* Quantity and Units */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className="text-[14px] font-[400] block mb-2">Quantity</span>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decrementQuantity}
                                                className="px-2  rounded-md py-1 text-xl text-white bg-black hover:bg-gray-800 transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-white" />
                                            </button>
                                            <span className="px-4 py-2 text-[14px] font-medium text-black min-w-[3rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="px-2  py-1 rounded-md text-xl text-white bg-black hover:bg-gray-800 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-300 w-[1px] h-12"></div>

                                    <div className="flex flex-col space-y-2 w-full">
                                        <span className="text-sm font-[400]">Units</span>
                                        <div className="relative w-full">
                                            <select
                                                className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                                    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
                                                    appearance-none"
                                            >
                                                <option value="each">Each</option>
                                                <option value="pack">Pack</option>
                                                <option value="box">Box</option>
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
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                                <button className="flex-1 text-[1rem] font-semibold border border-[#2D2C70] rounded-lg text-black py-1 px-6 rounded transition-colors">
                                    <Image
                                        src="/icons/cart-image.png"
                                        alt="Shopping Bag"
                                        width={20}
                                        height={20}
                                        className="inline-block mr-2"
                                    />

                                    Add to Cart
                                </button>
                                <div className="h-10 w-10 bg-[#D9D9D940] flex items-center justify-center rounded-full  transition-colors cursor-pointer">
                                    <Image
                                        src="/product-details/heart-1.png"
                                        alt="Heart"
                                        width={15}
                                        height={15}
                                        className="w-[20px] h-[18.49px]"
                                    />
                                </div>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex justify-center font-semibold  flex-col  sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                <button className="flex-1 text-[12px]  font-semibold border border-[#46BCF9] rounded-lg text-[#68B73B] py-2   rounded transition-colors">
                                    Added <span><Check className="inline-block ml-2 h-4 w-4 " /></span>
                                </button>

                                <div className="hidden sm:block bg-black w-[1px] h-9"></div>

                                <button className="flex-1 text-[12px] font-semibold border border-[#2D2C70] rounded-lg text-[#E9098D] py-2  rounded transition-colors">
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
