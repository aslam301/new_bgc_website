'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

interface CommunityFollowButtonProps {
  communitySlug: string
  initialFollowing: boolean
  initialFollowerCount: number
  userId?: string
}

export function CommunityFollowButton({
  communitySlug,
  initialFollowing,
  initialFollowerCount,
  userId,
}: CommunityFollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/communities/${communitySlug}/follow`, {
        method,
      })

      if (res.ok) {
        setIsFollowing(!isFollowing)
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`w-full py-3 px-5 font-bold text-xs uppercase tracking-wider transition-all duration-200 btn-lift border-2 border-ink flex items-center justify-center gap-3 ${
        isFollowing
          ? 'bg-muted text-foreground shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]'
          : 'bg-coral text-white shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))]'
      } disabled:opacity-50`}
    >
      <Users size={18} strokeWidth={2.5} />
      <span>
        {loading
          ? 'Loading...'
          : isFollowing
          ? `Following (${followerCount})`
          : `Follow (${followerCount})`}
      </span>
    </button>
  )
}
