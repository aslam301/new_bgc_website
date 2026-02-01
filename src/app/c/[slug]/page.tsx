import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Instagram,
  Hash,
  Globe,
  MapPin,
  Calendar,
  Gamepad2,
  ArrowLeft
} from 'lucide-react'
import { CommunityFollowButton } from '@/components/CommunityFollowButton'
import { TruncatedText } from '@/components/TruncatedText'
import { PlatformBadge } from '@/components/PlatformBadge'
import { BoardGameElements } from '@/components/BoardGameElements'
import { EventCard } from '@/components/events/EventCard'
import type { Event } from '@/types/events'
import GameCard from '@/components/games/GameCard'
import type { CommunityGame } from '@/types/games'

interface CommunityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get community data
  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !community) {
    notFound()
  }

  // Check if current user follows this community
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
      .from('community_followers')
      .select('id')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single()

    isFollowing = !!followData
  }

  // Get upcoming events for this community
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('community_id', community.id)
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(3)

  // Get game collection (owned games only, limit to 6 for preview)
  const { data: communityGames } = await supabase
    .from('community_games')
    .select(`
      *,
      game:games(*)
    `)
    .eq('community_id', community.id)
    .eq('status', 'own')
    .order('created_at', { ascending: false })
    .limit(6)

  // Social links configuration
  const socialLinks = [
    {
      name: 'WhatsApp',
      url: community.whatsapp_url,
      Icon: MessageCircle,
      color: 'coral' as const,
    },
    {
      name: 'Instagram',
      url: community.instagram_url,
      Icon: Instagram,
      color: 'sunny' as const,
    },
    {
      name: 'Discord',
      url: community.discord_url,
      Icon: Hash,
      color: 'grape' as const,
    },
    {
      name: 'Website',
      url: community.website_url,
      Icon: Globe,
      color: 'mint' as const,
    },
  ].filter((link) => link.url)

  const colorStyles = {
    coral: 'bg-coral text-white shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]',
    sunny: 'bg-sunny text-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]',
    grape: 'bg-grape text-white shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]',
    mint: 'bg-mint text-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]',
  }

  return (
    <div className="min-h-screen art-bg relative overflow-hidden">
      {/* Decorative floating shapes */}
      <BoardGameElements />

      <div className="container max-w-lg mx-auto px-5 py-10 pb-10">
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

        {/* Hero Section - Community Header */}
        <header className="mb-10 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-start gap-5 mb-6">
            {/* Avatar */}
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.name}
                className="w-20 h-20 rounded-lg border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] object-cover bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] bg-white flex items-center justify-center text-4xl">
                🎲
              </div>
            )}

            {/* Name & Location */}
            <div className="pt-1 flex-1">
              <h1 className="font-black text-lg text-foreground tracking-tight leading-none mb-1">
                {community.name}
              </h1>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground mb-2">
                <MapPin size={10} />
                <span>
                  {community.city}
                  {community.state ? `, ${community.state}` : ''}
                </span>
              </div>
              {/* Instagram-style Stats */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1">
                  <span className="font-black text-ink">{community.events_count || 0}</span>
                  <span className="text-muted-foreground">Events</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-1">
                  <span className="font-black text-ink">{community.follower_count || 0}</span>
                  <span className="text-muted-foreground">
                    {community.follower_count === 1 ? 'Follower' : 'Followers'}
                  </span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-1">
                  <span className="font-black text-ink">{community.games_count || 0}</span>
                  <span className="text-muted-foreground">Games</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <section
            className="space-y-2 mb-8 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            {socialLinks.slice(0, 2).map((link) => (
              <a
                key={link.name}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 w-full py-4 px-5 font-bold text-sm uppercase tracking-wider transition-all duration-200 btn-lift border-2 border-ink ${colorStyles[link.color]}`}
              >
                <link.Icon size={20} strokeWidth={2.5} />
                <span>{link.name}</span>
              </a>
            ))}

            {/* Grid for remaining links */}
            {socialLinks.length > 2 && (
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.slice(2).map((link) => (
                  <a
                    key={link.name}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 w-full py-4 px-4 font-bold text-xs uppercase tracking-wider transition-all duration-200 btn-lift border-2 border-ink ${colorStyles[link.color]}`}
                  >
                    <link.Icon size={16} strokeWidth={2.5} />
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Follow Button */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CommunityFollowButton
            communitySlug={slug}
            initialFollowing={isFollowing}
            initialFollowerCount={community.follower_count || 0}
            userId={user?.id}
          />
        </section>

        {/* Upcoming Events Section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-xs text-coral font-bold">01</span>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">
              Events
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event as Event} />
              ))}
              {community.events_count > 3 && (
                <Link
                  href={`/events?community_id=${community.id}`}
                  className="block text-center py-3 text-xs font-bold text-coral hover:text-coral/80 transition-colors"
                >
                  View all {community.events_count} events →
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--sunny))]">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto mb-3" size={32} strokeWidth={1.5} />
                <p className="text-sm font-bold">No upcoming events yet</p>
                <p className="text-xs mt-1">Check back soon!</p>
              </div>
            </div>
          )}
        </section>

        {/* Game Collection Section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-xs text-coral font-bold">02</span>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">
              Games
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          {communityGames && communityGames.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {communityGames.map((cg) => {
                  const typedCommunityGame = cg as unknown as CommunityGame
                  return typedCommunityGame.game ? (
                    <GameCard
                      key={typedCommunityGame.id}
                      game={typedCommunityGame.game}
                      communityGame={typedCommunityGame}
                      showStatus={false}
                    />
                  ) : null
                })}
              </div>
              {community.games_count > 6 && (
                <div className="text-center py-3 text-xs font-bold text-coral">
                  {community.games_count - 6} more games in collection
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--mint))]">
              <div className="text-center py-8 text-muted-foreground">
                <Gamepad2 className="mx-auto mb-3" size={32} strokeWidth={1.5} />
                <p className="text-sm font-bold">No games in collection yet</p>
                <p className="text-xs mt-1">Check back soon!</p>
              </div>
            </div>
          )}
        </section>

        {/* About Section */}
        {community.description && (
          <section className="mb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs text-coral font-bold">03</span>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">
                About
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--grape))]">
              <TruncatedText text={community.description} maxLength={200} />
            </div>
          </section>
        )}
      </div>

      {/* Small Platform Badge (like Lovable) */}
      <PlatformBadge />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CommunityPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: community } = await supabase
    .from('communities')
    .select('name, description, city')
    .eq('slug', slug)
    .single()

  if (!community) {
    return {
      title: 'Community Not Found',
    }
  }

  return {
    title: `${community.name} - BoardGameCulture`,
    description:
      community.description ||
      `Join ${community.name}, a board gaming community in ${community.city}`,
  }
}
