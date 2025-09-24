import React from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

const OrderConfirmationUI = () => {
    const orderData = {
        orderReference: "SO1234",
        shippingAddress: {
            name: "Devendra Chandara",
            address: "2 Angove Rd Spencer Park Western Australia 6330 Australia",
            phone: "7073737773"
        },
        billingAddress: {
            name: "Devendra Chandara",
            address: "2 Angove Rd Spencer Park Western Australia 6330 Australia",
            phone: "7073737773"
        },
        paymentMethod: "Credit card",
        deliveryMethod: "Free",
        orderComment: "Deliver after 6 PM"
    };

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
                                <span className="">{orderData.orderReference}</span>
                            </p>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-3">
                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">Shipping Address</h2>
                                <div className="text-[14px]  space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">{orderData.shippingAddress.name}</p>
                                    <p >{orderData.shippingAddress.address}</p>
                                    <p>{orderData.shippingAddress.phone}</p>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Billing Address</h2>
                                <div className="text-[14px]  space-y-1 font-medium">
                                    <p className="font-semibold text-gray-900">{orderData.billingAddress.name}</p>
                                    <p >{orderData.billingAddress.address}</p>
                                    <p>{orderData.billingAddress.phone}</p>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Payment Method</h2>
                                <p className="text-[14px] ">{orderData.paymentMethod}</p>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-4">Delivery Method</h2>
                                <p className="text-[14px] ">{orderData.deliveryMethod}</p>
                            </div>

                            {/* Order Comment */}
                            <div>
                                <h2 className="text-[20px] font-semibold text-[#2D2C70] mb-2">Order Comment</h2>
                                <p className="text-[14px] ">{orderData.orderComment}</p>
                            </div>

                            {/* Footer Message */}
                            <div className="pt-4 border-t text-[14px] border-gray-100">
                                <p className=" font-medium text-gray-600">
                                    You want see your older details?
                                    <button className="text-[#2D2C70] font-semibold ml-1 ">
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