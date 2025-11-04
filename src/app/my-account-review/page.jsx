'use client'
import MyAccount from '@/components/my-account-overview-components/MyAccount'
import { Navbar } from '@/components/Navbar'
import { withAuth } from '@/components/withAuth'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MyAccountPage = () => {
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter()

 

  // Only render MyAccount if user is authenticated (loading is false and we didn't redirect)
  return (
    <>
      {/* <Navbar /> */}
      <MyAccount />
    </>
  )
}

export default withAuth(MyAccountPage);