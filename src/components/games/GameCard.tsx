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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* Game Image */}
      <div className="aspect-square bg-gray-100 relative">
        {game.thumbnail_url || game.image_url ? (
          <img
            src={game.thumbnail_url || game.image_url || ''}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Users className="w-16 h-16" />
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
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
          {game.name}
        </h3>

        {game.year_published && (
          <p className="text-sm text-gray-500 mb-2">{game.year_published}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-600 mt-auto">
          {playerCount && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{playerCount}</span>
            </div>
          )}

          {playtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{playtime}</span>
            </div>
          )}
        </div>

        {communityGame?.times_played !== undefined &&
          communityGame.times_played > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Played {communityGame.times_played} times
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
