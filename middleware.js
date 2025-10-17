// middleware.js
import axiosInstance from '@/axios/axiosInstance'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('accessToken')?.value

    // Routes that require authentication
    const authRoutes = ['/cart', '/wishlist', '/profile', '/checkout']
    // Routes that should only be accessible to guests
    const guestRoutes = ['/login', '/signup', '/reset-password']

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route))

    // If there's a token, verify it's actually valid
    if (token) {
        try {
            const response = await axiosInstance.get(`user/get-current-user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            console.log("response user ", response)

            const isValidToken = response.data.statusCode === 200

            // Redirect to home if accessing guest route with valid token
            if (isGuestRoute && isValidToken) {
                return NextResponse.redirect(new URL('/', request.url))
            }

            // Continue if token is valid
            if (isValidToken) {
                return NextResponse.next()
            }

        } catch (error) {
            // Token is invalid, clear it and redirect to login if needed
            if (isAuthRoute) {
                const response = NextResponse.redirect(new URL('/login', request.url))
                response.cookies.delete('token')
                return response
            }
        }
    }

    // Redirect to login if accessing protected route without valid token
    if (isAuthRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}