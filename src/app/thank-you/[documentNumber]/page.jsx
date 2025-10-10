'use client'
import React from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation'
import axiosInstance from '@/axios/axiosInstance';


const OrderConfirmationUI = () => {
    const [orderData, setOrderData] = React.useState(null);
    const params = useParams()
    const documentNumber = params.documentNumber
    const router = useRouter();


    const handlePurchaseHistoryClick = () => {
        router.push('/my-account-review');
    }

    const fetchSalesOrderByDocumentNumber = async () => {
        try {
            const response = await axiosInstance.get(`sales-order/get-sales-order-by-document-number/${documentNumber}`);

            console.log("salesorder response by document number", response);

            if (response.data.statusCode === 200) {
                console.log("order data", response.data.data);
                setOrderData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sales order by document number:', error);
        }
    }

    React.useEffect(() => {
        if (documentNumber) {
            fetchSalesOrderByDocumentNumber();
        }
    }, [documentNumber]);

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 pb-32 px-4 sm:px-6 lg:px-8 font-spartan">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-32 px-4 sm:px-6 lg:px-8 font-spartan">
            <div className="max-w-2xl mx-auto">
                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8 ">
                        {/* Header with Check Icon and Title */}
                        <div className="text-center mb-6 ">
                            <div className="flex justify-center  mb-4 flex items-center space-x-5 align-middle justify-start">
                                <Image
                                    src="/account-details/Check-img-1.png"
                                    alt="Matador Wholesale Logo "
                                    width={55}
                                    height={55}
                                    className="object-contain  h-8 w-8 xl:w-[55px] xl:h-[55px]"
                                />
                                <h1 className="md:text-[3rem]  text-[22px] sm:text-[2rem] font-semibold ">Thanks for shopping!</h1>
                            </div>
                        </div>

                        {/* Order Reference */}
                        <div className="mb-6">
                            <p className="text-base font-semibold ">
                                <span className="">Order Reference No: </span>
                                <span className="">{orderData.documentNumber}</span>
                            </p>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-3">
                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">Shipping Address</h2>
                                <div className="text-[14px]  space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">{orderData.customerName}</p>
                                    <p >{orderData.shippingAddress}</p>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Billing Address</h2>
                                <div className="text-[14px]  space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">{orderData.customerName}</p>
                                    <p >{orderData.billingAddress}</p>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Payment Method</h2>
                                <p className="text-[14px] ">{orderData.salesChannel}</p>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Delivery Method</h2>
                                <p className="text-[14px] ">Standard Delivery</p>
                            </div>

                            {/* Order Comment */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">Order Comment</h2>
                                <p className="text-[14px] ">{orderData.comments || "No comments provided"}</p>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Order Summary</h2>
                                <div className="text-[14px] space-y-2">
                                    <div className="flex justify-between">
                                        <span>SKU:</span>
                                        <span>{orderData.itemSku}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pack Type:</span>
                                        <span>{orderData.packType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pack Quantity:</span>
                                        <span>{orderData.packQuantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Units Quantity:</span>
                                        <span>{orderData.unitsQuantity}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t pt-2">
                                        <span>Total Amount:</span>
                                        <span>${orderData.amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Message */}
                            <div className="pt-4 border-t text-[14px] border-gray-100">
                                <p className=" font-medium text-gray-600">
                                    You want see your older details?
                                    <button onClick={handlePurchaseHistoryClick} className="text-[#2D2C70] hover:underline cusror-pointer font-semibold ml-1 ">
                                        Go back to purchase history
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