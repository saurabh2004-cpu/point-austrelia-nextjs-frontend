'use client'

import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";
import useUserStore from "@/zustand/user";
import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import ShoppingCartPopup from "@/components/CartPopup";
import { useCartPopupStateStore } from "@/zustand/cartPopupState";

export default function Home() {
  const currentUser = useUserStore((state) => state.user);
  const { showCartPopup, setShowCartPopup } = useCartPopupStateStore();

  // Global click outside handler for cart popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartPopup = document.querySelector('[data-cart-popup]');
      const navbarCartButton = document.querySelector('[data-navbar-cart-button]');

      if (showCartPopup &&
        cartPopup &&
        !cartPopup.contains(event.target) &&
        (!navbarCartButton || !navbarCartButton.contains(event.target))) {
        setShowCartPopup(false);
      }
    };

    if (showCartPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCartPopup, setShowCartPopup]);

  return (
    <>
      <BrandCards />
      <Carousel />
    </>
  );
}