import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import useUserStore from '@/zustand/user';

export default function CreditCardPopup(
    isOpen,
    setIsOpen,
    latestSalesOrderDocumentNumber
) {
    const currentUser = useUserStore((state) => state.user);

    const [cardDetails, setCardDetails] = useState({
        nameOnCard: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    });

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

    const handleAddCard = async () => {
        try {
            const response = await axios.post('card/add-new-card', {
                FirstName: currentUser.customerName,
                LastName: currentUser.customerName.split(' ')[1] || '',
                Email: currentUser?.customerEmail,
                Phone: currentUser?.CustomerPhoneNo,
                Name: cardDetails.nameOnCard,
                cardNumber: cardDetails.cardNumber,
                ExpiryMonth: cardDetails.expiryMonth,
                ExpiryYear: cardDetails.expiryYear,
                CVN: cardDetails.cvv,
                TotalAmount: 1000,
                InvoiceReference: latestSalesOrderDocumentNumber,
            });

            console.log('Card added successfully:', response.data);
        } catch (error) {
            console.error('Error adding card:', error);
        }
    }

    return (
        <div className="fixed inset-0 lg:z-20 bg-[#000000]/10 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-8 text-gray-800">ADD CREDIT CARD</h2>

                {/* Credit Card Number */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Credit card number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        placeholder="Enter card number"
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    />
                    {/* Card Brand Icons */}
                    <div className="flex gap-2 mt-3">
                        <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="h-6" />
                        <img src="https://via.placeholder.com/40x25?text=VISA" alt="Visa" className="h-6" />
                    </div>
                </div>

                {/* Expiration Date */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name on card <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={cardDetails.nameOnCard}
                        onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                        placeholder="Enter cardholder name"
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    />
                </div>

                {/* Checkboxes */}
                <div className="mb-8 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Make this my default credit card</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            // checked={saveCard}
                            // onChange={(e) => setSaveCard(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Save this credit card for future purchases</span>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button onClick={handleAddCard} className="flex-1 px-6 py-3 bg-blue-400 text-white font-semibold rounded hover:bg-blue-500 transition">
                        ADD CARD
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-900 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}