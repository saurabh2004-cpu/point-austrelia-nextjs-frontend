import { create } from 'zustand';

const useBrandStore = create((set) => ({
  brandPage: null,
  
  setBrandPage: (page) => set({ brandPage: page }),
  
  clearBrandPage: () => set({ brandPage: null }),
}));

export default useBrandStore;