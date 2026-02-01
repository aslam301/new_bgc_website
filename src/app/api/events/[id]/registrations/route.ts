import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/events/[id]/registrations - List all registrations for an event (community admin only)
export async function GET(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get event to check permissions
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('community_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user is admin of the community
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: event.community_id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to view registrations' },
        { status: 403 }
      )
    }

    // Get all registrations for this event
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError)
      return NextResponse.json(
        { error: registrationsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
