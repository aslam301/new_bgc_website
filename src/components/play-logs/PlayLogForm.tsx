'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Trophy } from 'lucide-react'

interface Player {
  user_id?: string
  guest_name?: string
  position?: number
  score?: number
  is_winner: boolean
  color?: string
  character?: string
}

interface PlayLogFormProps {
  gameId: string
  gameName: string
  eventId?: string
}

export function PlayLogForm({ gameId, gameName, eventId }: PlayLogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    played_at: new Date().toISOString().slice(0, 16),
    duration_minutes: '',
    location: '',
    notes: '',
    is_public: true,
  })

  const [players, setPlayers] = useState<Player[]>([
    { guest_name: '', is_winner: false },
    { guest_name: '', is_winner: false },
  ])

  const addPlayer = () => {
    setPlayers([...players, { guest_name: '', is_winner: false }])
  }

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const updated = [...players]
    updated[index] = { ...updated[index], [field]: value }
    setPlayers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (players.length < 2) {
        setError('At least 2 players required')
        setLoading(false)
        return
      }

      const invalidPlayers = players.filter(p => !p.guest_name && !p.user_id)
      if (invalidPlayers.length > 0) {
        setError('All players must have a name')
        setLoading(false)
        return
      }

      const res = await fetch('/api/play-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId,
          event_id: eventId,
          played_at: formData.played_at,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          location: formData.location || null,
          notes: formData.notes || null,
          is_public: formData.is_public,
          num_players: players.length,
          players,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log play')
      }

      router.push(`/games/${gameId}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-coral/10 border-2 border-coral text-coral px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Game Info */}
      <div className="bg-card border-2 border-ink p-4">
        <p className="text-xs font-bold text-muted-foreground mb-1">GAME</p>
        <p className="font-black text-lg">{gameName}</p>
      </div>

      {/* Session Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-ink pb-2">
          Session Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.played_at}
              onChange={(e) => setFormData({ ...formData, played_at: e.target.value })}
              className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="90"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="My house, cafe, etc."
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral resize-none"
            placeholder="How was the game? Any memorable moments?"
            rows={3}
          />
        </div>
      </div>

      {/* Players */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-ink pb-2 flex-1">
            Players
          </h3>
          <button
            type="button"
            onClick={addPlayer}
            className="ml-4 px-3 py-2 bg-mint text-ink font-bold text-xs border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all"
          >
            <Plus size={14} className="inline mr-1" />
            Add Player
          </button>
        </div>

        {players.map((player, index) => (
          <div
            key={index}
            className="bg-card border-2 border-ink p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    value={player.guest_name || ''}
                    onChange={(e) => updatePlayer(index, 'guest_name', e.target.value)}
                    className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                    placeholder="Player name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-2">Position</label>
                    <input
                      type="number"
                      value={player.position || ''}
                      onChange={(e) => updatePlayer(index, 'position', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">Score</label>
                    <input
                      type="number"
                      value={player.score || ''}
                      onChange={(e) => updatePlayer(index, 'score', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
                      placeholder="100"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={player.is_winner}
                    onChange={(e) => updatePlayer(index, 'is_winner', e.target.checked)}
                    className="w-4 h-4 border-2 border-ink"
                  />
                  <span className="text-sm font-bold flex items-center gap-1">
                    <Trophy size={14} className="text-sunny" />
                    Winner
                  </span>
                </label>
              </div>

              {players.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  className="p-2 bg-coral text-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))]"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-background text-foreground font-bold border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-coral text-white font-bold border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Log Play'}
        </button>
      </div>
    </form>
  )
}
