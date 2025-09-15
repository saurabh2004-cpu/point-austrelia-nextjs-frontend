'use client'
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddressSelection = () => {
    const [selectedShippingAddress, setSelectedShippingAddress] = useState('shipping-1');
    const [selectedBillingAddress, setSelectedBillingAddress] = useState('billing-1');

    const shippingAddresses = [
        {
            id: 'shipping-1',
            name: 'Devendra Chandora',
            address: '2 Angoon Rd Spencer Park Western Australia 6330 Australia',
            phone: '7073737773'
        },
        {
            id: 'shipping-2',
            name: 'Devendra Chandora',
            address: '2 Angoon Rd Spencer Park Western Australia 6330 Australia',
            phone: '7073737773'
        }
    ];

    const billingAddresses = [
        {
            id: 'billing-1',
            name: 'Devendra Chandora',
            address: '2 Angoon Rd Spencer Park Western Australia 6330 Australia',
            phone: '7073737773'
        },
        {
            id: 'billing-2',
            name: 'Devendra Chandora',
            address: '2 Angoon Rd Spencer Park Western Australia 6330 Australia',
            phone: '7073737773'
        }
    ];

    const AddressCard = ({ address, isSelected, onSelect, type }) => (
        <div className={`border rounded-lg p-4 sm:p-6 mb-4 transition-all duration-200 ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 mt-1">
                    <div className="relative">
                        <input
                            type="radio"
                            id={address.id}
                            name={type}
                            checked={isSelected}
                            onChange={() => onSelect(address.id)}
                            className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
                        />
                        <div className={`absolute inset-0 rounded-full pointer-events-none ${isSelected ? 'border-2 border-pink-500' : 'border border-gray-300'
                            }`}></div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold  mb-1">
                        {address.name}
                    </h3>
                    <p className="text-[14px] font-medium mb-2 leading-relaxed">
                        {address.address}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        {address.phone}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button className="text-xs sm:text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors text-left">
                            Edit
                        </button>
                        <button className="text-xs sm:text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors text-left">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-8xl  mx-auto p-4 sm:p-6 lg:p-8 bg-white min-h-screen font-spartan">
            {/* Header */}
            <div className=" mx-auto text-[24px] py-4  relative top-5 mb-15  flex items-center justify-between border-b-3 border-[#2D2C70]">
                <h1 className="text-xl font-semibold text-gray-900 mb-4 ">
                    Shipping / Billing
                </h1>
            </div>
            {/* Shipping Address Section */}
            <div className="mb-8 sm:mb-12">
                <h2 className="text-[24px] sm:text-xl font-semibold text-gray-900 mb-2">
                    Select Shipping Address
                </h2>
                <p className="text-[20px] font-[500] mb-6">
                    Shipping Address ({shippingAddresses.length})
                </p>

                <div className="space-y-0">
                    {shippingAddresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedShippingAddress === address.id}
                            onSelect={setSelectedShippingAddress}
                            type="shipping"
                        />
                    ))}
                </div>

                <button className="flex items-center space-x-2 text-sm sm:text-base text-gray-700 font-medium hover:text-gray-900 transition-colors mt-4">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add a new shipping address</span>
                </button>
            </div>

            {/* Billing Address Section */}
            <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Select Billing Address
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Billing Address ({billingAddresses.length})
                </p>

                <div className="space-y-0">
                    {billingAddresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedBillingAddress === address.id}
                            onSelect={setSelectedBillingAddress}
                            type="billing"
                        />
                    ))}
                </div>

                <button className="flex items-center space-x-2 text-sm sm:text-base text-gray-700 font-medium hover:text-gray-900 transition-colors mt-4">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add a new billing address</span>
                </button>
            </div>
        </div>
    );
};

export default AddressSelection;