import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchCollection, fetchGameDetails } from '@/lib/bgg/client'

// Synchronous BGG sync for debugging
export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const { bggUsername } = await request.json()

    console.log(`[BGG Debug] Fetching collection for: ${bggUsername}`)

    // Fetch collection
    const collection = await fetchCollection(bggUsername)
    console.log(`[BGG Debug] Collection fetched: ${collection.length} items`)

    // Filter owned games
    const ownedGames = collection.filter((item) => item.status.own)
    console.log(`[BGG Debug] Owned games: ${ownedGames.length}`)

    // Get first game details as test
    if (ownedGames.length > 0) {
      const firstGame = ownedGames[0]
      console.log(`[BGG Debug] Fetching details for: ${firstGame.name} (ID: ${firstGame.objectid})`)

      const gameDetails = await fetchGameDetails(firstGame.objectid)
      console.log(`[BGG Debug] Game details:`, gameDetails)

      return NextResponse.json({
        success: true,
        collection: collection.length,
        owned: ownedGames.length,
        sample: gameDetails
      })
    }

    return NextResponse.json({
      success: true,
      collection: collection.length,
      owned: ownedGames.length
    })

  } catch (error) {
    console.error('[BGG Debug] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
