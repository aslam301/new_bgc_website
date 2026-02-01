import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, CheckCircle, Clock, Download } from 'lucide-react'
import type { EventRegistration, Event } from '@/types/events'
import { formatDateTime } from '@/lib/utils/date'

interface EventRegistrationsPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

export default async function EventRegistrationsPage({
  params,
}: EventRegistrationsPageProps) {
  const { slug, id } = await params
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

  // Get event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('community_id', community.id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Get registrations
  const { data: registrations, error: registrationsError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  const checkedInCount =
    registrations?.filter((r) => r.is_checked_in).length || 0

  return (
    <div className="min-h-screen art-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/dashboard/communities/${slug}/events`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Events
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            Event Registrations
          </h1>
          <p className="text-sm text-muted-foreground font-mono mb-4">
            {event.title}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--mint))]">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-coral" strokeWidth={2.5} />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    TOTAL REGISTERED
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {event.registration_count}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--sunny))]">
              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-coral"
                  strokeWidth={2.5}
                />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    CHECKED IN
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {checkedInCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border-2 border-ink p-4 shadow-[3px_3px_0_0_hsl(var(--grape))]">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-coral" strokeWidth={2.5} />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    PENDING
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {event.registration_count - checkedInCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[5px_5px_0_0_hsl(var(--ink))] transition-all duration-200 font-bold text-sm"
            onClick={() => {
              // TODO: Implement CSV export
              alert('CSV export coming soon!')
            }}
          >
            <Download size={16} />
            Export to CSV
          </button>
        </div>

        {/* Registrations Table */}
        {registrationsError && (
          <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 font-bold text-sm mb-6">
            Error loading registrations. Please try again.
          </div>
        )}

        {!registrationsError && registrations && registrations.length > 0 && (
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b-2 border-ink">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                      Ticket Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration, index) => (
                    <tr
                      key={registration.id}
                      className={`border-b border-border ${
                        index % 2 === 0 ? 'bg-background/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-foreground">
                        {registration.full_name}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {registration.email}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {registration.phone}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {formatDateTime(registration.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {registration.is_checked_in ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-mint text-ink text-[10px] font-black uppercase tracking-wider border border-ink">
                            <CheckCircle size={10} />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-sunny text-ink text-[10px] font-black uppercase tracking-wider border border-ink">
                            <Clock size={10} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-foreground">
                        {registration.ticket_code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!registrationsError &&
          (!registrations || registrations.length === 0) && (
            <div className="bg-card border-2 border-ink p-12 shadow-[4px_4px_0_0_hsl(var(--ink))] text-center">
              <Users
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
                strokeWidth={1.5}
              />
              <h3 className="font-black text-lg text-foreground mb-2">
                No Registrations Yet
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                Registrations will appear here once people sign up
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
