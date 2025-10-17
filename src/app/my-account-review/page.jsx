'use client'
import MyAccount from '@/components/my-account-overview-components/MyAccount'
import { Navbar } from '@/components/Navbar'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MyAccountPage = () => {
  const currentUser = useUserStore((state) => state.user);
  const checkAuth = useUserStore((state) => state.checkAuth);
  const router = useRouter()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true);
      
      // If we have a user, allow access
      if (currentUser) {
        setLoading(false);
        return;
      }

      // If no user in store, check if user is actually authenticated
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          setLoading(false);
          return;
        } else {
          // If not authenticated, redirect to login
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // If auth check fails, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [currentUser, checkAuth, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Only render MyAccount if user is authenticated (loading is false and we didn't redirect)
  return (
    <>
      {/* <Navbar /> */}
      <MyAccount />
    </>
  )
}

export default MyAccountPage