// pages/api/meta-data/[page].js
import axiosInstance from '@/axios/axiosInstance';

export default async function handler(req, res) {
    const { page } = req.query;

    console.log("pageeeeeee", page)

    try {
        const response = await axiosInstance.get(`meta-data/get-meta-data-by-page/${page}`);

        // console.log("metadaa responses", response)
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching meta data:', error);
        res.status(500).json({ error: 'Failed to fetch meta data' });
    }
}