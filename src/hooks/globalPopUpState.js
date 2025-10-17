// hooks/useGlobalCartPopup.js
import { useEffect } from 'react';
import { useCartPopupStateStore } from '@/zustand/cartPopupState';

export const useGlobalCartPopup = () => {
  const { showCartPopup, setShowCartPopup } = useCartPopupStateStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside cart popup AND outside navbar cart button
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

  return { showCartPopup, setShowCartPopup };
};