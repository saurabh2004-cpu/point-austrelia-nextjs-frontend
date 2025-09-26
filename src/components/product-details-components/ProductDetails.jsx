"use client"

import { Heart, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(2)
  const [selectedUnit, setSelectedUnit] = useState("Each")
  const [zoomStyle, setZoomStyle] = useState({})
  const [isZooming, setIsZooming] = useState(false)

  const productImages = [
    "/product-listing-images/product-1.avif",
    "/product-listing-images/product-1.avif",
    "/product-listing-images/product-1.avif",
  ]

  const relatedProducts = [
    { id: 1, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 2, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 3, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
    { id: 4, name: "FUEL CAN PLASTIC RED 5L", sku: "SKU: 08025", price: "$4.48" },
  ]

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
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

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white justify-items-center pt-4 overflow-x-hidden">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
            <span>Home</span>
            <span className="mx-1 sm:mx-2">/</span>
            <span className="hidden sm:inline">Matador Wholesale</span>
            <span className="mx-1 sm:mx-2 hidden sm:inline">/</span>
            <span className="text-xs sm:text-sm lg:text-[1.2rem] text-black font-[400] font-spartan">Bars Bugs</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white justify-items-center">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 justify-items-center">
          <h1 className="text-lg sm:text-xl lg:text-[1.2rem] text-black font-[400] font-spartan pb-3 sm:pb-5">
            Bars Bugs
          </h1>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20   ">
          {/* Product Images */}
          <div className="space-y-4  flex flex-col lg:flex-row lg:space-x-16 lg:space-y-0">
            {/* Thumbnail Images */}
            <div className="order-2 lg:order-1 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className="flex-shrink-0 rounded-lg p-2   transition-all duration-300 ease-out hover:scale-[1.02] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-[80px] h-[60px] sm:w-[120px] sm:h-[90px] lg:w-[9.875rem] lg:h-[7.0625rem] object-contain rounded-md"
                  />
                </button>

              ))}
            </div>

            {/* Main Image */}
            <div className="relative order-1 lg:order-2  w-full">
              <div className="rounded-lg  bg-white relative overflow-hidden">
                {/* <span className="relative  top-2 lg:right-20 bg-[#E35457] text-white text-[11px] font-[600] font-spartan tracking-widest px-2 py-3 rounded-lg z-10">
                  ON SALE
                </span> */}

                {/* Navigation Buttons */}
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



                <div className="relative order-1 lg:order-2 ">
                  <div className=" rounded-lg bg-[#FAFAFA]">

                    <img
                      src={productImages[selectedImage] || "/placeholder.svg"}
                      alt="Product"
                      className="w-full h-[200px] sm:h-[300px] lg:h-[24.1875rem] object-contain "
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
                BARS BUGS WINDSCREEN CLEAN 375ML
              </h1>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[13px] font-medium">SKU BB375</p>
                <span className="text-[14px] bg-[#E7FAEF] p-2 font-semibold font-spartan text-black   py-1 rounded">
                  ✓ IN STOCK
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-[24px] font-semibold text-[#E9098D]">$4.48</div>

            {/* Quantity & Units */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-[48px] space-y-4 sm:space-y-0">
              {/* Quantity */}
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-[400]">Quantity</span>
                <div className="flex items-center">
                  <button className="p-1 px-2 bg-black rounded-md">
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                    2
                  </span>
                  <button className="p-1 px-2 bg-black rounded-md">
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
                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                                                    focus:outline-none  
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

            {/* Action Buttons - Row 1 */}
            <div className="flex  items-center space-x-7 ">
              <div className="flex space-x-5 w-full">
                <button className="flex items-center  xl:min-w-[360px] justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#2D2C70] rounded-lg text-[#2D2C70] py-2 px-6 transition-colors duration-300 group hover:text-[#E9098D] hover:border-[#E9098D]">
                  <svg
                    className="w-5 h-5 transition-colors duration-300 group-hover:fill-[#E9098D]"
                    viewBox="0 0 21 21"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                  </svg>
                  Add to Cart
                </button>
                <button className="h-10   w-10 flex items-center justify-center rounded-full bg-[#D9D9D940]">
                  <Image
                    src="/product-details/heart-1.png"
                    alt="Heart"
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons - Row 2 */}
            <div className="flex items-center space-x-3">
              <button className="flex-1 text-xs sm:text-sm font-semibold border border-[#46BCF9] rounded-lg text-[#68B73B] py-2 flex justify-center items-center">
                Added <Check className="ml-2 h-4 w-4" />
              </button>
              <button className="flex-1 text-xs sm:text-sm font-semibold border border-[#2D2C70] rounded-lg text-[#E9098D] py-2 flex justify-center">
                Update
              </button>
            </div>

            {/* Cart Info */}
            <div className="text-sm sm:text-base font-medium text-black hover:text-[#E9098D]">
              In Cart Quantity: 2 (Each)
            </div>
          </div>


          <div className="lg:col-span-2 space-y-[15px]">
            <div className="font-spartan space-y-[15px] ">
              <h3 className=" text-[1rem] font-medium text-black">Details of the product :</h3>
              <ul className="space-y-[15px] text-black text-[15px] font-[400]">
                <li className="flex items-start">
                  <span className="text-[#2E2F7F] mr-2 flex-shrink-0">●</span>
                  <span>Bars Bugs is a non-stain environmentally friendly windscreen cleaner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2E2F7F] mr-2 flex-shrink-0">●</span>
                  <span>Provides instant clean vision – absolutely no streaking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2E2F7F] mr-2 flex-shrink-0">●</span>
                  <span>Protects the glass and wiper blades</span>
                </li>
              </ul>
            </div>
            {/* Barcode */}
            <div className=" text-[1rem] font-[400] text-black">
              <h4 className=" text-black">Barcode</h4>
              <p className="">9344479972387</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 min-w-[90vw] h-[1px] flex my-8  relative lg:right-34"></div>

        {/* People Also Bought Section */}
        <div className="space-y-8 lg:space-y-12 pb-18">
          <h2 className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-center text-[#2E2F7F]">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-white  rounded-lg p-4  ">
                <div className="relative flex justify-center py-6  mb-4 border border-gray-200 rounded-xl">
                  <button className="absolute top-2 right-2  text-gray-400 hover:text-gray-600">
                    <div className="h-5 w-5  flex items-center justify-center rounded-full  transition-colors cursor-pointer">
                      <Image
                        src="/product-details/heart-2.png"
                        alt="Heart"
                        width={15}
                        height={15}
                        className=""
                      />
                    </div>
                  </button>
                  <img
                    src="/product-listing-images/product-detail-1.png"
                    alt={product.name}
                    className="  h-[10.0625rem] object-contain"
                  />
                </div>

                <div className="font-spartan text-[14px] font-medium">
                  <h3 className=" text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[#E9098D]">{product.name}</h3>
                  <p className="  mb-2">{product.sku}</p>
                  <p className="text-[#46BCF9] text-[18px] sm:text-[20px] font-semibold text-lg mb-3">
                    {product.price}
                  </p>
                </div>

                <button className="flex items-center  justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#2D2C70] rounded-lg text-[#2D2C70] py-2 px-6 transition-colors duration-300 group hover:text-[#E9098D] hover:border-[#E9098D]">
                  <svg
                    className="w-5 h-5 transition-colors duration-300 group-hover:fill-[#E9098D]"
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