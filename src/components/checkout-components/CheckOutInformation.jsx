import React, { useState } from 'react';
import { ChevronDown, CreditCard, Smartphone, Phone, Circle, LockIcon } from 'lucide-react';
import Image from 'next/image';

const CheckoutFormUI = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [deliveryMethod, setDeliveryMethod] = useState('free');
    const [orderComments, setOrderComments] = useState('');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');

    const addresses = [
        {
            id: 0,
            name: "Devendra Chandara",
            address: "2 Angove Rd Spencer Park Western Australia 6330 Australia",
            phone: "7073737773"
        },
    ];

    return (
        <div className="  p-4 col-span-2 bg-gray-50 min-h-screen font-spartan">
            {/* Selected Addresses Section */}
            <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-4">Selected addresses</h2>

            <div className=''>
                <div className="space-y-3">
                    <div className="bg-white rounded-t-lg border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                </div>
                                <div className="flex-1 min-w-0 text-[14px]">
                                    <h3 className="font-base text-[#2D2C70] font-semibold  mb-2">Shipping Address</h3>
                                    <h3 className=" font-semibold  mb-1">Devendra Chandara</h3>
                                    <p className=" font-mnedium mb-1">2 Angove Rd Spencer Park Western Australia 6330 Australia</p>
                                    <p className="font-medium mb-3">7073737773</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button className=" text-[#2D2C70] underline font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* billi g address */}
                <div className="space-y-3">
                    <div className="bg-white rounded-b-lg border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                </div>
                                <div className="flex-1 min-w-0 text-[14px]">
                                    <h3 className="font-base text-[#2D2C70] font-semibold  mb-2">Billing Address</h3>
                                    <h3 className=" font-semibold  mb-1">Devendra Chandara</h3>
                                    <p className=" font-mnedium mb-1">2 Angove Rd Spencer Park Western Australia 6330 Australia</p>
                                    <p className="font-medium mb-3">7073737773</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button className=" text-[#2D2C70] underline font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Method */}
            <h2 className="text-[24px] font-semibold  mb-4 mt-8">Delivery method</h2>
            <div className="bg-white rounded-lg px-4 py-2 mb-6 border-2 border-gray-300">
                <div className="flex items-center">
                    <span>
                        <Circle size={15} className="text-[#E9098D]" />
                    </span>
                    <label htmlFor="free-delivery" className="ml-2 text-base font-medium">Free</label>
                </div>
            </div>

            {/* Order Comments */}
            <h2 className="text-[24px] font-semibold  mb-4 mt-8">Other Comments</h2>
            <div className="bg-white rounded-lg mb-4">
                <textarea
                    value={orderComments}
                    onChange={(e) => setOrderComments(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder=""
                />
            </div>

            {/* Payment Section */}
            <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-4 mt-8">Payment</h2>
            <label className="text-[20px] font-medium  flex items-center gap-4  block mb-2">
                Payment Method
                <span>
                    <ChevronDown size={20} strokeWidth={3} className="text-[#000000]/50 font-semibold" />
                </span>
            </label>
            <div className="bg-white rounded-lg p-4 mb-6 ">



                {/* Payment Options Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* credit card */}
                    <div className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                        <div className="space-y-2 text-sm">
                            <p className="font-[600]">
                                Ending in <span className="font-[400]">6844</span>
                            </p>
                            <div className="flex justify-between align-center">
                                <p className="font-[600]">
                                    Expires in <span className="font-[400]">12/22</span>
                                </p>
                                <Image src="/account-details/payment-images.png" alt="mastercard" width={50} height={50} />
                            </div>
                            <p>2 Devendra Chandora</p>
                            <p className="text-[14px] font-[400] text-[#2D2C70]"> Default credit card</p>
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                            <button className="text-[#2D2C70] font-medium">Edit</button>
                            <button className="text-[#46BCF9] font-medium">Remove</button>
                        </div>
                    </div>

                    {/* pereson card */}
                    <div className="border border-gray-200 rounded-lg p-6 flex justify-center items-center shadow-md relative">
                        <div className="space-y-2 text-sm flex flex-col justify-center items-center text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-user"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <p className='text-[14px] font-medium'>Account Customer</p>
                        </div>
                    </div>


                    <div className="border border-gray-200 rounded-lg p-6 flex justify-center items-center shadow-md relative">
                        <div className="space-y-2 text-sm flex flex-col justify-center items-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone-icon lucide-phone"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg>
                            <p className='text-[14px] font-medium'>Contact me for payment</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Purchase Order Number */}
            <div className="bg-white rounded-lg w-1/2 ">
                <div className='flex space-x-2 mb-4'>
                    <LockIcon className='w-5 h-5' />
                    <p className='text-[14px] font-medium'>Learn more about safe and secure shopping</p>

                </div>
                <h2 className="text-base font-semibold  mb-4">Enter purchase order number (Optional)</h2>
                <input
                    type="text"
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-[14] font-medium  my-4">
                    You will have an opportunity to review your order on the next step
                </p>
                {/* Continue Button */}
                <button className="w-full bg-indigo-900 text-white py-2 px-4 rounded-full font-medium text-sm hover:bg-indigo-800 transition-colors">
                    Continue
                </button>
            </div>

        </div>
    );
};

export default CheckoutFormUI;