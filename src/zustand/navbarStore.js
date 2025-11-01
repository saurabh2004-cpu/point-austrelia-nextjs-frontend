import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNavbarStore = create(
  persist(
    (set, get) => ({
      // Navigation data
      brands: [],
      categoriesByBrand: {},
      subCategoriesByCategory: {},
      subCategoriesTwoBySubCategory: {},
      loadingCategories: {},
      
      // Actions
      setBrands: (brands) => set({ brands }),
      
      setCategoriesByBrand: (brandId, categories) => set((state) => ({
        categoriesByBrand: {
          ...state.categoriesByBrand,
          [brandId]: categories
        }
      })),
      
      setSubCategoriesByCategory: (categoryId, subCategories) => set((state) => ({
        subCategoriesByCategory: {
          ...state.subCategoriesByCategory,
          [categoryId]: subCategories
        }
      })),
      
      setSubCategoriesTwoBySubCategory: (subCategoryId, subCategoriesTwo) => set((state) => ({
        subCategoriesTwoBySubCategory: {
          ...state.subCategoriesTwoBySubCategory,
          [subCategoryId]: subCategoriesTwo
        }
      })),
      
      setLoadingCategories: (brandId, loading) => set((state) => ({
        loadingCategories: {
          ...state.loadingCategories,
          [brandId]: loading
        }
      })),
    }),
    {
      name: 'navbar-storage',
      partialize: (state) => ({ 
        brands: state.brands,
        categoriesByBrand: state.categoriesByBrand,
        subCategoriesByCategory: state.subCategoriesByCategory,
        subCategoriesTwoBySubCategory: state.subCategoriesTwoBySubCategory,
      }),
      // CRITICAL: Optimize persist options to prevent blocking
      skipHydration: false,
      version: 1,
      // Use merge strategy to avoid re-renders
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
)