import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, ArrowLeft, Filter } from 'lucide-react'
import { EventCard } from '@/components/events/EventCard'
import { BoardGameElements } from '@/components/BoardGameElements'
import { PlatformBadge } from '@/components/PlatformBadge'
import type { Event } from '@/types/events'

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    city?: string
    event_type?: string
    is_free?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('events')
    .select(`
      *,
      event_type:event_types(id, name, slug),
      community:communities(id, name, slug, logo_url)
    `)
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString()) // Only upcoming events

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }
  if (params.city) {
    query = query.eq('city', params.city)
  }
  if (params.event_type) {
    query = query.eq('event_type_id', params.event_type)
  }
  if (params.is_free === 'true') {
    query = query.eq('is_free', true)
  }

  // Sort by start date
  query = query.order('start_date', { ascending: true })

  const { data: events, error } = await query

  // Get unique cities for filter
  const { data: cities } = await supabase
    .from('events')
    .select('city')
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())

  const uniqueCities = Array.from(new Set(cities?.map((e) => e.city))).sort()

  // Get event types for filter
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen art-bg relative overflow-hidden">
      {/* Decorative floating shapes */}
      <BoardGameElements />

      <div className="container max-w-4xl mx-auto px-5 py-10">
        {/* Back Button */}
        <div className="mb-6 animate-slide-up">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Discover
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-coral text-white p-3 border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))]">
              <Calendar size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-foreground tracking-tight leading-none">
                Upcoming Events
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {events?.length || 0} events happening soon
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section
          className="mb-8 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--ink))]">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} />
              <h3 className="font-black text-xs uppercase tracking-wider">
                Filters
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search events..."
                  defaultValue={params.search}
                  className="w-full px-3 py-2 bg-background border-2 border-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>

              {/* City Filter */}
              <div>
                <select
                  defaultValue={params.city}
                  className="w-full px-3 py-2 bg-background border-2 border-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <select
                  defaultValue={params.event_type}
                  className="w-full px-3 py-2 bg-background border-2 border-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                >
                  <option value="">All Types</option>
                  {eventTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Free Events Only */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={params.is_free === 'true'}
                    className="w-4 h-4 border-2 border-ink text-coral focus:ring-2 focus:ring-coral"
                  />
                  <span className="text-xs font-bold">Free events only</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Events List */}
        <section
          className="animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          {error && (
            <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 font-bold text-sm mb-6">
              Error loading events. Please try again.
            </div>
          )}

          {!error && events && events.length > 0 && (
            <div className="space-y-5">
              {events.map((event) => (
                <EventCard key={event.id} event={event as Event} />
              ))}
            </div>
          )}

          {!error && (!events || events.length === 0) && (
            <div className="bg-card border-2 border-ink p-10 shadow-[4px_4px_0_0_hsl(var(--ink))] text-center">
              <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} strokeWidth={1.5} />
              <h3 className="font-black text-lg text-foreground mb-2">
                No Events Found
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {params.search || params.city || params.event_type
                  ? 'Try adjusting your filters'
                  : 'Check back soon for upcoming events!'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Platform Badge */}
      <PlatformBadge />
    </div>
  )
}

export const metadata = {
  title: 'Upcoming Events - BoardGameCulture',
  description: 'Find and join board gaming events happening near you',
}
