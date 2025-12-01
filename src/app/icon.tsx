// Next.js 15 Icon file
// This file generates the favicon and app icon
// For Next.js 15, you can also use icon.png, icon.svg, or icon.ico in the app directory

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default async function Icon() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(100, 116, 139, 0.15) 50%, rgba(245, 158, 11, 0.25) 100%)',
            borderRadius: '128px',
            border: '3px solid rgba(96, 165, 250, 0.4)',
          }}
        >
          <div
            style={{
              fontSize: 200,
              fontWeight: 900,
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #60a5fa 0%, #e2e8f0 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            Z
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (e) {
    // Fallback if ImageResponse is not available
    return new Response('', { status: 404 })
  }
}

