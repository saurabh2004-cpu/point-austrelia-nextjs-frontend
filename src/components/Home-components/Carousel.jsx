import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const Carousel = () => {
  // Array of carousel images - add more images here to see auto-scroll
  const carouselImages = [
    {
      id: 1,
      src: "/home-images/carousel-img.avif", // Replace with your actual image path
      alt: "Brands Showcase - Matador Wholesale, Asra Aromas, Point Accessories"
    },
    {
      id: 2,
      src: "/home-images/carousel-img.avif", // Replace with your actual image path
      alt: "Brands Showcase - Matador Wholesale, Asra Aromas, Point Accessories"
    }
   
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(carouselImages.length > 1);

  useEffect(() => {
    // Only auto-scroll if there are multiple images
    if (!isAutoScrolling || carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, carouselImages.length]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    if (carouselImages.length > 1) {
      setIsAutoScrolling(false);
    }
  };

  // Resume auto-scroll when mouse leaves
  const handleMouseLeave = () => {
    if (carouselImages.length > 1) {
      setIsAutoScrolling(true);
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto p-4 md:py-4 xl:pb-12">
      <div 
        className="relative w-full overflow-hidden rounded-lg  "
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // style={{
        //   height: '40rem' // Adjust height based on your image proportions
        // }}
      >
        {/* Carousel Container */}
        <div 
          className={`flex transition-transform duration-2000 ease-in-out h-full ${
            carouselImages.length === 1 ? '' : 'animate-none'
          }`}
          style={{
            transform: `translateX(-${currentIndex * (100)/ carouselImages.length}%)`,
            width: `${carouselImages.length * 100}%`
          }}
        >
          {carouselImages.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 w-full h-full"
              style={{ width: `${100 / carouselImages.length}%` }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className='h-[80%]'
                // className="object-contain" // Use object-contain to maintain aspect ratio
                // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                priority={image.id === 1} // Prioritize loading the first image
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots - Only show if multiple images */}
        {/* {carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )} */}

        
      </div>

      {/* Responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          .carousel-container {
            height: 15rem; /* Smaller height on mobile */
          }
        }
        
        @media (max-width: 480px) {
          .carousel-container {
            height: 12rem; /* Even smaller on very small screens */
          }
        }
      `}</style>
    </div>
  );
};

export default Carousel;