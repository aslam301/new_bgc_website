'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { Game, GameFilters as GameFiltersType } from '@/types/games'
import GameGrid from '@/components/games/GameGrid'
import GameFilters from '@/components/games/GameFilters'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<GameFiltersType>({})

  useEffect(() => {
    fetchGames()
  }, [filters])

  const fetchGames = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.min_players) params.append('min_players', filters.min_players.toString())
      if (filters.max_players) params.append('max_players', filters.max_players.toString())
      if (filters.playtime_min) params.append('playtime_min', filters.playtime_min.toString())
      if (filters.playtime_max) params.append('playtime_max', filters.playtime_max.toString())
      if (filters.complexity_min) params.append('complexity_min', filters.complexity_min.toString())
      if (filters.complexity_max) params.append('complexity_max', filters.complexity_max.toString())

      const res = await fetch(`/api/games?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch games')
      }

      const { games: fetchedGames } = await res.json()
      setGames(fetchedGames)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Games</h1>
          <p className="text-gray-600 mt-2">
            Explore board games in the BoardGameCulture collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <GameFilters onFilterChange={setFilters} />
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
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {games.length} {games.length === 1 ? 'game' : 'games'} found
            </div>
            <GameGrid
              games={games}
              emptyMessage="No games found. Try adjusting your filters."
            />
          </>
        )}
      </div>
    </div>
  )
}
