'use client'
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
// import useBrandStore from '@/zustand/BrandPAge';
import useBrandStore from '@/zustand/BrandPage';
import Link from 'next/link';

const BrandsGrid = () => {
    const brandPage = useBrandStore((state) => state.brandPage);
    const [openQuestionIndex, setOpenQuestionIndex] = useState(null);


    return (
        <div className="w-full bg-gray-50 py-8 sm:py-12 px-4 lg:px-0 lg:py-8  ">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

                        {/* Title */}
                        <h2 className={`px-1 text-lg text-[24px] font-semibold text-[${brandPage?.brandHeadingTextColor}] whitespace-nowrap`}>
                            {brandPage?.brandHeadingText}
                        </h2>

                        {/* Right decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>
                    </div>
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 max-w-8xl mx-auto xl:px-16">
                    {brandPage?.brands?.map((brand, index) => (
                        <div key={brand._id} className="bg-lime-500 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                            <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                                <Link href={brand?.brandUrl || '/'} className="flex-1 relative bg-white">
                                    <img
                                        src={brand.brandImage}
                                        alt={brand.brandUrl || "Brand image"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Why Choose Matador Wholesale Section */}
                <div
                    className={`w-full h-full lg:h-auto flex flex-col mx-auto w-full sm:p-8 lg:py-12 text-white`}
                    style={{ backgroundColor: brandPage?.QnaSectionBgColor || '#2D2C70' }}
                >
                    <h3
                        className={`text-[20px] font-semibold mb-6 sm:mb-8 p-4 lg:p-0 lg:px-58`}
                        style={{ color: brandPage?.QnaHeadingTextColor || '#ffffff' }}
                    >
                        {brandPage?.QnaHeadingText?.endsWith('?') ? brandPage?.QnaHeadingText : (brandPage?.QnaHeadingText || '') + '?'}
                    </h3>

                    <div className="space-y-2 sm:space-y-4 p-4">
                        {brandPage?.questions?.map((question, index) => (
                            <div key={index} className="xl:px-54  pb-4 last:border-b-0">
                                {/* Question - Clickable */}
                                <div
                                    className="flex items-start space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setOpenQuestionIndex(openQuestionIndex === index ? null : index)}
                                >
                                    <div className='flex'>
                                        <ChevronRight
                                            className={`w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-1 transition-transform duration-300 ${openQuestionIndex === index ? 'rotate-90' : ''
                                                }`}
                                        />
                                    </div>
                                    <p className="text-base font-semibold leading-relaxed flex-1">
                                        {question}
                                    </p>
                                </div>

                                {/* Answer - Conditionally rendered */}
                                {openQuestionIndex === index && (
                                    <div className="ml-6 mt-3 transition-all duration-300 animate-fadeIn">
                                        <p className="text-sm leading-relaxed opacity-90">
                                            {brandPage?.answers?.[index]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandsGrid;