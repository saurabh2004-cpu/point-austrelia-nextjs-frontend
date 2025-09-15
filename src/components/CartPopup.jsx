import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, Check } from 'lucide-react';
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-1 left-150 top-10 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[30.1875rem] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 ">
          <h2 className="text-lg font-semibold text-gray-800"></h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto hide-scrollbar max-h-96">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-100">
              {/* Product Info */}
              <div className="flex items-start space-x-8 mb-3">
                <div className="  rounded-lg flex items-center justify-center flex-shrink-0">
                  {/* Placeholder for hair extension product */}
                  <div className="flex space-x-1 lg:mt-6">
                    <Image src={item.image} alt="Product" width={96} height={96} />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-6 ">
                  <h3 className="text-[14px] font-medium line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-30 mb-2">
                    <span className="text-[#E9098D] font-semibold text-[20px]">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.inStock && (
                      <div className="flex items-center text-[10px] font-medium text-black p-2 rounded-full text-[10px] bg-[#E7FAEF]">
                        <Check className="w-3 h-3 mr-1" />
                        IN STOCK
                      </div>
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className="flex items-start space-x-2 space-y-2 flex-col">
                      <span className="text-sm font-medium ">Quantity</span>
                      <div className="flex items-center  rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-black rounded-md py-1 px-2  transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="px-3 py-1 min-w-[2rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-black rounded-md py-1 px-2 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white " />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-col items-start space-x-2 space-y-2 ">
                      <span className="text-[13px] font-medium ">Units</span>
                      <select className="border rounded-lg border-gray-300 rounded px-12 py-1 text-sm bg-white">
                        <option value="Each">{item.unit}</option>
                      </select>
                    </div>

                  </div>


                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center rounded-full space-x-2 bg-[#2D2C70] text-[13px] text-white px-4 py-2  text-sm font-medium transition-colors"
                  >
                    <span>Remove from cart</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {/* Summary */}
          <div className="flex items-center text-[15px] font-medium justify-between mb-4">
            <span className=" ">
              ({totalItems} Items)
            </span>
            <span className=" ">
              Subtotal: ${subtotal.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 text-[15px] font-medium">
            <button className="flex-1 bg-[#E9098D]  text-white py-2 rounded-full  transition-colors">
              View Cart
            </button>
            <button className="flex-1 bg-[#46BCF9]  text-white py-2 rounded-full  transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPopup;