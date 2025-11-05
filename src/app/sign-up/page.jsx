import SignUpComponent from '@/components/SignUp'
import React from 'react'
import { metadataService } from '@/utils/metadataService';

export async function generateMetadata() {

  try {
    const res = await metadataService.getMetadataByPage('sign-up');

    if (res.success && res.data) {
      return {
        title: res.data.title || `Sign Up | My Website`,
        description: res.data.description || `Create an account to enjoy our services.`,
        keywords: res.data.keywords || 'sign up, register, create account',
        openGraph: {
          title: res.data.title,
          description: res.data.description,
          type: 'website',
          url: `https://yourdomain.com/sign-up`,
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

  return {
    title: `${slug} | My Website`,
    description: `Discover the best ${slug} products.`,
  };
}

const SignUpPage = () => {
  return (
    <>
      <SignUpComponent />
    </>
  )
}

export default SignUpPage;