'use client'
import BrandsGrid from '@/components/metador-page-components/BrandsGrid'
import TrustedByCarousel from '@/components/metador-page-components/Carousel'
import CategoriesGrid from '@/components/metador-page-components/CategoriesGrid'
import HeroSection from '@/components/metador-page-components/Hero'
import React from 'react'

const page = () => {
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
