'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { CommunityCard } from '@/components/CommunityCard'
import { EventCard } from '@/components/events/EventCard'
import { useAuth } from '@/contexts/AuthContext'
import { BoardGameElements } from '@/components/BoardGameElements'
import { Search, Filter, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types/events'

const INDIAN_CITIES = [
  'All Cities',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
  'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
  'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar',
  'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Thiruvananthapuram',
  'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati',
  'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi',
  'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
  'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar',
  'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
  'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli',
  'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Other'
]

interface Community {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  state: string | null
  logo_url: string | null
  accent_color: string
  follower_count: number
  events_count: number
  games_count: number
  created_at?: string
}

interface FeedData {
  upcomingEvents: Event[]
  eventsInUserCity: Event[]
  eventsFromFollowedCommunities: Event[]
  newCommunities: Community[]
  activeCommunities: Community[]
  userCity: string | null
  hasFollowedCommunities: boolean
}

export default function DiscoverPage() {
  const { user } = useAuth()
  const [feedData, setFeedData] = useState<FeedData>({
    upcomingEvents: [],
    eventsInUserCity: [],
    eventsFromFollowedCommunities: [],
    newCommunities: [],
    activeCommunities: [],
    userCity: null,
    hasFollowedCommunities: false,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All Cities')
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  // Fetch feed data
  useEffect(() => {
    const fetchFeedData = async () => {
      setLoading(true)
      try {
        // 1. Fetch upcoming events (next 5 from all communities)
        const upcomingRes = await fetch(`/api/events?status=published&date_from=${new Date().toISOString()}`)
        const upcomingData = await upcomingRes.json()
        const upcomingEvents = (upcomingData.events || [])
          .slice(0, 5)
          .map((e: any) => ({ ...e, community: e.community }))

        let userCity = null
        let eventsInUserCity: Event[] = []
        let eventsFromFollowedCommunities: Event[] = []
        let hasFollowedCommunities = false

        // Get user-specific data if logged in
        if (user) {
          // Get user profile for detected city
          const profileRes = await fetch('/api/users/me')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            userCity = profileData.profile?.detected_city || profileData.profile?.city

            // 2. Fetch events in user's city
            if (userCity) {
              const cityEventsRes = await fetch(`/api/events?status=published&city=${userCity}&date_from=${new Date().toISOString()}`)
              const cityEventsData = await cityEventsRes.json()
              eventsInUserCity = (cityEventsData.events || [])
                .slice(0, 4)
                .map((e: any) => ({ ...e, community: e.community }))
            }
          }

          // Get followed communities
          const followingRes = await fetch('/api/users/me/following')
          const followingData = await followingRes.json()
          if (followingData.following && followingData.following.length > 0) {
            hasFollowedCommunities = true
            const followingMap: Record<string, boolean> = {}
            followingData.following.forEach((f: any) => {
              followingMap[f.community_id] = true
            })
            setFollowingMap(followingMap)

            // 3. Fetch events from followed communities
            const followedCommunityIds = followingData.following.map((f: any) => f.community_id)
            const followedEventsPromises = followedCommunityIds.map((id: string) =>
              fetch(`/api/events?status=published&community_id=${id}&date_from=${new Date().toISOString()}`)
            )
            const followedEventsResponses = await Promise.all(followedEventsPromises)
            const followedEventsDataArray = await Promise.all(
              followedEventsResponses.map(res => res.json())
            )
            const allFollowedEvents = followedEventsDataArray
              .flatMap(data => data.events || [])
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 5)
              .map((e: any) => ({ ...e, community: e.community }))
            eventsFromFollowedCommunities = allFollowedEvents
          }
        }

        // 4. Fetch new communities (created in last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const communitiesRes = await fetch('/api/communities?sort=newest')
        const communitiesData = await communitiesRes.json()
        const newCommunities = (communitiesData.communities || [])
          .filter((c: Community) => {
            if (!c.created_at) return false
            return new Date(c.created_at) >= sevenDaysAgo
          })
          .slice(0, 4)

        // 5. Fetch active communities (most events in last 30 days)
        // For now, using events_count as proxy for active communities
        const activeCommunitiesRes = await fetch('/api/communities?sort=followers')
        const activeCommunitiesData = await activeCommunitiesRes.json()
        const activeCommunities = (activeCommunitiesData.communities || [])
          .sort((a: Community, b: Community) => (b.events_count || 0) - (a.events_count || 0))
          .slice(0, 4)

        setFeedData({
          upcomingEvents,
          eventsInUserCity,
          eventsFromFollowedCommunities,
          newCommunities,
          activeCommunities,
          userCity,
          hasFollowedCommunities,
        })
      } catch (error) {
        console.error('Failed to fetch feed data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedData()
  }, [user])

  const handleFollowChange = (communityId: string, following: boolean) => {
    setFollowingMap((prev) => ({ ...prev, [communityId]: following }))
  }

  // Filter feed based on search/city
  const filterCommunities = (communities: Community[]) => {
    return communities.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
      const matchesCity = city === 'All Cities' || c.city === city
      return matchesSearch && matchesCity
    })
  }

  const filterEvents = (events: Event[]) => {
    return events.filter((e) => {
      const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
      const matchesCity = city === 'All Cities' || e.city === city
      return matchesSearch && matchesCity
    })
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen art-bg relative overflow-hidden">
        <BoardGameElements />

        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] py-3 px-4 md:py-4 md:px-6 mb-4 animate-slide-up">
            <h1 className="text-lg md:text-xl font-black mb-1 text-ink uppercase tracking-tight">Discover</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">Your personalized board gaming feed</p>
          </div>

          {/* Compact Filters */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] py-2 px-3 mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events & communities..."
                  className="w-full px-3 py-1.5 pl-8 text-xs border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              </div>

              {/* City Filter */}
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 pl-8 text-xs border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral appearance-none"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={12} />
              </div>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🎲</div>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Loading your feed...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 01. Upcoming Events */}
              {filterEvents(feedData.upcomingEvents).length > 0 && (
                <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                      <span className="text-coral mr-2">01</span>
                      Upcoming Events
                    </h2>
                    <Link href="/events" className="text-xs text-coral font-bold uppercase tracking-wide hover:underline flex items-center gap-1">
                      See All
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="space-y-3">
                    {filterEvents(feedData.upcomingEvents).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {/* 02. Events You Might Like (User's City) */}
              {user && feedData.userCity && filterEvents(feedData.eventsInUserCity).length > 0 && (
                <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                        <span className="text-grape mr-2">02</span>
                        Events You Might Like
                      </h2>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        In {feedData.userCity}
                      </p>
                    </div>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="space-y-3">
                    {filterEvents(feedData.eventsInUserCity).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state for Events You Might Like when no events */}
              {user && feedData.userCity && feedData.eventsInUserCity.length === 0 && (
                <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                        <span className="text-grape mr-2">02</span>
                        Events You Might Like
                      </h2>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        In {feedData.userCity}
                      </p>
                    </div>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="bg-muted/30 border-2 border-dashed border-ink p-6 text-center">
                    <p className="text-xs text-muted-foreground font-mono">
                      No events found in your city yet
                    </p>
                  </div>
                </section>
              )}

              {/* 03. Events from Communities I Follow */}
              {user && feedData.hasFollowedCommunities && (
                <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                      <span className="text-mint mr-2">03</span>
                      Events from Communities I Follow
                    </h2>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  {filterEvents(feedData.eventsFromFollowedCommunities).length > 0 ? (
                    <div className="space-y-3">
                      {filterEvents(feedData.eventsFromFollowedCommunities).map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/30 border-2 border-dashed border-ink p-6 text-center">
                      <p className="text-xs text-muted-foreground font-mono mb-3">
                        No upcoming events from communities you follow
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Empty state for Events from Communities I Follow when not following any */}
              {user && !feedData.hasFollowedCommunities && (
                <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                      <span className="text-mint mr-2">03</span>
                      Events from Communities I Follow
                    </h2>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="bg-muted/30 border-2 border-dashed border-ink p-6 text-center">
                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      You're not following any communities yet
                    </p>
                    <Link href="/discover">
                      <button className="px-4 py-2 bg-coral text-white font-bold text-xs border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift uppercase tracking-wide">
                        Discover Communities
                      </button>
                    </Link>
                  </div>
                </section>
              )}

              {/* 04. New Communities */}
              {filterCommunities(feedData.newCommunities).length > 0 && (
                <section className="animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                      <span className="text-sunny mr-2">04</span>
                      New Communities
                    </h2>
                    <Link href="/communities" className="text-xs text-coral font-bold uppercase tracking-wide hover:underline flex items-center gap-1">
                      See All
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filterCommunities(feedData.newCommunities).map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        isFollowing={!!followingMap[community.id]}
                        onFollowChange={(following) => handleFollowChange(community.id, following)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 05. Active Communities */}
              {filterCommunities(feedData.activeCommunities).length > 0 && (
                <section className="animate-slide-up" style={{ animationDelay: '600ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-sm uppercase tracking-wider text-ink">
                      <span className="text-coral mr-2">05</span>
                      Active Communities
                    </h2>
                    <Link href="/communities" className="text-xs text-coral font-bold uppercase tracking-wide hover:underline flex items-center gap-1">
                      See All
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="h-[2px] bg-ink mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filterCommunities(feedData.activeCommunities).map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        isFollowing={!!followingMap[community.id]}
                        onFollowChange={(following) => handleFollowChange(community.id, following)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State - No content at all */}
              {feedData.upcomingEvents.length === 0 &&
                feedData.eventsInUserCity.length === 0 &&
                feedData.eventsFromFollowedCommunities.length === 0 &&
                feedData.newCommunities.length === 0 &&
                feedData.activeCommunities.length === 0 && (
                  <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--sunny))] p-12 text-center">
                    <div className="text-4xl mb-4">🎲</div>
                    <h3 className="text-xl font-black mb-2 text-ink uppercase">Nothing to show yet</h3>
                    <p className="text-muted-foreground">Check back soon for events and communities</p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
