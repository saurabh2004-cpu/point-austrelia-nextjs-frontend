import React from 'react';
import useUserStore from '@/zustand/user';
import { s } from 'framer-motion/client';
import axiosInstance from '@/axios/axiosInstance';

const Review = ({ selectedBillingAddress, selectedShippingAddress, submitForm }) => {
    const currentUser = useUserStore((state) => state.user);
    



    // Get the selected shipping address details
    const shippingAddress = currentUser?.shippingAddresses?.[selectedShippingAddress];
    const shippingAddressFormatted = shippingAddress
        ? `${shippingAddress.shippingAddressOne} ${shippingAddress.shippingAddressTwo} ${shippingAddress.shippingAddressThree} ${shippingAddress.shippingCity} ${shippingAddress.shippingState} ${shippingAddress.shippingZip}`.replace(/\s+/g, ' ').trim()
        : '';

    // Get the selected billing address details
    const billingAddress = currentUser?.billingAddresses?.[selectedBillingAddress];
    const billingAddressFormatted = billingAddress
        ? `${billingAddress.billingAddressOne} ${billingAddress.billingAddressTwo} ${billingAddress.billingAddressThree} ${billingAddress.billingCity} ${billingAddress.billingState} ${billingAddress.billingZip}`.replace(/\s+/g, ' ').trim()
        : '';

    // Get delivery method text
    const shippingRate = parseFloat(currentUser?.defaultShippingRate || 0);
    const deliveryMethodText = shippingRate === 0 ? 'Free' : `${shippingRate.toFixed(2)}`;

    // Get payment method text
    const paymentMethodText = submitForm.salesChannel === 'credit-card' ? 'Credit Card' :
        submitForm.salesChannel === 'Account Customer' ? 'Account Customer' :
            submitForm.salesChannel === 'Contact me for payment' ? 'Contact me for payment' :
                'Credit Card'
        ;

  


    return (
        <div className="w-full col-span-2 md:px-3 xl:px-0 py-6 bg-white xl:min-h-screen font-body">
            <h1 className='text-[24px] font-semibold text-[#2D2C70] font-heading'>Review</h1>
            <div className="space-y-2 border-2 rounded-xl p-4 mt-3 px-8 mt-6">
                {/* Shipping Address */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base text-[#2D2C70] mb-3 font-heading">Shipping Address</h2>
                    <div className="space-y-1 text-[14px]">
                        <p className="font-semibold">{currentUser?.customerName || currentUser?.contactName || ''}</p>
                        <p className="font-medium">{shippingAddressFormatted}</p>
                        <p className="font-medium">{currentUser?.CustomerPhoneNo || currentUser?.contactPhone || ''}</p>
                    </div>
                </div>

                {/* Billing Address */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base text-[#2D2C70] mb-3 font-heading">Billing Address</h2>
                    <div className="space-y-1 text-[14px]">
                        <p className="font-semibold">{currentUser?.customerName || currentUser?.contactName || ''}</p>
                        <p className="font-medium">{billingAddressFormatted}</p>
                        <p className="font-medium">{currentUser?.CustomerPhoneNo || currentUser?.contactPhone || ''}</p>
                    </div>
                </div>

                {/* Delivery Method */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] font-heading">Delivery method</h2>
                    <p className="text-base font-[400]">{deliveryMethodText}</p>
                </div>

                {/* Order Comments */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] font-heading">Order Comments</h2>
                    <p className="text-base font-[400]">{submitForm.comments || 'No comments'}</p>
                </div>

                {/* Payment Method */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] font-heading">Payment Method</h2>
                    <p className="text-base font-[400]">{paymentMethodText}</p>
                </div>

                {/* Purchase Order Number */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-base font-semibold text-[#2D2C70] font-heading">Purchase Order Number</h2>
                    <p className="text-base font-[400]">{submitForm.customerPO || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default Review