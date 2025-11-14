'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function TestNavbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Auth Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-up"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
          </div>
          
          {/* Centered Logo */}
          <div className="flex-shrink-0 flex items-center absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center">
              {/* Replace with your logo */}
              <div className="h-8 w-32 bg-gray-200 flex items-center justify-center rounded">
                <span className="font-bold text-gray-700">LOGO</span>
              </div>
              {/* Or use an actual image:
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
              */}
            </Link>
          </div>

          {/* Right side - Empty for balance */}
          <div className="flex-1"></div>
        </div>
      </div>
    </nav>
  )
}