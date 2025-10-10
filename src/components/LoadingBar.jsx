"use client"

import { useEffect } from 'react'
import { usePathname,  } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08
})

export function LoadingBar() {
  const pathname = usePathname()
  // const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.start()
    
    const timeout = setTimeout(() => {
      NProgress.done()
    }, 300)

    return () => {
      clearTimeout(timeout)
      NProgress.done()
    }
  }, [pathname])

  return null
}