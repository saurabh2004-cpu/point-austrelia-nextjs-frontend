'use client'
import LoginComponent from '@/components/Login'
import { Navbar } from '@/components/Navbar'
import useUserStore from '@/zustand/user'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const LoginPage = () => {
    const currentUser = useUserStore((state) => state.user);
    const checkAuth = useUserStore((state) => state.checkAuth); // Add this
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
    }, [currentUser, checkAuth, router]); // Add all dependencies

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
            <LoginComponent />
        </>
    )
}

export default LoginPage;