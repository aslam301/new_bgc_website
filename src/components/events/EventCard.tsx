import Link from 'next/link'
import { MapPin, Calendar, Users, IndianRupee } from 'lucide-react'
import type { Event } from '@/types/events'
import { getShortDayMonth, formatTime } from '@/lib/utils/date'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { day, month } = getShortDayMonth(event.start_date)
  const startTime = formatTime(event.start_date)

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.registration_count
    : null

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group"
    >
      <article className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all duration-200 overflow-hidden">
        <div className="flex">
          {/* Date Badge */}
          <div className="bg-coral text-white border-r-2 border-ink p-4 flex flex-col items-center justify-center min-w-[80px]">
            <div className="font-black text-2xl leading-none">{day}</div>
            <div className="font-bold text-[10px] tracking-wider mt-1">{month}</div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* Title */}
            <h3 className="font-black text-sm text-foreground leading-tight mb-2 group-hover:text-coral transition-colors">
              {event.title}
            </h3>

            {/* Meta Info */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {/* Time */}
              <div className="flex items-center gap-2">
                <Calendar size={12} className="flex-shrink-0" />
                <span className="font-mono">{startTime}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="font-mono truncate">{event.venue_name}, {event.city}</span>
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2">
                <Users size={12} className="flex-shrink-0" />
                <span className="font-mono">
                  {event.registration_count} registered
                  {event.max_attendees && ` / ${event.max_attendees} max`}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              {/* Price Badge */}
              <div>
                {event.is_free ? (
                  <span className="inline-flex items-center px-2 py-1 bg-mint text-ink text-[10px] font-black uppercase tracking-wider border border-ink">
                    Free
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-sunny text-ink text-[10px] font-black uppercase tracking-wider border border-ink">
                    <IndianRupee size={10} />
                    {event.ticket_price}
                  </span>
                )}
              </div>

              {/* Spots Left Warning */}
              {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="text-[10px] font-bold text-coral">
                  Only {spotsLeft} spots left!
                </span>
              )}

              {/* Full Badge */}
              {spotsLeft === 0 && (
                <span className="text-[10px] font-black text-muted-foreground uppercase">
                  Event Full
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Community Badge (if showing events from multiple communities) */}
        {event.community && (
          <div className="border-t-2 border-ink bg-background/50 px-4 py-2 flex items-center gap-2">
            {event.community.logo_url ? (
              <img
                src={event.community.logo_url}
                alt={event.community.name}
                className="w-5 h-5 rounded border border-ink object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded border border-ink bg-white flex items-center justify-center text-xs">
                🎲
              </div>
            )}
            <span className="text-[10px] font-bold text-muted-foreground">
              {event.community.name}
            </span>
          </div>
        )}
      </article>
    </Link>
  )
}
