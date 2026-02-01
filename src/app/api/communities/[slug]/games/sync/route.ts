import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchCollection, fetchGameDetails } from '@/lib/bgg/client'
import type { StartBGGSyncInput, CreateGameInput } from '@/types/games'

// POST /api/communities/[slug]/games/sync - Start BGG collection sync
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: StartBGGSyncInput = await request.json()

    if (!body.bgg_username) {
      return NextResponse.json(
        { error: 'BGG username is required' },
        { status: 400 }
      )
    }

    // Get community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (communityError || !community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: community.id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to sync BGG collection' },
        { status: 403 }
      )
    }

    // Create sync job
    const { data: syncJob, error: jobError } = await supabase
      .from('bgg_sync_jobs')
      .insert({
        community_id: community.id,
        bgg_username: body.bgg_username,
        status: 'pending',
        started_by: user.id,
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating sync job:', jobError)
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    // Start async processing (don't wait for completion)
    processBGGSync(syncJob.id, community.id, body.bgg_username, user.id).catch(
      (error) => {
        console.error('BGG sync processing error:', error)
      }
    )

    return NextResponse.json({ syncJob }, { status: 201 })
  } catch (error) {
    console.error('Error starting BGG sync:', error)
    return NextResponse.json(
      { error: 'Failed to start BGG sync' },
      { status: 500 }
    )
  }
}

// GET /api/communities/[slug]/games/sync - Get sync status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('job_id')

  const supabase = await createClient()

  // Get community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (communityError || !community) {
    return NextResponse.json(
      { error: 'Community not found' },
      { status: 404 }
    )
  }

  if (jobId) {
    const { data: job, error } = await supabase
      .from('bgg_sync_jobs')
      .select('*')
      .eq('community_id', community.id)
      .eq('id', jobId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } else {
    const { data: jobs, error } = await supabase
      .from('bgg_sync_jobs')
      .select('*')
      .eq('community_id', community.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  }
}

// Process BGG sync in the background
async function processBGGSync(
  jobId: string,
  communityId: string,
  bggUsername: string,
  userId: string
) {
  const supabase = await createClient()

  try {
    // Update status to processing
    await supabase
      .from('bgg_sync_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId)

    // Fetch BGG collection
    const collection = await fetchCollection(bggUsername)

    // Filter only owned games
    const ownedGames = collection.filter((item) => item.status.own)

    await supabase
      .from('bgg_sync_jobs')
      .update({ total_games: ownedGames.length })
      .eq('id', jobId)

    let processedCount = 0
    let newGamesCount = 0

    for (const item of ownedGames) {
      try {
        // Check if game exists in database
        let { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('bgg_id', item.objectid)
          .single()

        // If game doesn't exist, fetch details and create it
        if (!existingGame) {
          const gameDetails = await fetchGameDetails(item.objectid)

          // Get board game rank
          const boardGameRank = gameDetails.ranks?.find(
            (r) => r.name === 'boardgame'
          )

          const gameInput: CreateGameInput = {
            bgg_id: gameDetails.id,
            name: gameDetails.name,
            year_published: gameDetails.yearpublished || undefined,
            image_url: gameDetails.image || undefined,
            thumbnail_url: gameDetails.thumbnail || undefined,
            description: gameDetails.description || undefined,
            min_players: gameDetails.minplayers || undefined,
            max_players: gameDetails.maxplayers || undefined,
            playtime_min: gameDetails.minplaytime || undefined,
            playtime_max: gameDetails.maxplaytime || undefined,
            recommended_age: gameDetails.minage || undefined,
            avg_weight: gameDetails.ratings?.averageweight || undefined,
            bgg_rating: gameDetails.ratings?.average || undefined,
            bgg_num_ratings: gameDetails.ratings?.usersrated || undefined,
            bgg_rank:
              boardGameRank && typeof boardGameRank.value === 'number'
                ? boardGameRank.value
                : undefined,
            categories: gameDetails.categories?.map((c) => c.value) || [],
            mechanics: gameDetails.mechanics?.map((m) => m.value) || [],
            designers: gameDetails.designers?.map((d) => d.value) || [],
            publishers: gameDetails.publishers?.map((p) => p.value) || [],
            synced_from_bgg: true,
            raw_bgg_data: gameDetails,
          }

          const { data: newGame } = await supabase
            .from('games')
            .insert({
              ...gameInput,
              created_by: userId,
              is_approved: true, // Auto-approve BGG games
              synced_at: new Date().toISOString(),
            })
            .select()
            .single()

          existingGame = newGame
          newGamesCount++
        }

        if (existingGame) {
          // Check if game already in community collection
          const { data: existingCommunityGame } = await supabase
            .from('community_games')
            .select('id')
            .eq('community_id', communityId)
            .eq('game_id', existingGame.id)
            .single()

          // Add to community collection if not already there
          if (!existingCommunityGame) {
            await supabase.from('community_games').insert({
              community_id: communityId,
              game_id: existingGame.id,
              status: 'own',
              times_played: item.numplays || 0,
              added_by: userId,
            })
          }
        }

        processedCount++

        // Update progress
        await supabase
          .from('bgg_sync_jobs')
          .update({
            processed_games: processedCount,
            new_games_added: newGamesCount,
          })
          .eq('id', jobId)
      } catch (gameError) {
        console.error(
          `Error processing game ${item.objectid}:`,
          gameError
        )
        // Continue with next game even if one fails
      }
    }

    // Mark as completed
    await supabase
      .from('bgg_sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
  } catch (error) {
    console.error('BGG sync error:', error)

    // Mark as failed
    await supabase
      .from('bgg_sync_jobs')
      .update({
        status: 'failed',
        error_message:
          error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
  }
}
