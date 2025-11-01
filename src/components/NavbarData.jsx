"use client"

import { useEffect } from "react"
import axiosInstance from "@/axios/axiosInstance"
import { useNavbarStore } from "@/zustand/navbarStore"
import useUserStore from "@/zustand/user"
import useCartStore from "@/zustand/cartPopup"
import useWishlistStore from "@/zustand/wishList"

// Define the functions outside the component so they can be exported
export const fetchCategoriesForBrand = async (brandId) => {
  const { categoriesByBrand, setCategoriesByBrand, setLoadingCategories } = useNavbarStore.getState()
  
  if (categoriesByBrand[brandId]) return

  try {
    setLoadingCategories(brandId, true)
    const res = await axiosInstance.get(`category/get-categories-by-brand-id/${brandId}`)

    if (res.data.statusCode === 200) {
      setCategoriesByBrand(brandId, res.data.data)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    setLoadingCategories(brandId, false)
  }
}

export const fetchSubCategoriesForCategory = async (categoryId) => {
  const { subCategoriesByCategory, setSubCategoriesByCategory } = useNavbarStore.getState()
  
  if (subCategoriesByCategory[categoryId]) return

  try {
    const res = await axiosInstance.get(`subcategory/get-sub-categories-by-category-id/${categoryId}`)

    if (res.data.statusCode === 200) {
      setSubCategoriesByCategory(categoryId, res.data.data)
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error)
  }
}

export const fetchSubCategoriesTwoForSubCategory = async (subCategoryId) => {
  const { subCategoriesTwoBySubCategory, setSubCategoriesTwoBySubCategory } = useNavbarStore.getState()
  
  if (subCategoriesTwoBySubCategory[subCategoryId]) return

  try {
    const res = await axiosInstance.get(`subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`)

    if (res.data.statusCode === 200) {
      setSubCategoriesTwoBySubCategory(subCategoryId, res.data.data)
    }
  } catch (error) {
    console.error('Error fetching subcategories two:', error)
  }
}

export function NavbarData() {
  const { 
    setBrands, 
    setLoadingCategories 
  } = useNavbarStore()
  
  const currentUser = useUserStore((state) => state.user)
  const setCartItems = useCartStore((state) => state.setCurrentItems)
  const setWishlistItems = useWishlistStore((state) => state.setCurrentItems)

  // Fetch brands once on mount
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
  }, [setBrands])

  // Fetch user cart and wishlist
  useEffect(() => {
    if (!currentUser?._id) return

    const fetchUserData = async () => {
      try {
        // Fetch cart
        const cartResponse = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`)
        if (cartResponse.data.statusCode === 200) {
          setCartItems(cartResponse.data.data.length)
        }

        // Fetch wishlist
        const wishlistResponse = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)
        if (wishlistResponse.data.statusCode === 200) {
          setWishlistItems(wishlistResponse.data.data.length)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const timer = setTimeout(fetchUserData, 1000) // Delay to avoid blocking initial render
    return () => clearTimeout(timer)
  }, [currentUser?._id, setCartItems, setWishlistItems])

  // This component doesn't render anything
  return null
}