import Image from 'next/image';
import React from 'react';

const CategoriesGrid = () => {
    const categories = [
        {
            id: 1,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Black hair scrunchies'
        },
        {
            id: 2,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Hair pins and clips'
        },
        {
            id: 3,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        },
        {
            id: 4,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        },
        {
            id: 5,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Black hair scrunchies'
        },
        {
            id: 6,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Hair pins and clips'
        },
        {
            id: 7,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        },
        {
            id: 8,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        },
        {
            id: 9,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Black hair scrunchies'
        },
        {
            id: 10,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Hair pins and clips'
        },
        {
            id: 11,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        },
        {
            id: 12,
            name: 'SCRUNCHIES',
            image: '/home-images/category-1.png',
            alt: 'Colorful hair scrunchies collection'
        }
    ];

    return (
        <div className="w-full bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 "></div>

                        {/* Title */}
                        <h2 className="px-4 sm:px-6 lg:px-3 text-lg text-[24px] text-[#2D2C70] font-semibold  ">
                            Our Categories
                        </h2>

                        {/* Right decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 "></div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="group cursor-pointer transition-all duration-300 hover:transform "
                        >
                            {/* Category Card */}
                            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                {/* Image Container */}
                                <div className="relative aspect-square ">
                                    <Image
                                        src={category.image}
                                        alt={category.alt}
                                        height={297}
                                        width={350}
                                        className=" transition-transform duration-300 "
                                    />

                                    {/* Category Label Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-[#0B66B2] bg-opacity-90 text-white py-2 sm:py-3 text-center">
                                        <span className="text-base font-[400]  uppercase">
                                            {category.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoriesGrid;