"use client"

import { useEffect } from "react"
import ShoppingCartPopup from "./CartPopup"
import { useCartPopupStateStore } from "@/zustand/cartPopupState"

export function GlobalCartPopup() {
    const { showCartPopup, setShowCartPopup } = useCartPopupStateStore()

    useEffect(() => {
        const handleClickOutside = (event) => {
            const cartPopup = document.querySelector('[data-cart-popup]')
            const navbarCartButton = document.querySelector('[data-navbar-cart-button]')

            if (showCartPopup &&
                cartPopup &&
                !cartPopup.contains(event.target) &&
                (!navbarCartButton || !navbarCartButton.contains(event.target))) {
                setShowCartPopup(false)
            }
        }

        if (showCartPopup) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('touchstart', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [showCartPopup, setShowCartPopup])

    if (!showCartPopup) return null

    return (
        <div data-cart-popup className="fixed z-50">
            <ShoppingCartPopup onClose={() => setShowCartPopup(false)} />
        </div>
    )
}