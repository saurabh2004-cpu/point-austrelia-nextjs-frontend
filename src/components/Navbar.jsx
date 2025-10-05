"use client"

import { useEffect, useState } from "react"
import { Search, ShoppingCart, Menu, X, User, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { label } from "framer-motion/client"
import useNavStateStore from "@/zustand/navigations"
import ShoppingCartPopup from "./CartPopup"
import { useRouter } from "next/navigation"
import useUserStore from "@/zustand/user"
import axiosInstance from "@/axios/axiosInstance"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showCartPopup, setShowCartPopUp] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null)
  const router = useRouter()
  const currentUser = useUserStore((state) => state.user);

  const [brands, setBrands] = useState([])
  const [categoriesByBrand, setCategoriesByBrand] = useState({})
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({})
  const [subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState({})

  const setCurrentIndex = useNavStateStore((state) => state.setCurrentIndex)

  // Fetch all brands on component mount
  useEffect(() => {
    fetchBrands()
  }, [])

  // Fetch categories when a brand is hovered
  const fetchCategoriesForBrand = async (brandId) => {
    if (categoriesByBrand[brandId]) return // Already fetched

    try {
      setLoadingCategories(prev => ({ ...prev, [brandId]: true }))
      console.log("brandId", brandId)
      const res = await axiosInstance.get(`category/get-categories-by-brand-id/${brandId}`)

      console.log("categories by brand = ", res.data.data)

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
  }

  // Fetch subcategories when a category is hovered
  const fetchSubCategoriesForCategory = async (categoryId) => {
    if (subCategoriesByCategory[categoryId]) return // Already fetched

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
  }

  // Fetch subcategories two when a subcategory is hovered
  const fetchSubCategoriesTwoForSubCategory = async (subCategoryId) => {
    if (subCategoriesTwoBySubCategory[subCategoryId]) return // Already fetched

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
  }

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

  // Build navigation items dynamically
  const buildNavigationItems = () => {
    const items = [
      { label: "HOME", index: 0, link: '/' }
    ]

    // Add brands as navigation items with dropdowns
    brands.forEach((brand, idx) => {
      const categories = categoriesByBrand[brand._id] || []

      // Organize categories by column (distribute evenly)
      const categoriesWithColumns = categories.map((cat, catIdx) => {
        const column = Math.floor(catIdx / 5) + 1 // 5 items per column

        return {
          id: cat._id,
          label: cat.name,
          slug: cat.slug,
          brandId: brand._id,
          link: `/products-list?categoryId=${cat._id}&brandId=${brand._id}&categorySlug=${cat.slug}`,
          column: column,
          subcategories: subCategoriesByCategory[cat._id]?.map(subCat => ({
            id: subCat._id,
            label: subCat.name,
            slug: subCat.slug,
            brandId: brand._id,
            link: `/products-list?subCategoryId=${subCat._id}&brandId=${brand._id}&subCategorySlug=${subCat.slug}`,
            subcategoriesTwo: subCategoriesTwoBySubCategory[subCat._id]?.map(subCatTwo => ({
              id: subCatTwo._id,
              label: subCatTwo.name,
              slug: subCatTwo.slug,
              brandId: brand._id,
              link: `/products-list?subCategoryTwoId=${subCatTwo._id}&brandId=${brand._id}&subCategoryTwoSlug=${subCatTwo.slug}`
            }))
          }))
        }
      })

      items.push({
        label: brand.name.toUpperCase(),
        index: idx + 1,
        brandId: brand._id,
        hasDropdown: true,
        categories: categoriesWithColumns
      })
    })

    // Add COMPANY at the end
    items.push({ label: "COMPANY", index: brands.length + 1 })

    return items
  }

  const navigationItems = buildNavigationItems()

  const handleNavigation = (item) => {
    if (!item.hasDropdown) {
      setCurrentIndex(item.index)
      setActiveDropdown(null)
      setIsMenuOpen(false)
      if (item.link) {
        router.push(item.link)
      }
    }
  }

  const handleCategoryClick = (link) => {
    router.push(link)
    setActiveDropdown(null)
    setHoveredCategory(null)
    setHoveredSubcategory(null)
    setIsMenuOpen(false)
  }

  const handleBrandHover = (brandId, index) => {
    setActiveDropdown(index)
    fetchCategoriesForBrand(brandId)
  }

  const handleCategoryHover = (categoryId) => {
    fetchSubCategoriesForCategory(categoryId)
  }

  const handleSubCategoryHover = (subCategoryId) => {
    fetchSubCategoriesTwoForSubCategory(subCategoryId)
  }

  useEffect(() => {
    if (currentUser !== undefined) {
      setLoading(false)
    }
  }, [currentUser])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Group categories by column
  const groupCategoriesByColumn = (categories) => {
    const columns = {}
    categories.forEach(cat => {
      const col = cat.column || 1
      if (!columns[col]) columns[col] = []
      columns[col].push(cat)
    })
    return Object.values(columns)
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
              {!currentUser ? (
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
                    <span className="font-semibold text-black">{currentUser.contactName}</span>
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
                  className="h-12 md:h-16 lg:h-20 w-auto cursor-pointer"
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
                    onClick={() => router.push('/wishlist')}
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
                    onClick={() => router.push('/wishlist')}
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
                    className="relative bg-white group"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-2 relative">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center space-x-[36px] h-14">
            {navigationItems.map((item) => (
              <div
                key={item.index}
                className="relative h-full flex items-center"
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    if (item.brandId) {
                      handleBrandHover(item.brandId, item.index)
                    } else {
                      setActiveDropdown(item.index)
                    }
                  }
                }}
                onMouseLeave={() => {
                  setActiveDropdown(null)
                  setHoveredCategory(null)
                  setHoveredSubcategory(null)
                }}
              >
                <button
                  onClick={() => handleNavigation(item)}
                  className="text-[1rem] font-semibold text-[#2d2c70] transition-colors duration-200 whitespace-nowrap hover:text-[#E9098D]"
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>

          {/* Mobile & Tablet Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-2">
              {/* Mobile & Tablet Login/Signup - Only show if not logged in */}
              {!currentUser && (
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
              {currentUser && (
                <div className="flex items-center gap-2 text-[1rem] font-medium pb-4 border-b border-[#2d2c70] mb-4">
                  <span className="text-[#2d2c70] font-medium">Welcome</span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-black">{currentUser.contactName}</span>
                  </div>
                  <ChevronDown strokeWidth={3} className="w-4 h-4 text-[#2d2c70] mt-1" />
                </div>
              )}

              {/* Mobile & Tablet Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.index}>
                    <button
                      onClick={() => {
                        if (item.hasDropdown) {
                          setActiveDropdown(activeDropdown === item.index ? null : item.index)
                          if (item.brandId) {
                            fetchCategoriesForBrand(item.brandId)
                          }
                        } else {
                          handleNavigation(item)
                        }
                      }}
                      className="block w-full text-left py-3 md:py-4 text-sm md:text-base font-semibold text-[#2d2c70] hover:text-[#E9098D] hover:bg-gray-50 rounded-md px-3 transition-colors duration-200 border-b border-gray-100 flex items-center justify-between"
                    >
                      {item.label}
                      {item.hasDropdown && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.index ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {/* Mobile Dropdown */}
                    {item.hasDropdown && activeDropdown === item.index && item.categories && (
                      <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 max-h-96 overflow-y-auto">
                        {item.categories.length > 0 ? (
                          item.categories.map((category, idx) => (
                            <div key={category.id || idx}>
                              <button
                                onClick={() => router.push(category.link)}
                                className="block w-full text-left py-2 text-sm text-[#2d2c70] hover:text-[#E9098D] transition-colors duration-200 flex items-center justify-between"
                              >
                                {category.label}
                                {category.subcategories && (
                                  <ChevronRight className={`w-4 h-4 transition-transform ${hoveredCategory === category.id ? 'rotate-90' : ''}`} />
                                )}
                              </button>

                              {/* Mobile Subcategories */}
                              {category.subcategories && hoveredCategory === category.id && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-pink-200 pl-3">
                                  {category.subcategories.map((subcat) => (
                                    <button
                                      key={subcat.id}
                                      onClick={() => router.push(subcat.link)}
                                      className="block w-full text-left py-1.5 text-xs text-[#E9098D] hover:text-[#2d2c70] transition-colors duration-200"
                                    >
                                      {subcat.label}
                                    </button>
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

              {/* Mobile & Tablet Quick Actions */}
              <div className="pt-4 border-t border-[#2d2c70] space-y-3">
                <button className="block w-full text-left py-2 md:py-3 text-sm md:text-base font-medium text-[#2d2c70] hover:text-[#E9098D] rounded-md px-3 transition-colors duration-200">
                  Quick Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Full-Width Dropdown */}
        {activeDropdown !== null && (
          <div
            className="hidden lg:block absolute top-44 left-0 w-full bg-white border-t border-b border-gray-200 shadow-lg z-50"
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={() => {
              setActiveDropdown(null)
              setHoveredCategory(null)
              setHoveredSubcategory(null)
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {navigationItems.find(item => item.index === activeDropdown)?.categories && (
                <div className="grid grid-cols-5 gap-8">
                  {groupCategoriesByColumn(navigationItems.find(item => item.index === activeDropdown).categories).map((columnCategories, colIdx) => (
                    <div key={colIdx} className="space-y-6">
                      {columnCategories.length > 0 ? (
                        columnCategories.map((category, catIdx) => (
                          <div
                            key={category.id || catIdx}
                            className="relative"
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
                              onClick={() => router.push(category.link)}
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
                                <div className="p-4 space-y-2 ">
                                  {(category.subcategories || subCategoriesByCategory[category.id] || []).map((subcat) => (
                                    <div
                                      key={subcat.id}
                                      className="relative"
                                      onMouseEnter={() => {
                                        if (subcat.id) {
                                          handleSubCategoryHover(subcat.id)
                                          setHoveredSubcategory(subcat.id)
                                        }
                                      }}
                                      onMouseLeave={() => setHoveredSubcategory(null)}
                                    >
                                      <button
                                        onClick={() => router.push(subcat.link)}
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
                                                onClick={() => router.push(subcatTwo.link)}
                                                className="block w-full text-left text-sm text-[#2d2c70] hover:text-[#E9098D] py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-200"
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

      {showCartPopup && <ShoppingCartPopup onClose={() => setShowCartPopUp(false)} />}
    </>
  )
}