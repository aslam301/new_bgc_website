'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Game } from '@/types/games'
import GameSearchModal from '@/components/games/GameSearchModal'
import AddGameForm from '@/components/games/AddGameForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function AddGamePage({ params }: PageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = useState(true)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game)
    setShowSearchModal(false)
  }

  const handleSuccess = () => {
    router.push(`/dashboard/communities/${slug}/games`)
  }

  const handleCancel = () => {
    if (selectedGame) {
      setSelectedGame(null)
      setShowSearchModal(true)
    } else {
      router.push(`/dashboard/communities/${slug}/games`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/dashboard/communities/${slug}/games`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Game</h1>
          <p className="text-gray-600 mt-1">
            Search for a game to add to your collection
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {!selectedGame ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Search for a game to add to your collection
              </p>
              <button
                onClick={() => setShowSearchModal(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Search Games
              </button>
            </div>
          ) : (
            <AddGameForm
              gameId={selectedGame.id}
              gameName={selectedGame.name}
              communitySlug={slug}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Search Modal */}
        <GameSearchModal
          isOpen={showSearchModal}
          onClose={() => {
            setShowSearchModal(false)
            if (!selectedGame) {
              router.push(`/dashboard/communities/${slug}/games`)
            }
          }}
          onSelectGame={handleSelectGame}
        />
      </div>
    </div>
  )
}
