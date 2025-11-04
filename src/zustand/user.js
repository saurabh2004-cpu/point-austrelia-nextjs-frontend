import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (userData) => set({ user: userData, isLoading: false }),
      clearUser: () => set({ user: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        // This runs after rehydration from localStorage
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

export default useUserStore;