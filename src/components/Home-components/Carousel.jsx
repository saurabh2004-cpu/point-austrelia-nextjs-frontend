'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartPopupStateStore } from '@/zustand/cartPopupState';
import axiosInstance from '@/axios/axiosInstance';

const Carousel = () => {
  const [desktopCarouselImages, setDesktopCarouselImages] = useState([]);
  const [mobileCarouselImages, setMobileCarouselImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [error, setError] = useState(null);

  const { showCartPopup, setShowCartPopup } = useCartPopupStateStore();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Global click outside handler for cart popup
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCartPopup, setShowCartPopup]);

  // Fetch carousel images
  const FetchCarouselImages = async () => {
    try {
      const res = await axiosInstance.get('home-carousel/get-carousel');

      console.log("get carousel images", res);

      if (res.data.statusCode === 200) {
        const { desktopImages, mobileImages } = res.data.data;
        
        // Transform desktop images to match the expected format
        const formattedDesktopImages = desktopImages.map((url, index) => ({
          id: index + 1,
          src: url,
          alt: `Carousel Image ${index + 1}`,
        }));

        // Transform mobile images to match the expected format
        const formattedMobileImages = mobileImages.map((url, index) => ({
          id: index + 1,
          src: url,
          alt: `Carousel Image ${index + 1}`,
        }));

        setDesktopCarouselImages(formattedDesktopImages);
        setMobileCarouselImages(formattedMobileImages);
        
        // Enable auto-scrolling if there are multiple images
        setIsAutoScrolling(formattedDesktopImages.length > 1);
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching carousel images:", error);
    }
  };

  useEffect(() => {
    FetchCarouselImages();
  }, []);

  // Get current carousel images based on screen size
  const currentCarouselImages = isMobile ? mobileCarouselImages : desktopCarouselImages;

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || currentCarouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === currentCarouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, currentCarouselImages.length]);

  // Reset index when switching between mobile/desktop
  useEffect(() => {
    setCurrentIndex(0);
  }, [isMobile]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    if (currentCarouselImages.length > 1) {
      setIsAutoScrolling(false);
    }
  };

  const handleMouseLeave = () => {
    if (currentCarouselImages.length > 1) {
      setIsAutoScrolling(true);
    }
  };

  // Show loading or error state
  if (error) {
    return (
      <div className="w-full max-w-8xl mx-auto p-3 sm:p-4 md:py-4 xl:pb-12">
        <div className="text-center text-red-500">Error loading carousel: {error}</div>
      </div>
    );
  }

  if (currentCarouselImages.length === 0) {
    return (
      <div className="w-full max-w-8xl mx-auto p-3 sm:p-4 md:py-4 xl:pb-12">
        <div className="relative w-full overflow-hidden rounded-lg carousel-container bg-gray-200 animate-pulse" />
        <style jsx>{`
          .carousel-container {
            height: 12rem;
          }
          @media (min-width: 480px) {
            .carousel-container {
              height: 16rem;
            }
          }
          @media (min-width: 640px) {
            .carousel-container {
              height: 20rem;
            }
          }
          @media (min-width: 768px) {
            .carousel-container {
              height: 24rem;
            }
          }
          @media (min-width: 1024px) {
            .carousel-container {
              height: 28rem;
            }
          }
          @media (min-width: 1280px) {
            .carousel-container {
              height: 32rem;
            }
          }
          @media (min-width: 1536px) {
            .carousel-container {
              height: 36rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto p-3 sm:p-4 md:py-4 xl:pb-12">
      <div
        className="relative w-full overflow-hidden rounded-lg carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel Images Wrapper */}
        <div
          className={`flex transition-transform duration-[2000ms] ease-in-out h-full`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {currentCarouselImages.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 h-full"
              style={{ width: '100%', minWidth: '100%' }}
            >
              {/* Next/Image for better responsiveness */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                className="object-contain md:object-cover transition-transform duration-500"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Responsive adjustments */}
      <style jsx>{`
        .carousel-container {
          height: 12rem; /* default for small screens */
        }

        @media (min-width: 480px) {
          .carousel-container {
            height: 16rem; /* small tablets / large phones */
          }
        }

        @media (min-width: 640px) {
          .carousel-container {
            height: 20rem; /* tablets */
          }
        }

        @media (min-width: 768px) {
          .carousel-container {
            height: 24rem; /* iPad Mini / medium tablets */
          }
        }

        @media (min-width: 1024px) {
          .carousel-container {
            height: 28rem; /* laptops */
          }
        }

        @media (min-width: 1280px) {
          .carousel-container {
            height: 32rem; /* large desktop */
          }
        }

        @media (min-width: 1536px) {
          .carousel-container {
            height: 36rem; /* very large screens */
          }
        }
      `}</style>
    </div>
  );
};

export default Carousel;