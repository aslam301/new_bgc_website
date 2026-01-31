'use client'

import Link from 'next/link'
import { useState } from 'react'

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
    e.preventDefault() // Don't navigate to community page
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
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/c/${community.slug}`}>
      <div
        className="bg-white border-brutal shadow-brutal rounded-lg overflow-hidden hover:shadow-brutal-lg transition-shadow cursor-pointer h-full flex flex-col"
      >
        {/* Header with accent color */}
        <div
          className="h-3"
          style={{ backgroundColor: community.accent_color }}
        />

        <div className="p-6 flex-1 flex flex-col">
          {/* Logo & Name */}
          <div className="flex items-start gap-4 mb-4">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.name}
                className="w-16 h-16 rounded-lg border-brutal object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border-brutal bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                🎲
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1 truncate">{community.name}</h3>
              <p className="text-sm text-gray-600">
                {community.city}{community.state ? `, ${community.state}` : ''}
              </p>
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-1">
              {community.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div>
              <div className="text-lg font-bold">{community.follower_count || 0}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold">{community.events_count || 0}</div>
              <div className="text-xs text-gray-500">Events</div>
            </div>
            <div>
              <div className="text-lg font-bold">{community.games_count || 0}</div>
              <div className="text-xs text-gray-500">Games</div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`w-full px-4 py-2 font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift disabled:opacity-50 ${
              isFollowing
                ? 'bg-gray-200 text-gray-700'
                : 'bg-coral text-white'
            }`}
          >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
    </Link>
  )
}
