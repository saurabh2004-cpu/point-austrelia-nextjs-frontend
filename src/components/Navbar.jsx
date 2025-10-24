"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Search, ShoppingCart, Menu, X, User, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import useNavStateStore from "@/zustand/navigations"
import ShoppingCartPopup from "./CartPopup"
import { usePathname, useRouter } from "next/navigation"
import useUserStore from "@/zustand/user"
import axiosInstance from "@/axios/axiosInstance"
import useCartStore from "@/zustand/cartPopup"
import useWishlistStore from "@/zustand/wishList"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import { useCartPopupStateStore } from "@/zustand/cartPopupState"
import Link from "next/link"

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

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const router = useRouter()
  const currentUser = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  const currentCartItems = useCartStore((state) => state.currentItems);
  const setCartItems = useCartStore((state) => state.setCurrentItems);
  const currentWishlistItems = useWishlistStore((state) => state.currentWishlistItems);
  const setWishlistItems = useWishlistStore((state) => state.setCurrentWishlistItems);

  const [brands, setBrands] = useState([])
  const [categoriesByBrand, setCategoriesByBrand] = useState({})
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({})
  const [subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState({})
  const setFilters = useProductFiltersStore((state) => state.setFilters)
  const [brandId, setBrandId] = useState(null)
  const [brandSlug, setBrandSlug] = useState(null)

  const [showCompanyDropDown, setShowCompanyDropDown] = useState(false)

  const setCurrentIndex = useNavStateStore((state) => state.setCurrentIndex)
  const getCurrentIndex = useNavStateStore((state) => state.getCurrentIndex)
  const setUser = useUserStore((state) => state.setUser);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const desktopSearchRef = useClickOutside(() => {
    setIsDesktopSearchOpen(false);
  });
  const { showCartPopup, setShowCartPopup, toggleCartPopup } = useCartPopupStateStore();

  const isCheckoutPage = pathname === '/checkout';

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Loading state for route transitions
  const [isNavigating, setIsNavigating] = useState(false)

  // OPTIMIZATION 1: Fetch user only once on mount, not on every render
  useEffect(() => {
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

    if (currentUser === null || currentUser === undefined) {
      fetchCurentUser();
    }
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoading(false); // Set this immediately
    }
  }, [currentUser])

  // Use click outside hooks
  const userDropdownRef = useClickOutside(() => {
    setShowUserDropdown(false);
  });

  const mobileMenuRef = useClickOutside(() => {
    setIsMenuOpen(false);
  });

  const desktopDropdownRef = useClickOutside(() => {
    setActiveDropdown(null);
    setHoveredCategory(null);
    setHoveredSubcategory(null);
  });

  // OPTIMIZATION 3: Memoize handler functions with useCallback
  const handleUserDropdownToggle = useCallback(() => {
    setShowUserDropdown(prev => !prev);
    setShowCartPopup(false);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [setShowCartPopup]);

  const handleCartPopupToggle = useCallback(() => {
    toggleCartPopup();
    setShowUserDropdown(false);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [toggleCartPopup]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setShowUserDropdown(false);
    setShowCartPopup(false);
    setActiveDropdown(null);
  }, [setShowCartPopup]);

  // OPTIMIZATION 4: Debounce search
  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        setIsNavigating(true);
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchOpen(false);
      }
    }
  }, [searchQuery, router]);

  // Fetch all brands on component mount
  useEffect(() => {
    fetchBrands()
  }, [])

  // OPTIMIZATION 5: Add caching and memoization for API calls
  const fetchCategoriesForBrand = useCallback(async (brandId) => {
    if (categoriesByBrand[brandId]) return

    try {
      setLoadingCategories(prev => ({ ...prev, [brandId]: true }))
      const res = await axiosInstance.get(`category/get-categories-by-brand-id/${brandId}`)

      if (res.data.statusCode === 200) {
        setCategoriesByBrand(prev => ({
          ...prev,
          [brandId]: res.data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(prev => ({ ...prev, [brandId]: false }))
    }
  }, [categoriesByBrand])

  const fetchSubCategoriesForCategory = useCallback(async (categoryId) => {
    if (subCategoriesByCategory[categoryId]) return

    try {
      const res = await axiosInstance.get(`subcategory/get-sub-categories-by-category-id/${categoryId}`)

      if (res.data.statusCode === 200) {
        setSubCategoriesByCategory(prev => ({
          ...prev,
          [categoryId]: res.data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }, [subCategoriesByCategory])

  const fetchSubCategoriesTwoForSubCategory = useCallback(async (subCategoryId) => {
    if (subCategoriesTwoBySubCategory[subCategoryId]) return

    try {
      const res = await axiosInstance.get(`subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`)

      if (res.data.statusCode === 200) {
        setSubCategoriesTwoBySubCategory(prev => ({
          ...prev,
          [subCategoryId]: res.data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching subcategories two:', error)
    }
  }, [subCategoriesTwoBySubCategory])

  const fetchBrands = async () => {
    try {
      const res = await axiosInstance.get('brand/get-brands-list')

      if (res.data.statusCode === 200) {
        setBrands(res.data.data)
        setLoading(false)
      } else {
        setError(res.data.message)
        setLoading(false)
      }
    } catch (error) {
      setError(error.message)
      console.error("Error fetching brands:", error)
      setLoading(false)
    }
  }

  // OPTIMIZATION 6: Memoize navigation items
  const navigationItems = useMemo(() => {
    const items = [
      { label: "HOME", index: 0, link: '/' }
    ]

    brands.forEach((brand, idx) => {
      const categories = categoriesByBrand[brand._id] || []
      const brandRoute = `/brand/${brand.slug}`;

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
          subcategories: subCategoriesByCategory[cat._id]?.map(subCat => ({
            id: subCat._id,
            label: subCat.name,
            slug: subCat.slug,
            brandId: brand._id,
            brandSlug: brand.slug,
            link: `/${subCat.slug}`,
            subcategoriesTwo: subCategoriesTwoBySubCategory[subCat._id]?.map(subCatTwo => ({
              id: subCatTwo._id,
              label: subCatTwo.name,
              slug: subCatTwo.slug,
              brandId: brand._id,
              brandSlug: brand.slug,
              link: `/${subCatTwo.slug}`
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
        categories: categoriesWithColumns
      })
    })

    items.push({
      label: currentUser ? "COMPANY" : "CONTACT US",
      index: brands.length + 1,
      hasDropdown: true
    })

    return items
  }, [brands, categoriesByBrand, subCategoriesByCategory, subCategoriesTwoBySubCategory, currentUser])

  const handleBrandClick = useCallback((brandId, brandSlug) => {
    setActiveDropdown(null);
    setHoveredCategory(null);
    setHoveredSubcategory(null);
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    setShowCartPopup(false);
  }, [setShowCartPopup]);

  // Enhanced navigation handler with loading state
  const handleNavigation = useCallback((item) => {
    if (!item.hasDropdown) {
      setIsNavigating(true);
      setCurrentIndex(item.index)
      setActiveDropdown(null)
      setIsMenuOpen(false)
    } else {
      if (item.label === "COMPANY" || item.label === "CONTACT US") {
        if (!currentUser) {
          setIsNavigating(true);
          router.push('/contact-us');
          setActiveDropdown(null);
          setIsMenuOpen(false);
        } else {
          setShowCompanyDropDown(prev => !prev);
          setActiveDropdown(null);
        }
      } else {
        if (!currentUser && item.brandRoute) {
          setIsNavigating(true);
          router.push(item.brandRoute);
          setActiveDropdown(null);
          setIsMenuOpen(false);
        } else if (currentUser && item.brandId) {
          handleBrandClick(item.brandId, item.brandSlug);
          setActiveDropdown(null);
          setIsMenuOpen(false);
        }
      }
    }
  }, [currentUser, router, setCurrentIndex, handleBrandClick]);

  const companyDropdownRef = useClickOutside(() => {
    setShowCompanyDropDown(false);
  });

  // Enhanced category click handler with loading state
  const handleCategoryClick = useCallback((link, categoryId = null, subCategoryId = null, subCategoryTwoId = null, categorySlug = null, subCategorySlug = null, subCategoryTwoSlug = null) => {
    setIsNavigating(true);
    setActiveDropdown(null)
    setHoveredCategory(null)
    setHoveredSubcategory(null)
    setIsMenuOpen(false)
    setShowUserDropdown(false)
    setShowCartPopup(false)
    setFilters({
      categorySlug: categorySlug,
      subCategorySlug: subCategorySlug,
      subCategoryTwoSlug: subCategoryTwoSlug,
      categoryId: categoryId,
      subCategoryId: subCategoryId,
      subCategoryTwoId: subCategoryTwoId,
      brandId: brandId,
      brandSlug: brandSlug
    })
  }, [brandId, brandSlug, setFilters, setShowCartPopup]);

  const handleBrandHover = useCallback((brandId, index, brandSlug) => {
    if (currentUser) {
      setActiveDropdown(index)
      fetchCategoriesForBrand(brandId)
      setBrandId(brandId)
      setBrandSlug(brandSlug)
    }
  }, [currentUser, fetchCategoriesForBrand]);

  const handleCategoryHover = useCallback((categoryId) => {
    fetchSubCategoriesForCategory(categoryId)
  }, [fetchSubCategoriesForCategory]);

  const handleSubCategoryHover = useCallback((subCategoryId) => {
    fetchSubCategoriesTwoForSubCategory(subCategoryId)
  }, [fetchSubCategoriesTwoForSubCategory]);

  const fetchCustomersCart = useCallback(async () => {
    try {
      if (!currentUser || !currentUser._id) return;
      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)

      if (response.data.statusCode === 200) {
        const cartData = response.data.data;
        setCartItems(cartData.length);
      }
    } catch (error) {
      console.error('Error fetching customer cart:', error)
    }
  }, [currentUser, setCartItems]);

  const fetchCustomersWishList = useCallback(async () => {
    try {
      if (!currentUser || !currentUser._id) return
      const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

      if (response.data.statusCode === 200) {
        const wishlistData = response.data.data;
        setWishlistItems(wishlistData.length);
      }
    }
    catch (error) {
      console.error('Error fetching customer wishlist:', error)
    }
  }, [currentUser, setWishlistItems]);

  const handleLogout = useCallback(async () => {
    try {
      setIsNavigating(true);
      useUserStore.getState().clearUser();
      setWishlistItems(0);
      setCartItems(0);
      setShowUserDropdown(false);

      try {
        const response = await axiosInstance.post('user/logout');
        if (response.data.statusCode === 200) {
          console.log('Logout successful');
          setCartItems(0);
        }
      } catch (error) {
        console.error('Error during logout API call:', error);
      }

      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [router, setCartItems, setWishlistItems]);

  const handleMyAccount = useCallback(() => {
    setIsNavigating(true);
    setShowUserDropdown(false);
    router.push('/my-account-review');
  }, [router]);

  // OPTIMIZATION 7: Only fetch cart/wishlist once when user is available
  useEffect(() => {
    if (!currentUser?._id) return;

    // Delay these non-critical fetches
    const timer = setTimeout(() => {
      if (currentCartItems === 0) {
        fetchCustomersCart();
      }
      if (currentWishlistItems === 0) {
        fetchCustomersWishList();
      }
    }, 100); // Small delay to not block navigation

    return () => clearTimeout(timer);
  }, [currentUser?._id]); // Remove other dependencies

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoading(false)
    }
  }, [currentUser])

  // Handle route changes to show/hide loading bar
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
    };

    const handleRouteChangeComplete = () => {
      setIsNavigating(false);
    };

    const handleRouteChangeError = () => {
      setIsNavigating(false);
    };

    // Listen to route changes
    window.addEventListener('beforeunload', handleRouteChangeStart);
    
    // Use setTimeout to handle route completion (Next.js doesn't have built-in route events in App Router)
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1000);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
      clearTimeout(timer);
    };
  }, [pathname]); // Re-run when pathname changes

  useEffect(() => {
    // Prefetch login/signup pages
    router.prefetch('/login');
    router.prefetch('/sign-up');
    router.prefetch('/wishlist');
    router.prefetch('/cart');
  }, [router]);

  const groupCategoriesByColumn = (categories) => {
    const columns = {}
    categories.forEach(cat => {
      const col = cat.column || 1
      if (!columns[col]) columns[col] = []
      columns[col].push(cat)
    })
    return Object.values(columns)
  }

  if (loading) {
    return null
  }

  return (
    <>
      {/* Enhanced Loading Bar with smooth animation */}
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#E9098D] to-[#2d2c70] animate-loading-bar" 
               style={{
                 animation: 'loadingBar 1.5s ease-in-out infinite'
               }} />
        </div>
      )}

      {/* Add CSS animation for the loading bar */}
      <style jsx>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-loading-bar {
          animation: loadingBar 1.5s ease-in-out infinite;
        }
      `}</style>

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
                    {/* OPTIMIZATION 9: Add prefetch to critical links */}
                    <Link 
                      href="/login" 
                      prefetch={true} 
                      className="font-Spartan transition-colors duration-200 group-hover:text-[#E9098D]"
                      onClick={() => setIsNavigating(true)}
                    >
                      LOGIN
                    </Link>
                  </div>
                  <span className="font-Spartan text-[#2d2c70] mx-4">|</span>
                  <Link 
                    href="/sign-up" 
                    prefetch={true} 
                    className="font-Spartan text-[#2d2c70] cursor-pointer transition-colors duration-200 hover:text-[#E9098D]"
                    onClick={() => setIsNavigating(true)}
                  >
                    SIGN UP
                  </Link>
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
                      <span className="font-semibold text-black group-hover:text-[#E9098D]">{currentUser.contactName}</span>
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
                <Link 
                  href="/" 
                  prefetch={true}
                  onClick={() => setIsNavigating(true)}
                >
                  <Image
                    src="/logo/point-austrelia-logo.png"
                    alt="Logo"
                    width={219}
                    height={100}
                    className="h-12 md:h-16 lg:h-20 w-auto cursor-pointer"
                    priority
                  />
                </Link>
              </div>

              {/* Right - Search, Cart, and Mobile Actions */}
              <div className="flex items-center space-x-2 lg:space-x-4">

                {currentUser && !isCheckoutPage && (
                  <div className="flex lg:hidden items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="p-2"
                    >
                      <Search className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>

                    <Link 
                      href="/wishlist" 
                      prefetch={true}
                      className="relative bg-white group p-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsNavigating(true);
                      }}
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
                        {currentWishlistItems || 0}
                      </span>
                    </Link>

                    <Link 
                      href="/cart" 
                      prefetch={true}
                      className="relative bg-white group p-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsNavigating(true);
                      }}
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
                      <Badge className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 p-0 text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] flex items-center justify-center">
                        {currentCartItems || 0}
                      </Badge>
                    </Link>
                  </div>
                )}

                {/* Desktop icons... rest of the component remains the same */}
                <div className="hidden lg:flex lg:space-x-10 items-center">
                  {currentUser && !isCheckoutPage && (
                    <div className="hidden lg:flex items-center" ref={desktopSearchRef}>
                      {!isDesktopSearchOpen &&
                        <button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDesktopSearchOpen(!isDesktopSearchOpen)}
                          className="p-2 mr-2 flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70] hover:text-[#E9098D] cursor-pointer group"
                        >
                          <Search className="w-4 h-4 text-[#2d2c70] hover:text-[#E9098D] group-hover:text-[#E9098D]" />
                          Search
                        </button>}

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
                  )}

                  <div className="flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70]">
                  </div>

                  {currentUser && !isCheckoutPage && (
                    <Link 
                      href={'/wishlist'} 
                      prefetch={true}
                      className="relative bg-white group"
                      data-navbar-cart-button
                      onClick={() => setIsNavigating(true)}
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
                        {currentWishlistItems || 0}
                      </span>
                    </Link>
                  )}

                  {currentUser && !isCheckoutPage && (
                    <button
                      className="relative bg-white group"
                      onClick={handleCartPopupToggle}
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
                      <Badge className="absolute -top-1 -right-2 h-4 w-4 p-0 text-xs bg-[#2d2c70] group-hover:bg-[#E9098D]">
                        {currentCartItems || 0}
                      </Badge>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Search Bar */}
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
                      handleBrandHover(item.brandId, item.index, item.brandSlug);
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
                {!item.hasDropdown ? (
                  <Link
                    href={item.link || '/'}
                    prefetch={true}
                    className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]"
                    onClick={() => setIsNavigating(true)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavigation(item)}
                    className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]"
                  >
                    {item.label}
                  </button>
                )}

                {/* COMPANY Dropdown for Desktop */}
                {item.label === "COMPANY" && showCompanyDropDown && currentUser && (
                  <div
                    className="absolute top-full left-0  w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    ref={companyDropdownRef}
                  >
                    <div className="py-1">
                      {brands.map((brand) => (
                        <Link
                          key={brand._id}
                          href={`/brand/${brand.slug}`}
                          prefetch={true}
                          onClick={() => {
                            setShowCompanyDropDown(false);
                            setIsNavigating(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200"
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <Link
                        href="/contact-us"
                        prefetch={true}
                        onClick={() => {
                          setShowCompanyDropDown(false);
                          setIsNavigating(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200 border-t border-gray-200"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile & Tablet Navigation Menu */}
          {isMenuOpen && (
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.index}>
                  {!item.hasDropdown ? (
                    <Link
                      href={item.link || '/'}
                      prefetch={true}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsNavigating(true);
                      }}
                      className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100 flex items-center justify-between"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.hasDropdown) {
                          if (item.label === "COMPANY") {
                            if (!currentUser) {
                              setIsNavigating(true);
                              router.push('/contact-us');
                              setIsMenuOpen(false);
                            } else {
                              setActiveDropdown(activeDropdown === item.index ? null : item.index)
                            }
                          } else {
                            if (currentUser && item.brandId) {
                              handleBrandClick(item.brandId, item.brandSlug);
                              setIsMenuOpen(false);
                            } else if (!currentUser && item.brandRoute) {
                              setIsNavigating(true);
                              router.push(item.brandRoute);
                              setIsMenuOpen(false);
                            }
                          }
                        } else {
                          handleNavigation(item)
                        }
                      }}
                      className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100 flex items-center justify-between"
                    >
                      {item.label}
                      {item.hasDropdown && currentUser && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.index ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  )}

                  {/* COMPANY Dropdown Menu for Mobile */}
                  {item.label === "COMPANY" && activeDropdown === item.index && currentUser && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                      {brands.map((brand) => (
                        <Link
                          key={brand._id}
                          href={`/brand/${brand.slug}`}
                          prefetch={true}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsNavigating(true);
                          }}
                          className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200"
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <Link
                        href="/contact-us"
                        prefetch={true}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsNavigating(true);
                        }}
                        className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200 border-t border-gray-200 pt-2 mt-2"
                      >
                        Contact Us
                      </Link>
                    </div>
                  )}

                  {/* Brand Dropdown */}
                  {item.hasDropdown && item.label !== "COMPANY" && activeDropdown === item.index && item.categories && currentUser && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 max-h-96 overflow-y-auto">
                      {item.categories.length > 0 ? (
                        item.categories.map((category, idx) => (
                          <div key={category.id || idx}>
                            <Link
                              href={`/${category.slug}`}
                              prefetch={true}
                              onClick={() => {
                                handleCategoryClick(category.link, category.id, null, null, category.slug, null, null, category.brandId);
                                setIsNavigating(true);
                              }}
                              className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200 flex items-center justify-between"
                            >
                              {category.label}
                              {category.subcategories && (
                                <ChevronRight className={`w-4 h-4 transition-transform ${hoveredCategory === category.id ? 'rotate-90' : ''}`} />
                              )}
                            </Link>

                            {category.subcategories && hoveredCategory === category.id && (
                              <div className="ml-4 mt-1 space-y-1 border-l-2 border-pink-200 pl-3">
                                {category.subcategories.map((subcat) => (
                                  <Link
                                    key={subcat.id}
                                    href={`/${subcat.slug}`}
                                    prefetch={true}
                                    onClick={() => {
                                      handleCategoryClick(subcat.link, null, subcat.id, null, null, subcat.slug, null, subcat.brandId);
                                      setIsNavigating(true);
                                    }}
                                    className="block w-full text-left py-1.5 text-xs text-[#E9098D] hover:text-[#2d2c70] transition-colors duration-200"
                                  >
                                    {subcat.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-sm text-gray-500">
                          {loadingCategories[item.brandId] ? 'Loading categories...' : 'No categories available'}
                        </div>
                      )}
                    </div>
                  )}
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
                            <Link
                              href={`/${category.slug}`}
                              prefetch={true}
                              onClick={() => {
                                handleCategoryClick(category.link, category.id, null, null, category.slug, null, null);
                                setIsNavigating(true);
                              }}
                              className={`text-left text-sm font-medium transition-colors duration-200 flex items-center justify-between w-full group ${category.label === "NEW!" || category.label === "SALE"
                                ? "text-[#E9098D] font-bold"
                                : "text-[#2d2c70] hover:text-[#E9098D]"
                                }`}
                            >
                              <span>{category.label}</span>
                              {(category.subcategories || subCategoriesByCategory[category.id]) && (
                                <ChevronRight className="w-4 h-4 opacity-100 transition-opacity" />
                              )}
                            </Link>

                            {/* Subcategory Popup */}
                            {(category.subcategories || subCategoriesByCategory[category.id]) && hoveredCategory === `${colIdx}-${catIdx}` && (
                              <div
                                className="absolute left-2/3 top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md"
                                onMouseEnter={() => setHoveredCategory(`${colIdx}-${catIdx}`)}
                              >
                                <div className="p-4 space-y-2 ">
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
                                      <Link
                                        href={`/${subcat.slug}`}
                                        prefetch={true}
                                        onClick={() => {
                                          handleCategoryClick(subcat.link, null, subcat.id, null, null, subcat.slug, null);
                                          setIsNavigating(true);
                                        }}
                                        className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between group"
                                      >
                                        <span>{subcat.label}</span>
                                        {subCategoriesTwoBySubCategory[subcat.id] && (
                                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                      </Link>

                                      {/* SubcategoryTwo Popup */}
                                      {subCategoriesTwoBySubCategory[subcat.id] && hoveredSubcategory === subcat.id && (
                                        <div
                                          className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md"
                                        >
                                          <div className="p-4 space-y-2">
                                            {subCategoriesTwoBySubCategory[subcat.id].map((subcatTwo) => (
                                              <Link
                                                key={subcatTwo.id}
                                                href={`/${subcatTwo.slug}`}
                                                prefetch={true}
                                                onClick={() => {
                                                  handleCategoryClick(subcatTwo.link, null, null, subcatTwo.id, null, subcatTwo.slug);
                                                  setIsNavigating(true);
                                                }}
                                                className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200 hover:border hover:border-2 p-1 border-black"
                                              >
                                                {subcatTwo.label}
                                              </Link>
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
          <ShoppingCartPopup onClose={() => setShowCartPopup(false)} />
        </div>
      )}
    </>
  )
}