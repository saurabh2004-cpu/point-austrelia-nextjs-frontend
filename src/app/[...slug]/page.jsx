
import ProductListing from '@/components/product-listing-page-components/ProductsListing'
import { metadataService } from '@/utils/metadataService';

//  Run on server
export async function generateMetadata() {
  try {
    const res = await metadataService.getMetadataByPage('product-listing');

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


const page = () => {



  return (
    <>
      <ProductListing />
    </>
  )
}

export default page;
