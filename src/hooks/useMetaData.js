import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMetaData = (page) => {
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/meta-data/${page}`);
        setMetaData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch meta data');
        // Set default meta data if not found
        setMetaData({
          title: 'Default Title',
          description: 'Default description'
        });
      } finally {
        setLoading(false);
      }
    };

    if (page) {
      fetchMetaData();
    }
  }, [page]);

  return { metaData, loading, error };
};