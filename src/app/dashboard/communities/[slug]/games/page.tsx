'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Download } from 'lucide-react'
import Link from 'next/link'
import type { CommunityGame, GameFilters as GameFiltersType } from '@/types/games'
import GameCard from '@/components/games/GameCard'
import GameFilters from '@/components/games/GameFilters'
import BGGSyncButton from '@/components/games/BGGSyncButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CommunityGamesPage({ params }: PageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const [communityGames, setCommunityGames] = useState<CommunityGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<GameFiltersType>({})

  useEffect(() => {
    fetchGames()
  }, [slug, filters])

  const fetchGames = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.min_players) params.append('min_players', filters.min_players.toString())
      if (filters.max_players) params.append('max_players', filters.max_players.toString())

      const res = await fetch(`/api/communities/${slug}/games?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch games')
      }

      const { games } = await res.json()
      setCommunityGames(games)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncComplete = () => {
    fetchGames()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Game Collection
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your community's board game collection
              </p>
            </div>

            <div className="flex gap-3">
              <BGGSyncButton
                communitySlug={slug}
                onSyncComplete={handleSyncComplete}
              />
              <Link
                href={`/dashboard/communities/${slug}/games/add`}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {communityGames.filter((cg) => cg.status === 'own').length}
              </div>
              <div className="text-sm text-gray-600">Owned</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {communityGames.filter((cg) => cg.status === 'wishlist').length}
              </div>
              <div className="text-sm text-gray-600">Wishlist</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {communityGames.filter((cg) => cg.status === 'played').length}
              </div>
              <div className="text-sm text-gray-600">Played</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {communityGames.reduce((sum, cg) => sum + (cg.times_played || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Plays</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <GameFilters onFilterChange={setFilters} showStatusFilter />
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : communityGames.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No games in collection
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by syncing from BoardGameGeek or adding games manually
            </p>
            <div className="flex gap-3 justify-center">
              <BGGSyncButton
                communitySlug={slug}
                onSyncComplete={handleSyncComplete}
              />
              <Link
                href={`/dashboard/communities/${slug}/games/add`}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {communityGames.length}{' '}
              {communityGames.length === 1 ? 'game' : 'games'} in collection
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {communityGames.map((cg) =>
                cg.game ? (
                  <GameCard
                    key={cg.id}
                    game={cg.game}
                    communityGame={cg}
                    showStatus
                  />
                ) : null
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
