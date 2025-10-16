'use client'
import BrandsGrid from '@/components/metador-page-components/BrandsGrid'
import TrustedByCarousel from '@/components/metador-page-components/Carousel'
import CategoriesGrid from '@/components/metador-page-components/CategoriesGrid'
import HeroSection from '@/components/metador-page-components/Hero'
import axiosInstance from '@/axios/axiosInstance'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {
    // const params = useParams();
    // const slug = params.slug
    // const setBrandPage = useBrandStore((state) => state.setBrandPage);

    // const fetchBrandPageBySlug = async (slug) => {
    //     try {
    //         const response = await axiosInstance.get(`brand-page/get-brand-page-by-brand-slug/${slug}`);

    //         if (response.data.statusCode === 200) {
    //             setBrandPage(response.data.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching brand page:", error);
    //     }
    // }

    // useEffect(() => {
    //     if (slug) {
    //         fetchBrandPageBySlug(slug);
    //     }
    // }, [slug, setBrandPage]);

    return (
        <>
            <HeroSection />
            <CategoriesGrid />
            <BrandsGrid />
            <TrustedByCarousel />
        </>
    )
}

export default page