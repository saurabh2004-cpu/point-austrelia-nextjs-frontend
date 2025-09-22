import React from 'react';

const Review = () => {
    const orderData = {
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
        deliveryMethod: "Free",
        orderComments: "Deliver after 6 PM",
        paymentMethod: "Credit card",
        purchaseOrderNumber: "1234567890"
    };

    return (
        <div className="w-full  col-span-2  p-4 sm:px-6 bg-white min-h-screen font-spartan">
            <h1 className='text-[24px] font-semibold text-[#2D2C70]'>Review</h1>
            <div className="space-y-2 border-2 rounded-xl p-4 mt-3 px-8">
                {/* Shipping Address */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base text-[#2D2C70] mb-3">Shipping Address</h2>
                    <div className="space-y-1 text-[14px]">
                        <p className=" font-semibold ">{orderData.shippingAddress.name}</p>
                        <p className=" font-medium">{orderData.shippingAddress.address}</p>
                        <p className=" font-medium">{orderData.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Billing Address */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base text-[#2D2C70] mb-3">Billing Address</h2>
                    <div className="space-y-1 text-[14px]">
                        <p className=" font-semibold ">{orderData.billingAddress.name}</p>
                        <p className=" font-medium">{orderData.billingAddress.address}</p>
                        <p className=" font-medium">{orderData.billingAddress.phone}</p>
                    </div>
                </div>

                {/* Delivery Method */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] ">Delivery method</h2>
                    <p className="text-base font-[400]">{orderData.deliveryMethod}</p>
                </div>

                {/* Order Comments */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] ">Order Comments</h2>
                    <p className="text-base font-[400]">Deliver after 6 PM</p>
                </div>

                {/* Payment Method */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] ">Payment Method</h2>
                    <p className="text-base font-[400]">Payment Method</p>
                </div>

                {/* Purchase Order Number */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] ">Purchase Order Number</h2>
                    <p className="text-base font-[400]">1234567890</p>
                </div>
            </div>
        </div>
    );
};

export default Review;