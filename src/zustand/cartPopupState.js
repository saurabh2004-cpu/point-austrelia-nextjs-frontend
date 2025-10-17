// zustand/cartStore.js
import { create } from 'zustand';

export const useCartPopupStateStore = create((set) => ({
  showCartPopup: false,
  setShowCartPopup: (show) => set({ showCartPopup: show }),
  toggleCartPopup: () => set((state) => ({ showCartPopup: !state.showCartPopup })),
}));