'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, Gamepad2, ArrowUpRight, Heart } from 'lucide-react'

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
}

interface CommunityCardProps {
  community: Community
  isFollowing: boolean
  onFollowChange?: (following: boolean) => void
}

export function CommunityCard({ community, isFollowing: initialFollowing, onFollowChange }: CommunityCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  // Update local state when prop changes
  useEffect(() => {
    setIsFollowing(initialFollowing)
  }, [initialFollowing])

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/communities/${community.slug}/follow`, {
        method,
      })

      if (res.ok) {
        const newFollowing = !isFollowing
        setIsFollowing(newFollowing)
        onFollowChange?.(newFollowing)
      } else if (res.status === 401) {
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/c/${community.slug}`} className="block">
      <div className="relative bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all h-full flex flex-col">
        {/* Accent color top border */}
        <div
          className="h-2 border-b-2 border-ink"
          style={{ backgroundColor: community.accent_color || '#FF6B6B' }}
        />

        {/* Heart Icon - Top Right */}
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 z-10 ${
            isFollowing
              ? 'bg-coral border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))]'
              : 'bg-white border-2 border-coral shadow-[2px_2px_0_0_hsl(var(--coral))] hover:shadow-[3px_3px_0_0_hsl(var(--coral))]'
          } disabled:opacity-50 hover:-translate-x-0.5 hover:-translate-y-0.5`}
        >
          <Heart
            size={16}
            strokeWidth={2.5}
            fill={isFollowing ? "white" : "none"}
            className={isFollowing ? "text-white" : "text-coral"}
          />
        </button>

        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.name}
                className="w-12 h-12 rounded border-2 border-ink object-cover flex-shrink-0 bg-white"
              />
            ) : (
              <div className="w-12 h-12 rounded border-2 border-ink bg-white flex items-center justify-center text-xl flex-shrink-0">
                🎲
              </div>
            )}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-base font-black mb-1 text-ink uppercase tracking-tight line-clamp-2">
                {community.name}
              </h3>
              <div className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground uppercase tracking-wide">
                <MapPin size={9} />
                <span className="truncate">
                  {community.city}
                  {community.state ? `, ${community.state}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Stats - Compact */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="font-black text-ink">{community.follower_count || 0}</span>
            <span>Followers</span>
            <span className="text-border">•</span>
            <span className="font-black text-ink">{community.events_count || 0}</span>
            <span>Events</span>
            <span className="text-border">•</span>
            <span className="font-black text-ink">{community.games_count || 0}</span>
            <span>Games</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
