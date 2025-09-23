"use client"

import { useState } from "react"
import { Search, ShoppingCart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { label } from "framer-motion/client"
import useNavStateStore from "@/zustand/navigations"
import ShoppingCartPopup from "./CartPopup"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showCartPopup, setShowCartPopUp] = useState(false)
  const router = useRouter()

  const navigationItems = [
    { label: "HOME", index: 0, link: '/' },
    { label: "MATADOR WHOLESALE", index: 1 },
    { label: "ASRA AROMAS", index: 2 },
    { label: "POINT ACCESSORIES", index: 3 },
    { label: "COMPANY", index: 4 },
  ]
  const setCurrentIndex = useNavStateStore((state) => state.setCurrentIndex) // get function

  const handleNavigation = (index) => {
    if (index === 0) {
      router.push('/')
    }
  }

  return (
    <>
      <nav className="w-full bg-white md:border-b md:border-b-1 border-[#2d2c70]">
        {/* Top Bar */}
        <div className="border-b border-[#2d2c70] border-b-1  mt-2 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18">
              {/* Left - Login/Signup */}
              <div className="hidden md:flex text-[1rem] font-[600] text-[#2d2c70] items-center space-x-1 text-sm ">
                <User fill="#2d2c70" className="w-4 h-4 mb-2 mx-2 mt-1" />
                <span className="hover:text-gray-900 cursor-pointer font-Spartan">LOGIN</span>
                <span className=" font-Spartan text-[#2d2c70] mx-4">|</span>
                <span className="hover:text-gray-900 cursor-pointer font-Spartan">SIGN UP</span>
              </div>

              {/* Center - Logo */}
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900">
                  <Image
                    src="/logo/point-austrelia-logo.png"
                    alt="Logo"
                    width={219}
                    height={100}
                  />
                </div>
              </div>

              {/* Right - Search and Cart */}
              <div className="flex items-center space-x-24">
                {/* Desktop Search */}

                {/* Mobile Search Toggle */}
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search className="w-4 h-4" />
                </Button>
                <div className="space-x-16 flex">
                  <div className="hidden md:flex items-center spac text-[1rem] font-semibold text-[#2d2c70]">
                    <Search className="w-4 h-4 " />
                    <span className="text-sm text-[#2d2c70]">Search</span>
                  </div>

                  {/* Cart */}
                  <button
                    className="relative bg-white"
                    onClick={() => setShowCartPopUp(!showCartPopup)}
                  >
                    <img
                      src="/home-images/cart-logo.png"
                      className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900"
                    />
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-[#E9098D] ">2</Badge>
                  </button>
                </div>

                {/* Mobile Menu Toggle */}
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-b    border-[#2d2c70]  p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input placeholder="Search..." className="flex-1" autoFocus />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-2">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-[36px] h-14">
            {navigationItems.map((item) => (
              <button
                key={item.index}
                onClick={() => handleNavigation(item.index)}
                className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {/* Mobile Login/Signup */}
              <div className="flex items-center space-x-4 pb-4 border-b border-[#2d2c70]">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <User className="w-4 h-4 mr-2" />
                  LOGIN
                </Button>
                <Button size="sm" className="flex-1">
                  SIGN UP
                </Button>
              </div>

              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => (
                <button
                  key={item}
                  className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 transition-colors duration-200"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {showCartPopup && <ShoppingCartPopup onClose={() => setShowCartPopUp(false)} />}
    </>
  )
}
