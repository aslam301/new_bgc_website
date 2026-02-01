import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/event-types - List all event types
export async function GET() {
  const supabase = await createClient()

  const { data: event_types, error } = await supabase
    .from('event_types')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching event types:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event_types })
}
