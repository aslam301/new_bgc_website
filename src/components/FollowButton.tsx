'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  communitySlug: string
  initialFollowing: boolean
  initialFollowerCount: number
}

export function FollowButton({ communitySlug, initialFollowing, initialFollowerCount }: FollowButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      const method = following ? 'DELETE' : 'POST'
      const res = await fetch(`/api/communities/${communitySlug}/follow`, {
        method,
      })

      if (res.ok) {
        setFollowing(!following)
        setFollowerCount((prev) => (following ? prev - 1 : prev + 1))
      } else {
        throw new Error('Failed to update follow status')
      }
    } catch (error) {
      console.error('Follow error:', error)
      alert('Failed to update follow status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-6 py-3 font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift disabled:opacity-50 ${
          following
            ? 'bg-gray-200 text-gray-700'
            : 'bg-coral text-white'
        }`}
      >
        {loading ? '...' : following ? 'Following' : 'Follow'}
      </button>
      <div className="text-center">
        <div className="text-2xl font-bold">{followerCount}</div>
        <div className="text-sm text-gray-600">Followers</div>
      </div>
    </div>
  )
}
