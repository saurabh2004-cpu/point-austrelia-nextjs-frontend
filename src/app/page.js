'use client'

import axiosInstance from "@/axios/axiosInstance";
import { Footer } from "@/components/Footer";
import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";
import BrandsGrid from "@/components/metador-page-components/BrandsGrid";
import TrustedByCarousel from "@/components/metador-page-components/Carousel";
import CategoriesGrid from "@/components/metador-page-components/CategoriesGrid";
import HeroSection from "@/components/metador-page-components/Hero";
import useNavStateStore from "@/zustand/navigations";
import useUserStore from "@/zustand/user";
import { useEffect } from "react";


export default function Home() {
  const currentIndex = useNavStateStore((state) => state.currentIndex);
  console.log("current index:", currentIndex)
  const currentUser = useUserStore((state) => state.user);
  console.log("current user:", currentUser);
  const setUser = useUserStore((state) => state.setUser);


  const fetchCurentUser = async () => {
    try {
      const response = await axiosInstance.get('user/get-current-user');

      if (response.data.statusCode === 200) {
        setUser(response.data.data);
      }

    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchCurentUser();
  }, []);

  return (
    <>
      {/* {currentIndex === 0 && */}
      <>
        <BrandCards />
        <Carousel />
      </>
      {/* } */}

      {/* {(currentIndex === 1 || currentIndex === 2 || currentIndex === 3) && currentUser === null &&
        <>
          <HeroSection />
          <CategoriesGrid />
          <BrandsGrid />
          <TrustedByCarousel />
        </>} */}


    </>
  );
}
