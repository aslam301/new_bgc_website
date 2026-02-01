'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  Tag,
} from 'lucide-react'
import { DynamicForm } from '@/components/events/DynamicForm'
import { RegistrationSuccess } from '@/components/events/RegistrationSuccess'
import type { Event, EventRegistration } from '@/types/events'
import {
  formatEventDateRange,
  formatEventTimeRange,
  formatDate,
} from '@/lib/utils/date'

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registration, setRegistration] = useState<EventRegistration | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    custom_form_data: {},
  })

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`)
        if (!res.ok) {
          throw new Error('Event not found')
        }
        const data = await res.json()
        setEvent(data.event)
      } catch (err: any) {
        setError(err.message || 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setRegistering(true)

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields')
        setRegistering(false)
        return
      }

      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      // Show success screen
      setRegistration(data.registration)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen art-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm font-mono text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen art-bg flex items-center justify-center px-5">
        <div className="max-w-md w-full bg-card border-2 border-ink p-8 shadow-[6px_6px_0_0_hsl(var(--ink))] text-center">
          <h2 className="font-black text-xl text-foreground mb-4">Event Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[5px_5px_0_0_hsl(var(--ink))] transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  if (!event) return null

  // Show success screen if registered
  if (registration) {
    return (
      <div className="min-h-screen art-bg relative overflow-hidden">
        <div className="container max-w-2xl mx-auto px-5 py-10">
          <div className="mb-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Events
            </Link>
          </div>
          <RegistrationSuccess registration={registration} />
        </div>
      </div>
    )
  }

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.registration_count
    : null
  const isFull = spotsLeft === 0
  const canRegister = event.status === 'published' && !isFull

  return (
    <div className="min-h-screen art-bg relative overflow-hidden">
      <div className="container max-w-4xl mx-auto px-5 py-10">
        {/* Back Button */}
        <div className="mb-6 animate-slide-up">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Events
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <header className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <h1 className="font-black text-3xl text-foreground mb-4 leading-tight">
                {event.title}
              </h1>

              {/* Community */}
              {event.community && (
                <Link
                  href={`/c/${event.community.slug}`}
                  className="inline-flex items-center gap-2 bg-card border-2 border-ink px-3 py-2 shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
                >
                  {event.community.logo_url ? (
                    <img
                      src={event.community.logo_url}
                      alt={event.community.name}
                      className="w-6 h-6 rounded border border-ink object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded border border-ink bg-white flex items-center justify-center text-sm">
                      🎲
                    </div>
                  )}
                  <span className="text-xs font-bold">{event.community.name}</span>
                </Link>
              )}
            </header>

            {/* Key Info Cards */}
            <section
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              {/* Date & Time */}
              <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--sunny))]">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-coral mt-1" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      DATE & TIME
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {formatEventDateRange(event.start_date, event.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {formatEventTimeRange(event.start_date, event.end_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--mint))]">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-coral mt-1" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      LOCATION
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {event.venue_name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {event.city}, {event.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--grape))]">
                <div className="flex items-start gap-3">
                  <Users size={20} className="text-coral mt-1" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      ATTENDEES
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {event.registration_count} registered
                    </p>
                    {event.max_attendees && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {spotsLeft} spots left
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--coral))]">
                <div className="flex items-start gap-3">
                  <IndianRupee size={20} className="text-coral mt-1" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      PRICE
                    </p>
                    {event.is_free ? (
                      <p className="font-black text-sm text-foreground">FREE</p>
                    ) : (
                      <p className="font-bold text-sm text-foreground">
                        ₹{event.ticket_price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            {event.description && (
              <section
                className="bg-card border-2 border-ink p-6 shadow-[4px_4px_0_0_hsl(var(--ink))] animate-slide-up"
                style={{ animationDelay: '150ms' }}
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3">
                  About This Event
                </h3>
                <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </section>
            )}

            {/* Venue Address */}
            <section
              className="bg-card border-2 border-ink p-6 shadow-[4px_4px_0_0_hsl(var(--ink))] animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3">
                Venue Address
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {event.venue_address}
                <br />
                {event.city}, {event.state}
              </p>
            </section>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div
              className="sticky top-6 bg-card border-2 border-ink shadow-[6px_6px_0_0_hsl(var(--ink))] animate-slide-up"
              style={{ animationDelay: '250ms' }}
            >
              {/* Header */}
              <div className="bg-coral text-white px-6 py-4 border-b-2 border-ink">
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {isFull ? 'Event Full' : 'Register Now'}
                </h3>
              </div>

              {/* Form */}
              <div className="p-6">
                {!canRegister && (
                  <div className="text-center py-8">
                    {isFull ? (
                      <>
                        <Users className="mx-auto mb-3 text-muted-foreground" size={32} />
                        <p className="font-bold text-sm text-foreground mb-1">
                          Event is Full
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registration is closed
                        </p>
                      </>
                    ) : (
                      <>
                        <Clock className="mx-auto mb-3 text-muted-foreground" size={32} />
                        <p className="font-bold text-sm text-foreground mb-1">
                          Registration Closed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This event is not accepting registrations
                        </p>
                      </>
                    )}
                  </div>
                )}

                {canRegister && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="bg-coral/10 border-2 border-coral text-coral px-3 py-2 text-xs font-bold">
                        {error}
                      </div>
                    )}

                    {/* Basic Fields */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">
                        Full Name <span className="text-coral">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">
                        Email <span className="text-coral">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">
                        Phone <span className="text-coral">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    {/* Custom Form Fields */}
                    {event.custom_form_schema.fields.length > 0 && (
                      <div className="pt-4 border-t-2 border-border">
                        <DynamicForm
                          schema={event.custom_form_schema}
                          data={formData.custom_form_data}
                          onChange={(data) =>
                            setFormData({ ...formData, custom_form_data: data })
                          }
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={registering}
                      className="w-full px-6 py-4 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {registering ? 'Registering...' : 'Complete Registration'}
                    </button>

                    {/* Price Notice */}
                    {!event.is_free && (
                      <p className="text-xs text-center text-muted-foreground font-mono">
                        Payment: ₹{event.ticket_price} (to be collected at venue)
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
