'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SimpleFormBuilder } from './SimpleFormBuilder'
import type { CustomFormSchema, CreateEventInput, Event } from '@/types/events'
import { generateSlug } from '@/lib/utils/slug'

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Other'
].sort()

interface EventFormProps {
  communityId: string
  communitySlug: string
  event?: Event // For editing
}

export function EventForm({ communityId, communitySlug, event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<CreateEventInput>({
    community_id: communityId,
    title: event?.title || '',
    slug: event?.slug || '',
    description: event?.description || '',
    start_date: event?.start_date ? event.start_date.slice(0, 16) : '',
    end_date: event?.end_date ? event.end_date.slice(0, 16) : '',
    venue_name: event?.venue_name || '',
    venue_address: event?.venue_address || '',
    city: event?.city || '',
    state: event?.state || '',
    event_type_id: event?.event_type_id || undefined,
    max_attendees: event?.max_attendees || undefined,
    is_free: event?.is_free ?? true,
    ticket_price: event?.ticket_price || 0,
    custom_form_schema: event?.custom_form_schema || { fields: [] },
    status: event?.status || 'draft',
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!event)
  const [eventTypes, setEventTypes] = useState<any[]>([])

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const newSlug = generateSlug(formData.title)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, slugManuallyEdited])

  // Fetch event types
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const res = await fetch('/api/event-types')
        if (res.ok) {
          const data = await res.json()
          setEventTypes(data.event_types || [])
        }
      } catch (err) {
        console.error('Error fetching event types:', err)
      }
    }
    fetchEventTypes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.start_date || !formData.end_date || !formData.venue_name || !formData.venue_address || !formData.city) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Validate dates
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        setError('End date must be after start date')
        setLoading(false)
        return
      }

      // Prepare data
      const dataToSubmit = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      }

      // Create or update event
      const url = event ? `/api/events/${event.id}` : '/api/events'
      const method = event ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event')
      }

      // Redirect to events list
      router.push(`/dashboard/communities/${communitySlug}/events`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 font-bold text-sm">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4 pb-2 border-b-2 border-ink">
          Basic Information
        </h3>

        <div className="space-y-5">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-foreground mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              placeholder="Friday Night Board Game Session"
              required
            />
          </div>

          {/* URL Slug */}
          <div>
            <label htmlFor="slug" className="block text-xs font-bold text-foreground mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value })
                setSlugManuallyEdited(true)
              }}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              placeholder="friday-night-session"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Unique within your community
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))] resize-none"
              placeholder="Tell attendees about this event..."
              rows={5}
            />
          </div>
        </div>
      </section>

      {/* Date & Time Section */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4 pb-2 border-b-2 border-ink">
          Date & Time
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="start_date" className="block text-xs font-bold text-foreground mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              required
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-xs font-bold text-foreground mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              required
            />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4 pb-2 border-b-2 border-ink">
          Location
        </h3>

        <div className="space-y-5">
          <div>
            <label htmlFor="venue_name" className="block text-xs font-bold text-foreground mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              id="venue_name"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              placeholder="Cafe Coffee Day, Koramangala"
              required
            />
          </div>

          <div>
            <label htmlFor="venue_address" className="block text-xs font-bold text-foreground mb-2">
              Venue Address *
            </label>
            <textarea
              id="venue_address"
              value={formData.venue_address}
              onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))] resize-none"
              placeholder="Full address"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-foreground mb-2">
                City *
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                required
              >
                <option value="">Select city</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="state" className="block text-xs font-bold text-foreground mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                placeholder="Karnataka"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event Settings */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4 pb-2 border-b-2 border-ink">
          Event Settings
        </h3>

        <div className="space-y-5">
          {/* Event Type */}
          <div>
            <label htmlFor="event_type_id" className="block text-xs font-bold text-foreground mb-2">
              Event Type
            </label>
            <select
              id="event_type_id"
              value={formData.event_type_id || ''}
              onChange={(e) => setFormData({ ...formData, event_type_id: e.target.value || undefined })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
            >
              <option value="">Select type (optional)</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="max_attendees" className="block text-xs font-bold text-foreground mb-2">
              Maximum Attendees
            </label>
            <input
              type="number"
              id="max_attendees"
              value={formData.max_attendees || ''}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-3">
              Pricing *
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: true, ticket_price: 0 })}
                  className="w-5 h-5 border-2 border-ink text-coral focus:ring-2 focus:ring-coral"
                />
                <span className="text-sm font-bold">Free Event</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: false })}
                  className="w-5 h-5 border-2 border-ink text-coral focus:ring-2 focus:ring-coral"
                />
                <span className="text-sm font-bold">Paid Event</span>
              </label>

              {!formData.is_free && (
                <div className="ml-8">
                  <label htmlFor="ticket_price" className="block text-xs font-bold text-foreground mb-2">
                    Ticket Price (INR)
                  </label>
                  <input
                    type="number"
                    id="ticket_price"
                    value={formData.ticket_price || ''}
                    onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
                    placeholder="500"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-xs font-bold text-foreground mb-2">
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral shadow-[2px_2px_0_0_hsl(var(--ink))]"
              required
            >
              <option value="draft">Draft (Not visible)</option>
              <option value="published">Published (Open for registration)</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Custom Registration Form */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4 pb-2 border-b-2 border-ink">
          Custom Registration Form
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Add custom fields to collect additional information from attendees (beyond name, email, phone)
        </p>
        <SimpleFormBuilder
          schema={formData.custom_form_schema || { fields: [] }}
          onChange={(schema) => setFormData({ ...formData, custom_form_schema: schema })}
        />
      </section>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-4 bg-background text-foreground font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 uppercase tracking-wider text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-4 bg-coral text-white font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
        >
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
