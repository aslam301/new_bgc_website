'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import type { Game } from '@/types/games'
import GameCard from './GameCard'

interface GameSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectGame: (game: Game) => void
  excludeGameIds?: string[]
}

export default function GameSearchModal({
  isOpen,
  onClose,
  onSelectGame,
  excludeGameIds = [],
}: GameSearchModalProps) {
  const [search, setSearch] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setGames([])
      setError('')
    }
  }, [isOpen])

  useEffect(() => {
    const searchGames = async () => {
      if (!search.trim()) {
        setGames([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/games?search=${encodeURIComponent(search)}`)

        if (!res.ok) {
          throw new Error('Failed to search games')
        }

        const { games: foundGames } = await res.json()

        // Filter out already added games
        const filtered = foundGames.filter(
          (game: Game) => !excludeGameIds.includes(game.id)
        )

        setGames(filtered)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search games')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchGames, 300)
    return () => clearTimeout(debounce)
  }, [search, excludeGameIds])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Search Games</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for games..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && search && games.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No games found. Try a different search term.
              </p>
            </div>
          )}

          {!loading && !search && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Start typing to search for games
              </p>
            </div>
          )}

          {!loading && games.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className="cursor-pointer"
                >
                  <GameCard game={game} linkTo="none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
