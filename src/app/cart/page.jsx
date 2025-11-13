'use client'
import ShoppingCart from '@/components/cart-components/ShoppingCart'
import React from 'react'
import { metadataService } from '@/utils/metadataService';
import { withAuth } from '@/components/withAuth';
// import { withAuth } from '@/components/withAuth';

// export async function generateMetadata() {
//     try {
//         const res = await metadataService.getMetadataByPage('cart');

//         if (res.success && res.data) {
//             return {
//                 title: res.data.title,
//                 description: res.data.description,
//             };
//         }
//     } catch (err) {
//         console.error('Error fetching metadata for page cart:', err.message);
//     }

//     return {
//         title: 'cart | My Website',
//         description: 'Default description for cart page',
//     };
// }

const page = () => {
    return (
        <ShoppingCart />
    )
}

export default withAuth(page)
