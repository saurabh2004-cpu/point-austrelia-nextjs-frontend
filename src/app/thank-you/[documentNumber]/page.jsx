'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';

const OrderConfirmationUI = () => {
    const [orderData, setOrderData] = useState([]); // Changed to array to hold multiple items
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const documentNumber = params.documentNumber;
    const currentUser = useUserStore((state) => state.user);

    // Try to get passed state first (instant display)
    useEffect(() => {
        // Check if order data was passed via navigation state
        const navigationState = window.history.state?.state?.orderData;

        if (navigationState) {
            // Use passed data immediately - INSTANT display!
            console.log("Using passed order data - instant load!", navigationState);
            setOrderData(navigationState);
            setLoading(false);
        } else if (documentNumber) {
            // Fallback: fetch if no data was passed
            console.log("No passed data, fetching from API");
            fetchSalesOrderByDocumentNumber();
        }
    }, [documentNumber]);

    const fetchSalesOrderByDocumentNumber = async () => {
        try {
            const response = await axiosInstance.get(
                `sales-order/get-sales-orders-by-document-number/${documentNumber}`
            );

            console.log("get sales order by document response ", response)

            if (response.data.statusCode === 200) {
                setOrderData(response.data.data); // This is now an array of items
            }
        } catch (error) {
            console.error('Error fetching sales order:', error);
        } finally {
            setLoading(false);
        }
    }

    const handlePurchaseHistoryClick = () => {
        router.push('/my-account-review');
    }

    // Calculate totals from all items
    const calculateOrderTotals = () => {
        if (!orderData || orderData.length === 0) return { subtotal: 0, total: 0 };

        const subtotal = orderData.reduce((sum, item) => sum + (item.amount || 0), 0);
        // For now, just return subtotal as total to match original behavior
        return { subtotal, total: subtotal };
    };

    const totals = calculateOrderTotals();

    // OPTIMIZED: Show success immediately with skeleton
    if (loading || !orderData || orderData.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 pb-32 px-4 sm:px-6 lg:px-8 font-spartan">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center mb-6">
                            <div className="flex justify-center items-center space-x-5 mb-4">
                                <Image
                                    src="/account-details/Check-img-1.png"
                                    alt="Success"
                                    width={55}
                                    height={55}
                                    className="object-contain h-8 w-8 xl:w-[55px] xl:h-[55px]"
                                />
                                <h1 className="md:text-[3rem] text-[22px] sm:text-[2rem] font-semibold">
                                    Thanks for shopping!
                                </h1>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-base font-semibold">
                                <span>Order Reference No: </span>
                                <span>{documentNumber}</span>
                            </p>
                        </div>

                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>

                        <p className="text-center text-gray-600 mt-6">
                            Loading order details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Get first item for common order details (since they're the same for all items)
    const firstItem = orderData[0];

    // Calculate items summary for all items
    const calculateItemsSummary = () => {
        return orderData.map((item, index) => (
            <div key={item._id || index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.itemSku}</span>
                    <span>${item.amount?.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                        <span>Pack Type: {item.packType}</span>
                        <span>Pack Qty: {item.packQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Units Qty: {item.unitsQuantity}</span>
                        {item.discountType && (
                            <span>Discount: {item.discountType} ({item.discountPercentages}%)</span>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-32 px-4 sm:px-6 lg:px-8 font-spartan">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center items-center space-x-5 mb-4">
                                <Image
                                    src="/account-details/Check-img-1.png"
                                    alt="Success"
                                    width={55}
                                    height={55}
                                    className="object-contain h-8 w-8 xl:w-[55px] xl:h-[55px]"
                                />
                                <h1 className="md:text-[3rem] text-[22px] sm:text-[2rem] font-semibold">
                                    Thanks for shopping!
                                </h1>
                            </div>
                        </div>

                        {/* Order Reference */}
                        <div className="mb-6">
                            <p className="text-base font-semibold">
                                <span>Order Reference No: </span>
                                <span>{firstItem.documentNumber}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">
                                    Shipping Address
                                </h2>
                                <div className="text-[14px] space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">
                                        {firstItem.customerName}
                                    </p>
                                    <p>{firstItem.shippingAddress}</p>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">
                                    Billing Address
                                </h2>
                                <div className="text-[14px] space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">
                                        {firstItem.customerName}
                                    </p>
                                    <p>{firstItem.billingAddress}</p>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">
                                    Payment Method
                                </h2>
                                <p className="text-[14px]">
                                    {firstItem.salesChannel || 'Credit Card'}
                                </p>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">
                                    Delivery Method
                                </h2>
                                <p className="text-[14px]">Standard Delivery</p>
                            </div>

                            {/* Order Comment */}
                            {firstItem.comments && (
                                <div>
                                    <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">
                                        Order Comment
                                    </h2>
                                    <p className="text-[14px]">{firstItem.comments}</p>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">
                                    Order Summary ({orderData.length} {orderData.length === 1 ? 'Item' : 'Items'})
                                </h2>
                                <div className="space-y-3">
                                    {calculateItemsSummary()}
                                    <div className="flex justify-between font-semibold border-t pt-3 text-base">
                                        <span>Total Amount:</span>
                                        <span>${totals.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t text-[14px] border-gray-100">
                                <p className="font-medium text-gray-600">
                                    Want to see your order details?
                                    <button
                                        onClick={handlePurchaseHistoryClick}
                                        className="text-[#2D2C70] hover:underline cursor-pointer font-semibold ml-1"
                                    >
                                        Go to purchase history
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationUI;