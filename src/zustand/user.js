import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      getUser: () => get().user,
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', 
    }
  )
);

export default useUserStore;
