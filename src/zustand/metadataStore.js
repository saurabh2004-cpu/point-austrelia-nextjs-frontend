// stores/metadataStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMetadataStore = create(
  persist(
    (set, get) => ({
      // State
      metadata: {},
      loading: false,
      error: null,
      lastFetched: null,
      
      // Actions
      setMetadata: (metadata) => set({ 
        metadata, 
        error: null,
        lastFetched: new Date().toISOString()
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Get metadata for specific page
      getPageMetadata: (page) => {
        const { metadata } = get();
        return metadata[page] || null;
      },
      
      // Clear all metadata
      clearMetadata: () => set({ 
        metadata: {}, 
        lastFetched: null 
      }),
    }),
    {
      name: 'metadata-storage', // localStorage key
      partialize: (state) => ({ 
        metadata: state.metadata,
        lastFetched: state.lastFetched
      }),
    }
  )
);

export default useMetadataStore;