"use client";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="h-full   mx-auto pb-0  pt-8 font-spartan">
      {/* Top Section */}
      <div className="flex px-4 w-full lg:w-6xl mx-auto flex-col lg:flex-row items-center gap-6 lg:gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/home-images/home-brand-1.avif" // replace with actual path
            alt="Matador Wholesale Logo"
            width={308}
            height={147}
            className="object-contain"
          />
        </div>

        {/* Heading + Description */}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#2D2C70] lg:mb-2">
            Matador Wholesale
          </h2>
          <p className="text-[18px] font-medium text-black tracking-relaxed  ">
            Matador Wholesale is a leading wholesale distributor of general merchandise, automotive products, and everyday convenience items. We specialise in supplying service stations, discount stores, and independent retailers with trusted brands and high-turnover essentials.
          </p>
        </div>
      </div>

      {/* Bottom Horizontal Image */}
      <div className=" w-full">
        <Image
          src="/home-images/metador-1.png" // replace with actual path
          alt="Matador Wholesale Products"
          width={1920}
          height={472}
          className="w-full h-[250px] sm:h-[350px] lg:h-[472px] mt-16 object-cover "
        />
      </div>
    </div>
  );
}
