import { NextResponse } from 'next/server'

// Simple test route WITHOUT Supabase
export async function GET() {
  return NextResponse.json({ message: 'Test route works!', timestamp: new Date().toISOString() })
}
