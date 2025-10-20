import React, { useEffect, useState } from 'react';
import { ChevronDown, Circle, LockIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import { useSearchParams } from 'next/navigation';

const CheckoutFormUI = ({ selectedBillingAddress, selectedShippingAddress, submitForm, setSubmitForm }) => {
    const [orderComments, setOrderComments] = useState(submitForm.comments || '');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(submitForm.customerPO || '');
    const [selectedPayment, setSelectedPayment] = useState(submitForm.salesChannel || 'credit-card');
    const currentUser = useUserStore((state) => state.user);
    const [cardData, setCardData] = useState(null);
    const [loadingCard, setLoadingCard] = useState(true);
    const params = useSearchParams();

    const handlePaymentChange = (paymentType) => {
        setSelectedPayment(paymentType);
        setSubmitForm(prev => ({
            ...prev,
            salesChannel: paymentType
        }));
    };

    // Update submitForm when comments or PO changes
    useEffect(() => {
        setSubmitForm(prev => ({
            ...prev,
            comments: orderComments,
            customerPO: purchaseOrderNumber
        }));
    }, [orderComments, purchaseOrderNumber]);

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

    // Get shipping rate
    const shippingRate = parseFloat(currentUser?.defaultShippingRate || 0);
    const deliveryMethodText = shippingRate === 0 ? 'Free' : `$${shippingRate.toFixed(2)}`;

    const fetchCustomersCardDetails = async () => {
        try {
            setLoadingCard(true);
            const response = await axiosInstance.get(`card/get-card-by-customer-id/${currentUser._id}`);

            console.log("customers card", response)

            if (response.data.statusCode === 200) {
                // Check if card data exists and is not empty
                const cards = response.data.data;
                if (cards && Array.isArray(cards) && cards.length > 0) {
                    setCardData(cards[0]); // Get the first card
                } else if (cards && !Array.isArray(cards) && Object.keys(cards).length > 0) {
                    setCardData(cards);
                } else {
                    setCardData(null); // No card found
                }
            } else {
                setCardData(null);
            }
        } catch (error) {
            console.error('Error fetching customer card details:', error);
            setCardData(null);
        } finally {
            setLoadingCard(false);
        }
    };

    const handleVerifyCard = async () => {
        try {
            const response = await axiosInstance.post("card/create-session", {
                userName: currentUser.customerName,
                email: currentUser.customerEmail,
            });

            console.log("response", response);

            if (response.data.statusCode === 200) {
                window.location.href = response.data.data.SharedPaymentUrl;
            }
        } catch (error) {
            console.error("Error starting Eway verification:", error);
            alert("Failed to start verification.");
        }
    };

    const handleRemoveCard = async () => {
        if (!confirm('Are you sure you want to remove this card?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`card/delete-card-by-customer-id/${cardData._id}`);

            if (response.data.statusCode === 200) {
                setCardData(null);
                alert('Card removed successfully');
            }
        } catch (error) {
            console.error('Error removing card:', error);
            alert('Failed to remove card');
        }
    };

    useEffect(() => {
        const accessCode = params.get("AccessCode");
        if (accessCode && !cardData) {
            const fetchEwayResult = async () => {
                try {
                    const response = await axiosInstance.post(`card/eway-result/${accessCode}/${currentUser._id}`);
                    console.log("eway response", response);

                    if (response.data.statusCode === 200) {
                        // Refresh card details after successful verification
                        await fetchCustomersCardDetails();
                        const url = new URL(window.location.href);
                        url.searchParams.delete("AccessCode");
                        window.history.replaceState({}, document.title, url.toString());
                    }
                } catch (error) {
                    console.error("Error fetching eway result:", error);
                }
            };

            fetchEwayResult();
        }
    }, [params]);

    useEffect(() => {
        if (currentUser?._id) {
            fetchCustomersCardDetails();
        }
    }, [currentUser?._id]);

    return (
        <div className="p-4 col-span-2  min-h-screen font-spartan mt-5">
            <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-4">Selected addresses</h2>

            <div>
                <div className="space-y-3">
                    <div className="bg-white rounded-t-lg border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0 text-[14px]">
                                    <h3 className="font-base text-[#2D2C70] font-semibold mb-2">Shipping Address</h3>
                                    <h3 className="font-semibold mb-1">{currentUser?.customerName || currentUser?.contactName || ''}</h3>
                                    <p className="font-mnedium mb-1">{shippingAddressFormatted}</p>
                                    <p className="font-medium mb-3">{currentUser?.CustomerPhoneNo || currentUser?.contactPhone || ''}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="text-[#2D2C70] underline font-medium">Edit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="bg-white rounded-b-lg border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0 text-[14px]">
                                    <h3 className="font-base text-[#2D2C70] font-semibold mb-2">Billing Address</h3>
                                    <h3 className="font-semibold mb-1">{currentUser?.customerName || currentUser?.contactName || ''}</h3>
                                    <p className="font-mnedium mb-1">{billingAddressFormatted}</p>
                                    <p className="font-medium mb-3">{currentUser?.CustomerPhoneNo || currentUser?.contactPhone || ''}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="text-[#2D2C70] underline font-medium">Edit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-[24px] font-semibold mb-4 mt-8">Delivery method</h2>
            <div className="bg-white rounded-lg px-4 py-2 mb-6 border-2 border-gray-300">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#E9098D]">
                        <div className="w-2 h-2 rounded-full bg-[#E9098D]" />
                    </div>
                    <label className="ml-2 text-base font-medium">{deliveryMethodText}</label>
                </div>
            </div>

            <h2 className="text-[24px] font-semibold mb-4 mt-8">Order Comments</h2>
            <div className="bg-white rounded-lg mb-4">
                <textarea
                    value={orderComments}
                    onChange={(e) => setOrderComments(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder=""
                />
            </div>

            <h2 className="text-[24px] font-semibold text-[#2D2C70] mb-4 mt-8">Payment</h2>
            <label className="text-[20px] font-medium flex items-center gap-4 block mb-2">
                Payment Method
                <span><ChevronDown size={20} strokeWidth={3} className="text-[#000000]/50 font-semibold" /></span>
            </label>
            <div className="bg-white rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-18 xl:gap-4 mb-4">
                    {/* credit card */}
                    <div className="h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start">
                                <input
                                    type="radio"
                                    id="credit-card"
                                    name="payment-method"
                                    value="credit-card"
                                    checked={selectedPayment === 'credit-card'}
                                    onChange={() => handlePaymentChange('credit-card')}
                                    className="mt-1 h-4 w-4 text-[#E9098D] focus:ring-[#E9098D] border-[#E9098D]"
                                />
                                <label htmlFor="credit-card" className="ml-3 flex-1 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-900">Credit card</span>
                                </label>
                            </div>
                        </div>

                        {loadingCard ? (
                            <div className="border h-full min-h-[212px] border-gray-200 rounded-lg p-6 shadow-md flex justify-center items-center">
                                <div className="text-sm text-gray-500">Loading card details...</div>
                            </div>
                        ) : cardData ? (
                            <div className="border h-full min-h-[212px] border-gray-200 rounded-lg p-6 shadow-md relative flex flex-col justify-between">
                                <div className="flex flex-row justify-between items-start">
                                    <div className="space-y-2 text-sm">
                                        <p className="font-[600]">Ending in <span className="font-[400]">{cardData?.lastFourDigits || '****'}</span></p>
                                        <p className="font-[600]">Expires in <span className="font-[400]">{cardData?.expirationMonth && cardData?.expirationYear ? `${cardData.expirationMonth}/${cardData.expirationYear}` : 'N/A'}</span></p>
                                        <p className="font-[500]">{cardData?.userId?.name || currentUser?.customerName || 'N/A'}</p>
                                        <div className="flex-col space-y-2">
                                            <p className="font-[500]">Token ID</p>
                                            <div className="text-xs text-gray-600">
                                                {cardData?.tokenCustomerId || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Image src="/account-details/payment-images.png" alt="card" width={50} height={50} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 text-[14px] mt-4">
                                    <button
                                        onClick={handleVerifyCard}
                                        className="text-[#2D2C70] font-medium hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleRemoveCard}
                                        className="text-[#46BCF9] font-medium hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={handleVerifyCard}
                                className="border h-full min-h-[212px] border-dashed border-gray-300 rounded-lg p-6 shadow-md flex flex-col justify-center items-center cursor-pointer hover:border-[#2D2C70] hover:bg-gray-50 transition-all"
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <Plus size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Add Credit Card</p>
                                    <p className="text-xs text-gray-400 text-center">Click to add a new card</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* person card */}
                    <div className="h-full">
                        <div className="flex items-start justify-between mb-4">
                            <input
                                type="radio"
                                id="person-card"
                                name="payment-method"
                                value="person-card"
                                checked={selectedPayment === 'person-card'}
                                onChange={() => handlePaymentChange('person-card')}
                                className="mt-1 h-4 w-4 text-[#E9098D] focus:ring-[#E9098D] border-[#E9098D]"
                            />
                            <label htmlFor="person-card" className="ml-3 flex-1 cursor-pointer">
                                <span className="text-sm font-medium text-gray-900">Account Customer</span>
                            </label>
                        </div>
                        <div className="border h-full min-h-[212px] border-gray-200 rounded-lg p-6 flex justify-center items-center shadow-md">
                            <div className="space-y-2 text-sm flex flex-col justify-center items-center text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <p className="text-[14px] font-medium">Account Customer</p>
                            </div>
                        </div>
                    </div>

                    {/* phone card */}
                    <div className="h-full">
                        <div className="flex items-start justify-between mb-4">
                            <input
                                type="radio"
                                id="phone-card"
                                name="payment-method"
                                value="phone-card"
                                checked={selectedPayment === 'phone-card'}
                                onChange={() => handlePaymentChange('phone-card')}
                                className="mt-1 h-4 w-4 text-[#E9098D] focus:ring-[#E9098D] border-[#E9098D]"
                            />
                            <label htmlFor="phone-card" className="ml-3 flex-1 cursor-pointer">
                                <span className="text-sm font-medium text-gray-900">Contact me for payment</span>
                            </label>
                        </div>
                        <div className="border h-full min-h-[212px] border-gray-200 rounded-lg p-6 flex justify-center items-center shadow-md">
                            <div className="space-y-2 text-sm flex flex-col justify-center items-center text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                                </svg>
                                <p className="text-[14px] font-medium">Contact me for payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg xl:w-1/2">
                <div className='flex space-x-2 mb-4'>
                    <LockIcon className='w-5 h-5' />
                    <p className='text-[14px] font-medium'>Learn more about safe and secure shopping</p>
                </div>
                <h2 className="text-base font-semibold mb-4">Enter purchase order number (Optional)</h2>
                <input
                    type="text"
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-[14] font-medium my-4">
                    You will have an opportunity to review your order on the next step
                </p>
            </div>
        </div>
    );
};

export default CheckoutFormUI;