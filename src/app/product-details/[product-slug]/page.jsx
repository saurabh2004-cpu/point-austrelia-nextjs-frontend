import { Navbar } from '@/components/Navbar'
import ProductDetail from '@/components/product-details-components/ProductDetails'
import ProjectDetails from '@/components/product-details-components/ProductDetails'
import { withAuth } from '@/components/withAuth'
import React from 'react'

const Page = () => {
  return (
    <>
      {/* <Navbar /> */}
      <ProductDetail />
    </>
  )
}

export default Page;
