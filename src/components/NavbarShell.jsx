"use client"

import { useRef, useState, useCallback, useMemo, useEffect, useTransition } from "react"
import { Search, Menu, X, User, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useNavbarStore } from "@/zustand/navbarStore"
import useNavStateStore from "@/zustand/navigations"
import ShoppingCartPopup from "./CartPopup"
import useUserStore from "@/zustand/user"
import useCartStore from "@/zustand/cartPopup"
import useWishlistStore from "@/zustand/wishList"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import { useCartPopupStateStore } from "@/zustand/cartPopupState"
import axiosInstance from "@/axios/axiosInstance"
import {
    fetchCategoriesForBrand,
    fetchSubCategoriesForCategory,
    fetchSubCategoriesTwoForSubCategory
} from "./NavbarData"

// Custom hook for click outside detection
const useClickOutside = (callback) => {
    const ref = useRef();

    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [callback]);

    return ref;
};

export function NavbarShell() {
    // Use transition for non-blocking navigation
    const [isPending, startTransition] = useTransition()
    
    // UI State only - no data fetching
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [hoveredCategory, setHoveredCategory] = useState(null)
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [showCompanyDropDown, setShowCompanyDropDown] = useState(false)
    const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Hooks
    const router = useRouter()
    const pathname = usePathname()

    // Stores - only reading, no writing during navigation
    const currentUser = useUserStore((state) => state.user)
    const currentCartItems = useCartStore((state) => state.currentItems)
    const currentWishlistItems = useWishlistStore((state) => state.currentWishlistItems)
    const { showCartPopup, toggleCartPopup } = useCartPopupStateStore()
    const setFilters = useProductFiltersStore((state) => state.setFilters)
    const setCurrentIndex = useNavStateStore((state) => state.setCurrentIndex)

    // Navbar data from store
    const {
        brands,
        categoriesByBrand,
        subCategoriesByCategory,
        subCategoriesTwoBySubCategory,
        loadingCategories
    } = useNavbarStore()

    const isCheckoutPage = pathname === '/checkout'

    // Click outside hooks
    const userDropdownRef = useClickOutside(() => setShowUserDropdown(false))
    const mobileMenuRef = useClickOutside(() => setIsMenuOpen(false))
    const desktopDropdownRef = useClickOutside(() => {
        setActiveDropdown(null)
        setHoveredCategory(null)
        setHoveredSubcategory(null)
    })
    const desktopSearchRef = useClickOutside(() => setIsDesktopSearchOpen(false))
    const companyDropdownRef = useClickOutside(() => setShowCompanyDropDown(false))

    // ULTRA FAST NAVIGATION - No state updates, immediate navigation
    const handleQuickNavigate = useCallback((url) => {
        // Close UI synchronously
        setIsMenuOpen(false)
        setShowUserDropdown(false)
        setShowCompanyDropDown(false)
        setActiveDropdown(null)

        // Use startTransition for non-blocking navigation
        startTransition(() => {
            router.push(url)
        })
    }, [router])

    // Fast handlers
    const handleUserDropdownToggle = useCallback(() => {
        setShowUserDropdown(prev => !prev)
        setIsMenuOpen(false)
        setActiveDropdown(null)
    }, [])

    const handleCartPopupToggle = useCallback(() => {
        toggleCartPopup()
        setShowUserDropdown(false)
        setIsMenuOpen(false)
        setActiveDropdown(null)
    }, [toggleCartPopup])

    const handleMobileMenuToggle = useCallback(() => {
        setIsMenuOpen(prev => !prev)
        setShowUserDropdown(false)
        setActiveDropdown(null)
    }, [])

    const handleSearch = useCallback((e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchQuery.trim()) {
                setIsSearchOpen(false)
                setIsDesktopSearchOpen(false)
                startTransition(() => {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                })
            }
        }
    }, [searchQuery, router])

    // Optimized logout - navigation first, API call later
    const handleLogout = useCallback(() => {
        setShowUserDropdown(false)
        
        // Clear user state
        useUserStore.getState().clearUser()

        // Navigate immediately
        startTransition(() => {
            router.push('/')
        })

        // API call in background (non-blocking)
        setTimeout(async () => {
            try {
                await axiosInstance.post('user/logout')
            } catch (error) {
                console.error('Logout API error:', error)
            }
        }, 0)
    }, [router])

    const handleMyAccount = useCallback(() => {
        handleQuickNavigate('/my-account-review')
    }, [handleQuickNavigate])

    const handleLoginClick = useCallback(() => {
        handleQuickNavigate('/login')
    }, [handleQuickNavigate])

    const handleSignupClick = useCallback(() => {
        handleQuickNavigate('/sign-up')
    }, [handleQuickNavigate])

    const handleContactClick = useCallback(() => {
        handleQuickNavigate('/contact-us')
    }, [handleQuickNavigate])

    const handleWishlistClick = useCallback(() => {
        handleQuickNavigate('/wishlist')
    }, [handleQuickNavigate])

    const handleCartClick = useCallback(() => {
        handleQuickNavigate('/cart')
    }, [handleQuickNavigate])

    // Hover handlers for lazy loading
    const handleBrandHover = useCallback((brandId, index) => {
        if (currentUser) {
            setActiveDropdown(index)
            fetchCategoriesForBrand(brandId)
        }
    }, [currentUser])

    const handleCategoryHover = useCallback((categoryId) => {
        fetchSubCategoriesForCategory(categoryId)
    }, [])

    const handleSubCategoryHover = useCallback((subCategoryId) => {
        fetchSubCategoriesTwoForSubCategory(subCategoryId)
    }, [])

    // Navigation items - memoized
    const navigationItems = useMemo(() => {
        const items = [
            {
                label: "HOME",
                index: 0,
                link: '/',
                onClick: () => handleQuickNavigate('/')
            }
        ]

        brands.forEach((brand, idx) => {
            const categories = categoriesByBrand[brand._id] || []
            const brandRoute = `/brand/${brand.slug}`

            const categoriesWithColumns = categories.map((cat, catIdx) => {
                const itemsPerColumn = Math.ceil(categories.length / 5)
                const column = Math.floor(catIdx / itemsPerColumn) + 1

                return {
                    id: cat._id,
                    label: cat.name,
                    slug: cat.slug,
                    brandId: brand._id,
                    brandSlug: brand.slug,
                    link: `/${cat.slug}`,
                    column: column,
                    onClick: () => handleQuickNavigate(`/${cat.slug}`),
                    subcategories: subCategoriesByCategory[cat._id]?.map(subCat => ({
                        id: subCat._id,
                        label: subCat.name,
                        slug: subCat.slug,
                        link: `/${subCat.slug}`,
                        onClick: () => handleQuickNavigate(`/${subCat.slug}`),
                        subcategoriesTwo: subCategoriesTwoBySubCategory[subCat._id]?.map(subCatTwo => ({
                            id: subCatTwo._id,
                            label: subCatTwo.name,
                            slug: subCatTwo.slug,
                            link: `/${subCatTwo.slug}`,
                            onClick: () => handleQuickNavigate(`/${subCatTwo.slug}`)
                        }))
                    }))
                }
            })

            items.push({
                label: brand.name.toUpperCase(),
                index: idx + 1,
                brandId: brand._id,
                brandSlug: brand.slug,
                brandRoute: brandRoute,
                hasDropdown: true,
                onClick: currentUser ? undefined : () => handleQuickNavigate(brandRoute),
                categories: categoriesWithColumns
            })
        })

        items.push({
            label: currentUser ? "COMPANY" : "CONTACT US",
            index: brands.length + 1,
            hasDropdown: true,
            onClick: currentUser ? undefined : () => handleQuickNavigate('/contact-us')
        })

        return items
    }, [brands, categoriesByBrand, subCategoriesByCategory, subCategoriesTwoBySubCategory, currentUser, handleQuickNavigate])

    const groupCategoriesByColumn = useCallback((categories) => {
        const columns = {}
        categories.forEach(cat => {
            const col = cat.column || 1
            if (!columns[col]) columns[col] = []
            columns[col].push(cat)
        })
        return Object.values(columns)
    }, [])

    // Render the UI
    return (
        <>
            <nav className="w-full bg-white md:border-b md:border-b-1 border-[#2d2c70]">
                {/* Top Bar */}
                <div className="border-b border-[#2d2c70] border-b-1 mt-2 py-2 md:py-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between min-h-[60px] md:h-18">

                            {/* Mobile Menu Button */}
                            <div className="flex items-center lg:hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMobileMenuToggle}
                                    className="p-2"
                                >
                                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </Button>
                            </div>

                            {/* Desktop: Left - Login/Signup */}
                            {!currentUser ? (
                                <div className="hidden lg:flex text-[1rem] font-[600] text-[#2d2c70] items-center ml-20 space-x-1 text-sm">
                                    <div className="group flex gap-1 items-center cursor-pointer">
                                        <User
                                            fill="currentColor"
                                            className="w-4 h-4 mb-0 mx-2 text-[#2d2c70] transition-colors duration-200 group-hover:text-[#E9098D]"
                                        />
                                        <button
                                            onClick={handleLoginClick}
                                            className="font-Spartan transition-colors duration-200 group-hover:text-[#E9098D]"
                                        >
                                            LOGIN
                                        </button>
                                    </div>
                                    <span className="font-Spartan text-[#2d2c70] mx-4">|</span>
                                    <button
                                        onClick={handleSignupClick}
                                        className="font-Spartan text-[#2d2c70] cursor-pointer transition-colors duration-200 hover:text-[#E9098D]"
                                    >
                                        SIGN UP
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center gap-2 text-[1rem] font-medium ml-20 relative">
                                    <span className="text-[#2d2c70] font-medium">Welcome</span>
                                    <div className="relative" ref={userDropdownRef}>
                                        <button
                                            onClick={handleUserDropdownToggle}
                                            className="flex items-center gap-2 hover:text-[#E9098D] transition-colors duration-200 group"
                                        >
                                            <User className="w-4 h-4 text-gray-600 group-hover:text-[#E9098D]" />
                                            <span className="font-semibold text-black group-hover:text-[#E9098D]">{currentUser?.customerName || currentUser?.contactName}</span>
                                            <ChevronDown
                                                strokeWidth={3}
                                                className={`w-4 h-4 text-[#2d2c70] mt-1 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {showUserDropdown && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                                <div className="py-1">
                                                    <button
                                                        onClick={handleMyAccount}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200"
                                                    >
                                                        My Account
                                                    </button>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200"
                                                    >
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Center - Logo */}
                            <div className="flex items-center justify-center flex-1 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                                <button onClick={() => handleQuickNavigate('/')}>
                                    <Image
                                        src="/logo/point-austrelia-logo.png"
                                        alt="Logo"
                                        width={219}
                                        height={100}
                                        className="h-12 md:h-16 lg:h-20 w-auto cursor-pointer"
                                        priority
                                    />
                                </button>
                            </div>

                            {/* Right - Search, Cart, and Mobile Actions */}
                            <div className="flex items-center space-x-2 lg:space-x-4">
                                {currentUser && !isCheckoutPage && (
                                    <>
                                        {/* Mobile Icons */}
                                        <div className="flex lg:hidden items-center space-x-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                                className="p-2"
                                            >
                                                <Search className="w-4 h-4 md:w-5 md:h-5" />
                                            </Button>

                                            <button
                                                onClick={handleWishlistClick}
                                                className="relative bg-white group p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 flex items-center justify-center rounded-full text-white text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200">
                                                    {currentWishlistItems || 0}
                                                </span>
                                            </button>

                                            <button
                                                onClick={handleCartClick}
                                                className="relative bg-white group p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                <Badge className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 p-0 text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] flex items-center justify-center">
                                                    {currentCartItems || 0}
                                                </Badge>
                                            </button>
                                        </div>

                                        {/* Desktop Icons */}
                                        <div className="hidden lg:flex lg:space-x-10 items-center">
                                            {/* Search */}
                                            <div className="hidden lg:flex items-center" ref={desktopSearchRef}>
                                                {!isDesktopSearchOpen && (
                                                    <button
                                                        onClick={() => setIsDesktopSearchOpen(!isDesktopSearchOpen)}
                                                        className="p-2 mr-2 flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70] hover:text-[#E9098D] cursor-pointer group"
                                                    >
                                                        <Search className="w-4 h-4 text-[#2d2c70] hover:text-[#E9098D] group-hover:text-[#E9098D]" />
                                                        Search
                                                    </button>
                                                )}
                                                {isDesktopSearchOpen && currentUser && (
                                                    <div className="flex items-center relative w-64">
                                                        <Input
                                                            placeholder="Search products..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            onKeyPress={handleSearch}
                                                            className="pr-10 border-[#2d2c70] focus:border-[#E9098D]"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleSearch}
                                                            className="absolute right-0 h-full px-3 hover:bg-transparent"
                                                        >
                                                            <Search className="w-4 h-4 text-[#2d2c70] hover:text-[#E9098D]" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Wishlist */}
                                            <button
                                                onClick={handleWishlistClick}
                                                className="relative bg-white group"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span className="absolute -top-1 -right-2 h-4 w-4 flex items-center justify-center rounded-full text-white text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200">
                                                    {currentWishlistItems || 0}
                                                </span>
                                            </button>

                                            {/* Cart */}
                                            <button
                                                className="relative bg-white group"
                                                onClick={handleCartPopupToggle}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                <Badge className="absolute -top-1 -right-2 h-4 w-4 p-0 text-xs bg-[#2d2c70] group-hover:bg-[#E9098D]">
                                                    {currentCartItems || 0}
                                                </Badge>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="lg:hidden border-b border-[#2d2c70] p-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                                className="flex-1 border-[#2d2c70] focus:border-[#E9098D]"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSearch}
                                className="p-2"
                            >
                                <Search className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-2 relative">
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center justify-center space-x-[36px] h-14" ref={desktopDropdownRef}>
                        {navigationItems.map((item) => (
                            <div
                                key={item.index}
                                className="relative h-full flex items-center hover:border hover:border-1 border-black px-2"
                                onMouseEnter={() => {
                                    if (item.hasDropdown && currentUser) {
                                        if (item.brandId) {
                                            handleBrandHover(item.brandId, item.index);
                                        } else if (item.label === "COMPANY") {
                                            setShowCompanyDropDown(true);
                                        } else {
                                            setActiveDropdown(item.index)
                                        }
                                    }
                                }}
                                onMouseLeave={() => {
                                    setActiveDropdown(null)
                                    setHoveredCategory(null)
                                    setHoveredSubcategory(null)
                                    setShowCompanyDropDown(false)
                                }}
                            >
                                <button
                                    onClick={item.onClick}
                                    className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]"
                                >
                                    {item.label}
                                </button>

                                {/* COMPANY Dropdown */}
                                {item.label === "COMPANY" && showCompanyDropDown && currentUser && (
                                    <div
                                        className="absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                                        ref={companyDropdownRef}
                                    >
                                        <div className="py-1">
                                            {brands.map((brand) => (
                                                <button
                                                    key={brand._id}
                                                    onClick={() => handleQuickNavigate(`/brand/${brand.slug}`)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200"
                                                >
                                                    {brand.name}
                                                </button>
                                            ))}
                                            <button
                                                onClick={handleContactClick}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200 border-t border-gray-200"
                                            >
                                                Contact Us
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="lg:hidden space-y-2" ref={mobileMenuRef}>
                            {navigationItems.map((item) => (
                                <div key={item.index}>
                                    <button
                                        onClick={item.onClick}
                                        className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100"
                                    >
                                        {item.label}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Full-Width Dropdown */}
                {activeDropdown !== null && currentUser && (
                    <div
                        className="hidden lg:block absolute top-44 left-0 w-full bg-white border-t border-b border-gray-200 shadow-lg z-50"
                        onMouseEnter={() => setActiveDropdown(activeDropdown)}
                        onMouseLeave={() => {
                            setActiveDropdown(null)
                            setHoveredCategory(null)
                            setHoveredSubcategory(null)
                        }}
                        ref={desktopDropdownRef}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            {navigationItems.find(item => item.index === activeDropdown)?.categories && (
                                <div className="grid grid-cols-5 gap-8">
                                    {groupCategoriesByColumn(navigationItems.find(item => item.index === activeDropdown).categories).map((columnCategories, colIdx) => (
                                        <div key={colIdx} className="space-y-2">
                                            {columnCategories.length > 0 ? (
                                                columnCategories.map((category, catIdx) => (
                                                    <div
                                                        key={category.id || catIdx}
                                                        className="relative hover:border hover:border-2 p-2 border-black"
                                                        onMouseEnter={() => {
                                                            if (category.subcategories) {
                                                                setHoveredCategory(`${colIdx}-${catIdx}`)
                                                            } else if (category.id) {
                                                                handleCategoryHover(category.id)
                                                                setHoveredCategory(`${colIdx}-${catIdx}`)
                                                            }
                                                        }}
                                                        onMouseLeave={() => setHoveredCategory(null)}
                                                    >
                                                        <button
                                                            onClick={category.onClick}
                                                            className={`text-left text-sm font-medium transition-colors duration-200 flex items-center justify-between w-full group ${category.label === "NEW!" || category.label === "SALE"
                                                                ? "text-[#E9098D] font-bold"
                                                                : "text-[#2d2c70] hover:text-[#E9098D]"
                                                                }`}
                                                        >
                                                            <span>{category.label}</span>
                                                            {(category.subcategories || subCategoriesByCategory[category.id]) && (
                                                                <ChevronRight className="w-4 h-4 opacity-100 transition-opacity" />
                                                            )}
                                                        </button>

                                                        {/* Subcategory Popup */}
                                                        {(category.subcategories || subCategoriesByCategory[category.id]) && hoveredCategory === `${colIdx}-${catIdx}` && (
                                                            <div
                                                                className="absolute left-2/3 top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md"
                                                                onMouseEnter={() => setHoveredCategory(`${colIdx}-${catIdx}`)}
                                                            >
                                                                <div className="p-4 space-y-2">
                                                                    {(category.subcategories || subCategoriesByCategory[category.id] || []).map((subcat) => (
                                                                        <div
                                                                            key={subcat.id}
                                                                            className="relative hover:border hover:border-2 p-1 border-black"
                                                                            onMouseEnter={() => {
                                                                                if (subcat.id) {
                                                                                    handleSubCategoryHover(subcat.id)
                                                                                    setHoveredSubcategory(subcat.id)
                                                                                }
                                                                            }}
                                                                            onMouseLeave={() => setHoveredSubcategory(null)}
                                                                        >
                                                                            <button
                                                                                onClick={subcat.onClick}
                                                                                className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between group"
                                                                            >
                                                                                <span>{subcat.label}</span>
                                                                                {subCategoriesTwoBySubCategory[subcat.id] && (
                                                                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                )}
                                                                            </button>

                                                                            {/* SubcategoryTwo Popup */}
                                                                            {subCategoriesTwoBySubCategory[subcat.id] && hoveredSubcategory === subcat.id && (
                                                                                <div
                                                                                    className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md"
                                                                                >
                                                                                    <div className="p-4 space-y-2">
                                                                                        {subCategoriesTwoBySubCategory[subcat.id].map((subcatTwo) => (
                                                                                            <button
                                                                                                key={subcatTwo.id}
                                                                                                onClick={subcatTwo.onClick}
                                                                                                className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200 hover:border hover:border-2 p-1 border-black"
                                                                                            >
                                                                                                {subcatTwo.label}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    {loadingCategories[navigationItems.find(item => item.index === activeDropdown)?.brandId]
                                                        ? 'Loading categories...'
                                                        : 'No categories available'
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {showCartPopup && (
                <div data-cart-popup>
                    <ShoppingCartPopup onClose={() => toggleCartPopup()} />
                </div>
            )}
        </>
    )
}