import ProductDetail from '@/components/product-details-components/ProductDetails'
import { metadataService } from '@/utils/metadataService';

export async function generateMetadata() {
  try {
    const res = await metadataService.getMetadataByPage('product-details');

    if (res.success && res.data) {
      return {
        title: res.data.title,
        description: res.data.description,
      };
    }
  } catch (err) {
    console.error('Error fetching metadata for page product-details:', err.message);
  }

  return {
    title: 'product-details | My Website',
    description: 'Default description for product-details page',
  };
}


const Page = () => {
  return (
    <>
      <ProductDetail />
    </>
  )
}

export default Page;
