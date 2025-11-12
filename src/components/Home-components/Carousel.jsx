'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartPopupStateStore } from '@/zustand/cartPopupState';

const Carousel = () => {
  // Array of carousel images
  const carouselImages = [
    {
      id: 1,
      src: '/home-images/carousel-img.avif',
      alt: 'Brands Showcase - Matador Wholesale, Asra Aromas, Point Accessories',
    },
    {
      id: 2,
      src: '/home-images/carousel-img.avif',
      alt: 'Brands Showcase - Matador Wholesale, Asra Aromas, Point Accessories',
    },
  ];

  const { showCartPopup, setShowCartPopup } = useCartPopupStateStore();

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(carouselImages.length > 1);

  useEffect(() => {
    if (!isAutoScrolling || carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, carouselImages.length]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    if (carouselImages.length > 1) {
      setIsAutoScrolling(false);
    }
  };

  const handleMouseLeave = () => {
    if (carouselImages.length > 1) {
      setIsAutoScrolling(true);
    }
  };

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
            transform: `translateX(-${currentIndex * 50}%)`,
            width: `${carouselImages.length * 100}%`,
          }}
        >
          {carouselImages.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 w-full h-full"
              style={{ width: `${100 / carouselImages.length}%` }}
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
