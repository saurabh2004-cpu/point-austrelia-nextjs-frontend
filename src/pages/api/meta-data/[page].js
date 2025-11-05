// pages/api/meta-data/[page].js
import axiosInstance from '@/axios/axiosInstance';

export default async function handler(req, res) {
  const { page } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!page) {
    return res.status(400).json({ error: 'Page parameter is required' });
  }

  console.log("Fetching metadata for page:", page);

  try {
    const response = await axiosInstance.get(`meta-data/get-meta-data-by-page/${page}`);
    
    console.log("Backend response:", response.data); // Debug log

    // Check if we have successful response with data
    if (response.data.success && response.data.data) {
      res.status(200).json({
        success: true,
        data: {
          title: response.data.data.title,
          description: response.data.data.description,
          keywords: response.data.data.keywords,
          page: response.data.data.page
        }
      });
    } else {
      // Handle case where metadata doesn't exist
      res.status(404).json({
        success: false,
        error: 'Metadata not found for this page',
        data: null
      });
    }
  } catch (error) {
    console.error('Error fetching meta data:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch meta data',
      data: null
    });
  }
}