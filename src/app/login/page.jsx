import LoginComponent from '@/components/Login';
import { metadataService } from '@/utils/metadataService';

// ✅ Run on server
export async function generateMetadata() {
  const res = await metadataService.getMetadataByPage('login');

  if (res.success && res.data) {
    return {
      title: res.data.title,
      description: res.data.description,
      keywords: res.data.keywords,
      openGraph: {
        title: res.data.title,
        description: res.data.description,
        type: 'website',
      },
      twitter: {
        title: res.data.title,
        description: res.data.description,
      },
    };
  }

  // fallback if API fails
  return {
    title: 'Login | My Website',
    description: 'Default description for login page',
  };
}

export default function LoginPage() {
  return <LoginComponent />;
}
