"use client";
import axiosInstance from "@/axios/axiosInstance";
import useBrandStore from "@/zustand/BrandPage";
import Image from "next/image";
import { useParams } from "next/navigation"
import { set } from "nprogress";
import { useEffect, useState, useRef } from "react";

export default function HeroSection() {
  const brandPage = useBrandStore((state) => state.brandPage);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const params = useParams();
  const slug = params.slug
  const setBrandPage = useBrandStore((state) => state.setBrandPage);

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
    // Restart auto-scroll after manual interaction
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === brandPage.heroCarouselImages.length - 1 ? 0 : prev + 1
        );
      }, 4000);
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
      <div className="h-full mx-auto pb-0 pt-8 font-spartan">
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
      <div className="h-full mx-auto pb-0 pt-8 font-spartan">
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
      </div>
    );
  }

  return (
    <div className="h-full mx-auto pb-0 pt-8 font-spartan">
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
          className="relative overflow-hidden"
        >
          <div className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {brandPage.heroCarouselImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img
                  src={image}
                  alt={`Hero image ${index + 1}`}
                  width={1920}
                  height={472}
                  className="w-full h-[250px] sm:h-[350px] lg:h-[472px] object-cover"
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hidden sm:block"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hidden sm:block"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {brandPage.heroCarouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {brandPage.heroCarouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/80'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}