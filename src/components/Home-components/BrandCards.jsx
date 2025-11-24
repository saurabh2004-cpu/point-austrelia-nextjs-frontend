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

  // Handle outside click for cart popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartPopup = document.querySelector('[data-cart-popup]');
      const navbarCartButton = document.querySelector('[data-navbar-cart-button]');

      if (
        showCartPopup &&
        cartPopup &&
        !cartPopup.contains(event.target) &&
        (!navbarCartButton || !navbarCartButton.contains(event.target))
      ) {
        setShowCartPopup(false);
      }
    };

    if (showCartPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showCartPopup, setShowCartPopup]);

  // Fetch brands
  const getAllBrandPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("brand-page/get-all-brand-pages");

      if (res.data.statusCode === 200) {
        setBrands(res.data.data);
      } else {
        setError("Failed to fetch brand pages");
      }
    } catch (error) {
      console.error("Error fetching brand pages:", error.message);
      setError("Error loading brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBrandPages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full xl:max-w-5xl mx-auto p-4 sm:p-5 md:p-6 xl:py-6 overflow-x-hidden">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 justify-items-center">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-full max-w-xs h-36 sm:h-40 md:h-44 bg-gray-200 rounded-lg animate-pulse"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Loading...
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
      <div className="w-full xl:max-w-5xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={getAllBrandPages}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (brands.length === 0) {
    return (
      <div className="w-full xl:max-w-5xl mx-auto p-4 sm:p-6 text-center text-gray-500">
        <p>No brands available at the moment.</p>
      </div>
    );
  }

  // Brand grid
  return (
    <div className="w-full xl:max-w-5xl mx-auto px-4 sm:px-5 md:pt-6 xl:pt-6">
      <div
        className="
          grid 
          grid-cols-2
         lg:grid-cols-3
          gap-4 
          sm:gap-6 
          justify-items-center
        "
      >
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="w-full max-w-xs h-36 sm:h-40 md:h-44  overflow-hidden  duration-300 rounded-lg cursor-pointer group bg-white"
          >
            <div className="relative w-full h-full flex items-center justify-center ">
              <Image
                src={brand?.brandImages || "/fallback-image.jpg"}
                alt={brand?.brand?.name || "Brand Image"}
                fill
                className="
                  object-contain 
                  group-hover:scale-105 
                  transition-transform 
                  duration-300 
                  p-3
                 
                "
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                onError={(e) => {
                  e.target.src = "/fallback-image.jpg";
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
