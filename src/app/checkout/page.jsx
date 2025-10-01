'use client'
import React, { useState } from 'react';
import { ChevronDown, Check, CreditCard, User, Phone, Shield, MenuIcon, Circle, LockIcon, ArrowDown, ArrowDown01 } from 'lucide-react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import CheckoutFormUI from '@/components/checkout-components/CheckOutInformation';
import Review from '@/components/checkout-components/Review';
import { useRouter } from 'next/navigation';


const CheckoutComponent = () => {
    const [deliveryMethod, setDeliveryMethod] = useState('free');
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
    const [step, setStep] = useState(1);

    const orderItems = [
        {
            id: 1,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 7,
            unitPrice: 0.64,
            image: "/product-listing-images/product-1.avif"
        },
        {
            id: 2,
            name: "BAR'S BUGS WINDSCREEN CLEAN 375ML",
            sku: "SKU-88275",
            price: 4.48,
            quantity: 7,
            unitPrice: 0.64,
            image: "/product-listing-images/product-1.avif"
        }
    ];

    const [selectedShippingAddress, setSelectedShippingAddress] = useState(0);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState(0);
    const router = useRouter();

    const addresses = [
        {
            id: 0,
            name: "Devendra Chandara",
            address: "2 Angove Rd Spencer Park Western Australia 6330 Australia",
            phone: "7073737773"
        },
        {
            id: 1,
            name: "Devendra Chandara",
            address: "2 Angove Rd Spencer Park Western Australia 6330 Australia",
            phone: "7073737773"
        }
    ];

    const subtotal = 4.48;
    const matadorWholesale = 4.48;
    const pointAccessories = 4.48;
    const shipping = 4.48;
    const gst = 4.48;
    const total = 4.48;

    const handleCompleteCheckout = () => {
        router.push('/thank-you');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 lg:pb-32 lg:pt-4 font-spartan">
            <div className="max-w-8xl px-4 sm:px-6 lg:px-8 mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-4 relative top-6">
                    <h1 className="text-lg sm:text-xl lg:text-[24px] font-semibold mb-4 text-center sm:text-left">
                        Checkout Process
                    </h1>

                    {/* Progress Steps */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start text-sm sm:text-base font-semibold mb-2 text-[#00000080]/50 gap-x-1 sm:gap-x-2">
                        <span className={`font-medium ${step === 1 ? 'text-[#2D2C70]' : ''}`}>
                            1. Select Addresses
                        </span>
                        <span className="mx-1">/</span>
                        <span className={`font-medium ${step === 2 ? 'text-[#2D2C70]' : ''}`}>
                            2. Checkout Information
                        </span>
                        <span className="mx-1">/</span>
                        <span className={`font-medium ${step === 3 ? 'text-[#2D2C70]' : ''}`}>
                            3. Review
                        </span>
                    </div>

                    <hr className="border-[1.5px] sm:border-[1px] border-[#2D2C70]" />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-2">
                    {step === 1 &&
                        <div className="min-w-full col-span-2 mx-auto  bg-gray-50 xl:min-h-screen ">
                            {/* Shipping Address Section */}
                            <div className="mb-8 ">
                                <h2 className="text-[24px] font-semibold text-[#2D2C70]  py-6">Select Shipping Address</h2>

                                <div className="space-y-3">
                                    <p className="text-[20px] mb-4">Shipping Address (2)</p>
                                    {addresses.map((address, index) => (
                                        <div key={`shipping-${address.id}`}
                                            className={`bg-white rounded-lg border  overflow-hidden ${selectedShippingAddress === address.id ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="shipping-address"
                                                            value={address.id}
                                                            checked={selectedShippingAddress === address.id}
                                                            onChange={() => setSelectedShippingAddress(address.id)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className=" font-semibold  mb-1">{address.name}</h3>
                                                        <p className=" font-mnedium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>

                                                        <div className="flex flex-wrap gap-2">
                                                            <button className=" text-[#2D2C70] underline font-medium">
                                                                Edit
                                                            </button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className=" text-[#46BCF9] underline font-medium">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Shipping Address */}
                                    <button className="w-full bg-white rounded-lg  py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors">
                                        <div className='border-2 border-[#2D2C70] rounded-full h-7 w-7 justify-center flex items-center'>
                                            <Plus className="w-4 h-4 text-gray-600 " />
                                        </div>
                                        <span className="text-sm text-[#2D2C70] text-[14px] font-semibold">Add a new shipping address</span>
                                    </button>
                                </div>
                            </div>

                            {/* Billing Address Section */}
                            <div className="mb-8 ">
                                <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-2">Select Billing Address</h2>
                                <p className="text-[20px] mb-4">Billing Address (2)</p>

                                <div className="space-y-3">
                                    {addresses.map((address, index) => (
                                        <div key={`shipping-${address.id}`}
                                            className={`bg-white rounded-lg border  overflow-hidden ${selectedShippingAddress === address.id ? 'border-[#2D2C70]' : ''}`}>
                                            <div className="p-4">
                                                <div className="flex items-center space-x-20">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="radio"
                                                            name="shipping-address"
                                                            value={address.id}
                                                            checked={selectedShippingAddress === address.id}
                                                            onChange={() => setSelectedShippingAddress(address.id)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-[14px]">
                                                        <h3 className=" font-semibold  mb-1">{address.name}</h3>
                                                        <p className=" font-mnedium mb-1">{address.address}</p>
                                                        <p className="font-medium mb-3">{address.phone}</p>

                                                        <div className="flex flex-wrap gap-2">
                                                            <button className=" text-[#2D2C70] underline font-medium">
                                                                Edit
                                                            </button>
                                                            <span className="text-gray-300">|</span>
                                                            <button className=" text-[#46BCF9] underline font-medium">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Shipping Address */}
                                    <button className="w-full bg-white rounded-lg  py-4 flex items-center justify-start space-x-2 hover:bg-gray-50 transition-colors">
                                        <div className='border-2 border-[#2D2C70] rounded-full h-7 w-7 justify-center flex items-center'>
                                            <Plus className="w-4 h-4 text-gray-600 " />
                                        </div>
                                        <span className="text-sm text-[#2D2C70] text-[14px] font-semibold">Add a new shipping address</span>
                                    </button>
                                </div>
                            </div>
                        </div>}

                    {step === 2 &&
                        <>
                            <CheckoutFormUI />
                        </>
                    }

                    {step === 3 &&
                        <>
                            <Review />
                        </>
                    }



                    {/* Order Summary Sidebar */}
                    <div className={`lg:col-span-1   ${step ===  1  ? 'xl:mt-27' : 'xl:mt-18'}`}>
                        <div className="bg-white rounded-lg sticky top-6">
                            <div className="md:p-4 ">

                                {/* Price Summary */}
                                <div className="border-2 border-gray-300 rounded-lg   space-y-3 font-spartan">
                                    <div className="flex items-center justify-center mb-4 py-4 border-b">
                                        <h2 className="text-lg sm:text-xl lg:text-[20px] font-semibold">Order Summary</h2>
                                    </div>
                                    <div className="flex justify-between px-4">
                                        <span className="text-base sm:text-lg lg:text-[20px] font-medium">
                                            Subtotal <span className='text-xs sm:text-sm lg:text-base font-[400] text-[#000000]/50'>43 Items</span>
                                        </span>
                                        <span className="text-[#2D2C70] font-semibold text-[20px]">${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-3 px-4'>
                                        <div className="mb-2">
                                            Subtotal does not include shipping or taxes
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Matador Wholesale</span>
                                            <span>${matadorWholesale.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Point Accessories</span>
                                            <span>${pointAccessories.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">Shipping</span>
                                            <span>${shipping.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-[#000000]/80">GST</span>
                                            <span>${gst.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className=" p-4 flex justify-between text-base sm:text-lg font-semibold pt-2 border-t border-gray-200 mt-2">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                {step < 3 ? <button
                                    className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4"
                                    onClick={() => setStep(step + 1)}
                                >
                                    Continue
                                </button>
                                    :
                                    <button
                                        className="w-full bg-[#2D2C70] text-white py-2 rounded-2xl text-sm sm:text-base font-medium my-4"
                                        onClick={handleCompleteCheckout}
                                    >
                                        Complete Checkout
                                    </button>
                                }

                                {/* Order Items */}
                                <div className="space-y-4 mb-6 border-2 border-gray-300 rounded-lg ">
                                    <div className='flex items-center justify-between flex-row border-2 border-gray-400 rounded-lg  px-3 py-2'>
                                        <p className='text-xs sm:text-sm lg:text-[14px] font-[500]'>Items To Ship (43)</p>
                                        <span><ChevronDown className="w-4 h-4 text-black" /></span>
                                    </div>
                                    <div className='space-y-4 mt-4 p-3 sm:p-4'>
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="flex items-start space-x-3 p-2 justify-between">
                                                <div className="w-12 h-12 bg-gray-100 mt-14  rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs sm:text-sm lg:text-[16px] font-medium mb-1 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className=" text-[18px] text-[#2D2C70] font-semibold mb-1">
                                                        ${item.price.toFixed(2)}
                                                    </p>
                                                    <div className='text-xs sm:text-sm lg:text-[14px] font-[400] space-y-1'>
                                                        <p className="mb-1">{item.sku}</p>
                                                        <p className="mb-1">Units: Pack of 12</p>

                                                        <div className="flex items-center text-[12px] font-[600] text-black py-1 px-2 w-[90px]  bg-[#E7FAEF] mb-2">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            IN STOCK
                                                        </div>

                                                        <div className="space-y-1 text-xs">
                                                            <div>Unit price ${item.unitPrice.toFixed(2)}</div>
                                                            <div>Quantity {item.quantity}</div>
                                                            <div>Amount ${(item.price * item.quantity).toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='px-4 '>
                                        <button
                                            className="w-full bg-[#2D2C70] text-white p-2 rounded-2xl text-sm sm:text-base font-medium mt-4 mb-4  "
                                        >
                                            Edit Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutComponent;