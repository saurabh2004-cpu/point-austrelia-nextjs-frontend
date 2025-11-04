'use client'
import BrandsGrid from '@/components/metador-page-components/BrandsGrid'
import TrustedByCarousel from '@/components/metador-page-components/Carousel'
import CategoriesGrid from '@/components/metador-page-components/CategoriesGrid'
import HeroSection from '@/components/metador-page-components/Hero'
import axiosInstance from '@/axios/axiosInstance'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import useBrandStore from '@/zustand/BrandPage'

const Page = () => {
    const params = useParams();
    const slug = params.slug
    const setBrandPage = useBrandStore((state) => state.setBrandPage);

    const fetchBrandPageBySlug = async (slug, setBrandPage) => {
        try {
            const response = await axiosInstance.get(`brand-page/get-brand-page-by-brand-slug/${slug}`);

            console.log("brand page by brand slug ", response)

            if (response.data.statusCode === 200) {
                setBrandPage(response.data.data);
            }else{
                setBrandPage(null);
            }
        } catch (error) {
            console.error("Error fetching brand page:", error);
        }
    }

    useEffect(() => {
        if (slug) {
            fetchBrandPageBySlug(slug, setBrandPage);
        }
    }, [slug, setBrandPage, params]);

    return (
        <>
            {/* <Navbar /> */}
            <HeroSection />
            <CategoriesGrid />
            <BrandsGrid />
            <TrustedByCarousel />
        </>
    )
}

export default  Page