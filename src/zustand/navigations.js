import { create } from 'zustand'

const useNavStateStore = create((set, get) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  getCurrentIndex: () => get().currentIndex, 
}))

export default useNavStateStore
