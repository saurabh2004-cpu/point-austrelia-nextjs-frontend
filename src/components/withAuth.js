import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/zustand/user';

export function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const isLoading = useUserStore((state) => state.isLoading);

    useEffect(() => {
      if (!isLoading && !user) {
        // Redirect to login if not authenticated
        router.replace('/login');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
        </div>
      );
    }

    if (!user) {
      return null; // or a loading component
    }

    return <WrappedComponent {...props} />;
  };
}

export function withGuest(WrappedComponent) {
  return function GuestComponent(props) {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const isLoading = useUserStore((state) => state.isLoading);

    useEffect(() => {
      if (!isLoading && user) {
        // Redirect to home/dashboard if already authenticated
        router.replace('/');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
        </div>
      );
    }

    if (user) {
      return null; // or a loading component
    }

    return <WrappedComponent {...props} />;
  };
}