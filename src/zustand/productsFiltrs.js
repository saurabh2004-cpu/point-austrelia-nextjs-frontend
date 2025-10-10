import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProductFiltersStore = create(
  persist(
    (set) => ({
      // Filter states
      categoryId: null,
      subCategoryId: null,
      subCategoryTwoId: null,
      brandId: null,
      productID: null,

      // Slug states for URL
      categorySlug: null,
      subCategorySlug: null,
      subCategoryTwoSlug: null,
      brandSlug: null,

      // Set all filters at once
      setFilters: (filters) =>
        set({
          categoryId: filters.categoryId || null,
          subCategoryId: filters.subCategoryId || null,
          subCategoryTwoId: filters.subCategoryTwoId || null,
          brandId: filters.brandId || null,
          brandSlug: filters.brandSlug || null,
          categorySlug: filters.categorySlug || null,
          subCategorySlug: filters.subCategorySlug || null,
          subCategoryTwoSlug: filters.subCategoryTwoSlug || null,
          productID: filters.productID || null,
        }),

      // Clear all filters
      clearFilters: () =>
        set({
          categoryId: null,
          subCategoryId: null,
          subCategoryTwoId: null,
          brandId: null,
          brandSlug: null,
          categorySlug: null,
          subCategorySlug: null,
          subCategoryTwoSlug: null,
          productID: null,
        }),
    }),

    {
      name: 'product-filters-storage', // Key for localStorage
      getStorage: () => localStorage, // Persist using localStorage
    }
  )
)
