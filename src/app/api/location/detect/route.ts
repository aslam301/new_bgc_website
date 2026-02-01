import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// GET /api/location/detect - Detect location from IP address
export async function GET() {
  try {
    const headersList = await headers()

    // Try to get IP from various headers (Vercel, Cloudflare, etc.)
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'

    // If localhost or unknown, return default (Bangalore for demo)
    if (clientIp === 'unknown' || clientIp.startsWith('127.') || clientIp.startsWith('192.168.') || clientIp === '::1') {
      return NextResponse.json({
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        lat: 12.9716,
        lng: 77.5946,
        source: 'default',
      })
    }

    // Use ipapi.co free tier (no API key needed, 30k requests/month)
    const res = await fetch(`https://ipapi.co/${clientIp}/json/`)

    if (!res.ok) {
      throw new Error('IP API request failed')
    }

    const data = await res.json()

    // Return structured location data
    return NextResponse.json({
      city: data.city || 'Other',
      state: data.region || '',
      country: data.country_name || 'India',
      lat: data.latitude || null,
      lng: data.longitude || null,
      source: 'ipapi',
    })
  } catch (error) {
    console.error('Location detection error:', error)

    // Return default location on error
    return NextResponse.json({
      city: 'Other',
      state: '',
      country: 'India',
      lat: null,
      lng: null,
      source: 'fallback',
    })
  }
}
