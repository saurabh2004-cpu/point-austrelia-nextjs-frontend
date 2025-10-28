'use client'
import { Navbar } from '@/components/Navbar'
import SignUpComponent from '@/components/SignUp'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const SignUpPage = () => {
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter()
  const [loading, setLoading] = useState(false);

  

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