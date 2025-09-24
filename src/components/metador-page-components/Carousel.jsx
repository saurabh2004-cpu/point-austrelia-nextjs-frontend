import React, { useState, useEffect } from 'react';

const TrustedByCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const brands = [
    { id: 1, name: 'Choice - The Discount Store', logo: '/home-images/carousel-1.png', alt: 'Choice discount store logo' },
    { id: 2, name: 'Crazy Domains', logo: '/home-images/carousel-2.png', alt: 'Crazy Domains logo' },
    { id: 3, name: 'Discounts Galore', logo: '/home-images/carousel-1.png', alt: 'Discounts Galore logo' },
    { id: 4, name: 'Micash', logo: '/home-images/carousel-2.png', alt: 'Micash logo' },
    { id: 5, name: 'Brand 5', logo: '/home-images/carousel-1.png', alt: 'Brand 5 logo' },
    { id: 6, name: 'Brand 6', logo: '/home-images/carousel-2.png', alt: 'Brand 6 logo' },
    { id: 7, name: 'Brand 7', logo: '/home-images/carousel-1.png', alt: 'Brand 7 logo' },
    { id: 8, name: 'Brand 8', logo: '/home-images/carousel-2.png', alt: 'Brand 8 logo' },
    { id: 9, name: 'Brand 9', logo: '/home-images/carousel-2.png', alt: 'Brand 9 logo' },
    { id: 10, name: 'Brand 10', logo: '/home-images/carousel-2.png', alt: 'Brand 10 logo' },
  ];

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === brands.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [brands.length]);

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

  // Visible brands
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % brands.length;
      visible.push(brands[index]);
    }
    return visible;
  };

  const totalSlides = Math.ceil(brands.length / visibleCount);

  return (
    <div className="w-full bg-white py-8 sm:py-12 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Left decorative line */}
            <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

            {/* Title */}
            <h2 className="px-1 text-lg text-[24px] font-semibold text-[#2D2C70] whitespace-nowrap">
              Trusted By
            </h2>

            {/* Right decorative line */}
            <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>
          </div>
        </div>

        {/* Desktop/Tablet Carousel */}
        <div className="relative hidden sm:block overflow-hidden">
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-32 min-h-[80px] transition-transform duration-500">
            {getVisibleBrands().map((brand) => (
              <div key={`${brand.id}-${currentIndex}`} className="flex-shrink-0">
                <div className="w-[120px] h-[40px] sm:w-[140px] sm:h-[50px] lg:w-[170px] lg:h-[55px] flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={brand.alt}
                    className="max-w-full max-h-full object-contain hover:opacity-80 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
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
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="block sm:hidden mt-6">
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 w-[120px] h-[40px] flex items-center justify-center bg-gray-50 rounded-lg p-2"
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
