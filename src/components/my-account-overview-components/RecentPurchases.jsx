import { useState } from 'react'

export default function RecentPurchases() {
  const [products] = useState([
    {
      id: 1,
      image: '/product-listing-images/product-1.png',
      name: 'Premium Green Bottle',
      packQuentity: 4.48,
      quantity: 2,
      unit: '1',
      finalAmount: 8.96
    },
    {
      id: 2,
      image: '/product-listing-images/product-1.png',
      name: 'Premium Green Bottle',
      packQuentity: 4.48,
      quantity: 2,
      unit: 'Each',
      finalAmount: 8.96
    },
    {
      id: 3,
      image: '/product-listing-images/product-1.png',
      name: 'Organic Blue Container',
      packQuentity: 12.99,
      quantity: 1,
      unit: 'Each',
      finalAmount: 12.99
    }
  ])

  if (products.length === 0) {
    return (
      <p className="text-[#E9098D] text-[24px] font-spartan font-medium">
        You don't have any purchase in your account
      </p>
    )
  }

  return (
    <div className="w-full bg-white font-spartan pl-4">

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4  pl-4  border-r border-gray-200 text-left font-semibold">Date</th>
                <th className="py-4 pl-16 border-r border-gray-200 text-left font-semibold">Product Image</th>
                <th className="py-4 pl-16 border-r border-gray-200 text-left font-semibold">Product name</th>
                <th className="py-4 pl-16 border-r border-gray-200 text-left font-semibold">Pack Of Quantity</th>
                <th className="py-4 pl-16 border-r border-gray-200 text-left font-semibold">Unit quantity</th>
                <th className="py-4 pl-16 text-left font-semibold">Final amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-r">{index + 1}</td>
                  <td className="py-4 px-4 border-r">
                    <div className="flex justify-center">
                      <img src={product.image} alt={product.name} className="h-20 object-cover rounded-md" />
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r max-w-xs truncate">{product.name}</td>
                  <td className="py-4 px-4 border-r">{product.packQuentity}</td>
                  <td className="py-4 px-4 border-r">{product.quantity}</td>
                  <td className="py-4 px-4 text-[#46BCF9] font-medium">${product.finalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse min-w-[600px] text-sm md:text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-3 text-left font-semibold">Date</th>
                <th className="py-3 px-3 text-left font-semibold">Product</th>
                <th className="py-3 px-3 text-left font-semibold">Price</th>
                <th className="py-3 px-3 text-left font-semibold">Qty</th>
                <th className="py-3 px-3 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 border-r">{index + 1}</td>
                  <td className="py-3 px-3 border-r flex items-center space-x-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                    <span className="truncate">{product.name}</span>
                  </td>
                  <td className="py-3 px-3 border-r">{product.packQuentity}</td>
                  <td className="py-3 px-3 border-r">{product.quantity} {product.unit}</td>
                  <td className="py-3 px-3 text-[#46BCF9] font-medium">${product.finalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden px-2 sm:px-4 py-4 space-y-3 sm:space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              {/* Image */}
              <img
                src={product.image}
                alt={product.name}
                className=" h-25 w-11 rounded-lg  flex-shrink-0"
              />

              {/* Details */}
              <div className="flex-1 min-w-0 w-full">
                {/* Title + Badge */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate pr-2">
                    {product.name}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                    #{index + 1}
                  </span>
                </div>

                {/* Pack & Unit */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className='flex space-x-2'>
                    <p className="text-gray-500 text-xs sm:text-sm">Pack Quantity</p>
                    <p className="font-medium text-sm sm:text-base">
                      {product.packQuentity}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm w-full">
                  <div className='flex space-x-2'>
                    <p className="text-gray-500 text-xs sm:text-sm">Unit Quantity</p>
                    <p className="font-medium text-sm sm:text-base">
                      {product.quantity}
                    </p>
                  </div>
                </div>
                
                {/* Total Row */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-1  items-center">
                  <span className="text-sm font-medium text-gray-700">Total :   </span>
                  <span className="text-base sm:text-lg font-bold text-[#46BCF9]">
                    ${product.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}
