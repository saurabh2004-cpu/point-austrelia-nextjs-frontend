import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  getUser: () => get().user,
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
