import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import {
  Edit, Calendar, Gamepad2, Users, Eye, Plus, ArrowRight, Clock
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils/date'

interface CommunityDashboardProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CommunityDashboardPage({ params }: CommunityDashboardProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get community
  const { data: community } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  // Check if user is admin
  const { data: isAdmin } = await supabase
    .from('community_admins')
    .select('id, role')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  if (!isAdmin) {
    redirect(`/c/${slug}`)
  }

  // Get stats
  const { count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', community.id)

  const { count: gamesCount } = await supabase
    .from('community_games')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', community.id)

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, title, start_date, status, registration_count, max_attendees, city')
    .eq('community_id', community.id)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(5)

  // Get past events
  const { data: pastEvents } = await supabase
    .from('events')
    .select('id, title, start_date, status, registration_count, city')
    .eq('community_id', community.id)
    .lt('start_date', new Date().toISOString())
    .order('start_date', { ascending: false })
    .limit(3)

  // Get recent registrations across all events
  const { data: recentRegistrations } = await supabase
    .from('event_registrations')
    .select(`
      id,
      created_at,
      events (
        id,
        title
      ),
      profiles (
        full_name,
        avatar_url
      )
    `)
    .in('event_id', upcomingEvents?.map(e => e.id) || [])
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-ink mb-1 uppercase tracking-tight">
                {community.name}
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground font-mono">Community Admin Dashboard</p>
            </div>
            <Link href={`/c/${slug}`}>
              <button className="px-3 py-2 bg-white border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift text-[10px] md:text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <Eye size={14} strokeWidth={2.5} />
                <span className="hidden md:inline">View Public Page</span>
                <span className="md:hidden">View</span>
              </button>
            </Link>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="bg-card border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] p-2 md:p-3">
              <Users size={12} className="text-coral mb-1" strokeWidth={2.5} />
              <p className="text-lg md:text-xl font-black text-ink leading-none">{community.follower_count || 0}</p>
              <p className="text-[8px] md:text-[9px] font-mono uppercase text-muted-foreground mt-0.5">Followers</p>
            </div>

            <div className="bg-card border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] p-2 md:p-3">
              <Calendar size={12} className="text-sunny mb-1" strokeWidth={2.5} />
              <p className="text-lg md:text-xl font-black text-ink leading-none">{eventsCount || 0}</p>
              <p className="text-[8px] md:text-[9px] font-mono uppercase text-muted-foreground mt-0.5">Events</p>
            </div>

            <div className="bg-card border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] p-2 md:p-3">
              <Gamepad2 size={12} className="text-grape mb-1" strokeWidth={2.5} />
              <p className="text-lg md:text-xl font-black text-ink leading-none">{gamesCount || 0}</p>
              <p className="text-[8px] md:text-[9px] font-mono uppercase text-muted-foreground mt-0.5">Games</p>
            </div>

            <Link href={`/dashboard/communities/${slug}/edit`} className="block">
              <div className="bg-coral text-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift p-2 md:p-3 h-full flex flex-col justify-center">
                <Edit size={12} className="mb-1" strokeWidth={2.5} />
                <p className="text-[8px] md:text-[9px] font-black uppercase leading-tight">Edit</p>
              </div>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            {/* Events Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {/* Upcoming Events */}
              <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm md:text-base font-black text-ink uppercase tracking-tight">Upcoming Events</h2>
                  <Link href={`/dashboard/communities/${slug}/events/new`}>
                    <button className="px-2 md:px-3 py-1 md:py-1.5 bg-coral text-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift text-[9px] md:text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <Plus size={10} strokeWidth={2.5} />
                      Create
                    </button>
                  </Link>
                </div>

                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map((event: any) => {
                      const spotsLeft = event.max_attendees ? event.max_attendees - event.registration_count : null
                      return (
                        <Link key={event.id} href={`/dashboard/communities/${slug}/events/${event.id}/edit`}>
                          <div className="bg-muted/30 border border-ink p-2 md:p-3 hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all group">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-xs md:text-sm text-ink mb-1 group-hover:text-coral transition-colors truncate">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-mono text-muted-foreground">
                                  <Clock size={10} />
                                  <span>{formatDate(event.start_date)} at {formatTime(event.start_date)}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs md:text-sm font-black text-ink">{event.registration_count}</p>
                                <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground uppercase">
                                  {event.max_attendees ? `/ ${event.max_attendees}` : 'registered'}
                                </p>
                                {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                                  <p className="text-[8px] md:text-[9px] font-black text-coral uppercase mt-0.5">
                                    {spotsLeft} left!
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-ink/20">
                    <Calendar size={24} className="mx-auto mb-2 text-muted-foreground" strokeWidth={2} />
                    <p className="text-xs font-mono text-muted-foreground">No upcoming events</p>
                  </div>
                )}

                <Link href={`/dashboard/communities/${slug}/events`}>
                  <button className="w-full mt-3 px-3 py-2 bg-background border-2 border-ink text-ink font-bold text-[10px] md:text-xs uppercase tracking-wide shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2">
                    View All Events
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </Link>
              </div>

              {/* Recent Registrations */}
              {recentRegistrations && recentRegistrations.length > 0 && (
                <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] p-3 md:p-4">
                  <h2 className="text-sm md:text-base font-black text-ink uppercase tracking-tight mb-3">Recent Registrations</h2>
                  <div className="space-y-1.5">
                    {recentRegistrations.slice(0, 6).map((reg: any) => (
                      <div key={reg.id} className="flex items-center justify-between text-[10px] md:text-xs py-1 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-ink bg-muted flex-shrink-0 flex items-center justify-center text-[8px]">
                            {reg.profiles?.avatar_url ? (
                              <img src={reg.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              '👤'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink truncate">{reg.profiles?.full_name || 'User'}</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground font-mono truncate">{reg.events?.title}</p>
                          </div>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-mono text-muted-foreground flex-shrink-0">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Quick Actions & Games */}
            <div className="space-y-3 md:space-y-4">
              {/* Quick Actions */}
              <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] p-3 md:p-4">
                <h2 className="text-sm md:text-base font-black text-ink uppercase tracking-tight mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href={`/dashboard/communities/${slug}/games/add`}>
                    <button className="w-full px-3 py-2 bg-mint text-ink border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift text-[10px] md:text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                      <Plus size={12} strokeWidth={2.5} />
                      Add Game
                    </button>
                  </Link>
                  <Link href={`/dashboard/communities/${slug}/games`}>
                    <button className="w-full px-3 py-2 bg-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift text-[10px] md:text-xs font-bold uppercase tracking-wide text-ink flex items-center justify-center gap-2">
                      <Gamepad2 size={12} strokeWidth={2.5} />
                      View Games
                    </button>
                  </Link>
                </div>
              </div>

              {/* Games Summary */}
              <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm md:text-base font-black text-ink uppercase tracking-tight">Game Collection</h2>
                  <Gamepad2 size={14} className="text-grape" strokeWidth={2.5} />
                </div>
                <div className="text-center py-4">
                  <p className="text-3xl md:text-4xl font-black text-ink mb-1">{gamesCount || 0}</p>
                  <p className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase">Total Games</p>
                </div>
                <Link href={`/dashboard/communities/${slug}/games`}>
                  <button className="w-full mt-3 px-3 py-2 bg-background border-2 border-ink text-ink font-bold text-[10px] md:text-xs uppercase tracking-wide shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2">
                    Manage Collection
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </Link>
              </div>

              {/* Past Events Summary */}
              {pastEvents && pastEvents.length > 0 && (
                <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] p-3 md:p-4">
                  <h2 className="text-sm md:text-base font-black text-ink uppercase tracking-tight mb-3">Recent Past Events</h2>
                  <div className="space-y-1.5">
                    {pastEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="text-[10px] md:text-xs py-1.5 border-b border-border last:border-0">
                        <p className="font-bold text-ink truncate">{event.title}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[9px] font-mono text-muted-foreground">{formatDate(event.start_date)}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{event.registration_count} attended</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
