import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get retailers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const city = searchParams.get('city')
    const retailer_type = searchParams.get('type')

    let query = supabase
      .from('retailers')
      .select('*')
      .order('name')

    if (city) {
      query = query.eq('city', city)
    }

    if (retailer_type) {
      query = query.eq('retailer_type', retailer_type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ retailers: data })
  } catch (error: any) {
    console.error('Error fetching retailers:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create retailer (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('retailers')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ retailer: data })
  } catch (error: any) {
    console.error('Error creating retailer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
