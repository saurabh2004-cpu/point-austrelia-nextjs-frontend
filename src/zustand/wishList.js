import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
    persist(
        (set, get) => ({
            user: null,
            currentWishlistItems: 0,
            setCurrentWishlistItems: (items) => set({ currentWishlistItems: items }),
            getCurrentWishlistItems: () => get().currentWishlistItems,
        }),
        {
            name: 'wishlist-storage',
        }
    )
);

export default useWishlistStore;
