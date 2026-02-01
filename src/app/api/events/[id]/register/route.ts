import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateTicketCode, generateQRCode } from '@/lib/qr/generator'
import type { CreateRegistrationInput } from '@/types/events'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/events/[id]/register - Register for an event
export async function POST(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params
  const supabase = await createClient()

  try {
    // Get current user (optional - can be guest registration)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body: CreateRegistrationInput = await request.json()

    // Validate required fields
    if (!body.full_name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Full name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event is published
    if (event.status !== 'published') {
      return NextResponse.json(
        { error: 'This event is not accepting registrations' },
        { status: 400 }
      )
    }

    // Check if event is full
    if (event.max_attendees && event.registration_count >= event.max_attendees) {
      return NextResponse.json(
        { error: 'This event is full' },
        { status: 400 }
      )
    }

    // Check if email is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', body.email)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'This email is already registered for this event' },
        { status: 409 }
      )
    }

    // Generate unique ticket code
    const ticketCode = generateTicketCode()

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(ticketCode)

    // Create registration
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user?.id || null,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        custom_form_data: body.custom_form_data || {},
        ticket_code: ticketCode,
        qr_code_url: qrCodeDataUrl,
        payment_status: event.is_free ? 'completed' : 'pending',
        amount_paid: event.is_free ? 0 : event.ticket_price,
      })
      .select(`
        *,
        event:events(
          id,
          title,
          start_date,
          end_date,
          venue_name,
          venue_address,
          city,
          state,
          is_free,
          ticket_price,
          currency
        )
      `)
      .single()

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return NextResponse.json(
        { error: registrationError.message },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email with QR code
    // This will be implemented in Phase 5 (Notifications)

    return NextResponse.json({ registration }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}
