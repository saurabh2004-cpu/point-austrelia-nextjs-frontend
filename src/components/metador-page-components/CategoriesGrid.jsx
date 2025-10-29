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



    return (
        <div className="w-full bg-white py-8 sm:py-12 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

                        {/* Title */}
                        <h2 className={`px-1 text-lg text-[24px] text-[${brandPage?.categoryHeadingTextColor}] font-semibold  `}>
                            {brandPage?.categoryHeadingText || 'Categories'}
                        </h2>


                        {/* Right decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

                    </div>

                    {brandPage?.categoryDescription && (
                        <p className={`text-base text-[${brandPage?.categoryDescriptionColor}]`}>{brandPage?.categoryDescription}</p>
                    )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {categories.map((category) => (
                        <div
                            key={category._id}
                            className="group cursor-pointer transition-all duration-300 hover:transform "
                        >
                            {/* Category Card */}
                            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                {/* Image Container */}
                                <div className="relative aspect-square ">
                                    <img
                                        src={category?.categoryImage}
                                        alt={category?.categoryTitle}

                                        className=" transition-transform duration-300  h-[297px] w-[350px] object-cover group-hover:scale-105"
                                    />

                                    {/* Category Label Overlay */}
                                    <div className={`absolute bottom-0 left-0 right-0 bg-[${brandPage?.categoryTitleBgColor}]   py-2 sm:py-3 text-center`}>
                                        <span className={`text-base font-[400] text-[${brandPage?.categoryTitleColor}]   uppercase`}>
                                            {category.categoryTitle}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default CategoriesGrid;