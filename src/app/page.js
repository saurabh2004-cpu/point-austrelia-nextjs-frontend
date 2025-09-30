'use client'

import { Footer } from "@/components/Footer";
import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";
import BrandsGrid from "@/components/metador-page-components/BrandsGrid";
import TrustedByCarousel from "@/components/metador-page-components/Carousel";
import CategoriesGrid from "@/components/metador-page-components/CategoriesGrid";
import HeroSection from "@/components/metador-page-components/Hero";
import useNavStateStore from "@/zustand/navigations";
import useUserStore from "@/zustand/user"

export default function Home() {
  const currentIndex = useNavStateStore((state) => state.currentIndex);
  console.log("current index:", currentIndex)

  return (
    <>
      {currentIndex === 0 &&
        <>
          <BrandCards />
          <Carousel />
        </>
      }

      {currentIndex === 1 &&
        <>
          <HeroSection />
          <CategoriesGrid />
          <BrandsGrid />
          <TrustedByCarousel />
        </>}


    </>
  );
}
