import React from 'react';
import Image from 'next/image';

const BrandCards = () => {
  const brands = [
    {
      id: 1,
      name: "Matador Wholesale",
      image: "/home-images/home-brand-1.avif", // Replace with your actual image path
      alt: "Matador Wholesale Logo"
    },
    {
      id: 2,
      name: "A&RA Aromas",
      image: "/home-images/home-brand-2.avif", // Replace with your actual image path
      alt: "A&RA Aromas Logo"
    },
    {
      id: 3,
      name: "Point Accessories",
      image: "/home-images/home-brand-3.avif", // Replace with your actual image path
      alt: "Point Accessories Logo"
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:py-6 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            style={{
              width: '19.375rem', // 310px converted to rem (310/16 = 19.375)
              height: '9.25rem',   // 148px converted to rem (148/16 = 9.25)
              minWidth: '19.375rem',
              minHeight: '9.25rem'
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={brand.image}
                alt={brand.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Responsive adjustments for smaller screens */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            place-items: center;
          }
        }
        
        @media (max-width: 640px) {
          .card-container {
            width: 100%;
            max-width: 19.375rem;
            height: 9.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandCards;