'use client';



import React from "react";
import Image from "next/image";

const BrandCards = () => {
  const brands = [
    {
      id: 1,
      name: "Matador Wholesale",
      image: "/home-images/home-brand-1.avif",
      alt: "Matador Wholesale Logo",
    },
    {
      id: 2,
      name: "A&RA Aromas",
      image: "/home-images/home-brand-2.avif",
      alt: "A&RA Aromas Logo",
    },
    {
      id: 3,
      name: "Point Accessories",
      image: "/home-images/home-brand-3.avif",
      alt: "Point Accessories Logo",
    },
  ];

  return (
    <div className="w-full xl:max-w-5xl mx-auto p-4 xl:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="w-full max-w-xs h-36 md:h-40 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative w-full h-full">
              <Image
                src={brand.image}
                alt={brand.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCards;
