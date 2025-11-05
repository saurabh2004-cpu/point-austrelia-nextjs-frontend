'use client'
import ShoppingCartPopup from '@/components/CartPopup';
import { Navbar } from '@/components/Navbar'
import ProductListing from '@/components/product-listing-page-components/ProductsListing'
import { withAuth } from '@/components/withAuth';
import { useCartPopupStateStore } from '@/zustand/cartPopupState';
import React, { useEffect } from 'react'

const page = () => {

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCartPopup, setShowCartPopup]);


  return (
    <>
      {/* <Navbar /> */}
      <ProductListing />
    </>
  )
}

export default withAuth(page);
