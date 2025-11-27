
import axiosInstance from '@/axios/axiosInstance';
import ProductListing from '@/components/product-listing-page-components/ProductsListing'
import { metadataService } from '@/utils/metadataService';

const convertToSEOText = (arr) => {
  const formatText = str =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const brand = formatText(arr[0]);
  const category = formatText(arr[1]);
  const subcategory = arr[2] ? formatText(arr[2]) : null;
  const subcategoryTwo = arr[3] ? formatText(arr[3]) : null;

  if (subcategoryTwo) {
    return `${subcategoryTwo} | ${brand} | Point Australia`;
  }

  if (subcategory) {
    return `${subcategory} | ${brand} | Point Australia`;
  }

  return `${category} | ${brand} | Point Australia`;
};

//  Run on server
export async function generateMetadata({ params }) {
  try {

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    console.log(" slug in search params", slug)

    let title = ''

    if (slug.length > 1) {
      title = convertToSEOText(slug);
    } else {

      const response = await axiosInstance.post(`products/get-product-by-name`, {
        name: slug[0]
      });

      if(response.data.statusCode === 200) {
        title = `${slug[0].split('-').join(' ').toUpperCase()} | ${response?.data?.data?.commerceCategoriesOne?.name || ''} | Point Australia`;
      }
      
      title = `${slug[0].split('-').join(' ').toUpperCase()}| Point Australia`;


      console.log("fetched product in the dynamic page title", title)
    }

    const res = await metadataService.getMetadataByPage('product-listing');

    if (res.success && res.data) {
      return {
        title: title,
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


const page = ({ params }) => {

  return (
    <>
      <ProductListing />
    </>
  )
}

export default page;
