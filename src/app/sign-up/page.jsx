'use client'
import { Navbar } from '@/components/Navbar'
import SignUpComponent from '@/components/SignUp'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const SignUpPage = () => {
  const currentUser = useUserStore((state) => state.user);
  const checkAuth = useUserStore((state) => state.checkAuth);
  const router = useRouter()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true);
      
      // If we already have a user, redirect immediately
      if (currentUser) {
        router.push('/');
        return;
      }

      // If no user in store, check if user is actually authenticated
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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

  return (
    <>
      {/* <Navbar /> */}
      <SignUpComponent />
    </>
  )
}

export default SignUpPage;