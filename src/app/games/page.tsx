'use client'

import { useState, useEffect } from 'react'
import { Gamepad2 } from 'lucide-react'
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-ink">
        <div className="max-w-7xl mx-auto p-3 md:p-6">
          <h1 className="text-2xl md:text-3xl font-black text-ink mb-1 uppercase tracking-tight">Browse Games</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-mono">
            Explore board games in the BoardGameCulture collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Filters */}
        <div className="mb-4 md:mb-6">
          <GameFilters onFilterChange={setFilters} />
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🎲</div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Loading games...</p>
          </div>
        ) : error ? (
          <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 font-bold text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
