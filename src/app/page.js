
import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";
import { metadataService } from '@/utils/metadataService';

// Run on server
export async function generateMetadata() {
  try {
    const res = await metadataService.getMetadataByPage('home');

    if (res.success && res.data) {
      return {
        title: res.data.title,
        description: res.data.description,
      };
    }
  } catch (err) {
    console.error('Error fetching metadata for page login:', err.message);
  }

  return {
    title: 'Login | My Website',
    description: 'Default description for login page',
  };
}

export default function Home() {

  return (
    <>
      <BrandCards />
      <Carousel />
    </>
  );
}