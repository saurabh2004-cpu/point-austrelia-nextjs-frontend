'use client';
import useBrandStore from '@/zustand/BrandPage';
import Image from 'next/image';
import React, { useEffect } from 'react';

const CategoriesGrid = () => {
    const [categories, setCategories] = React.useState([]);
    const brandPage = useBrandStore((state) => state.brandPage);

    useEffect(() => {
        if (brandPage) {
            setCategories(brandPage.categories);
        }
    }, [brandPage]);

    // Loading state
    if (!brandPage) {
        return (
            <div className="w-full bg-white py-8 sm:py-12 lg:py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-8xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex-1 h-[2px] bg-gray-300 max-w-12"></div>
                            <h2 className="px-4 text-lg text-2xl text-gray-400 font-semibold animate-pulse">
                                Loading...
                            </h2>
                            <div className="flex-1 h-[2px] bg-gray-300 max-w-12"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-square">
                                    <div className="h-full w-full bg-gray-300"></div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gray-400 py-3 text-center">
                                        <div className="h-4 bg-gray-300 mx-4 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:w-6xl mx-auto bg-white py-8 sm:py-12 lg:py-8 px-4 sm:px-6 lg:px-4">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div 
                            className="flex-1 h-[2px] max-w-12"
                            style={{ backgroundColor: brandPage?.categoryHeadingTextColor || '#00000050' }}
                        ></div>

                        {/* Title */}
                        <h2 
                            className="px-4 text-lg sm:text-xl lg:text-2xl font-semibold"
                            style={{ color: brandPage?.categoryHeadingTextColor || '#000000' }}
                        >
                            {brandPage?.categoryHeadingText || 'OUR CATEGORIES'}
                        </h2>

                        {/* Right decorative line */}
                        <div 
                            className="flex-1 h-[2px] max-w-12"
                            style={{ backgroundColor: brandPage?.categoryHeadingTextColor || '#00000050' }}
                        ></div>
                    </div>

                    {brandPage?.categoryDescription && (
                        <p 
                            className="text-base sm:text-lg mt-2"
                            style={{ color: brandPage?.categoryDescriptionColor || '#6e6e6e' }}
                        >
                            {brandPage.categoryDescription}
                        </p>
                    )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {categories && categories.length > 0 ? (
                        categories.map((category) => (
                            <div
                                key={category._id}
                                className="group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1"
                            >
                                {/* Category Card */}
                                <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                    {/* Image Container */}
                                    <div className="relative aspect-square">
                                        <img
                                            src={category?.categoryImage}
                                            alt={category?.categoryTitle || 'Category image'}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.target.src = '/fallback-category-image.jpg';
                                            }}
                                        />

                                        {/* Category Label Overlay */}
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 py-2 sm:py-3 text-center transition-colors duration-300"
                                            style={{ 
                                                backgroundColor: brandPage?.categoryTitleBgColor || '#000000',
                                            }}
                                        >
                                            <span 
                                                className="text-sm sm:text-base font-medium uppercase tracking-wide"
                                                style={{ 
                                                    color: brandPage?.categoryTitleColor || '#ffffff',
                                                }}
                                            >
                                                {category.categoryTitle}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500 text-lg">No categories available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesGrid;