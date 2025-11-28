'use client'
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import useBrandStore from '@/zustand/BrandPage';
import Link from 'next/link';

const BrandsGrid = () => {
    const brandPage = useBrandStore((state) => state.brandPage);
    const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

    // Loading state
    if (!brandPage) {
        return (
            <div className="w-full bg-gray-50 py-8 sm:py-12 px-4 lg:px-0 lg:py-8 font-body">
                <div className="max-w-8xl mx-auto">
                    {/* Loading skeleton for header */}
                    <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex-1 h-[2px] bg-gray-300 max-w-12"></div>
                            <div className="px-4 h-8 bg-gray-300 rounded animate-pulse w-48"></div>
                            <div className="flex-1 h-[2px] bg-gray-300 max-w-12"></div>
                        </div>
                    </div>
                    
                    {/* Loading skeleton for brands grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 max-w-8xl mx-auto xl:px-16">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-gray-300 rounded-xl overflow-hidden shadow-lg h-48 animate-pulse">
                                <div className="w-full h-full bg-gray-400"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Loading skeleton for Q&A section */}
                    <div className="w-full bg-gray-300 h-64 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:w-6xl mx-auto bg-gray-50 py-8 sm:py-12 px-4 lg:px-0 lg:py-8 font-body">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div 
                            className="flex-1 h-[2px] max-w-12"
                            style={{ backgroundColor: brandPage?.brandHeadingTextColor || '#00000050' }}
                        ></div>

                        {/* Title */}
                        <h2 
                            className="px-4 text-lg sm:text-xl lg:text-2xl font-semibold whitespace-nowrap font-heading"
                            style={{ color: brandPage?.brandHeadingTextColor || '#000000' }}
                        >
                            {brandPage?.brandHeadingText || 'Our Brands'}
                        </h2>

                        {/* Right decorative line */}
                        <div 
                            className="flex-1 h-[2px] max-w-12"
                            style={{ backgroundColor: brandPage?.brandHeadingTextColor || '#00000050' }}
                        ></div>
                    </div>

                    {/* Brand Heading Description */}
                    {brandPage?.brandHeadingDescription && (
                        <p 
                            className="text-base mt-4 max-w-4xl mx-auto"
                            style={{ color: brandPage?.brandHeadingDescriptionColor || '#6e6e6e' }}
                        >
                            {brandPage.brandHeadingDescription}
                        </p>
                    )}
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 max-w-8xl mx-auto ">
                    {brandPage?.brands && brandPage.brands.length > 0 ? (
                        brandPage.brands.map((brand, index) => (
                            <div 
                                key={brand._id || index} 
                                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white"
                            >
                                <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                                    <Link 
                                        href={brand?.brandUrl || '/'} 
                                        className="flex-1 relative bg-white block"
                                    >
                                        <img
                                            src={brand.brandImage}
                                            alt={brand.brandUrl || "Brand image"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.target.src = '/fallback-brand-image.jpg';
                                                e.target.className = 'w-full h-full object-contain bg-gray-100 p-4';
                                            }}
                                        />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No brands available</p>
                        </div>
                    )}
                </div>

                {/* Why Choose Section */}
                <div
                    className="w-full h-full lg:h-auto flex flex-col mx-auto w-full sm:p-8 lg:py-12 text-white rounded-lg"
                    style={{ backgroundColor: brandPage?.QnaSectionBgColor || '#2D2C70' }}
                >
                    <h3
                        className="text-xl font-heading sm:text-2xl font-semibold mb-6 sm:mb-8 px-4 lg:px-16"
                        style={{ color: brandPage?.QnaHeadingTextColor || '#ffffff' }}
                    >
                        {brandPage?.QnaHeadingText?.endsWith('?') 
                            ? brandPage.QnaHeadingText 
                            : (brandPage?.QnaHeadingText || 'Why Choose Us?')}
                    </h3>

                    <div className="space-y-2 sm:space-y-4 px-4 lg:px-16">
                        {brandPage?.questions && brandPage.questions.length > 0 ? (
                            brandPage.questions.map((question, index) => (
                                <div key={index} className="border-b border-white/20 pb-4 last:border-b-0">
                                    {/* Question - Clickable */}
                                    <div
                                        className="flex items-start space-x-3 cursor-pointer hover:opacity-80 transition-opacity group"
                                        onClick={() => setOpenQuestionIndex(openQuestionIndex === index ? null : index)}
                                    >
                                        <ChevronRight
                                            className={`w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110 ${
                                                openQuestionIndex === index ? 'rotate-90' : ''
                                            }`}
                                        />
                                        <p 
                                            className="font-heading text-base sm:text-lg font-semibold leading-relaxed flex-1"
                                            style={{ color: brandPage?.QnaHeadingTextColor || '#ffffff' }}
                                        >
                                            {question}
                                        </p>
                                    </div>

                                    {/* Answer - Conditionally rendered */}
                                    {openQuestionIndex === index && (
                                        <div className="ml-8 mt-3 transition-all duration-300 animate-fadeIn">
                                            <p 
                                                className="text-sm sm:text-base leading-relaxed opacity-90"
                                                style={{ color: brandPage?.QnaHeadingTextColor || '#ffffff' }}
                                            >
                                                {brandPage?.answers?.[index] || 'No answer available.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="opacity-80">No questions available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandsGrid;