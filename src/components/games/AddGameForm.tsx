'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { AddCommunityGameInput } from '@/types/games'

interface AddGameFormProps {
  gameId: string
  gameName: string
  communitySlug: string
  onSuccess: () => void
  onCancel: () => void
}

export default function AddGameForm({
  gameId,
  gameName,
  communitySlug,
  onSuccess,
  onCancel,
}: AddGameFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<AddCommunityGameInput>({
    game_id: gameId,
    status: 'own',
    times_played: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/communities/${communitySlug}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add game')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="font-semibold text-lg mb-2">Add {gameName}</h4>
        <p className="text-sm text-gray-600">
          Configure how this game appears in your collection
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status *
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="own">Own</option>
          <option value="wishlist">Wishlist</option>
          <option value="played">Played</option>
          <option value="want_to_play">Want to Play</option>
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition
        </label>
        <select
          value={formData.condition || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              condition: e.target.value as any || undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Not specified</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      {/* Times Played */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Times Played
        </label>
        <input
          type="number"
          min="0"
          value={formData.times_played}
          onChange={(e) =>
            setFormData({
              ...formData,
              times_played: parseInt(e.target.value) || 0,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Acquisition Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Acquisition Date
        </label>
        <input
          type="date"
          value={formData.acquisition_date || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              acquisition_date: e.target.value || undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              notes: e.target.value || undefined,
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Any additional notes about this game..."
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add to Collection
        </button>
      </div>
    </form>
  )
}
