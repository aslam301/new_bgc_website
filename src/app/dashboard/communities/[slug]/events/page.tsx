import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Users, Edit, Eye, Trash2 } from 'lucide-react'
import type { Event } from '@/types/events'
import { formatDate, formatTime } from '@/lib/utils/date'

interface CommunityEventsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CommunityEventsPage({
  params,
}: CommunityEventsPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (communityError || !community) {
    notFound()
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc('is_community_admin', {
    p_community_id: community.id,
    p_user_id: user.id,
  })

  if (!isAdmin) {
    redirect(`/c/${slug}`)
  }

  // Get events for this community
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select(`
      *,
      event_type:event_types(id, name, slug)
    `)
    .eq('community_id', community.id)
    .order('start_date', { ascending: false })

  return (
    <div className="min-h-screen art-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Events
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Manage events for {community.name}
            </p>
          </div>

          <Link
            href={`/dashboard/communities/${slug}/events/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 uppercase tracking-wider"
          >
            <Plus size={16} />
            Create Event
          </Link>
        </div>

        {/* Events List */}
        {eventsError && (
          <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 font-bold text-sm mb-6">
            Error loading events. Please try again.
          </div>
        )}

        {!eventsError && events && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <EventRow key={event.id} event={event as Event} slug={slug} />
            ))}
          </div>
        )}

        {!eventsError && (!events || events.length === 0) && (
          <div className="bg-card border-2 border-ink p-12 shadow-[4px_4px_0_0_hsl(var(--ink))] text-center">
            <Calendar
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
              strokeWidth={1.5}
            />
            <h3 className="font-black text-lg text-foreground mb-2">
              No Events Yet
            </h3>
            <p className="text-sm text-muted-foreground font-mono mb-6">
              Create your first event to get started
            </p>
            <Link
              href={`/dashboard/communities/${slug}/events/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 uppercase tracking-wider"
            >
              <Plus size={16} />
              Create First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function EventRow({ event, slug }: { event: Event; slug: string }) {
  const statusColors = {
    draft: 'bg-background text-foreground',
    published: 'bg-mint text-ink',
    cancelled: 'bg-coral/20 text-coral',
    completed: 'bg-grape/20 text-grape',
  }

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.registration_count
    : null

  return (
    <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-black text-lg text-foreground">
                {event.title}
              </h3>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 border border-ink ${statusColors[event.status]}`}
              >
                {event.status}
              </span>
            </div>

            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span className="font-mono">
                  {formatDate(event.start_date)} at {formatTime(event.start_date)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={14} />
                <span className="font-mono">
                  {event.registration_count} registered
                  {event.max_attendees && ` / ${event.max_attendees} max`}
                  {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                    <span className="text-coral font-bold ml-2">
                      (Only {spotsLeft} left!)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {event.city}
              </span>
              {!event.is_free && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ₹{event.ticket_price}
                  </span>
                </>
              )}
              {event.is_free && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-bold text-mint">FREE</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${event.id}`}
              className="p-2 bg-background border-2 border-ink hover:bg-mint transition-colors"
              title="View Event"
            >
              <Eye size={16} />
            </Link>
            <Link
              href={`/dashboard/communities/${slug}/events/${event.id}/edit`}
              className="p-2 bg-background border-2 border-ink hover:bg-sunny transition-colors"
              title="Edit Event"
            >
              <Edit size={16} />
            </Link>
            <Link
              href={`/dashboard/communities/${slug}/events/${event.id}/registrations`}
              className="p-2 bg-coral text-white border-2 border-ink hover:bg-coral/90 transition-colors"
              title="View Registrations"
            >
              <Users size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
