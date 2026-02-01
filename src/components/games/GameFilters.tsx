'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import type { GameFilters as GameFiltersType } from '@/types/games'

interface GameFiltersProps {
  onFilterChange: (filters: GameFiltersType) => void
  showStatusFilter?: boolean
}

export default function GameFilters({
  onFilterChange,
  showStatusFilter = false,
}: GameFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<GameFiltersType>({})

  const updateFilters = (newFilters: Partial<GameFiltersType>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof GameFiltersType]
    return value !== undefined && value !== ''
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search games..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
          {/* Status Filter */}
          {showStatusFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  updateFilters({
                    status: e.target.value as any || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All</option>
                <option value="own">Own</option>
                <option value="wishlist">Wishlist</option>
                <option value="played">Played</option>
                <option value="want_to_play">Want to Play</option>
              </select>
            </div>
          )}

          {/* Player Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Players
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={filters.min_players || ''}
                onChange={(e) =>
                  updateFilters({
                    min_players: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Players
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={filters.max_players || ''}
                onChange={(e) =>
                  updateFilters({
                    max_players: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="4"
              />
            </div>
          </div>

          {/* Playtime */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Playtime (min)
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={filters.playtime_min || ''}
                onChange={(e) =>
                  updateFilters({
                    playtime_min: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Playtime (min)
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={filters.playtime_max || ''}
                onChange={(e) =>
                  updateFilters({
                    playtime_max: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="120"
              />
            </div>
          </div>

          {/* Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Complexity
              </label>
              <select
                value={filters.complexity_min || ''}
                onChange={(e) =>
                  updateFilters({
                    complexity_min: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Any</option>
                <option value="1">1 - Light</option>
                <option value="2">2 - Medium Light</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - Medium Heavy</option>
                <option value="5">5 - Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Complexity
              </label>
              <select
                value={filters.complexity_max || ''}
                onChange={(e) =>
                  updateFilters({
                    complexity_max: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Any</option>
                <option value="1">1 - Light</option>
                <option value="2">2 - Medium Light</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - Medium Heavy</option>
                <option value="5">5 - Heavy</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
