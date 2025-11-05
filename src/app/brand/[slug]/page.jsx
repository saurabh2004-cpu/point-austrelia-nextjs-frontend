import BrandsGrid from '@/components/metador-page-components/BrandsGrid';
import TrustedByCarousel from '@/components/metador-page-components/Carousel';
import CategoriesGrid from '@/components/metador-page-components/CategoriesGrid';
import HeroSection from '@/components/metador-page-components/Hero';
import { metadataService } from '@/utils/metadataService';

// ✅ Dynamic metadata using slug
export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const res = await metadataService.getMetadataByPage(slug);

    if (res.success && res.data) {
      return {
        title: res.data.title || `${slug} | My Website`,
        description: res.data.description || `Explore ${slug} products on My Website.`,
        keywords: res.data.keywords || slug,
        openGraph: {
          title: res.data.title,
          description: res.data.description,
          type: 'website',
          url: `https://yourdomain.com/brand/${slug}`,
        },
        twitter: {
          title: res.data.title,
          description: res.data.description,
        },
      };
    }
  } catch (err) {
    console.error(`Error fetching metadata for ${slug}:`, err);
  }

  // ✅ fallback metadata
  return {
    title: `${slug} | My Website`,
    description: `Discover the best ${slug} products.`,
  };
}

export default function BrandPage() {
  return (
    <>
      <HeroSection />
      <CategoriesGrid />
      <BrandsGrid />
      <TrustedByCarousel />
    </>
  );
}
