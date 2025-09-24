import React, { useState } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import Image from 'next/image';

const ShoppingCartPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "KIDS HAIR EXTENSION 3 COLOUR WITH BUTTERFLY OR STAR 2PK",
      price: 4.48,
      quantity: 1,
      unit: "Each",
      inStock: true,
      image: "/cart/cart-popup-1.png"
    },
    {
      id: 2,
      name: "KIDS HAIR EXTENSION 3 COLOUR WITH BUTTERFLY OR STAR 2PK",
      price: 4.48,
      quantity: 1,
      unit: "Each",
      inStock: true,
      image: "/cart/cart-popup-1.png"
    },
    {
      id: 3,
      name: "KIDS HAIR EXTENSION 3 COLOUR WITH BUTTERFLY OR STAR 2PK",
      price: 4.48,
      quantity: 1,
      unit: "Each",
      inStock: true,
      image: "/cart/cart-popup-1.png"
    },
    {
      id: 4,
      name: "KIDS HAIR EXTENSION 3 COLOUR WITH BUTTERFLY OR STAR 2PK",
      price: 4.48,
      quantity: 1,
      unit: "Each",
      inStock: true,
      image: "/cart/cart-popup-1.png"
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="absolute  inset-0 top-20 bg-transparent bg-opacity-50 flex xl:items-center lg:justify-end p-4 z-50">
      <div className="
        bg-white rounded-lg shadow-xl w-full 
        max-w-[30.1875rem] md:max-w-[36rem] lg:max-w-[30.1875rem]
        max-h-[90vh] overflow-hidden border border-gray-300
      ">
        {/* Header */}
        <div className="flex flex-col items-center justify-between px-4">
          <div className="w-full flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto hide-scrollbar max-h-110">
            {cartItems.map((item) => (
              <div key={item.id} className="px-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 mb-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0 flex justify-center sm:justify-start mb-3 sm:mb-0">
                    <Image src={item.image} alt="Product" width={96} height={96} />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-[14px] font-medium line-clamp-2 hover:text-[#E9098D]">
                      {item.name}
                    </h3>

                    {/* Price + Stock */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[#E9098D] font-semibold text-[20px] sm:text-[24px]">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.inStock && (
                        <div className="flex items-center text-xs font-semibold text-black px-2 py-1 bg-[#E7FAEF] rounded">
                          <Check className="w-3 h-3 mr-1" />
                          IN STOCK
                        </div>
                      )}
                    </div>

                    {/* Quantity + Units */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      {/* Quantity Control */}
                      <div>
                        <span className="block text-xs font-medium mb-1">Quantity</span>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-black rounded-md px-2"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span className="px-3 py-1 min-w-[2rem] text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-black rounded-md px-2"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Units Select */}
                      <div className="w-full sm:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                        <div className="relative">
                          <select className="w-full border border-gray-200 appearance-none rounded-md pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring focus:ring-[#2d2c70]">
                            <option value="each">Pack Of 6</option>
                            <option value="pack">Pack Of 12</option>
                            <option value="box">Carton of 60</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50">
          {/* Summary */}
          <div className="flex items-center text-[15px] font-medium justify-between mb-4 px-4 pt-4">
            <span>({totalItems} Items)</span>
            <span>Subtotal: ${subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-gray-200 h-[0.7px] w-full"></div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 text-[15px] font-medium p-4">
            <button className="flex-1 bg-[#2D2C70] hover:bg-[#46BCF9] text-white py-2 rounded-full transition-colors">
              View Cart
            </button>
            <button className="flex-1 bg-[#46BCF9] hover:bg-[#2D2C70] text-white py-2 rounded-full transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPopup;
