'use client'

import { useState, useEffect } from 'react'

const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg')
  const [windowWidth, setWindowWidth] = useState(1024)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      if (width < BREAKPOINTS.sm) {
        setScreenSize('xs')
      } else if (width < BREAKPOINTS.md) {
        setScreenSize('sm')
      } else if (width < BREAKPOINTS.lg) {
        setScreenSize('md')
      } else if (width < BREAKPOINTS.xl) {
        setScreenSize('lg')
      } else if (width < BREAKPOINTS['2xl']) {
        setScreenSize('xl')
      } else {
        setScreenSize('2xl')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    screenSize,
    windowWidth,
    isClient,
    isMobile: windowWidth < BREAKPOINTS.md,
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
    isDesktop: windowWidth >= BREAKPOINTS.lg,
    isSmallMobile: windowWidth < BREAKPOINTS.sm,
    isTouch: isClient && typeof window !== 'undefined' && 'ontouchstart' in window,
  }
}


