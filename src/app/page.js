'use client'

import { Footer } from "@/components/Footer";
import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";

export default function Home() {
  return (
    <>
      <BrandCards />
      <Carousel />
      <Footer />
    </>
  );
}
