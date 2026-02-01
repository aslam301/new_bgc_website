'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Users, Calendar, Gamepad2, ArrowUpRight } from 'lucide-react'

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
      <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all h-full flex flex-col">
        {/* Accent color top border */}
        <div
          className="h-2 border-b-2 border-ink"
          style={{ backgroundColor: community.accent_color || '#FF6B6B' }}
        />

        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.name}
                className="w-14 h-14 rounded border-2 border-ink object-cover flex-shrink-0 bg-white"
              />
            ) : (
              <div className="w-14 h-14 rounded border-2 border-ink bg-white flex items-center justify-center text-2xl flex-shrink-0">
                🎲
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black mb-1 text-ink uppercase tracking-tight line-clamp-2">
                {community.name}
              </h3>
              <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                <MapPin size={10} />
                <span className="truncate">
                  {community.city}
                  {community.state ? `, ${community.state}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-3 flex-1 leading-relaxed">
              {community.description}
            </p>
          )}

          {/* Stats */}
          <div className="bg-muted/30 border-2 border-ink mb-4">
            <div className="grid grid-cols-3 divide-x-2 divide-ink">
              <div className="text-center py-2">
                <span className="font-black text-xl text-ink tracking-tight block">
                  {community.follower_count || 0}
                </span>
                <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
                  Followers
                </p>
              </div>
              <div className="text-center py-2">
                <span className="font-black text-xl text-ink tracking-tight block">
                  {community.events_count || 0}
                </span>
                <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
                  Events
                </p>
              </div>
              <div className="text-center py-2">
                <span className="font-black text-xl text-ink tracking-tight block">
                  {community.games_count || 0}
                </span>
                <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
                  Games
                </p>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`w-full px-4 py-3 font-bold text-xs uppercase tracking-wider transition-all duration-200 btn-lift border-2 border-ink flex items-center justify-center gap-2 ${
              isFollowing
                ? 'bg-muted text-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))]'
                : 'bg-coral text-white shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))]'
            } disabled:opacity-50`}
          >
            <Users size={14} strokeWidth={2.5} />
            <span>{loading ? '...' : isFollowing ? 'Following' : 'Follow'}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
