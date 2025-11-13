'use client'
import SignUpComponent from '@/components/SignUp';
import { withGuest } from '@/components/withAuth';

// import { metadataService } from '@/utils/metadataService';

// // ✅ Prevents build-time metadata fetching (avoids ECONNREFUSED)
// export const dynamic = 'force-dynamic';

// export async function generateMetadata() {
//   try {
//     const res = await metadataService.getMetadataByPage('sign-up');

//     if (res?.success && res?.data) {
//       return {
//         title: res.data.title || 'Sign Up | My Website',
//         description: res.data.description || 'Create an account to enjoy our services.',
//         keywords: res.data.keywords || 'sign up, register, create account',
//         openGraph: {
//           title: res.data.title || 'Sign Up | My Website',
//           description: res.data.description || 'Create an account to enjoy our services.',
//           type: 'website',
//           url: 'https://yourdomain.com/sign-up',
//         },
//         twitter: {
//           title: res.data.title || 'Sign Up | My Website',
//           description: res.data.description || 'Create an account to enjoy our services.',
//         },
//       };
//     }
//   } catch (err) {
//     console.error('Error fetching metadata for sign-up page:', err.message);
//   }

//   // ✅ fallback metadata if API fails or unavailable
//   return {
//     title: 'Sign Up | My Website',
//     description: 'Create an account to enjoy our services and access exclusive offers.',
//     keywords: 'sign up, register, create account, join now',
//     openGraph: {
//       title: 'Sign Up | My Website',
//       description: 'Create an account to enjoy our services and access exclusive offers.',
//       type: 'website',
//       url: 'https://yourdomain.com/sign-up',
//     },
//     twitter: {
//       title: 'Sign Up | My Website',
//       description: 'Create an account to enjoy our services and access exclusive offers.',
//     },
//   };
// }

function SignUpPage() {
  return (
    <>
      <SignUpComponent />
    </>
  );
}

export default withGuest(SignUpPage)
