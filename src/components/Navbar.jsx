"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Search, Menu, X, User, ChevronDown, ChevronRight } from "lucide-react"
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

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
  const pathname = usePathname()

  const currentCartItems = useCartStore((state) => state.currentItems);
  const setCartItems = useCartStore((state) => state.setCurrentItems);
  const currentWishlistItems = useWishlistStore((state) => state.currentWishlistItems);
  const setWishlistItems = useWishlistStore((state) => state.setCurrentWishlistItems);

  const [brands, setBrands] = useState([])
  const [categoriesByBrand, setCategoriesByBrand] = useState({})
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({})
  const [subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState({})
  const setFilters = useProductFiltersStore((state) => state.setFilters)
  const [brandId, setBrandId] = useState(null)
  const [brandSlug, setBrandSlug] = useState(null)
  const [showCompanyDropDown, setShowCompanyDropDown] = useState(false)

  const [mobileActiveBrand, setMobileActiveBrand] = useState(null)
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null)
  const [mobileActiveSubcategory, setMobileActiveSubcategory] = useState(null)

  const setCurrentIndex = useNavStateStore((state) => state.setCurrentIndex)
  const setUser = useUserStore((state) => state.setUser);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const desktopSearchRef = useClickOutside(() => setIsDesktopSearchOpen(false));
  const { showCartPopup, setShowCartPopup, toggleCartPopup } = useCartPopupStateStore();
  const isCheckoutPage = pathname === '/checkout';
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('user/get-current-user');
        if (response.data.statusCode === 200 && response.data.data.inactive == false) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser === null || currentUser === undefined) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [setUser]);

  const userDropdownRef = useClickOutside(() => setShowUserDropdown(false));
  const mobileMenuRef = useClickOutside(() => setIsMenuOpen(false));

  const handleFastNavigation = useCallback((path) => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    setShowCartPopup(false);
    setActiveDropdown(null);
    setShowCompanyDropDown(false);
    setMobileActiveBrand(null);
    setMobileActiveCategory(null);
    setMobileActiveSubcategory(null);
    router.push(path);
  }, [router, setShowCartPopup]);

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

  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        handleFastNavigation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchOpen(false);
      }
    }
  }, [searchQuery, handleFastNavigation]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axiosInstance.get('brand/get-brands-list')
        if (res.data.statusCode === 200) {
          setBrands(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      }
    }
    fetchBrands()
  }, [])

  const fetchCategoriesForBrand = useCallback(
    debounce(async (brandId) => {
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
    }, 200),
    [categoriesByBrand]
  );

  const fetchSubCategoriesForCategory = useCallback(
    debounce(async (categoryId) => {
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
    }, 150),
    [subCategoriesByCategory]
  );

  const fetchSubCategoriesTwoForSubCategory = useCallback(
    debounce(async (subCategoryId) => {
      if (subCategoriesTwoBySubCategory[subCategoryId]) return
      try {
        const res = await axiosInstance.get(`subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`)
        if (res.data.statusCode === 200 && res.data.data) {
          setSubCategoriesTwoBySubCategory(prev => ({
            ...prev,
            [subCategoryId]: res.data.data
          }))
        } else {
          setSubCategoriesTwoBySubCategory(prev => ({
            ...prev,
            [subCategoryId]: []
          }))
        }
      } catch (error) {
        console.error('Error fetching subcategories two:', error)
        setSubCategoriesTwoBySubCategory(prev => ({
          ...prev,
          [subCategoryId]: []
        }))
      }
    }, 150),
    [subCategoriesTwoBySubCategory]
  );

  const navigationItems = useMemo(() => {
    const items = [{ label: "HOME", index: 0, link: '/' }]
    brands.forEach((brand, idx) => {
      const categories = categoriesByBrand[brand._id] || []
      const brandRoute = `/brand/${brand.slug}`;
      const categoriesWithColumns = categories.map((cat, catIdx) => {
        const itemsPerColumn = Math.ceil(categories.length / 5)
        const column = Math.floor(catIdx / itemsPerColumn) + 1
        const hasSubcategories = cat.hasChild || (subCategoriesByCategory[cat._id] && subCategoriesByCategory[cat._id].length > 0);
        return {
          id: cat._id,
          label: cat.name,
          slug: cat.slug,
          brandId: brand._id,
          brandSlug: brand.slug,
          link: `/${cat.slug}`,
          column: column,
          hasChild: hasSubcategories,
          subcategories: subCategoriesByCategory[cat._id]?.map(subCat => {
            const hasSubcategoriesTwo = subCat.hasChild || (subCategoriesTwoBySubCategory[subCat._id] && subCategoriesTwoBySubCategory[subCat._id].length > 0);
            return {
              id: subCat._id,
              label: subCat.name,
              slug: subCat.slug,
              brandId: brand._id,
              brandSlug: brand.slug,
              link: `/${subCat.slug}`,
              hasChild: hasSubcategoriesTwo,
              subcategoriesTwo: subCategoriesTwoBySubCategory[subCat._id]?.map(subCatTwo => ({
                id: subCatTwo._id,
                label: subCatTwo.name,
                slug: subCatTwo.slug,
                brandId: brand._id,
                brandSlug: brand.slug,
                link: `/${subCatTwo.slug}`,
                hasChild: false
              }))
            }
          })
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

  const handleNavigation = useCallback((item) => {
    if (!item.hasDropdown) {
      setCurrentIndex(item.index)
      handleFastNavigation(item.link);
    } else {
      if (item.label === "COMPANY" || item.label === "CONTACT US") {
        if (!currentUser) {
          handleFastNavigation('/contact-us');
        } else {
          setShowCompanyDropDown(prev => !prev);
          setActiveDropdown(null);
        }
      }
    }
  }, [currentUser, handleFastNavigation, setCurrentIndex]);

  const companyDropdownRef = useClickOutside(() => setShowCompanyDropDown(false));

  const handleCategoryClick = useCallback((link, categoryId = null, subCategoryId = null, subCategoryTwoId = null, categorySlug = null, subCategorySlug = null, subCategoryTwoSlug = null) => {
    setActiveDropdown(null)
    setHoveredCategory(null)
    setHoveredSubcategory(null)
    setIsMenuOpen(false)
    setShowUserDropdown(false)
    setShowCartPopup(false)
    setMobileActiveBrand(null)
    setMobileActiveCategory(null)
    setMobileActiveSubcategory(null)
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
    handleFastNavigation(link);
  }, [brandId, brandSlug, setFilters, setShowCartPopup, handleFastNavigation]);

  const handleBrandHover = useCallback((brandId, index, brandSlug) => {
    if (currentUser) {
      setActiveDropdown(index)
      fetchCategoriesForBrand(brandId)
      setBrandId(brandId)
      setBrandSlug(brandSlug)
    }
    if (!currentUser) {
      handleFastNavigation(`/brand/${brandSlug}`);
      return;
    }
  }, [currentUser, fetchCategoriesForBrand]);

  const handleCategoryHover = useCallback((categoryId) => {
    fetchSubCategoriesForCategory(categoryId)
  }, [fetchSubCategoriesForCategory]);

  const handleSubCategoryHover = useCallback((subCategoryId) => {
    fetchSubCategoriesTwoForSubCategory(subCategoryId)
  }, [fetchSubCategoriesTwoForSubCategory]);

  const handleMobileBrandClick = useCallback((brandId, brandSlug, brandIndex) => {
    if (!currentUser) {
      handleFastNavigation(`/brand/${brandSlug}`);
      return;
    }
    if (mobileActiveBrand === brandIndex) {
      setMobileActiveBrand(null);
      setMobileActiveCategory(null);
      setMobileActiveSubcategory(null);
    } else {
      setMobileActiveBrand(brandIndex);
      setMobileActiveCategory(null);
      setMobileActiveSubcategory(null);
      fetchCategoriesForBrand(brandId);
      setBrandId(brandId);
      setBrandSlug(brandSlug);
    }
  }, [currentUser, mobileActiveBrand, fetchCategoriesForBrand, handleFastNavigation]);

  const fetchCustomersCart = useCallback(async () => {
    try {
      if (!currentUser?._id) return;
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
      if (!currentUser?._id) return
      const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)
      if (response.data.statusCode === 200) {
        const wishlistData = response.data.data;
        setWishlistItems(wishlistData.length);
      }
    } catch (error) {
      console.error('Error fetching customer wishlist:', error)
    }
  }, [currentUser, setWishlistItems]);

  const handleLogout = useCallback(async () => {
    try {
      useUserStore.getState().clearUser();
      setWishlistItems(0);
      setCartItems(0);
      setShowUserDropdown(false);
      try {
        await axiosInstance.post('user/logout');
      } catch (error) {
        console.error('Error during logout API call:', error);
      }
      handleFastNavigation('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [handleFastNavigation, setCartItems, setWishlistItems]);

  const handleMyAccount = useCallback(() => {
    setShowUserDropdown(false);
    handleFastNavigation('/my-account-review');
  }, [handleFastNavigation]);

  useEffect(() => {
    if (!currentUser?._id) return;
    const fetchData = async () => {
      if (currentCartItems === 0) await fetchCustomersCart();
      if (currentWishlistItems === 0) await fetchCustomersWishList();
    };
    fetchData();
  }, [currentUser?._id, currentCartItems, currentWishlistItems, fetchCustomersCart, fetchCustomersWishList]);

  useEffect(() => {
    const prefetchPages = ['/login', '/sign-up', '/wishlist', '/cart', '/contact-us'];
    prefetchPages.forEach(page => router.prefetch(page));
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

  if (loading) return null

  return (
    <>
      <nav className="w-full bg-white md:border-b md:border-b-1 border-[#2d2c70]">
        <div className="border-b border-[#2d2c70] border-b-1 mt-2 py-2 md:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-[60px] md:h-18">
              <div className="flex items-center lg:hidden">
                <Button variant="ghost" size="sm" onClick={handleMobileMenuToggle} className="p-2">
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>

              {!currentUser ? (
                <div className="hidden lg:flex text-[1rem] font-[600] text-[#2d2c70] items-center ml-20 space-x-1 text-sm">
                  <div className="group flex gap-1 items-center cursor-pointer">
                    <User fill="currentColor" className="w-4 h-4 mb-0 mx-2 text-[#2d2c70] transition-colors duration-200 group-hover:text-[#E9098D]" />
                    <Link href="/login" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/login'); }} className="font-Spartan transition-colors duration-200 group-hover:text-[#E9098D]">LOGIN</Link>
                  </div>
                  <span className="font-Spartan text-[#2d2c70] mx-4">|</span>
                  <Link href="/sign-up" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/sign-up'); }} className="font-Spartan text-[#2d2c70] cursor-pointer transition-colors duration-200 hover:text-[#E9098D]">SIGN UP</Link>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 text-[1rem] font-medium ml-20 relative">
                  <span className="text-[#2d2c70] font-medium">Welcome</span>
                  <div className="relative" ref={userDropdownRef}>
                    <button onClick={handleUserDropdownToggle} className="flex hover:cursor-pointer items-center gap-2 hover:text-[#E9098D] transition-colors duration-200 group">
                      <User className="w-4 h-4 text-gray-600 group-hover:text-[#E9098D]" />
                      <span className="font-semibold text-black group-hover:text-[#E9098D]">{currentUser?.customerName || currentUser?.contactName}</span>
                      <ChevronDown strokeWidth={3} className={`w-4 h-4 text-[#2d2c70] mt-1 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showUserDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <button onClick={handleMyAccount} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200">My Account</button>
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200">Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center flex-1 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                <Link href="/" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/'); }}>
                  <Image src="/logo/point-austrelia-logo.png" alt="Logo" width={219} height={100} className="h-12 md:h-16 lg:h-20 w-auto cursor-pointer" priority />
                </Link>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                {currentUser && !isCheckoutPage && (
                  <div className="flex lg:hidden items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2">
                      <Search className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <Link href="/wishlist" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/wishlist'); setIsMenuOpen(false); }} className="relative bg-white group p-1">
                      <svg width="18" height="17" viewBox="0 0 21 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200">
                        <path d="M14.8633 0.526367C17.9009 0.526367 20.3633 3.02637 20.3633 6.52637C20.3633 13.5264 12.8633 17.5264 10.3633 19.0264C7.86328 17.5264 0.363281 13.5264 0.363281 6.52637C0.363281 3.02637 2.86328 0.526367 5.86328 0.526367C7.72325 0.526367 9.36328 1.52637 10.3633 2.52637C11.3633 1.52637 13.0033 0.526367 14.8633 0.526367ZM11.2972 16.1302C12.1788 15.5749 12.9733 15.0219 13.7182 14.4293C16.697 12.0594 18.3633 9.46987 18.3633 6.52637C18.3633 4.16713 16.8263 2.52637 14.8633 2.52637C13.7874 2.52637 12.6226 3.09548 11.7775 3.94058L10.3633 5.3548L8.94908 3.94058C8.10396 3.09548 6.93918 2.52637 5.86328 2.52637C3.92234 2.52637 2.36328 4.18287 2.36328 6.52637C2.36328 9.46987 4.02955 12.0594 7.00842 14.4293C7.75328 15.0219 8.54778 15.5749 9.42938 16.1302C9.72788 16.3183 10.0244 16.4993 10.3633 16.7016C10.7022 16.4993 10.9987 16.3183 11.2972 16.1302Z" />
                      </svg>
                      <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 flex items-center justify-center rounded-full text-white text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200">{currentWishlistItems || 0}</span>
                    </Link>
                    <Link href="/cart" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/cart'); setIsMenuOpen(false); }} className="relative bg-white group p-1 hover:cursor-pointer">
                      <svg width="18" height="17" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200">
                        <path d="M18.8889 18.5H1.11111C0.497466 18.5 0 18.0859 0 17.575V0.925C0 0.414141 0.497466 0 1.11111 0H18.8889C19.5026 0 20 0.414141 20 0.925V17.575C20 18.0859 19.5026 18.5 18.8889 18.5ZM17.7778 16.65V1.85H2.22222V16.65H17.7778ZM6.66666 3.7V5.55C6.66666 7.08259 8.15901 8.325 10 8.325C11.8409 8.325 13.3333 7.08259 13.3333 5.55V3.7H15.5556V5.55C15.5556 8.10429 13.0682 10.175 10 10.175C6.93175 10.175 4.44444 8.10429 4.44444 5.55V3.7H6.66666Z" />
                      </svg>
                      <Badge className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 p-0 text-[10px] md:text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] flex items-center justify-center">{currentCartItems || 0}</Badge>
                    </Link>
                  </div>
                )}

                <div className="hidden lg:flex lg:space-x-10 items-center">
                  {currentUser && !isCheckoutPage && (
                    <div className="hidden lg:flex items-center" ref={desktopSearchRef}>
                      {!isDesktopSearchOpen && <button variant="ghost" size="sm" onClick={() => setIsDesktopSearchOpen(!isDesktopSearchOpen)} className="p-2 mr-2 flex items-center text-[1rem] font-semibold gap-[8px] text-[#2d2c70] hover:text-[#E9098D] cursor-pointer group">
                        <Search className="w-4 h-4 text-[#2d2c70] hover:text-[#E9098D] group-hover:text-[#E9098D]" />Search</button>}
                      {isDesktopSearchOpen && currentUser && (
                        <div className="flex items-center relative w-64">
                          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearch} className="pr-10 border-[#2d2c70] focus:border-[#E9098D]" autoFocus />
                          <Button variant="ghost" size="sm" onClick={handleSearch} className="absolute right-0 h-full px-3 hover:bg-transparent">
                            <Search className="w-4 h-4 text-[#2d2c70] hover:text-[#E9098D]" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {currentUser && !isCheckoutPage && (
                    <>
                      <Link href={'/wishlist'} prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/wishlist'); }} className="relative bg-white group">
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200">
                          <path d="M14.8633 0.526367C17.9009 0.526367 20.3633 3.02637 20.3633 6.52637C20.3633 13.5264 12.8633 17.5264 10.3633 19.0264C7.86328 17.5264 0.363281 13.5264 0.363281 6.52637C0.363281 3.02637 2.86328 0.526367 5.86328 0.526367C7.72325 0.526367 9.36328 1.52637 10.3633 2.52637C11.3633 1.52637 13.0033 0.526367 14.8633 0.526367ZM11.2972 16.1302C12.1788 15.5749 12.9733 15.0219 13.7182 14.4293C16.697 12.0594 18.3633 9.46987 18.3633 6.52637C18.3633 4.16713 16.8263 2.52637 14.8633 2.52637C13.7874 2.52637 12.6226 3.09548 11.7775 3.94058L10.3633 5.3548L8.94908 3.94058C8.10396 3.09548 6.93918 2.52637 5.86328 2.52637C3.92234 2.52637 2.36328 4.18287 2.36328 6.52637C2.36328 9.46987 4.02955 12.0594 7.00842 14.4293C7.75328 15.0219 8.54778 15.5749 9.42938 16.1302C9.72788 16.3183 10.0244 16.4993 10.3633 16.7016C10.7022 16.4993 10.9987 16.3183 11.2972 16.1302Z" />
                        </svg>
                        <span className={`absolute -top-2 -right-3 flex items-center justify-center rounded-full text-white text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200 ${(currentWishlistItems || 0) > 99 ? 'min-w-6 h-6 px-1 -right-4' : 'min-w-5 h-5 px-1 -right-3'} ${(currentWishlistItems || 0) > 999 ? 'min-w-7 h-6 px-1 -right-4 text-[10px]' : ''}`}>{currentWishlistItems > 999 ? '999+' : currentWishlistItems || 0}</span>
                      </Link>

                      <button className="relative bg-white group" onClick={handleCartPopupToggle}>
                        <svg width="20" height="19" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2d2c70] group-hover:text-[#E9098D] transition-colors duration-200">
                          <path d="M18.8889 18.5H1.11111C0.497466 18.5 0 18.0859 0 17.575V0.925C0 0.414141 0.497466 0 1.11111 0H18.8889C19.5026 0 20 0.414141 20 0.925V17.575C20 18.0859 19.5026 18.5 18.8889 18.5ZM17.7778 16.65V1.85H2.22222V16.65H17.7778ZM6.66666 3.7V5.55C6.66666 7.08259 8.15901 8.325 10 8.325C11.8409 8.325 13.3333 7.08259 13.3333 5.55V3.7H15.5556V5.55C15.5556 8.10429 13.0682 10.175 10 10.175C6.93175 10.175 4.44444 8.10429 4.44444 5.55V3.7H6.66666Z" />
                        </svg>
                        <span className={`absolute -top-2 -right-3 flex items-center justify-center rounded-full text-white text-xs bg-[#2d2c70] group-hover:bg-[#E9098D] transition-colors duration-200 ${(currentCartItems || 0) > 99 ? 'min-w-6 h-6 px-1 -right-4' : 'min-w-5 h-5 px-1 -right-3'} ${(currentCartItems || 0) > 999 ? 'min-w-7 h-6 px-1 -right-4 text-[10px]' : ''}`}>{currentCartItems > 999 ? '999+' : currentCartItems || 0}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="lg:hidden border-b border-[#2d2c70] p-4">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearch} className="flex-1 border-[#2d2c70] focus:border-[#E9098D]" autoFocus />
              <Button variant="ghost" size="sm" onClick={handleSearch} className="p-2">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-2 relative">
          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center space-x-[36px] h-14">
            {navigationItems.map((item) => (
              <div key={item.index} className="relative h-full flex items-center px-2" onMouseEnter={() => {
                if (item.hasDropdown && currentUser) {
                  if (item.brandId) {
                    handleBrandHover(item.brandId, item.index, item.brandSlug);
                  } else if (item.label === "COMPANY") {
                    setShowCompanyDropDown(true);
                  } else {
                    setActiveDropdown(item.index)
                  }
                }
              }} onMouseLeave={(e) => {
                const relatedTarget = e.relatedTarget;
                const dropdownElement = document.querySelector('[data-brand-dropdown]');
                if (!dropdownElement || !dropdownElement.contains(relatedTarget)) {
                  if (item.label === "COMPANY") {
                    setShowCompanyDropDown(false);
                  }
                }
              }}>
                {!item.hasDropdown ? (
                  <Link href={item.link || '/'} prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation(item.link || '/'); }} className="text-[1rem] hover:cursor-pointer font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]">{item.label}</Link>
                ) : (
                  <button onClick={() => {
                    // For brands when logged out, navigate directly to brand page
                    if (item.brandId && !currentUser) {
                      handleFastNavigation(`/brand/${item.brandSlug}`);
                    } else {
                      handleNavigation(item)
                    }
                  }} className="text-[1rem] font-semibold hover:cursor-pointer text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]">{item.label}</button>
                )}

                {item.label === "COMPANY" && showCompanyDropDown && currentUser && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50" ref={companyDropdownRef}>
                    <div className="py-1">
                      {brands.map((brand) => (
                        <Link key={brand._id} href={`/brand/${brand.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation(`/brand/${brand.slug}`); setShowCompanyDropDown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200">{brand.name}</Link>
                      ))}
                      <Link href="/contact-us" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/contact-us'); setShowCompanyDropDown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E9098D] transition-colors duration-200 border-t border-gray-200">Contact Us</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden space-y-2 py-4" ref={mobileMenuRef}>
              {navigationItems.map((item) => (
                <div key={item.index}>
                  {!item.hasDropdown ? (
                    <Link href={item.link || '/'} prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation(item.link || '/'); setIsMenuOpen(false); }} className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100">{item.label}</Link>
                  ) : (
                    <>
                      <button onClick={() => {
                        if (item.label === "COMPANY") {
                          if (!currentUser) {
                            handleFastNavigation('/contact-us');
                            setIsMenuOpen(false);
                          } else {
                            setActiveDropdown(activeDropdown === item.index ? null : item.index)
                          }
                        } else if (item.brandId) {
                          handleMobileBrandClick(item.brandId, item.brandSlug, item.index);
                        } else {
                          handleNavigation(item)
                        }
                      }} className="flex items-center justify-between w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100">
                        {item.label}
                        {((item.hasDropdown && currentUser && item.label !== "COMPANY") || (item.label === "COMPANY" && currentUser)) && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${(activeDropdown === item.index || mobileActiveBrand === item.index) ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {item.label === "COMPANY" && activeDropdown === item.index && currentUser && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                          {brands.map((brand) => (
                            <Link key={brand._id} href={`/brand/${brand.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation(`/brand/${brand.slug}`); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200">{brand.name}</Link>
                          ))}
                          <Link href="/contact-us" prefetch={true} onClick={(e) => { e.preventDefault(); handleFastNavigation('/contact-us'); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200 border-t border-gray-200 pt-2 mt-2">Contact Us</Link>
                        </div>
                      )}

                      {item.brandId && mobileActiveBrand === item.index && currentUser && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 max-h-96 overflow-y-auto">
                          {item.categories && item.categories.length > 0 ? (
                            item.categories.map((category) => (
                              <div key={category.id}>
                                <div className="flex items-center justify-between">
                                  <Link href={`/${category.slug}`} prefetch={true} onClick={(e) => {
                                    e.preventDefault();
                                    handleCategoryClick(category.link, category.id, null, null, category.slug, null, null);
                                  }} className="flex-1 block text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200">{category.label}</Link>
                                  {category.hasChild && (
                                    <button onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (mobileActiveCategory === category.id) {
                                        setMobileActiveCategory(null);
                                        setMobileActiveSubcategory(null);
                                      } else {
                                        setMobileActiveCategory(category.id);
                                        setMobileActiveSubcategory(null);
                                        fetchSubCategoriesForCategory(category.id);
                                      }
                                    }} className="p-2">
                                      <ChevronRight className={`w-4 h-4 transition-transform ${mobileActiveCategory === category.id ? 'rotate-90' : ''}`} />
                                    </button>
                                  )}
                                </div>

                                {category.hasChild && mobileActiveCategory === category.id && category.subcategories && (
                                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-pink-200 pl-3">
                                    {category.subcategories.map((subcat) => (
                                      <div key={subcat.id}>
                                        <div className="flex items-center justify-between">
                                          <Link href={`/${subcat.slug}`} prefetch={true} onClick={(e) => {
                                            e.preventDefault();
                                            handleCategoryClick(subcat.link, null, subcat.id, null, null, subcat.slug, null);
                                          }} className="flex-1 block text-left py-1.5 text-xs text-[#E9098D] hover:text-[#2d2c70] transition-colors duration-200">{subcat.label}</Link>
                                          {subcat.hasChild && (
                                            <button onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (mobileActiveSubcategory === subcat.id) {
                                                setMobileActiveSubcategory(null);
                                              } else {
                                                setMobileActiveSubcategory(subcat.id);
                                                fetchSubCategoriesTwoForSubCategory(subcat.id);
                                              }
                                            }} className="p-2">
                                              <ChevronRight className={`w-3 h-3 transition-transform ${mobileActiveSubcategory === subcat.id ? 'rotate-90' : ''}`} />
                                            </button>
                                          )}
                                        </div>

                                        {subcat.hasChild && mobileActiveSubcategory === subcat.id && subcat.subcategoriesTwo && (
                                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-200 pl-3">
                                            {subcat.subcategoriesTwo.map((subcatTwo) => (
                                              <Link key={subcatTwo.id} href={`/${subcatTwo.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleCategoryClick(`/${subcatTwo.slug}`, null, null, subcatTwo.id, null, null, subcatTwo.slug); }} className="block text-left py-1.5 text-xs text-purple-600 hover:text-[#2d2c70] transition-colors duration-200">{subcatTwo.label}</Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-2 text-sm text-gray-500">{loadingCategories[item.brandId] ? 'Loading categories...' : 'No categories available'}</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Full-Width Dropdown */}
        {activeDropdown !== null && currentUser && (
          <div data-brand-dropdown className="hidden lg:block absolute top-44 left-0 w-full bg-white border-t border-b border-gray-200 shadow-lg z-50" onMouseEnter={() => setActiveDropdown(activeDropdown)} onMouseLeave={() => { setActiveDropdown(null); setHoveredCategory(null); setHoveredSubcategory(null); }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {navigationItems.find(item => item.index === activeDropdown)?.categories && (
                <div className="grid grid-cols-5 gap-6">
                  {groupCategoriesByColumn(navigationItems.find(item => item.index === activeDropdown).categories).map((columnCategories, colIdx) => (
                    <div key={colIdx} className="space-y-1">
                      {columnCategories.length > 0 ? (
                        columnCategories.map((category, catIdx) => (
                          <div key={category.id || catIdx} className="relative p-1" onMouseEnter={() => {
                            if (category.hasChild) {
                              setHoveredCategory(`${colIdx}-${catIdx}`)
                              if (category.id) handleCategoryHover(category.id)
                            }
                          }} onMouseLeave={() => setHoveredCategory(null)}>
                            <Link href={`/${category.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleCategoryClick(category.link, category.id, null, null, category.slug, null, null); }} className={`text-left text-sm font-medium transition-colors duration-200 hover:bg-gray-100 p-1 rounded-sm flex items-center justify-between w-full group cursor-pointer ${category.label === "NEW!" || category.label === "SALE" ? "text-[#E9098D] font-bold" : "text-[#2d2c70] hover:text-[#E9098D]"} ${hoveredCategory === `${colIdx}-${catIdx}` ? 'bg-gray-100' : ''}`}>
                              <span>{category.label}</span>
                              {category.hasChild && (<ChevronRight className="w-4 h-4 opacity-100 transition-opacity" />)}
                            </Link>

                            {/* SUB CATEGORIES - Only show when hovering the main category */}
                            {category.hasChild && hoveredCategory === `${colIdx}-${catIdx}` && (
                              <div className="absolute left-2/3 top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md" onMouseEnter={() => setHoveredCategory(`${colIdx}-${catIdx}`)} onMouseLeave={() => setHoveredSubcategory(null)}>
                                <div className="p-3 space-y-1">
                                  {(category.subcategories || subCategoriesByCategory[category.id] || []).map((subcat) => (
                                    <div key={subcat.id} className="relative p-0.5" onMouseEnter={() => {
                                      if (subcat.hasChild) {
                                        handleSubCategoryHover(subcat.id)
                                        setHoveredSubcategory(subcat.id)
                                      }
                                    }} onMouseLeave={() => setHoveredSubcategory(null)}>
                                      <Link href={`/${subcat.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleCategoryClick(subcat.link, null, subcat.id, null, null, subcat.slug, null); }} className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors duration-200 flex items-center justify-between group cursor-pointer ${hoveredSubcategory === subcat.id ? 'bg-gray-100 text-[#E9098D]' : 'text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50'}`}>
                                        <span>{subcat.label}</span>
                                        {subcat.hasChild && (<ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                                      </Link>

                                      {/* SUB CATEGORY TWO - Only show when hovering the specific subcategory */}
                                      {subcat.hasChild && subCategoriesTwoBySubCategory[subcat.id]?.length > 0 && hoveredSubcategory === subcat.id && (
                                        <div className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-md" onMouseEnter={() => setHoveredSubcategory(subcat.id)}>
                                          <div className="p-3 space-y-1">
                                            {subCategoriesTwoBySubCategory[subcat.id].map((subcatTwo) => (
                                              <Link key={subcatTwo._id} href={`/${subcatTwo.slug}`} prefetch={true} onClick={(e) => { e.preventDefault(); handleCategoryClick(`/${subcatTwo.slug}`, null, null, subcatTwo._id, null, null, subcatTwo.slug); }} className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-1 px-2 rounded hover:bg-gray-50 transition-colors duration-200 cursor-pointer">{subcatTwo.name}</Link>
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
                        <div className="text-sm text-gray-500 py-1">{loadingCategories[navigationItems.find(item => item.index === activeDropdown)?.brandId] ? 'Loading categories...' : 'No categories available'}</div>
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