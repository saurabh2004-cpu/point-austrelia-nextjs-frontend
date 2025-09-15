import React, { useState, useEffect } from 'react';

const TrustedByCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const brands = [
    {
      id: 1,
      name: 'Choice - The Discount Store',
      logo: '/home-images/carousel-1.png',
      alt: 'Choice discount store logo'
    },
    {
      id: 2,
      name: 'Crazy Domains',
      logo: '/home-images/carousel-2.png',
      alt: 'Crazy Domains logo'
    },
    {
      id: 3,
      name: 'Discounts Galore',
      logo: '/home-images/carousel-1.png',
      alt: 'Discounts Galore logo'
    },
    {
      id: 4,
      name: 'Micash',
      logo: '/home-images/carousel-2.png',
      alt: 'Micash logo'
    },
    {
      id: 5,
      name: 'Brand 5',
      logo: '/home-images/carousel-1.png',
      alt: 'Brand 5 logo'
    },
    {
      id: 6,
      name: 'Brand 6',
      logo: '/home-images/carousel-2.png',
      alt: 'Brand 6 logo'
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === brands.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [brands.length]);

  // Calculate how many logos to show based on screen size
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1; // Mobile: 1 logo
    if (window.innerWidth < 768) return 2; // Small tablet: 2 logos
    if (window.innerWidth < 1024) return 3; // Tablet: 3 logos
    return 4; // Desktop: 4 logos
  };

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get visible brands for current slide
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % brands.length;
      visible.push(brands[index]);
    }
    return visible;
  };

  // Handle dot click
  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  // Calculate total slides
  const totalSlides = Math.ceil(brands.length / visibleCount);

  return (
    <div className="w-full h-[70vh] bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4">
            {/* Left decorative line */}
            <div className="flex-1 h-px bg-gray-400 max-w-32 sm:max-w-10 lg:max-w-18"></div>
            
            {/* Title */}
            <h2 className="px-4 sm:px-6 lg:px-8 text-lg sm:text-xl lg:text-2xl font-medium text-gray-700 whitespace-nowrap">
              Trusted By
            </h2>
            
            {/* Right decorative line */}
            <div className="flex-1 h-px bg-gray-400 max-w-32 sm:max-w-10 lg:max-w-18"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {/* Brands Container */}
          <div className="flex justify-between items-center space-x-4 sm:space-x-6 lg:space-x-8 min-h-[80px]">
            {getVisibleBrands().map((brand) => (
              <div
                key={`${brand.id}-${currentIndex}`}
                className="flex-shrink-0 transition-all duration-500 ease-in-out"
              >
                <div className="w-[130px] h-[43px] sm:w-[150px] sm:h-[50px] lg:w-[173px] lg:h-[57px] flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={brand.alt}
                    className="max-w-full max-h-full object-contain transition-opacity duration-500 hover:opacity-80"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center space-x-2 mt-8 sm:mt-10 lg:mt-32">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / visibleCount) === index
                  ? 'bg-pink-500 w-2 h-2 sm:w-2 sm:h-2'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Alternative: Show all brands in a scrollable container on mobile */}
        <div className="block sm:hidden mt-8">
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 w-[130px] h-[43px] flex items-center justify-center bg-gray-50 rounded-lg p-2"
              >
                <img
                  src={brand.logo}
                  alt={brand.alt}
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