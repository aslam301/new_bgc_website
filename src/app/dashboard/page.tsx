import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Users, Calendar, Plus, MapPin, ArrowRight } from 'lucide-react'
import { EventCard } from '@/components/events/EventCard'
import { CommunityCard } from '@/components/CommunityCard'
import type { Event } from '@/types/events'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get communities user admins
  const { data: adminCommunities } = await supabase
    .from('community_admins')
    .select(`
      community_id,
      communities (
        id,
        slug,
        name,
        city,
        logo_url,
        accent_color,
        follower_count,
        events_count,
        games_count
      )
    `)
    .eq('user_id', user.id)

  const myCommunities = adminCommunities?.map((ac: any) => ac.communities) || []

  // Get events user is registered for (upcoming only)
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`
      event_id,
      events (
        *,
        communities (
          id,
          slug,
          name,
          logo_url,
          accent_color
        )
      )
    `)
    .eq('user_id', user.id)
    .gte('events.start_date', new Date().toISOString())
    .order('events.start_date', { ascending: true })
    .limit(5)

  const upcomingEvents = registrations?.map((r: any) => ({ ...r.events, community: r.events.communities })) || []

  // Get communities user follows
  const { data: followedCommunities } = await supabase
    .from('community_followers')
    .select(`
      community_id,
      communities (
        id,
        slug,
        name,
        description,
        city,
        state,
        logo_url,
        accent_color,
        follower_count,
        events_count,
        games_count
      )
    `)
    .eq('user_id', user.id)
    .limit(6)

  const following = followedCommunities?.map((fc: any) => fc.communities) || []

  // Get suggested events based on user's city
  const userCity = profile?.detected_city || profile?.city
  const { data: suggestedEvents } = await supabase
    .from('events')
    .select(`
      *,
      communities (
        id,
        slug,
        name,
        logo_url,
        accent_color
      )
    `)
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .eq('city', userCity)
    .order('start_date', { ascending: true })
    .limit(4)

  const suggested = suggestedEvents?.map((e: any) => ({ ...e, community: e.communities })) || []

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-3 md:p-6">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-black text-ink mb-1 uppercase tracking-tight">
              Dashboard
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-mono">Hey {profile?.full_name}!</p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-2 mb-4 md:mb-6">
            {myCommunities.length > 0 && (
              <Link href="/dashboard/communities/new" className="flex-1 md:flex-none">
                <button className="w-full px-3 md:px-4 py-2 bg-coral text-white font-bold text-[10px] md:text-xs border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2 uppercase tracking-wide">
                  <Plus size={14} strokeWidth={2.5} />
                  <span className="hidden md:inline">My Communities</span>
                  <span className="md:hidden">Communities</span>
                </button>
              </Link>
            )}
            <Link href="/discover" className="flex-1 md:flex-none">
              <button className="w-full px-3 md:px-4 py-2 bg-white text-ink font-bold text-[10px] md:text-xs border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2 uppercase tracking-wide">
                <Users size={14} strokeWidth={2.5} />
                Discover
              </button>
            </Link>
          </div>

          {/* Main Feed */}
          <div className="space-y-4 md:space-y-6">
            {/* Upcoming Events I'm Registered For */}
            {upcomingEvents.length > 0 && (
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-3 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-base md:text-lg font-black text-ink uppercase tracking-tight">
                    Your Upcoming Events
                  </h2>
                  <Calendar size={16} className="text-coral" strokeWidth={2.5} />
                </div>
                <div className="space-y-2 md:space-y-3">
                  {upcomingEvents.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Communities I'm Following */}
            {following.length > 0 && (
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-3 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-base md:text-lg font-black text-ink uppercase tracking-tight">
                    Communities You Follow
                  </h2>
                  <Users size={16} className="text-grape" strokeWidth={2.5} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {following.map((community: any) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      isFollowing={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Events */}
            {suggested.length > 0 && userCity && (
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-3 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <h2 className="text-base md:text-lg font-black text-ink uppercase tracking-tight">
                      Events in {userCity}
                    </h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-mono mt-0.5">
                      Suggested based on your location
                    </p>
                  </div>
                  <MapPin size={16} className="text-mint" strokeWidth={2.5} />
                </div>
                <div className="space-y-2 md:space-y-3">
                  {suggested.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <Link href="/discover">
                  <button className="w-full mt-3 md:mt-4 px-3 py-2 bg-background border-2 border-ink text-ink font-bold text-xs uppercase tracking-wide shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2">
                    Browse All Events
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </Link>
              </div>
            )}

            {/* My Communities (if admin) */}
            {myCommunities.length > 0 && (
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-3 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-base md:text-lg font-black text-ink uppercase tracking-tight">
                    My Communities
                  </h2>
                  <Users size={16} className="text-sunny" strokeWidth={2.5} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {myCommunities.map((community: any) => (
                    <Link key={community.id} href={`/dashboard/communities/${community.slug}`}>
                      <div className="bg-muted/30 border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-3 md:p-4 group">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-black text-sm md:text-base text-ink uppercase tracking-tight line-clamp-1 group-hover:text-coral transition-colors">
                            {community.name}
                          </h3>
                          <ArrowRight size={14} className="text-muted-foreground group-hover:text-coral transition-colors" strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[8px] md:text-[9px] text-muted-foreground mb-2">
                          <MapPin size={8} />
                          <span className="uppercase">{community.city}</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono text-muted-foreground">
                          <span><span className="font-black text-ink">{community.events_count || 0}</span> Events</span>
                          <span>|</span>
                          <span><span className="font-black text-ink">{community.follower_count || 0}</span> Followers</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {upcomingEvents.length === 0 && following.length === 0 && suggested.length === 0 && myCommunities.length === 0 && (
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-6 md:p-12 text-center">
                <div className="text-4xl mb-4">🎲</div>
                <h3 className="text-lg md:text-xl font-black text-ink mb-2 uppercase">Welcome to BoardGameCulture!</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 font-mono">
                  Start by discovering communities and events in your area
                </p>
                <Link href="/discover">
                  <button className="px-4 md:px-6 py-2 md:py-3 bg-coral text-white font-bold text-xs md:text-sm border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift uppercase tracking-wide">
                    Explore Communities
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
