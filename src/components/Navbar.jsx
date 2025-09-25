"use client"

import { useState } from "react"
import { Search, ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react"
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleNavigation = (index) => {
    switch (index) {
      case 0:
        router.push('/')
        break;
      case 1:
        router.push('/products-list')
        break;
      case 2:
        router.push('/products-list')
        break;
      case 3:
        router.push('/products-list')
        break;
      case 4:
        router.push('/')
        break;
      default:
        break;
    }
    // Close mobile menu after navigation
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="w-full bg-white md:border-b md:border-b-1 border-[#2d2c70]">
        {/* Top Bar */}
        <div className="border-b border-[#2d2c70] border-b-1 mt-2 py-2 md:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-[60px] md:h-18">

              {/* Mobile & Tablet: Left side - Menu button */}
              <div className="flex items-center lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>

              {/* Desktop: Left - Login/Signup */}
              {!isLoggedIn ? (
                <div className="hidden lg:flex text-[1rem] font-[600] text-[#2d2c70] items-center ml-20 space-x-1 text-sm">
                  {/* Login */}
                  <div className="group flex gap-1 items-center cursor-pointer">
                    <User
                      fill="currentColor"
                      className="w-4 h-4 mb-0 mx-2 text-[#2d2c70] transition-colors duration-200 group-hover:text-[#E9098D]"
                    />
                    <span
                      onClick={() => router.push('/login')}
                      className="font-Spartan transition-colors duration-200 group-hover:text-[#E9098D]">
                      LOGIN
                    </span>
                  </div>

                  {/* Divider */}
                  <span className="font-Spartan text-[#2d2c70] mx-4">|</span>

                  {/* Sign Up */}
                  <span
                    onClick={() => router.push('/sign-up')}
                    className="font-Spartan text-[#2d2c70] cursor-pointer transition-colors duration-200 hover:text-[#E9098D]">
                    SIGN UP
                  </span>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 text-[1rem] font-medium ml-20">
                  {/* Welcome text */}
                  <span className="text-[#2d2c70] font-medium">Welcome</span>

                  {/* User icon + name */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-black">Devendra Chandora</span>
                  </div>

                  {/* Down arrow */}
                  <ChevronDown strokeWidth={3} className="w-4 h-4 text-[#2d2c70] mt-1" />
                </div>
              )}

              {/* Center - Logo */}
              <div className="flex items-center justify-center flex-1 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                <Image
                  src="/logo/point-austrelia-logo.png"
                  alt="Logo"
                  width={219}
                  height={100}
                  className="h-12 md:h-16 lg:h-20 w-auto" // Progressive sizing: mobile -> tablet -> desktop
                  onClick={() => router.push('/')}
                />
              </div>

              {/* Right - Search, Cart, and Mobile Actions */}
              <div className="flex items-center space-x-2 lg:space-x-4">

                {/* Mobile & Tablet: Search and Cart icons only */}
                <div className="flex lg:hidden items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2"
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>

                  {/* Mobile & Tablet Wishlist */}
                  <button
                    className="relative bg-white group p-1"
                    onClick={() => setShowCartPopUp(!showCartPopup)}
                  >
                    <svg
                      width="18"
                      height="17"
                      viewBox="0 0 21 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200"
                    >
                      <path d="M14.8633 0.526367C17.9009 0.526367 20.3633 3.02637 20.3633 6.52637C20.3633 13.5264 12.8633 17.5264 10.3633 19.0264C7.86328 17.5264 0.363281 13.5264 0.363281 6.52637C0.363281 3.02637 2.86328 0.526367 5.86328 0.526367C7.72325 0.526367 9.36328 1.52637 10.3633 2.52637C11.3633 1.52637 13.0033 0.526367 14.8633 0.526367ZM11.2972 16.1302C12.1788 15.5749 12.9733 15.0219 13.7182 14.4293C16.697 12.0594 18.3633 9.46987 18.3633 6.52637C18.3633 4.16713 16.8263 2.52637 14.8633 2.52637C13.7874 2.52637 12.6226 3.09548 11.7775 3.94058L10.3633 5.3548L8.94908 3.94058C8.10396 3.09548 6.93918 2.52637 5.86328 2.52637C3.92234 2.52637 2.36328 4.18287 2.36328 6.52637C2.36328 9.46987 4.02955 12.0594 7.00842 14.4293C7.75328 15.0219 8.54778 15.5749 9.42938 16.1302C9.72788 16.3183 10.0244 16.4993 10.3633 16.7016C10.7022 16.4993 10.9987 16.3183 11.2972 16.1302Z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 flex items-center justify-center rounded-full text-white text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200">
                      2
                    </span>
                  </button>

                  {/* Mobile & Tablet Cart */}
                  <button
                    className="relative bg-white group p-1"
                    onClick={() => router.push('/cart')}
                  >
                    <svg
                      width="18"
                      height="17"
                      viewBox="0 0 20 19"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200"
                    >
                      <path d="M18.8889 18.5H1.11111C0.497466 18.5 0 18.0859 0 17.575V0.925C0 0.414141 0.497466 0 1.11111 0H18.8889C19.5026 0 20 0.414141 20 0.925V17.575C20 18.0859 19.5026 18.5 18.8889 18.5ZM17.7778 16.65V1.85H2.22222V16.65H17.7778ZM6.66666 3.7V5.55C6.66666 7.08259 8.15901 8.325 10 8.325C11.8409 8.325 13.3333 7.08259 13.3333 5.55V3.7H15.5556V5.55C15.5556 8.10429 13.0682 10.175 10 10.175C6.93175 10.175 4.44444 8.10429 4.44444 5.55V3.7H6.66666Z" />
                    </svg>
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 p-0 text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] flex items-center justify-center">2</Badge>
                  </button>
                </div>

                {/* Desktop: Full search, quick order, wishlist, cart */}
                <div className="hidden lg:flex lg:space-x-10">
                  <div className="flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70]">
                    <Search strokeWidth={3} className="w-4 h-4 hover:text-[#E9098D] cursor-pointer" />
                    <span className="text-[1rem] font-semibold text-[#2d2c70] cursor-pointer hover:text-[#E9098D]">Search</span>
                  </div>

                  <div className="flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70]">
                    <span className="text-[1rem] font-semibold text-[#2d2c70] hover:text-[#E9098D] cursor-pointer">Quick Order</span>
                  </div>

                  {/* Desktop Wishlist */}
                  <button
                    className="relative bg-white group"

                    onClick={() => router.push('/cart')}
                  >
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200"
                    >
                      <path d="M14.8633 0.526367C17.9009 0.526367 20.3633 3.02637 20.3633 6.52637C20.3633 13.5264 12.8633 17.5264 10.3633 19.0264C7.86328 17.5264 0.363281 13.5264 0.363281 6.52637C0.363281 3.02637 2.86328 0.526367 5.86328 0.526367C7.72325 0.526367 9.36328 1.52637 10.3633 2.52637C11.3633 1.52637 13.0033 0.526367 14.8633 0.526367ZM11.2972 16.1302C12.1788 15.5749 12.9733 15.0219 13.7182 14.4293C16.697 12.0594 18.3633 9.46987 18.3633 6.52637C18.3633 4.16713 16.8263 2.52637 14.8633 2.52637C13.7874 2.52637 12.6226 3.09548 11.7775 3.94058L10.3633 5.3548L8.94908 3.94058C8.10396 3.09548 6.93918 2.52637 5.86328 2.52637C3.92234 2.52637 2.36328 4.18287 2.36328 6.52637C2.36328 9.46987 4.02955 12.0594 7.00842 14.4293C7.75328 15.0219 8.54778 15.5749 9.42938 16.1302C9.72788 16.3183 10.0244 16.4993 10.3633 16.7016C10.7022 16.4993 10.9987 16.3183 11.2972 16.1302Z" />
                    </svg>
                    <span className="absolute -top-1 -right-2 h-4 w-4 flex items-center justify-center rounded-full text-white text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200">
                      2
                    </span>
                  </button>

                  {/* Desktop Cart */}
                  <button
                    className="`lg:hidden block relative bg-white group"
                    onClick={() => setShowCartPopUp(!showCartPopup)}
                  >
                    <svg
                      width="20"
                      height="19"
                      viewBox="0 0 20 19"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200"
                    >
                      <path d="M18.8889 18.5H1.11111C0.497466 18.5 0 18.0859 0 17.575V0.925C0 0.414141 0.497466 0 1.11111 0H18.8889C19.5026 0 20 0.414141 20 0.925V17.575C20 18.0859 19.5026 18.5 18.8889 18.5ZM17.7778 16.65V1.85H2.22222V16.65H17.7778ZM6.66666 3.7V5.55C6.66666 7.08259 8.15901 8.325 10 8.325C11.8409 8.325 13.3333 7.08259 13.3333 5.55V3.7H15.5556V5.55C15.5556 8.10429 13.0682 10.175 10 10.175C6.93175 10.175 4.44444 8.10429 4.44444 5.55V3.7H6.66666Z" />
                    </svg>
                    <Badge className="absolute -top-1 -right-2 h-4 w-4 p-0 text-xs bg-[#2d2c70] group-hover:bg-[#E9098D]">2</Badge>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden border-b border-[#2d2c70] p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <Input
                placeholder="Search..."
                className="flex-1 border-[#2d2c70] focus:border-[#E9098D]"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-2">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center space-x-[36px] h-14">
            {navigationItems.map((item) => (
              <button
                key={item.index}
                onClick={() => handleNavigation(item.index)}
                className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile & Tablet Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-2">
              {/* Mobile & Tablet Login/Signup - Only show if not logged in */}
              {!isLoggedIn && (
                <div className="flex items-center space-x-4 pb-4 border-b border-[#2d2c70] mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-[#2d2c70] text-[#2d2c70] hover:bg-[#2d2c70] hover:text-white"
                    onClick={() => router.push('/login')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    LOGIN
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#2d2c70] hover:bg-[#E9098D]"
                    onClick={() => router.push('/sign-up')}
                  >
                    SIGN UP
                  </Button>
                </div>
              )}

              {/* Mobile & Tablet User Info - Show if logged in */}
              {isLoggedIn && (
                <div className="flex items-center gap-2 text-[1rem] font-medium pb-4 border-b border-[#2d2c70] mb-4">
                  <span className="text-[#2d2c70] font-medium">Welcome</span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-black">Devendra Chandora</span>
                  </div>
                  <ChevronDown strokeWidth={3} className="w-4 h-4 text-[#2d2c70] mt-1" />
                </div>
              )}

              {/* Mobile & Tablet Navigation Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.index}
                    onClick={() => handleNavigation(item.index)}
                    className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100 md:border-b-0"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile & Tablet Quick Actions */}
              <div className="pt-4 border-t border-[#2d2c70] space-y-3">
                <button className="block w-full text-left py-2 md:py-3 text-sm md:text-base font-medium text-[#2d2c70] hover:text-[#E9098D] rounded-md px-3 transition-colors duration-200">
                  Quick Order
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {showCartPopup && <ShoppingCartPopup onClose={() => setShowCartPopUp(false)} />}
    </>
  )
}