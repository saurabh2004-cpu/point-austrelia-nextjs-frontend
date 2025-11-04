// components/Notification.jsx
"use client"

import { useEffect, useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'

const Notification = ({ message, type = 'success', isVisible, onHide }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onHide()
            }, 3000) // Auto hide after 3 seconds

            return () => clearTimeout(timer)
        }
    }, [isVisible, onHide])

    if (!isVisible) return null

    return (
        <div className={`
      fixed top-2 left-4 z-50 max-w-sm w-full
      transform transition-all duration-500 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
            <div className={`
        bg-white border-l-4 rounded-lg shadow-lg p-4
        ${type === 'success' ? 'border-green-500' : 'border-red-500'}
      `}>
                <div className="flex items-start">
                    <div className={`
            flex-shrink-0 p-1 rounded-full
            ${type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}
          `}>
                        {type === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <ShoppingCart className="w-5 h-5" />
                        )}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onHide}
                        className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Notification