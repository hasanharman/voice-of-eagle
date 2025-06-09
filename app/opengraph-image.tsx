import { ImageResponse } from 'next/og'
import * as React from 'react'

export const runtime = 'edge'

export const alt = 'Voice of Eagle'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        🦅 Voice of Eagle
      </div>
    ),
    {
      ...size,
    }
  )
}
