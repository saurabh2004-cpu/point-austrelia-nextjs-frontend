import LoginComponent from '@/components/Login';
import { metadataService } from '@/utils/metadataService';

// ✅ Run on server
export async function generateMetadata() {
  try {
    const res = await metadataService.getMetadataByPage('login');

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

export default function LoginPage() {
  return <LoginComponent />;
}
