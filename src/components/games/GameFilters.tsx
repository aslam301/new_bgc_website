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
    <div className="space-y-3 md:space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Search games..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 border-2 border-ink bg-card shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] btn-lift transition-all font-bold text-xs md:text-sm uppercase tracking-wide"
        >
          <Filter className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-coral text-white text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 border border-ink font-black uppercase">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs md:text-sm font-bold text-muted-foreground hover:text-coral transition-colors uppercase tracking-wide"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border-2 border-ink p-3 md:p-4 space-y-3 md:space-y-4 bg-card shadow-[3px_3px_0_0_hsl(var(--ink))]">
          {/* Status Filter */}
          {showStatusFilter && (
            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  updateFilters({
                    status: e.target.value as any || undefined,
                  })
                }
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
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
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
                placeholder="4"
              />
            </div>
          </div>

          {/* Playtime */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
                placeholder="120"
              />
            </div>
          </div>

          {/* Complexity */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
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
              <label className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide text-muted-foreground">
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
                className="w-full px-3 py-2 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral font-mono"
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
