// services/metadataService.js
// import axiosInstance from '@/axios/axiosInstance';
import axios from 'axios';

export const metadataService = {
    // Fetch metadata for a specific page via your API route
    async getMetadataByPage(page) {
        try {
            const response = await axios.get(`/api/meta-data/${page}`);
            console.log("get metadata by page response", response)

            if (response.data.success === true) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.error || 'Failed to fetch metadata'
                };
            }
        } catch (error) {
            console.error(`Error fetching metadata for page ${page}:`, error);
            return {
                success: false,
                error: error.response?.data?.error || 'Network error'
            };
        }
    },

};