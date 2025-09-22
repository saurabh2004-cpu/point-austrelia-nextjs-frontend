import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

const BrandsGrid = () => {
    const brands = [
        {
            id: 1,
            name: 'Ellise Laundry',
            backgroundColor: 'bg-slate-700',
            textColor: 'text-white',
            logo: 'ellise',
            image: '/api/placeholder/400/200'
        },
        {
            id: 2,
            name: 'Sedona',
            backgroundColor: 'bg-lime-500',
            textColor: 'text-white',
            logo: 'sedona',
            image: '/api/placeholder/400/200'
        },
        {
            id: 3,
            name: 'Feldspar',
            backgroundColor: 'bg-slate-800',
            textColor: 'text-white',
            logo: 'feldspar',
            image: '/api/placeholder/400/200'
        },
        {
            id: 4,
            name: 'Rhino Shield',
            backgroundColor: 'bg-gray-600',
            textColor: 'text-white',
            logo: 'rhino-shield',
            image: '/api/placeholder/400/200'
        }
    ];

    const features = [
        "Stockist of market-leading brands customers know and trust.",
        "Products designed for high-volume turnover and impulse sales.",
        "Supplying petrol stations, discount variety stores, gift shops, and independent retailers nationwide."
    ];

    return (
        <div className="w-full bg-gray-50 py-8 sm:py-12 px-4 lg:px-0 lg:py-8  ">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {/* Left decorative line */}
                        <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>

                        {/* Title */}
                        <h2 className="px-1 text-lg text-[24px] font-semibold text-[#2D2C70] whitespace-nowrap">
                            Our Brands
                        </h2>

                        {/* Right decorative line */}
                         <div className="flex-1 font-extrabold h-[1px] bg-[#000000]/50 max-w-12 h-[2px] "></div>
                    </div>
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 max-w-8xl mx-auto xl:px-16">
                    <div className="bg-lime-500 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                        <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                            <div className="flex-1 relative bg-white">
                                <img
                                    src="/home-images/brands-grid-1.png"
                                    alt="Sedona Products"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sedona */}
                    <div className="bg-lime-500 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                        <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                            <div className="flex-1 relative bg-white">
                                <img
                                    src="/home-images/brands-grid-1.png"
                                    alt="Sedona Products"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-lime-500 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                        <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                            <div className="flex-1 relative bg-white">
                                <img
                                    src="/home-images/brands-grid-1.png"
                                    alt="Sedona Products"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-lime-500 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                        <div className="flex flex-col sm:flex-row h-full min-h-[200px] sm:min-h-[160px]">
                            <div className="flex-1 relative bg-white">
                                <img
                                    src="/home-images/brands-grid-1.png"
                                    alt="Sedona Products"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Choose Matador Wholesale Section */}
                <div className="bg-[#2D2C70] w-full h-full  lg:h-[295px] flex flex-col mx-auto w-full  sm:p-8  lg:py-12 text-white">
                    <h3 className="text-[20px] font-semibold mb-6 sm:mb-8 p-4 lg:p-0 lg:px-58">
                        Why Choose Matador Wholesale?
                    </h3>

                    <div className="space-y-4 sm:space-y-6 p-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-2  xl:px-54">
                                <div className='flex'>
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-1" />
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-1 relative right-3" />
                                </div>
                                <p className="text-base font-semibold leading-relaxed ">
                                    {feature}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandsGrid;