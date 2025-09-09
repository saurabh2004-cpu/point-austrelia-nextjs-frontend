"use client"

import { useState } from "react"
import { Search, ShoppingCart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navigationItems = ["HOME", "MATADOR WHOLESALE", "ASRA AROMAS", "POINT ACCESSORIES", "COMPANY"]

  return (
    <nav className="w-full bg-white border-b border-b-3 border-[#2d2c70]">
      {/* Top Bar */}
      <div className="border-b border-[#2d2c70] border-b-3  mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left - Login/Signup */}
            <div className="hidden md:flex text-[1rem] font-[600] text-[#2d2c70] items-center space-x-1 text-sm ">
              <User className="w-5 h-5 mb-2 mx-2" />
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
                  width={160}
                  height={160}
                />
              </div>
            </div>

            {/* Right - Search and Cart */}
            <div className="flex items-center space-x-24">
              {/* Desktop Search */}
              <div className="hidden md:flex items-center space-x-2 text-[1rem] font-[600] text-[#2d2c70]">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Search</span>
              </div>

              {/* Mobile Search Toggle */}
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search className="w-4 h-4" />
              </Button>

              {/* Cart */}
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-500">2</Badge>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center space-x-8 h-14">
          {navigationItems.map((item) => (
            <button
              key={item}
              className="text-[1rem] font-[500] text-[#2d2c70] transition-colors duration-200 whitespace-nowrap"
            >
              {item}
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
  )
}
