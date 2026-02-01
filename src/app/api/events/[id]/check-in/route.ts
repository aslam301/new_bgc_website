import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/events/[id]/check-in - Check in an attendee
export async function POST(request: Request, { params }: RouteParams) {
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
    const body = await request.json()
    const { ticket_code } = body

    if (!ticket_code) {
      return NextResponse.json(
        { error: 'Ticket code is required' },
        { status: 400 }
      )
    }

    // Get event to check permissions
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('community_id, title, checked_in_count')
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
        { error: 'You must be a community admin to check in attendees' },
        { status: 403 }
      )
    }

    // Find registration by ticket code
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('ticket_code', ticket_code)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: 'Invalid ticket code or registration not found' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (registration.is_checked_in) {
      return NextResponse.json(
        {
          error: 'This attendee has already been checked in',
          registration,
        },
        { status: 400 }
      )
    }

    // Update registration to checked in
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('event_registrations')
      .update({
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
      })
      .eq('id', registration.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error checking in attendee:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Update checked_in_count in events table
    await supabase
      .from('events')
      .update({
        checked_in_count: event.checked_in_count + 1,
      })
      .eq('id', eventId)

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: `${registration.full_name} checked in successfully!`,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to check in attendee' },
      { status: 500 }
    )
  }
}
