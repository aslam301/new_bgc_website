import type { Game, CommunityGame } from '@/types/games'
import GameCard from './GameCard'

interface GameGridProps {
  games: Game[]
  communityGames?: CommunityGame[]
  showStatus?: boolean
  linkTo?: 'game' | 'none'
  emptyMessage?: string
}

export default function GameGrid({
  games,
  communityGames,
  showStatus = false,
  linkTo = 'game',
  emptyMessage = 'No games found',
}: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {games.map((game) => {
        const communityGame = communityGames?.find(
          (cg) => cg.game_id === game.id
        )
        return (
          <GameCard
            key={game.id}
            game={game}
            communityGame={communityGame}
            showStatus={showStatus}
            linkTo={linkTo}
          />
        )
      })}
    </div>
  )
}
