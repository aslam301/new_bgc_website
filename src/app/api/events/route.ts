import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreateEventInput, EventFilters } from '@/types/events'

// GET /api/events - List/search events with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters: EventFilters = {
    search: searchParams.get('search') || undefined,
    city: searchParams.get('city') || undefined,
    event_type: searchParams.get('event_type') || undefined,
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    is_free: searchParams.get('is_free') === 'true' ? true : undefined,
    community_id: searchParams.get('community_id') || undefined,
    status: searchParams.get('status') || 'published',
  }

  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      event_type:event_types(id, name, slug),
      community:communities(id, name, slug, logo_url)
    `)

  // Status filter (default to published for public listing)
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // Search filter (title or description)
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // City filter
  if (filters.city) {
    query = query.eq('city', filters.city)
  }

  // Event type filter
  if (filters.event_type) {
    query = query.eq('event_type_id', filters.event_type)
  }

  // Date range filters
  if (filters.date_from) {
    query = query.gte('start_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('start_date', filters.date_to)
  }

  // Free/Paid filter
  if (filters.is_free !== undefined) {
    query = query.eq('is_free', filters.is_free)
  }

  // Community filter
  if (filters.community_id) {
    query = query.eq('community_id', filters.community_id)
  }

  // Sort by start date (upcoming first)
  query = query.order('start_date', { ascending: true })

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: CreateEventInput = await request.json()

    // Validate required fields
    if (
      !body.community_id ||
      !body.title ||
      !body.slug ||
      !body.start_date ||
      !body.end_date ||
      !body.venue_name ||
      !body.venue_address ||
      !body.city
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is admin of the community
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: body.community_id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to create events' },
        { status: 403 }
      )
    }

    // Check if slug is unique within the community
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('community_id', body.community_id)
      .eq('slug', body.slug)
      .single()

    if (existingEvent) {
      return NextResponse.json(
        { error: 'An event with this slug already exists in this community' },
        { status: 409 }
      )
    }

    // Create event
    const { data: event, error: createError } = await supabase
      .from('events')
      .insert({
        community_id: body.community_id,
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        start_date: body.start_date,
        end_date: body.end_date,
        venue_name: body.venue_name,
        venue_address: body.venue_address,
        city: body.city,
        state: body.state || null,
        event_type_id: body.event_type_id || null,
        max_attendees: body.max_attendees || null,
        is_free: body.is_free,
        ticket_price: body.ticket_price || 0,
        custom_form_schema: body.custom_form_schema || { fields: [] },
        status: body.status || 'draft',
        created_by: user.id,
      })
      .select(`
        *,
        event_type:event_types(id, name, slug),
        community:communities(id, name, slug, logo_url)
      `)
      .single()

    if (createError) {
      console.error('Error creating event:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
