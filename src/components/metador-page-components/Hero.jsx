"use client";
import axiosInstance from "@/axios/axiosInstance";
import useBrandStore from "@/zustand/BrandPage";
import Image from "next/image";
import { useParams } from "next/navigation"
import { set } from "nprogress";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const brandPage = useBrandStore((state) => state.brandPage);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const params = useParams();
  const slug = params.slug
  const setBrandPage = useBrandStore((state) => state.setBrandPage);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!brandPage?.heroCarouselImages?.length) return;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === brandPage.heroCarouselImages.length - 1 ? 0 : prev + 1
        );
      }, 4000); // Change slide every 4 seconds
    };

    startAutoScroll();
    setIsAutoScrolling(true);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [brandPage?.heroCarouselImages]);

  // Reset auto-scroll when user interacts
  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsAutoScrolling(false);
    // Restart auto-scroll after manual interaction
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === brandPage.heroCarouselImages.length - 1 ? 0 : prev + 1
        );
      }, 4000);
      setIsAutoScrolling(true);
    }, 8000); // Wait 8 seconds before restarting auto-scroll
  };

  const goToNextSlide = () => {
    handleSlideChange(
      currentSlide === brandPage.heroCarouselImages.length - 1 ? 0 : currentSlide + 1
    );
  };

  const goToPrevSlide = () => {
    handleSlideChange(
      currentSlide === 0 ? brandPage.heroCarouselImages.length - 1 : currentSlide - 1
    );
  };

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    if (brandPage?.heroCarouselImages?.length > 1 && isAutoScrolling) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (brandPage?.heroCarouselImages?.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === brandPage.heroCarouselImages.length - 1 ? 0 : prev + 1
        );
      }, 4000);
    }
  };

  const fetchBrandPageBySlug = async (slug, setBrandPage) => {
    try {
      const response = await axiosInstance.get(`brand-page/get-brand-page-by-brand-slug/${slug}`);

      console.log("brand page by brand slug ", response)

      if (response.data.statusCode === 200) {
        setBrandPage(response.data.data);
      } else {
        setBrandPage(null);
      }
    } catch (error) {
      console.error("Error fetching brand page:", error);
    }
  }

  useEffect(() => {
    if (slug) {
      fetchBrandPageBySlug(slug, setBrandPage);
    }
  }, [slug]);

  // Loading state
  if (!brandPage) {
    return (
      <div className="h-full mx-auto pb-0 pt-8 font-body">
        <div className="flex px-4 w-full lg:w-6xl mx-auto flex-col lg:flex-row items-center gap-6 lg:gap-6">
          <div className="flex-shrink-0 w-64 h-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // No carousel images state
  if (!brandPage?.heroCarouselImages?.length) {
    return (
      <div className="h-full mx-auto pb-0 pt-8 ">
        {/* Top Section */}
        <div className="flex px-4 w-full lg:w-6xl mx-auto flex-col lg:flex-row items-center gap-6 lg:gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={brandPage?.brandImages}
              alt="Brand Logo"
              width={308}
              height={147}
              className="object-contain"
            />
          </div>

          {/* Heading + Description */}
          <div className="flex-1">
            <h2
              className="text-xl sm:text-2xl font-semibold lg:mb-2 font-heading"
              style={{ color: brandPage?.brandTitleColor || '#2D2C70' }}
            >
              {brandPage?.brandTitle}
            </h2>
            <p
              className="text-[18px] font-medium tracking-relaxed font-body"
              style={{ color: brandPage?.brandDescriptionColor || '#000000' }}
            >
              {brandPage?.brandDescription || ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full mx-auto pb-0 pt-8 ">
      {/* Top Section */}
      <div className="flex px-4 w-full lg:w-6xl mx-auto flex-col lg:flex-row items-center gap-6 lg:gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={brandPage?.brandImages}
            alt="Brand Logo"
            width={308}
            height={147}
            className="object-contain"
          />
        </div>

        {/* Heading + Description */}
        <div className="flex-1">
          <h2
            className="text-xl sm:text-2xl font-semibold lg:mb-2"
            style={{ color: brandPage?.brandTitleColor || '#2D2C70' }}
          >
            {brandPage?.brandTitle}
          </h2>
          <p
            className="text-[18px] font-medium tracking-relaxed"
            style={{ color: brandPage?.brandDescriptionColor || '#000000' }}
          >
            {brandPage?.brandDescription || ''}
          </p>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative w-full mt-16">
        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="relative overflow-hidden carousel-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {brandPage.heroCarouselImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative h-full" style={{ minWidth: '100%' }}>
                <img
                  src={image}
                  alt={`Hero image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {brandPage.heroCarouselImages.length > 1 && (
          <>
            <button
              onClick={goToPrevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous image"
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
            </button>

            <button
              onClick={goToNextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next image"
            >
              <ChevronRight size={isMobile ? 20 : 24} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {brandPage.heroCarouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {brandPage.heroCarouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Responsive height adjustments */}
      <style jsx>{`
        .carousel-container {
          height: 7.5rem; /* Mobile devices (320px+) */
        }
        
        
        @media (min-width: 412px) {
          .carousel-container {
            height: 5rem; /* Large phones */
          }
        }
        

        @media (min-width: 480px) {
          .carousel-container {
            height: 16rem; /* Large phones */
          }
        }

        @media (min-width: 40px) {
          .carousel-container {
            height: 10rem; /* Large phones */
          }
        }

        @media (min-width: 640px) {
          .carousel-container {
            height: 20rem; /* Small tablets */
          }
        }

        @media (min-width: 768px) {
          .carousel-container {
            height: 15rem; /* Tablets (iPad Mini, etc.) */
          }
        }

        @media (min-width: 1024px) {
          .carousel-container {
            height: 20rem; /* Landscape tablets & small laptops */
          }
        }
        @media (min-width: 1087px) {
          .carousel-container {
            height: 25rem; /* Landscape tablets & small laptops */
          }
        }

        @media (min-width: 1280px) {
          .carousel-container {
            height: 25rem; /* Desktop monitors (1280px+) */
          }
        }

        @media (min-width: 1344px) {
          .carousel-container {
            height: 27rem; /* Desktop monitors (1280px+) */
          }
        }

        @media (min-width: 1536px) {
          .carousel-container {
            height: 30rem; /* Large desktop monitors (2K) */
          }
        }

        @media (min-width: 1920px) {
          .carousel-container {
            height: 40rem; /* Full HD and larger monitors */
          }
        }
      `}</style>
    </div>
  );
}