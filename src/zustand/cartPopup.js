import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            user: null,
            currentItems: 0,
            setCurrentItems: (items) => set({ currentItems: items }),
            getCurrentItems: () => get().currentItems,
        }),
        {
            name: 'cart-storage',
        }
    )
);

export default useCartStore;
