import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Users, Calendar, Gamepad2, Plus, TrendingUp, MapPin } from 'lucide-react'

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
        follower_count,
        events_count,
        games_count
      )
    `)
    .eq('user_id', user.id)

  // Get communities user follows
  const { data: following } = await supabase
    .from('community_followers')
    .select('community_id')
    .eq('user_id', user.id)

  const myCommunities = adminCommunities?.map((ac: any) => ac.communities) || []
  const followingCount = following?.length || 0

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-3 md:p-8">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-black text-ink mb-1 uppercase tracking-tight">
              Dashboard
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">Hey {profile?.full_name}!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-6">
            {/* Left Sidebar - Quick Actions & Stats */}
            <div className="lg:col-span-1 space-y-3 md:space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
                <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--coral))] p-3 md:p-4">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground">
                      Communities
                    </span>
                    <Users size={12} className="text-coral" strokeWidth={2.5} />
                  </div>
                  <p className="text-xl md:text-2xl font-black text-ink">{myCommunities.length}</p>
                </div>

                <div className="bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--sunny))] p-3 md:p-4">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground">
                      Following
                    </span>
                    <TrendingUp size={12} className="text-sunny" strokeWidth={2.5} />
                  </div>
                  <p className="text-xl md:text-2xl font-black text-ink">{followingCount}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Quick Actions
                </h3>

                <Link href="/dashboard/communities/new">
                  <button className="w-full px-3 md:px-4 py-2 md:py-3 bg-coral text-white font-bold border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-wide">
                    <Plus size={14} strokeWidth={2.5} />
                    <span className="hidden md:inline">New Community</span>
                    <span className="md:hidden">New</span>
                  </button>
                </Link>

                <Link href="/discover">
                  <button className="w-full px-3 md:px-4 py-2 md:py-3 bg-white text-ink font-bold border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-wide">
                    <Users size={14} strokeWidth={2.5} />
                    Discover
                  </button>
                </Link>
              </div>
            </div>

            {/* Main Content - My Communities */}
            <div className="lg:col-span-3">
              <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-3 md:p-6">
                <h2 className="text-base md:text-lg font-black text-ink mb-3 md:mb-4 uppercase tracking-tight">
                  My Communities
                </h2>

                {myCommunities.length === 0 ? (
                  <div className="text-center py-8 md:py-12 border-2 border-dashed border-ink/20 rounded">
                    <div className="text-2xl md:text-3xl mb-2">🏘️</div>
                    <h3 className="font-black text-xs md:text-sm text-ink mb-1 uppercase">No communities yet</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4">
                      Create your first community
                    </p>
                    <Link href="/dashboard/communities/new">
                      <button className="px-4 md:px-5 py-2 md:py-2.5 bg-coral text-white font-bold border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift uppercase tracking-wide text-[10px] md:text-xs">
                        Create Community
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {myCommunities.map((community: any) => (
                      <Link key={community.id} href={`/c/${community.slug}`}>
                        <div className="bg-muted/30 border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-3 md:p-4">
                          <h3 className="font-black text-sm md:text-base text-ink mb-1 uppercase tracking-tight line-clamp-1">
                            {community.name}
                          </h3>
                          <div className="flex items-center gap-1 font-mono text-[8px] md:text-[9px] text-muted-foreground mb-2 md:mb-3">
                            <MapPin size={8} />
                            <span className="uppercase">{community.city}</span>
                          </div>

                          <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono text-muted-foreground">
                            <span><span className="font-black text-ink">{community.events_count || 0}</span> Events</span>
                            <span>|</span>
                            <span><span className="font-black text-ink">{community.follower_count || 0}</span> Followers</span>
                            <span className="hidden md:inline">|</span>
                            <span className="hidden md:inline"><span className="font-black text-ink">{community.games_count || 0}</span> Games</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
