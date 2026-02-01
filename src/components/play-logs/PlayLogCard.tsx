'use client'

import { Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'

interface PlayLog {
  id: string
  played_at: string
  duration_minutes?: number
  location?: string
  notes?: string
  num_players: number
  games?: {
    name: string
    image_url?: string
  }
  profiles?: {
    username: string
    full_name: string
  }
  play_log_players?: Array<{
    guest_name?: string
    position?: number
    score?: number
    is_winner: boolean
    profiles?: {
      username: string
      full_name: string
    }
  }>
}

interface PlayLogCardProps {
  playLog: PlayLog
}

export function PlayLogCard({ playLog }: PlayLogCardProps) {
  const winners = playLog.play_log_players?.filter(p => p.is_winner) || []

  return (
    <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {playLog.games?.image_url && (
            <img
              src={playLog.games.image_url}
              alt={playLog.games.name}
              className="w-16 h-16 object-cover border-2 border-ink"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg text-foreground mb-1">
              {playLog.games?.name || 'Game'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Logged by {playLog.profiles?.full_name || playLog.profiles?.username || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={14} />
            <span>{formatDate(playLog.played_at)}</span>
          </div>

          {playLog.duration_minutes && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} />
              <span>{playLog.duration_minutes} min</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={14} />
            <span>{playLog.num_players} players</span>
          </div>

          {playLog.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} />
              <span className="truncate">{playLog.location}</span>
            </div>
          )}
        </div>

        {/* Winners */}
        {winners.length > 0 && (
          <div className="bg-sunny/20 border-2 border-sunny px-3 py-2">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-sunny flex-shrink-0" />
              <span className="text-xs font-bold text-foreground">
                {winners.map(w => w.profiles?.full_name || w.guest_name).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Players */}
        {playLog.play_log_players && playLog.play_log_players.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">PLAYERS</p>
            <div className="space-y-1">
              {playLog.play_log_players
                .sort((a, b) => (a.position || 99) - (b.position || 99))
                .map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-mono">
                      {player.position && `#${player.position} `}
                      {player.profiles?.full_name || player.guest_name}
                    </span>
                    {player.score !== null && player.score !== undefined && (
                      <span className="font-bold">{player.score} pts</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {playLog.notes && (
          <div className="pt-3 border-t-2 border-border">
            <p className="text-sm text-muted-foreground font-mono italic">
              "{playLog.notes}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
