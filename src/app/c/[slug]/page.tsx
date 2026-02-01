'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Instagram,
  Hash,
  Globe,
  MapPin,
  Users,
  Calendar,
  Gamepad2,
  ArrowLeft
} from 'lucide-react'

interface Community {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  state: string | null
  logo_url: string | null
  accent_color: string
  whatsapp_url: string | null
  instagram_url: string | null
  discord_url: string | null
  website_url: string | null
  follower_count: number
  events_count: number
  games_count: number
}

export default function CommunityPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch(`/api/communities/${slug}`)
        const data = await res.json()

        if (!res.ok || !data.community) {
          router.push('/404')
          return
        }

        setCommunity(data.community)
        setFollowerCount(data.community.follower_count || 0)

        // Check if following
        const followRes = await fetch('/api/users/me/following')
        if (followRes.ok) {
          const followData = await followRes.json()
          const following = followData.following?.some(
            (f: any) => f.community_id === data.community.id
          )
          setIsFollowing(following)
        }
      } catch (error) {
        console.error('Failed to load community:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunity()
  }, [slug, router])

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/communities/${slug}/follow`, { method })

      if (res.ok) {
        setIsFollowing(!isFollowing)
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
      } else if (res.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen art-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎲</div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return null
  }

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
      <div className="absolute top-20 right-0 w-32 h-32 bg-sunny/20 -rotate-12 -z-10 animate-float" />
      <div
        className="absolute top-60 -left-10 w-24 h-24 bg-grape/15 rotate-45 -z-10 animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-40 right-10 w-16 h-16 bg-coral/20 rotate-12 -z-10 animate-float"
        style={{ animationDelay: '4s' }}
      />

      <div className="container max-w-lg mx-auto px-5 py-10 pb-28">
        {/* Back Button */}
        <div className="mb-6 animate-slide-up">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Communities
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
              <h1 className="font-black text-2xl text-foreground tracking-tight leading-none mb-1">
                {community.name}
              </h1>
              <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <MapPin size={12} />
                <span>
                  {community.city}
                  {community.state ? `, ${community.state}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-coral pl-4">
              {community.description}
            </p>
          )}
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
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`w-full py-4 px-5 font-bold text-sm uppercase tracking-wider transition-all duration-200 btn-lift border-2 border-ink flex items-center justify-center gap-3 ${
              isFollowing
                ? 'bg-muted text-foreground shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]'
                : 'bg-coral text-white shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]'
            } disabled:opacity-50`}
          >
            <Users size={20} strokeWidth={2.5} />
            <span>
              {followLoading
                ? 'Loading...'
                : isFollowing
                ? `Following (${followerCount})`
                : `Follow (${followerCount})`}
            </span>
          </button>
        </section>

        {/* Stats */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))]">
            <div className="grid grid-cols-3 divide-x-2 divide-ink">
              <div className="text-center py-3">
                <span className="font-black text-3xl text-ink tracking-tight">
                  {followerCount}
                </span>
                <p className="font-mono text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">
                  Followers
                </p>
              </div>
              <div className="text-center py-3">
                <span className="font-black text-3xl text-ink tracking-tight">
                  {community.events_count || 0}
                </span>
                <p className="font-mono text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">
                  Events
                </p>
              </div>
              <div className="text-center py-3">
                <span className="font-black text-3xl text-ink tracking-tight">
                  {community.games_count || 0}
                </span>
                <p className="font-mono text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">
                  Games
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-xs text-coral font-bold">01</span>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">
              Upcoming Events
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--sunny))]">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto mb-3" size={32} strokeWidth={1.5} />
              <p className="text-sm font-bold">No upcoming events yet</p>
              <p className="text-xs mt-1">Check back soon!</p>
            </div>
          </div>
        </section>

        {/* Game Collection Section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-xs text-coral font-bold">02</span>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">
              Game Collection
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="bg-card border-2 border-ink p-5 shadow-[4px_4px_0_0_hsl(var(--mint))]">
            <div className="text-center py-8 text-muted-foreground">
              <Gamepad2 className="mx-auto mb-3" size={32} strokeWidth={1.5} />
              <p className="text-sm font-bold">Game collection coming soon</p>
              <p className="text-xs mt-1">Phase 3 feature</p>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Platform Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 platform-bar-light py-4">
        <div className="container max-w-lg mx-auto px-4">
          <Link
            href="/platform"
            className="flex items-center justify-center gap-2 py-2.5 px-5 bg-ink text-white mx-auto w-fit shadow-[3px_3px_0_0_hsl(var(--coral))] hover:shadow-[4px_4px_0_0_hsl(var(--coral))] transition-all btn-lift border-2 border-ink"
          >
            <Gamepad2 size={14} strokeWidth={2.5} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
              BoardGameCulture
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
