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
    "/product-listing-images/product-1.png",
    "/product-listing-images/product-1.png",
    "/product-listing-images/product-1.png",
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
      <div className="bg-white justify-items-center pt-4">
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
          <p className="text-sm sm:text-base lg:text-[1rem] text-black font-[400] font-spartan max-w-8xl px-2 sm:px-0">
            Bars Bugs is a range of insect repellent products including sprays, coils, and diffusers that are designed
            to keep bugs away both indoors and outdoors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20   ">
          {/* Product Images */}
          <div className="space-y-4 flex flex-col lg:flex-row lg:space-x-16 lg:space-y-0">
            {/* Thumbnail Images */}
            <div className="order-2 lg:order-1 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className="flex-shrink-0 rounded-lg p-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-all duration-300 ease-out hover:scale-[1.02]"
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
            <div className="relative order-1 lg:order-2 w-full">
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
                  <div className=" rounded-lg bg-white">

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
          <div className="space-y-3 font-spartan">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>

                <h1 className="text-lg sm:text-xl lg:text-[1.3rem] font-medium  text-black my-2">
                  BARS BUGS WINDSCREEN CLEAN 375ML
                </h1>
                <div className="flex items-center space-x-2  mt-4 justify-between">
                  <p className="text-[13px] font-medium ">SKU BB375</p>
                  <span className="text-black bg-[#E7FAEF] text-sm p-1 rounded-lg text-[11px] font-semibold">
                    ✓ IN STOCK
                  </span>
                </div>
                <p className="text-[1rem] font-[400] mt-2 border inline-block pt-1 px-3 relative xl:right-2 rounded-full">
                  Category
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="text-[24px] font-semibold text-[#E9098D]  mb-2">$4.48</div>

            {/* Quantity and Unit Selection */}
            <div className="space-y-4 ">
              <div className="flex  sm:items-center align-middle sm:space-x-8 space-y-4 sm:space-y-0">
                <div className="flex items-start space-x-2 space-y-2 flex-col">
                  <span className="text-sm font-[400] ">Quantity</span>
                  <div className="flex items-center  rounded-lg">
                    <button
                      className="p-1 bg-black rounded-md  px-2 py-1 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                      2
                    </span>
                    <button
                      className="p-1 bg-black rounded-md py-1  px-2 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white " />
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block bg-gray-300 w-[1px] h-15 ml-8"></div>
                <div className="flex flex-col  justify-between mx-8 relative bottom-4 xl:bottom-0 ">
                  <span className="text-[1rem] font-[400] relative py-1 block mb-2">Units</span>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="border border-gray-300 rounded-lg relative  px-8 py-2 bg-white w-full sm:w-auto"
                  >
                    <option value="Each">Each</option>
                    <option value="Box">Box</option>
                    <option value="Case">Case</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row  justify-center w-full lg:w-3/4 flex-col sm:flex-row space-y-3 sm:space-y-0 space-x-4">
              <button className="flex-1 text-[1rem] text-[#2D2C70] text-[15px] font-semibold border border-[#2D2C70] rounded-lg text-black py-1 px-6 rounded transition-colors">
                <Image
                  src="/product-details/cart-logo-2.png"
                  alt="Shopping Bag"
                  width={20}
                  height={20}
                  className="inline-block mr-2"
                />

                Add to Cart
              </button>
              <div className="flex justify-center sm:block">
                <div className="h-10 w-10 bg-[#D9D9D940] items-center justify-center flex rounded-full ">
                  <div className="h-8 w-8 bg-[#D9D9D940] flex items-center justify-center rounded-full  transition-colors cursor-pointer">
                    <Image
                      src="/product-details/heart-1.png"
                      alt="Heart"
                      width={18}
                      height={18}
                      className=""
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center font-semibold md:w-[92.5%] lg:w-[18.5625rem] xl:w-[395px] flex-col  sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="flex-1 text-[12px]  font-semibold border border-[#46BCF9] rounded-lg text-[#68B73B] py-2   rounded transition-colors">
                Added <span><Check className="inline-block ml-2 h-4 w-4 " /></span>
              </button>

              <div className="hidden sm:block bg-black w-[1px] h-9"></div>

              <button className="flex-1 text-[12px] font-semibold border border-[#2D2C70] rounded-lg text-[#E9098D] py-2  rounded transition-colors">
                Update
              </button>
            </div>
            <div className="text-[1rem] font-medium text-black">In Cart Quantity: 2 (Each)</div>

            {/* Product Details */}
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="font-spartan">
              <h3 className=" text-[1rem] font-medium text-black">Details of the product:</h3>
              <ul className="space-y-2 text-black text-[15px] font-[400]">
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
            <div className="space-y-2 text-[1rem] font-[400] text-black">
              <h4 className=" text-black">Barcode:</h4>
              <p className="">9344479972387</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 min-w-8xl h-[1px] flex my-16"></div>

        {/* People Also Bought Section */}
        <div className="space-y-8 lg:space-y-12 pb-18">
          <h2 className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-center text-[#2E2F7F]">
            Customers who bought this item also bought
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-white  rounded-lg p-4  transition-shadow">
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
                  <h3 className=" text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="  mb-2">{product.sku}</p>
                  <p className="text-[#46BCF9] text-[18px] sm:text-[20px] font-semibold text-lg mb-3">
                    {product.price}
                  </p>
                </div>

                <button className="w-full justify-center flex bg-white border border-[#E9098D] rounded-lg font-spartan text-[14px] font-medium py-2 px-4 rounded  transition-colors">
                  <Image
                    src="/product-details/cart-logo-2.png"
                    alt="Shopping Bag"
                    width={20}
                    height={20}
                    className="inline-block mr-2"
                  />
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  )
}