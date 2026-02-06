import Link from 'next/link'
import { Users, Clock } from 'lucide-react'
import type { Game, CommunityGame } from '@/types/games'
import GameStatusBadge from './GameStatusBadge'

interface GameCardProps {
  game: Game
  communityGame?: CommunityGame
  showStatus?: boolean
  linkTo?: 'game' | 'none'
}

export default function GameCard({
  game,
  communityGame,
  showStatus = false,
  linkTo = 'game',
}: GameCardProps) {
  const playerCount =
    game.min_players && game.max_players
      ? game.min_players === game.max_players
        ? `${game.min_players}p`
        : `${game.min_players}-${game.max_players}p`
      : null

  const playtime =
    game.playtime_min && game.playtime_max
      ? game.playtime_min === game.playtime_max
        ? `${game.playtime_min}m`
        : `${game.playtime_min}-${game.playtime_max}m`
      : game.playtime_max
      ? `${game.playtime_max}m`
      : null

  const content = (
    <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all h-full flex flex-col">
      {/* Game Image */}
      <div className="aspect-square bg-muted relative">
        {game.thumbnail_url || game.image_url ? (
          <img
            src={game.thumbnail_url || game.image_url || ''}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Users className="w-16 h-16" strokeWidth={2} />
          </div>
        )}

        {/* Status Badge */}
        {showStatus && communityGame && (
          <div className="absolute top-2 right-2">
            <GameStatusBadge status={communityGame.status} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="p-3 md:p-4 flex-1 flex flex-col border-t-2 border-ink">
        <h3 className="font-black text-sm md:text-base text-ink line-clamp-2 mb-1 uppercase tracking-tight">
          {game.name}
        </h3>

        {game.year_published && (
          <p className="text-xs font-mono text-muted-foreground mb-2">{game.year_published}</p>
        )}

        <div className="flex items-center gap-2 md:gap-3 text-xs font-mono text-muted-foreground mt-auto">
          {playerCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              <span className="font-black text-ink">{playerCount}</span>
            </div>
          )}

          {playtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              <span className="font-black text-ink">{playtime}</span>
            </div>
          )}
        </div>

        {communityGame?.times_played !== undefined &&
          communityGame.times_played > 0 && (
            <div className="mt-2 text-[10px] font-mono text-muted-foreground">
              Played <span className="font-black text-ink">{communityGame.times_played}</span> times
            </div>
          )}
      </div>
    </div>
  )

  if (linkTo === 'game') {
    return (
      <Link href={`/games/${game.id}`} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}
