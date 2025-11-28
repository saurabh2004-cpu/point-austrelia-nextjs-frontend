import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import useUserStore from '@/zustand/user';
import axiosInstance from '@/axios/axiosInstance';
import { th } from 'framer-motion/m';

export default function CreditCardPopup(
    {
        isOpen,
        setIsOpen,
        setCardData,
        cardData,
        cardId,
        cardAction
    }
) {
    const currentUser = useUserStore((state) => state.user);

    const [cardDetails, setCardDetails] = useState({
        nameOnCard: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cardType: '',
        defaultCard: false
    });
    const [refrenceNumber, setRefrenceNumber] = useState('');



    // Notification state
    const [notification, setNotification] = useState({
        show: false,
        type: '', // 'success', 'error', 'warning'
        message: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Open Popup
            </button>
        );
    }

    // Show notification function
    const showNotification = (type, message) => {
        setNotification({
            show: true,
            type,
            message
        });

        // Auto hide after 5 seconds
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 1000);
    };

    // Manual close notification
    const closeNotification = () => {
        setNotification({ show: false, type: '', message: '' });
    };

    const handleCardNumberChange = (cardNumber) => {
        const detectedCardType = detectCardType(cardNumber);
        setCardDetails({
            ...cardDetails,
            cardNumber,
            cardType: detectedCardType
        });
    };


    const detectCardType = (cardNumber) => {
        // Remove spaces and non-digit characters
        const cleanNumber = cardNumber.replace(/\D/g, '');

        if (cleanNumber.startsWith('4')) {
            return 'VISA';
        } else if (cleanNumber.startsWith('5')) {
            return 'MASTERCARD';
        }
        return '';
    };

    const handleAddCard = async () => {
        setLoading(true);


        try {

            if (cardAction === 'edit') {
                const response = await axiosInstance.put(`card/edit-card-details/${cardId}`, {
                    FirstName: currentUser.customerName,
                    LastName: currentUser.customerName.split(' ')[1] || '',
                    Email: currentUser?.customerEmail,
                    Phone: currentUser?.CustomerPhoneNo,
                    Name: cardDetails.nameOnCard,
                    cardNumber: cardDetails.cardNumber,
                    ExpiryMonth: cardDetails.expiryMonth,
                    ExpiryYear: cardDetails.expiryYear,
                    CardType: cardDetails.cardType,
                    defaultCard: cardDetails.defaultCard
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data.statusCode === 200) {
                    const cardResponse = response.data.data

                    console.log("card response", cardResponse)

                    setCardData(() => [...cardData.cards, {
                        firstName: cardResponse.firstName,
                        lastName: cardResponse.lastName,
                        fullName: cardResponse.fullNAme,
                        cardNumber: cardResponse.cardNumber,
                        expiryMonth: cardResponse.expiryMonth,
                        expiryYear: cardResponse.expiryYear,
                        cardType: cardDetails.cardType,
                        defaultCard: cardDetails.defaultCard
                    }]);
                    setLoading(false);

                    setCardDetails({
                        nameOnCard: '',
                        cardNumber: '',
                        expiryMonth: '',
                        expiryYear: '',
                        cvv: '',
                        cardType: '',
                        defaultCard: false
                    })

                    // Show success notification
                    showNotification('success', 'Card Updated successfully!');

                    // Close popup after success
                    setTimeout(() => {
                        setIsOpen(false);
                    }, 2000);
                } else {
                    showNotification('error', response.data.message);
                }

            } else {
                const response = await axiosInstance.post('card/add-new-card', {
                    FirstName: currentUser.customerName,
                    LastName: currentUser.customerName.split(' ')[1] || '',
                    Email: currentUser?.customerEmail,
                    Phone: currentUser?.CustomerPhoneNo,
                    Name: cardDetails.nameOnCard,
                    cardNumber: cardDetails.cardNumber,
                    ExpiryMonth: cardDetails.expiryMonth,
                    ExpiryYear: cardDetails.expiryYear,
                    CardType: cardDetails.cardType,
                    defaultCard: cardDetails.defaultCard
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Card response:', response);

                if (response.data.statusCode === 200) {
                    const cardResponse = response.data.data

                    setCardData(() => [...cardData.cards, {
                        firstName: cardResponse.Customer.FirstName,
                        lastName: cardResponse.Customer.LastName,
                        fullName: cardResponse.Customer.CardDetails.Name,
                        cardNumber: cardResponse.Customer.CardDetails.Number,
                        expiryMonth: cardResponse.Customer.CardDetails.ExpiryMonth,
                        expiryYear: cardResponse.Customer.CardDetails.ExpiryYear,
                        cardType: cardDetails.cardType,
                        defaultCard: cardDetails.defaultCard
                    }]);
                    setLoading(false);

                    setCardDetails({
                        nameOnCard: '',
                        cardNumber: '',
                        expiryMonth: '',
                        expiryYear: '',
                        cvv: '',
                        cardType: ''
                    })

                    // Show success notification
                    showNotification('success', 'Card added successfully!');

                    // Close popup after success
                    setTimeout(() => {
                        setIsOpen(false);
                    }, 2000);
                } else {
                    showNotification('error', response.data.message);
                }
            }

        } catch (error) {
            console.error('Error adding card:', error);

            // Handle different error types based on response
            if (error.response?.data?.statusCode === 400) {
                showNotification('warning', error.response.data.message || 'Card already exists');
            } else {
                showNotification('error', 'Failed to add card. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    // Notification component
    const Notification = () => {
        if (!notification.show) return null;

        const getNotificationStyles = () => {
            switch (notification.type) {
                case 'success':
                    return 'bg-green-50 border-green-200 text-green-800';
                case 'error':
                    return 'bg-red-50 border-red-200 text-red-800';
                case 'warning':
                    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
                default:
                    return 'bg-gray-50 border-gray-200 text-gray-800';
            }
        };

        const getNotificationIcon = () => {
            switch (notification.type) {
                case 'success':
                    return <CheckCircle className="w-5 h-5 text-green-600" />;
                case 'error':
                    return <XCircle className="w-5 h-5 text-red-600" />;
                case 'warning':
                    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
                default:
                    return null;
            }
        };

        return (
            <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${getNotificationStyles()} max-w-sm`}>
                <div className="flex items-start gap-3">
                    {getNotificationIcon()}
                    <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <button
                        onClick={closeNotification}
                        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };


    const fetchCardById = async (id) => {
        try {
            const response = await axiosInstance.get(`card/get-card-by-id/${id}`);

            console.log("get card by id", response)

            if (response.data.statusCode === 200) {
                setCardDetails({ ...response.data.data, nameOnCard: response.data.data.fullName, cvv: '***' })
            }
        } catch (error) {
            console.error('Error fetching customer card details:', error);
            throw error
        }
    }

    useEffect(() => {
        if (cardId && cardAction === 'edit') {
            fetchCardById(cardId)
        }
    }, [])

    return (
        <>
            {/* Notification */}
            <Notification />

            <div className="fixed font-body inset-0 lg:z-20 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative max-h-[90%] overflow-y-scroll hide-scrollbar">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-heading font-bold mb-8 text-gray-800">
                        {cardAction === 'edit' ? 'EDIT CREDIT CARD' : 'ADD CREDIT CARD'}
                    </h2>

                    {/* Credit Card Number */}
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                            Credit card number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={cardDetails.cardNumber}
                            disabled={cardAction === 'edit' ? true : false}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="Enter card number"
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        />
                        {/* Card Brand Icons */}
                        {cardDetails.cardNumber && (
                            <div className="flex gap-2 mt-3">
                                {cardDetails.cardNumber.startsWith('4') ? (
                                    <img
                                        src="https://www.pointaustralia.com.au/images/general/icons/visa.png"
                                        alt="Visa"
                                        className="h-9"
                                    />
                                ) : cardDetails.cardNumber.startsWith('5') ? (
                                    <img
                                        src="https://www.pointaustralia.com.au/images/general/icons/master.png"
                                        alt="Mastercard"
                                        className="h-9"
                                    />
                                ) : null}
                            </div>
                        )}

                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                            Card Type <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={cardDetails.cardType}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        >
                        </input>
                    </div>


                    {/* Expiration Date */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                            Expiration date <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <select
                                value={cardDetails.expiryMonth}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                        {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={cardDetails.expiryYear}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                            >
                                {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={2025 + i}>
                                        {2025 + i}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Name on Card */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                            Name on card <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={cardDetails.nameOnCard}
                            disabled={cardAction === 'edit' ? true : false}
                            onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                            placeholder="Enter cardholder name"
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    {/* Default Card Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cardDetails.defaultCard}
                                onChange={(e) => setCardDetails({ ...cardDetails, defaultCard: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700 font-heading">
                                Make this my default credit card
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            This card will be selected by default for future purchases
                        </p>
                    </div>

                    {/* Buttons */}
                    {cardAction !== 'edit' && <div className="flex gap-4">
                        <button onClick={handleAddCard} className="font-heading flex-1 px-6 py-3 bg-blue-400 text-white font-semibold rounded hover:bg-blue-500 transition">
                            {loading ?
                                <div className='flex items-center'>
                                    ADDING...
                                    < Loader2 className="animate-spin" />
                                </div>
                                : 'ADD CARD'}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="font-heading flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-900 transition"
                        >
                            Cancel
                        </button>
                    </div>}
                    {cardAction === 'edit' && <div className="flex gap-4">
                        <button onClick={handleAddCard} className="font-heading flex-1 px-6 py-3 bg-blue-400 text-white font-semibold rounded hover:bg-blue-500 transition">
                            {loading ?
                                <div className='flex items-center'>
                                    UPDATING...
                                    < Loader2 className="animate-spin" />
                                </div>
                                : 'UPDATE CARD'}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="font-heading flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-900 transition"
                        >
                            Cancel
                        </button>
                    </div>}
                </div>
            </div>
        </>
    );
}