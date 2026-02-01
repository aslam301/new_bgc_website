import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Users, Clock, Calendar, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Game, CommunityGame } from '@/types/games'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  if (gameError || !game) {
    notFound()
  }

  // Fetch communities that own this game
  const { data: communityGames } = await supabase
    .from('community_games')
    .select(
      `
      *,
      community:communities(id, name, slug, logo_url, city, state, country)
    `
    )
    .eq('game_id', id)
    .order('created_at', { ascending: false })

  const typedGame = game as unknown as Game
  const typedCommunityGames = (communityGames || []) as unknown as CommunityGame[]

  const playerCount =
    typedGame.min_players && typedGame.max_players
      ? typedGame.min_players === typedGame.max_players
        ? `${typedGame.min_players} players`
        : `${typedGame.min_players}-${typedGame.max_players} players`
      : null

  const playtime =
    typedGame.playtime_min && typedGame.playtime_max
      ? typedGame.playtime_min === typedGame.playtime_max
        ? `${typedGame.playtime_min} minutes`
        : `${typedGame.playtime_min}-${typedGame.playtime_max} minutes`
      : typedGame.playtime_max
      ? `${typedGame.playtime_max} minutes`
      : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Image */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm sticky top-8">
              {typedGame.image_url ? (
                <img
                  src={typedGame.image_url}
                  alt={typedGame.name}
                  className="w-full"
                />
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <Users className="w-24 h-24 text-gray-400" />
                </div>
              )}

              {typedGame.bgg_id && (
                <div className="p-4 border-t">
                  <a
                    href={`https://boardgamegeek.com/boardgame/${typedGame.bgg_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View on BoardGameGeek →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {typedGame.name}
              </h1>

              {typedGame.year_published && (
                <p className="text-gray-600 mb-4">{typedGame.year_published}</p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                {playerCount && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4" />
                    <span>{playerCount}</span>
                  </div>
                )}

                {playtime && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{playtime}</span>
                  </div>
                )}

                {typedGame.recommended_age && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{typedGame.recommended_age}+ years</span>
                  </div>
                )}

                {typedGame.bgg_rating && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{typedGame.bgg_rating.toFixed(1)} BGG Rating</span>
                  </div>
                )}

                {typedGame.avg_weight && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {typedGame.avg_weight.toFixed(1)}/5.0 Complexity
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {typedGame.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <div
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: typedGame.description }}
                />
              </div>
            )}

            {/* Categories & Mechanics */}
            {((typedGame.categories && typedGame.categories.length > 0) ||
              (typedGame.mechanics && typedGame.mechanics.length > 0)) && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {typedGame.categories && typedGame.categories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {typedGame.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {typedGame.mechanics && typedGame.mechanics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Mechanics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {typedGame.mechanics.map((mechanic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full"
                        >
                          {mechanic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Designers & Publishers */}
            {((typedGame.designers && typedGame.designers.length > 0) ||
              (typedGame.publishers && typedGame.publishers.length > 0)) && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {typedGame.designers && typedGame.designers.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Designers
                    </h3>
                    <p className="text-gray-600">
                      {typedGame.designers.join(', ')}
                    </p>
                  </div>
                )}

                {typedGame.publishers && typedGame.publishers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Publishers
                    </h3>
                    <p className="text-gray-600">
                      {typedGame.publishers.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Communities with this game */}
            {typedCommunityGames.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  Communities with this game ({typedCommunityGames.length})
                </h2>
                <div className="space-y-3">
                  {typedCommunityGames.map((cg) => (
                    <Link
                      key={cg.id}
                      href={`/c/${cg.community?.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {cg.community?.logo_url ? (
                        <img
                          src={cg.community.logo_url}
                          alt={cg.community.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {cg.community?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {cg.community?.city}
                          {cg.community?.state && `, ${cg.community.state}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
