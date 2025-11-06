import SearchPage from '@/components/search-page-components/SearchPage'
import React from 'react'
import { metadataService } from '@/utils/metadataService';

export async function generateMetadata() {
    try {
        const res = await metadataService.getMetadataByPage('search');

        if (res.success && res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
            };
        }
    } catch (err) {
        console.error('Error fetching metadata for page login:', err.message);
    }

    return {
        title: 'Login | My Website',
        description: 'Default description for login page',
    };
}

const page = () => {
    return (
        <SearchPage />
    )
}

export default page
