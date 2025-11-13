'use client'
import axiosInstance from '@/axios/axiosInstance';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react'

export default function RecentPurchases({ timeLapse, sortBy = 'date-desc' }) {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
    limit: 5
  })
  const [loading, setLoading] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [products, setProducts] = useState([])

  // Parse the sortBy prop to get sort field and order
  const getSortParams = () => {
    const [sortField, sortOrder] = sortBy.split('-');
    return { sortField, sortOrder };
  };

  // Helper function to handle image errors
  const handleImageError = (e) => {
    console.log('Image failed to load, using fallback');
    e.target.src = '/product-listing-images/product-1.avif';
  };

  const fetchRecentPurchases = async (page = 1) => {
    try {
      setLoading(true)

      const { sortField, sortOrder } = getSortParams();

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        sortBy: sortField,
        sortOrder: sortOrder
      });

      // Add time filters if provided
      if (timeLapse?.from) {
        params.append('from', timeLapse.from);
      }
      if (timeLapse?.to) {
        params.append('to', timeLapse.to);
      }

      const response = await axiosInstance.get(`sales-order/get-recent-purchases-by-customer?${params.toString()}`)

      console.log("recent purchases response", response)
      if (response.data.statusCode === 200) {
        console.log("customers recent purchases data", response.data.data);
        setOrders(response.data.data.orders || [])
        setPagination(response.data.data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false,
          limit: 5
        })
      }
    } catch (error) {
      console.error('Error fetching recent purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchRecentPurchases(pagination.currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      fetchRecentPurchases(pagination.currentPage - 1)
    }
  }

  const fetchProductsOfOrder = async (documentNumber) => {
    setShowProducts(true)
    try {
      setLoading(true)
      const response = await axiosInstance.get(`sales-order/get-products-by-sales-document-number/${documentNumber}`)

      if (response.data.statusCode === 200) {
        console.log("products of order", response.data.data);
        setProducts(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching products of order:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or filters/sort change
  useEffect(() => {
    fetchRecentPurchases(1)
  }, [timeLapse, sortBy])

  // Show filter info if time filters are applied
  const hasTimeFilter = timeLapse?.from || timeLapse?.to;

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-[#46BCF9] text-[18px] font-spartan font-medium">Loading purchases...</p>
      </div>
    )
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#E9098D] text-[24px] font-spartan font-medium mb-4">
          {hasTimeFilter ? 'No purchases found for the selected timeframe' : 'You don\'t have any purchase in your account'}
        </p>
        {hasTimeFilter && (
          <button
            onClick={() => window.location.reload()}
            className="text-[#2D2C70] hover:text-[#46BCF9] text-lg font-medium underline"
          >
            View all purchases
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white font-spartan pl-4">
      {/* Filter, Sort and Pagination Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 pr-4 gap-4">
        <div className="flex flex-col">
          {!showProducts && <div className="text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)} of{' '}
            {pagination.totalOrders} orders
          </div>}
          {showProducts &&
            <button className="text-base text-black font-semibold cursor-pointer" onClick={() => setShowProducts(false)}>
              <ChevronLeft height={20} width={20} className="inline-block" />
              Orders List
            </button>}
          {hasTimeFilter && (
            <div className="text-xs text-gray-500 mt-1">
              Filtered by:
              {timeLapse.from && ` From ${timeLapse.from}`}
              {timeLapse.to && ` To ${timeLapse.to}`}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={!pagination.hasPrev || loading}
            className={`px-3 py-1 text-sm rounded border cursor-pointer ${!pagination.hasPrev || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNext || loading}
            className={`px-3 py-1 text-sm rounded border cursor-pointer ${!pagination.hasNext || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-2">
          <p className="text-[#46BCF9] text-sm">Loading...</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">#</th>
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">{showProducts ? 'Image' : 'Document Number'}</th>
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">{showProducts ? 'SKU' : 'Date'}</th>
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">{showProducts ? 'Product Name' : 'Customer Name'}</th>
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">{showProducts ? 'Amount' : 'Sales Channel'}</th>
                <th className="py-4 pl-4 border-r border-gray-200 text-left font-semibold">{showProducts ? 'Tax' : 'Tracking Number'}</th>
                <th className="py-4 pl-4 text-left border-r border-gray-200 font-semibold">{showProducts ? 'Pack Type' : 'Shipping Address'}</th>
                {!showProducts &&
                  <>
                    <th className="py-4 pl-4 text-left border-r border-gray-200 font-semibold">Billing Address</th>
                    <th className="py-4 pl-4 text-left border-r border-gray-200 font-semibold">Total Amount</th>
                  </>}
                {showProducts &&
                  <th className="py-4 pl-4 text-left border-r border-gray-200 font-semibold">Units</th>}
              </tr>
            </thead>
            <tbody>
              {!showProducts && orders.map((order, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-r">{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                  <td
                    className="py-4 px-4 border-r hover:text-[#E9098D] cursor-pointer"
                    onClick={() => fetchProductsOfOrder(order.documentNumber)}
                  >
                    {order.documentNumber}
                  </td>
                  <td className="py-4 px-4 border-r">
                    <div className='flex justify-start'>
                      <p className="font-medium truncate flex justify-start">{order.date}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r max-w-xs">
                    <div className='flex justify-start'>
                      <p className="font-medium truncate flex justify-start">{order.customerName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r">{order.salesChannel}</td>
                  <td className="py-4 px-4 border-r">{order.trackingNumber}</td>
                  <td className="py-4 px-4 border-r text-start">
                    {order?.shippingAddress instanceof Object ?
                      `${order?.shippingAddress.shippingAddressLineOne || ''}  ${order?.shippingAddress.shippingAddressLineTwo || ''}  ${order?.shippingAddress.shippingAddressLineThree || ''}  ${order?.shippingAddress.shippingCity || ''}  ${order?.shippingAddress.shippingState || ''}  ${order?.shippingAddress.shippingZip || ''}`.trim()
                      : `${order?.shippingAddress}`
                    }
                  </td>
                  <td className="py-4 px-4 border-r text-start">
                    {order?.billingAddress instanceof Object ?
                      `${order?.billingAddress.billingAddressLineOne || ''} ${order?.billingAddress.billingAddressLineTwo || ''} ${order?.billingAddress.billingAddressLineThree || ''} ${order?.billingAddress.billingCity || ''} ${order?.billingAddress.billingState || ''} ${order?.billingAddress.billingZip || ''}`.trim()
                      : `${order?.billingAddress}`
                    }
                  </td>
                  <td className="py-4 px-4 text-[#46BCF9] font-medium">${order.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}

              {showProducts && products.map((product, index) => (
                <tr key={product.sku} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-r">{index + 1}</td>
                  <td className="py-4 px-4 border-r flex justify-center">
                    <img 
                      src={product.imageUrl} 
                      alt={product.productName}
                      className="h-20 w-20 object-cover rounded-md"
                      onError={handleImageError}
                    />
                  </td>
                  <td className="py-4 px-4 border-r">
                    <div className='flex justify-start items-center gap-2'>
                      <p className="font-medium truncate flex justify-start">{product.itemSku}</p>
                      {product.isProductGroup && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Group
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r max-w-lg">
                    <div className='flex justify-start'>
                      <p className="font-medium truncate flex justify-start">{product.productName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r">
                    <div className='flex justify-start'>
                      <p className="font-medium truncate flex justify-start">${product.amount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r max-w-xs">
                    <p className="font-medium truncate flex justify-start">
                      {product.taxPercentages ? `${product.taxPercentages}%` : 'No Tax'}
                    </p>
                  </td>
                  <td className="py-4 px-4 border-r">{product.packType}</td>
                  <td className="py-4 px-4 border-r">{product.unitsQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View for Orders */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse min-w-[600px] text-sm md:text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-3 text-left font-semibold">#</th>
                <th className="py-3 px-3 text-left font-semibold">Product</th>
                <th className="py-3 px-3 text-left font-semibold">Pack Qty</th>
                <th className="py-3 px-3 text-left font-semibold">Unit Qty</th>
                <th className="py-3 px-3 text-left font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 border-r">{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                  <td className="py-3 px-3 border-r flex items-center space-x-3">
                    <img
                      src={order.imageUrl}
                      alt={order.productName}
                      className="w-10 h-10 rounded-md object-cover"
                      onError={handleImageError}
                    />
                    <div className="min-w-0">
                      <span className="font-medium block truncate">{order.productName}</span>
                      <span className="text-xs text-gray-500 block">SKU: {order.itemSku}</span>
                      {order.isProductGroup && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Group</span>
                      )}
                      <span className="text-xs text-gray-500 block">Date: {order.date}</span>
                      <span className="text-xs text-gray-500 block">Order: {order.documentNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r">{order.packQuantity}</td>
                  <td className="py-3 px-3 border-r">{order.unitsQuantity}</td>
                  <td className="py-3 px-3 text-[#46BCF9] font-medium">${order.finalAmount?.toFixed(2) || order.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden px-2 sm:px-4 py-4 space-y-3 sm:space-y-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              {/* Image */}
              <img
                src={order.imageUrl}
                alt={order.productName}
                className="h-20 w-20 rounded-lg flex-shrink-0 object-cover"
                onError={handleImageError}
              />

              {/* Details */}
              <div className="flex-1 min-w-0 w-full">
                {/* Title + Badge */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      {order.productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">SKU: {order.itemSku}</p>
                      {order.isProductGroup && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Group
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Order: {order.documentNumber}</p>
                    <p className="text-xs text-gray-500">Date: {order.date}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                    #{(pagination.currentPage - 1) * pagination.limit + index + 1}
                  </span>
                </div>

                {/* Pack & Unit */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mt-3">
                  <div className='flex flex-col'>
                    <p className="text-gray-500 text-xs sm:text-sm">Pack Quantity</p>
                    <p className="font-medium text-sm sm:text-base">
                      {order.packQuantity}
                    </p>
                  </div>
                  <div className='flex flex-col'>
                    <p className="text-gray-500 text-xs sm:text-sm">Unit Quantity</p>
                    <p className="font-medium text-sm sm:text-base">
                      {order.unitsQuantity}
                    </p>
                  </div>
                </div>

                {/* Total Row */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total:</span>
                  <span className="text-base sm:text-lg font-bold text-[#46BCF9]">
                    ${order.finalAmount?.toFixed(2) || order.amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pagination */}
      <div className="flex justify-between items-center mt-4 pr-4">
        <div className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
          {hasTimeFilter && (
            <span className="text-xs text-gray-500 ml-2">
              (Filtered results)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={!pagination.hasPrev || loading}
            className={`px-4 py-2 text-sm rounded border cursor-pointer ${!pagination.hasPrev || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 '
              }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNext || loading}
            className={`px-4 py-2 text-sm rounded border cursor-pointer ${!pagination.hasNext || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}