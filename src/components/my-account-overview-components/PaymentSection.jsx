'use client'
import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CreditCardPopup from '../checkout-components/CardPopup';

const PaymentSection = () => {
    const [cards, setCards] = useState([])
    const [loadingCard, setLoadingCard] = useState(true);
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardAction, setCardAction] = useState('');
    const [cardId, setCardId] = useState(null);
    const [addingCard, setAddingCard] = useState(false);
    const currentUser = useUserStore((state) => state.user);

    const fetchCustomersCardDetails = async () => {
        try {
            setLoadingCard(true);
            const response = await axiosInstance.get(`card/get-card-by-customer-id/${currentUser._id}`);

            console.log("customers card", response)

            if (response.data.statusCode === 200) {
                const cardData = response.data.data;
                if (cardData && Array.isArray(cardData.cards) && cardData.cards.length > 0) {
                    setCards(cardData.cards)
                } else {
                    setCards([]);
                }
            } else {
                setCards([]);
            }
        } catch (error) {
            console.error('Error fetching customer card details:', error);
            setCards([]);
        } finally {
            setLoadingCard(false);
        }
    };

    const handleAddNewCard = async () => {
        setCardAction('add');
        setCardId(null);
        setShowCardForm(true);
    };

    const handleRemoveCard = async (cardId) => {
        if (!confirm('Are you sure you want to remove this card?')) {
            return;
        }
        try {
            const response = await axiosInstance.delete(`card/delete-card-by-id/${cardId}`);

            if (response.data.statusCode === 200) {
                setCards(cards.filter(card => card._id !== cardId));
                alert('Card removed successfully');
            }
        } catch (error) {
            console.error('Error removing card:', error);
            alert('Failed to remove card');
        }
    };

    const handleEditCard = async (cardId) => {
        setCardAction('edit');
        setCardId(cardId);
        setShowCardForm(true);
    }

    const getCardIcon = (cardNumber) => {
        if (cardNumber.startsWith('4')) {
            return "https://www.pointaustralia.com.au/images/general/icons/visa.png";
        } else if (cardNumber.startsWith('5')) {
            return "https://www.pointaustralia.com.au/images/general/icons/master.png";
        }
        return null;
    };

    const getCardType = (cardNumber) => {
        if (cardNumber.startsWith('4')) return 'VISA';
        if (cardNumber.startsWith('5')) return 'Mastercard';
        return 'Credit Card';
    };

    useEffect(() => {
        if (currentUser?._id) {
            fetchCustomersCardDetails();
        }
    }, [currentUser?._id, showCardForm]);

    return (
        <div className="bg-white rounded-lg xl:pb-30 font-spartan xl:px-8">
            <div className="border-b-2 border-black pb-4 mb-6">
                <h2 className="text-[24px] font-medium">Payment Methods</h2>
            </div>

            {loadingCard ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D2C70]"></div>
                    <span className="ml-3 text-sm font-medium">Loading cards...</span>
                </div>
            ) : cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Existing Cards */}
                    {cards.map((card, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-md relative">
                            <div className="space-y-2 text-sm">
                                <p className="font-[600]">
                                    Ending in <span className="font-[400]">
                                        {card.cardNumber ? card.cardNumber.slice(-4).padStart(card.cardNumber.length, '*') : '****'}
                                    </span>
                                </p>
                                <div className="flex justify-between items-center">
                                    <p className="font-[600]">
                                        Expires in <span className="font-[400]">{card.expiryMonth} / {card.expiryYear}</span>
                                    </p>
                                    {card.cardNumber && getCardIcon(card.cardNumber) && (
                                        <img
                                            src={getCardIcon(card.cardNumber)}
                                            alt={getCardType(card.cardNumber)}
                                            className="h-9 w-auto"
                                        />
                                    )}
                                </div>
                                <p>{card.fullName}</p>

                            </div>
                            <div className="absolute bottom-4 right-4 flex gap-2 text-[14px]">
                                <button
                                    onClick={() => handleEditCard(card._id)}
                                    className="text-[#2D2C70] font-medium hover:text-[#E9098D] cursor-pointer"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemoveCard(card._id)}
                                    className="text-[#46BCF9] font-medium hover:text-[#2D2C70] cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                            {card.defaultCard && (
                                <div className="absolute bottom-2 left-2 text-xs font-semibold text-blue-600  px-2 py-1 rounded">
                                    Default Card
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add New Card */}
                    <div
                        onClick={handleAddNewCard}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors cursor-pointer"
                    >
                        {addingCard ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D2C70]"></div>
                                <p className="text-sm font-medium text-gray-600">Adding Credit Card...</p>
                                <p className="text-xs text-gray-400 text-center">Please wait</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-8 h-8 flex items-center justify-center mb-2">
                                    <span className="text-[#000000]/50 text-xl font-light">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M8 12h8" />
                                            <path d="M12 8v8" />
                                        </svg>
                                    </span>
                                </div>
                                <p className="text-[14px] font-medium">Add New Card</p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                // No cards state
                <div className="text-center py-8">
                    <div className="mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-gray-400 mx-auto"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-4">No payment methods saved yet</p>
                    <button
                        onClick={handleAddNewCard}
                        className="bg-[#2D2C70] text-white px-6 py-2 rounded-lg hover:bg-[#E9098D] transition-colors"
                    >
                        Add Your First Card
                    </button>
                </div>
            )}

            {/* Card Popup */}
            {showCardForm && (
                <CreditCardPopup
                    isOpen={showCardForm}
                    setIsOpen={setShowCardForm}
                    onClose={() => setShowCardForm(false)}
                    setCardData={setCards}
                    cardData={{ cards }} // Pass current cards data
                    cardId={cardId}
                    cardAction={cardAction}
                    // Add any additional props your CreditCardPopup expects
                    latestSalesOrderDocumentNumber={null} // Adjust as needed
                    totalAmount={0} // Adjust as needed
                    setSubmitForm={() => { }} // Empty function since not used in payment section
                />
            )}
        </div>
    )
}

export default PaymentSection