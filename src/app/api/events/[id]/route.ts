import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateEventInput } from '@/types/events'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/events/[id] - Get event details
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      event_type:event_types(id, name, slug),
      community:communities(id, name, slug, logo_url, city, state)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({ event })
}

// PATCH /api/events/[id] - Update event
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
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
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('community_id')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user is admin of the community
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: event.community_id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to update this event' },
        { status: 403 }
      )
    }

    const body: UpdateEventInput = await request.json()

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        event_type:event_types(id, name, slug),
        community:communities(id, name, slug, logo_url)
      `)
      .single()

    if (updateError) {
      console.error('Error updating event:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
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
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('community_id')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user is admin of the community
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: event.community_id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to delete this event' },
        { status: 403 }
      )
    }

    // Delete event (cascade will handle registrations)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting event:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Event deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
