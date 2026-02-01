import { CheckCircle, Calendar, MapPin, Ticket } from 'lucide-react'
import type { EventRegistration } from '@/types/events'
import { formatDateTime, formatEventDateRange } from '@/lib/utils/date'

interface RegistrationSuccessProps {
  registration: EventRegistration
}

export function RegistrationSuccess({ registration }: RegistrationSuccessProps) {
  const event = registration.event

  if (!event) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-mint border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] mb-4">
          <CheckCircle size={32} className="text-ink" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">
          Registration Successful!
        </h2>
        <p className="text-sm text-muted-foreground font-mono">
          Confirmation sent to {registration.email}
        </p>
      </div>

      {/* QR Code Ticket */}
      <div className="bg-card border-2 border-ink shadow-[6px_6px_0_0_hsl(var(--ink))] overflow-hidden">
        {/* Header */}
        <div className="bg-coral text-white px-6 py-4 border-b-2 border-ink">
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={20} strokeWidth={2.5} />
            <h3 className="font-black text-sm uppercase tracking-wider">
              Your Ticket
            </h3>
          </div>
          <p className="text-xs opacity-90 font-mono">
            Present this QR code at the event
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          {registration.qr_code_url && (
            <div className="flex justify-center">
              <div className="bg-white p-4 border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))]">
                <img
                  src={registration.qr_code_url}
                  alt="Ticket QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          {/* Ticket Code */}
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">
              TICKET CODE
            </p>
            <p className="text-xl font-black font-mono text-foreground tracking-wider">
              {registration.ticket_code}
            </p>
          </div>

          {/* Event Details */}
          <div className="pt-4 border-t-2 border-ink space-y-3">
            <div>
              <h4 className="font-black text-lg text-foreground leading-tight">
                {event.title}
              </h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-coral mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-foreground">
                    {formatEventDateRange(event.start_date, event.end_date)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatDateTime(event.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-coral mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-foreground">{event.venue_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {event.venue_address}, {event.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="pt-4 border-t-2 border-ink">
            <p className="text-xs font-bold text-muted-foreground mb-2">
              ATTENDEE DETAILS
            </p>
            <div className="space-y-1 text-sm font-mono">
              <p className="font-bold text-foreground">{registration.full_name}</p>
              <p className="text-muted-foreground">{registration.email}</p>
              <p className="text-muted-foreground">{registration.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-sunny/20 border-2 border-ink px-5 py-4 shadow-[3px_3px_0_0_hsl(var(--ink))]">
        <p className="text-xs font-bold text-foreground mb-2">
          IMPORTANT INSTRUCTIONS:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 font-mono">
          <li>• Save this QR code or take a screenshot</li>
          <li>• Present it at the event for check-in</li>
          <li>• Arrive 10-15 minutes early</li>
          {!event.is_free && registration.payment_status === 'pending' && (
            <li className="text-coral font-bold">
              • Complete payment to confirm your registration
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-background text-foreground font-bold text-sm border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[5px_5px_0_0_hsl(var(--ink))] transition-all duration-200 uppercase tracking-wider"
        >
          Print Ticket
        </button>
        <a
          href={`/events/${event.id}`}
          className="flex-1 px-6 py-3 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[5px_5px_0_0_hsl(var(--ink))] transition-all duration-200 uppercase tracking-wider text-center"
        >
          View Event
        </a>
      </div>

      {/* TODO: Add to Calendar functionality (Phase 5) */}
    </div>
  )
}
