import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Users, Calendar, Gamepad2, Plus, TrendingUp } from 'lucide-react'

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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-ink mb-2 uppercase tracking-tight">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-muted-foreground">Manage your communities and events</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--coral))] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                  My Communities
                </h3>
                <Users size={20} className="text-coral" strokeWidth={2.5} />
              </div>
              <p className="text-4xl font-black text-ink">{myCommunities.length}</p>
            </div>

            <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--sunny))] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                  Following
                </h3>
                <TrendingUp size={20} className="text-sunny" strokeWidth={2.5} />
              </div>
              <p className="text-4xl font-black text-ink">{followingCount}</p>
            </div>

            <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--grape))] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                  Total Events
                </h3>
                <Calendar size={20} className="text-grape" strokeWidth={2.5} />
              </div>
              <p className="text-4xl font-black text-ink">0</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Phase 2</p>
            </div>

            <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--mint))] p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                  Game Collection
                </h3>
                <Gamepad2 size={20} className="text-mint" strokeWidth={2.5} />
              </div>
              <p className="text-4xl font-black text-ink">0</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Phase 3</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-8 mb-8">
            <h2 className="text-xl font-black text-ink mb-6 uppercase tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/communities/new">
                <button className="w-full px-6 py-4 bg-coral text-white font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-3 uppercase tracking-wide text-sm">
                  <Plus size={20} strokeWidth={2.5} />
                  Create Community
                </button>
              </Link>

              <Link href="/communities">
                <button className="w-full px-6 py-4 bg-sunny text-ink font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift flex items-center justify-center gap-3 uppercase tracking-wide text-sm">
                  <Users size={20} strokeWidth={2.5} />
                  Discover
                </button>
              </Link>

              <button
                disabled
                className="w-full px-6 py-4 bg-muted text-muted-foreground font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] opacity-50 cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wide text-sm"
              >
                <Calendar size={20} strokeWidth={2.5} />
                Create Event (Phase 2)
              </button>
            </div>
          </div>

          {/* My Communities */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-8">
            <h2 className="text-xl font-black text-ink mb-6 uppercase tracking-tight">My Communities</h2>

            {myCommunities.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-ink/20 rounded-lg">
                <div className="text-4xl mb-3">🏘️</div>
                <h3 className="font-black text-lg text-ink mb-2 uppercase">No communities yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create your first community to get started
                </p>
                <Link href="/dashboard/communities/new">
                  <button className="px-6 py-3 bg-coral text-white font-bold border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift uppercase tracking-wide text-sm">
                    Create Community
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCommunities.map((community: any) => (
                  <Link key={community.id} href={`/c/${community.slug}`}>
                    <div className="bg-muted/30 border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-5">
                      <h3 className="font-black text-lg text-ink mb-2 uppercase tracking-tight line-clamp-1">
                        {community.name}
                      </h3>
                      <p className="font-mono text-[10px] text-muted-foreground mb-4 uppercase tracking-wide">
                        {community.city}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-black text-ink">{community.follower_count || 0}</div>
                          <div className="font-mono text-[8px] text-muted-foreground uppercase">Followers</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-ink">{community.events_count || 0}</div>
                          <div className="font-mono text-[8px] text-muted-foreground uppercase">Events</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-ink">{community.games_count || 0}</div>
                          <div className="font-mono text-[8px] text-muted-foreground uppercase">Games</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
