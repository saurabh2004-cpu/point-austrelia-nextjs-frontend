// hooks/useServerMetadata.js
import { useEffect, useState } from 'react';
import { metadataService } from '@/utils/metadataService';

export const useServerMetadata = (page) => {
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!page) return;

            setLoading(true);
            setError(null);

            try {
                const result = await metadataService.getMetadataByPage(page);

                console.log('Metadata fetch result:', result); // Debug log

                if (result.success && result.data) {
                    setMetadata(result.data);
                } else {
                    setError(result.error);
                    // Set fallback metadata
                    setMetadata({
                        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Default Title`,
                        description: `Default description for ${page} page`,
                        keywords: '',
                        page: page
                    });
                }
            } catch (err) {
                console.error('Error in useServerMetadata:', err);
                setError('Failed to fetch metadata');
                setMetadata({
                    title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Default Title`,
                    description: `Default description for ${page} page`,
                    keywords: '',
                    page: page
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [page]);

    return { metadata, loading, error };
};