import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get forum categories
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('display_order')

    if (error) throw error

    return NextResponse.json({ categories: data })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
