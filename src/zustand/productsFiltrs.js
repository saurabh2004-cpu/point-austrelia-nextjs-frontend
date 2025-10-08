import { create } from 'zustand'

export const useProductFiltersStore = create((set) => ({
  // Filter states
  categoryId: null,
  subCategoryId: null,
  subCategoryTwoId: null,
  brandId: null,

  // Slug states for URL
  categorySlug: null,
  subCategorySlug: null,
  subCategoryTwoSlug: null,

  // Set all filters at once
  setFilters: (filters) => set({
    categoryId: filters.categoryId || null,
    subCategoryId: filters.subCategoryId || null,
    subCategoryTwoId: filters.subCategoryTwoId || null,
    brandId: filters.brandId || null,
    brandSlug: filters.brandSlug || null,
    categorySlug: filters.categorySlug || null,
    subCategorySlug: filters.subCategorySlug || null,
    subCategoryTwoSlug: filters.subCategoryTwoSlug || null,
  }),

  // Clear all filters
  clearFilters: () => set({
    categoryId: null,
    subCategoryId: null,
    subCategoryTwoId: null,
    brandId: null,
    brandSlug: null,
    categorySlug: null,
    subCategorySlug: null,
    subCategoryTwoSlug: null,
  }),
}))