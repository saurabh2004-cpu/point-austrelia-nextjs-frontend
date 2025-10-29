'use client'
import axiosInstance from '@/axios/axiosInstance';
import useBrandStore from '@/zustand/BrandPage';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const TrustedByCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const brandPage = useBrandStore((state) => state.brandPage);
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    if (brandPage?.carouselImages) {
      setCarouselImages(brandPage.carouselImages);
    }
  }, [brandPage]);


  // Auto-scroll
  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Get logos count based on screen width
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1; // Mobile
    if (window.innerWidth < 768) return 2; // Small Tablet
    if (window.innerWidth < 1024) return 3; // Tablet
    return 4; // Desktop
  };

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Visible images
  const getVisibleImages = () => {
    if (carouselImages.length === 0) return [];

    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % carouselImages.length;
      visible.push({
        id: index,
        image: carouselImages[index],
        alt: `Carousel image ${index + 1}`
      });
    }
    return visible;
  };

  const totalSlides = carouselImages.length > 0 ? Math.ceil(carouselImages.length / visibleCount) : 0;

  return (
    <div className="w-full bg-white py-8 sm:py-12 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Left decorative line */}
            <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

            {/* Title */}
            <h2 className={`px-1 text-lg text-[24px] font-semibold text-[${brandPage?.trustedByHeadingTextColor}] whitespace-nowrap`}>
              {brandPage?.trustedByHeadingText || 'Trusted by'}
            </h2>

            {/* Right decorative line */}
            <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>
          </div>
        </div>

        {/* Desktop/Tablet Carousel */}
        <div className="relative hidden sm:block overflow-hidden">
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-32 min-h-[80px] transition-transform duration-500">
            {getVisibleImages().map((item) => (
              <div key={`${item.id}-${currentIndex}`} className="flex-shrink-0">
                <div className="w-[120px] h-[40px] sm:w-[140px] sm:h-[50px] lg:w-[170px] lg:h-[55px] flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="max-w-full max-h-full object-contain hover:opacity-80 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dots - Only show if there are images */}
          {carouselImages.length > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleCount)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${Math.floor(currentIndex / visibleCount) === index
                    ? 'bg-pink-500 scale-110'
                    : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="block sm:hidden mt-6">
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[120px] h-[40px] flex items-center justify-center bg-gray-50 rounded-lg p-2"
              >
                <img
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TrustedByCarousel;