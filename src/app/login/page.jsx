'use client'
import LoginComponent from '@/components/Login'
import { Navbar } from '@/components/Navbar'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const LoginPage = () => {
    const currentUser = useUserStore((state) => state.user);
  
    const router = useRouter()
    const [loading, setLoading] = useState(true);

    return (
        <>
            {/* <Navbar /> */}
            <LoginComponent />
        </>
    )
}

export default LoginPage;