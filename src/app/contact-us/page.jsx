import ContactUs from '@/components/contact-us-components/ContactUs';
import { metadataService } from '@/utils/metadataService';

// 👇 Prevents build-time fetch (fetches metadata at runtime on server)
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const res = await metadataService.getMetadataByPage('contact-us');

    if (res.success && res.data) {
      return {
        title: res.data.title || 'Contact Us | My Website',
        description: res.data.description || 'Get in touch with us for any inquiries.',
        keywords: res.data.keywords || 'contact us, support, help',
        openGraph: {
          title: res.data.title || 'Contact Us | My Website',
          description: res.data.description || 'Get in touch with us for any inquiries.',
          type: 'website',
          url: 'https://yourdomain.com/contact-us',
        },
        twitter: {
          title: res.data.title || 'Contact Us | My Website',
          description: res.data.description || 'Get in touch with us for any inquiries.',
        },
      };
    }
  } catch (err) {
    console.error('Error fetching metadata for contact-us:', err.message);
  }

  // ✅ fallback metadata if API fails or unreachable
  return {
    title: 'Contact Us | My Website',
    description: 'Get in touch with us for any inquiries or support.',
    keywords: 'contact, support, help, customer service',
  };
}

export default function Page() {
  return (
    <>
      {/* <Navbar /> */}
      <ContactUs />
    </>
  );
}
