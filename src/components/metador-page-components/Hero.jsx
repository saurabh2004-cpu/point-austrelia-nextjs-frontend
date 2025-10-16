"use client";
import axiosInstance from "@/axios/axiosInstance";
import useBrandStore from "@/zustand/BrandPAge";
import Image from "next/image";
import { useParams } from "next/navigation"
import { set } from "nprogress";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const params = useParams();
  const slug = params.slug
  const [brand, setBrand] = useState(null);
  const setBrandPage = useBrandStore((state) => state.setBrandPage);
  const [heroImg, setHeroImg] = useState('');

  const fetchBrandBySlug = async (slug) => {
    try {
      const response = await axiosInstance.get(`brand/get-brand-by-slug/${slug}`);

      console.log("response ", response);

      if (response.data.statusCode === 200) {
        setBrand(response.data.data);
      }

    } catch (error) {
      console.error("Error fetching brand:", error);
      return null;
    }
  }

  const fetchBrandPageBySlug = async (slug) => {
    try {
      const response = await axiosInstance.get(`brand-page/get-brand-page-by-brand-slug/${slug}`);

      console.log("response ", response);

      if (response.data.statusCode === 200) {
        setBrandPage(response.data.data);
        setHeroImg(response.data.data.heroImage)
      }

    } catch (error) {
      console.error("Error fetching brand:", error);
      return null;
    }
  }


  useEffect(() => {
    if (slug) {
      fetchBrandPageBySlug(slug);
      fetchBrandBySlug(slug);
    }
  }, [slug]);

  return (
    <div className="h-full   mx-auto pb-0  pt-8 font-spartan">
      {/* Top Section */}
      <div className="flex px-4 w-full lg:w-6xl mx-auto flex-col lg:flex-row items-center gap-6 lg:gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={brand?.brandImg}
            alt="Matador Wholesale Logo"
            width={308}
            height={147}
            className="object-contain"
          />
        </div>

        {/* Heading + Description */}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#2D2C70] lg:mb-2">
            {brand?.name}
          </h2>
          <p className="text-[18px] font-medium text-black tracking-relaxed  ">
            {brand?.description}
          </p>
        </div>
      </div>

      {/* Bottom Horizontal Image */}
      <div className=" w-full">
        <img
          src={heroImg}
          alt="img"
          width={1920}
          height={472}
          className="w-full h-[250px] sm:h-[350px] lg:h-[472px] mt-16 object-cover "
        />
      </div>
    </div>
  );
}
