'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCartPopupStateStore } from "@/zustand/cartPopupState";
import axiosInstance from "@/axios/axiosInstance";

const BrandCards = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showCartPopup, setShowCartPopup } = useCartPopupStateStore();

  // Global click outside handler for cart popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartPopup = document.querySelector('[data-cart-popup]');
      const navbarCartButton = document.querySelector('[data-navbar-cart-button]');

      if (showCartPopup &&
        cartPopup &&
        !cartPopup.contains(event.target) &&
        (!navbarCartButton || !navbarCartButton.contains(event.target))) {
        setShowCartPopup(false);
      }
    };

    if (showCartPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCartPopup, setShowCartPopup]);

  const getAllBrandPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axiosInstance.get('brand-page/get-all-brand-pages');

      if (res.data.statusCode === 200) {
        console.log("brand pages response ", res);
        setBrands(res.data.data);
      } else {
        setError('Failed to fetch brand pages');
      }
    } catch (error) {
      console.error('Error fetching brand pages:', error.message);
      setError('Error loading brands. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllBrandPages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full xl:max-w-5xl mx-auto p-4 xl:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-full max-w-xs h-36 md:h-40 bg-gray-200 rounded-lg animate-pulse"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full xl:max-w-5xl mx-auto p-4 xl:py-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={getAllBrandPages}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (brands.length === 0) {
    return (
      <div className="w-full xl:max-w-5xl mx-auto p-4 xl:py-6">
        <div className="text-center text-gray-500">
          <p>No brands available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:max-w-5xl mx-auto p-4 xl:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="w-full max-w-xs h-36 md:h-40 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-lg cursor-pointer group"
          >
            <div className="relative w-full h-full">
              <Image
                src={brand?.brandImages || '/fallback-image.jpg'}
                alt={brand?.brand?.name || 'Brand Image'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = '/fallback-image.jpg';
                }}
              />
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCards;