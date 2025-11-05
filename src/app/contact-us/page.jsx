
import ContactUs from '@/components/contact-us-components/ContactUs'
import React from 'react'
import { metadataService } from '@/utils/metadataService';

export async function generateMetadata() {

  try {
    const res = await metadataService.getMetadataByPage('contact-us');

    if (res.success && res.data) {
      return {
        title: res.data.title || `Contact Us | My Website`,
        description: res.data.description || `Get in touch with us for any inquiries.`,
        keywords: res.data.keywords || 'contact us',
        openGraph: {
          title: res.data.title,
          description: res.data.description,
          type: 'website',
          url: `https://yourdomain.com/contact-us`,
        },
        twitter: {
          title: res.data.title,
          description: res.data.description,
        },
      };
    }
  } catch (err) {
    console.error(`Error fetching metadata for contact-us:`, err);
  }

  // ✅ fallback metadata
  return {
    title: `${slug} | My Website`,
    description: `Discover the best ${slug} products.`,
  };
}

const page = () => {
  return (
    <>
      {/* <Navbar /> */}
      <ContactUs />
    </>
  )
}

export default page
